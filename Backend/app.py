"""
NeuroNex Backend — Collaborative Workspace Application

Run:
    uvicorn app:app --reload

Architecture:
    - FastAPI with SQLAlchemy ORM
    - SQLite database for local development (easily migrable to PostgreSQL)
    - Pydantic for request/response validation
    - RESTful API with proper error handling
    - CORS enabled for local frontend development
    - Header-based authentication (X-Current-User-Dummy-ID)

API Endpoints:
    Workspaces:
        POST   /api/workspaces              Create new workspace
        GET    /api/workspaces              List user's workspaces
        GET    /api/workspaces/{id}         Get workspace dashboard
        GET    /api/workspaces/{id}/members Get workspace members
        POST   /api/workspaces/{id}/members Invite user by Dummy ID
        PUT    /api/workspaces/{id}/members/{user_id} Change member role
        DELETE /api/workspaces/{id}/members/{user_id} Remove member
    
    Health:
        GET    /api/health                  Health check
"""

import os
import logging
import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, status, WebSocket, WebSocketDisconnect
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from dotenv import load_dotenv

from database import init_db
from routers import router as workspaces_router, chat_router, me_router, users_router, auth_router, documents_router
from seed import seed_users
from realtime import manager, broadcast_typing_indicator

# Load environment variables
load_dotenv()

# Configuration
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "Frontend"))

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Startup/Shutdown Events
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: Initialize database and seed users
    Shutdown: Cleanup
    """
    # Startup
    logger.info("Initializing database...")
    init_db()
    logger.info("[OK] Database initialized")
    
    logger.info("Seeding dummy users...")
    seed_users()
    logger.info("[OK] Dummy users seeded")
    
    yield
    
    # Shutdown
    logger.info("Application shutdown")


# ============================================================================
# Create FastAPI App
# ============================================================================

app = FastAPI(
    title="NeuroNex API",
    description="Collaborative Workspace Application",
    version="1.0.0",
    lifespan=lifespan
)

# ============================================================================
# CORS Configuration
# ============================================================================
# Allow frontend on any port during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# API Routers
# ============================================================================
app.include_router(workspaces_router)
app.include_router(users_router)
app.include_router(me_router)
app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(documents_router)

# ============================================================================
# Health Check
# ============================================================================

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "NeuroNex API is running",
        "version": "1.0.0"
    }


# ============================================================================
# WebSocket: Real-time member updates and chat
# ============================================================================

@app.websocket("/ws/{workspace_id}")
async def websocket_endpoint(websocket: WebSocket, workspace_id: int):
    """
    Live connection for a workspace dashboard.
    The client receives events for:
    - members_updated: member list changes
    - chat_message: new chat messages
    - typing_indicator: when users are typing
    """
    await manager.connect(workspace_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Client can send typing indicators back
            try:
                payload = json.loads(data)
                if payload.get("type") == "typing_indicator":
                    await broadcast_typing_indicator(
                        workspace_id,
                        payload.get("user_id", 0),
                        payload.get("username", "Unknown"),
                        payload.get("is_typing", False)
                    )
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(workspace_id, websocket)


# ============================================================================
# Static File Serving (Frontend)
# ============================================================================

@app.get("/")
def index():
    """Redirect to the authentication (login/sign-up) page."""
    # Login page auto-redirects already-authenticated users to the workspace.
    login_url = "/Frontend/Create_account/create.html"
    return RedirectResponse(url=login_url, status_code=307)


# Mount Frontend directory to serve static files
try:
    app.mount("/Frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")
    logger.info(f"[OK] Frontend mounted from: {FRONTEND_DIR}")
except Exception as e:
    logger.error(f"✗ Failed to mount Frontend: {e}")


# ============================================================================
# Catch-all for Frontend routing (SPA support)
# ============================================================================

@app.get("/{path_name:path}")
def serve_frontend(path_name: str):
    """
    Catch-all route to serve Frontend pages.
    Supports SPA-style routing where HTML files can be accessed without extension.
    """
    # Do not serve frontend files for API routes that 404
    if path_name.startswith("api/") or path_name == "api":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API endpoint not found"
        )

    # Remove trailing slashes
    path_name = path_name.rstrip("/")
    
    # Check for direct file match
    file_path = Path(FRONTEND_DIR) / path_name
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    # Check for .html file
    html_file = Path(FRONTEND_DIR) / f"{path_name}.html"
    if html_file.exists():
        return FileResponse(html_file)
    
    # Return workspace.html as default
    default_path = Path(FRONTEND_DIR) / "WorkSpace" / "workspace.html"
    if default_path.exists():
        return FileResponse(default_path)
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Page not found"
    )


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting NeuroNex API on {HOST}:{PORT}")
    logger.info(f"Frontend directory: {FRONTEND_DIR}")
    logger.info(f"API documentation: http://{HOST}:{PORT}/docs")
    
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="info"
    )
