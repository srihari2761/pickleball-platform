"""
End-to-end integration tests for the Pickleball Platform API.

Usage:
    # Test against live Railway deployment (default)
    pytest test_e2e.py -v

    # Test against local server
    TEST_API_URL=http://localhost:8000 pytest test_e2e.py -v
"""
import os
import uuid
import pytest
import httpx

BASE_URL = os.getenv("TEST_API_URL", "https://pickleball-platform-production.up.railway.app")

# Generate unique email per test run to avoid collisions
RUN_ID = uuid.uuid4().hex[:8]
TEST_EMAIL = f"testuser_{RUN_ID}@example.com"
TEST_PASSWORD = "TestPass123!"
TEST_NAME = f"Test User {RUN_ID}"


@pytest.fixture(scope="module")
def client():
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as c:
        yield c


@pytest.fixture(scope="module")
def registered_user(client):
    """Register a user and return the response data (token + user)."""
    resp = client.post("/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "name": TEST_NAME,
        "role": "player",
        "skill_level": "intermediate",
    })
    assert resp.status_code == 200, f"Registration failed: {resp.text}"
    data = resp.json()
    assert "access_token" in data
    assert "user" in data
    return data


@pytest.fixture(scope="module")
def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['access_token']}"}


# ── 1. Health Check ──────────────────────────────────────────────

class TestHealthCheck:
    def test_health_returns_200(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("status") == "ok"


# ── 2-3. Registration ───────────────────────────────────────────

class TestRegistration:
    def test_register_valid(self, registered_user):
        """Test 2: Valid registration returns token + user."""
        assert registered_user["token_type"] == "bearer"
        assert registered_user["user"]["email"] == TEST_EMAIL
        assert registered_user["user"]["name"] == TEST_NAME

    def test_register_duplicate(self, client, registered_user):
        """Test 3: Duplicate email returns 400."""
        resp = client.post("/auth/register", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "role": "player",
            "skill_level": "intermediate",
        })
        assert resp.status_code == 400


# ── 4-5. Login ──────────────────────────────────────────────────

class TestLogin:
    def test_login_valid(self, client, registered_user):
        """Test 4: Login with valid creds returns token + user."""
        resp = client.post("/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == TEST_EMAIL

    def test_login_invalid_password(self, client):
        """Test 5: Wrong password returns 401."""
        resp = client.post("/auth/login", json={
            "email": TEST_EMAIL,
            "password": "WrongPassword!",
        })
        assert resp.status_code == 401


# ── 6. Get Courts ───────────────────────────────────────────────

class TestCourts:
    def test_get_courts(self, client):
        """Test 6: GET /courts returns 200 + list."""
        resp = client.get("/courts")
        assert resp.status_code == 200
        courts = resp.json()
        assert isinstance(courts, list)
        # Seeded data should have courts
        assert len(courts) >= 1, "Expected seeded courts"

    def test_create_court_authenticated(self, client, auth_headers):
        """Test 7: POST /courts with token succeeds."""
        resp = client.post("/courts", json={
            "name": f"Test Court {RUN_ID}",
            "location": "123 Test St",
            "surface_type": "Concrete",
            "amenities": "Lights",
        }, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == f"Test Court {RUN_ID}"

    def test_create_court_unauthenticated(self, client):
        """Test 8: POST /courts without token fails."""
        resp = client.post("/courts", json={
            "name": "Unauthorized Court",
            "location": "Nowhere",
            "surface_type": "Concrete",
        })
        assert resp.status_code in (401, 422)


# ── 9-11. Bookings ──────────────────────────────────────────────

class TestBookings:
    def test_create_booking_authenticated(self, client, auth_headers):
        """Test 9: POST /bookings with auth succeeds."""
        # Get a court id first
        courts = client.get("/courts").json()
        assert len(courts) > 0
        court_id = courts[0]["id"]

        resp = client.post("/bookings", json={
            "court_id": court_id,
            "time_slot": "2026-03-01 10:00-11:00",
        }, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["court_id"] == court_id
        assert data["status"] == "confirmed"

    def test_get_bookings_authenticated(self, client, auth_headers):
        """Test 10: GET /bookings with auth returns user's bookings."""
        resp = client.get("/bookings", headers=auth_headers)
        assert resp.status_code == 200
        bookings = resp.json()
        assert isinstance(bookings, list)
        assert len(bookings) >= 1

    def test_get_bookings_unauthenticated(self, client):
        """Test 11: GET /bookings without token fails."""
        resp = client.get("/bookings")
        assert resp.status_code in (401, 422)


# ── 12. Full User Journey ───────────────────────────────────────

class TestFullJourney:
    def test_complete_user_journey(self, client):
        """Register → Login → View courts → Book court → View bookings."""
        email = f"journey_{RUN_ID}@example.com"

        # Register
        resp = client.post("/auth/register", json={
            "email": email,
            "password": "JourneyPass1!",
            "name": "Journey User",
            "role": "player",
            "skill_level": "beginner",
        })
        assert resp.status_code == 200
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Login
        resp = client.post("/auth/login", json={"email": email, "password": "JourneyPass1!"})
        assert resp.status_code == 200

        # View courts
        resp = client.get("/courts")
        assert resp.status_code == 200
        courts = resp.json()
        assert len(courts) >= 1

        # Book a court
        resp = client.post("/bookings", json={
            "court_id": courts[0]["id"],
            "time_slot": "2026-03-15 14:00-15:00",
        }, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "confirmed"

        # View bookings
        resp = client.get("/bookings", headers=headers)
        assert resp.status_code == 200
        assert len(resp.json()) >= 1
