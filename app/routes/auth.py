"""Authentication endpoints for the EventFlow Payment Service."""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.auth import (
    Token,
    authenticate_user,
    create_access_token,
    get_users_db,
    pwd_context,
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Token:
    """Authenticate user and return a JWT access token."""
    user = authenticate_user(form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.jwt_access_token_expire_minutes),
    )
    return Token(access_token=access_token, token_type="bearer")


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(username: str, password: str) -> dict[str, str]:
    """Register a new user (demo — in-memory store only)."""
    from app.auth import UserInDB

    users_db = get_users_db()
    if username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    users_db[username] = UserInDB(
        username=username,
        hashed_password=pwd_context.hash(password),
    )
    return {"message": f"User '{username}' registered successfully"}
