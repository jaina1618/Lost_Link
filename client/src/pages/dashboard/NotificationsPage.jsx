import { useState, useEffect } from 'react';
import { notifApi } from '../../api';
import { timeAgo } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  MATCH_FOUND: '🎯', RECOVERY_REQUEST_RECEIVED: '📨', RECOVERY_REQUEST_ACCEPTED: '✅',
  RECOVERY_REQUEST_REJECTED: '❌', NEW_MESSAGE: '💬', ITEM_RECOVERED: '🎉',
  ADMIN_ACTION: '⚡', REPORT_REVIEWED: '🔍',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    notifApi.getAll().then(r => setNotifications(r.data.data)).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notifApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read.');
  };

  const handleDelete = async (id) => {
    await notifApi.delete(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await notifApi.markRead(n._id);
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
    }
    if (n.link) navigate(n.link);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2"><Bell className="text-primary-400" /> Notifications</h1>
          <p className="section-subtitle">{notifications.filter(n => !n.isRead).length} unread</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="btn-ghost btn-sm gap-1.5 text-primary-400">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell size={48} className="mx-auto text-surface-muted opacity-30 mb-4" />
          <h3 className="font-semibold text-white mb-2">No Notifications</h3>
          <p className="text-surface-muted text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {notifications.map((n, i) => (
            <div key={n._id}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-surface-elevated transition-colors cursor-pointer ${!n.isRead ? 'bg-primary-600/5' : ''} ${i < notifications.length - 1 ? 'border-b border-surface-border' : ''}`}
              onClick={() => handleClick(n)}>
              <span className="text-2xl flex-shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${!n.isRead ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                <p className="text-xs text-surface-muted mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-surface-muted mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                <button onClick={e => { e.stopPropagation(); handleDelete(n._id); }}
                  className="text-surface-muted hover:text-rose-400 transition-colors p-1 opacity-0 group-hover:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
