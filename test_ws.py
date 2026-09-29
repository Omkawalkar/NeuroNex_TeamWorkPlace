import sys
sys.path.insert(0, '.')
from app import app
from fastapi.testclient import TestClient
client = TestClient(app)

# Check if WebSocket route exists
ws_routes = [r for r in app.routes if type(r).__name__ == 'WebSocketRoute']
print(f'WebSocketRoute objects: {len(ws_routes)}')
for r in ws_routes:
    print(f'  path={r.path}')

# Check _IncludedRouter and all routes
for r in app.routes:
    rtype = type(r).__name__
    path = getattr(r, 'path', 'N/A')
    if 'websocket' in rtype.lower() or 'ws' in str(path).lower():
        print(f'  Found: type={rtype}, path={path}')

# Try WebSocket connection
try:
    with client.websocket_connect('/ws/1') as websocket:
        print('WebSocket connected!')
        import json
        websocket.send_text(json.dumps({'type': 'presence_join', 'user_id': 1, 'username': 'Test'}))
        data = websocket.receive_text()
        print(f'Received: {data}')
except Exception as e:
    print(f'WebSocket error: {type(e).__name__}: {e}')
