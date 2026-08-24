import base64
import time
import hashlib
import httpx
from typing import Dict, Any
from backend.app.core.config import settings
from backend.app.core.logging import logger


class StorageService:
    """Service for Cloudinary media uploads and asset management."""

    def __init__(self):
        self.cloud_name = settings.CLOUDINARY_CLOUD_NAME
        self.api_key = settings.CLOUDINARY_API_KEY
        self.api_secret = settings.CLOUDINARY_API_SECRET

    async def upload_image(self, file_bytes: bytes, filename: str, folder: str = "recyclex_waste") -> Dict[str, Any]:
        """Upload image to Cloudinary using signed REST API with fallback."""
        if not self.cloud_name or not self.api_key or not self.api_secret:
            logger.warning("Cloudinary credentials missing, returning mock upload URL")
            b64 = base64.b64encode(file_bytes[:1024]).decode("utf-8")
            return {
                "url": f"https://res.cloudinary.com/demo/image/upload/v1/{folder}/{filename}",
                "public_id": f"{folder}/{filename}",
                "status": "simulated",
            }

        timestamp = int(time.time())
        params_to_sign = f"folder={folder}&timestamp={timestamp}{self.api_secret}"
        signature = hashlib.sha1(params_to_sign.encode("utf-8")).hexdigest()

        upload_url = f"https://api.cloudinary.com/v1_1/{self.cloud_name}/image/upload"
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                files = {"file": (filename, file_bytes, "image/jpeg")}
                data = {
                    "api_key": self.api_key,
                    "timestamp": timestamp,
                    "signature": signature,
                    "folder": folder,
                }
                response = await client.post(upload_url, data=data, files=files)
                
                if response.status_code == 200:
                    res_json = response.json()
                    secure_url = res_json.get("secure_url") or res_json.get("url")
                    public_id = res_json.get("public_id")
                    logger.info(f"Cloudinary upload successful: {secure_url}")
                    return {
                        "url": secure_url,
                        "public_id": public_id,
                        "status": "uploaded",
                    }
                else:
                    logger.error(f"Cloudinary upload failed: {response.status_code} - {response.text}")
                    # Graceful fallback URL
                    return {
                        "url": f"https://res.cloudinary.com/{self.cloud_name}/image/upload/v1/{folder}/{filename}",
                        "public_id": f"{folder}/{filename}",
                        "status": "fallback",
                    }
        except Exception as e:
            logger.error(f"Cloudinary upload exception: {e}")
            return {
                "url": f"https://res.cloudinary.com/{self.cloud_name}/image/upload/v1/{folder}/{filename}",
                "public_id": f"{folder}/{filename}",
                "status": "fallback",
            }


storage_service = StorageService()
