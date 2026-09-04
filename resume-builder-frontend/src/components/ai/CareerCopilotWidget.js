import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Send, Copy } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CareerCopilotWidget = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      title: '✨ Gemini Career Copilot',
      text: 'Hi! I am your AI Career Document Copilot powered by Google Gemini. How can I help you today?',
      actions: [
        '🔍 Critique My Resume',
        '⚡ Rewrite a Weak Bullet',
        '🎯 Job Match Strategy',
        '📝 Cover Letter Advice'
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (actionType = null, customText = null) => {
    const textToSend = customText || query;
    if (!textToSend.trim() && !actionType) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend || (actionType ? actionType.replace(/_/g, ' ') : 'Help')
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/ai/copilot-query', {
        action: actionType,
        query: textToSend
      });

      if (res.data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            title: res.data.title || '✨ Gemini Insights',
            text: res.data.content,
            suggestedActions: res.data.suggestedActions || []
          }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          title: '⚡ Career Navigation',
          text: 'Here are quick shortcuts to help optimize your documents:',
          suggestedActions: ['Open Resume Builder', 'Open Job Match', 'Open Cover Letter']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (actionName) => {
    const cleanAction = actionName.replace(/^[🔍⚡🎯📝💡]\s*/, '').trim();

    if (cleanAction === 'Rewrite a Weak Bullet' || cleanAction === 'Enhance Bullet Point') {
      handleSend('enhance_bullet', 'Enhance this bullet: Built user interface components using React and Node.js with modern features');
    } else if (cleanAction === 'Critique My Resume' || cleanAction === 'Critique Resume') {
      handleSend('critique_resume', 'Critique my resume structure and give 3 specific improvement areas');
    } else if (cleanAction === 'Job Match Strategy' || cleanAction === 'Open Job Match' || cleanAction === 'Check Job Match') {
      navigate('/job-match');
      setIsOpen(false);
      addToast('Navigated to Job Match tool.', 'info');
    } else if (cleanAction === 'Cover Letter Advice' || cleanAction === 'Open Cover Letter') {
      navigate('/cover-letter');
      setIsOpen(false);
      addToast('Navigated to Cover Letter Builder.', 'info');
    } else if (cleanAction === 'Open Resume Builder' || cleanAction === 'Apply to Resume') {
      navigate('/builder');
      setIsOpen(false);
    } else {
      handleSend(null, cleanAction);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'info');
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Helper to render markdown formatting cleanly
  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h5 key={idx} style={{ margin: '8px 0 4px 0', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{line.replace('### ', '')}</h5>;
      }
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return <h4 key={idx} style={{ margin: '10px 0 6px 0', fontSize: '0.9rem', fontWeight: 700 }}>{line.replace(/^#+\s*/, '')}</h4>;
      }
      if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
        const bulletContent = line.replace(/^[-•*]\s+/, '');
        const safeHtml = escapeHtml(bulletContent).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <li key={idx} style={{ margin: '3px 0', fontSize: '0.8rem', lineHeight: '1.4' }}>
            <span dangerouslySetInnerHTML={{ __html: safeHtml }} />
          </li>
        );
      }
      if (/^\d+\.\s+/.test(line)) {
        const safeHtml = escapeHtml(line).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <div key={idx} style={{ margin: '4px 0', fontSize: '0.8rem', lineHeight: '1.4', paddingLeft: '4px' }}>
            <span dangerouslySetInnerHTML={{ __html: safeHtml }} />
          </div>
        );
      }
      if (!line.trim()) return <div key={idx} style={{ height: '4px' }} />;
      const safeHtml = escapeHtml(line).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p key={idx} style={{ margin: '3px 0', fontSize: '0.8rem', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: safeHtml }} />
      );
    });
  };

  return (
    <div className="no-print" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            borderRadius: '50px',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Sparkles size={18} />
          <span>Career Copilot</span>
          <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '10px' }}>AI</span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          style={{
            width: '380px',
            height: '520px',
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Career Copilot
                  <span style={{ fontSize: '0.625rem', color: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                    Gemini 2.5
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Real-time ATS & Career AI</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-app)' }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  backgroundColor: m.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                  padding: '10px 12px',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  fontSize: '0.8125rem'
                }}
              >
                {m.title && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{m.title}</span>
                    <button
                      onClick={() => copyToClipboard(m.text)}
                      title="Copy response"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 2px' }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                )}

                <div>{renderMarkdown(m.text)}</div>

                {/* Suggested Action Chips */}
                {m.actions && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {m.actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(act)}
                        style={{
                          fontSize: '0.72rem',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          textAlign: 'left'
                        }}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}

                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                    {m.suggestedActions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(s)}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          background: 'var(--accent-light)',
                          color: 'var(--accent-primary)',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {s} →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} className="spin-slow" /> Consulting Gemini AI...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips Bar */}
          <div style={{ padding: '6px 10px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '4px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <button
              onClick={() => handleActionClick('Critique My Resume')}
              style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              🔍 Critique Resume
            </button>
            <button
              onClick={() => handleActionClick('Rewrite a Weak Bullet')}
              style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              ⚡ Fix Bullet
            </button>
            <button
              onClick={() => handleActionClick('Job Match Strategy')}
              style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              🎯 Job Match
            </button>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '6px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Ask anything or paste a bullet..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 10px' }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CareerCopilotWidget;
