from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.dependencies.auth import get_current_user
from app.dependencies.payment import require_payments_enabled
from app.models.user import User
from app.schemas.payment import (
    LockStatusResponse,
    PaymentAttemptRequest,
    PaymentAttemptResponse,
)
from app.services.payment_service import PaymentService

router = APIRouter()
service = PaymentService()


@router.post("/payments/attempt", response_model=PaymentAttemptResponse)
async def attempt_payment(
    payload: PaymentAttemptRequest,
    _: None = Depends(require_payments_enabled),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> PaymentAttemptResponse:
    return await service.attempt_payment(session, current_user, payload)


@router.get("/payments/lock-status/{application_id}", response_model=LockStatusResponse)
async def get_lock_status(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> LockStatusResponse:
    return await service.check_lock_status(session, current_user, application_id)


@router.post("/payments/dev-skip-lock/{application_id}")
async def dev_skip_lock(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    return await service.dev_skip_lock(session, current_user, application_id)
