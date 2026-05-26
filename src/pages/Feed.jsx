import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faShareFromSquare, faStar, faPaperPlane, faFrog, faWater, faWandMagicSparkles, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const Feed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activatedMessage, setActivatedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('publicacoes');

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('@Lanuia:token') || localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:3333/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const fresh = await res.json();
        setUser(fresh);
        localStorage.setItem('@Lanuia:user', JSON.stringify(fresh));
      }
    } catch (err) { console.error('could not refresh user', err); }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('activated') === 'true') {
      setActivatedMessage(true);
      window.history.replaceState({}, document.title, '/feed');
      refreshUser();
    }
  }, [location]);

  useEffect(() => {
    if (activatedMessage) {
      const timer = setTimeout(() => setActivatedMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [activatedMessage]);

  useEffect(() => { refreshUser(); }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('@Lanuia:user') || localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    else navigate('/');
  }, [navigate]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="layout">
      <Sidebar />

      <main className="feed">
        <div className="feed-container">

          {activatedMessage && (
            <div className="success-box" style={{ marginTop: 20 }}>
              <FontAwesomeIcon icon={faCheck} /> Conta ativada! Bem-vinda à Lanuia.
            </div>
          )}
          {!user.isActive && (
            <div className="warning-banner" style={{ borderRadius: 12, marginTop: 20 }}>
              <span><FontAwesomeIcon icon={faBell} /> Confirma o teu email para ativares a conta.</span>
            </div>
          )}

          <div className="feed-tabs">
            <button className={activeTab === 'publicacoes' ? 'active-tab' : ''} onClick={() => setActiveTab('publicacoes')}>
              Publicações
            </button>
            <button className={activeTab === 'reviews' ? 'active-tab' : ''} onClick={() => setActiveTab('reviews')}>
              Reviews
            </button>
          </div>

          {activeTab === 'publicacoes' && (
            <div className="posts-list">
              <div className="post-card">
                <div className="post-header">
                  <div className="avatar">S</div>
                  <div className="post-info">
                    <p className="post-name">Simme ☕︎</p>
                  </div>
                  <span className="post-more">···</span>
                </div>
                <p className="post-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <div className="post-tags">
                  <span className="post-tag">#memes</span>
                  <span className="post-tag">#romantasy</span>
                </div>
                <div className="post-actions">
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 350</span>
                    <span><FontAwesomeIcon icon={faComment} /> 66</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>

              <div className="post-card">
                <div className="post-header">
                  <div className="avatar">L</div>
                  <div className="post-info">
                    <p className="post-name">Lauren ama Rhea</p>
                  </div>
                  <span className="post-more">···</span>
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <p className="post-content" style={{ filter: 'blur(8px)', margin: 0, display: 'inline-block' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                  <button className="post-show-btn" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2}}>Mostrar publicação</button>
                </div>
                <div className="post-tags">
                </div>
                <div className="post-actions">
                  <span className="post-type-badge"><FontAwesomeIcon icon={faWandMagicSparkles} />  Teoria</span>
                  <span className="post-show">Contém spoiler</span>
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 44</span>
                    <span><FontAwesomeIcon icon={faComment} /> 12</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="posts-list">
              <div className="post-card">
                <div className="post-header">
                  <div className="avatar">H</div>
                  <div className="post-info">
                    <p className="review-name">Esperava Mais</p>
                    <p className="review-book-title">Vermelho, Branco e Sangue Azul</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <span className="post-more">···</span>
                </div>
                <p className="post-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <span className="recommend-badge no">✗ Não recomendo</span>
                <div className="post-actions">
                  <span className="post-name">He/She/It</span>
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 140</span>
                    <span><FontAwesomeIcon icon={faComment} /> 99</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>

              <div className="post-card">
                <div className="post-header">
                  <div className="avatar">Q</div>
                  <div className="post-info">
                    <p className="review-name">Que final perfeito</p>
                    <p className="review-book-title">Rainha do Nada</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <span className="post-more">···</span>
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <p className="post-content" style={{ filter: 'blur(8px)', margin: 0, display: 'inline-block' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                  <button className="post-show-btn" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2}}>Mostrar publicação</button>
                </div>
                <span className="recommend-badge yes" style={{ marginTop: '17px' }}>✓ Recomendo</span>
                <div className="post-actions">
                  <span className="post-name">Nakyum</span>
                  <span className="post-show">Contém spoiler</span>
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 280</span>
                    <span><FontAwesomeIcon icon={faComment} /> 45</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <aside className="right-column">
        <div className="search-container">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input placeholder="Searching for something?" />
        </div>

        <div className="tags-box">
          <h3><FontAwesomeIcon icon={faWater} /> Top #tags da semana</h3>
          <div className="tag-card"><p>#imagine</p><span>123.4K posts</span></div>
          <div className="tag-card"><p>#atlascasacomigo</p><span>98.3K posts</span></div>
          <div className="tag-card"><p>#rwrb</p><span>87.6K posts</span></div>
          <div className="tag-card"><p>#pjo</p><span>76.5K posts</span></div>
          <div className="tag-card"><p>#romantasy</p><span>65.2K posts</span></div>
        </div>

        <div className="suggestions-box">
          <h3><FontAwesomeIcon icon={faFrog} /> Sugestões para ti</h3>
          <div className="suggestion-card">
            <div className="avatar" style={{ width: 38, height: 38, fontSize: 15 }}>A</div>
            <div className="suggestion-info">
              <span className="suggestion-name">Apollo &gt;&gt;&gt;&gt;</span>
              <span className="suggestion-nick">@apollofan</span>
            </div>
            <button className="follow-btn"><FontAwesomeIcon icon={faCirclePlus} /></button>
          </div>
          <div className="suggestion-card">
            <div className="avatar" style={{ width: 38, height: 38, fontSize: 15 }}>B</div>
            <div className="suggestion-info">
              <span className="suggestion-name">BookishSoul</span>
              <span className="suggestion-nick">@bookishsoul</span>
            </div>
            <button className="follow-btn"><FontAwesomeIcon icon={faCirclePlus} /></button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Feed;