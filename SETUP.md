# NeuroNex Collaborative Workspace - Setup Guide

## Quick Start

### Prerequisites
- Python 3.10 or higher
- A terminal/command prompt
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Backend Setup (FastAPI + SQLite)

1. **Navigate to Backend directory**:
   ```bash
   cd Backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server**:
   ```bash
   uvicorn app:app --reload
   ```
   
   The backend will:
   - Start on `http://localhost:8000`
   - Auto-initialize SQLite database
   - Seed predefined dummy users
   - Show Swagger docs at `http://localhost:8000/docs`

### Frontend Access

1. **Open browser** and go to:
   ```
   http://localhost:8000/Frontend/WorkSpace/workspace.html
   ```

2. **You're ready to test!** The frontend connects to the backend automatically.

## Workflow: Creating and Managing a Workspace

### 1. Create a Workspace
- Click **"Create New Workspace"**
- Enter a workspace name (e.g., "Marketing Team")
- Select a color
- Click **"Create Workspace"**
- You're automatically redirected to the workspace dashboard as an Admin

### 2. View Members
- The dashboard shows you (the creator) as the only member initially
- Member count updates dynamically

### 3. Invite Members
- Click the **invite button** (icon in the header)
- Enter a Dummy ID (e.g., `NN-1001` for Jordan Lee)
- Select a role: **Admin**, **Editor**, or **Viewer**
- Click **"Invite"**
- The member is added instantly and appears on the dashboard

### 4. Manage Roles
- Select a different role from the dropdown next to each member
- Changes take effect immediately

### 5. Remove Members
- (Feature available in backend, UI can be extended)

## Predefined Test Users

For testing, these users are automatically available:

| Dummy ID | Name | Use For Testing |
|----------|------|-----------------|
| **NN-ADMIN-001** | Alex Chen | Primary test user (you) |
| NN-1001 | Jordan Lee | Invite as team member |
| NN-1002 | Sarah Connor | Invite as team member |
| NN-1003 | Michael Lee | Invite as team member |
| NN-1004 | Priya Patel | Invite as team member |
| NN-1005 | Lisa Wang | Invite as team member |

### Example Workflow

```
1. Create workspace "Design Team"
2. Invite NN-1001 (Jordan) as Editor
3. Invite NN-1002 (Sarah) as Viewer
4. Change Jordan's role to Admin
5. Watch the dashboard update in real-time
```

## Architecture

```
Frontend                      Backend (FastAPI)           Database (SQLite)
└── HTML/CSS/JS          →    └── REST API            →   └── Users
    (Workspace Selection)         (Workspace Mgmt)         └── Workspaces
    (Dashboard)                    (Member Mgmt)           └── WorkspaceMembers
    (Member List)
```

## Key Implementation Details

### Backend (FastAPI)
- **Location**: `Backend/app.py`, `Backend/routers.py`
- **Database**: `Backend/neuronex.db` (SQLite)
- **Authentication**: Header-based (`X-Current-User-Dummy-ID`)
- **Models**: User, Workspace, WorkspaceMember (SQLAlchemy)
- **Schemas**: Pydantic for validation

### Frontend
- **Workspace Selection**: `Frontend/WorkSpace/workspace.js`
- **Dashboard**: `Frontend/Dashboard/dashboard.js`
- **Member Management**: `Frontend/Dashboard/dashboard-members.js` (NEW)
- **API Integration**: Uses `X-Current-User-Dummy-ID` header
- **Default Test User**: NN-ADMIN-001 (hardcoded for dev)

## API Endpoints (for reference)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces` | List user's workspaces |
| GET | `/api/workspaces/{id}` | Get workspace dashboard |
| GET | `/api/workspaces/{id}/members` | Get all members |
| POST | `/api/workspaces/{id}/members` | Invite member by Dummy ID |
| PUT | `/api/workspaces/{id}/members/{uid}` | Update member role |
| DELETE | `/api/workspaces/{id}/members/{uid}` | Remove member |
| GET | `/api/health` | Health check |

## Troubleshooting

### Backend won't start
- Make sure Python 3.10+ is installed: `python --version`
- Delete `neuronex.db` and try again
- Check that port 8000 is not in use

### Frontend won't load
- Make sure backend is running on `http://localhost:8000`
- Check browser console for errors
- Try clearing cache and reloading

### Workspaces not loading
- Backend is running and accessible
- Check browser DevTools Network tab for API calls
- Verify `X-Current-User-Dummy-ID` header is being sent

### Can't invite members
- Make sure the Dummy ID exists (use one from the predefined list)
- You must be an Admin to invite members
- Check for duplicate membership errors

## Next Steps (Future Features)

- [ ] Real WebSocket support for real-time updates
- [ ] Chat/messaging system
- [ ] File sharing and document management
- [ ] Task assignment and tracking
- [ ] Proper JWT authentication
- [ ] PostgreSQL production database
- [ ] Email notifications
- [ ] User profile management

## Development Notes

- The frontend uses a hardcoded test user `NN-ADMIN-001`
- For production, replace with proper authentication (JWT/OAuth)
- Database automatically seeds users on startup (idempotent)
- All API calls include the `X-Current-User-Dummy-ID` header
- CORS is enabled for localhost development

## Documentation

- Backend API: See `Backend/README.md`
- Database Models: See `Backend/models.py`
- API Schemas: See `Backend/schemas.py`
- Frontend: See individual `.js` files in `Frontend/`

---

**Built with FastAPI, SQLAlchemy, and Pydantic**  
**Database: SQLite (dev), PostgreSQL (production-ready)**  
**Frontend: Pure HTML/CSS/JavaScript (Tailwind CSS)**
