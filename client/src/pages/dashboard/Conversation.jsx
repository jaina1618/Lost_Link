import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { getInitials, timeAgo } from '../../utils';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Conversation() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await messageApi.getMessages(requestId);
      setMessages(res.data.data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {}
  };

  useEffect(() => {
    fetchMessages().finally(() => setLoading(false));
    // Poll every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await messageApi.sendMessage(requestId, content.trim());
      setContent('');
      fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    }
    setSending(false);
  };

  if (loading) return <div className="skeleton h-96 rounded-2xl" />;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-160px)] animate-fade-in">
      {/* Header */}
      <div className="card mb-4 p-4 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-lg"><ArrowLeft size={18} /></button>
        <div>
          <p className="font-semibold text-white text-sm">Recovery Conversation</p>
          <p className="text-xs text-surface-muted">Coordinate item pickup safely</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 card p-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-surface-muted text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.sender?._id === user?._id;
            return (
              <div key={msg._id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center text-xs font-bold flex-shrink-0 self-end">
                  {getInitials(msg.sender?.name)}
                </div>
                <div className={`max-w-xs lg:max-w-sm ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-primary-600 text-white rounded-br-md' : 'bg-surface-elevated text-white rounded-bl-md border border-surface-border'}`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-surface-muted">{timeAgo(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 flex-shrink-0">
        <input className="input flex-1" placeholder="Type a message..." value={content} onChange={e => setContent(e.target.value)} disabled={sending} />
        <button type="submit" disabled={sending || !content.trim()} className="btn-primary px-4">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
