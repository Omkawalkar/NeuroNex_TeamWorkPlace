"""
NeuroNex backend — Login & Account creation with MongoDB.

Run:
    python app.py

Routes:
    POST /api/register             Create a new account (name, email, password) and log in
    POST /api/login                Log in with email + password
    GET  /api/me                   Return the logged-in user + current workspace (or 401)
    POST /api/logout               Log out
    GET  /api/health               Server + MongoDB connectivity check
    GET  /api/workspaces           List all workspaces the user is a member of
    POST /api/workspaces           Create a new empty workspace and select it
    POST /api/workspaces/select    Select an existing workspace (stores in session)
    GET  /api/workspaces/current   Return the currently selected workspace (or null)
    GET  /api/chat/messages        Retrieve chat messages for the active workspace
    POST /api/chat/messages        Insert a new chat message into the active workspace
    /                              Serves the static Frontend pages
"""

import os
import re
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify, request, session, send_from_directory, redirect
from flask_cors import CORS
from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError
from werkzeug.security import generate_password_hash, check_password_hash

from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "Frontend"))

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "neuronex")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me-in-production")
PORT = int(os.getenv("PORT", "5000"))

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

app = Flask(
    __name__,
    static_folder=None,  # we serve Frontend manually to keep /Frontend/... paths
)

# Allow the browser to call the API even if a different port / tool is used.
# Flask-CORS reflects the request Origin (it never sends a literal "*") when
# supports_credentials is enabled, which is required for the browser to accept
# the session cookie on cross-origin requests (e.g. when the login page is
# opened from a preview port or a double-clicked file).
CORS(app, supports_credentials=True)

app.config.update(
    SECRET_KEY=SECRET_KEY,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,  # set True in production behind HTTPS
    JSON_SORT_KEYS=False,
)

# ---------------------------------------------------------------------------
# MongoDB
# ---------------------------------------------------------------------------
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db = client[DB_NAME]
users = db["users"]
users.create_index([("email", ASCENDING)], unique=True)

messages = db["messages"]
messages.create_index([("channel", ASCENDING), ("created_at", ASCENDING)])

workspaces = db["workspaces"]
workspaces.create_index([("members", ASCENDING), ("created_at", ASCENDING)])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _user_public(user):
    """Strip out sensitive fields before sending the user to the browser."""
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "created_at": user.get("created_at"),
    }


def _error(message, status=400):
    return jsonify({"success": False, "message": message}), status


def _chat_message_public(msg):
    """Return a JSON-safe representation of a chat message."""
    created = msg.get("created_at")
    if isinstance(created, datetime):
        created = created.isoformat()
    return {
        "id": str(msg.get("_id", "")),
        "channel": msg.get("channel", "team"),
        "user_id": msg.get("user_id", ""),
        "username": msg.get("username", "Unknown"),
        "avatar": msg.get("avatar", ""),
        "text": msg.get("text", ""),
        "created_at": created,
        "status": msg.get("status", "sent"),
    }


def _workspace_public(ws):
    """Return a JSON-safe representation of a workspace."""
    created = ws.get("created_at")
    if isinstance(created, datetime):
        created = created.isoformat()
    return {
        "id": str(ws.get("_id", "")),
        "name": ws.get("name", ""),
        "icon": ws.get("icon", "workspace_preset"),
        "color": ws.get("color", "primary"),
        "icon_bg": ws.get("icon_bg", "bg-primary-container"),
        "text_color": ws.get("text_color", "text-on-primary-container"),
        "project_count": int(ws.get("project_count", 0)),
        "members": [str(m) for m in ws.get("members", [])],
        "created_by": str(ws.get("created_by", "")),
        "created_at": created,
        "is_default": bool(ws.get("is_default", False)),
    }


def _workspace_channel(workspace_id):
    """Build the chat channel name for a given workspace ID."""
    return f"ws:{workspace_id}"


# ---------------------------------------------------------------------------
# Default workspace templates (seeded once per new user)
# ---------------------------------------------------------------------------
DEFAULT_WORKSPACES = [
    {
        "name": "Design Team",
        "icon": "design_services",
        "color": "secondary",
        "icon_bg": "bg-secondary-container",
        "text_color": "text-on-secondary-container",
        "project_count": 12,
    },
    {
        "name": "Research Lab",
        "icon": "science",
        "color": "tertiary",
        "icon_bg": "bg-tertiary-container",
        "text_color": "text-on-tertiary-container",
        "project_count": 8,
    },
    {
        "name": "Marketing Suite",
        "icon": "campaign",
        "color": "primary",
        "icon_bg": "bg-primary-container/20",
        "text_color": "text-primary-container",
        "project_count": 24,
    },
]


def _ensure_default_workspaces(user_id):
    """Seed the three demo workspaces for a user if they don't have any yet.

    Runs every time a workspace list is requested but exits as soon as the
    user already has at least one workspace, so the demo data only appears
    the very first time the user reaches the workspace page.
    """
    from bson import ObjectId

    try:
        if workspaces.count_documents({"members": ObjectId(user_id)}) > 0:
            return
    except Exception:
        # Fallback for non-ObjectId user_id values (should not happen in practice)
        if workspaces.count_documents({"members": user_id}) > 0:
            return

    now = datetime.now(timezone.utc)
    docs = []
    for ws_def in DEFAULT_WORKSPACES:
        docs.append(
            {
                "name": ws_def["name"],
                "icon": ws_def["icon"],
                "color": ws_def["color"],
                "icon_bg": ws_def["icon_bg"],
                "text_color": ws_def["text_color"],
                "project_count": ws_def["project_count"],
                "members": [ObjectId(user_id)],
                "created_by": ObjectId(user_id),
                "created_at": now,
                "is_default": True,
            }
        )
    if docs:
        workspaces.insert_many(docs)


# ---------------------------------------------------------------------------
# Team chat seed data (first load only)
# ---------------------------------------------------------------------------
SEED_AVATARS = {
    "sarah": (
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3JUtcg3moj4r_cQvB4Ri9BOznXLxfRi"
        "Zrhx72vT4wqAML0bh4QhkX9uiT3NMK44OpH1NAFfkKyRQDgBj_enXTU5bFd0UzOyDNO2xgbRhW4pAC37k3"
        "yDgD_HwxOh9WwEOoLfao2KSIoY37JBsAKlNP5PpDMUXDYLj7eTTwLZE4VDRRiR0wjtriS4hMHjGa2WAuW"
        "6UOeI0b6zUU8hqf8ODQNCz0yjkA7v5cK221Ky7MVnSUDDyTuPx"
    ),
    "alex": (
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCAFnWYfoEq9wQ5HnshuH1sRAS2TjuZn9c"
        "VA6cD8t1ru3pqEnKxSxa6SCEcjbccrKHeT2L3jqL4Gi0ut_puXudnZAF8YgObI94ql6qRobcOn30q-jAh3"
        "byJ3gTXXqZAIoKAYQONd5-uHy5DdGUQVeQK5wNmbMcFzdfPH56z4CKWSb_bI-OwwcLTN7WMUW5CsxDK9Gq"
        "CSGeT2kTYJEp9QrMM1kVUPCfnN3z7yov7Fg8LTS8Z5YmGMpfK"
    ),
}


def _ensure_seed_messages(channel):
    """Populate a workspace chat with a demo conversation the first time it loads.

    Runs on every chat request but returns immediately once messages exist for
    the channel, so the demo data only appears the very first time a workspace
    is opened.
    """
    if messages.count_documents({"channel": channel}) > 0:
        return

    now = datetime.now(timezone.utc)
    seed = [
        # (minutes ago, sender key, text, status)
        (21, "sarah", "Hey Alex, can you share the latest dashboard updates?", "sent"),
        (19, "alex", "Sure! Here's the latest version of the dashboard we discussed.", "read"),
        (18, "alex", "Attached: Dashboard_v2.fig (Figma File - 12.4 MB)", "read"),
        (17, "sarah", "Looks great! I really like the new neumorphic style.", "sent"),
        (16, "alex", "Thanks! Let me know if you need any changes.", "read"),
        (15, "sarah", "Perfect! We can review this in the standup tomorrow.", "sent"),
        (14, "alex", "I've also attached the latest research report for the Q2 roadmap.", "read"),
        (12, "sarah", "Thanks, Alex! I'll take a look and get back to you before the meeting.", "sent"),
        (11, "alex", "Perfect. Let me know if you have any questions.", "read"),
    ]
    docs = []
    for minutes_ago, sender, text, status in seed:
        docs.append(
            {
                "channel": channel,
                "user_id": "seed-" + sender,
                "username": "Sarah Johnson" if sender == "sarah" else "Alex Morgan",
                "avatar": SEED_AVATARS[sender],
                "text": text,
                "created_at": now - timedelta(minutes=minutes_ago),
                "status": status,
            }
        )
    messages.insert_many(docs)


# ---------------------------------------------------------------------------
# API routes
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    try:
        # Force a real round-trip to MongoDB.
        client.admin.command("ping")
        db_ok = True
    except Exception:
        db_ok = False
    return jsonify(
        {
            "success": True,
            "mongo": db_ok,
            "database": DB_NAME,
            "server": "ok",
        }
    )


@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name:
        return _error("Full name is required.")
    if len(name) > 100:
        return _error("Name must be 100 characters or fewer.")
    if not EMAIL_RE.match(email):
        return _error("Please enter a valid email address.")
    if len(password) < 8:
        return _error("Password must be at least 8 characters long.")
    if len(password) > 128:
        return _error("Password must be 128 characters or fewer.")

    try:
        existing = users.find_one({"email": email})
    except Exception as exc:  # noqa: BLE001 - DB unreachable -> clean JSON
        app.logger.error("Register lookup failed: %s", exc)
        return _error("Could not reach the database. Please try again later.", 500)

    if existing:
        return _error("An account with this email already exists.", 409)

    from datetime import datetime

    user_doc = {
        "name": name,
        "email": email,
        "password_hash": generate_password_hash(password),
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    try:
        result = users.insert_one(user_doc)
    except DuplicateKeyError:
        return _error("An account with this email already exists.", 409)
    except Exception as exc:  # noqa: BLE001 - surface DB errors to the client
        app.logger.error("Register failed: %s", exc)
        return _error("Could not create the account. Please try again later.", 500)

    # Auto-login after a successful registration.
    from bson import ObjectId

    user = users.find_one({"_id": result.inserted_id})
    session.clear()
    session["user_id"] = str(user["_id"])

    return (
        jsonify(
            {"success": True, "message": "Account created successfully.", "user": _user_public(user)}
        ),
        201,
    )
@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return _error("Email and password are required.")

    try:
        user = users.find_one({"email": email})
    except Exception as exc:  # noqa: BLE001 - DB unreachable -> clean JSON
        app.logger.error("Login lookup failed: %s", exc)
        return _error("Could not reach the database. Please try again later.", 500)

    if not user or not check_password_hash(user["password_hash"], password):
        # Same message for both cases — don't reveal which field was wrong.
        return _error("Invalid email or password.", 401)

    # Regenerate the session to protect against session-fixation attacks.
    session.clear()
    session["user_id"] = str(user["_id"])

    return jsonify(
        {"success": True, "message": "Login successful.", "user": _user_public(user)}
    )


@app.get("/api/me")
def me():
    from bson import ObjectId
    from bson.errors import InvalidId

    user_id = session.get("user_id")
    if not user_id:
        return _error("Not authenticated.", 401)

    try:
        try:
            user = users.find_one({"_id": ObjectId(user_id)})
        except InvalidId:
            user = None
    except Exception as exc:  # noqa: BLE001 - DB unreachable -> clean JSON
        app.logger.error("me lookup failed: %s", exc)
        return _error("Not authenticated.", 401)

    if not user:
        session.clear()
        return _error("Not authenticated.", 401)

    payload = {"success": True, "user": _user_public(user)}

    # Attach the currently selected workspace (if any) so the frontend can
    # show the right context without an extra round-trip.
    workspace_id = session.get("workspace_id")
    if workspace_id:
        try:
            try:
                ws = workspaces.find_one({"_id": ObjectId(workspace_id)})
            except InvalidId:
                ws = None
            if ws and user_id in [str(m) for m in ws.get("members", [])]:
                payload["workspace"] = _workspace_public(ws)
            else:
                session.pop("workspace_id", None)
                payload["workspace"] = None
        except Exception:
            payload["workspace"] = None
    else:
        payload["workspace"] = None

    return jsonify(payload)


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out."})


# ---------------------------------------------------------------------------
# Workspaces
# ---------------------------------------------------------------------------
@app.get("/api/workspaces")
def list_workspaces():
    """List all workspaces the current user is a member of.

    Seeds the three default demo workspaces the first time a brand new user
    lands on the workspace page, so the UI always has something to show.
    """
    from bson import ObjectId

    user_id = session.get("user_id")
    if not user_id:
        return _error("Not authenticated.", 401)

    try:
        _ensure_default_workspaces(user_id)
        found = list(
            workspaces.find({"members": ObjectId(user_id)}).sort("created_at", ASCENDING)
        )
    except Exception as exc:  # noqa: BLE001 - surface DB errors to the client
        app.logger.error("list_workspaces failed: %s", exc)
        return _error("Could not load workspaces. Please try again later.", 500)

    return jsonify(
        {
            "success": True,
            "workspaces": [_workspace_public(ws) for ws in found],
        }
    )


@app.post("/api/workspaces")
def create_workspace():
    """Create a new empty workspace owned by the current user and select it."""
    from bson import ObjectId

    user_id = session.get("user_id")
    if not user_id:
        return _error("Not authenticated.", 401)

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return _error("Workspace name is required.")
    if len(name) > 100:
        return _error("Workspace name must be 100 characters or fewer.", 400)

    icon = (data.get("icon") or "workspace_preset").strip() or "workspace_preset"
    color = (data.get("color") or "primary").strip() or "primary"

    # Map the chosen color to the matching Tailwind/CSS classes used by the
    # workspace cards so the frontend can render consistent neumorphic icons.
    palette = {
        "primary": ("bg-primary-container/20", "text-primary-container"),
        "secondary": ("bg-secondary-container", "text-on-secondary-container"),
        "tertiary": ("bg-tertiary-container", "text-on-tertiary-container"),
    }
    icon_bg, text_color = palette.get(color, palette["primary"])

    now = datetime.now(timezone.utc)
    doc = {
        "name": name,
        "icon": icon,
        "color": color,
        "icon_bg": icon_bg,
        "text_color": text_color,
        "project_count": 0,
        "members": [ObjectId(user_id)],
        "created_by": ObjectId(user_id),
        "created_at": now,
        "is_default": False,
    }

    try:
        result = workspaces.insert_one(doc)
    except Exception as exc:  # noqa: BLE001 - surface DB errors to the client
        app.logger.error("create_workspace failed: %s", exc)
        return _error("Could not create the workspace. Please try again later.", 500)

    doc["_id"] = result.inserted_id
    # Selecting a workspace stores its ID in the session so the dashboard
    # automatically loads its chat and context on the next page.
    session["workspace_id"] = str(result.inserted_id)

    return (
        jsonify(
            {
                "success": True,
                "message": "Workspace created.",
                "workspace": _workspace_public(doc),
            }
        ),
        201,
    )


@app.post("/api/workspaces/select")
def select_workspace():
    """Mark an existing workspace as the active one for this session."""
    from bson import ObjectId
    from bson.errors import InvalidId

    user_id = session.get("user_id")
    if not user_id:
        return _error("Not authenticated.", 401)

    data = request.get_json(silent=True) or {}
    workspace_id = (data.get("workspace_id") or "").strip()
    if not workspace_id:
        return _error("Workspace ID is required.")

    try:
        try:
            ws = workspaces.find_one({"_id": ObjectId(workspace_id)})
        except InvalidId:
            ws = None
    except Exception as exc:  # noqa: BLE001 - surface DB errors to the client
        app.logger.error("select_workspace failed: %s", exc)
        return _error("Could not select the workspace. Please try again later.", 500)

    if not ws:
        return _error("Workspace not found.", 404)

    member_ids = [str(m) for m in ws.get("members", [])]
    if user_id not in member_ids:
        return _error("You don't have access to this workspace.", 403)

    session["workspace_id"] = workspace_id
    return jsonify({"success": True, "workspace": _workspace_public(ws)})


@app.get("/api/workspaces/current")
def get_current_workspace():
    """Return the workspace currently stored in the session, or null."""
    from bson import ObjectId
    from bson.errors import InvalidId

    user_id = session.get("user_id")
    if not user_id:
        return _error("Not authenticated.", 401)

    workspace_id = session.get("workspace_id")
    if not workspace_id:
        return jsonify({"success": True, "workspace": None})

    try:
        try:
            ws = workspaces.find_one({"_id": ObjectId(workspace_id)})
        except InvalidId:
            ws = None
    except Exception:
        ws = None

    if not ws or user_id not in [str(m) for m in ws.get("members", [])]:
        session.pop("workspace_id", None)
        return jsonify({"success": True, "workspace": None})

    return jsonify({"success": True, "workspace": _workspace_public(ws)})


# ---------------------------------------------------------------------------
# Team workspace chat
# ---------------------------------------------------------------------------
@app.get("/api/chat/messages")
def chat_messages():
    user_id = session.get("user_id")
    if not user_id:
        return _error("Not authenticated.", 401)

    workspace_id = session.get("workspace_id")
    if not workspace_id:
        return _error("No workspace selected. Pick a workspace first.", 400)
    channel = _workspace_channel(workspace_id)

    try:
        _ensure_seed_messages(channel)
        # Viewing the thread marks messages from other users as read.
        messages.update_many(
            {"channel": channel, "user_id": {"$ne": user_id}, "status": "sent"},
            {"$set": {"status": "read"}},
        )
        found = list(
            messages.find({"channel": channel})
            .sort("created_at", ASCENDING)
            .limit(200)
        )
    except Exception as exc:  # noqa: BLE001 - surface DB errors to the client
        app.logger.error("chat_messages failed: %s", exc)
        return _error("Could not load messages. Please try again later.", 500)

    return jsonify(
        {"success": True, "messages": [_chat_message_public(m) for m in found]}
    )


@app.post("/api/chat/messages")
def chat_send_message():
    user_id = session.get("user_id")
    if not user_id:
        return _error("Not authenticated.", 401)

    workspace_id = session.get("workspace_id")
    if not workspace_id:
        return _error("No workspace selected. Pick a workspace first.", 400)
    channel = _workspace_channel(workspace_id)

    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return _error("Message text is required.")
    if len(text) > 2000:
        return _error("Message is too long (max 2000 characters).", 413)

    try:
        _ensure_seed_messages(channel)

        from bson import ObjectId

        user = users.find_one({"_id": ObjectId(user_id)})
        if not user:
            session.clear()
            return _error("Not authenticated.", 401)

        created_at = datetime.now(timezone.utc)
        doc = {
            "channel": channel,
            "user_id": user_id,
            "username": user.get("name") or "Team Member",
            "avatar": "",
            "text": text,
            "created_at": created_at,
            "status": "sent",
        }
        result = messages.insert_one(doc)
        doc["_id"] = result.inserted_id
    except Exception as exc:  # noqa: BLE001 - surface DB errors to the client
        app.logger.error("chat_send_message failed: %s", exc)
        return _error("Could not send the message. Please try again later.", 500)

    return jsonify({"success": True, "message": _chat_message_public(doc)}), 201


# ---------------------------------------------------------------------------
# Static Frontend
# ---------------------------------------------------------------------------
@app.get("/")
def index():
    return redirect("/Frontend/Create_account/create.html")


@app.get("/Frontend/<path:filename>")
def frontend_files(filename):
    response = send_from_directory(FRONTEND_DIR, filename)
    # Prevent the browser from caching pages/scripts so stale login code
    # can never cause confusing errors.
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


if __name__ == "__main__":
    print(f"  MongoDB : {MONGO_URI}  database: {DB_NAME}")
    print(f"  Frontend: {FRONTEND_DIR}")
    print(f"  Server  : http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=True)