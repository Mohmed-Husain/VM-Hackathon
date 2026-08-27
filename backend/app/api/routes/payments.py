from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.dependencies.auth import get_current_user
from app.dependencies.payment import require_payments_enabled
from app.models.user import User
from app.schemas.payment import PaymentAttemptRequest, PaymentPlaceholderResponse
from app.services.payment_service import PaymentService

router = APIRouter()
service = PaymentService()


@router.post("/payments/pay", response_model=PaymentPlaceholderResponse)
async def attempt_payment(
    payload: PaymentAttemptRequest,
    _: None = Depends(require_payments_enabled),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> PaymentPlaceholderResponse:
    del current_user, session
    return await service.attempt_payment(payload)
