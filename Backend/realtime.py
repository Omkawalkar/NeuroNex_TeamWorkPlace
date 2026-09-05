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
    """Tracks active WebSocket connections per workspace."""

    def __init__(self) -> None:
        self._connections: Dict[int, List[WebSocket]] = {}

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
