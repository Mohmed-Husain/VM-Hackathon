import asyncio
import uuid
from app.services.captcha_service import CaptchaService
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest, RegisterRequest


async def test_auth():
    print("--- 1. Testing CAPTCHA Generation ---")
    captcha = CaptchaService.generate_captcha()
    assert "challenge_id" in captcha
    assert captcha["image_base64"].startswith("data:image/png;base64,")
    cid = captcha["challenge_id"]
    print(f"Generated CAPTCHA ID: {cid}")

    # Inspect code for testing
    from app.services.captcha_service import _CHALLENGES
    expected_code = _CHALLENGES[cid]["code"]
    print(f"Internal code is: {expected_code}")

    print("--- 2. Testing Wrong CAPTCHA Verification ---")
    assert not CaptchaService.verify(cid, "WRONG1")
    print("Wrong CAPTCHA rejected successfully.")

    print("--- 3. Testing Registration ---")
    # Generate a fresh captcha
    captcha2 = CaptchaService.generate_captcha()
    cid2 = captcha2["challenge_id"]
    code2 = _CHALLENGES[cid2]["code"]

    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    auth_service = AuthService()

    token_res = await auth_service.register(
        RegisterRequest(
            email=unique_email,
            password="StrongPassword123!",
            confirm_password="StrongPassword123!",
            full_name="Hackathon Tester",
            captcha_challenge_id=cid2,
            captcha_answer=code2,
        )
    )

    print(f"Registered user: {token_res.user.email} (ID: {token_res.user.id})")
    assert token_res.access_token is not None

    print("--- 4. Testing Login for New User ---")
    login_res = await auth_service.login(
        LoginRequest(
            email=unique_email,
            password="StrongPassword123!",
        )
    )
    print(f"Logged in user: {login_res.user.email}")

    print("--- 5. Testing Login for Seeded User (Backward Compat) ---")
    demo_login = await auth_service.login(
        LoginRequest(
            email="applicant@example.com",
            password="password123",
        )
    )
    print(f"Demo user login successful: {demo_login.user.full_name}")

    print("\nALL SPRINT 1 AUTH CHECKS PASSED!")


if __name__ == "__main__":
    asyncio.run(test_auth())

