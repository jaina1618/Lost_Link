import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lostApi, foundApi, reportApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStatusBadgeClass, getInitials, SERVER_URL } from '../../utils';
import { MapPin, Calendar, Tag, User, Flag, ArrowLeft, Zap, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ItemDetail() {
  const { type, id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    const api = type === 'lost' ? lostApi : foundApi;
    api.getById(id).then(r => setItem(r.data.data)).catch(() => navigate(-1)).finally(() => setLoading(false));
  }, [id, type]);

  const handleReport = async () => {
    if (!user) return toast.error('Please login to report.');
    const reason = prompt('Reason for reporting? (Spam/Fraud/Inappropriate/Fake/Other)');
    if (!reason) return;
    try {
      await reportApi.create({ targetType: type === 'lost' ? 'LostItem' : 'FoundItem', targetId: id, reason: reason.trim() || 'Other', details: '' });
      toast.success('Report submitted. Admin will review.');
    } catch { toast.error('Failed to submit report.'); }
  };

  if (loading) return (
    <div className="page-container py-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton aspect-video rounded-2xl" />
        <div className="skeleton h-6 w-3/4 rounded" />
      </div>
    </div>
  );

  if (!item) return null;

  const date = type === 'lost' ? item.dateLost : item.dateFound;
  const imageUrl = item.image ? (item.image.startsWith('/uploads') ? `${SERVER_URL}${item.image}` : item.image) : null;
  const isOwner = user && item.reportedBy?._id === user._id;

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6 -ml-2">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header card */}
        <div className="card overflow-hidden mb-6">
          {/* Image */}
          {imageUrl ? (
            <img src={imageUrl} alt={item.itemName} className="w-full aspect-video object-cover" />
          ) : (
            <div className="w-full aspect-video bg-surface-elevated flex items-center justify-center">
              <span className="text-8xl opacity-20">{type === 'lost' ? '🔍' : '📦'}</span>
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${type === 'lost' ? 'bg-rose-600/20 text-rose-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                    {type === 'lost' ? '🔍 LOST ITEM' : '📦 FOUND ITEM'}
                  </div>
                  <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                </div>
                <h1 className="text-2xl font-black text-white">{item.itemName}</h1>
              </div>
              {!isOwner && user && (
                <button onClick={handleReport} className="btn-ghost btn-sm text-rose-400 hover:text-rose-300 flex-shrink-0">
                  <Flag size={14} /> Report
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {/* Details */}
          <div className="sm:col-span-2 space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-4">Item Details</h2>
              <div className="space-y-3">
                {[
                  { label: 'Category', value: `${item.category}${item.subcategory ? ` › ${item.subcategory}` : ''}` },
                  { label: 'Brand', value: item.brand },
                  { label: 'Color', value: item.color },
                  { label: type === 'lost' ? 'Date Lost' : 'Date Found', value: formatDate(date) },
                  { label: 'Location', value: [item.location?.city, item.location?.state, item.location?.address].filter(Boolean).join(', ') },
                ].filter(d => d.value).map(({ label, value }) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-sm text-surface-muted w-28 flex-shrink-0">{label}</span>
                    <span className="text-sm text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold text-white mb-3">Description</h2>
              <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
            </div>

            {item.distinguishingFeatures && (
              <div className="card p-5">
                <h2 className="font-semibold text-white mb-3">Distinguishing Features</h2>
                <p className="text-sm text-gray-300 leading-relaxed">{item.distinguishingFeatures}</p>
              </div>
            )}

            {type === 'lost' && (
              <div className="card p-5 border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Lock size={16} /> <span className="font-semibold text-sm">Ownership Verification</span>
                </div>
                <p className="text-xs text-surface-muted leading-relaxed">
                  This item has private ownership details that only the real owner would know. To claim this item if found, you'll need to provide these details in your recovery request.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Reporter */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-surface-muted mb-3">Reported By</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {getInitials(item.reportedBy?.name)}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{item.reportedBy?.name}</p>
                  {user && <p className="text-xs text-surface-muted">{item.reportedBy?.phone}</p>}
                </div>
              </div>
            </div>

            {/* Actions */}
            {user && !isOwner && (
              <div className="card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">Actions</h3>
                {type === 'found' && (
                  <Link to={`/dashboard/requests`} className="btn-primary w-full text-center text-sm">
                    🔑 Claim This Item
                  </Link>
                )}
                <Link to="/dashboard/matches" className="btn-secondary w-full text-center text-sm">
                  <Zap size={14} /> View My Matches
                </Link>
              </div>
            )}

            {isOwner && (
              <div className="card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">Your Report</h3>
                <Link to={`/dashboard/reports`} className="btn-secondary w-full text-center text-sm">Manage Report</Link>
                <Link to="/dashboard/matches" className="btn-primary w-full text-center text-sm"><Zap size={14} /> View Matches</Link>
              </div>
            )}

            {!user && (
              <div className="card p-4 text-center space-y-3">
                <p className="text-sm text-surface-muted">Login to view matches, send requests, and communicate.</p>
                <Link to="/auth/login" className="btn-primary w-full text-center text-sm">Login</Link>
                <Link to="/auth/register" className="btn-secondary w-full text-center text-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
