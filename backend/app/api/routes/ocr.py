from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.ocr import PassportOcrRequest, PassportOcrResponse
from app.services.ocr_service import OcrService

router = APIRouter()
service = OcrService()


@router.post("/ocr/passport-scan", response_model=PassportOcrResponse)
async def simulate_passport_scan(
    payload: PassportOcrRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> PassportOcrResponse:
    return await service.simulate_passport_scan(session, current_user, payload)
