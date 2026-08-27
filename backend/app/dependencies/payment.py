from fastapi import HTTPException, status

from app.core.config import settings


def require_payments_enabled() -> None:
    if settings.payments_enabled:
        return

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Payment is hidden for this MVP build and has not been enabled yet.",
    )
