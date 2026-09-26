import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { requestApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { getStatusBadgeClass, formatDate } from '../../utils';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Lock, Shield } from 'lucide-react';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [acting, setActing] = useState(false);

  const fetchRequest = () => {
    requestApi.getById(id).then(r => setRequest(r.data.data)).catch(() => navigate('/dashboard/requests')).finally(() => setLoading(false));
  };
  useEffect(fetchRequest, [id]);

  const isRespondent = request && request.respondent?._id === user?._id;
  const isClaimant = request && request.claimant?._id === user?._id;

  const handleAccept = async () => {
    setActing(true);
    try {
      await requestApi.accept(id);
      toast.success('Request accepted! You can now communicate with the claimant.');
      fetchRequest();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    setActing(false);
  };

  const handleReject = async () => {
    setActing(true);
    try {
      await requestApi.reject(id, rejectNote);
      toast.success('Request rejected.');
      setShowReject(false);
      fetchRequest();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    setActing(false);
  };

  const handleResolve = async () => {
    if (!confirm('Mark this case as fully resolved?')) return;
    await requestApi.resolve(id);
    toast.success('Case resolved and closed!');
    fetchRequest();
  };

  if (loading) return <div className="skeleton h-96 rounded-2xl" />;
  if (!request) return null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6 -ml-2"><ArrowLeft size={16} /> Back</button>

      <div className="space-y-5">
        {/* Header */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={getStatusBadgeClass(request.status)}>{request.status}</span>
              </div>
              <h1 className="font-bold text-xl text-white">Recovery Request</h1>
              <p className="text-sm text-surface-muted mt-1">
                <span className="text-white">{request.claimant?.name}</span> is claiming{' '}
                <span className="text-white">{request.lostItem?.itemName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Claim Message */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-3">Claim Message</h2>
          <p className="text-sm text-gray-300 leading-relaxed">{request.claimMessage}</p>
        </div>

        {/* Ownership Verification (only for respondent) */}
        {isRespondent && (
          <div className="card p-5 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 text-amber-400 mb-4">
              <Shield size={18} /> <h2 className="font-semibold">Ownership Verification</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-surface-muted mb-2 flex items-center gap-1">
                  <Lock size={12} /> Private details set by the claimant (from their lost report)
                </p>
                <div className="bg-surface-elevated rounded-xl p-4 border border-amber-500/20">
                  <p className="text-sm text-amber-300 font-medium">{request.privateDetailsChallenge || 'No private details were set.'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-surface-muted mb-2">Claimant's ownership proof answer</p>
                <div className="bg-surface-elevated rounded-xl p-4 border border-surface-border">
                  <p className="text-sm text-white">{request.privateFieldAnswer}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-surface-muted bg-surface-elevated rounded-xl p-3">
                <Shield size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p>Compare these carefully. If the claimant's answer matches the private details, they are likely the real owner. Accept or reject accordingly.</p>
              </div>
            </div>
          </div>
        )}

        {/* Respondent Note */}
        {request.respondentNote && (
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-2">Rejection Reason</h2>
            <p className="text-sm text-gray-300">{request.respondentNote}</p>
          </div>
        )}

        {/* Actions */}
        {isRespondent && request.status === 'Pending' && (
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white">Your Decision</h2>
            {!showReject ? (
              <div className="flex gap-3">
                <button onClick={handleAccept} disabled={acting}
                  className="btn-accent flex-1 gap-2"><CheckCircle size={16} /> Accept Claim</button>
                <button onClick={() => setShowReject(true)} disabled={acting}
                  className="btn-danger flex-1 gap-2"><XCircle size={16} /> Reject</button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea className="input min-h-[80px] resize-none" placeholder="Reason for rejection (optional but helpful)..."
                  value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
                <div className="flex gap-3">
                  <button onClick={handleReject} disabled={acting} className="btn-danger flex-1">Confirm Reject</button>
                  <button onClick={() => setShowReject(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message / Resolve */}
        {request.status === 'Accepted' && (
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white text-emerald-400">🎉 Request Accepted!</h2>
            <p className="text-sm text-surface-muted">You can now message each other to coordinate item pickup.</p>
            <div className="flex gap-3">
              <Link to={`/dashboard/messages/${request._id}`} className="btn-primary flex-1 gap-2">
                <MessageSquare size={16} /> Open Messages
              </Link>
              <button onClick={handleResolve} className="btn-accent flex-1">✅ Mark Resolved</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
