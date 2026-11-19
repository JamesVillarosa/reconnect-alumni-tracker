from fastapi import APIRouter, UploadFile, File, HTTPException
from util.cloudinary_config import cloudinary
from cloudinary.uploader import upload as cloudinary_upload
from cloudinary.exceptions import Error as CloudinaryError

router = APIRouter(prefix="/images", tags=["Image Router"])

@router.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    try:
        result = cloudinary_upload(file.file)
        return {
            "secure_url": result["secure_url"],
            "public_id": result["public_id"]
        }
    except CloudinaryError as e:
        raise HTTPException(status_code=500, detail=["Cloudinary upload failed: {str(e)}"])