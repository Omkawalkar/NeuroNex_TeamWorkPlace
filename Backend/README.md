# NeuroNex Backend - FastAPI Implementation

## Overview

This is the FastAPI backend for the NeuroNex collaborative workspace application. It provides a complete RESTful API for workspace management, member invitations, and real-time collaboration features.

## Architecture

- **Framework**: FastAPI (modern, fast Python web framework)
- **ORM**: SQLAlchemy 2.0 (database abstraction layer)
- **Database**: SQLite (local development), easily migrable to PostgreSQL
- **Validation**: Pydantic v2 (request/response schemas)
- **CORS**: Enabled for local frontend development
- **Authentication**: Header-based (X-Current-User-Dummy-ID)

## Requirements

- Python 3.10+
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn (ASGI server)

## Installation

### 1. Install Python Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Run the Application

Development mode (with auto-reload):
```bash
uvicorn app:app --reload
```

The API will be available at: `http://localhost:8000`
- API documentation (Swagger UI): `http://localhost:8000/docs`
- Alternative documentation (ReDoc): `http://localhost:8000/redoc`

## Database Setup

The database is automatically initialized when the application starts:
- Creates all necessary tables (Users, Workspaces, WorkspaceMembers)
- Seeds the database with 6 predefined dummy users
- Uses SQLite locally (easily migrable to PostgreSQL)

## Predefined Dummy Users

For development and testing:

| Dummy ID | Name | Email |
|----------|------|-------|
| NN-ADMIN-001 | Alex Chen | alex.chen@etheric.app |
| NN-1001 | Jordan Lee | jordan.l@etheric.app |
| NN-1002 | Sarah Connor | s.connor@etheric.app |
| NN-1003 | Michael Lee | michael.l@etheric.app |
| NN-1004 | Priya Patel | priya.p@etheric.app |
| NN-1005 | Lisa Wang | lisa.w@etheric.app |

## API Endpoints

### Workspaces

#### Create Workspace
```
POST /api/workspaces
Header: X-Current-User-Dummy-ID: NN-ADMIN-001
Body: {"name": "My Workspace", "description": "Optional"}
```

#### List User's Workspaces
```
GET /api/workspaces
Header: X-Current-User-Dummy-ID: NN-ADMIN-001
```

#### Get Workspace Dashboard
```
GET /api/workspaces/{workspace_id}
Header: X-Current-User-Dummy-ID: NN-ADMIN-001
```

#### Get Workspace Members
```
GET /api/workspaces/{workspace_id}/members
Header: X-Current-User-Dummy-ID: NN-ADMIN-001
```

### Member Management

#### Invite User by Dummy ID
```
POST /api/workspaces/{workspace_id}/members
Header: X-Current-User-Dummy-ID: NN-ADMIN-001
Body: {"dummy_id": "NN-1001", "role": "Editor"}
```

#### Update Member Role
```
PUT /api/workspaces/{workspace_id}/members/{user_id}
Header: X-Current-User-Dummy-ID: NN-ADMIN-001
Body: {"role": "Viewer"}
```

#### Remove Member
```
DELETE /api/workspaces/{workspace_id}/members/{user_id}
Header: X-Current-User-Dummy-ID: NN-ADMIN-001
```

### Health Check
```
GET /api/health
```

## Database Models

### User
- `id`: Primary key
- `dummy_id`: Unique identifier (e.g., NN-1001)
- `name`: User's full name
- `email`: Email address
- `avatar_url`: Profile picture URL
- `created_at`: Timestamp

### Workspace
- `id`: Primary key
- `name`: Workspace name
- `description`: Optional description
- `created_by_user_id`: Creator's user ID
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### WorkspaceMember
- `id`: Primary key
- `workspace_id`: FK to Workspace
- `user_id`: FK to User
- `role`: Admin, Editor, or Viewer
- `status`: active, inactive, or removed
- `joined_at`: Membership start date

## Authentication

Uses header-based authentication for development:
```
X-Current-User-Dummy-ID: NN-ADMIN-001
```

**Note**: This is for development only. Implement proper JWT authentication for production.

## Key Features

✅ Workspace creation and management
✅ Dynamic member invitations by Dummy ID
✅ Role-based access control (Admin, Editor, Viewer)
✅ Member list with real-time updates
✅ Database-driven (no hardcoded data)
✅ CORS enabled for frontend development
✅ Comprehensive error handling
✅ Easily migrable to PostgreSQL

## Project Structure

```
Backend/
├── app.py          # Main FastAPI application
├── database.py     # SQLAlchemy setup
├── models.py       # Database models
├── schemas.py      # Pydantic schemas
├── routers.py      # API endpoints
├── seed.py         # Database seeding
├── requirements.txt
├── neuronex.db     # SQLite database (auto-created)
└── README.md
```

## Development

- The app automatically initializes the database on startup
- Frontend connects via `X-Current-User-Dummy-ID` header
- All responses use Pydantic models for validation
- CORS is enabled for `http://localhost:3000` and all ports during dev

## Notes

- User creation is handled via seeding; no registration endpoint yet
- Workspace creators automatically become Admins
- Removed members are deactivated, not deleted
- Supports pagination and filtering (to be implemented)
- WebSocket support ready for future real-time features