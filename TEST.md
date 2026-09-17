# NeuroNex — Test Guide

## Prerequisites

1. Backend running on `http://localhost:8000`
   ```bash
   cd Backend
   pip install -r requirements.txt
   python app.py
   ```
2. Frontend served via live-server or any static server on a different port (e.g., `5500`)
3. Browser console open for error checking

---

## 1. Authentication

### Test: Redirect if already logged in
1. Set `neuronex_dummy_id` in browser console:
   ```js
   localStorage.setItem('neuronex_dummy_id', 'NN-ADMIN-001');
   localStorage.setItem('neuronex_user_id', '1');
   localStorage.setItem('neuronex_user_name', 'Test User');
   ```
2. Navigate to `Frontend/Create_account/create.html`
3. **Expected**: Immediately redirected to `../Dashboard/dashboard.html`

### Test: Login flow
1. Navigate to `create.html` with no `neuronex_dummy_id` in localStorage.
2. Click "Sign In" with any valid dummy ID (e.g., `NN-ADMIN-001`).
3. **Expected**: Redirected to Dashboard; `neuronex_dummy_id` and `neuronex_user_id` are persisted.

---

## 2. Backend API Tests (curl)

### Schema Migration (auto-runs at startup)
```bash
curl -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
     http://localhost:8000/api/workspaces/1
```
**Expected**: Returns workspace JSON including `color` and `icon` fields.

### Saved Items
```bash
# Create a saved item
curl -X POST http://localhost:8000/api/saved \
  -H "Content-Type: application/json" \
  -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
  -d '{"workspace_id":1,"title":"Test Saved","item_type":"task","item_id":"42","author":"Tester"}'

# List saved items
curl -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
     "http://localhost:8000/api/saved?workspace_id=1"

# Delete a saved item
curl -X DELETE http://localhost:8000/api/saved/1 \
  -H "X-Current-User-Dummy-ID: NN-ADMIN-001"
```

### Presentations
```bash
# List presentations
curl -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
     "http://localhost:8000/api/presentations?workspace_id=1"

# Upload a presentation (multipart)
curl -X POST http://localhost:8000/api/presentations \
  -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
  -F "title=Test Deck" \
  -F "description=A test presentation" \
  -F "category=all" \
  -F "slides=10" \
  -F "author=Tester" \
  -F "workspace_id=1" \
  -F "file=@/path/to/test.pptx"

# Increment view count
curl -X POST http://localhost:8000/api/presentations/1/view \
  -H "X-Current-User-Dummy-ID: NN-ADMIN-001"

# Delete a presentation
curl -X DELETE http://localhost:8000/api/presentations/1 \
  -H "X-Current-User-Dummy-ID: NN-ADMIN-001"
```

### Meetings
```bash
# List meetings for today
curl -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
     "http://localhost:8000/api/meetings?workspace_id=1&date=$(date +%F)"

# Get meeting by code
curl -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
     "http://localhost:8000/api/meetings/MEET-ABC123"

# Create a meeting
curl -X POST http://localhost:8000/api/meetings \
  -H "Content-Type: application/json" \
  -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
  -d '{"workspace_id":1,"title":"Test Meeting","date":"2026-09-18","time":"14:00"}'
```

### Notifications
```bash
# List notifications
curl -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
     "http://localhost:8000/api/notifications?workspace_id=1"

# Create a notification
curl -X POST http://localhost:8000/api/notifications \
  -H "Content-Type: application/json" \
  -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
  -d '{"workspace_id":1,"message":"Test notification","type":"info"}'
```

### Upload
```bash
# Generic file upload
curl -X POST http://localhost:8000/api/upload \
  -H "X-Current-User-Dummy-ID: NN-ADMIN-001" \
  -F "file=@/path/to/document.pdf"
```

---

## 3. WebSocket Presence

```bash
# Connect to WebSocket (requires a websocket client or browser)
wscat -c "ws://localhost:8000/ws/1" \
  -H "X-Current-User-Dummy-ID: NN-ADMIN-001"
# Send: {"type": "presence_join", "user_id": 1, "user_name": "Test User"}
# Expected: receive {"type":"presence_update","workspace_id":1,"presence":{"1":1}}
```

---

## 4. Frontend UI Tests

### Dashboard
1. Navigate to Dashboard.
2. **Team Highlights**: Should load from `/api/saved` API (no default items).
3. **Notification Bell**: Should show badge with unread count from `/api/notifications`.
4. **Presence Sidebar**: Should update in real-time when users join/leave.
5. **Forward Modal**: Click context menu "Forward" on a chat message → modal appears with recipient input.

### Tasks (New Task page)
1. Navigate to `New_task/Task.html`.
2. **Admin Check**: Only users with `role: ADMIN` or `created_by` see "New Task" button.
3. Create a task → POST to `/api/tasks`.
4. Bookmark a task → calls `POST /api/saved`, shows toast (not alert).
5. Delete a task (Admin only) → calls `DELETE /api/tasks/{id}`.

### Document Editor
1. Navigate to `Document/document.html`.
2. Edit content, click "Save" → POST to `/api/documents`.
3. Toolbar buttons (B/I/U) → call `document.execCommand()`.
4. Author field is populated from `neuronex_user_name`.

### Presentations
1. Navigate to `Presentation/presentation.html`.
2. Presentations loaded from `GET /api/presentations` (no localStorage defaults).
3. Upload a PPT → multipart POST to `/api/presentations`.
4. Bookmark a deck → POST to `/api/saved`, toast notification.
5. Delete a deck → DELETE `/api/presentations/{id}`.

### Meetings
1. Navigate to `Meeting/meeting.html`.
2. Meetings for the current date are loaded from `GET /api/meetings?date=`.
3. Prev/Next/Today buttons change the date and reload.
4. Instant Meeting button → POST `/api/meetings` → redirect to `meet.html`.

### Meet Room
1. Navigate to `meet_place/meet.html?code=MEET-ABC123`.
2. Meeting details loaded from `GET /api/meetings/MEET-ABC123`.
3. Participants list rendered from API response.
4. End Call button → POST `/api/meetings/{code}/end`.

### Saved Items
1. Navigate to `Save'd_item's/Save.html`.
2. Saved items loaded from `GET /api/saved` (no localStorage defaults).
3. Unbookmark → DELETE `/api/saved/{id}`, card removed with animation.
4. Click a card → navigate based on `item_type`:
   - `document` → `document.html?id={item_id}`
   - `presentation` → `presentation.html?open={item_id}`
   - `task` → `Task.html`

---

## 5. Console / Lint Checks

```bash
# Backend syntax check
python -m py_compile Backend/app.py
python -m py_compile Backend/routers.py
python -m py_compile Backend/models.py

# Frontend JS syntax (Node)
node --check Frontend/Dashboard/dashboard.js
node --check Frontend/Dashboard/dashboard-members.js
node --check Frontend/New_task/Task.js
node --check Frontend/Presentation/presentation.js
node --check Frontend/Meeting/meeting.js
node --check Frontend/meet_place/meet.js
node --check Frontend/Save\'s_item\'s/Save.js
node --check Frontend/Document/document.js
node --check Frontend/New_Document/new_document.js
node --check Frontend/Workspace/workspace.js
node --check Frontend/Create_account/create.js
```

---

## 6. LocalStorage Whitelist Verification

In browser console, verify only whitelisted keys exist:
```js
Object.keys(localStorage).filter(k => k.startsWith('neuronex_'))
```
**Expected**: Only `neuronex_dummy_id`, `neuronex_user_id`, `neuronex_user_name`, `neuronex_user_email`, `neuronex_user_avatar`, `neuronex_theme`.
