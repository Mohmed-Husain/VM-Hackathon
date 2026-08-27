from app.schemas.payment import PaymentAttemptRequest, PaymentPlaceholderResponse


class PaymentService:
    async def attempt_payment(self, payload: PaymentAttemptRequest) -> PaymentPlaceholderResponse:
        return PaymentPlaceholderResponse(
            payments_enabled=True,
            message=f"Payment placeholder invoked for application {payload.application_id}.",
        )
