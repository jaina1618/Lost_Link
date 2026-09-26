import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lostApi, foundApi } from '../../api';
import { getStatusBadgeClass, formatDate, SERVER_URL } from '../../utils';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, Eye } from 'lucide-react';

export default function MyReports() {
  const [tab, setTab] = useState('lost');
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([lostApi.getMy(), foundApi.getMy()])
      .then(([l, f]) => { setLostItems(l.data.data); setFoundItems(f.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      if (type === 'lost') {
        await lostApi.delete(id);
        setLostItems(prev => prev.filter(i => i._id !== id));
      } else {
        await foundApi.delete(id);
        setFoundItems(prev => prev.filter(i => i._id !== id));
      }
      toast.success('Report deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const items = tab === 'lost' ? lostItems : foundItems;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title">My Reports</h1>
          <p className="section-subtitle">Manage all your lost and found reports</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/reports/lost/create" className="btn-secondary btn-sm gap-1.5"><PlusCircle size={14} /> Lost</Link>
          <Link to="/dashboard/reports/found/create" className="btn-accent btn-sm gap-1.5"><PlusCircle size={14} /> Found</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card rounded-xl p-1 border border-surface-border w-fit">
        {['lost', 'found'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-primary-600 text-white' : 'text-surface-muted hover:text-white'}`}>
            {t === 'lost' ? '🔍' : '📦'} {t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'lost' ? lostItems.length : foundItems.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">{tab === 'lost' ? '🔍' : '📦'}</div>
          <h3 className="font-semibold text-white mb-2">No {tab} reports yet</h3>
          <p className="text-surface-muted text-sm mb-4">Create your first report to get started</p>
          <Link to={`/dashboard/reports/${tab}/create`} className="btn-primary">Create Report</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const imageUrl = item.image ? (item.image.startsWith('/uploads') ? `${SERVER_URL}${item.image}` : item.image) : null;
            const date = tab === 'lost' ? item.dateLost : item.dateFound;
            return (
              <div key={item._id} className="card p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all">
                <div className="w-16 h-16 rounded-xl bg-surface-elevated overflow-hidden flex-shrink-0">
                  {imageUrl ? <img src={imageUrl} alt={item.itemName} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">{tab === 'lost' ? '🔍' : '📦'}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white truncate">{item.itemName}</h3>
                    <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                  </div>
                  <p className="text-xs text-surface-muted mt-1">
                    {item.category} · {item.location?.city || item.location?.address} · {formatDate(date)}
                  </p>
                  {item.matchCount > 0 && <p className="text-xs text-amber-400 mt-0.5">⚡ {item.matchCount} potential match{item.matchCount > 1 ? 'es' : ''}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/items/${tab}/${item._id}`} className="btn-ghost p-2 rounded-lg"><Eye size={16} /></Link>
                  <button onClick={() => handleDelete(item._id, tab)} className="btn-ghost p-2 rounded-lg text-rose-400 hover:bg-rose-500/10"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
