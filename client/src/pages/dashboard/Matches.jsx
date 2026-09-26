import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchApi } from '../../api';
import { getScoreLabel, getScoreColor, formatDate } from '../../utils';
import { Zap } from 'lucide-react';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchApi.getMyMatches().then(r => setMatches(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleDismiss = async (id) => {
    await matchApi.dismiss(id);
    setMatches(prev => prev.filter(m => m._id !== id));
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48 rounded" />
      {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2"><Zap className="text-amber-400" /> Potential Matches</h1>
        <p className="section-subtitle">Items that may match your lost/found reports</p>
      </div>

      {matches.length === 0 ? (
        <div className="card p-16 text-center">
          <Zap size={48} className="mx-auto text-surface-muted opacity-30 mb-4" />
          <h3 className="font-semibold text-white mb-2">No Matches Yet</h3>
          <p className="text-surface-muted text-sm mb-4">Create lost or found reports and our matching engine will find potential matches automatically.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard/reports/lost/create" className="btn-secondary btn-sm">Report Lost</Link>
            <Link to="/dashboard/reports/found/create" className="btn-accent btn-sm">Report Found</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(match => {
            const label = getScoreLabel(match.matchScore);
            const colorClass = getScoreColor(match.matchScore);
            return (
              <div key={match._id} className="card p-5 hover:border-primary-500/40 transition-all">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Score */}
                  <div className="flex-shrink-0 text-center sm:w-24">
                    <div className={`text-3xl font-black ${label.color}`}>{match.matchScore}%</div>
                    <div className={`text-xs font-medium ${label.color} mt-1`}>{label.text}</div>
                    <div className="mt-2 h-2 bg-surface-elevated rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${match.matchScore}%` }} />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex-1 grid sm:grid-cols-2 gap-3">
                    <div className="card-elevated p-3 border-rose-500/20">
                      <p className="text-xs text-rose-400 font-semibold mb-1">🔍 LOST</p>
                      <p className="font-medium text-white text-sm">{match.lostItem?.itemName}</p>
                      <p className="text-xs text-surface-muted mt-1">{match.lostItem?.location?.city} · {formatDate(match.lostItem?.dateLost)}</p>
                      {match.lostItem?.color && <p className="text-xs text-surface-muted">{match.lostItem.color}{match.lostItem.brand ? ` · ${match.lostItem.brand}` : ''}</p>}
                    </div>
                    <div className="card-elevated p-3 border-emerald-500/20">
                      <p className="text-xs text-emerald-400 font-semibold mb-1">📦 FOUND</p>
                      <p className="font-medium text-white text-sm">{match.foundItem?.itemName}</p>
                      <p className="text-xs text-surface-muted mt-1">{match.foundItem?.location?.city} · {formatDate(match.foundItem?.dateFound)}</p>
                      {match.foundItem?.color && <p className="text-xs text-surface-muted">{match.foundItem.color}{match.foundItem.brand ? ` · ${match.foundItem.brand}` : ''}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 sm:w-36 flex-shrink-0">
                    <Link to={`/dashboard/matches/${match._id}`} className="btn-primary btn-sm flex-1 text-center">View Details</Link>
                    <button onClick={() => handleDismiss(match._id)} className="btn-ghost btn-sm flex-1 text-rose-400 hover:text-rose-300">Dismiss</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
