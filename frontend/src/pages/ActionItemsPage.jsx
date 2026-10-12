import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

const statusStyles = {
  not_started: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

const defaultItem = {
  meeting_id: 1,
  title: '',
  description: '',
  owner: '',
  due_date: '',
  priority: 'medium',
  status: 'not_started',
  progress_notes: '',
};

export default function ActionItemsPage() {
  const [items, setItems] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [form, setForm] = useState(defaultItem);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [itemsData, meetingsData] = await Promise.all([
        apiRequest('/api/action-items'),
        apiRequest('/api/meetings'),
      ]);
      setItems(itemsData);
      setMeetings(meetingsData);
      if (meetingsData.length && !form.meeting_id) {
        setForm((current) => ({ ...current, meeting_id: meetingsData[0].id }));
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat tindakan.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiRequest('/api/action-items', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ ...defaultItem, meeting_id: form.meeting_id });
      await loadData();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan tindak lanjut.');
    }
  };

  const handleStatusChange = async (itemId, status) => {
    const item = items.find((entry) => entry.id === itemId);
    try {
      await apiRequest(`/api/action-items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...item, status }),
      });
      await loadData();
    } catch (err) {
      setError(err.message || 'Gagal memperbarui status.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-700">Tindak Lanjut</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">Monitoring tugas</h2>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Rapat terkait</label>
            <select value={form.meeting_id} onChange={(e) => setForm({ ...form, meeting_id: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              {meetings.map((meeting) => <option key={meeting.id} value={meeting.id}>{meeting.title}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Judul tugas</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">PIC</label>
            <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tenggat</label>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Prioritas</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <option value="not_started">Belum dimulai</option>
              <option value="in_progress">Sedang berjalan</option>
              <option value="completed">Selesai</option>
            </select>
          </div>
        </div>
        <button type="submit" className="mt-5 rounded-xl bg-blue-900 px-4 py-2.5 font-semibold text-white">Simpan Tindak Lanjut</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">PIC</th>
              <th className="px-4 py-3">Prioritas</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="text-sm text-slate-700">
                <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                <td className="px-4 py-3">{item.owner || 'Belum ditentukan'}</td>
                <td className="px-4 py-3 uppercase">{item.priority}</td>
                <td className="px-4 py-3">
                  <select value={item.status} onChange={(event) => handleStatusChange(item.id, event.target.value)} className={`rounded-full px-2 py-1 text-xs ${statusStyles[item.status] || 'bg-slate-100'}`}>
                    <option value="not_started">Belum dimulai</option>
                    <option value="in_progress">Sedang berjalan</option>
                    <option value="completed">Selesai</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
