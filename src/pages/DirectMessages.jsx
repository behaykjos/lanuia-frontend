import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCircleInfo, faPaperPlane, faImage, faFaceSmile } from '@fortawesome/free-solid-svg-icons';
 
const CONVERSATIONS = [
  {
    id: 1,
    name: 'Ana Carolina',
    nick: '@anacarolina',
    avatarColor: '#d4a0b5',
    lastMessage: 'Sent a review!',
    time: '2h',
    unread: true,
  },
  {
    id: 2,
    name: 'Valew Nataliina',
    nick: '@valew',
    avatarColor: '#c8a4b8',
    lastMessage: 'Apaga pelo amor de Deus eu...',
    time: '7h',
    unread: false,
  },
  {
    id: 3,
    name: 'ch_riss',
    nick: '@chriss',
    avatarColor: '#b8869e',
    lastMessage: '♥ ♥ ♥',
    time: '2d',
    unread: false,
  },
  {
    id: 4,
    name: 'fxx_akira',
    nick: '@fxxakira',
    avatarColor: '#9d6b7a',
    lastMessage: 'Calado sua passiva',
    time: '2d',
    unread: false,
  },
  {
    id: 5,
    name: '546mlm',
    nick: '@546mlm',
    avatarColor: '#c49ab8',
    lastMessage: 'Sent a post!',
    time: '3d',
    unread: false,
  },
  {
    id: 6,
    name: 'Lauren ama Rhea',
    nick: '@maridadarhea',
    avatarColor: '#E8AFC2',
    lastMessage: 'Reacted: ♥',
    time: '2w',
    unread: false,
  },
];
 
const MESSAGES = {
  6: [
    { id: 1, from: 'them', text: 'Eu acho que ela podia ter entregado mais no livro sabe', time: '14:02' },
    { id: 2, from: 'them', text: 'Esperava porradarlaaa', time: '14:03' },
    { id: 3, from: 'them', text: 'Kkkkkk', time: '14:04' },
    { id: 4, from: 'system', text: 'Thursday, May 23' },
    { id: 5, from: 'me', text: 'Ah, sim né', time: '09:11' },
    { id: 6, from: 'me', text: 'O romance do nada grita mais alto, não acho que era o que a gente esperava com toda aquela trilogia né', time: '09:12' },
    { id: 7, from: 'them', text: 'Mas também, um Cardan daqueles...', time: '09:15' },
    { id: 8, from: 'me', text: '♥ ♥ ♥ ♥ ♥', time: '09:16', isReaction: true },
  ],
};
 
function Avatar({ name, color, size = 40 }) {
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
 
const EmptyState = ({ onStartChat }) => (
  <div className="dm-empty">
    <img
      src="https://images.joseartgallery.com/64453/conversions/flower-painting-lake-lotus-water-lily-pond-thumb900.jpg"
      alt="nenúfar"
      className="dm-empty-img"
    />
    <h2 className="dm-empty-title">Direct messages</h2>
    <p className="dm-empty-subtitle">
      Each chat is a sparkling water lily. Why don't you try jumping on them?
    </p>
    <button className="dm-start-btn" onClick={onStartChat}>
      Start new chat
    </button>
  </div>
);
 
const ChatWindow = ({ conversation, messages, onBack }) => {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState(messages || []);
  const bottomRef = useRef(null);
 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);
 
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
 
  return (
    <div className="dm-chat">
      {/* Header */}
      <div className="dm-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <span className="dm-chat-name">{conversation.name}</span>
            &nbsp;
            <span className="dm-chat-nick"> {conversation.nick}</span>
          </div>
        </div>
        <FontAwesomeIcon icon={faCircleInfo} style={{ color: '#aaa', fontSize: 18, cursor: 'pointer' }} />
      </div>
 
      {/* Mensagens */}
      <div className="dm-messages">
        {msgs.map((msg, index) => {
          if (msg.from === 'system') {
            return (
              <div key={msg.id} className="dm-date-divider">{msg.text}</div>
            );
          }

          const isMe = msg.from === 'me';

          // Verifica se é a última mensagem da sequência
          const nextMsg = msgs[index + 1];
          // Salta mensagens de sistema para verificar quem vem a seguir
          const getNextRealMsg = (index) => {
            for (let i = index + 1; i < msgs.length; i++) {
              if (msgs[i].from !== 'system') return msgs[i];
            }
            return null; // ← fora do for
          };

          const nextReal = getNextRealMsg(index);
          const isLast = !nextReal || nextReal.from !== msg.from;

          return (
            <div key={msg.id} className={`dm-msg-row ${isMe ? 'dm-msg-me' : 'dm-msg-them'}`}>
              {/* Espaço reservado à esquerda (outra pessoa) */}
              {!isMe && (
                <div style={{ width: 32, flexShrink: 0 }}>
                  {isLast && <Avatar name={conversation.name} color={conversation.avatarColor} size={32} />}
                </div>
              )}

              <div className={`dm-bubble ${msg.isReaction ? 'dm-bubble-reaction' : ''} ${isMe ? 'dm-bubble-me' : 'dm-bubble-them'}`}>
                {msg.text}
              </div>

              {/* Espaço reservado à direita (eu) */}
              {isMe && (
                <div style={{ width: 32, flexShrink: 0 }}>
                  {isLast && <Avatar name="Eu" color="#c8a4b8" size={32} />}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
 
      {/* Input */}
      <div className="dm-input-bar">
        <input
          className="dm-input"
          placeholder="Message"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <div className="dm-input-actions">
          <FontAwesomeIcon icon={faImage} style={{ color: '#bbb', cursor: 'pointer' }} />
          <button className="dm-send-btn" onClick={sendMessage}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
};
 
const DirectMessages = () => {
  const [activeConv, setActiveConv] = useState(null);
  const [search, setSearch] = useState('');
 
  const filtered = CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="layout">
      <Sidebar />
 
      {/* Centro */}
      <main className="feed" style={{ padding: 0 }}>
        {activeConv
          ? <ChatWindow
              conversation={activeConv}
              messages={MESSAGES[activeConv.id] || []}
              onBack={() => setActiveConv(null)}
            />
          : <EmptyState onStartChat={() => setActiveConv(CONVERSATIONS[0])} />
        }
      </main>
 
      {/* Lista de conversas */}
      <aside className="right-column" style={{ width: 280 }}>
        <div className="search-container" style={{ marginTop: 20 }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: '#9d6b7a' }} />
          <input
            placeholder="Pesquisar amigos & chats"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
 
        <div className="dm-conv-list">
          {filtered.map(conv => (
            <div
              key={conv.id}
              className={`dm-conv-item ${activeConv?.id === conv.id ? 'dm-conv-active' : ''}`}
              onClick={() => setActiveConv(conv)}
            >
              <Avatar name={conv.name} color={conv.avatarColor} size={42} />
              <div className="dm-conv-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="dm-conv-name">{conv.name}</span>
                  <span className="dm-conv-time">{conv.time}</span>
                </div>
                <span className={`dm-conv-last ${conv.unread ? 'dm-conv-unread' : ''}`}>
                  {conv.lastMessage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
 
export default DirectMessages;