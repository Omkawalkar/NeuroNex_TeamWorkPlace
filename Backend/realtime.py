"""
Real-time updates for NeuroNex via WebSockets.

Clients (e.g. the workspace dashboard) connect to /ws/{workspace_id} and
receive a JSON event whenever the member list of that workspace changes
(invite, role change, removal) or when a new chat message is sent,
so every open dashboard stays in sync without polling or reloading the page.
"""

import json
from typing import Dict, List, Optional

from fastapi import WebSocket


class ConnectionManager:
    """Tracks active WebSocket connections per workspace + presence data."""

    def __init__(self) -> None:
        self._connections: Dict[int, List[WebSocket]] = {}
        self._presence: Dict[int, Dict[int, int]] = {}

    async def connect(self, workspace_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.setdefault(workspace_id, []).append(websocket)
        print(f"[WS] client connected to workspace {workspace_id}")

    def disconnect(self, workspace_id: int, websocket: WebSocket) -> None:
        sockets = self._connections.get(workspace_id)
        if sockets and websocket in sockets:
            sockets.remove(websocket)
        if not self._connections.get(workspace_id):
            self._connections.pop(workspace_id, None)
        print(f"[WS] client disconnected from workspace {workspace_id}")

    async def broadcast(self, workspace_id: int, payload: dict) -> None:
        sockets = list(self._connections.get(workspace_id, []))
        if not sockets:
            return
        message = json.dumps(payload, default=str)
        dead = []
        for ws in sockets:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(workspace_id, ws)

    # ----- Presence Tracking -----

    def register_presence(self, workspace_id: int, user_id: int) -> None:
        """Register a single user as present in a workspace."""
        if workspace_id not in self._presence:
            self._presence[workspace_id] = {}
        self._presence[workspace_id][user_id] = self._presence[workspace_id].get(user_id, 0) + 1

    def unregister_presence(self, workspace_id: int, user_id: int) -> None:
        """Decrement (or remove) a user's presence count for a workspace."""
        ws_presence = self._presence.get(workspace_id)
        if not ws_presence:
            return
        count = ws_presence.get(user_id, 0) - 1
        if count <= 0:
            ws_presence.pop(user_id, None)
        else:
            ws_presence[user_id] = count

    def get_presence(self, workspace_id: int) -> Dict[int, int]:
        """Return {user_id: connection_count} for all users currently present in a workspace."""
        return dict(self._presence.get(workspace_id, {}))

    async def broadcast_presence(self, workspace_id: int) -> None:
        """Broadcast the current presence snapshot to all clients in a workspace."""
        await self.broadcast(
            workspace_id,
            {
                "type": "presence_update",
                "workspace_id": workspace_id,
                "presence": self.get_presence(workspace_id),
            }
        )


manager = ConnectionManager()


async def broadcast_member_change(
    workspace_id: int, action: str, user_id: Optional[int] = None
) -> None:
    """Notify every open dashboard that this workspace's members changed."""
    await manager.broadcast(
        workspace_id,
        {
            "type": "members_updated",
            "action": action,  # "invited" | "role_updated" | "removed"
            "workspace_id": workspace_id,
            "user_id": user_id,
        },
    )


async def broadcast_chat_message(workspace_id: int, message_data: dict) -> None:
    """Broadcast a new chat message to all connected clients in the workspace."""
    await manager.broadcast(
        workspace_id,
        {
            "type": "chat_message",
            "workspace_id": workspace_id,
            "message": message_data,
        },
    )


async def broadcast_typing_indicator(workspace_id: int, user_id: int, username: str, is_typing: bool) -> None:
    """Broadcast typing indicator to all connected clients in the workspace."""
    await manager.broadcast(
        workspace_id,
        {
            "type": "typing_indicator",
            "workspace_id": workspace_id,
            "user_id": user_id,
            "username": username,
            "is_typing": is_typing,
        },
    )
