import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart, faComment, faPaperPlane, faFrog, faWater,
  faWandMagicSparkles, faCirclePlus, faCheck, faBell,
  faStar, faSpinner, faTriangleExclamation, faClover
} from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

// Componente reutilizável para o wrapper de spoiler
const SpoilerWrapper = ({ id, revealed, onReveal, children }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ filter: revealed ? 'none' : 'blur(8px)', pointerEvents: revealed ? 'auto' : 'none' }}>
      {children}
    </div>
    {!revealed && (
      <button
        className="post-show-btn"
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}
        onClick={() => onReveal(id)}
      >
        Mostrar publicação
      </button>
    )}
  </div>
);

// Estrelas de rating
const Stars = ({ count }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        style={{ color: i <= count ? 'var(--accent)' : 'var(--border-color)' }}
      />
    ))}
  </div>
);

const Feed = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [activatedMessage, setActivatedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('publicacoes');

  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [nextCursorType, setNextCursorType] = useState(null);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [revealedSpoilers, setRevealedSpoilers] = useState(new Set());
  const revealSpoiler = (id) => setRevealedSpoilers(prev => new Set([...prev, id]));

  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('@Lanuia:token') || localStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/auth/me');
      if (res.status === 200) {
        setUser(res.data);
        localStorage.setItem('@Lanuia:user', JSON.stringify(res.data));
      }
    } catch (err) { console.error('could not refresh user', err); }
  };

  const fetchFeed = useCallback(async (tab, cursor = null, cursorType = null, replace = false) => {
    setLoadingFeed(true);
    try {
      const params = new URLSearchParams({ tab, limit: '20' });
      if (cursor) { params.set('cursor', cursor); params.set('cursorType', cursorType); }

      const res = await api.get(`/feed?${params.toString()}`);
      const { items: newItems, nextCursor: nc, nextCursorType: nct } = res.data;

      setItems(prev => replace ? newItems : [...prev, ...newItems]);
      setNextCursor(nc);
      setNextCursorType(nct);
      setHasMore(nc !== null);
    } catch (err) {
      console.error('Feed error:', err);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    setNextCursorType(null);
    setHasMore(true);
    fetchFeed(activeTab, null, null, true);
  }, [activeTab, fetchFeed]);

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
      const t = setTimeout(() => setActivatedMessage(false), 5000);
      return () => clearTimeout(t);
    }
  }, [activatedMessage]);

  useEffect(() => { refreshUser(); }, []);

  useEffect(() => {
    const stored = localStorage.getItem('@Lanuia:user') || localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    else navigate('/');
  }, [navigate]);

  useEffect(() => {
    api.get('/users/recommendations?limit=5')
      .then(res => setRecommendedUsers(res.data))
      .catch(err => console.error('recommendations error', err));

    api.get('/tags/top?limit=5')
      .then(res => setTopTags(res.data))
      .catch(err => console.error('top tags error', err));
  }, []);

  if (!user) return <p>Loading...</p>;

  const renderPost = (post) => {
    const spoilerKey = `post-${post.id}`;
    const tags = post.postTags?.map(pt => pt.tag) ?? [];

    return (
      <div className="post-card" key={spoilerKey}>
        <div className="post-header">
          <div className="profile-avatar">
            {post.user?.profilepic
              ? <img src={post.user.profilepic} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : (post.user?.name?.[0] ?? '?')}
          </div>
          <div className="post-info">
            <p className="post-name">{post.user?.name}</p>
            <p style={{ fontSize: 12, color: 'var(--search-color)' }}>@{post.user?.nick}</p>
          </div>
          <span className="post-more">···</span>
        </div>

        {post.hasSpoiler ? (
          <SpoilerWrapper
            id={spoilerKey}
            revealed={revealedSpoilers.has(spoilerKey)}
            onReveal={revealSpoiler}
          >
            <p className="post-content">{post.content}</p>
            {post.image && <img src={post.image} alt="" style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />}
          </SpoilerWrapper>
        ) : (
          <>
            <p className="post-content">{post.content}</p>
            {post.image && <img src={post.image} alt="" style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />}
          </>
        )}

        {tags.length > 0 && (
          <div className="post-tags">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="post-tag"
                style={{ cursor: 'pointer' }}
                onClick={() => goToTag(tag.name)}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="post-actions">
          {post.isTheory && (
            <span className="post-type-badge">
              <FontAwesomeIcon icon={faWandMagicSparkles} /> Theory
            </span>
          )}
          {post.hasSpoiler && <span className="post-show"><FontAwesomeIcon icon={faTriangleExclamation} /> Contains spoiler</span>}
          <div className="post-action-group">
            <span><FontAwesomeIcon icon={faHeart} /> {post._count?.loves ?? post.loveCount ?? 0}</span>
            <span><FontAwesomeIcon icon={faComment} /> {post._count?.comments ?? 0}</span>
            <span><FontAwesomeIcon icon={faPaperPlane} /></span>
          </div>
        </div>
      </div>
    );
  };

  const renderReview = (review) => {
    const spoilerKey = `review-${review.id}`;

    return (
      <div className="post-card" key={spoilerKey}>
        <div className="post-header">
          <div className="profile-avatar">
            {review.user?.profilepic
              ? <img src={review.user.profilepic} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : (review.user?.name?.[0] ?? '?')}
          </div>
          <div className="post-info">
            <p className="review-name">{review.name}</p>
            <p className="review-book-title">{review.book?.name}</p>
          </div>
          <Stars count={review.stars} />
          <span className="post-more">···</span>
        </div>

        {review.hasSpoiler ? (
          <SpoilerWrapper
            id={spoilerKey}
            revealed={revealedSpoilers.has(spoilerKey)}
            onReveal={revealSpoiler}
          >
            <p className="post-content">{review.content}</p>
          </SpoilerWrapper>
        ) : (
          <p className="post-content">{review.content}</p>
        )}

        <span className={`recommend-badge ${review.recommend ? 'yes' : 'no'}`}>
          {review.recommend ? '✓ Reccomended' : '✗ Not reccomended'}
        </span>

        <div className="post-actions">
          <span className="post-name">@{review.user?.nick}</span>
          {review.hasSpoiler && <span className="post-show"><FontAwesomeIcon icon={faTriangleExclamation} /> Contains spoiler</span>}
          <div className="post-action-group">
            <span><FontAwesomeIcon icon={faHeart} /> {review._count?.loves ?? review.loveCount ?? 0}</span>
            <span><FontAwesomeIcon icon={faPaperPlane} /></span>
          </div>
        </div>
      </div>
    );
  };

  const handleFollow = async (targetId) => {
    try {
      await api.post(`/users/${targetId}/follow`);
      setFollowingIds(prev => new Set([...prev, targetId]));
    } catch (err) {
      console.error('follow error', err);
    }
  };

  const goToTag = (tagName) => {
    navigate(`/books?tag=${encodeURIComponent(tagName)}`);
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="feed">
        <div className="feed-container">

          {activatedMessage && (
            <div className="success-box" style={{ marginTop: 20 }}>
              <FontAwesomeIcon icon={faCheck} /> Account activated! You may proceed now.
            </div>
          )}
          {!user.isActive && (
            <div className="warning-banner" style={{ borderRadius: 12, marginTop: 20 }}>
              <span><FontAwesomeIcon icon={faBell} /> Confirm your email to activate your account.</span>
            </div>
          )}

          <div className="feed-tabs">
            <button
              className={activeTab === 'publicacoes' ? 'active-tab' : ''}
              onClick={() => setActiveTab('publicacoes')}
            >
              Posts
            </button>
            <button
              className={activeTab === 'reviews' ? 'active-tab' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>

          <div className="posts-list">
            {items.map(item =>
              item._type === 'review' ? renderReview(item) : renderPost(item)
            )}

            {loadingFeed && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--search-color)' }}>
                <FontAwesomeIcon icon={faSpinner} spin />
              </div>
            )}

            {!loadingFeed && hasMore && items.length > 0 && (
              <button
                className="create-post-btn"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => fetchFeed(activeTab, nextCursor, nextCursorType)}
              >
                Load more
              </button>
            )}

            {!loadingFeed && items.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--search-color)', marginTop: 40 }}>
                No one here yet. Be the first! <FontAwesomeIcon icon={faClover} />
              </p>
            )}
          </div>

        </div>
      </main>

      <aside className="right-column">
        <div className="search-container">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input placeholder="Searching for something?" />
        </div>

        <div className="tags-box">
          <h3><FontAwesomeIcon icon={faWater} /> Top weekly #tags</h3>
          {topTags.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--search-color)' }}>No trending tags yet.</p>
          )}
          {topTags.map(tag => (
            <div
              className="tag-card"
              key={tag.id}
              style={{ cursor: 'pointer' }}
              onClick={() => goToTag(tag.name)}
            >
              <p>#{tag.name}</p>
              <span>{tag.postCount} posts</span>
            </div>
          ))}
        </div>

        <div className="suggestions-box">
          <h3><FontAwesomeIcon icon={faFrog} /> Suggestions for you</h3>
          {recommendedUsers.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--search-color)' }}>No suggestions right now.</p>
          )}
          {recommendedUsers.map(u => (
            <div className="suggestion-card" key={u.id}>
              <div className="profile-avatar" style={{ width: 38, height: 38, fontSize: 15 }}>
                {u.profilepic
                  ? <img src={u.profilepic} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : (u.name?.[0] ?? '?')}
              </div>
              <div className="suggestion-info">
                <span className="suggestion-name">{u.name}</span>
                <span className="suggestion-nick">@{u.nick}</span>
              </div>
              <button
                className="follow-btn"
                onClick={() => handleFollow(u.id)}
                disabled={followingIds.has(u.id)}
              >
                <FontAwesomeIcon icon={followingIds.has(u.id) ? faCheck : faCirclePlus} />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Feed;