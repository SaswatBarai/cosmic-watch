import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';

const POLL_INTERVAL_MS = 4000;

export default function AsteroidChatPanel({ asteroidId, asteroidName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const listRef = useRef(null);

  const fetchMessages = async () => {
    if (!asteroidId) return;
    try {
      const res = await api.get(`/asteroids/${asteroidId}/chat`);
      setMessages(res.data.messages || []);
      setError(null);
    } catch (err) {
      setError('Could not load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [asteroidId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !user || sending || !asteroidId) return;
    setSending(true);
    try {
      const newMsg = await api.post(`/asteroids/${asteroidId}/chat`, { text });
      setMessages((prev) => [...prev, newMsg.data]);
      setInput('');
    } catch (err) {
      setError('Failed to send. Log in and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] lg:min-h-[600px] rounded-2xl border border-white/20 bg-gradient-to-br from-black/40 via-black/30 to-black/40 shadow-2xl backdrop-blur-sm">
      {/* Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 via-accent-purple/10 to-transparent" />
        <div className="relative flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="p-2 rounded-lg bg-accent-purple/20 border border-accent-purple/30">
            <MessageCircle className="h-5 w-5 text-accent-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Live Chat</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-green-400 font-medium uppercase tracking-wider">Live</span>
              </div>
            </div>
            <span className="text-xs text-gray-500 truncate block">{asteroidName}</span>
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px]"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#8b5cf6 transparent' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent-purple" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
              <p className="text-sm text-amber-400">{error}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
              <MessageCircle className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 max-w-[240px]">
              No messages yet. Be the first to start the conversation about this asteroid.
            </p>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isCurrentUser = user?.id === m.userId;
            return (
              <div
                key={m.id}
                className={`animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-1.5 ${
                  isCurrentUser ? 'items-end' : 'items-start'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  isCurrentUser
                    ? 'bg-gradient-to-br from-accent-purple/30 to-accent-purple/20 border border-accent-purple/40'
                    : 'bg-white/[0.08] border border-white/10'
                } backdrop-blur-sm`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xs font-semibold ${
                      isCurrentUser ? 'text-accent-purple' : 'text-blue-400'
                    }`}>
                      {m.userName}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-100 break-words leading-relaxed">{m.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20">
        {user ? (
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:border-accent-purple/40 focus:ring-2 focus:ring-accent-purple/20 rounded-xl px-4 h-11 transition-all"
              maxLength={2000}
              disabled={sending}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || sending}
              className="shrink-0 h-11 px-5 bg-gradient-to-r from-accent-purple to-accent-purple/80 hover:from-accent-purple/90 hover:to-accent-purple/70 text-white rounded-xl shadow-lg shadow-accent-purple/25 transition-all duration-200 hover:scale-105"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <div className="text-center py-3 px-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-gray-400">
              <Link to="/login" className="text-accent-purple hover:text-accent-purple/80 font-semibold transition-colors">
                Log in
              </Link>
              {' '}to join the conversation
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
