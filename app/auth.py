"""JWT authentication utilities for the EventFlow Payment Service."""

from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenData(BaseModel):
    """Schema for data encoded in the JWT."""

    sub: str | None = None


class Token(BaseModel):
    """Schema for the token response."""

    access_token: str
    token_type: str


class UserInDB(BaseModel):
    """Schema for a stored user record."""

    username: str
    hashed_password: str


# In-memory user store seeded with a demo admin user.
_users_db: dict[str, UserInDB] = {
    "admin": UserInDB(
        username="admin",
        hashed_password=pwd_context.hash("admin"),
    ),
}


def get_users_db() -> dict[str, UserInDB]:
    """Return the in-memory user store (useful for testing)."""
    return _users_db


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, password: str) -> UserInDB | None:
    """Return the user if credentials are valid, else None."""
    user = _users_db.get(username)
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """FastAPI dependency that decodes and validates a JWT Bearer token.

    Returns the username (subject) if valid; raises HTTP 401 otherwise.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    # Optionally verify user still exists
    if username not in _users_db:
        raise credentials_exception
    return username
