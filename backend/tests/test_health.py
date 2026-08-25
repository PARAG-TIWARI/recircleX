import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_root_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "RecycleX"
        assert data["status"] == "online"


@pytest.mark.asyncio
async def test_head_root_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.head("/")
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_endpoint():
    from unittest.mock import AsyncMock, patch, MagicMock
    from backend.app.db.mongodb import db_manager

    mock_client = MagicMock()
    mock_admin = MagicMock()
    mock_admin.command = AsyncMock(return_value={"ok": 1})
    mock_client.admin = mock_admin

    with patch.object(db_manager, "client", mock_client):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/health")
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "database" in data["data"]
            assert data["data"]["database"]["status"] == "connected"

            # Verify direct /health root alias route
            root_health_res = await client.get("/health")
            assert root_health_res.status_code == 200
            root_data = root_health_res.json()
            assert root_data["success"] is True
            assert root_data["data"]["database"]["status"] == "connected"
