import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';
import { Search, UserX, UserCheck, Shield } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      adminApi.getUsers({ keyword: search || undefined }).then(r => setUsers(r.data.data)).finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSuspend = async (id, isBanned) => {
    await adminApi.suspendUser(id);
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned: !u.isBanned } : u));
    toast.success(isBanned ? 'User unbanned.' : 'User banned.');
  };

  const handleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role to ${newRole}?`)) return;
    await adminApi.changeRole(id, newRole);
    setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
    toast.success('Role updated.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">👥 User Management</h1>
        <p className="section-subtitle">Manage platform users</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-muted" />
        <input className="input pl-10" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
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
              ) : users.map(u => (
                <tr key={u._id} className="border-b border-surface-border/50 hover:bg-surface-elevated transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                  <td className="px-4 py-3 text-surface-muted">{u.email}</td>
                  <td className="px-4 py-3 text-surface-muted">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-primary-500/10 text-primary-400 border-primary-500/20'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isBanned ? 'badge-rejected' : 'badge-active'}`}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-surface-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleSuspend(u._id, u.isBanned)}
                        className={`btn-sm p-1.5 rounded-lg ${u.isBanned ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-rose-400 hover:bg-rose-500/10'}`}
                        title={u.isBanned ? 'Unban' : 'Ban'}>
                        {u.isBanned ? <UserCheck size={14} /> : <UserX size={14} />}
                      </button>
                      <button onClick={() => handleRole(u._id, u.role)}
                        className="text-amber-400 hover:bg-amber-500/10 p-1.5 rounded-lg transition-colors" title="Toggle Admin">
                        <Shield size={14} />
                      </button>
                    </div>
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
