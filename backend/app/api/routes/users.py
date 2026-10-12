from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_authenticated_user, get_db
from app.core.security import get_password_hash
from app.models import User
from app.schemas import UserCreate, UserRead

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    if current_user.role not in {"admin", "secretariat", "director"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses data pengguna dibatasi.")
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserRead.model_validate(user) for user in users]


@router.post("", response_model=UserRead)
def create_user(payload: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Hanya admin yang dapat membuat akun baru.")
    if db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first():
        raise HTTPException(status_code=400, detail="Username atau email sudah digunakan.")

    user = User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        password_hash=get_password_hash(payload.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserRead.model_validate(user)
