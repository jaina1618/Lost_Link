import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils';
import { LayoutDashboard, Users, FileSearch, Flag, ClipboardList, LogOut, ChevronRight } from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
  { icon: Users, label: 'Users', to: '/admin/users' },
  { icon: FileSearch, label: 'Items', to: '/admin/items' },
  { icon: Flag, label: 'Moderation', to: '/admin/reports' },
  { icon: ClipboardList, label: 'Requests', to: '/admin/requests' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (to) => to === '/admin' ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="hidden lg:flex flex-col w-64 bg-surface-card border-r border-surface-border fixed h-full">
        <Link to="/" className="flex items-center gap-2.5 px-6 py-5 border-b border-surface-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm">⚡</div>
          <span className="font-bold text-lg"><span className="text-white">Lost</span><span className="text-amber-400">Link</span> <span className="text-xs text-amber-400 font-medium">Admin</span></span>
        </Link>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAV.map(({ icon: Icon, label, to }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(to) ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-surface-elevated'}`}>
              <Icon size={18} /> {label}
              {isActive(to) && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          ))}
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-primary-400 hover:bg-primary-500/10 transition-all">
            <LayoutDashboard size={18} /> User Dashboard
          </Link>
        </nav>
        <div className="border-t border-surface-border px-4 py-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-elevated">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold">{getInitials(user?.name)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-amber-400">Admin</p>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="text-surface-muted hover:text-rose-400 transition-colors p-1"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 bg-surface-card/80 backdrop-blur-xl border-b border-surface-border px-6 h-16 flex items-center justify-between">
          <h1 className="font-bold text-amber-400">⚡ Admin Panel</h1>
          <span className="text-sm text-surface-muted">Manage the platform</span>
        </header>
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  );
}
