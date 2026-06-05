"""Tests for JWT authentication endpoints and protected routes."""

from datetime import timedelta

from fastapi.testclient import TestClient

from app.auth import create_access_token
from app.main import app

client = TestClient(app)


def _get_auth_header(username: str = "admin") -> dict[str, str]:
    """Helper to create a valid Authorization header."""
    token = create_access_token(data={"sub": username})
    return {"Authorization": f"Bearer {token}"}


class TestAuthToken:
    """Tests for POST /auth/token."""

    def test_login_valid_credentials(self):
        """Valid admin/admin credentials should return a JWT."""
        response = client.post(
            "/auth/token",
            data={"username": "admin", "password": "admin"},
        )
        assert response.status_code == 200
        body = response.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"

    def test_login_invalid_password(self):
        """Invalid password should return 401."""
        response = client.post(
            "/auth/token",
            data={"username": "admin", "password": "wrong"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect username or password"

    def test_login_unknown_user(self):
        """Unknown username should return 401."""
        response = client.post(
            "/auth/token",
            data={"username": "nobody", "password": "x"},
        )
        assert response.status_code == 401


class TestAuthRegister:
    """Tests for POST /auth/register."""

    def test_register_new_user(self):
        """Registering a new user should succeed."""
        response = client.post(
            "/auth/register",
            params={"username": "testuser", "password": "testpass"},
        )
        assert response.status_code == 201
        assert "testuser" in response.json()["message"]

    def test_register_duplicate_user(self):
        """Registering an existing username should return 400."""
        # admin is pre-seeded
        response = client.post(
            "/auth/register",
            params={"username": "admin", "password": "x"},
        )
        assert response.status_code == 400


class TestProtectedPaymentEndpoints:
    """Tests for JWT-protected /api/payments routes."""

    def test_list_payments_no_token(self):
        """Accessing /api/payments without a token should return 401."""
        response = client.get("/api/payments")
        assert response.status_code == 401

    def test_list_payments_with_valid_token(self):
        """Accessing /api/payments with a valid token should return 200."""
        response = client.get("/api/payments", headers=_get_auth_header())
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_payment_no_token(self):
        """Accessing /api/payments/{id} without a token should return 401."""
        response = client.get("/api/payments/nonexistent")
        assert response.status_code == 401

    def test_get_payment_with_valid_token(self):
        """Accessing /api/payments/{id} with token returns 404 (no data)."""
        response = client.get("/api/payments/nonexistent", headers=_get_auth_header())
        assert response.status_code == 404

    def test_invalid_token(self):
        """A malformed token should return 401."""
        response = client.get(
            "/api/payments",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert response.status_code == 401

    def test_expired_token(self):
        """An expired token should return 401."""
        token = create_access_token(
            data={"sub": "admin"},
            expires_delta=timedelta(seconds=-10),
        )
        response = client.get(
            "/api/payments",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 401


class TestHealthEndpointsRemainPublic:
    """Health/readiness endpoints must stay unauthenticated."""

    def test_health_no_token(self):
        """GET /health should succeed without auth."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_ready_no_token(self):
        """GET /ready should succeed without auth."""
        response = client.get("/ready")
        assert response.status_code == 200
