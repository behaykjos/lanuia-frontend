import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo, faShield, faFaceSmile, faBook } from '@fortawesome/free-solid-svg-icons';

function Avatar({ name, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color || '#E8AFC2', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: size * 0.38,
      flexShrink: 0,
    }}>
      {name?.[0]?.toUpperCase() || 'U'}
    </div>
  );
}

const REACTIONS = ['♥', '😂', '😮', '😢', '👏', '🔥'];

function MessageBubble({ msg, isMe, showAvatar, convColor, onReact }) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div
      className={`dm-msg-row ${isMe ? 'dm-msg-me' : 'dm-msg-them'}`}
      style={{ alignItems: 'flex-end', position: 'relative' }}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Avatar da outra pessoa — só no fim da sequência */}
      {!isMe && (
        <div style={{ width: 32, flexShrink: 0 }}>
          {showAvatar && <Avatar name={msg.senderName} color={convColor} size={32} />}
        </div>
      )}

      <div style={{ position: 'relative', maxWidth: '60%' }}>
        {/* Botão de reação ao hover */}
        {showReactions && !msg.isReaction && (
          <div className={`dm-reaction-picker ${isMe ? 'dm-reaction-picker-me' : 'dm-reaction-picker-them'}`}>
            {REACTIONS.map(r => (
              <button key={r} className="dm-reaction-option" onClick={() => onReact(msg.id, r)}>
                {r}
              </button>
            ))}
          </div>
        )}

        <div className={`dm-bubble ${msg.isReaction ? 'dm-bubble-reaction' : ''} ${isMe ? 'dm-bubble-me' : 'dm-bubble-them'}`}>
          {msg.text}
        </div>

        {/* Reação deixada na mensagem */}
        {msg.reaction && (
          <div className={`dm-msg-reaction ${isMe ? 'dm-msg-reaction-me' : 'dm-msg-reaction-them'}`}>
            {msg.reaction}
          </div>
        )}
      </div>

      {/* Avatar do utilizador local — só no fim da sequência, à direita */}
      {isMe && (
        <div style={{ width: 32, flexShrink: 0 }}>
          {showAvatar && <Avatar name="Eu" color="#c8a4b8" size={32} />}
        </div>
      )}
    </div>
  );
}

const ChatWindow = ({ conversation, messages: initialMessages }) => {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState(initialMessages || []);
  const [showStickerMenu, setShowStickerMenu] = useState(false);
  const bottomRef = useRef(null);
  const stickerRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Fecha menu ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (stickerRef.current && !stickerRef.current.contains(e.target)) {
        setShowStickerMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMsgs(prev => [...prev, {
      id: Date.now(),
      from: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  const handleReact = (msgId, emoji) => {
    setMsgs(prev => prev.map(m => m.id === msgId ? { ...m, reaction: emoji } : m));
  };

  // Só mostra o avatar se for a última mensagem de uma sequência do mesmo remetente.
  const isLastInSequence = (index) => {
    const current = msgs[index];
    const next = msgs[index + 1];
    if (!next) return true;
    if (next.from === 'system') return true;
    return next.from !== current.from;
  };

  return (
    <div className="dm-chat">
      {/* Header */}
      <div className="dm-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={conversation.name} color={conversation.avatarColor} size={38} />
          <div>
            <span className="dm-chat-name">{conversation.name}</span>
            <span className="dm-chat-nick"> {conversation.nick}</span>
          </div>
        </div>
        <FontAwesomeIcon icon={faInfo} style={{ color: '#aaa', fontSize: 18, cursor: 'pointer' }} />
      </div>

      {/* Mensagens */}
      <div className="dm-messages">
        {msgs.map((msg, index) => {
          if (msg.from === 'system') {
            return <div key={msg.id} className="dm-date-divider">{msg.text}</div>;
          }
          const isMe = msg.from === 'me';
          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMe={isMe}
              showAvatar={isLastInSequence(index)}
              convColor={conversation.avatarColor}
              onReact={handleReact}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="dm-input-bar">
        {/* Sticker / elementos gráficos */}
        <div className="dm-sticker-wrapper" ref={stickerRef}>
          {showStickerMenu && (
            <div className="dm-sticker-menu">
              <button className="dm-sticker-option" onClick={() => setShowStickerMenu(false)}>
                <FontAwesomeIcon icon={faFaceSmile} />
                <span>Emojis</span>
              </button>
              <button className="dm-sticker-option" onClick={() => setShowStickerMenu(false)}>
                <FontAwesomeIcon icon={faBook} />
                <span>Enviar livro</span>
              </button>
            </div>
          )}
          <button
            className="dm-sticker-btn"
            onClick={() => setShowStickerMenu(v => !v)}
            title="Elementos gráficos"
          >
            ✿
          </button>
        </div>

        <input
          className="dm-input"
          placeholder="Message"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />

        {/* Badge de segurança */}
        <button className="dm-security-btn" title="Conversa segura">
          <FontAwesomeIcon icon={faShield} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;