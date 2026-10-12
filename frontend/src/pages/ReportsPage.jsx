import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    apiRequest('/api/reports/summary')
      .then((data) => setSummary(data))
      .catch((error) => console.error(error));
  }, []);

  if (!summary) return <div className="p-6 text-slate-500">Memuat laporan...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-700">Laporan</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Rekap indikator</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Tindak lanjut selesai</p><p className="mt-3 text-3xl font-bold text-slate-900">{summary.completed_actions}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Sedang berjalan</p><p className="mt-3 text-3xl font-bold text-slate-900">{summary.ongoing_actions}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Belum dimulai</p><p className="mt-3 text-3xl font-bold text-slate-900">{summary.not_started_actions}</p></div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Rapat terbaru</h3>
        <div className="mt-4 space-y-3">
          {(summary.latest_meetings || []).map((meeting) => (
            <div key={meeting.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-800">{meeting.title}</p>
                <p className="text-sm text-slate-500">{meeting.meeting_date}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{meeting.minute_status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
