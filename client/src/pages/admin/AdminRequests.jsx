import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { getStatusBadgeClass, timeAgo } from '../../utils';
import { ClipboardList } from 'lucide-react';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getRequests().then(r => setRequests(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2"><ClipboardList className="text-primary-400" /> All Recovery Requests</h1>
        <p className="section-subtitle">{requests.length} total requests</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Lost Item', 'Found Item', 'Claimant', 'Respondent', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-surface-muted uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-surface-border/50">
                    {Array(6).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}
                  </tr>
                ))
              ) : requests.map(req => (
                <tr key={req._id} className="border-b border-surface-border/50 hover:bg-surface-elevated transition-colors">
                  <td className="px-4 py-3 text-white font-medium truncate max-w-[120px]">{req.lostItem?.itemName}</td>
                  <td className="px-4 py-3 text-surface-muted truncate max-w-[120px]">{req.foundItem?.itemName}</td>
                  <td className="px-4 py-3 text-surface-muted">{req.claimant?.name}</td>
                  <td className="px-4 py-3 text-surface-muted">{req.respondent?.name}</td>
                  <td className="px-4 py-3"><span className={getStatusBadgeClass(req.status)}>{req.status}</span></td>
                  <td className="px-4 py-3 text-surface-muted">{timeAgo(req.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
