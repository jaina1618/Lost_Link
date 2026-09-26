import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { formatDate, getStatusBadgeClass } from '../../utils';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export default function ItemManagement() {
  const [tab, setTab] = useState('lost');
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getLostItems(), adminApi.getFoundItems()])
      .then(([l, f]) => { setLostItems(l.data.data); setFoundItems(f.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (type, id) => {
    if (!confirm('Remove this listing?')) return;
    await adminApi.deleteItem(type, id);
    if (type === 'lost') setLostItems(prev => prev.filter(i => i._id !== id));
    else setFoundItems(prev => prev.filter(i => i._id !== id));
    toast.success('Listing removed.');
  };

  const items = tab === 'lost' ? lostItems : foundItems;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">📋 Item Management</h1>
        <p className="section-subtitle">Manage all lost and found listings</p>
      </div>

      <div className="flex gap-1 bg-surface-card rounded-xl p-1 border border-surface-border w-fit">
        {['lost', 'found'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-amber-500 text-white' : 'text-surface-muted hover:text-white'}`}>
            {t === 'lost' ? '🔍' : '📦'} {t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'lost' ? lostItems.length : foundItems.length})
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Item', 'Category', 'Reporter', 'Location', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-surface-muted uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-surface-border/50">
                    {Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}
                  </tr>
                ))
              ) : items.map(item => (
                <tr key={item._id} className="border-b border-surface-border/50 hover:bg-surface-elevated transition-colors">
                  <td className="px-4 py-3 font-medium text-white max-w-[150px] truncate">{item.itemName}</td>
                  <td className="px-4 py-3 text-surface-muted">{item.category}</td>
                  <td className="px-4 py-3 text-surface-muted">{item.reportedBy?.name}</td>
                  <td className="px-4 py-3 text-surface-muted">{item.location?.city || '—'}</td>
                  <td className="px-4 py-3 text-surface-muted">{formatDate(tab === 'lost' ? item.dateLost : item.dateFound)}</td>
                  <td className="px-4 py-3"><span className={getStatusBadgeClass(item.status)}>{item.status}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(tab, item._id)} className="text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
