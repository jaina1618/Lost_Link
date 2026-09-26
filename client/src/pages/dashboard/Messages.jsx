import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messageApi } from '../../api';
import { getInitials, timeAgo } from '../../utils';
import { MessageSquare } from 'lucide-react';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageApi.getConversations().then(r => setConversations(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2"><MessageSquare className="text-primary-400" /> Messages</h1>
        <p className="section-subtitle">Communicate with finders and claimants</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : conversations.length === 0 ? (
        <div className="card p-16 text-center">
          <MessageSquare size={48} className="mx-auto text-surface-muted opacity-30 mb-4" />
          <h3 className="font-semibold text-white mb-2">No Active Conversations</h3>
          <p className="text-surface-muted text-sm">Messages become available once a recovery request is accepted.</p>
          <Link to="/dashboard/requests" className="btn-primary mt-4 inline-block">View Requests</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => {
            const otherUser = conv.claimant?.name;
            return (
              <Link key={conv._id} to={`/dashboard/messages/${conv._id}`}
                className="card p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center font-bold flex-shrink-0">
                  {getInitials(conv.claimant?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                    Re: {conv.lostItem?.itemName}
                  </p>
                  <p className="text-xs text-surface-muted truncate">
                    Between {conv.claimant?.name} & {conv.respondent?.name}
                  </p>
                </div>
                <span className="text-primary-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
