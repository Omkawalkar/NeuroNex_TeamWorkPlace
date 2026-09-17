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

from database import init_db, engine, SessionLocal, Base
from routers import router as workspaces_router, chat_router, me_router, users_router, auth_router, documents_router, tasks_router, saved_router, presentations_router, meetings_router, notifications_router, upload_router
from seed import seed_users
from realtime import manager, broadcast_typing_indicator

# Load environment variables
load_dotenv()

# Configuration
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "Frontend"))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# Schema patches for lazy migrations (PRAGMA table_info + ALTER TABLE)
SCHEMA_PATCHES = {
    "workspaces": [
        ("color", "ALTER TABLE workspaces ADD COLUMN color TEXT"),
        ("icon", "ALTER TABLE workspaces ADD COLUMN icon TEXT"),
    ],
    "messages": [
        ("message_type", "ALTER TABLE messages ADD COLUMN message_type VARCHAR(20) DEFAULT 'text' NOT NULL"),
        ("metadata", "ALTER TABLE messages ADD COLUMN metadata TEXT"),
    ],
}

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Schema Patches (lazy migration without Alembic)
# ============================================================================

def _run_schema_patches():
    """Use PRAGMA table_info to detect missing columns and ALTER TABLE to add them."""
    from sqlalchemy import inspect
    insp = inspect(engine)
    db = SessionLocal()
    try:
        for table, columns in SCHEMA_PATCHES.items():
            existing_cols = {c["name"] for c in insp.get_columns(table)} if table in insp.get_table_names() else set()
            for col_name, alter_sql in columns:
                if col_name not in existing_cols:
                    db.execute(db.__class__.__module__ and eval(alter_sql)) if False else None
                    from sqlalchemy import text
                    db.execute(text(alter_sql))
                    logger.info(f"  Added column '{col_name}' to '{table}'")
        db.commit()
    except Exception as e:
        logger.error(f"Schema patch error: {e}")
        db.rollback()
    finally:
        db.close()


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
    
    logger.info("Running schema patches...")
    _run_schema_patches()
    logger.info("[OK] Schema patches complete")
    
    logger.info("Seeding dummy users...")
    seed_users()
    logger.info("[OK] Dummy users seeded")
    
    logger.info("Creating upload directories...")
    for sub in ["documents", "presentations", "chat", "avatars"]:
        os.makedirs(os.path.join(UPLOAD_DIR, sub), exist_ok=True)
    logger.info("[OK] Upload directories ready")
    
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
app.include_router(tasks_router)
app.include_router(saved_router)
app.include_router(presentations_router)
app.include_router(meetings_router)
app.include_router(notifications_router)
app.include_router(upload_router)

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
        - presence_update: real-time presence snapshot
        """
        await manager.connect(workspace_id, websocket)
        # Try to extract current user from query param
        ws_user_id = websocket.query_params.get("user_id")
        if ws_user_id:
            manager.register_presence(workspace_id, int(ws_user_id))
            await manager.broadcast_presence(workspace_id)
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    payload = json.loads(data)
                    if payload.get("type") == "typing_indicator":
                        await broadcast_typing_indicator(
                            workspace_id,
                            payload.get("user_id", 0),
                            payload.get("username", "Unknown"),
                            payload.get("is_typing", False)
                        )
                    elif payload.get("type") == "presence_join":
                        uid = payload.get("user_id")
                        if uid:
                            manager.register_presence(workspace_id, int(uid))
                            await manager.broadcast_presence(workspace_id)
                    elif payload.get("type") == "presence_leave":
                        uid = payload.get("user_id")
                        if uid:
                            manager.unregister_presence(workspace_id, int(uid))
                            await manager.broadcast_presence(workspace_id)
                except Exception:
                    pass
        except WebSocketDisconnect:
            if ws_user_id:
                manager.unregister_presence(workspace_id, int(ws_user_id))
                await manager.broadcast_presence(workspace_id)
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

# Mount uploads directory
try:
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
    logger.info(f"[OK] Uploads mounted from: {UPLOAD_DIR}")
except Exception as e:
    logger.error(f"✗ Failed to mount uploads: {e}")


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
