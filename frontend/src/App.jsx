import { BarChart3, ClipboardList, FileText, FolderKanban, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ActionItemsPage from './pages/ActionItemsPage';
import DashboardPage from './pages/DashboardPage';
import LiveInputPage from './pages/LiveInputPage';
import LoginPage from './pages/LoginPage';
import MeetingsPage from './pages/MeetingsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/meetings', label: 'Data Rapat', icon: ClipboardList },
  { to: '/live-input', label: 'Live Input', icon: FileText },
  { to: '/action-items', label: 'Tindak Lanjut', icon: FolderKanban },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/users', label: 'Pengguna', icon: Users },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
];

function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 w-72 border-r border-slate-200 bg-slate-900 text-slate-100">
        <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">S</div>
          <div>
            <div className="text-lg font-bold">SIMONRA</div>
            <div className="text-xs text-slate-400">Monitoring Rapat</div>
          </div>
        </div>

        <nav className="mt-6 space-y-2 px-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-2xl bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{user?.full_name || 'Pengguna'}</p>
              <p className="text-xs text-slate-400">{user?.role || 'User'}</p>
            </div>
            <button onClick={logout} className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-700">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-72 min-h-screen">
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">SIMONRA</p>
              <h1 className="text-2xl font-bold text-slate-900">Sistem Monitoring Notulen Rapat</h1>
            </div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">Status: online</div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/live-input" element={<LiveInputPage />} />
        <Route path="/action-items" element={<ActionItemsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
