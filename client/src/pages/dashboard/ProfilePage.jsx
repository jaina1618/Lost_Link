import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api';
import { getInitials } from '../../utils';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match.');
    setSavingPass(true);
    try {
      await authApi.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    setSavingPass(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Profile</h1>
        <p className="section-subtitle">Manage your account information</p>
      </div>

      {/* Avatar */}
      <div className="card p-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center text-2xl font-black mb-3">
          {getInitials(user?.name)}
        </div>
        <p className="font-bold text-white text-lg">{user?.name}</p>
        <p className="text-sm text-surface-muted">{user?.email}</p>
        <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${user?.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-primary-500/10 text-primary-400 border border-primary-500/20'}`}>
          {user?.role === 'admin' ? '⚡ Admin' : '👤 User'}
        </div>
      </div>

      {/* Profile Form */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2"><User size={16} /> Personal Information</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input className="input opacity-60" value={user?.email} disabled />
            <p className="text-xs text-surface-muted mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="input-label">Phone Number</label>
            <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91..." />
          </div>
          <button type="submit" disabled={saving} className="btn-primary gap-2"><Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2"><Lock size={16} /> Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmPassword', 'Confirm New Password']].map(([k, l]) => (
            <div key={k}>
              <label className="input-label">{l}</label>
              <input type="password" className="input" value={passwords[k]} onChange={e => setPasswords({...passwords, [k]: e.target.value})} required />
            </div>
          ))}
          <button type="submit" disabled={savingPass} className="btn-secondary gap-2"><Lock size={14} /> {savingPass ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  );
}
