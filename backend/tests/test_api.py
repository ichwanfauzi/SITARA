from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_login_success():
    response = client.post('/api/auth/login', json={'username': 'admin', 'password': 'Admin123!'})
    assert response.status_code == 200
    payload = response.json()
    assert 'access_token' in payload
    assert payload['user']['role'] == 'admin'


def test_login_fail():
    response = client.post('/api/auth/login', json={'username': 'admin', 'password': 'wrong'})
    assert response.status_code == 401


def test_summary_endpoint_requires_auth():
    response = client.get('/api/reports/summary')
    assert response.status_code == 401
