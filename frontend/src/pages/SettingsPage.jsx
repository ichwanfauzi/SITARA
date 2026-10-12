export default function SettingsPage() {
  return (
    <div className="p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-700">Pengaturan</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Konfigurasi aplikasi</h2>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Organisasi</p>
            <p className="mt-2 font-semibold text-slate-800">Direktorat Kesekretariatan</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Mode aplikasi</p>
            <p className="mt-2 font-semibold text-slate-800">Prototype demo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
