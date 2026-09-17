"""
Pydantic schemas for request/response validation in NeuroNex API.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from models import RoleEnum, MembershipStatusEnum, User, WorkspaceMember


# ============================================================================
# User Schemas
# ============================================================================

class UserBase(BaseModel):
    """Base user schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = Field(None, max_length=1024)


class UserCreate(UserBase):
    """Schema for creating a user."""
    dummy_id: str = Field(..., min_length=1, max_length=50)


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    dummy_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    """Schema for updating the current user's public profile."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = Field(None, max_length=1024)


class LoginRequest(BaseModel):
    """Schema for user login request."""
    email: str = Field(..., min_length=1, max_length=255)
    password: Optional[str] = None


class RegisterRequest(BaseModel):
    """Schema for user registration request."""
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=1, max_length=255)
    password: Optional[str] = None


class AuthResponse(BaseModel):
    """Schema for auth responses (register/login)."""
    success: bool
    message: str
    dummy_id: str
    user: UserResponse


# ============================================================================
# Workspace Member Schemas
# ============================================================================

class WorkspaceMemberBase(BaseModel):
    """Base workspace member schema."""
    role: RoleEnum = RoleEnum.VIEWER
    status: MembershipStatusEnum = MembershipStatusEnum.ACTIVE


class WorkspaceMemberCreate(BaseModel):
    """Schema for adding a member to a workspace by Dummy ID or Email."""
    dummy_id: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    role: RoleEnum = RoleEnum.EDITOR


class WorkspaceMemberUpdate(BaseModel):
    """Schema for updating a member's role."""
    role: RoleEnum


class WorkspaceMemberResponse(BaseModel):
    """Schema for workspace member response."""
    id: int
    user_id: int
    workspace_id: int
    role: RoleEnum
    status: MembershipStatusEnum
    joined_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True


# ============================================================================
# Workspace Schemas
# ============================================================================

class WorkspaceBase(BaseModel):
    """Base workspace schema."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1024)
    color: Optional[str] = Field(None, max_length=50)
    icon: Optional[str] = Field(None, max_length=50)


class WorkspaceCreate(WorkspaceBase):
    """Schema for creating a workspace."""
    pass


class WorkspaceResponse(WorkspaceBase):
    """Schema for workspace response."""
    id: int
    created_by_user_id: int
    color: Optional[str] = None
    icon: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkspaceDashboard(WorkspaceResponse):
    """Schema for workspace dashboard with members."""
    creator: UserResponse
    members: List[WorkspaceMemberResponse]
    member_count: int

    class Config:
        from_attributes = True

    @classmethod
    def from_workspace(cls, workspace):
        """Create dashboard response from workspace model."""
        active_members = [m for m in workspace.members if m.status == MembershipStatusEnum.ACTIVE]
        return cls(
            id=workspace.id,
            name=workspace.name,
            description=workspace.description,
            color=workspace.color,
            icon=workspace.icon,
            created_by_user_id=workspace.created_by_user_id,
            created_at=workspace.created_at,
            updated_at=workspace.updated_at,
            creator=UserResponse.model_validate(workspace.creator),
            members=[WorkspaceMemberResponse.model_validate(m) for m in active_members],
            member_count=len(active_members)
        )


class WorkspaceListItem(WorkspaceResponse):
    """Schema for workspace list item."""
    member_count: int
    creator: UserResponse

    class Config:
        from_attributes = True

    @classmethod
    def from_workspace(cls, workspace):
        """Create list item from workspace model."""
        active_members = [m for m in workspace.members if m.status == MembershipStatusEnum.ACTIVE]
        return cls(
            id=workspace.id,
            name=workspace.name,
            description=workspace.description,
            color=workspace.color,
            icon=workspace.icon,
            created_by_user_id=workspace.created_by_user_id,
            created_at=workspace.created_at,
            updated_at=workspace.updated_at,
            member_count=len(active_members),
            creator=UserResponse.model_validate(workspace.creator)
        )


# ============================================================================
# Document Schemas
# ============================================================================

class DocumentBase(BaseModel):
    """Base document schema with common fields."""
    title: str = Field(..., min_length=1, max_length=500)
    author: Optional[str] = Field(None, max_length=255)
    category: str = Field(..., min_length=1, max_length=50)
    file_name: Optional[str] = Field(None, max_length=500)
    file_type: Optional[str] = Field(None, max_length=100)
    file_size: Optional[int] = Field(None, ge=0)
    content: Optional[str] = None


class DocumentCreate(DocumentBase):
    """Schema for creating a document."""
    workspace_id: int


class DocumentUpdate(BaseModel):
    """Schema for updating a document."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    author: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    content: Optional[str] = None


class DocumentResponse(DocumentBase):
    """Schema for document response."""
    id: int
    workspace_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """Schema for document list response."""
    success: bool
    documents: List[DocumentResponse]
    total: int


class DocumentFilterParams(BaseModel):
    """Schema for document filter parameters."""
    category: Optional[str] = None
    search: Optional[str] = None
    sort_by: str = "date"
    sort_order: str = "desc"
    page: int = 1
    limit: int = 20


# ============================================================================
# Error Response Schemas
# ============================================================================

class ErrorResponse(BaseModel):
    """Schema for error responses."""
    error: str
    detail: Optional[str] = None


class SuccessResponse(BaseModel):
    """Schema for success responses."""
    success: bool
    message: str
    data: Optional[dict] = None

# ============================================================================
# Dummy ID Validation Schemas
# ============================================================================

class UserValidateResponse(BaseModel):
    """Response schema for Dummy ID validation."""
    valid: bool
    message: str
    user: Optional[UserResponse] = None


# ============================================================================
# Session / Me Schemas
# ============================================================================

class WorkspaceSelectRequest(BaseModel):
    """Schema for selecting the active workspace."""
    workspace_id: int


class MeResponse(BaseModel):
    """Schema for the /api/me response (current user + selected workspace)."""
    success: bool
    user: UserResponse
    workspace: Optional[WorkspaceDashboard] = None


# ============================================================================
# Chat Message Schemas
# ============================================================================

class ChatMessageCreate(BaseModel):
    """Schema for sending a chat message."""
    text: str = Field(..., min_length=1)


class ChatMessageResponse(BaseModel):
    """Schema for a single chat message (matches the dashboard chat renderer)."""
    id: int
    workspace_id: int
    user_id: int
    username: str
    avatar: Optional[str] = None
    text: str
    status: str = "sent"
    message_type: str = "text"
    metadata: Optional[str] = None
    created_at: datetime


class ChatMessagesResponse(BaseModel):
    """Schema for the chat history response."""
    success: bool
    messages: List[ChatMessageResponse]


# ============================================================================
# Task Schemas
# ============================================================================

class TaskCreate(BaseModel):
    """Schema for creating a task (Admin only)."""
    workspace_id: int
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None)
    priority: str = Field("Medium", max_length=20)
    status: str = Field("In Progress", max_length=20)
    progress: int = Field(0, ge=0, le=100)
    due_date: Optional[str] = Field(None, max_length=100)
    assignee: Optional[str] = Field(None, max_length=255)
    assignee_avatar: Optional[str] = Field(None, max_length=1024)
    # User IDs (workspace members) the Admin grants edit permission to.
    editor_user_ids: List[int] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    """Schema for updating a task (Admin or granted member)."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    priority: Optional[str] = Field(None, max_length=20)
    status: Optional[str] = Field(None, max_length=20)
    progress: Optional[int] = Field(None, ge=0, le=100)
    due_date: Optional[str] = Field(None, max_length=100)
    assignee: Optional[str] = Field(None, max_length=255)
    assignee_avatar: Optional[str] = Field(None, max_length=1024)
    # Only Admins may change the grant list for a task.
    editor_user_ids: Optional[List[int]] = None


class TaskResponse(BaseModel):
    """Schema for a single task response."""
    id: int
    workspace_id: int
    created_by_user_id: int
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    progress: int
    due_date: Optional[str] = None
    assignee: Optional[str] = None
    assignee_avatar: Optional[str] = None
    editor_user_ids: List[int] = Field(default_factory=list)
    # Whether the requesting user may edit this task (Admin or granted member).
    can_edit: bool
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None

    @classmethod
    def from_task(cls, task, current_user_id: int, db=None):
        """Build a task response with the current user's edit permission."""
        editor_ids = _parse_editor_ids(task.editor_user_ids)
        membership = None
        if db is not None:
            membership = db.query(WorkspaceMember).filter(
                WorkspaceMember.workspace_id == task.workspace_id,
                WorkspaceMember.user_id == current_user_id,
                WorkspaceMember.status == MembershipStatusEnum.ACTIVE
            ).first()
        is_admin = membership is not None and membership.role == RoleEnum.ADMIN
        can_edit = bool(is_admin) or (current_user_id in editor_ids)

        creator = None
        if db is not None:
            creator_user = db.get(User, task.created_by_user_id)
            if creator_user:
                creator = UserResponse.model_validate(creator_user)

        return cls(
            id=task.id,
            workspace_id=task.workspace_id,
            created_by_user_id=task.created_by_user_id,
            title=task.title,
            description=task.description,
            priority=task.priority.value if hasattr(task.priority, "value") else str(task.priority),
            status=task.status.value if hasattr(task.status, "value") else str(task.status),
            progress=task.progress or 0,
            due_date=task.due_date,
            assignee=task.assignee,
            assignee_avatar=task.assignee_avatar,
            editor_user_ids=editor_ids,
            can_edit=can_edit,
            created_at=task.created_at,
            updated_at=task.updated_at,
            creator=creator
        )


class TaskListResponse(BaseModel):
    """Schema for the task list response."""
    success: bool
    tasks: List[TaskResponse]
    total: int


# ============================================================================
# Saved Item Schemas
# ============================================================================

class SavedItemBase(BaseModel):
    item_type: str = Field(..., min_length=1, max_length=50)
    item_id: Optional[str] = Field(None, max_length=100)
    title: str = Field(..., min_length=1, max_length=500)
    author: Optional[str] = Field(None, max_length=255)
    date: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=50)
    icon: Optional[str] = Field(None, max_length=50)
    avatar: Optional[str] = Field(None, max_length=1024)


class SavedItemCreate(SavedItemBase):
    workspace_id: Optional[int] = None


class SavedItemResponse(SavedItemBase):
    id: int
    user_id: int
    workspace_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SavedItemListResponse(BaseModel):
    success: bool
    items: List[SavedItemResponse]


# ============================================================================
# Presentation Schemas
# ============================================================================

class PresentationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    category: str = Field("all", max_length=50)
    slides: int = Field(0, ge=0)
    file_name: Optional[str] = Field(None, max_length=500)
    file_size: Optional[int] = Field(None, ge=0)
    author: Optional[str] = Field(None, max_length=255)


class PresentationCreate(PresentationBase):
    workspace_id: int


class PresentationResponse(PresentationBase):
    id: int
    workspace_id: int
    user_id: int
    views: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PresentationListResponse(BaseModel):
    success: bool
    presentations: List[PresentationResponse]


# ============================================================================
# Meeting Schemas
# ============================================================================

class MeetingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    code: Optional[str] = Field(None, max_length=100)
    scheduled_at: Optional[str] = Field(None, max_length=100)
    duration: Optional[str] = Field(None, max_length=100)
    participants_json: Optional[str] = None


class MeetingCreate(MeetingBase):
    workspace_id: int


class MeetingResponse(MeetingBase):
    id: int
    workspace_id: int
    user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MeetingListResponse(BaseModel):
    success: bool
    meetings: List[MeetingResponse]


# ============================================================================
# Notification Schemas
# ============================================================================

class NotificationResponse(BaseModel):
    id: int
    workspace_id: int
    user_id: int
    type: str
    title: str
    message: Optional[str] = None
    read: int
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    success: bool
    notifications: List[NotificationResponse]


def _parse_editor_ids(raw: Optional[str]) -> List[int]:
    """Parse a comma-separated editor user id string into a list of ints."""
    if not raw:
        return []
    ids = []
    for part in str(raw).split(","):
        part = part.strip()
        if part.isdigit():
            ids.append(int(part))
    return ids
