from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_authenticated_user, get_db
from app.models import ActionItem, User
from app.schemas import ActionItemCreate, ActionItemRead

router = APIRouter(prefix="/api/action-items", tags=["action-items"])


@router.get("", response_model=list[ActionItemRead])
def list_action_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    items = db.query(ActionItem).order_by(ActionItem.due_date.asc().nullslast()).all()
    return [ActionItemRead.model_validate(item) for item in items]


@router.post("", response_model=ActionItemRead)
def create_action_item(
    payload: ActionItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    if current_user.role not in {"admin", "secretariat"}:
        raise HTTPException(status_code=403, detail="Hanya sekretariat yang dapat membuat tindak lanjut.")
    item = ActionItem(
        meeting_id=payload.meeting_id or 1,
        title=payload.title,
        description=payload.description,
        owner=payload.owner,
        due_date=payload.due_date,
        priority=payload.priority,
        status=payload.status,
        progress_notes=payload.progress_notes,
        decision_id=payload.decision_id,
    )
    db.add(item); db.commit(); db.refresh(item)
    return ActionItemRead.model_validate(item)


@router.patch("/{item_id}", response_model=ActionItemRead)
def update_action_item(
    item_id: int,
    payload: ActionItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Tindak lanjut tidak ditemukan.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit(); db.refresh(item)
    return ActionItemRead.model_validate(item)


@router.delete("/{item_id}")
def delete_action_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Tindak lanjut tidak ditemukan.")
    db.delete(item); db.commit()
    return {"status": "deleted", "item_id": item_id}
