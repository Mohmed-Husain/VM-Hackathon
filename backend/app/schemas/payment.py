from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

PaymentMethod = Literal["visa", "mastercard", "amex", "paypal", "upi", "debit"]


class PaymentAttemptRequest(BaseModel):
    application_id: UUID
    payment_method: Literal["credit_card", "upi", "net_banking"]
    payment_method: PaymentMethod
    card_last_four: str | None = None
    amount_usd: int = 50


class PaymentPlaceholderResponse(BaseModel):
    payments_enabled: bool
    message: str
class PaymentAttemptResponse(BaseModel):
    status: Literal["success", "failed", "locked"]
    failure_reason: str | None = None
    attempt_number: int
    attempts_remaining: int
    locked_until: datetime | None = None


class LockStatusResponse(BaseModel):
    is_locked: bool
    locked_until: datetime | None = None
    failed_attempts: int

