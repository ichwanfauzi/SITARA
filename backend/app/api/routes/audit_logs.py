from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_authenticated_user, get_db
from app.models import AuditLog, User

router = APIRouter(prefix="/api/audit-logs", tags=["audit-logs"])


@router.get("")
def list_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(50).all()
    return [{
        "id": item.id,
        "user_id": item.user_id,
        "action_type": item.action_type,
        "entity_type": item.entity_type,
        "entity_id": item.entity_id,
        "details": item.details,
        "created_at": item.created_at.isoformat(),
    } for item in logs]
