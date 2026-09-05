"""
API routers for workspace management in NeuroNex.
Handles workspace creation, member management, and role assignment.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header, Query, BackgroundTasks
from fastapi import WebSocket
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone

from database import get_db
from models import User, Workspace, WorkspaceMember, RoleEnum, MembershipStatusEnum, Message, UserSession, Document
from schemas import (
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceDashboard,
    WorkspaceListItem,
    WorkspaceMemberCreate,
    WorkspaceMemberResponse,
    WorkspaceMemberUpdate,
    ErrorResponse,
    SuccessResponse,
    UserResponse,
    UserValidateResponse,
    WorkspaceSelectRequest,
    MeResponse,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatMessagesResponse,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    DocumentListResponse,
    DocumentFilterParams,
    UserUpdateRequest
)

from realtime import broadcast_member_change, broadcast_chat_message, broadcast_typing_indicator

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])

# ============================================================================
# Helper Functions
# ============================================================================

def get_current_user(
    x_current_user_dummy_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Extract current user from request header.
    Returns the User object or raises 401 Unauthorized.
    """
    if not x_current_user_dummy_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Current-User-Dummy-ID header"
        )
    
    user = db.query(User).filter(User.dummy_id == x_current_user_dummy_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User with Dummy ID '{x_current_user_dummy_id}' not found"
        )
    
    return user


def check_admin_permission(
    workspace_id: int,
    user: User,
    db: Session
) -> WorkspaceMember:
    """
    Verify that user is an Admin of the workspace.
    Returns the WorkspaceMember record or raises 403 Forbidden.
    """
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user.id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or user is not a member"
        )
    
    if membership.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace Admins can perform this action"
        )
    
    return membership


def get_workspace_or_404(workspace_id: int, db: Session) -> Workspace:
    """Retrieve workspace or raise 404."""
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace with ID {workspace_id} not found"
        )
    return workspace


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(
    workspace_data: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new empty workspace.
    The current user automatically becomes the Admin.
    
    - **name**: Workspace name (required)
    - **description**: Optional workspace description
    """
    try:
        # Create the workspace
        workspace = Workspace(
            name=workspace_data.name,
            description=workspace_data.description,
            created_by_user_id=current_user.id
        )
        db.add(workspace)
        db.flush()  # Flush to get the workspace ID
        
        # Add creator as Admin member
        creator_membership = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=current_user.id,
            role=RoleEnum.ADMIN,
            status=MembershipStatusEnum.ACTIVE
        )
        db.add(creator_membership)
        db.commit()
        db.refresh(workspace)
        
        return WorkspaceResponse.model_validate(workspace)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workspace: {str(e)}"
        )


@router.get("", response_model=List[WorkspaceListItem])
def get_user_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all workspaces the current user is a member of.
    Only includes workspaces with active membership.
    """
    workspaces = db.query(Workspace).join(
        WorkspaceMember,
        Workspace.id == WorkspaceMember.workspace_id
    ).filter(
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).all()
    
    return [WorkspaceListItem.from_workspace(ws) for ws in workspaces]


@router.get("/{workspace_id}", response_model=WorkspaceDashboard)
def get_workspace_dashboard(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve workspace dashboard with members list.
    Only accessible to active members.
    """
    workspace = get_workspace_or_404(workspace_id, db)
    
    # Verify user is a member
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this workspace"
        )
    
    return WorkspaceDashboard.from_workspace(workspace)


@router.get("/{workspace_id}/members", response_model=List[WorkspaceMemberResponse])
def get_workspace_members(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all active members of a workspace.
    Only accessible to workspace members.
    """
    workspace = get_workspace_or_404(workspace_id, db)
    
    # Verify user is a member
    db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first() or (_ for _ in ()).throw(
        HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this workspace"
        )
    )
    
    members = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).all()
    
    return [WorkspaceMemberResponse.model_validate(m) for m in members]


@router.post("/{workspace_id}/members", response_model=WorkspaceMemberResponse, status_code=status.HTTP_201_CREATED)
def invite_member(
    workspace_id: int,
    invite_data: WorkspaceMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Invite a user to the workspace by Dummy ID.
    Only Admins can invite members.
    
    - **dummy_id**: Dummy ID of the user to invite (e.g., NN-1001)
    - **role**: Role to assign (Admin, Editor, Viewer)
    """
    workspace = get_workspace_or_404(workspace_id, db)
    
    # Verify current user is Admin
    check_admin_permission(workspace_id, current_user, db)
    
    identifier = (invite_data.email or invite_data.dummy_id or "").strip()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an email address or Dummy ID to invite."
        )

    # Find user by email or Dummy ID
    user_to_invite = db.query(User).filter(
        (User.email.ilike(identifier)) | (User.dummy_id.ilike(identifier))
    ).first()

    # If user doesn't exist yet and identifier looks like an email, create a user account for them
    if not user_to_invite:
        if "@" in identifier:
            email_clean = identifier.lower()
            name_part = email_clean.split("@")[0].replace(".", " ").replace("_", " ").title()
            
            total_users = db.query(User).count()
            candidate_id = f"NN-{1000 + total_users + 1}"
            offset = 1
            while db.query(User).filter(User.dummy_id == candidate_id).first():
                candidate_id = f"NN-{1000 + total_users + 1 + offset}"
                offset += 1

            user_to_invite = User(
                dummy_id=candidate_id,
                name=name_part or "Team Member",
                email=email_clean,
                avatar_url=None
            )
            db.add(user_to_invite)
            db.commit()
            db.refresh(user_to_invite)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '{identifier}' not found. Please provide a valid email or Dummy ID."
            )
    
    # Check if already a member
    existing_membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_to_invite.id
    ).first()
    
    if existing_membership:
        if existing_membership.status == MembershipStatusEnum.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User '{user_to_invite.name}' is already a member of this workspace"
            )
        else:
            # Reactivate inactive membership
            existing_membership.status = MembershipStatusEnum.ACTIVE
            existing_membership.role = invite_data.role
            existing_membership.joined_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing_membership)
            background_tasks.add_task(broadcast_member_change, workspace_id, "invited", user_to_invite.id)
            return WorkspaceMemberResponse.model_validate(existing_membership)
    
    try:
        # Create new membership
        new_member = WorkspaceMember(
            workspace_id=workspace_id,
            user_id=user_to_invite.id,
            role=invite_data.role,
            status=MembershipStatusEnum.ACTIVE
        )
        db.add(new_member)
        db.commit()
        db.refresh(new_member)
        background_tasks.add_task(broadcast_member_change, workspace_id, "invited", user_to_invite.id)
        
        return WorkspaceMemberResponse.model_validate(new_member)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to invite member: {str(e)}"
        )


@router.put("/{workspace_id}/members/{user_id}", response_model=WorkspaceMemberResponse)
def update_member_role(
    workspace_id: int,
    user_id: int,
    role_data: WorkspaceMemberUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Update a member's role.
    Only Admins can change roles.
    """
    get_workspace_or_404(workspace_id, db)
    check_admin_permission(workspace_id, current_user, db)
    
    # Get the member to update
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this workspace"
        )
    
    # Prevent removing the last Admin
    if member.role == RoleEnum.ADMIN and role_data.role != RoleEnum.ADMIN:
        admin_count = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.role == RoleEnum.ADMIN,
            WorkspaceMember.status == MembershipStatusEnum.ACTIVE
        ).count()
        
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the last Admin from the workspace"
            )
    
    member.role = role_data.role
    db.commit()
    db.refresh(member)
    background_tasks.add_task(broadcast_member_change, workspace_id, "role_updated", user_id)
    
    return WorkspaceMemberResponse.model_validate(member)


@router.delete("/{workspace_id}/members/{user_id}", response_model=SuccessResponse)
def remove_member(
    workspace_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Remove a member from the workspace.
    Only Admins can remove members.
    The user is not deleted from the Users table, only removed from this workspace.
    """
    get_workspace_or_404(workspace_id, db)
    check_admin_permission(workspace_id, current_user, db)
    
    # Cannot remove self
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove yourself from the workspace"
        )
    
    # Get the member to remove
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this workspace"
        )
    
    # Prevent removing the last Admin
    if member.role == RoleEnum.ADMIN:
        admin_count = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.role == RoleEnum.ADMIN,
            WorkspaceMember.status == MembershipStatusEnum.ACTIVE
        ).count()
        
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the last Admin from the workspace"
            )
    
    # Mark as inactive instead of deleting
    member.status = MembershipStatusEnum.INACTIVE
    db.commit()
    background_tasks.add_task(broadcast_member_change, workspace_id, "removed", user_id)
    
    return SuccessResponse(
        success=True,
        message=f"Member successfully removed from workspace"
    )

# ============================================================================
# Users - Dummy ID Validation
# ============================================================================

users_router = APIRouter(prefix="/api/users", tags=["users"])

@users_router.put("/me", response_model=UserResponse)
def update_me(
    payload: UserUpdateRequest = None,
    x_current_user_dummy_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Update the current user's public profile (e.g., avatar_url).
    Uses the X-Current-User-Dummy-ID header-based dev auth.
    """
    dummy_id = x_current_user_dummy_id or "NN-ADMIN-001"
    user = db.query(User).filter(User.dummy_id == dummy_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User with Dummy ID '{dummy_id}' not found"
        )
    if payload and payload.avatar_url is not None:
        user.avatar_url = payload.avatar_url or None
    if payload and payload.name is not None:
        name_clean = (payload.name or "").strip()
        if not name_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name cannot be empty"
            )
        user.name = name_clean
    if payload and payload.email is not None:
        email_clean = (payload.email or "").strip()
        if email_clean:
            existing = db.query(User).filter(
                User.email == email_clean,
                User.id != user.id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already in use by another account"
                )
            user.email = email_clean
        else:
            user.email = None
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@users_router.get("/validate", response_model=UserValidateResponse)
def validate_user(
    dummy_id: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Validate a Dummy ID or email against the local Users table.
    Returns the matching user profile when found.
    """
    identifier = (email or dummy_id or "").strip()
    if not identifier:
        return UserValidateResponse(
            valid=False,
            message="No identifier provided"
        )
    user = db.query(User).filter(
        (User.dummy_id.ilike(identifier)) | (User.email.ilike(identifier))
    ).first()
    if not user:
        return UserValidateResponse(
            valid=False,
            message=f"User '{identifier}' not found"
        )
    return UserValidateResponse(
        valid=True,
        message="Valid user",
        user=user
    )


@users_router.get("", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all registered users."""
    users = db.query(User).all()
    return [UserResponse.model_validate(u) for u in users]


# ============================================================================
# Authentication (Register / Login)
# ============================================================================

auth_router = APIRouter(prefix="/api", tags=["auth"])

@auth_router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(reg_data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user with name and email.
    Generates a unique Dummy ID.
    """
    name_clean = reg_data.name.strip()
    email_clean = reg_data.email.strip().lower()

    if not name_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required"
        )
    if not email_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )

    existing = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    # Generate unique Dummy ID: NN-1000 series
    total_users = db.query(User).count()
    candidate_id = f"NN-{1000 + total_users + 1}"
    offset = 1
    while db.query(User).filter(User.dummy_id == candidate_id).first():
        candidate_id = f"NN-{1000 + total_users + 1 + offset}"
        offset += 1

    user = User(
        dummy_id=candidate_id,
        name=name_clean,
        email=email_clean,
        avatar_url=None
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return AuthResponse(
        success=True,
        message="Account created successfully",
        dummy_id=user.dummy_id,
        user=UserResponse.model_validate(user)
    )


@auth_router.post("/login", response_model=AuthResponse)
def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Log in a user by email or Dummy ID.
    """
    identifier = login_data.email.strip().lower()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or Dummy ID is required"
        )

    user = db.query(User).filter(
        (User.email.ilike(identifier)) | (User.dummy_id.ilike(identifier))
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found. Please check your credentials or register."
        )

    return AuthResponse(
        success=True,
        message="Login successful",
        dummy_id=user.dummy_id,
        user=UserResponse.model_validate(user)
    )



# ============================================================================
# Active Workspace Selection (dev session)
# ============================================================================

@router.post("/select", response_model=WorkspaceResponse)
def select_workspace(
    select_data: WorkspaceSelectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a workspace as the active one for the current user.
    Only active workspace members may select it.
    """
    workspace = get_workspace_or_404(select_data.workspace_id, db)

    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace.id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this workspace"
        )

    session = db.query(UserSession).filter(UserSession.user_id == current_user.id).first()
    if not session:
        session = UserSession(user_id=current_user.id, selected_workspace_id=workspace.id)
        db.add(session)
    else:
        session.selected_workspace_id = workspace.id
    db.commit()
    db.refresh(workspace)

    return WorkspaceResponse.model_validate(workspace)


# ============================================================================
# Current User (dev auth, header-based)
# ============================================================================

me_router = APIRouter(prefix="/api", tags=["me"])

@me_router.get("/me", response_model=MeResponse)
def get_me(
    x_current_user_dummy_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Return the current user (from X-Current-User-Dummy-ID) together with
    the currently selected workspace, if any.
    When the header is missing during local development, defaults to the
    primary demo user NN-ADMIN-001.
    """
    dummy_id = x_current_user_dummy_id or "NN-ADMIN-001"
    user = db.query(User).filter(User.dummy_id == dummy_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User with Dummy ID '{dummy_id}' not found"
        )

    workspace = None
    session = db.query(UserSession).filter(UserSession.user_id == user.id).first()
    if session and session.selected_workspace_id:
        workspace = db.query(Workspace).filter(Workspace.id == session.selected_workspace_id).first()
        if workspace:
            membership = db.query(WorkspaceMember).filter(
                WorkspaceMember.workspace_id == workspace.id,
                WorkspaceMember.user_id == user.id,
                WorkspaceMember.status == MembershipStatusEnum.ACTIVE
            ).first()
            if not membership:
                workspace = None

    return MeResponse(
        success=True,
        user=UserResponse.model_validate(user),
        workspace=WorkspaceDashboard.from_workspace(workspace) if workspace else None
    )


# ============================================================================
# Workspace Chat Messages
# ============================================================================

chat_router = APIRouter(prefix="/api/chat", tags=["chat"])


def _get_session_workspace_id(user: User, db: Session) -> Optional[int]:
    """Return the user's currently selected workspace id, if any."""
    session = db.query(UserSession).filter(UserSession.user_id == user.id).first()
    return session.selected_workspace_id if session else None


def _resolve_chat_workspace(
    workspace_id: Optional[int],
    user: User,
    db: Session
) -> Workspace:
    """Resolve the workspace for chat and verify active membership."""
    ws_id = workspace_id or _get_session_workspace_id(user, db)
    if not ws_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No workspace selected. Open a workspace first."
        )
    workspace = get_workspace_or_404(ws_id, db)
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace.id,
        WorkspaceMember.user_id == user.id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this workspace"
        )
    return workspace


def _chat_message_to_response(message: Message, db: Session) -> ChatMessageResponse:
    """Convert a Message row into the shape the dashboard chat expects."""
    sender = db.get(User, message.user_id)
    return ChatMessageResponse(
        id=message.id,
        workspace_id=message.workspace_id,
        user_id=message.user_id,
        username=sender.name if sender else "Unknown",
        avatar=sender.avatar_url if sender else None,
        text=message.text,
        status=message.status or "sent",
        created_at=message.created_at
    )


@chat_router.get("/messages", response_model=ChatMessagesResponse)
def get_chat_messages(
    workspace_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve chat messages for the current (or given) workspace.
    """
    workspace = _resolve_chat_workspace(workspace_id, current_user, db)
    messages = db.query(Message).filter(
        Message.workspace_id == workspace.id
    ).order_by(Message.created_at.asc(), Message.id.asc()).all()

    return ChatMessagesResponse(
        success=True,
        messages=[_chat_message_to_response(m, db) for m in messages]
    )


@chat_router.post("/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_chat_message(
    message_data: ChatMessageCreate,
    workspace_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Post a new message to the workspace chat.
    """
    workspace = _resolve_chat_workspace(workspace_id, current_user, db)

    message = Message(
        workspace_id=workspace.id,
        user_id=current_user.id,
        text=message_data.text,
        status="sent"
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    response = _chat_message_to_response(message, db)

    # Broadcast the message to all connected clients in real-time
    background_tasks.add_task(
        broadcast_chat_message,
        workspace.id,
        response.model_dump(mode="json")
    )

    return response


# ============================================================================
# Workspace Home (overview) - kept for reference/future use
# ============================================================================

@router.get("/{workspace_id}/home", response_model=WorkspaceDashboard)
def get_workspace_home(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Alias for the dashboard data of a workspace."""
    return get_workspace_dashboard(workspace_id, current_user, db)


# ============================================================================
# Document Router
# ============================================================================

documents_router = APIRouter(prefix="/api/documents", tags=["documents"])


def _get_workspace_or_404(workspace_id: int, current_user: User, db: Session) -> Workspace:
    """Verify user has access to workspace and return it."""
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace with ID {workspace_id} not found"
        )
    
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this workspace"
        )
    
    return workspace


def _check_edit_permission(workspace_id: int, current_user: User, db: Session) -> WorkspaceMember:
    """Verify user can edit documents in workspace (Editor or Admin)."""
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this workspace"
        )
    
    if membership.role == RoleEnum.VIEWER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot create or modify documents"
        )
    
    return membership


@documents_router.get("", response_model=DocumentListResponse)
def list_documents(
    workspace_id: int = Query(...),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List documents in a workspace with filtering, searching, and sorting.
    
    - **workspace_id**: Workspace ID (required)
    - **category**: Filter by category (pdf, doc, sheet, ppt, notes, code, all)
    - **search**: Search in title, author, content
    - **sort_by**: date, name, size
    - **sort_order**: asc, desc
    - **page**: Page number (1-based)
    - **limit**: Items per page (max 100)
    """
    _get_workspace_or_404(workspace_id, current_user, db)
    
    query = db.query(Document).filter(Document.workspace_id == workspace_id)
    
    # Filter by category
    if category and category != "all":
        query = query.filter(Document.category == category)
    
    # Search in title, author, content
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (Document.title.ilike(search_term)) |
            (Document.author.ilike(search_term)) |
            (Document.content.ilike(search_term))
        )
    
    # Sort
    sort_column = {
        "date": Document.created_at,
        "name": Document.title,
        "size": Document.file_size
    }.get(sort_by, Document.created_at)
    
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())
    
    # Pagination
    total = query.count()
    documents = query.offset((page - 1) * limit).limit(limit).all()
    
    return DocumentListResponse(
        success=True,
        documents=[DocumentResponse.model_validate(d) for d in documents],
        total=total
    )


@documents_router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    document_data: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new document in a workspace.
    Requires Editor or Admin role.
    """
    _check_edit_permission(document_data.workspace_id, current_user, db)
    
    try:
        document = Document(
            workspace_id=document_data.workspace_id,
            user_id=current_user.id,
            title=document_data.title,
            author=document_data.author or current_user.name,
            category=document_data.category,
            file_name=document_data.file_name,
            file_type=document_data.file_type,
            file_size=document_data.file_size,
            content=document_data.content
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return DocumentResponse.model_validate(document)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create document: {str(e)}"
        )


@documents_router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single document by ID."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found"
        )
    
    _get_workspace_or_404(document.workspace_id, current_user, db)
    
    return DocumentResponse.model_validate(document)


@documents_router.put("/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: int,
    document_data: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a document.
    Requires Editor or Admin role.
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found"
        )
    
    _check_edit_permission(document.workspace_id, current_user, db)
    
    # Update fields if provided
    if document_data.title is not None:
        document.title = document_data.title
    if document_data.author is not None:
        document.author = document_data.author
    if document_data.category is not None:
        document.category = document_data.category
    if document_data.content is not None:
        document.content = document_data.content
    
    document.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(document)
    
    return DocumentResponse.model_validate(document)


@documents_router.delete("/{document_id}", response_model=SuccessResponse)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document.
    Requires Editor or Admin role.
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found"
        )
    
    _check_edit_permission(document.workspace_id, current_user, db)
    
    db.delete(document)
    db.commit()
    
    return SuccessResponse(
        success=True,
        message="Document deleted successfully"
    )


@documents_router.get("/categories/list")
def list_categories(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of unique categories used in workspace documents."""
    _get_workspace_or_404(workspace_id, current_user, db)
    
    categories = db.query(Document.category).filter(
        Document.workspace_id == workspace_id
    ).distinct().all()
    
    category_list = [c[0] for c in categories if c[0]]
    
    # Ensure standard categories are included
    standard_categories = ["pdf", "doc", "sheet", "ppt", "notes", "code"]
    for cat in standard_categories:
        if cat not in category_list:
            category_list.append(cat)
    
    return {"categories": sorted(category_list)}
