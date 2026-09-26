import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { timeAgo } from '../../utils';
import toast from 'react-hot-toast';
import { Flag, CheckCircle, XCircle } from 'lucide-react';

export default function ModerationQueue() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getReports().then(r => setReports(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleReview = async (id, status, note) => {
    await adminApi.reviewReport(id, { status, adminNote: note });
    setReports(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    toast.success(`Report marked as ${status}.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2"><Flag className="text-rose-400" /> Moderation Queue</h1>
        <p className="section-subtitle">{reports.filter(r => r.status === 'Pending').length} pending reports</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center"><Flag size={48} className="mx-auto text-surface-muted opacity-30 mb-4" /><p className="text-surface-muted">No reports to review.</p></div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report._id} className={`card p-5 ${report.status === 'Pending' ? 'border-rose-500/20' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-xl flex-shrink-0">🚩</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{report.reason}</span>
                    <span className={`badge ${report.status === 'Pending' ? 'badge-pending' : report.status === 'Actioned' ? 'badge-accepted' : 'badge-closed'}`}>{report.status}</span>
                    <span className="text-xs text-surface-muted">Target: {report.targetType}</span>
                  </div>
                  <p className="text-xs text-surface-muted mt-1">By: {report.reportedBy?.name} · {timeAgo(report.createdAt)}</p>
                  {report.details && <p className="text-sm text-gray-300 mt-2">{report.details}</p>}
                </div>
                {report.status === 'Pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleReview(report._id, 'Actioned', 'Admin took action.')} className="text-emerald-400 hover:bg-emerald-500/10 p-2 rounded-lg transition-colors"><CheckCircle size={16} /></button>
                    <button onClick={() => handleReview(report._id, 'Dismissed', 'No action needed.')} className="text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"><XCircle size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
