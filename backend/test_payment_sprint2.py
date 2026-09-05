import asyncio
import uuid
from app.db.session import AsyncSessionLocal
from app.repositories.user_repository import UserRepository
from app.repositories.application_repository import ApplicationRepository
from app.services.payment_service import PaymentService
from app.schemas.payment import PaymentAttemptRequest


async def test_payment_simulation():
    async with AsyncSessionLocal() as session:
        user_repo = UserRepository()
        app_repo = ApplicationRepository()
        payment_service = PaymentService()

        # Get or create demo user
        user = await user_repo.get_by_email(session, "applicant@example.com")
        assert user is not None, "Demo user must exist"

        # Create a test application
        app = await app_repo.create(
            session,
            user_id=user.id,
            visa_category="tourist_standard",
            status="In Progress",
            current_step=4,
            progress_percentage=80,
            form_data={},
        )
        await session.commit()
        await session.refresh(app)
        app_id = app.id

        print(f"Created test application ID: {app_id}")

        print("\n--- 1. Testing Failed Attempt 1 (card 0000) ---")
        att1 = await payment_service.attempt_payment(
            session,
            user,
            PaymentAttemptRequest(
                application_id=app_id,
                payment_method="visa",
                card_last_four="0000",
                amount_usd=50,
            ),
        )
        print(f"Status: {att1.status}, Remaining: {att1.attempts_remaining}, Reason: {att1.failure_reason}")
        assert att1.status == "failed"
        assert att1.attempts_remaining == 2

        print("\n--- 2. Testing Failed Attempt 2 (card 0000) ---")
        att2 = await payment_service.attempt_payment(
            session,
            user,
            PaymentAttemptRequest(
                application_id=app_id,
                payment_method="visa",
                card_last_four="0000",
                amount_usd=50,
            ),
        )
        print(f"Status: {att2.status}, Remaining: {att2.attempts_remaining}, Reason: {att2.failure_reason}")
        assert att2.status == "failed"
        assert att2.attempts_remaining == 1

        print("\n--- 3. Testing Failed Attempt 3 (3-Fail Lockout) ---")
        att3 = await payment_service.attempt_payment(
            session,
            user,
            PaymentAttemptRequest(
                application_id=app_id,
                payment_method="visa",
                card_last_four="0000",
                amount_usd=50,
            ),
        )
        print(f"Status: {att3.status}, Remaining: {att3.attempts_remaining}, Locked until: {att3.locked_until}")
        assert att3.status == "locked"
        assert att3.attempts_remaining == 0
        assert att3.locked_until is not None

        print("\n--- 4. Checking Lock Status ---")
        lock_stat = await payment_service.check_lock_status(session, user, app_id)
        print(f"Is locked: {lock_stat.is_locked}, Locked until: {lock_stat.locked_until}")
        assert lock_stat.is_locked is True

        print("\n--- 5. Testing Dev Skip Lock Button ---")
        skip_res = await payment_service.dev_skip_lock(session, user, app_id)
        print(f"Skip response: {skip_res}")
        lock_stat_after = await payment_service.check_lock_status(session, user, app_id)
        print(f"Is locked after skip: {lock_stat_after.is_locked}")
        assert lock_stat_after.is_locked is False

        print("\n--- 6. Testing Successful Payment (card 4242) ---")
        att_success = await payment_service.attempt_payment(
            session,
            user,
            PaymentAttemptRequest(
                application_id=app_id,
                payment_method="visa",
                card_last_four="4242",
                amount_usd=50,
            ),
        )
        print(f"Status: {att_success.status}, Remaining: {att_success.attempts_remaining}")
        assert att_success.status == "success"

        print("\nALL SPRINT 2 BACKEND PAYMENT SIMULATION CHECKS PASSED!")


if __name__ == "__main__":
    asyncio.run(test_payment_simulation())

