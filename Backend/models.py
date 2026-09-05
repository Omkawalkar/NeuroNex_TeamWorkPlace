"""
SQLAlchemy models for NeuroNex application.
Defines User, Workspace, and WorkspaceMember tables.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, UniqueConstraint, Text
from sqlalchemy.orm import relationship
import enum
from database import Base

class User(Base):
    """
    User model representing individual team members.
    Each user has a unique Dummy ID (e.g., NN-ADMIN-001, NN-1001).
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    dummy_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    avatar_url = Column(String(1024), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    workspace_memberships = relationship("WorkspaceMember", back_populates="user", cascade="all, delete-orphan")
    created_workspaces = relationship("Workspace", back_populates="creator", foreign_keys="Workspace.created_by_user_id")

    def __repr__(self):
        return f"<User(dummy_id={self.dummy_id}, name={self.name})>"


class Workspace(Base):
    """
    Workspace model representing collaborative workspaces.
    Each workspace has a creator who automatically becomes an Admin.
    """
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1024), nullable=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    creator = relationship("User", back_populates="created_workspaces", foreign_keys=[created_by_user_id])
    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Workspace(id={self.id}, name={self.name})>"


class RoleEnum(str, enum.Enum):
    """Enum for workspace member roles."""
    ADMIN = "Admin"
    EDITOR = "Editor"
    VIEWER = "Viewer"


class MembershipStatusEnum(str, enum.Enum):
    """Enum for workspace membership status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    REMOVED = "removed"


class WorkspaceMember(Base):
    """
    WorkspaceMember model representing the relationship between users and workspaces.
    Stores role, membership status, and joined date.
    Prevents duplicate memberships.
    """
    __tablename__ = "workspace_members"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.VIEWER, nullable=False)
    status = Column(Enum(MembershipStatusEnum), default=MembershipStatusEnum.ACTIVE, nullable=False)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Unique constraint to prevent duplicate memberships
    __table_args__ = (UniqueConstraint("workspace_id", "user_id", name="unique_workspace_member"),)

    # Relationships
    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="workspace_memberships")

    def __repr__(self):
        return f"<WorkspaceMember(workspace_id={self.workspace_id}, user_id={self.user_id}, role={self.role})>"

# ============================================================================
# Chat Messages
# ============================================================================

class Message(Base):
    """
    Chat message sent inside a workspace.
    (Migrated from the former MongoDB `messages` collection.)
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    status = Column(String(20), default="sent", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<Message(id={self.id}, workspace_id={self.workspace_id}, user_id={self.user_id})>"


# ============================================================================
# User Sessions (dev header-based auth)
# ============================================================================

class UserSession(Base):
    """
    Lightweight per-user session row used by the dev (header-based) auth
    model to remember which workspace the user currently has selected.
    """
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    selected_workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self):
        return f"<UserSession(user_id={self.user_id}, selected_workspace_id={self.selected_workspace_id})>"


# ============================================================================
# Documents
# ============================================================================

class Document(Base):
    """
    Document model for files uploaded to a workspace.
    Supports various file types: PDF, DOCX, XLSX, PPTX, TXT, code files, etc.
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    author = Column(String(255), nullable=True)
    category = Column(String(50), nullable=False, default="doc")
    file_name = Column(String(500), nullable=True)
    file_type = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=True)
    file_path = Column(String(1024), nullable=True)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    workspace = relationship("Workspace", back_populates="documents")
    user = relationship("User")

    def __repr__(self):
        return f"<Document(id={self.id}, title={self.title}, category={self.category})>"


# Add documents relationship to Workspace model
Workspace.documents = relationship("Document", back_populates="workspace", cascade="all, delete-orphan")
