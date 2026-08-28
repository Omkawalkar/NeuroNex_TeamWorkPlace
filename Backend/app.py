"""
NeuroNex backend — Login & Account creation with MongoDB.

Run:
    python app.py

Routes:
    POST /api/register   Create a new account (name, email, password) and log in
    POST /api/login      Log in with email + password
    GET  /api/me         Return the logged-in user (or 401)
    POST /api/logout     Log out
    GET  /api/health     Server + MongoDB connectivity check
    /                    Serves the static Frontend pages
"""

import os
import re

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
    user_id = session.get("user_id")
    if not user_id:
        return _error("Not authenticated.", 401)

    from bson import ObjectId
    from bson.errors import InvalidId

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

    return jsonify({"success": True, "user": _user_public(user)})


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out."})


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