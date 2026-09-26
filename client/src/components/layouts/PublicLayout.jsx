import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, X, Search } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

export default function PublicLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/items/lost', label: 'Lost Items' },
    { to: '/items/found', label: 'Found Items' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center shadow-lg shadow-primary-900/30 group-hover:scale-105 transition-transform">
                <span className="text-lg">🔗</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">Lost</span>
                <span className="text-primary-400">Link</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === l.to ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-surface-elevated'}`}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <NotificationBell />
                  <Link to="/dashboard" className="btn-primary btn-sm">Dashboard</Link>
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="btn-ghost btn-sm">Login</Link>
                  <Link to="/auth/register" className="btn-primary btn-sm">Get Started</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden btn-ghost p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-surface-border bg-surface-card px-4 py-4 space-y-2 animate-slide-up">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-surface-elevated transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-surface-border space-y-2">
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block btn-primary text-center">Dashboard</Link>
              ) : (
                <>
                  <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="block btn-secondary text-center">Login</Link>
                  <Link to="/auth/register" onClick={() => setMobileOpen(false)} className="block btn-primary text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 mt-16">
        <div className="page-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-white">Lost<span className="text-primary-400">Link</span></span>
              <span className="text-xs text-surface-muted">Reconnecting People with What Matters</span>
            </Link>
            <div className="flex gap-6 text-sm text-surface-muted">
              <Link to="/items/lost" className="hover:text-white transition-colors">Lost Items</Link>
              <Link to="/items/found" className="hover:text-white transition-colors">Found Items</Link>
              <Link to="/auth/register" className="hover:text-white transition-colors">Sign Up</Link>
            </div>
            <p className="text-xs text-surface-muted">© 2026 LostLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
