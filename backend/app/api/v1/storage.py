from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.services.storage_service import storage_service

router = APIRouter(prefix="/storage", tags=["Storage"])


@router.post("/upload", response_model=APIResponse[dict])
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload waste photo to Cloudinary CDN."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    result = await storage_service.upload_image(
        file_bytes=contents,
        filename=file.filename or "upload.jpg",
        folder="recyclex_waste",
    )
    return APIResponse.respond(data=result, message="Image uploaded successfully")
