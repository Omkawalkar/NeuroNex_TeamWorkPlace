# NeuroNex Backend

Python (Flask) backend for the NeuroNex team workspace with MongoDB-backed
authentication: **Create Account** and **Login**.

## Requirements

- Python 3.10+
- MongoDB running locally (`mongodb://localhost:27017/`)

## Setup

```bash
cd Backend
pip install -r requirements.txt
```

Optional: copy `.env.example` to `.env` and adjust the MongoDB URI / secret key.

## Run

```bash
python app.py
```

Then open: **http://localhost:5000**

The server serves both the API and the static frontend pages:

| Route | Description |
|---|---|
| `POST /api/register` | Create an account (`name`, `email`, `password`) → auto-login |
| `POST /api/login` | Log in (`email`, `password`) |
| `GET /api/me` | Current logged-in user (401 if not logged in) |
| `POST /api/logout` | Log out |
| `GET /api/chat/messages` | Fetch all team chat messages (oldest → newest) |
| `POST /api/chat/messages` | Send a team chat message (`text`) — persists in MongoDB |
| `GET /api/health` | Server + MongoDB status |
| `/` | Redirects to the login/create-account page |

## Notes

- Passwords are hashed with Werkzeug (`scrypt`-based) — never stored in plain text.
- Sessions use signed HTTP-only cookies.
- The `users` collection lives in the `neuronex` database with a unique index on `email`.
- Always open the app through the Flask server (`http://localhost:5000`) so the
  API calls resolve correctly — do not double-click the HTML files.