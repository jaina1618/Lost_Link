import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { matchApi, requestApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import MatchScoreBar from '../../components/matches/MatchScoreBar';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';

export default function MatchDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimForm, setClaimForm] = useState({ claimMessage: '', privateFieldAnswer: '' });

  useEffect(() => {
    matchApi.getById(id).then(r => setMatch(r.data.data)).catch(() => navigate('/dashboard/matches')).finally(() => setLoading(false));
  }, [id]);

  const isLostOwner = match && match.lostItemOwner?._id === user?._id;

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!claimForm.claimMessage || !claimForm.privateFieldAnswer)
      return toast.error('Please fill in both the claim message and ownership proof.');
    setClaiming(true);
    try {
      await requestApi.create({
        lostItemId: match.lostItem._id,
        foundItemId: match.foundItem._id,
        matchId: match._id,
        ...claimForm,
      });
      toast.success('Recovery request sent! The finder will review your claim.');
      navigate('/dashboard/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request.');
    }
    setClaiming(false);
  };

  if (loading) return <div className="skeleton h-96 rounded-2xl" />;
  if (!match) return null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6 -ml-2"><ArrowLeft size={16} /> Back to Matches</button>

      <div className="space-y-6">
        {/* Score */}
        <div className="card p-6">
          <h1 className="section-title mb-6">Match Analysis</h1>
          <MatchScoreBar score={match.matchScore} breakdown={match.scoreBreakdown} />
        </div>

        {/* Items */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card p-5 border-rose-500/20">
            <p className="text-xs text-rose-400 font-semibold mb-3">🔍 LOST ITEM</p>
            <h3 className="font-bold text-white">{match.lostItem?.itemName}</h3>
            <div className="space-y-1.5 mt-3 text-xs text-surface-muted">
              <p>Category: {match.lostItem?.category}</p>
              <p>Color: {match.lostItem?.color || 'N/A'}</p>
              <p>Brand: {match.lostItem?.brand || 'N/A'}</p>
              <p>Location: {match.lostItem?.location?.city}</p>
              <p>Date Lost: {formatDate(match.lostItem?.dateLost)}</p>
            </div>
            <Link to={`/items/lost/${match.lostItem?._id}`} className="btn-ghost btn-sm mt-4 w-full text-center">View Full Report</Link>
          </div>

          <div className="card p-5 border-emerald-500/20">
            <p className="text-xs text-emerald-400 font-semibold mb-3">📦 FOUND ITEM</p>
            <h3 className="font-bold text-white">{match.foundItem?.itemName}</h3>
            <div className="space-y-1.5 mt-3 text-xs text-surface-muted">
              <p>Category: {match.foundItem?.category}</p>
              <p>Color: {match.foundItem?.color || 'N/A'}</p>
              <p>Brand: {match.foundItem?.brand || 'N/A'}</p>
              <p>Location: {match.foundItem?.location?.city}</p>
              <p>Date Found: {formatDate(match.foundItem?.dateFound)}</p>
            </div>
            <Link to={`/items/found/${match.foundItem?._id}`} className="btn-ghost btn-sm mt-4 w-full text-center">View Full Report</Link>
          </div>
        </div>

        {/* Claim Form — only for lost item owner */}
        {isLostOwner && (
          <div className="card p-6 border-primary-500/20">
            <h2 className="font-semibold text-white mb-2">Send Recovery Request</h2>
            <p className="text-xs text-surface-muted mb-4">
              Convince the finder that this is your item. You must provide your private ownership proof — this is compared against the details you set when creating your lost report.
            </p>
            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="input-label">Claim Message</label>
                <textarea className="input min-h-[80px] resize-none" placeholder="Explain why this is your item, any additional context..."
                  value={claimForm.claimMessage} onChange={e => setClaimForm({...claimForm, claimMessage: e.target.value})} required />
              </div>
              <div>
                <label className="input-label">Ownership Proof <span className="text-amber-400">🔐</span></label>
                <textarea className="input min-h-[80px] resize-none border-amber-500/30 focus:ring-amber-500/50"
                  placeholder="Provide the private identifying detail you set when creating this lost report..."
                  value={claimForm.privateFieldAnswer} onChange={e => setClaimForm({...claimForm, privateFieldAnswer: e.target.value})} required />
                <p className="text-xs text-amber-400/70 mt-1">Only the finder can see this. They will compare it against your private details to verify ownership.</p>
              </div>
              <button type="submit" disabled={claiming} className="btn-primary w-full">
                <Send size={16} /> {claiming ? 'Sending...' : 'Send Recovery Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
