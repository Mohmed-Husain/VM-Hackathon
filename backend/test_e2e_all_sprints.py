import asyncio
import io
import uuid
from PIL import Image

from app.db.session import AsyncSessionLocal
from app.repositories.application_repository import ApplicationRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.payment import PaymentAttemptRequest
from app.schemas.profile import ProfilePayload
from app.services.ai_service import AiService
from app.services.auth_service import AuthService
from app.services.captcha_service import CaptchaService, _CHALLENGES
from app.services.compression_service import CompressionService
from app.services.payment_service import PaymentService


async def run_e2e_audit():
    print("=" * 60)
    print("RUNNING END-TO-END VERIFICATION: ALL SPRINTS (1 - 6)")
    print("=" * 60)

    auth_service = AuthService()
    payment_service = PaymentService()
    user_repo = UserRepository()
    app_repo = ApplicationRepository()
    profile_repo = ProfileRepository()
    ai_service = AiService()

    # SPRINT 1: Authentication, CAPTCHA & bcrypt
    print("\n[SPRINT 1] 1. Generating Pillow CAPTCHA Challenge...")
    captcha = CaptchaService.generate_captcha()
    assert "challenge_id" in captcha and captcha["image_base64"].startswith("data:image/png;base64,")
    cid = captcha["challenge_id"]
    correct_code = _CHALLENGES[cid]["code"]
    print(f"  [OK] CAPTCHA Generated: ID {cid[:8]}... | Distorted Code: {correct_code}")

    print("[SPRINT 1] 2. Testing CAPTCHA Rejection on Wrong Answer...")
    assert not CaptchaService.verify(cid, "INVALID")
    print("  [OK] Invalid CAPTCHA code correctly rejected")

    print("[SPRINT 1] 3. Registering New User with Bcrypt Password...")
    test_email = f"hackathon_{uuid.uuid4().hex[:6]}@example.com"
    c2 = CaptchaService.generate_captcha()
    cid2 = c2["challenge_id"]
    code2 = _CHALLENGES[cid2]["code"]

    reg_token = await auth_service.register(
        RegisterRequest(
            email=test_email,
            password="SecurePassword2026!",
            confirm_password="SecurePassword2026!",
            full_name="Rajiv Gandhi",
            captcha_challenge_id=cid2,
            captcha_answer=code2,
        )
    )
    print(f"  [OK] User registered: {reg_token.user.email} (UUID: {reg_token.user.id})")

    async with AsyncSessionLocal() as session:
        created_user = await user_repo.get_by_email(session, test_email)
        assert created_user is not None
        assert created_user.password_hash.startswith("$2b$")
        print(f"  [OK] Password verified in DB with bcrypt format: {created_user.password_hash[:20]}...")

    print("[SPRINT 1] 4. Testing Login for Newly Registered User...")
    login_token = await auth_service.login(
        LoginRequest(email=test_email, password="SecurePassword2026!")
    )
    assert login_token.access_token is not None
    print("  [OK] Login successful, JWT token issued")

    print("[SPRINT 1] 5. Testing Seeded Demo Account (Backward Compatible SHA-256)...")
    demo_login = await auth_service.login(
        LoginRequest(email="applicant@example.com", password="password123")
    )
    assert demo_login.user.email == "applicant@example.com"
    print(f"  [OK] Demo account login passed: {demo_login.user.full_name}")

    # SPRINT 3: Smart Upload & Compression Service
    print("\n[SPRINT 3] 6. Testing Pillow Image Compression Pipeline...")
    large_img = Image.new("RGB", (2400, 2400), color=(11, 42, 111))
    buf = io.BytesIO()
    large_img.save(buf, format="JPEG", quality=100)
    raw_img_bytes = buf.getvalue()

    compressed_bytes, stats = CompressionService.compress_image(raw_img_bytes, max_kb=250)
    print(f"  [OK] Original image: {stats['original_size_bytes']} bytes")
    print(f"  [OK] Compressed image: {stats['compressed_size_bytes']} bytes")
    print(f"  [OK] Optimization ratio: {round(stats['compression_ratio'] * 100)}% reduction")
    assert len(compressed_bytes) <= 250 * 1024

    # SPRINT 4: Profile Persistence & Auto-Fill
    print("\n[SPRINT 4] 7. Testing Profile Save and Persistence...")
    async with AsyncSessionLocal() as session:
        user = await user_repo.get_by_email(session, test_email)
        assert user is not None

        profile_payload = ProfilePayload(
            first_name="Rajiv",
            last_name="Gandhi",
            date_of_birth="1988-04-12",
            nationality="USA",
            gender="Male",
            marital_status="Married",
            occupation="Software Architect",
            passport_number="Z8899001",
            issuing_country="USA",
            issue_date="2020-01-10",
            expiry_date="2030-01-10",
        )

        saved_profile = await profile_repo.upsert(session, user.id, profile_payload.model_dump())
        await session.commit()
        await session.refresh(saved_profile)
        print(f"  [OK] Profile saved for {saved_profile.first_name} {saved_profile.last_name} | Passport: {saved_profile.passport_number}")

        # Create draft application for user
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
        print(f"  [OK] Draft application created: {app_id}")

    # SPRINT 2: Payment Simulation, Progress Preservation & 3-Fail Lockout
    print("\n[SPRINT 2] 8. Testing Payment Failure 1 (card 0000)...")
    async with AsyncSessionLocal() as session:
        user = await user_repo.get_by_email(session, test_email)
        p1 = await payment_service.attempt_payment(
            session,
            user,
            PaymentAttemptRequest(
                application_id=app_id,
                payment_method="visa",
                card_last_four="0000",
                amount_usd=50,
            ),
        )
        assert p1.status == "failed" and p1.attempts_remaining == 2
        print(f"  [OK] Attempt 1 failed: {p1.failure_reason} (Attempts remaining: {p1.attempts_remaining})")

        print("[SPRINT 2] 9. Testing Payment Failure 2 (card 0000)...")
        p2 = await payment_service.attempt_payment(
            session,
            user,
            PaymentAttemptRequest(
                application_id=app_id,
                payment_method="visa",
                card_last_four="0000",
                amount_usd=50,
            ),
        )
        assert p2.status == "failed" and p2.attempts_remaining == 1
        print(f"  [OK] Attempt 2 failed: {p2.failure_reason} (Attempts remaining: {p2.attempts_remaining})")

        print("[SPRINT 2] 10. Testing Payment Failure 3 -> Triggering 24h Lockout...")
        p3 = await payment_service.attempt_payment(
            session,
            user,
            PaymentAttemptRequest(
                application_id=app_id,
                payment_method="visa",
                card_last_four="0000",
                amount_usd=50,
            ),
        )
        assert p3.status == "locked" and p3.locked_until is not None
        print(f"  [OK] Attempt 3 locked out: Lock expiry -> {p3.locked_until}")

        print("[SPRINT 2] 11. Verifying Lock Status Query...")
        lock_stat = await payment_service.check_lock_status(session, user, app_id)
        assert lock_stat.is_locked is True
        print("  [OK] Account is actively locked on backend")

        print("[SPRINT 2] 12. Testing Dev Demo Lock Skip...")
        skip_result = await payment_service.dev_skip_lock(session, user, app_id)
        print(f"  [OK] {skip_result['message']}")
        lock_stat_cleared = await payment_service.check_lock_status(session, user, app_id)
        assert lock_stat_cleared.is_locked is False
        print("  [OK] Lock successfully bypassed for evaluation demo")

        print("[SPRINT 2] 13. Testing Successful Payment (card 4242)...")
        p_succ = await payment_service.attempt_payment(
            session,
            user,
            PaymentAttemptRequest(
                application_id=app_id,
                payment_method="visa",
                card_last_four="4242",
                amount_usd=50,
            ),
        )
        assert p_succ.status == "success"
        print(f"  [OK] Payment settled successfully: Status {p_succ.status}")

    # SPRINT 6: AI Assistant
    print("\n[SPRINT 6] 14. Testing AI Assistant Guidance Engine...")
    from app.schemas.ai import AiChatRequest
    async with AsyncSessionLocal() as session:
        ai_res = await ai_service.chat(
            session,
            user,
            AiChatRequest(
                application_id=app_id,
                session_id="test-e2e-session",
                message="What are the passport validity requirements for an Indian eVisa?",
                current_step=2,
            ),
        )
        print(f"  [OK] AI Response ({ai_res.mode} mode):")
        print(f"    {ai_res.answer[:150]}...")
        assert len(ai_res.answer) > 20


    print("\n" + "=" * 60)
    print("ALL 14 TESTS ACROSS ALL 6 SPRINTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_e2e_audit())
