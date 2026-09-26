import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-surface-muted uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-black mt-1 ${color}`}>{value ?? '—'}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;

  const barData = [
    { name: 'Users', value: stats.users },
    { name: 'Lost Items', value: stats.lostItems },
    { name: 'Found Items', value: stats.foundItems },
    { name: 'Matches', value: stats.matches },
    { name: 'Requests', value: stats.requests },
    { name: 'Recovered', value: stats.recovered },
  ];

  const pieData = [
    { name: 'Recovered', value: stats.recovered },
    { name: 'Pending', value: stats.requests - stats.recovered },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">⚡ Admin Dashboard</h1>
        <p className="section-subtitle">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Users" value={stats.users} color="text-primary-400" />
        <StatCard icon="🔍" label="Lost Reports" value={stats.lostItems} color="text-rose-400" />
        <StatCard icon="📦" label="Found Reports" value={stats.foundItems} color="text-emerald-400" />
        <StatCard icon="🎯" label="Matches" value={stats.matches} color="text-amber-400" />
        <StatCard icon="📨" label="Requests" value={stats.requests} color="text-teal-400" />
        <StatCard icon="🎉" label="Recovered" value={stats.recovered} color="text-emerald-400" />
        <StatCard icon="🚩" label="Pending Reports" value={stats.pendingReports} color="text-rose-400" />
        <StatCard icon="📊" label="Recovery Rate" value={stats.requests > 0 ? `${Math.round((stats.recovered / stats.requests) * 100)}%` : '0%'} color="text-primary-400" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Platform Activity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a28', border: '1px solid #2a2a40', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Recovery Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a28', border: '1px solid #2a2a40', borderRadius: '12px', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#6b7280', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
