from fastapi import APIRouter

from app.api.routes import ai, applications, auth, documents, health, ocr, payments, profile
from app.api.routes import ai, applications, auth, captcha, documents, health, ocr, payments, profile

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(captcha.router, prefix="/captcha", tags=["captcha"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(documents.router, tags=["documents"])
api_router.include_router(ocr.router, tags=["ocr"])
api_router.include_router(ai.router, tags=["ai"])
api_router.include_router(payments.router, tags=["payments"])

