import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

function Avatar({ name, color, size = 40, src }) {
  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
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

const EmptyState = () => (
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
  </div>
);

const DirectMessages = () => {
  const [chats, setChats] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const me = JSON.parse(localStorage.getItem('@Lanuia:user') || '{}');

  const loadAll = async () => {
    try {
      const [chatsRes, followingRes] = await Promise.all([
        api.get('/chats'),
        api.get('/users/following'),
      ]);
      setChats(chatsRes.data);
      setFollowing(followingRes.data);
    } catch (err) {
      console.error('Error while loading chats or users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const loadMessages = async (chatId) => {
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error while loading messages:', err);
      setMessages([]);
    }
  };

  // Abre um chat já existente (vindo da lista CONVERSATIONS normal)
  const openExistingChat = async (chat) => {
    setActiveChat({ id: chat.id, otherUser: chat.otherUser });
    await loadMessages(chat.id);
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
  };

  // Abre (ou cria, se ainda não existir) um chat a partir de um utilizador seguido
  const openChatWithUser = async (user) => {
    const existingChat = chats.find(c => c.otherUser?.id === user.id);
    if (existingChat) {
      return openExistingChat(existingChat);
    }

    try {
      const res = await api.post('/chats', { targetUserId: user.id });
      const newChat = { id: res.data.id, otherUser: user, lastMessage: null, unreadCount: 0 };
      setChats(prev => [newChat, ...prev]);
      setActiveChat({ id: newChat.id, otherUser: user });
      setMessages([]);
    } catch (err) {
      console.error('Error while starting chat:', err);
    }
  };

  const handleSend = async (content) => {
    try {
      const res = await api.post(`/chats/${activeChat.id}/messages`, { content });
      setMessages(prev => [...prev, res.data]);
      setChats(prev => prev.map(c =>
        c.id === activeChat.id
          ? { ...c, lastMessage: { content, sentAt: res.data.sentAt, fromMe: true } }
          : c
      ));
    } catch (err) {
      console.error('Error while sending message:', err);
    }
  };

  const formattedMessages = messages.map(m => ({
    id: m.id,
    from: m.userId === me.id ? 'me' : 'them',
    text: m.content,
    senderName: m.user?.name,
    time: new Date(m.sentAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
  }));

  // Junta cada utilizador seguido com o respetivo chat (se existir), para mostrar a última mensagem
  const followingWithChats = following.map(user => {
    const chat = chats.find(c => c.otherUser?.id === user.id);
    return { user, chat };
  });

  const isSearching = search.trim().length > 0;
  const filteredFollowing = followingWithChats.filter(({ user }) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.nick?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="layout">
      <Sidebar />

      <main className="feed" style={{ padding: 0 }}>
        {activeChat
          ? <ChatWindow
              conversation={{
                name: activeChat.otherUser?.name,
                nick: `@${activeChat.otherUser?.nick}`,
                avatarColor: 'var(--accent-soft)',
              }}
              messages={formattedMessages}
              onSend={handleSend}
            />
          : <EmptyState />
        }
      </main>

      <aside className="right-column" style={{ width: 280 }}>
        <div className="search-container" style={{ marginTop: 20 }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            placeholder="Search friends & chats"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Pesquisa ativa: mostra utilizadores que sigo, em formato de card */}
        {isSearching ? (
          <div className="suggestions-box">
            {filteredFollowing.length === 0 && (
              <p style={{ padding: '8px 4px', color: '#999', fontSize: 13 }}>
                No user found.
              </p>
            )}
            {filteredFollowing.map(({ user, chat }) => (
              <div
                key={user.id}
                className="suggestion-card"
                style={{ cursor: 'pointer' }}
                onClick={() => openChatWithUser(user)}
              >
                <Avatar name={user.name} src={user.profilepic} size={38} />
                <div className="suggestion-info">
                  <span className="suggestion-name">{user.name}</span>
                  <span className="suggestion-nick">@{user.nick}</span>
                </div>
                <span style={{ fontSize: 11, color: '#999', maxWidth: 80, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {chat?.lastMessage
                    ? `${chat.lastMessage.fromMe ? 'Você: ' : ''}${chat.lastMessage.content}`
                    : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Sem pesquisa: lista normal de conversas existentes
          <div className="dm-conv-list">
            {loading && <p style={{ padding: 12, color: '#999', fontSize: 13 }}>A carregar...</p>}

            {!loading && chats.length === 0 && (
              <p style={{ padding: 12, color: '#999', fontSize: 13 }}>No conversation yet... ribbit.</p>
            )}

            {chats.map(chat => (
              <div
                key={chat.id}
                className={`dm-conv-item ${activeChat?.id === chat.id ? 'dm-conv-active' : ''}`}
                onClick={() => openExistingChat(chat)}
              >
                <Avatar name={chat.otherUser?.name} src={chat.otherUser?.profilepic} size={42} />
                <div className="dm-conv-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="dm-conv-name">{chat.otherUser?.name}</span>
                    {chat.lastMessage && (
                      <span className="dm-conv-time">
                        {new Date(chat.lastMessage.sentAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <span className={`dm-conv-last ${chat.unreadCount > 0 ? 'dm-conv-unread' : ''}`}>
                    {chat.lastMessage
                      ? `${chat.lastMessage.fromMe ? 'Você: ' : ''}${chat.lastMessage.content}`
                      : 'No messages yet.'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
};

export default DirectMessages;