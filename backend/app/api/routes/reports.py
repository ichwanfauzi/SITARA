from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_authenticated_user, get_db
from app.models import ActionItem, AuditLog, Meeting, User

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    total_meetings = db.query(Meeting).count()
    meetings_this_month = db.query(Meeting).filter(Meeting.meeting_date.month == datetime.utcnow().month).count()
    pending_decisions = db.query(ActionItem).filter(ActionItem.status != "completed").count()
    completed_actions = db.query(ActionItem).filter(ActionItem.status == "completed").count()
    ongoing_actions = db.query(ActionItem).filter(ActionItem.status == "in_progress").count()
    not_started_actions = db.query(ActionItem).filter(ActionItem.status == "not_started").count()
    overdue_actions = db.query(ActionItem).filter(ActionItem.status != "completed").count()

    latest_meetings = db.query(Meeting).order_by(Meeting.meeting_date.desc()).limit(5).all()
    action_insights = [
        {"label": "Belum dimulai", "value": not_started_actions},
        {"label": "Berjalan", "value": ongoing_actions},
        {"label": "Selesai", "value": completed_actions},
    ]

    return {
        "total_meetings": total_meetings,
        "meetings_this_month": meetings_this_month,
        "pending_decisions": pending_decisions,
        "completed_actions": completed_actions,
        "ongoing_actions": ongoing_actions,
        "not_started_actions": not_started_actions,
        "overdue_actions": overdue_actions,
        "latest_meetings": [
            {
                "id": m.id,
                "title": m.title,
                "meeting_date": m.meeting_date.isoformat(),
                "status": m.status,
                "minute_status": m.minute_status,
            }
            for m in latest_meetings
        ],
        "action_insights": action_insights,
        "audit_count": db.query(AuditLog).count(),
    }
