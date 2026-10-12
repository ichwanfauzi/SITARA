import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

const defaultMeeting = {
  title: '',
  meeting_date: '',
  start_time: '09:00',
  end_time: '10:30',
  location: '',
  chairperson: '',
  secretary: '',
  agenda: '',
  participants: '',
  status: 'scheduled',
  minute_status: 'draft',
  summary: '',
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [form, setForm] = useState(defaultMeeting);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/meetings');
      setMeetings(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat data rapat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const resetForm = () => {
    setForm(defaultMeeting);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await apiRequest(`/api/meetings/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      } else {
        await apiRequest('/api/meetings', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      resetForm();
      await loadMeetings();
    } catch (err) {
      setError(err.message || 'Tidak dapat menyimpan rapat.');
    }
  };

  const handleDelete = async (meetingId) => {
    if (!window.confirm('Hapus rapat ini?')) return;
    try {
      await apiRequest(`/api/meetings/${meetingId}`, { method: 'DELETE' });
      await loadMeetings();
    } catch (err) {
      setError(err.message || 'Gagal menghapus rapat.');
    }
  };

  const handleEdit = (meeting) => {
    setEditingId(meeting.id);
    setForm({
      title: meeting.title,
      meeting_date: meeting.meeting_date,
      start_time: meeting.start_time || '09:00',
      end_time: meeting.end_time || '10:30',
      location: meeting.location || '',
      chairperson: meeting.chairperson || '',
      secretary: meeting.secretary || '',
      agenda: meeting.agenda || '',
      participants: meeting.participants || '',
      status: meeting.status || 'scheduled',
      minute_status: meeting.minute_status || 'draft',
      summary: meeting.summary || '',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-700">Data Rapat</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">Daftar rapat</h2>
        </div>
        <button
          onClick={resetForm}
          className="rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {editingId ? 'Batal Edit' : '+ Rapat Baru'}
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 text-lg font-semibold text-slate-900">{editingId ? 'Edit rapat' : 'Buat rapat baru'}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Judul rapat</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal</label>
            <input type="date" value={form.meeting_date} onChange={(e) => setForm({ ...form, meeting_date: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Jam mulai</label>
            <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Jam selesai</label>
            <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Lokasi</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Pimpinan rapat</label>
            <input value={form.chairperson} onChange={(e) => setForm({ ...form, chairperson: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notulis</label>
            <input value={form.secretary} onChange={(e) => setForm({ ...form, secretary: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status rapat</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <option value="scheduled">Dijadwalkan</option>
              <option value="ongoing">Berlangsung</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Agenda</label>
            <textarea value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Peserta</label>
            <textarea value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })} rows={2} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Ringkasan</label>
            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button type="submit" className="rounded-xl bg-blue-900 px-4 py-2.5 font-semibold text-white">{editingId ? 'Simpan Perubahan' : 'Simpan Rapat'}</button>
          <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700">Reset</button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <div className="p-6 text-slate-500">Memuat data rapat...</div> : (
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notulen</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="text-sm text-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-900">{meeting.title}</td>
                  <td className="px-4 py-3">{meeting.meeting_date}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">{meeting.status}</span></td>
                  <td className="px-4 py-3">{meeting.minute_status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(meeting)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">Edit</button>
                      <button onClick={() => handleDelete(meeting.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
