from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import AsyncSessionLocal
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.captcha_service import CaptchaService


class AuthService:
    def __init__(self) -> None:
        self.user_repository = UserRepository()

    async def login(self, payload: LoginRequest) -> TokenResponse:
        if payload.captcha_challenge_id or payload.captcha_answer:
            if not CaptchaService.verify(payload.captcha_challenge_id, payload.captcha_answer):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid CAPTCHA code. Please try again.",
                )

        async with AsyncSessionLocal() as session:
            user = await self.user_repository.get_by_email(session, payload.email)

            if user is None or not verify_password(payload.password, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password.",
                )

            token = create_access_token(user.id, user.email)
            return TokenResponse(
                access_token=token,
                expires_in=settings.access_token_expire_minutes * 60,
                user=UserResponse.model_validate(user),
            )

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        # Validate CAPTCHA
        if not CaptchaService.verify(payload.captcha_challenge_id, payload.captcha_answer):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid CAPTCHA code. Please try again.",
            )

        # Validate password match
        if payload.password != payload.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match.",
            )

        # Validate password strength
        if len(payload.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long.",
            )

        full_name = payload.full_name.strip()
        if not full_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name is required.",
            )

        async with AsyncSessionLocal() as session:
            existing = await self.user_repository.get_by_email(session, payload.email)
            if existing is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists.",
                )

            password_hash = get_password_hash(payload.password)
            user = await self.user_repository.create(
                session,
                email=payload.email,
                password_hash=password_hash,
                full_name=full_name,
            )
            await session.commit()
            await session.refresh(user)

            token = create_access_token(user.id, user.email)
            return TokenResponse(
                access_token=token,
                expires_in=settings.access_token_expire_minutes * 60,
                user=UserResponse.model_validate(user),
            )

