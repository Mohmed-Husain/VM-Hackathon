from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets
from uuid import UUID

import jwt
from fastapi import HTTPException, status

from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        algorithm, salt, digest = hashed_password.split("$", 2)
    except ValueError:
        return False

    if algorithm != "sha256":
        return False

    candidate_digest = hashlib.sha256(f"{salt}{plain_password}".encode("utf-8")).hexdigest()
    return hmac.compare_digest(candidate_digest, digest)


def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.sha256(f"{salt}{password}".encode("utf-8")).hexdigest()
    return f"sha256${salt}${digest}"


def create_access_token(user_id: UUID, email: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        ) from exc
