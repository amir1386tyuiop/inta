import { useState, useEffect, useRef } from 'react';
import { ai } from '../services/api';
import toast from 'react-hot-toast';
import { FiSend, FiPlus, FiMessageCircle } from 'react-icons/fi';

export default function AiChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    ai.sessions().then(setSessions).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSession = async (sessionId) => {
    try {
      const data = await ai.sessionMessages(sessionId);
      setCurrentSession(sessionId);
      setMessages(data.messages || []);
    } catch {
      toast.error('خطا در بارگذاری چت');
    }
  };

  const newChat = () => {
    setCurrentSession(null);
    setMessages([]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await ai.chat({ message: input, sessionId: currentSession });
      setCurrentSession(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, createdAt: new Date().toISOString() }]);
      ai.sessions().then(setSessions).catch(() => {});
    } catch (err) {
      toast.error(err.message || 'خطا در ارتباط با هوش مصنوعی');
      setMessages(prev => [...prev, { role: 'assistant', content: 'متأسفانه خطایی رخ داده. لطفاً مطمئن شوید API Key تنظیم شده.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <button className="btn btn-accent" style={{ width: '100%', marginBottom: 12 }} onClick={newChat}>
          <FiPlus /> چت جدید
        </button>
        <div className="chat-sessions">
          {sessions.map(s => (
            <button key={s.id} className={`chat-session-btn ${currentSession === s.id ? 'active' : ''}`} onClick={() => loadSession(s.id)}>
              <FiMessageCircle />
              <span>{s.title || 'چت بدون عنوان'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <FiMessageCircle size={48} />
              <h3>چت هوشمند حقوقی</h3>
              <p>سؤالات حقوقی خود را بپرسید. هوش مصنوعی به تمام داده‌های سایت دسترسی دارد.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">{msg.role === 'user' ? 'شما' : 'AI'}</div>
              <div className="message-content">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{msg.content}</pre>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-avatar">AI</div>
              <div className="message-content typing">در حال تایپ...</div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        <form className="chat-input" onSubmit={sendMessage}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="سؤال حقوقی خود را بنویسید..." disabled={loading} />
          <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
            <FiSend />
          </button>
        </form>
      </div>

      <style>{`
        .chat-page { display: flex; height: calc(100vh - 64px); margin: -32px; }
        .chat-sidebar {
          width: 260px;
          background: #fff;
          border-left: 1px solid var(--border);
          padding: 16px;
          overflow-y: auto;
        }
        .chat-sessions { display: flex; flex-direction: column; gap: 4px; }
        .chat-session-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border: none;
          background: transparent;
          border-radius: var(--radius-sm);
          font-size: 13px;
          text-align: right;
          cursor: pointer;
          color: var(--text);
          transition: var(--transition);
        }
        .chat-session-btn span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .chat-session-btn:hover { background: var(--bg); }
        .chat-session-btn.active { background: #dbeafe; color: var(--primary); }
        .chat-main { flex: 1; display: flex; flex-direction: column; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 24px; }
        .chat-message {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          max-width: 80%;
        }
        .chat-message.user { margin-right: auto; flex-direction: row-reverse; margin-left: 0; }
        .chat-message.assistant { margin-left: auto; margin-right: 0; }
        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .chat-message.user .message-avatar { background: var(--primary); color: #fff; }
        .chat-message.assistant .message-avatar { background: var(--accent); color: var(--primary-dark); }
        .message-content {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.8;
        }
        .chat-message.user .message-content {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }
        .typing { color: var(--text-secondary); font-style: italic; }
        .chat-input {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          background: #fff;
          border-top: 1px solid var(--border);
        }
        .chat-input input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 14px;
        }
        .chat-input input:focus { outline: none; border-color: var(--primary); }
        @media (max-width: 768px) {
          .chat-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}
