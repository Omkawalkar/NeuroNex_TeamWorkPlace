import sys
sys.path.insert(0, '.')
from app import app
from fastapi.testclient import TestClient
client = TestClient(app)

# Check if chat messages endpoint exists
try:
    resp = client.get('/api/chat/messages', headers={'X-Current-User-Dummy-ID': 'NN-ADMIN-001'})
    print(f'GET /api/chat/messages: status={resp.status_code}')
    if resp.status_code == 200:
        data = resp.json()
        msgs = data.get("messages", [])
        print(f'  success={data.get("success")}, messages count={len(msgs)}')
except Exception as e:
    print(f'GET error: {e}')

# Check POST
try:
    resp = client.post('/api/chat/messages?workspace_id=1', 
                       headers={'X-Current-User-Dummy-ID': 'NN-ADMIN-001', 'Content-Type': 'application/json'},
                       json={'text': 'Test message'})
    print(f'POST /api/chat/messages: status={resp.status_code}')
    if resp.status_code != 201:
        print(f'  Response: {resp.text[:500]}')
    else:
        print(f'  Response: {resp.json()}')
except Exception as e:
    print(f'POST error: {e}')
