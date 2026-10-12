import { useEffect, useState } from 'react';
import { BarChart3, CircleCheckBig, ClipboardList, Clock3, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiRequest } from '../lib/api';

const cards = [
  { key: 'total_meetings', label: 'Total Rapat', icon: ClipboardList },
  { key: 'meetings_this_month', label: 'Rapat Bulan Ini', icon: TrendingUp },
  { key: 'pending_decisions', label: 'Keputusan Aktif', icon: Clock3 },
  { key: 'completed_actions', label: 'Tindak Lanjut Selesai', icon: CircleCheckBig },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest('/api/reports/summary');
        setSummary(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500">Memuat dashboard...</div>;
  }

  const chartData = summary?.action_insights || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">Dashboard</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">Ringkasan monitoring</h2>
        </div>
        <button className="rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white">+ Buat Rapat Baru</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon }) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{summary?.[key] ?? 0}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-900"><Icon size={22} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Tren tindak lanjut</h3>
            <span className="text-xs text-slate-500">Data simulasi</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#1d4ed8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Rapat terbaru</h3>
          <div className="mt-5 space-y-3">
            {(summary?.latest_meetings || []).map((meeting) => (
              <div key={meeting.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{meeting.title}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-700">{meeting.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{meeting.meeting_date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
