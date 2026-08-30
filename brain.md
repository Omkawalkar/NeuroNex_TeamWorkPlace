# NeuroNex AI Knowledge & System Architecture (brain.md)

> **MANDATORY INSTRUCTIONS FOR AI ASSISTANTS**
> When any AI reads this file, it MUST strictly adhere to the following rules:
> 1. **Zero Unintended Design Changes:** Do **NOT** alter the UI/UX design, Tailwind configurations, color palettes (`primary: #593bce`, `surface: #faf8ff`, `dashboard-bg: #F5F4FC`), neumorphic shadow styles (`neu-raised`, `neu-inset`, `neu-pressed`), typography (`Inter`), Material Symbol icons, component dimensions, or visual aesthetics.
> 2. **Maintain 3-File Code Separation:** Every frontend module MUST keep code cleanly separated across three dedicated files: `.html` (structure only), `.css` (styling rules), and `.js` (logic & Tailwind config). Do NOT insert inline `<style>` or inline `<script>` tags into `.html` files.
> 3. **Strict Page Interconnection Graph:** Preserve the complete auth-to-workspace-to-dashboard pipeline and all page interconnections specified in this document.

---

## 1. Application Overview & Technology Stack

**NeuroNex** is an all-in-one collaborative team workspace application featuring real-time team chat, workspace management, document libraries, task tracking, presentation slides, meeting scheduling, and live video meeting rooms.

### Technology Stack:
- **Backend:** Python (Flask), Flask-CORS, PyMongo, Werkzeug Security (password hashing), Python-Dotenv.
- **Database:** MongoDB (`DB_NAME: neuronex`, Collections: `users`, `messages`).
- **Frontend:** HTML5, Vanilla JavaScript (ES6+), Tailwind CSS (via CDN), Material Symbols Outlined, Google Fonts (Inter).

---

## 2. Complete Application Directory Structure

```
NeuroNex_TeamWorkPlace/
├── Backend/
│   ├── app.py                     # Flask backend, MongoDB connection, API routes & static file server
│   ├── requirements.txt           # Dependencies (Flask, pymongo, werkzeug, flask-cors, python-dotenv)
│   ├── .env.example               # Environment variables configuration template
│   └── server.err.log             # Backend execution log file
├── Frontend/
│   ├── Create_account/            # Step 1: Authentication Module
│   │   ├── create.html            # Login & Account Creation UI
│   │   ├── create.css             # Auth card flip & neumorphic styles
│   │   └── create.js              # Auth API handlers & redirect to workspace.html
│   ├── WorkSpace/                 # Step 2: Workspace Selection Module
│   │   ├── workspace.html         # Workspace choice & creation screen
│   │   ├── workspace.css          # Workspace cards & neumorphic design
│   │   └── workspace.js           # Auth check & navigation to dashboard.html
│   ├── Dashboard/                 # Step 3: Main Workspace Dashboard (Hub)
│   │   ├── dashboard.html         # Main dashboard layout, cards & chat sidebar
│   │   ├── dashboard.css          # Dashboard layout & neumorphic shadow utility styles
│   │   └── dashboard.js           # Real-time team chat polling, dropdowns & modals
│   ├── New_Document/              # Sub-Module: Document Library Workspace
│   │   ├── new_document.html      # Workspace document library grid
│   │   ├── new_document.css       # Neumorphic card & scrollbar styles
│   │   └── new_document.js        # Auth check & Tailwind configuration
│   ├── Document/                  # Sub-Module: Document Reader & Viewer
│   │   ├── document.html          # Document viewer & editor interface
│   │   ├── document.css           # Document viewer styles
│   │   └── document.js            # Document interactivity script
│   ├── Meeting/                   # Sub-Module: Meeting Schedule & Dashboard
│   │   ├── meeting.html           # Meeting schedule, date picker & call options
│   │   ├── meeting.css            # Neumorphic styles & icon fill rules
│   │   └── meeting.js             # Auth check, dropdowns, date picker & modal script
│   ├── New_task/                  # Sub-Module: Task Management Workspace
│   │   ├── Task.html              # Task lists, task creation & status boards
│   │   ├── Task.css               # Task board neumorphic styles
│   │   └── Task.js                # Task management & auth check script
│   ├── Presentation/              # Sub-Module: Slide Presentation Module
│   │   ├── presentation.html      # Presentation deck & slide viewer
│   │   ├── presentation.css       # Presentation deck styles
│   │   └── presentation.js        # Presentation controls & auth check script
│   ├── Save'd_item's/             # Sub-Module: Saved & Bookmarked Items
│   │   ├── Save.html              # Bookmarks archive & saved resources
│   │   ├── Save.css               # Bookmarks archive styles
│   │   └── Save.js                # Bookmarks filter & auth check script
│   └── meet_place/                # Sub-Module: Live Video Conference Room
│       ├── meet.html              # Real-time video call & meeting room UI
│       ├── meet.css               # Video grid & call controls styling
│       └── meet.js                # Video call controls & room session script
└── brain.md                       # AI memory, file map & architectural directives
```

---

## 3. Mandatory User Flow & Navigation Pipeline

### 3.1 Primary Entry & Session Pipeline:
```
[ 1. Root / Login ]            [ 2. Workspace Selection ]         [ 3. Main Dashboard Hub ]
  /Frontend/Create_account/   --->   /Frontend/WorkSpace/      --->   /Frontend/Dashboard/
      create.html                        workspace.html                    dashboard.html
```

1. **Authentication (`create.html`)**: User logs in (`POST /api/login`) or registers (`POST /api/register`). If session is valid (`GET /api/me`), user is redirected to **`workspace.html`**.
2. **Workspace Selection (`workspace.html`)**: User selects or creates a workspace. Session checked via `/api/me` (redirects to `create.html` if unauthenticated). Selecting a workspace navigates to **`dashboard.html`**.
3. **Main Dashboard (`dashboard.html`)**: Primary hub featuring live persisted team chat, navigation cards, profile & notification dropdowns.

### 3.2 Dashboard Page Connections (Sub-Module Interconnections):
From **`dashboard.html`**, users can navigate directly to all sub-modules:

| Action Button / Card on Dashboard | Target Sub-Module HTML Path |
| :--- | :--- |
| **New Document** (Quick Access Button) | `/Frontend/New_Document/new_document.html` |
| **Task** (Quick Access Button) | `/Frontend/New_task/Task.html` |
| **PPT** (Quick Access Button) | `/Frontend/Presentation/presentation.html` |
| **Meetings** (Quick Access Button) | `/Frontend/Meeting/meeting.html` |
| **Saved** (Quick Access Button) | `/Frontend/Save'd_item's/Save.html` |
| **Document Tag / Document Card** | `/Frontend/Document/document.html` |
| **Start Instant Meeting** | `/Frontend/meet_place/meet.html` |

### 3.3 Back Navigation:
Every sub-module page (`meeting.html`, `new_document.html`, `Task.html`, `presentation.html`, `Save.html`, `document.html`, `meet.html`) contains a back button (`arrow_back`) that navigates directly back to `/Frontend/Dashboard/dashboard.html`.

---

## 4. Backend API Reference (`Backend/app.py`)

All API routes communicate in JSON format and require session credentials (`credentials: 'include'`).

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/health` | `GET` | Health check endpoint returning Flask server & MongoDB connectivity status. |
| `POST /api/register` | `POST` | Creates a new user account (`name`, `email`, `password`) & establishes session. |
| `POST /api/login` | `POST` | Authenticates user credentials & establishes session. |
| `GET /api/me` | `GET` | Validates session & returns current public user profile (or 401 Unauthorized). |
| `POST /api/logout` | `POST` | Clears current user session cookie. |
| `GET /api/chat/messages` | `GET` | Retrieves team workspace chat history (requires authentication). |
| `POST /api/chat/messages` | `POST` | Inserts a new chat message into team chat (requires authentication). |
| `GET /` | `GET` | Root route. Automatically redirects to `/Frontend/Create_account/create.html`. |
| `GET /Frontend/<path>` | `GET` | Static file server with `Cache-Control: no-cache` header. |

---

## 5. Strict Guidelines & Constraints for Future AI Tasks

1. **Design Protection:**
   - NEVER alter Tailwind color definitions (`primary`, `surface`, `dashboard-bg`, `background`), Material Symbol icons, font families (`Inter`), padding, margins, card radii, or neumorphic shadow effects (`neu-raised`, `neu-inset`, `neu-pressed`).
   - Do NOT change the layout or visual appearance of any page.

2. **3-File Architecture Enforcement:**
   - Every module directory in `Frontend/` MUST keep separate `.html`, `.css`, and `.js` files.
   - Do NOT embed inline `<style>` blocks or inline `<script>` blocks in HTML files.

3. **Routing & Session Consistency:**
   - Maintain the strict auth pipeline (`Login -> Workspace -> Dashboard -> Sub-modules`).
   - Ensure all `fetch` calls to backend endpoints pass `{ credentials: 'include' }` so session cookies function properly across origins.

4. **No Code Loss:**
   - Do NOT delete existing components, modal handlers, dropdown listeners, or navigation routes during future edits.
