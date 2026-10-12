from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: str = "secretariat"


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class MeetingCreate(BaseModel):
    title: str
    meeting_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    chairperson: Optional[str] = None
    secretary: Optional[str] = None
    agenda: Optional[str] = None
    participants: Optional[str] = None
    status: str = "scheduled"
    minute_status: str = "draft"
    summary: Optional[str] = None


class MeetingUpdate(MeetingCreate):
    pass


class MeetingRead(MeetingCreate):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MeetingNoteCreate(BaseModel):
    agenda: Optional[str] = None
    note_type: str = "discussion"
    content: str


class MeetingNoteRead(MeetingNoteCreate):
    id: int
    meeting_id: int
    author_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DecisionCreate(BaseModel):
    title: str
    description: str
    owner: Optional[str] = None
    status: str = "active"


class DecisionRead(DecisionCreate):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DecisionBriefCreate(BaseModel):
    title: str
    summary: str
    key_decisions: Optional[str] = None
    follow_up: Optional[str] = None
    risks: Optional[str] = None
    approval_status: str = "draft"


class DecisionBriefRead(DecisionBriefCreate):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ActionItemCreate(BaseModel):
    meeting_id: Optional[int] = 1
    title: str
    description: str
    owner: Optional[str] = None
    due_date: Optional[date] = None
    priority: str = "medium"
    status: str = "not_started"
    progress_notes: Optional[str] = None
    decision_id: Optional[int] = None


class ActionItemRead(ActionItemCreate):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AuditLogRead(BaseModel):
    id: int
    user_id: Optional[int]
    action_type: str
    entity_type: str
    entity_id: Optional[int]
    details: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardSummary(BaseModel):
    total_meetings: int
    meetings_this_month: int
    pending_decisions: int
    completed_actions: int
    ongoing_actions: int
    not_started_actions: int
    overdue_actions: int
    latest_meetings: list[MeetingRead]
    action_insights: list[dict]
