from app.schemas.payment import PaymentAttemptRequest, PaymentPlaceholderResponse
from datetime import datetime, timedelta, timezone
import random
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.models.payment_attempt import PaymentAttempt
from app.models.user import User
from app.schemas.payment import (
    LockStatusResponse,
    PaymentAttemptRequest,
    PaymentAttemptResponse,
)

FAILURE_REASONS = [
    "Insufficient funds in linked account.",
    "Card authorization declined by issuing bank.",
    "Card network timeout — bank did not respond.",
    "Security check failed — 3D Secure verification timed out.",
    "Card transaction limit exceeded for international payments.",
]


class PaymentService:
    MAX_ATTEMPTS = 3
    LOCKOUT_HOURS = 24

    async def check_lock_status(
        self,
        session: AsyncSession,
        user: User,
        application_id: UUID,
    ) -> LockStatusResponse:
        now = datetime.now(timezone.utc)

        # Check for active lockout
        query = (
            select(PaymentAttempt)
            .where(
                PaymentAttempt.application_id == application_id,
                PaymentAttempt.user_id == user.id,
                PaymentAttempt.locked_until.is_not(None),
            )
            .order_by(PaymentAttempt.created_at.desc())
            .limit(1)
        )
        result = await session.execute(query)
        latest_locked = result.scalar_one_or_none()

        if latest_locked and latest_locked.locked_until and latest_locked.locked_until > now:
            return LockStatusResponse(
                is_locked=True,
                locked_until=latest_locked.locked_until,
                failed_attempts=self.MAX_ATTEMPTS,
            )

        # Count consecutive failed attempts since last success
        all_attempts_query = (
            select(PaymentAttempt)
            .where(
                PaymentAttempt.application_id == application_id,
                PaymentAttempt.user_id == user.id,
            )
            .order_by(PaymentAttempt.created_at.desc())
        )
        attempts_result = await session.execute(all_attempts_query)
        attempts = attempts_result.scalars().all()

        consecutive_failures = 0
        for att in attempts:
            if att.status == "success":
                break
            if att.status in ("failed", "locked"):
                consecutive_failures += 1

        return LockStatusResponse(
            is_locked=False,
            locked_until=None,
            failed_attempts=consecutive_failures,
        )

    async def dev_skip_lock(
        self,
        session: AsyncSession,
        user: User,
        application_id: UUID,
    ) -> dict:
        now = datetime.now(timezone.utc)
        # Clear lockouts and reset failed status
        await session.execute(
            update(PaymentAttempt)
            .where(
                PaymentAttempt.application_id == application_id,
                PaymentAttempt.user_id == user.id,
            )
            .values(locked_until=now - timedelta(seconds=1))
        )
        # Delete recent failed attempts so counter resets to 0 for demo convenience
        recent_fails = (
            select(PaymentAttempt)
            .where(
                PaymentAttempt.application_id == application_id,
                PaymentAttempt.user_id == user.id,
                PaymentAttempt.status != "success",
            )
        )
        res = await session.execute(recent_fails)
        for row in res.scalars().all():
            await session.delete(row)

        await session.commit()
        return {"message": "Payment lockout reset successfully. Remaining attempts restored to 3."}

    async def attempt_payment(
        self,
        session: AsyncSession,
        user: User,
        payload: PaymentAttemptRequest,
    ) -> PaymentAttemptResponse:
        now = datetime.now(timezone.utc)
        lock_status = await self.check_lock_status(session, user, payload.application_id)

        if lock_status.is_locked and lock_status.locked_until:
            return PaymentAttemptResponse(
                status="locked",
                failure_reason="Payment locked due to 3 consecutive failed attempts. Please wait 24 hours.",
                attempt_number=self.MAX_ATTEMPTS,
                attempts_remaining=0,
                locked_until=lock_status.locked_until,
            )

        current_attempt = lock_status.failed_attempts + 1

        # Determine outcome:
        # - Card ending in 4242 -> always success
        # - Card ending in 0000 -> always fail
        # - Default: 60% success, 40% fail
        if payload.card_last_four == "4242":
            outcome = "success"
        elif payload.card_last_four == "0000":
            outcome = "failed"
        else:
            outcome = random.choices(["success", "failed"], weights=[60, 40])[0]

        if outcome == "success":
            record = PaymentAttempt(
                user_id=user.id,
                application_id=payload.application_id,
                attempt_number=current_attempt,
                payment_method=payload.payment_method,
                card_last_four=payload.card_last_four,
                amount_usd=payload.amount_usd,
                status="success",
                failure_reason=None,
                locked_until=None,
            )
            session.add(record)

            # Update application status if it exists
            app_query = select(Application).where(Application.id == payload.application_id)
            app_res = await session.execute(app_query)
            app = app_res.scalar_one_or_none()
            if app and app.status != "Submitted":
                app.status = "Payment Verified"

            await session.commit()

            return PaymentAttemptResponse(
                status="success",
                failure_reason=None,
                attempt_number=current_attempt,
                attempts_remaining=self.MAX_ATTEMPTS,
                locked_until=None,
            )

        # Outcome is failed
        failure_reason = random.choice(FAILURE_REASONS)
        is_now_locked = current_attempt >= self.MAX_ATTEMPTS
        locked_until = now + timedelta(hours=self.LOCKOUT_HOURS) if is_now_locked else None

        record = PaymentAttempt(
            user_id=user.id,
            application_id=payload.application_id,
            attempt_number=current_attempt,
            payment_method=payload.payment_method,
            card_last_four=payload.card_last_four,
            amount_usd=payload.amount_usd,
            status="locked" if is_now_locked else "failed",
            failure_reason=failure_reason,
            locked_until=locked_until,
        )
        session.add(record)
        await session.commit()

        return PaymentAttemptResponse(
            status="locked" if is_now_locked else "failed",
            failure_reason=failure_reason,
            attempt_number=current_attempt,
            attempts_remaining=0 if is_now_locked else (self.MAX_ATTEMPTS - current_attempt),
            locked_until=locked_until,
        )
