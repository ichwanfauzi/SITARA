from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import SessionLocal

security = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    return get_current_user(credentials)


def require_admin(user=Depends(get_authenticated_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ini hanya untuk administrator.",
        )
    return user
