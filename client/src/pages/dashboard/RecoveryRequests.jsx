import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { getStatusBadgeClass, timeAgo } from '../../utils';
import { ClipboardList } from 'lucide-react';

export default function RecoveryRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    requestApi.getMyRequests().then(r => setRequests(r.data.data)).finally(() => setLoading(false));
  }, []);

  const sent = requests.filter(r => r.claimant?._id === user?._id);
  const received = requests.filter(r => r.respondent?._id === user?._id);
  const displayed = tab === 'sent' ? sent : tab === 'received' ? received : requests;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2"><ClipboardList className="text-primary-400" /> Recovery Requests</h1>
        <p className="section-subtitle">Track ownership claims and recovery progress</p>
      </div>

      <div className="flex gap-1 bg-surface-card rounded-xl p-1 border border-surface-border w-fit">
        {[['all', 'All', requests.length], ['sent', 'Sent', sent.length], ['received', 'Received', received.length]].map(([t, l, c]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-primary-600 text-white' : 'text-surface-muted hover:text-white'}`}>
            {l} ({c})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : displayed.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList size={48} className="mx-auto text-surface-muted opacity-30 mb-4" />
          <h3 className="font-semibold text-white mb-2">No Requests</h3>
          <p className="text-surface-muted text-sm">Recovery requests will appear here once you send or receive them.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(req => {
            const isSender = req.claimant?._id === user?._id;
            return (
              <Link key={req._id} to={`/dashboard/requests/${req._id}`}
                className="card p-4 hover:border-primary-500/30 transition-all flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-xl flex-shrink-0">📨</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white group-hover:text-primary-300 transition-colors text-sm">
                      {req.lostItem?.itemName}
                    </p>
                    <span className={getStatusBadgeClass(req.status)}>{req.status}</span>
                  </div>
                  <p className="text-xs text-surface-muted mt-1">
                    {isSender ? `You claimed → ${req.respondent?.name}` : `${req.claimant?.name} claims your found item`}
                  </p>
                  <p className="text-xs text-surface-muted">{timeAgo(req.createdAt)}</p>
                </div>
                <span className="text-primary-400 text-sm group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
