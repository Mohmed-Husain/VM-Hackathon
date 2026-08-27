from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class PaymentAttemptRequest(BaseModel):
    application_id: UUID
    payment_method: Literal["credit_card", "upi", "net_banking"]


class PaymentPlaceholderResponse(BaseModel):
    payments_enabled: bool
    message: str
