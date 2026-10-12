from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_authenticated_user, get_db
from app.models import AuditLog, Decision, DecisionBrief, Meeting, MeetingNote, User
from app.schemas import (
    DecisionBriefCreate,
    DecisionCreate,
    MeetingCreate,
    MeetingNoteCreate,
    MeetingRead,
    MeetingUpdate,
)

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.get("", response_model=list[MeetingRead])
def list_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    if current_user.role not in {"admin", "secretariat", "director"}:
        raise HTTPException(status_code=403, detail="Anda tidak memiliki akses ke data rapat.")
    meetings = db.query(Meeting).order_by(Meeting.meeting_date.desc()).all()
    return [MeetingRead.model_validate(meeting) for meeting in meetings]


@router.post("", response_model=MeetingRead)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    if current_user.role not in {"admin", "secretariat"}:
        raise HTTPException(status_code=403, detail="Hanya sekretariat yang dapat membuat rapat.")

    meeting = Meeting(
        title=payload.title,
        meeting_date=payload.meeting_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        location=payload.location,
        chairperson=payload.chairperson,
        secretary=payload.secretary,
        agenda=payload.agenda,
        participants=payload.participants,
        status=payload.status,
        minute_status=payload.minute_status,
        summary=payload.summary,
        creator_id=current_user.id,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    db.add(AuditLog(
        user_id=current_user.id,
        action_type="create",
        entity_type="meeting",
        entity_id=meeting.id,
        details=f"Membuat rapat: {meeting.title}",
    ))
    db.commit()
    return MeetingRead.model_validate(meeting)


@router.get("/{meeting_id}", response_model=MeetingRead)
def read_meeting(meeting_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Rapat tidak ditemukan.")
    return MeetingRead.model_validate(meeting)


@router.patch("/{meeting_id}", response_model=MeetingRead)
def update_meeting(
    meeting_id: int,
    payload: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Rapat tidak ditemukan.")
    if current_user.role not in {"admin", "secretariat"}:
        raise HTTPException(status_code=403, detail="Anda tidak memiliki izin mengubah rapat.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(meeting, field, value)
    db.commit(); db.refresh(meeting)
    return MeetingRead.model_validate(meeting)


@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Rapat tidak ditemukan.")
    if current_user.role not in {"admin", "secretariat"}:
        raise HTTPException(status_code=403, detail="Anda tidak diizinkan menghapus rapat.")
    db.delete(meeting)
    db.commit()
    return {"status": "deleted", "meeting_id": meeting_id}


@router.get("/{meeting_id}/notes", response_model=list[dict])
def get_notes(meeting_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Rapat tidak ditemukan.")
    notes = db.query(MeetingNote).filter(MeetingNote.meeting_id == meeting_id).order_by(MeetingNote.created_at.asc()).all()
    return [{
        "id": row.id,
        "agenda": row.agenda,
        "note_type": row.note_type,
        "content": row.content,
        "author_id": row.author_id,
        "created_at": row.created_at.isoformat(),
    } for row in notes]


@router.post("/{meeting_id}/notes", response_model=dict)
def create_note(
    meeting_id: int,
    payload: MeetingNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Rapat tidak ditemukan.")
    if current_user.role not in {"admin", "secretariat"}:
        raise HTTPException(status_code=403, detail="Hanya sekretariat yang dapat mencatat rapat.")

    note = MeetingNote(
        meeting_id=meeting_id,
        author_id=current_user.id,
        agenda=payload.agenda,
        note_type=payload.note_type,
        content=payload.content,
    )
    db.add(note)
    db.commit(); db.refresh(note)
    return {"status": "created", "note": {"id": note.id, "content": note.content, "note_type": note.note_type}}


@router.get("/{meeting_id}/decisions", response_model=list[dict])
def get_decisions(meeting_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    db.query(Meeting).filter(Meeting.id == meeting_id).first()
    decisions = db.query(Decision).filter(Decision.meeting_id == meeting_id).order_by(Decision.created_at.desc()).all()
    return [{
        "id": item.id,
        "title": item.title,
        "description": item.description,
        "owner": item.owner,
        "status": item.status,
    } for item in decisions]


@router.post("/{meeting_id}/decisions", response_model=dict)
def create_decision(
    meeting_id: int,
    payload: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    if current_user.role not in {"admin", "secretariat"}:
        raise HTTPException(status_code=403, detail="Anda tidak diizinkan membuat keputusan.")
    decision = Decision(meeting_id=meeting_id, title=payload.title, description=payload.description, owner=payload.owner, status=payload.status)
    db.add(decision)
    db.commit(); db.refresh(decision)
    return {"status": "created", "decision_id": decision.id}


@router.get("/{meeting_id}/decision-brief", response_model=dict)
def get_decision_brief(meeting_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    brief = db.query(DecisionBrief).filter(DecisionBrief.meeting_id == meeting_id).first()
    if not brief:
        notes = db.query(MeetingNote).filter(MeetingNote.meeting_id == meeting_id).order_by(MeetingNote.created_at.asc()).all()
        decision_notes = [note.content for note in notes if note.note_type == "decision"]
        action_notes = [note.content for note in notes if note.note_type == "action"]
        risk_notes = [note.content for note in notes if note.note_type in {"information", "discussion"} and any(token in note.content.lower() for token in ["resiko", "risiko", "kendala", "potensi"]) ]

        generated = DecisionBrief(
            meeting_id=meeting_id,
            title=f"Decision Brief - {db.query(Meeting).filter(Meeting.id == meeting_id).first().title}",
            summary=" ".join(note.content for note in notes[:3]) or "Ringkasan rapat belum tersedia.",
            key_decisions="\n".join(decision_notes) or "Belum ada keputusan yang ditandai.",
            follow_up="\n".join(action_notes) or "Belum ada tindak lanjut yang ditandai.",
            risks="\n".join(risk_notes) or "Tidak ada catatan risiko utama.",
            approval_status="draft",
        )
        db.add(generated)
        db.commit(); db.refresh(generated)
        return {
            "id": generated.id,
            "meeting_id": generated.meeting_id,
            "title": generated.title,
            "summary": generated.summary,
            "key_decisions": generated.key_decisions,
            "follow_up": generated.follow_up,
            "risks": generated.risks,
            "approval_status": generated.approval_status,
        }
    return {
        "id": brief.id,
        "meeting_id": brief.meeting_id,
        "title": brief.title,
        "summary": brief.summary,
        "key_decisions": brief.key_decisions,
        "follow_up": brief.follow_up,
        "risks": brief.risks,
        "approval_status": brief.approval_status,
    }


@router.post("/{meeting_id}/decision-brief", response_model=dict)
def upsert_decision_brief(
    meeting_id: int,
    payload: DecisionBriefCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    brief = db.query(DecisionBrief).filter(DecisionBrief.meeting_id == meeting_id).first()
    if not brief:
        brief = DecisionBrief(meeting_id=meeting_id, title=payload.title, summary=payload.summary, key_decisions=payload.key_decisions, follow_up=payload.follow_up, risks=payload.risks, approval_status=payload.approval_status)
        db.add(brief)
    else:
        brief.title = payload.title
        brief.summary = payload.summary
        brief.key_decisions = payload.key_decisions
        brief.follow_up = payload.follow_up
        brief.risks = payload.risks
        brief.approval_status = payload.approval_status
    db.commit(); db.refresh(brief)
    return {"status": "saved", "brief_id": brief.id}
