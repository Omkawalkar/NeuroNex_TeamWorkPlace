"""
Pydantic schemas for request/response validation in NeuroNex API.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from models import RoleEnum, MembershipStatusEnum


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


class WorkspaceCreate(WorkspaceBase):
    """Schema for creating a workspace."""
    pass


class WorkspaceResponse(WorkspaceBase):
    """Schema for workspace response."""
    id: int
    created_by_user_id: int
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
    created_at: datetime


class ChatMessagesResponse(BaseModel):
    """Schema for the chat history response."""
    success: bool
    messages: List[ChatMessageResponse]
