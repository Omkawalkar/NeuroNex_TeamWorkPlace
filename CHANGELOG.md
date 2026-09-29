# NeuroNex Change Log

## [2.0.0] - 2026-09-18

### Backend (FastAPI + SQLAlchemy + SQLite)

#### New Models (`Backend/models.py`)
- **SavedItem** — persist bookmarked documents, tasks, presentations; `item_type` + `item_id` + `metadata` fields.
- **Presentation** — `title`, `description`, `category`, `slides`, `author`, `views`, `file_name`, `avatar_url`.
- **Meeting** — `title`, `join_code`, `date`, `start_time`, `end_time`, `host`, `status`, `participants` (JSON).
- **Notification** — `message`, `type` (info/warning/success), `is_read`, `link` URL.
- **Workspace** — added `color` and `icon` fields with `SCHEMA_PATCHES` migration for existing tables.

#### New Schemas (`Backend/schemas.py`)
- `SavedItemSchema`, `SavedItemCreate`, `SavedItemResponse`
- `PresentationSchema`, `PresentationCreate`, `PresentationResponse`
- `MeetingSchema`, `MeetingCreate`, `MeetingResponse`
- `NotificationSchema`, `NotificationCreate`, `NotificationResponse`
- Updated `WorkspaceSchema` to include `color`/`icon`; `ChatMessageResponse` to include `message_type`/`metadata`.

#### New Routers (`Backend/routers.py`)
- **saved_router** (`/api/saved`) — `GET` (list by workspace), `POST` (create bookmarked item), `DELETE /{id}` (remove).
- **presentations_router** (`/api/presentations`) — `GET` (list by workspace), `POST` (multipart upload via `UploadFile`), `DELETE /{id}`, `POST /{id}/view` (increment view count).
- **meetings_router** (`/api/meetings`) — `GET` (list filtered by date query), `GET /{code}` (resolve by join code), `POST` (create ad-hoc meeting), `POST /{code}/end` (end meeting).
- **notifications_router** (`/api/notifications`) — `GET` (list by workspace), `POST` (create), `PATCH /{id}/read` (mark as read).
- **upload_router** (`/api/upload`) — generic `POST` multipart endpoint for documents/chat files.

#### App Startup (`Backend/app.py`)
- Added `SCHEMA_PATCHES` dict with `ALTER TABLE` statements for backward-compatible schema migrations.
- `_run_schema_patches()` function runs at startup to add missing columns to existing SQLite tables.
- Upload directories created (`Backend/uploads/{documents,presentations,chat,avatars}/`) and served at `/uploads` via `StaticFiles`.
- All new routers included in the FastAPI app.
- WebSocket connection manager extended with presence tracking.

#### Real-time Presence (`Backend/realtime.py`)
- `ConnectionManager` extended with `presence` dict: `{workspace_id: {user_id: count}}`.
- `/ws/{workspace_id}` WebSocket endpoint handles `presence_join` and `presence_leave` messages, broadcasts `presence_update` events to all connected clients.

---

### Frontend

#### Global Conventions
- **LocalStorage whitelist**: `neuronex_dummy_id`, `neuronex_user_id`, `neuronex_user_name`, `neuronex_user_email`, `neuronex_user_avatar`, `neuronex_theme` — all other keys removed from frontend code.
- **Auth header**: `X-Current-User-Dummy-ID` sent with every API request; user resolved from `neuronex_dummy_id`.
- **Toast system**: All `alert()` calls replaced with neumorphic toast notifications (`nn-toast`, `nn-toast-success`, `nn-toast-error`).
- **Per-file IIFE**: Each `.js` file wraps logic in an IIFE with a local `nnGetUser()` helper — no shared global state.
- **3-file separation**: `.html` (structure only), `.css` (styling only), `.js` (logic + Tailwind config), no inline `<style>`/`<script>`.

#### Create Account (`create.js` + `create.html`)
- `redirectIfLoggedIn()` re-enabled — users with a valid `neuronex_dummy_id` are redirected to Dashboard.

#### Dashboard (`dashboard.js` + `dashboard.html`)
- Fixed `neuronex_name` → `neuronex_user_name` in `sendTypingStatus` and user header rendering.
- Added `nnGetUser()` helper at top of main IIFE.
- WebSocket connection sends `presence_join` on connect; handles `presence_update` events with dynamic `renderPresence()`.
- **Forward Modal**: HTML markup added (`forward-modal`, `forward-recipient`, `forward-msg-preview`, `forward-cancel`, `forward-send`); handler in `dashboard.js` posts forwarded message via WebSocket.
- **Notification Bell**: Wired to `GET /api/notifications`; displays unread count badge; click opens notification panel.
- **Team Highlights**: Dynamically loaded from `GET /api/saved` API instead of hardcoded HTML.

#### Dashboard Members (`dashboard-members.js`)
- Tightened invite input selectors to use explicit IDs (`invite-email-input`, `invite-btn-modal`, `member-list`).
- Added `nnToast()` helper replacing all `alert()` calls.
- `nnGetUser()` helper added for consistent user data access.

#### Workspace (`workspace.js`)
- Color persistence: workspace color restored from `localStorage` key `neuronex_color_<id>`.
- Added `nnGetUser()` helper.
- Defensive error handling in `selectAndOpen` — returns `{id, message}` on failure.
- **Admin DELETE workspace button**: Added handler that calls `DELETE /api/workspaces/{id}` and removes the card from the DOM.

#### Document (`document.js`)
- Fixed broken `escapeHtml()` — was an identity function (replaced `&` with `&` instead of `&amp;`); now uses DOM `textContent` for proper XSS-safe escaping.
- Fixed `neuronex_name` → `neuronex_user_name` in author field.
- Toolbar `execCommand` wiring confirmed (B/I/U → bold/italic/underline).

#### New Document (`new_document.js`)
- `saveToSavedItems()`: now POSTs to `POST /api/saved` with proper payload instead of writing to `localStorage`.
- Fixed `neuronex_name` → `neuronex_user_name` in author input.
- Removed `SAVED_ITEMS_KEY` and `ITEMS_PER_PAGE` constants (no more localStorage persistence for saved items).

#### Tasks (`Task.js`)
- `saveToSavedItems()`: now POSTs to `POST /api/saved` API instead of `localStorage`.
- Removed ADMIN hack (`dummyId.toUpperCase().includes('ADMIN')`) from `checkAdminPermission()` — admin status now only resolves from workspace `created_by_user_id` or member role of `ADMIN`.
- Replaced all `alert()` calls with `nnToast()` notifications.
- Added `nnGetUser()` helper.
- Pagination already absent (all tasks loaded at once).

#### Presentation (`presentation.js`)
- Removed `DEFAULT_PRESENTATIONS` and `PPT_STORAGE_KEY` — presentations now fetched from `GET /api/presentations?workspace_id=`.
- New `loadPresentations()` function calls the API.
- Upload form uses `FormData` (multipart) to `POST /api/presentations` with file attachment.
- `incrementView()` function calls `POST /api/presentations/{id}/view`.
- `deletePresentationApi()` calls `DELETE /api/presentations/{id}`.
- `saveToSavedItems()` POSTs to `POST /api/saved`.
- Bookmark buttons update via API, not localStorage.
- Fixed `neuronex_name` → `neuronex_user_name` in author input.
- Added `nnGetUser()` and `nnToast()` helpers.

#### Meeting (`meeting.js`)
- Removed hardcoded date array and static meeting data.
- `fetchMeetings()` calls `GET /api/meetings?workspace_id=&date=` (ISO date).
- Prev/Next/Today date navigation buttons wired to fetch meetings for selected date.
- Instant meeting button creates a meeting via `POST /api/meetings` then redirects to `meet.html`.
- New meeting dropdown wired with click handlers.
- Added `nnGetUser()` and `nnToast()` helpers.

#### Meet Room (`meet.js`)
- Reads `?code=` URL parameter to resolve meeting.
- `loadMeeting()` calls `GET /api/meetings/{code}` to fetch meeting details.
- `updateParticipants()` renders dynamic participant list from API response.
- `updateMeetingInfo()` populates title, join code, and status from API.
- Merge Participants button triggers `nnToast()`.
- End Call button POSTs to `/api/meetings/{code}/end`.
- Added `nnGetUser()` and `nnToast()` helpers.

#### Saved Items (`Save.js`)
- Removed `DEFAULT_SAVED_ITEMS` and `SAVED_ITEMS_KEY` — saved items now fetched from `GET /api/saved?workspace_id=`.
- `loadSavedItems()` calls the API and maps `item_type` to display type.
- `deleteSavedItem()` calls `DELETE /api/saved/{id}`.
- Unbookmark buttons call API delete and re-render.
- Card click routing updated to use `item_type` (`document` → `document.html?id=`, `presentation` → `presentation.html?open=`, `task` → `Task.html`).
- Fixed `neuronex_name` references (if any) to `neuronex_user_name`.
- Added `nnGetUser()` and `nnToast()` helpers.

---

### Design System (Unchanged)
- Primary color: `#593bce`
- Surface: `#faf8ff`
- Dashboard background: `#F5F4FC`
- Neumorphic shadows, Inter font, Material Symbols — all preserved.
