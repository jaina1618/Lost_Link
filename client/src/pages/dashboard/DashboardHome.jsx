import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { lostApi, foundApi, matchApi, requestApi } from '../../api';
import { getStatusBadgeClass, formatDate, timeAgo } from '../../utils';
import { PlusCircle, Zap, ClipboardList, CheckCircle, Search, FileSearch } from 'lucide-react';

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to} className="card p-5 hover:border-primary-500/40 transition-all hover:scale-[1.01] group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-surface-muted font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
      </div>
      <div className={`text-2xl p-2 rounded-xl bg-surface-elevated group-hover:scale-110 transition-transform`}>{icon}</div>
    </div>
  </Link>
);

export default function DashboardHome() {
  const { user } = useAuth();
  const [data, setData] = useState({ lostItems: [], foundItems: [], matches: [], requests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      lostApi.getMy(),
      foundApi.getMy(),
      matchApi.getMyMatches(),
      requestApi.getMyRequests(),
    ]).then(([l, f, m, r]) => {
      setData({ lostItems: l.data.data, foundItems: f.data.data, matches: m.data.data, requests: r.data.data });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const activeRequests = data.requests.filter(r => ['Pending', 'Accepted'].includes(r.status));
  const recoveredCount = data.requests.filter(r => ['Accepted', 'Resolved'].includes(r.status)).length;

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Track your lost & found journey</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/reports/lost/create" className="btn-secondary btn-sm gap-2">
            <PlusCircle size={14} className="text-rose-400" /> Report Lost
          </Link>
          <Link to="/dashboard/reports/found/create" className="btn-accent btn-sm gap-2">
            <PlusCircle size={14} /> Report Found
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🔍" label="Lost Reports" value={data.lostItems.length} color="text-rose-400" to="/dashboard/reports" />
        <StatCard icon="📦" label="Found Reports" value={data.foundItems.length} color="text-emerald-400" to="/dashboard/reports" />
        <StatCard icon="🎯" label="Matches" value={data.matches.length} color="text-amber-400" to="/dashboard/matches" />
        <StatCard icon="🎉" label="Recovered" value={recoveredCount} color="text-primary-400" to="/dashboard/requests" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Lost Items */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm">My Lost Items</h2>
            <Link to="/dashboard/reports" className="text-xs text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          {data.lostItems.length === 0 ? (
            <div className="text-center py-8">
              <Search size={32} className="mx-auto text-surface-muted opacity-30 mb-2" />
              <p className="text-xs text-surface-muted">No lost item reports yet</p>
              <Link to="/dashboard/reports/lost/create" className="btn-primary btn-sm mt-3 inline-block">Report Item</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lostItems.slice(0, 4).map(item => (
                <Link key={item._id} to={`/items/lost/${item._id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0 text-sm">🔍</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors truncate">{item.itemName}</p>
                    <p className="text-xs text-surface-muted">{formatDate(item.dateLost)}</p>
                  </div>
                  <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Potential Matches */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2">
              <Zap size={16} className="text-amber-400" /> Potential Matches
            </h2>
            <Link to="/dashboard/matches" className="text-xs text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          {data.matches.length === 0 ? (
            <div className="text-center py-8">
              <Zap size={32} className="mx-auto text-surface-muted opacity-30 mb-2" />
              <p className="text-xs text-surface-muted">No matches yet. Report items to get matched!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.matches.slice(0, 4).map(match => (
                <Link key={match._id} to={`/dashboard/matches/${match._id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated transition-colors group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${match.matchScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : match.matchScore >= 60 ? 'bg-teal-500/20 text-teal-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {match.matchScore}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors truncate">{match.lostItem?.itemName}</p>
                    <p className="text-xs text-surface-muted truncate">→ {match.foundItem?.itemName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Requests */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2">
              <ClipboardList size={16} className="text-primary-400" /> Active Requests
            </h2>
            <Link to="/dashboard/requests" className="text-xs text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          {activeRequests.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList size={32} className="mx-auto text-surface-muted opacity-30 mb-2" />
              <p className="text-xs text-surface-muted">No active recovery requests</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeRequests.slice(0, 4).map(req => (
                <Link key={req._id} to={`/dashboard/requests/${req._id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-sm flex-shrink-0">📨</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors truncate">{req.lostItem?.itemName}</p>
                    <p className="text-xs text-surface-muted">{timeAgo(req.createdAt)}</p>
                  </div>
                  <span className={getStatusBadgeClass(req.status)}>{req.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/items/lost" className="card p-5 hover:border-rose-500/40 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">🔍</div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-rose-300 transition-colors">Browse Lost Items</h3>
            <p className="text-xs text-surface-muted">Help someone find their belongings</p>
          </div>
        </Link>
        <Link to="/items/found" className="card p-5 hover:border-emerald-500/40 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">📦</div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">Browse Found Items</h3>
            <p className="text-xs text-surface-muted">Is one of these yours?</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
