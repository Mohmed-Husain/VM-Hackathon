from fastapi import APIRouter
from app.schemas.auth import CaptchaResponse
from app.services.captcha_service import CaptchaService

router = APIRouter()


@router.get("/generate", response_model=CaptchaResponse)
async def generate_captcha() -> CaptchaResponse:
    challenge = CaptchaService.generate_captcha()
    return CaptchaResponse(**challenge)

