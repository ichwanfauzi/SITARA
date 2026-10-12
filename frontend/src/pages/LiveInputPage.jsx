import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export default function LiveInputPage() {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [notes, setNotes] = useState([]);
  const [brief, setBrief] = useState(null);
  const [newEntry, setNewEntry] = useState({ agenda: '', note_type: 'discussion', content: '' });
  const [error, setError] = useState('');

  const loadMeetings = async () => {
    try {
      const data = await apiRequest('/api/meetings');
      setMeetings(data);
      if (data.length && !selectedMeetingId) {
        setSelectedMeetingId(String(data[0].id));
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat rapat.');
    }
  };

  const loadNotes = async (meetingId) => {
    if (!meetingId) return;
    try {
      const data = await apiRequest(`/api/meetings/${meetingId}/notes`);
      setNotes(data);
      const briefData = await apiRequest(`/api/meetings/${meetingId}/decision-brief`);
      setBrief(briefData);
    } catch (err) {
      setError(err.message || 'Gagal memuat catatan.');
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    if (selectedMeetingId) {
      loadNotes(selectedMeetingId);
    }
  }, [selectedMeetingId]);

  const submitNote = async (event) => {
    event.preventDefault();
    if (!selectedMeetingId) {
      setError('Pilih rapat terlebih dahulu.');
      return;
    }

    try {
      await apiRequest(`/api/meetings/${selectedMeetingId}/notes`, {
        method: 'POST',
        body: JSON.stringify(newEntry),
      });
      setNewEntry({ agenda: '', note_type: 'discussion', content: '' });
      setError('');
      await loadNotes(selectedMeetingId);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan catatan.');
    }
  };

  const generateDecisionBrief = async () => {
    if (!selectedMeetingId) return;

    try {
      const selectedMeeting = meetings.find((item) => String(item.id) === String(selectedMeetingId));
      const decisionText = notes.filter((note) => note.note_type === 'decision').map((note) => note.content).join('\n');
      const actionText = notes.filter((note) => note.note_type === 'action').map((note) => note.content).join('\n');
      const riskText = notes.filter((note) => /resiko|kendala|risiko|potensi/i.test(note.content)).map((note) => note.content).join('\n');

      const payload = {
        title: `Decision Brief - ${selectedMeeting?.title || 'Rapat'}`,
        summary: notes.slice(0, 3).map((note) => note.content).join(' ') || 'Ringkasan rapat belum tersedia.',
        key_decisions: decisionText || 'Belum ada keputusan yang ditandai.',
        follow_up: actionText || 'Belum ada tindak lanjut yang ditandai.',
        risks: riskText || 'Tidak ada catatan risiko utama.',
        approval_status: 'draft',
      };

      await apiRequest(`/api/meetings/${selectedMeetingId}/decision-brief`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await loadNotes(selectedMeetingId);
    } catch (err) {
      setError(err.message || 'Gagal membuat Decision Brief.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-700">Live Input</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Pencatatan rapat</h2>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">Pilih rapat aktif</label>
        <select value={selectedMeetingId} onChange={(e) => setSelectedMeetingId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          {meetings.map((meeting) => <option key={meeting.id} value={meeting.id}>{meeting.title}</option>)}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={submitNote} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Agenda</label>
            <input value={newEntry.agenda} onChange={(e) => setNewEntry({ ...newEntry, agenda: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Contoh: Program kerja" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Jenis catatan</label>
            <select value={newEntry.note_type} onChange={(e) => setNewEntry({ ...newEntry, note_type: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <option value="discussion">Diskusi</option>
              <option value="decision">Keputusan</option>
              <option value="action">Tindak lanjut</option>
              <option value="information">Informasi</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Isi catatan</label>
            <textarea value={newEntry.content} onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })} rows={6} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Tulis catatan rapat di sini..." required />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-xl bg-blue-900 px-4 py-2.5 font-semibold text-white">Simpan Catatan</button>
            <button type="button" onClick={generateDecisionBrief} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700">Generate Decision Brief</button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Catatan rapat terinput</h3>
            <div className="mt-5 space-y-3">
              {notes.length ? notes.map((note) => (
                <div key={note.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase text-slate-600">{note.note_type}</span>
                    <span className="text-xs text-slate-400">{note.created_at}</span>
                  </div>
                  <p className="text-sm text-slate-700">{note.content}</p>
                </div>
              )) : <p className="text-sm text-slate-500">Belum ada catatan untuk rapat ini.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Decision Brief draft</h3>
            {brief ? (
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">Judul</p>
                  <p>{brief.title}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Ringkasan</p>
                  <p>{brief.summary}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Keputusan utama</p>
                  <p>{brief.key_decisions}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Tindak lanjut</p>
                  <p>{brief.follow_up}</p>
                </div>
              </div>
            ) : <p className="mt-4 text-sm text-slate-500">Belum ada draft Decision Brief untuk rapat ini.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
