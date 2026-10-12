from datetime import date, datetime, timedelta

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models import ActionItem, AuditLog, Decision, DecisionBrief, Meeting, MeetingNote, User


def seed_demo_data():
    db = SessionLocal()

    if not db.query(User).count():
        users = [
            User(username="admin", email="admin@simonra.id", full_name="Administrator", role="admin", password_hash=get_password_hash("Admin123!"), is_active=True),
            User(username="sekretariat", email="sekretariat@simonra.id", full_name="Sekretaris Rapat", role="secretariat", password_hash=get_password_hash("Sekretariat123!"), is_active=True),
            User(username="direktur", email="direktur@simonra.id", full_name="Direktur", role="director", password_hash=get_password_hash("Direktur123!"), is_active=True),
            User(username="pic", email="pic@simonra.id", full_name="PIC Tindak Lanjut", role="pic", password_hash=get_password_hash("Pic123!"), is_active=True),
        ]
        db.add_all(users)
        db.commit()

    users = db.query(User).all()
    user_map = {u.username: u for u in users}

    if not db.query(Meeting).count():
        meetings = [
            Meeting(
                title="Koordinasi Program Kerja Semester",
                meeting_date=date.today() - timedelta(days=3),
                start_time="09:00",
                end_time="10:30",
                location="Ruang Direksi",
                chairperson="Direktur",
                secretary="Sekretariat",
                agenda="Persiapan program kerja dan pembagian tugas.",
                participants="Kepala Unit, Staff, Sekretariat",
                status="completed",
                minute_status="final",
                summary="Disepakati prioritas program kerja dan penanggungjawab unit.",
                creator_id=user_map["sekretariat"].id,
            ),
            Meeting(
                title="Evaluasi Penyelesaian Tindak Lanjut",
                meeting_date=date.today() - timedelta(days=12),
                start_time="14:00",
                end_time="15:00",
                location="Hybrid",
                chairperson="Direktur",
                secretary="Sekretariat",
                agenda="Review progres tindak lanjut dan penanganan hambatan.",
                participants="PIC, Sekretariat, Direktur",
                status="completed",
                minute_status="final",
                summary="Beberapa tugas masih menunggu verifikasi dan penyelesaian final.",
                creator_id=user_map["sekretariat"].id,
            ),
            Meeting(
                title="Rapat Perencanaan Kegiatan Internal",
                meeting_date=date.today() + timedelta(days=4),
                start_time="10:00",
                end_time="11:30",
                location="Ruang Rapat Utama",
                chairperson="Direktur",
                secretary="Sekretariat",
                agenda="Perencanaan pelaksanaan kegiatan internal bulan depan.",
                participants="Seluruh unit terkait",
                status="scheduled",
                minute_status="draft",
                summary="Agenda akan dibahas dan disusun notulen.",
                creator_id=user_map["sekretariat"].id,
            ),
        ]
        db.add_all(meetings)
        db.commit()

    meetings = db.query(Meeting).all()
    first_meeting = meetings[0]
    second_meeting = meetings[1]

    if not db.query(MeetingNote).count():
        notes = [
            MeetingNote(meeting_id=first_meeting.id, author_id=user_map["sekretariat"].id, agenda="Program kerja", note_type="decision", content="Semua unit harus menyiapkan database indikator kerja sesuai template yang telah disepakati."),
            MeetingNote(meeting_id=first_meeting.id, author_id=user_map["sekretariat"].id, agenda="Follow up", note_type="action", content="PIC unit mencatat tugas dan tenggat penyelesaian dalam sistem SIMONRA."),
            MeetingNote(meeting_id=second_meeting.id, author_id=user_map["sekretariat"].id, agenda="Evaluasi", note_type="discussion", content="Tiga tindak lanjut masih berjalan dan perlu pengecekan progress dari PIC."),
        ]
        db.add_all(notes)
        db.commit()

    if not db.query(Decision).count():
        decision_1 = Decision(
            meeting_id=first_meeting.id,
            title="Penetapan indikator utama",
            description="Setiap unit wajib menyelesaikan indikator utama dan mengirimkan data rekap dalam 2 minggu.",
            owner="Kepala Unit",
            status="active",
        )
        decision_2 = Decision(
            meeting_id=second_meeting.id,
            title="Penyelesaian laporan evaluasi",
            description="Laporan evaluasi harus diperbarui dan diverifikasi oleh sekretariat sebelum disampaikan ke direktur.",
            owner="Sekretariat",
            status="active",
        )
        db.add_all([decision_1, decision_2])
        db.commit()

    if not db.query(ActionItem).count():
        decisions = db.query(Decision).all()
        action_items = [
            ActionItem(
                meeting_id=first_meeting.id,
                decision_id=decisions[0].id,
                title="Rekap indikator unit",
                description="Mengumpulkan data indikator kerja dan validasi prioritas.",
                owner="PIC Tindak Lanjut",
                due_date=date.today() + timedelta(days=6),
                priority="high",
                status="in_progress",
                progress_notes="Sedang dilakukan dengan pengecekan data unit.",
            ),
            ActionItem(
                meeting_id=second_meeting.id,
                decision_id=decisions[1].id,
                title="Perbaikan laporan evaluasi",
                description="Menyusun laporan revisi sesuai masukan direktur.",
                owner="Sekretariat",
                due_date=date.today() + timedelta(days=2),
                priority="medium",
                status="not_started",
                progress_notes="Menunggu finalisasi data pendukung.",
            ),
            ActionItem(
                meeting_id=first_meeting.id,
                decision_id=decisions[0].id,
                title="Verifikasi awal target",
                description="Melakukan validasi target dan target periode unit.",
                owner="PIC Tindak Lanjut",
                due_date=date.today() - timedelta(days=1),
                priority="high",
                status="completed",
                progress_notes="Verifikasi berhasil dilakukan dan disetujui.",
            ),
        ]
        db.add_all(action_items)
        db.commit()

    if not db.query(DecisionBrief).count():
        db.add(DecisionBrief(
            meeting_id=first_meeting.id,
            title="Decision Brief Rapat Program Kerja",
            summary="Tiga keputusan utama disepakati untuk mempercepat pelaksanaan program kerja semester ini.",
            key_decisions="Penentuan indikator utama, pembagian kerja per unit, dan penetapan timeline monitoring.",
            follow_up="Unit mempersiapkan data indikator dan sekretariat memonitor progres secara berkala.",
            risks="Potensi keterlambatan data dari unit jika tidak ada penanggung jawab yang jelas.",
            approval_status="draft",
        ))
        db.commit()

    if not db.query(AuditLog).count():
        db.add_all([
            AuditLog(user_id=user_map["admin"].id, action_type="login", entity_type="user", entity_id=user_map["admin"].id, details="Login berhasil ke sistem."),
            AuditLog(user_id=user_map["sekretariat"].id, action_type="create", entity_type="meeting", entity_id=first_meeting.id, details="Membuat data rapat program kerja."),
        ])
        db.commit()

    db.close()
