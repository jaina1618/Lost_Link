import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, X, Check } from 'lucide-react';
import { notifApi } from '../../api';
import { timeAgo } from '../../utils';

const TYPE_ICONS = {
  MATCH_FOUND: '🎯',
  RECOVERY_REQUEST_RECEIVED: '📨',
  RECOVERY_REQUEST_ACCEPTED: '✅',
  RECOVERY_REQUEST_REJECTED: '❌',
  NEW_MESSAGE: '💬',
  ITEM_RECOVERED: '🎉',
  ADMIN_ACTION: '⚡',
  REPORT_REVIEWED: '🔍',
};

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  const fetchCount = async () => {
    try {
      const res = await notifApi.getUnreadCount();
      setCount(res.data.data.count);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await notifApi.getAll();
      setNotifications(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await notifApi.markAllRead();
    setCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) {
      await notifApi.markRead(notif._id);
      setCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
    }
    if (notif.link) { navigate(notif.link); setOpen(false); }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative btn-ghost p-2 rounded-xl hover:bg-surface-elevated transition-colors">
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 card shadow-2xl shadow-black/50 z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                  <Check size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-surface-muted hover:text-white"><X size={16} /></button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-surface-muted text-sm">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <button key={n._id} onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface-elevated transition-colors border-b border-surface-border/50 last:border-0 ${!n.isRead ? 'bg-primary-600/5' : ''}`}>
                  <div className="flex gap-3 items-start">
                    <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                      <p className="text-xs text-surface-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-surface-muted mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-3 border-t border-surface-border">
            <Link to="/dashboard/notifications" onClick={() => setOpen(false)} className="text-xs text-primary-400 hover:text-primary-300">
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
