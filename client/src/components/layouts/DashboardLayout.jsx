import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import { getInitials } from '../../utils';
import {
  LayoutDashboard, FileSearch, Search, GitMerge,
  ClipboardList, MessageSquare, Bell, UserCircle, LogOut,
  PlusCircle, Menu, X, ChevronRight
} from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: FileSearch, label: 'My Reports', to: '/dashboard/reports' },
  { icon: GitMerge, label: 'Matches', to: '/dashboard/matches' },
  { icon: ClipboardList, label: 'Requests', to: '/dashboard/requests' },
  { icon: MessageSquare, label: 'Messages', to: '/dashboard/messages' },
  { icon: Bell, label: 'Notifications', to: '/dashboard/notifications' },
  { icon: UserCircle, label: 'Profile', to: '/dashboard/profile' },
];

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (to) => to === '/dashboard' ? location.pathname === to : location.pathname.startsWith(to);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 px-6 py-5 border-b border-surface-border group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center text-sm">🔗</div>
        <span className="font-bold text-lg"><span className="text-white">Lost</span><span className="text-primary-400">Link</span></span>
      </Link>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-b border-surface-border space-y-2">
        <Link to="/dashboard/reports/lost/create" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 btn-secondary w-full text-sm py-2">
          <PlusCircle size={16} className="text-rose-400" /> Report Lost
        </Link>
        <Link to="/dashboard/reports/found/create" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 btn-accent w-full text-sm py-2">
          <PlusCircle size={16} /> Report Found
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {NAV.map(({ icon: Icon, label, to }) => (
          <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(to)
              ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20'
              : 'text-gray-400 hover:text-white hover:bg-surface-elevated'}`}>
            <Icon size={18} />
            <span>{label}</span>
            {isActive(to) && <ChevronRight size={14} className="ml-auto opacity-60" />}
          </Link>
        ))}
        {isAdmin && (
          <Link to="/admin" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all">
            <LayoutDashboard size={18} /> Admin Panel
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-surface-border px-4 py-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-elevated">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-surface-muted truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-surface-muted hover:text-rose-400 transition-colors p-1">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-card border-r border-surface-border fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-surface-card border-r border-surface-border flex flex-col animate-slide-up">
            <button className="absolute top-4 right-4 btn-ghost p-1.5" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-surface-card/80 backdrop-blur-xl border-b border-surface-border">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-3">
              <button className="lg:hidden btn-ghost p-2" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <span className="text-sm text-surface-muted hidden sm:block">
                Welcome back, <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span> 👋
              </span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center text-xs font-bold">
                {getInitials(user?.name)}
              </div>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
