import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Loader2, Users } from 'lucide-react';
import { io } from 'socket.io-client'; 
import { useAuth } from '../context/AuthContext'; 
import { Button } from './ui/button';
import { Input } from './ui/input'; 

let socket = null;

function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}

export default function AsteroidChatPanel({ asteroidId, asteroidName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketConn = getSocket();

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    if (!asteroidId) return;

    const handleLoadMessages = (msgs) => {
      setMessages(msgs);
      setError(null);
      setLoading(false);
    };

    const handleReceiveMessage = (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    };

    const handleUserJoined = (data) => {
      if (data.activeUsers) {
        setActiveUsers(data.activeUsers);
      }
    };

    const handleUserLeft = (data) => {
      if (data.activeUsers) {
        setActiveUsers(data.activeUsers);
      }
    };

    const handleUserTyping = (data) => {
      setTypingUsers(new Set(data.typingUsers || []));
    };

    const handleError = (errData) => {
      console.error('Socket error:', errData);
      setError(errData?.message || 'Connection error');
    };

 
    socketConn.on('load_messages', handleLoadMessages);
    socketConn.on('receive_message', handleReceiveMessage);
    socketConn.on('user_joined', handleUserJoined);
    socketConn.on('user_left', handleUserLeft);
    socketConn.on('user_typing', handleUserTyping);
    socketConn.on('error', handleError);

    socketConn.emit('join_asteroid', {
      asteroidId,
      userId: user?.id,
      userName: user?.username || 'Anonymous',
    });

   
    return () => {
      socketConn.off('load_messages', handleLoadMessages);
      socketConn.off('receive_message', handleReceiveMessage);
      socketConn.off('user_joined', handleUserJoined);
      socketConn.off('user_left', handleUserLeft);
      socketConn.off('user_typing', handleUserTyping);
      socketConn.off('error', handleError);
      
      socketConn.emit('leave_asteroid', {
        asteroidId,
        userName: user?.username || 'Anonymous',
      });
    };
  }, [asteroidId, user?.id, user?.username, socketConn]);

  
  const handleInputChange = (e) => {
    setInput(e.target.value);

   
    if (!isTyping) {
      setIsTyping(true);
      socketConn.emit('typing', {
        asteroidId,
        userId: user?.id,
        userName: user?.username,
        isTyping: true,
      });
    }


    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

  
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketConn.emit('typing', {
        asteroidId,
        userId: user?.id,
        userName: user?.username,
        isTyping: false,
      });
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !user || !asteroidId) return;

   
    socketConn.emit('send_message', {
      asteroidId,
      userId: user.id,
      userName: user.username,
      text,
    });

    setInput('');
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] lg:min-h-[600px] rounded-2xl border border-white/20 bg-gradient-to-br from-black/40 via-black/30 to-black/40 shadow-2xl backdrop-blur-sm">

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 via-accent-purple/10 to-transparent" />
        <div className="relative flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
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

    
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">{activeUsers.length}</span>
            </div>
          )}
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
          <>
            {messages.map((m, idx) => {
              const isCurrentUser = user?.id === m.userId;
              return (
                <div
                  key={m.id}
                  className={`animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-1.5 ${
                    isCurrentUser ? 'items-end' : 'items-start'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      isCurrentUser
                        ? 'bg-gradient-to-br from-accent-purple/30 to-accent-purple/20 border border-accent-purple/40'
                        : 'bg-white/[0.08] border border-white/10'
                    } backdrop-blur-sm`}
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold ${
                          isCurrentUser ? 'text-accent-purple' : 'text-blue-400'
                        }`}
                      >
                        {m.userName}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-100 break-words leading-relaxed">
                      {m.text}
                    </p>
                  </div>
                </div>
              );
            })}

        
            {typingUsers.size > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200" />
                </div>
                <span>
                  {Array.from(typingUsers)
                    .slice(0, 2)
                    .map((id) => {
                      const typingUser = activeUsers.find((u) => u.userId === id);
                      return typingUser?.userName;
                    })
                    .filter(Boolean)
                    .join(', ')}{' '}
                  {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            )}
          </>
        )}
      </div>

    
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20">
        {user ? (
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:border-accent-purple/40 focus:ring-2 focus:ring-accent-purple/20 rounded-xl px-4 h-11 transition-all"
              maxLength={2000}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim()}
              className="shrink-0 h-11 px-5 bg-gradient-to-r from-accent-purple to-accent-purple/80 hover:from-accent-purple/90 hover:to-accent-purple/70 text-white rounded-xl shadow-lg shadow-accent-purple/25 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-3 px-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-gray-400">
              <Link
                to="/login"
                className="text-accent-purple hover:text-accent-purple/80 font-semibold transition-colors"
              >
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