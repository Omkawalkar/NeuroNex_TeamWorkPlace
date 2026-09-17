"""
API routers for workspace management in NeuroNex.
Handles workspace creation, member management, and role assignment.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header, Query, BackgroundTasks, UploadFile, File, Form
from fastapi import WebSocket
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import shutil

from database import get_db, engine
from models import User, Workspace, WorkspaceMember, RoleEnum, MembershipStatusEnum, Message, UserSession, Document, Task, PriorityEnum, TaskStatusEnum, AppMeta, SavedItem, Presentation, Meeting, Notification
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
    UserUpdateRequest,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    SavedItemCreate,
    SavedItemResponse,
    SavedItemListResponse,
    PresentationCreate,
    PresentationResponse,
    PresentationListResponse,
    MeetingCreate,
    MeetingResponse,
    MeetingListResponse,
    NotificationResponse,
    NotificationListResponse,
    _parse_editor_ids
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
            color=workspace_data.color or 'primary',
            icon=workspace_data.icon or None,
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
        message_type=message.message_type or "text",
        metadata=message.metadata,
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


# ============================================================================
# Task Router
# ============================================================================
# Permissions:
#   - GET /api/tasks          -> any active workspace member (Viewer/Editor/Admin)
#   - POST /api/tasks         -> Admin only
#   - GET /api/tasks/{id}     -> any active workspace member
#   - PUT /api/tasks/{id}     -> Admin, or a member granted edit access by the Admin
#   - DELETE /api/tasks/{id}  -> Admin only

tasks_router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# Demo tasks seeded once per workspace (moved from the old frontend DEFAULT_TASKS).
DEMO_TASKS = [
    {
        "title": "Review Brand Guidelines",
        "description": "Update the digital assets for the Q4 marketing push. Ensure all soft UI components are documented.",
        "priority": "High",
        "status": "In Progress",
        "progress": 65,
        "due_date": "Oct 24",
        "assignee": "Sarah Jenkins",
    },
    {
        "title": "API Integration V2",
        "description": "Connect the new payment gateway endpoints to the staging server and run unit tests.",
        "priority": "Medium",
        "status": "In Progress",
        "progress": 30,
        "due_date": "Oct 28",
        "assignee": "David Chen",
    },
    {
        "title": "Q3 Marketing Plan",
        "description": "Finalize budget allocation for social channels and review copy for the main landing page.",
        "priority": "High",
        "status": "In Progress",
        "progress": 45,
        "due_date": "Today",
        "assignee": "Michael Lee",
    },
    {
        "title": "Update Iconography Library",
        "description": "Audit and replace existing icons with rounded variants to match new visual direction.",
        "priority": "Low",
        "status": "Not Started",
        "progress": 0,
        "due_date": "Nov 02",
        "assignee": "Alex Rivera",
    },
]


def _parse_priority(value: str) -> PriorityEnum:
    """Map a priority string to its enum value."""
    try:
        return PriorityEnum(str(value))
    except Exception:
        return PriorityEnum.MEDIUM


def _parse_status(value: str) -> TaskStatusEnum:
    """Map a status string to its enum value."""
    try:
        selected = str(value).strip()
        for member in TaskStatusEnum:
            if member.value.lower() == selected.lower():
                return member
        return TaskStatusEnum.IN_PROGRESS
    except Exception:
        return TaskStatusEnum.IN_PROGRESS


def _serialize_editor_ids(editor_ids) -> str:
    """Serialize a list of user ids into a comma-separated string."""
    if not editor_ids:
        return ""
    return ",".join(str(int(uid)) for uid in editor_ids)


def _ensure_demo_tasks_seeded(workspace_id: int, db: Session) -> None:
    """Seed demo tasks once per workspace (guarded by the AppMeta marker)."""
    marker = f"demo_tasks_seeded:{workspace_id}"
    existing_marker = db.query(AppMeta).filter(AppMeta.key == marker).first()
    if existing_marker:
        return

    creator = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    creator_user_id = creator.created_by_user_id if creator else 1

    for demo in DEMO_TASKS:
        task = Task(
            workspace_id=workspace_id,
            created_by_user_id=creator_user_id,
            title=demo["title"],
            description=demo["description"],
            priority=_parse_priority(demo["priority"]),
            status=_parse_status(demo["status"]),
            progress=demo["progress"],
            due_date=demo["due_date"],
            assignee=demo["assignee"],
            assignee_avatar=None,
            editor_user_ids=None
        )
        db.add(task)

    db.add(AppMeta(key=marker, value="1"))
    db.commit()


def _resolve_task_workspace(workspace_id: Optional[int], current_user: User, db: Session) -> Workspace:
    """Resolve a workspace the user actively belongs to, or raise 403/400."""
    if not workspace_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="workspace_id query parameter is required"
        )
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace with ID {workspace_id} not found"
        )
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
    return workspace


def _validate_granted_editors(workspace_id: int, editor_user_ids, db: Session) -> List[int]:
    """Ensure every granted editor is an active member of the workspace."""
    cleaned = []
    for uid in (editor_user_ids or []):
        membership = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == int(uid),
            WorkspaceMember.status == MembershipStatusEnum.ACTIVE
        ).first()
        if membership:
            cleaned.append(int(uid))
    return cleaned


@tasks_router.get("", response_model=TaskListResponse)
def list_tasks(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all tasks in a workspace.

    Any active workspace member (Viewer, Editor, or Admin) can view tasks.
    Each task includes `can_edit`, which is true only for the Admin or for
    members the Admin explicitly granted edit access to on that task.
    """
    workspace = _resolve_task_workspace(workspace_id, current_user, db)
    _ensure_demo_tasks_seeded(workspace.id, db)

    tasks = db.query(Task).filter(
        Task.workspace_id == workspace.id
    ).order_by(Task.created_at.asc(), Task.id.asc()).all()

    return TaskListResponse(
        success=True,
        total=len(tasks),
        tasks=[TaskResponse.from_task(t, current_user.id, db) for t in tasks]
    )


@tasks_router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task.

    Only workspace Admins can create tasks. The Admin can grant edit access
    to specific workspace members via `editor_user_ids`.
    """
    check_admin_permission(task_data.workspace_id, current_user, db)
    _resolve_task_workspace(task_data.workspace_id, current_user, db)

    editor_ids = _validate_granted_editors(task_data.workspace_id, task_data.editor_user_ids, db)

    task = Task(
        workspace_id=task_data.workspace_id,
        created_by_user_id=current_user.id,
        title=task_data.title.strip(),
        description=task_data.description,
        priority=_parse_priority(task_data.priority),
        status=_parse_status(task_data.status),
        progress=min(100, max(0, task_data.progress or 0)),
        due_date=task_data.due_date,
        assignee=task_data.assignee,
        assignee_avatar=task_data.assignee_avatar,
        editor_user_ids=_serialize_editor_ids(editor_ids)
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return TaskResponse.from_task(task, current_user.id, db)


@tasks_router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single task (any active workspace member)."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    _resolve_task_workspace(task.workspace_id, current_user, db)
    return TaskResponse.from_task(task, current_user.id, db)


@tasks_router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a task.

    Allowed for the workspace Admin, or for a member the Admin granted edit
    access to on this specific task. Non-admin users cannot change the list
    of granted editors.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )

    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == task.workspace_id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this workspace"
        )

    is_admin = membership.role == RoleEnum.ADMIN
    granted = current_user.id in _parse_editor_ids(task.editor_user_ids)

    if not (is_admin or granted):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this task. Ask a Workspace Admin to grant you access."
        )

    if not is_admin and task_data.editor_user_ids is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Workspace Admins can change edit permissions for a task"
        )

    if task_data.title is not None:
        title_clean = task_data.title.strip()
        if not title_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task title is required"
            )
        task.title = title_clean
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.priority is not None:
        task.priority = _parse_priority(task_data.priority)
    if task_data.status is not None:
        task.status = _parse_status(task_data.status)
    if task_data.progress is not None:
        task.progress = min(100, max(0, task_data.progress))
    if task_data.due_date is not None:
        task.due_date = task_data.due_date
    if task_data.assignee is not None:
        task.assignee = task_data.assignee
    if task_data.assignee_avatar is not None:
        task.assignee_avatar = task_data.assignee_avatar
    if is_admin and task_data.editor_user_ids is not None:
        editor_ids = _validate_granted_editors(task.workspace_id, task_data.editor_user_ids, db)
        task.editor_user_ids = _serialize_editor_ids(editor_ids)

    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)

    return TaskResponse.from_task(task, current_user.id, db)


@tasks_router.delete("/{task_id}", response_model=SuccessResponse)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a task.

    Only workspace Admins can delete tasks.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    check_admin_permission(task.workspace_id, current_user, db)

    db.delete(task)
    db.commit()

    return SuccessResponse(
        success=True,
        message="Task deleted successfully"
    )


# ============================================================================
# Saved Items Router
# ============================================================================

saved_router = APIRouter(prefix="/api/saved", tags=["saved"])


@saved_router.get("", response_model=SavedItemListResponse)
def list_saved_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return all saved/bookmarked items for the current user."""
    items = db.query(SavedItem).filter(
        SavedItem.user_id == current_user.id
    ).order_by(SavedItem.created_at.desc()).all()

    return SavedItemListResponse(
        success=True,
        items=[SavedItemResponse.model_validate(i) for i in items]
    )


@saved_router.post("", response_model=SavedItemResponse, status_code=status.HTTP_201_CREATED)
def create_saved_item(
    payload: SavedItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a saved/bookmarked item."""
    item = SavedItem(
        user_id=current_user.id,
        workspace_id=payload.workspace_id,
        item_type=payload.item_type,
        item_id=payload.item_id,
        title=payload.title,
        author=payload.author,
        date=payload.date,
        category=payload.category,
        icon=payload.icon,
        avatar=payload.avatar
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return SavedItemResponse.model_validate(item)


@saved_router.delete("/{item_id}", response_model=SuccessResponse)
def delete_saved_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Un-bookmark / delete a saved item (owner only)."""
    item = db.query(SavedItem).filter(
        SavedItem.id == item_id,
        SavedItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved item not found"
        )
    db.delete(item)
    db.commit()
    return SuccessResponse(success=True, message="Saved item removed")


# ============================================================================
# Presentation Router
# ============================================================================

presentations_router = APIRouter(prefix="/api/presentations", tags=["presentations"])


@presentations_router.get("", response_model=PresentationListResponse)
def list_presentations(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all presentations in a workspace."""
    _get_workspace_or_404(workspace_id, current_user, db)
    pres = db.query(Presentation).filter(
        Presentation.workspace_id == workspace_id
    ).order_by(Presentation.created_at.desc()).all()
    return PresentationListResponse(
        success=True,
        presentations=[PresentationResponse.model_validate(p) for p in pres]
    )


@presentations_router.post("", response_model=PresentationResponse, status_code=status.HTTP_201_CREATED)
def create_presentation(
    payload: PresentationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a presentation record (after file upload)."""
    _get_workspace_or_404(payload.workspace_id, current_user, db)
    pres = Presentation(
        workspace_id=payload.workspace_id,
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        slides=payload.slides,
        file_name=payload.file_name,
        file_size=payload.file_size,
        author=payload.author or current_user.name
    )
    db.add(pres)
    db.commit()
    db.refresh(pres)
    return PresentationResponse.model_validate(pres)


@presentations_router.get("/{pres_id}", response_model=PresentationResponse)
def get_presentation(
    pres_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single presentation and increment view count."""
    pres = db.get(Presentation, pres_id)
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")
    _get_workspace_or_404(pres.workspace_id, current_user, db)

    pres.views = (pres.views or 0) + 1
    db.commit()
    db.refresh(pres)
    return PresentationResponse.model_validate(pres)


@presentations_router.put("/{pres_id}", response_model=PresentationResponse)
def update_presentation(
    pres_id: int,
    payload: PresentationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a presentation (Admin or owner)."""
    pres = db.get(Presentation, pres_id)
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")
    _get_workspace_or_404(pres.workspace_id, current_user, db)
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == pres.workspace_id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    if member.role != RoleEnum.ADMIN and pres.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner or an Admin can update this presentation")

    pres.title = payload.title
    pres.description = payload.description
    pres.category = payload.category
    pres.slides = payload.slides
    if payload.file_name:
        pres.file_name = payload.file_name
    pres.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(pres)
    return PresentationResponse.model_validate(pres)


@presentations_router.delete("/{pres_id}", response_model=SuccessResponse)
def delete_presentation(
    pres_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a presentation (Admin only)."""
    pres = db.get(Presentation, pres_id)
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")
    check_admin_permission(pres.workspace_id, current_user, db)
    db.delete(pres)
    db.commit()
    return SuccessResponse(success=True, message="Presentation deleted")


# ============================================================================
# Meeting Router
# ============================================================================

meetings_router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def _generate_meeting_code() -> str:
    return "mtg-" + uuid.uuid4().hex[:10]


@meetings_router.get("", response_model=MeetingListResponse)
def list_meetings(
    workspace_id: int = Query(...),
    date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List meetings, optionally filtered by date."""
    _get_workspace_or_404(workspace_id, current_user, db)
    query = db.query(Meeting).filter(Meeting.workspace_id == workspace_id)
    if date:
        query = query.filter(Meeting.scheduled_at.ilike(f"%{date}%"))
    meetings = query.order_by(Meeting.created_at.desc()).all()
    return MeetingListResponse(success=True, meetings=[MeetingResponse.model_validate(m) for m in meetings])


@meetings_router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedule a new meeting."""
    _get_workspace_or_404(payload.workspace_id, current_user, db)
    meeting = Meeting(
        workspace_id=payload.workspace_id,
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        code=payload.code or _generate_meeting_code(),
        scheduled_at=payload.scheduled_at,
        duration=payload.duration,
        status=payload.status if payload.status else "scheduled",
        participants_json=payload.participants_json
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Notify workspace members
    _notify_members(meeting.workspace_id, current_user.id, db, "meeting", f"New meeting: {meeting.title}")

    return MeetingResponse.model_validate(meeting)


@meetings_router.get("/code/{code}", response_model=MeetingResponse)
def get_meeting_by_code(
    code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve a meeting by its shareable code."""
    meeting = db.query(Meeting).filter(Meeting.code == code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    _get_workspace_or_404(meeting.workspace_id, current_user, db)
    return MeetingResponse.model_validate(meeting)


# ============================================================================
# Notification Router
# ============================================================================

notifications_router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@notifications_router.get("", response_model=NotificationListResponse)
def list_notifications(
    workspace_id: int = Query(...),
    unread_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List notifications for the current user in the given workspace."""
    _get_workspace_or_404(workspace_id, current_user, db)
    query = db.query(Notification).filter(
        Notification.workspace_id == workspace_id,
        Notification.user_id == current_user.id
    )
    if unread_only:
        query = query.filter(Notification.read == 0)
    notes = query.order_by(Notification.created_at.desc()).all()
    return NotificationListResponse(
        success=True,
        notifications=[NotificationResponse.model_validate(n) for n in notes]
    )


@notifications_router.post("/read", response_model=SuccessResponse)
def mark_notifications_read(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications in a workspace as read."""
    _get_workspace_or_404(workspace_id, current_user, db)
    db.query(Notification).filter(
        Notification.workspace_id == workspace_id,
        Notification.user_id == current_user.id,
        Notification.read == 0
    ).update({"read": 1})
    db.commit()
    return SuccessResponse(success=True, message="Notifications marked as read")


# ============================================================================
# Helpers for notifications
# ============================================================================

def _notify_members(workspace_id: int, sender_id: int, db: Session, note_type: str, message: str):
    """Create a notification for every active member of a workspace (except sender)."""
    members = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.status == MembershipStatusEnum.ACTIVE
    ).all()
    sender = db.get(User, sender_id)
    title = {
        "invite": "New member added",
        "meeting": "New meeting scheduled",
        "task": "Task assigned",
        "message": "New message",
    }.get(note_type, "Notification")
    for m in members:
        if m.user_id == sender_id:
            continue
        note = Notification(
            workspace_id=workspace_id,
            user_id=m.user_id,
            type=note_type,
            title=title,
            message=message
        )
        db.add(note)
    db.commit()


# ============================================================================
# Upload Router
# ============================================================================

upload_router = APIRouter(prefix="/api", tags=["upload"])


@upload_router.post("/upload")
def upload_file(
    file: UploadFile = File(...),
    category: str = Form("documents"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Multipart file upload endpoint.
    Saves the file to Backend/uploads/{category}/ and returns the path.
    """
    import os as _os
    upload_base = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "uploads")
    upload_dir = _os.path.join(upload_base, category)
    _os.makedirs(upload_dir, exist_ok=True)

    ext = _os.path.splitext(file.filename)[1]
    safe_name = _os.path.splitext(file.filename)[0].replace(" ", "_")
    dest_name = f"{safe_name}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = _os.path.join(upload_dir, dest_name)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    rel_path = f"uploads/{category}/{dest_name}"
    return {
        "success": True,
        "file_name": file.filename,
        "category": category,
        "file_path": rel_path,
        "size": _os.path.getsize(dest_path),
    }
