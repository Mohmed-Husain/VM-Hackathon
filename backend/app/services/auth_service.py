from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.db.session import AsyncSessionLocal
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self) -> None:
        self.user_repository = UserRepository()

    async def login(self, payload: LoginRequest) -> TokenResponse:
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
