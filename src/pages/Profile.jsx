import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faHeart, faComment, faPaperPlane,
  faChevronRight, faWandMagicSparkles, faGlobe, faLock, faXmark,
  faUserPlus, faUserCheck, faRightFromBracket,
  faPenToSquare, faSpinner, faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

/* ── Modal edição de estante ── */
const EditShelfModal = ({ shelf, onClose, onSave }) => {
  const [title, setTitle]     = useState(shelf.title);
  const [isPublic, setIsPublic] = useState(shelf.isPublic);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        <div className="field" style={{ marginBottom: 20 }}>
          <label className="field-label">Título</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ borderRadius: 10, border: '1px solid var(--border-accent)', padding: '10px 14px', fontSize: 14, width: '100%' }}
          />
        </div>
        <div className="field" style={{ marginBottom: 28 }}>
          <label className="field-label" style={{ marginBottom: 10, display: 'block' }}>Visibility</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { val: true,  icon: faGlobe, label: 'Pública'  },
              { val: false, icon: faLock,  label: 'Privada' },
            ].map(({ val, icon, label }) => (
              <button
                key={label}
                onClick={() => setIsPublic(val)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                  border: isPublic === val ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
                  background: isPublic === val ? 'var(--accent-extra-soft)' : 'var(--bg-secondary)',
                  color: isPublic === val ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                  fontWeight: isPublic === val ? 700 : 400, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <FontAwesomeIcon icon={icon} /> {label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => onSave({ title, isPublic })}
          style={{ width: '100%', padding: '12px', borderRadius: 20, background: 'var(--accent-secondary)', color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
        >
          Guardar alterações
        </button>
      </div>
    </div>
  );
};

/* ── Modal logout ── */
const LogoutModal = ({ onClose, onConfirm }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
      <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
      <h3 style={{ marginBottom: 10, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Logout</h3>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 28 }}>Are you sure you want to log out of your account?</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 20, background: 'var(--border-color)', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: 'var(--text-secondary)' }}>Cancelar</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: '11px', borderRadius: 20, background: 'var(--accent-secondary)', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', color: 'white' }}>Sair</button>
      </div>
    </div>
  </div>
);

/* ── Estrelas ── */
const Stars = ({ count }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1,2,3,4,5].map(i => (
      <FontAwesomeIcon key={i} icon={faStar} style={{ color: i <= count ? 'var(--accent-secondary)' : 'var(--border-color)' }} />
    ))}
  </div>
);

/* ── Componente principal ── */
const Profile = () => {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const storedUser  = JSON.parse(localStorage.getItem('@Lanuia:user') || 'null');
  const localUserId = storedUser?.id;
  const isOwnProfile = !userId || userId === String(localUserId);
  const targetId     = isOwnProfile ? localUserId : userId;

  const [profile,      setProfile]      = useState(null);
  const [shelves,      setShelves]      = useState([]);
  const [posts,        setPosts]        = useState([]);
  const [reviews,      setReviews]      = useState([]);
  const [isFollowing,  setIsFollowing]  = useState(false);
  const [followLoading,setFollowLoading]= useState(false);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [editingShelf, setEditingShelf] = useState(null);
  const [showLogout,   setShowLogout]   = useState(false);

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    setError(null);

    const fetchProfile = async () => {
      try {
        const [profileRes, shelvesRes, postsRes, reviewsRes] = await Promise.all([
          api.get(`/users/${targetId}`),
          api.get(`/users/${targetId}/shelves`),
          api.get(`/users/${targetId}/posts`),
          api.get(`/users/${targetId}/reviews`),
        ]);

        setProfile(profileRes.data);
        setShelves(shelvesRes.data  || []);
        setPosts(postsRes.data      || []);
        setReviews(reviewsRes.data  || []);

        if (!isOwnProfile && profileRes.data.followers) {
          setIsFollowing(profileRes.data.followers.some(f => f.followerId === localUserId));
        }
      } catch (err) {
        console.error(err);
        setError('It was not possible to load the profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetId, isOwnProfile, localUserId]);

  const handleFollowToggle = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/users/${targetId}/follow`);
        setIsFollowing(false);
        setProfile(p => ({ ...p, _count: { ...p._count, followers: (p._count?.followers || 1) - 1 } }));
      } else {
        await api.post(`/users/${targetId}/follow`);
        setIsFollowing(true);
        setProfile(p => ({ ...p, _count: { ...p._count, followers: (p._count?.followers || 0) + 1 } }));
      }
    } catch (err) { console.error(err); }
    finally { setFollowLoading(false); }
  };

  const handleMessage = async () => {
    try {
      const res = await api.post('/conversations', { participantId: targetId });
      navigate(`/messages${res.data?.id ? `/${res.data.id}` : ''}`);
    } catch { navigate('/messages'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('@Lanuia:token');
    localStorage.removeItem('@Lanuia:user');
    navigate('/');
  };

  const handleShelfSave = async (updated) => {
    try {
      await api.patch(`/shelves/${editingShelf.id}`, updated);
      setShelves(prev => prev.map(s => s.id === editingShelf.id ? { ...s, ...updated } : s));
    } catch (err) { console.error(err); }
    finally { setEditingShelf(null); }
  };

  /* ── Loading / erro ── */
  if (loading) return (
    <div className="layout"><Sidebar />
      <main className="profile-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 32, color: 'var(--accent-secondary)' }} />
      </main>
    </div>
  );

  if (error || !profile) return (
    <div className="layout"><Sidebar />
      <main className="profile-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 15 }}>{error || 'Perfil não encontrado.'}</p>
        <button onClick={() => navigate(-1)} className="create-post-btn" style={{ padding: '8px 20px' }}>Voltar</button>
      </main>
    </div>
  );

  const publicShelves  = shelves.filter(s => s.isPublic || isOwnProfile);
  const avatarLetter   = profile.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="layout">
      <Sidebar />

      <main className="profile-main">

        {/* ── Coluna esquerda ── */}
        <aside className="profile-info-col">
          <div className="profile-page-avatar">
            {profile.profilepic
              ? <img src={profile.profilepic} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : avatarLetter
            }
          </div>
          <h2 className="profile-page-name">{profile.name}</h2>
          <p className="profile-page-nick">@{profile.nick}</p>
          <p className="profile-page-stats-line">
            <strong>{profile._count?.followers ?? 0}</strong> conexões ·{' '}
            <strong>{profile._count?.following ?? 0}</strong> a seguir
          </p>

          {isOwnProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <button
                className="profile-edit-btn"
                onClick={() => navigate('/settings')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <FontAwesomeIcon icon={faPenToSquare} /> Edit Profile
              </button>
              <button
                onClick={() => setShowLogout(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 18px', borderRadius: 20, border: '1.5px solid var(--border-accent)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faRightFromBracket} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 10px', borderRadius: 20, border: isFollowing ? '1.5px solid var(--border-accent)' : 'none', background: isFollowing ? 'transparent' : 'var(--accent-secondary)', color: isFollowing ? 'var(--text-secondary)' : 'white', fontWeight: 700, fontSize: 14, cursor: followLoading ? 'not-allowed' : 'pointer', opacity: followLoading ? 0.7 : 1, transition: 'all 0.2s' }}
              >
                <FontAwesomeIcon icon={isFollowing ? faUserCheck : faUserPlus} />
                {isFollowing ? 'A seguir' : 'Seguir'}
              </button>
              <button
                onClick={handleMessage}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 10px', borderRadius: 20, border: '1.5px solid var(--border-accent)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faPaperPlane} /> Menssage
              </button>
            </div>
          )}

          {profile.bio && <p className="profile-page-bio">{profile.bio}</p>}
        </aside>

        {/* ── Conteúdo principal ── */}
        <div className="profile-content">

          {/* Banner — usa profilebanner se existir */}
          <div
            className="profile-banner"
            style={profile.profilebanner ? { backgroundImage: `url(${profile.profilebanner})` } : {}}
          >
            <div className="profile-banner-overlay" />
          </div>

          {/* Estantes */}
          <div className="profile-section-block">
            <div className="profile-section-header">
              <h3 className="profile-section-title">
                {isOwnProfile ? 'My shelf' : 'Public shelves'}
              </h3>
              <span
                className="books-see-more"
                onClick={() => navigate(isOwnProfile ? '/shelf' : `/shelf/${targetId}`)}
              >
                Ver todas <FontAwesomeIcon icon={faChevronRight} />
              </span>
            </div>

            {publicShelves.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
                {isOwnProfile ? 'You still do not have anything.' : 'No public shelf.'}
              </p>
            ) : (
              <div className="profile-shelves-row">
                {publicShelves.map(shelf => (
                  <div key={shelf.id} className="profile-shelf-card">
                    <div className={`profile-shelf-img ${shelf.books?.[0]?.color || 'pink'}`}>
                      {shelf.books?.[0]?.title || ''}
                    </div>
                    <div className="profile-shelf-info">
                      <h3 className="profile-shelf-name">{shelf.title}</h3>
                      <span className="profile-shelf-count">{shelf._count?.books ?? shelf.books?.length ?? 0} books</span>
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={() => setEditingShelf(shelf)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 13, padding: '4px 6px' }}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Posts & Reviews */}
          <div className="profile-bottom-grid">

            {/* Publicações */}
            <div className="profile-bottom-col">
              <h3 className="profile-section-title">Posts & Theories</h3>
              {posts.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Nothing here yet.</p>}

              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header" style={{ marginBottom: 'auto' }}>
                    <span className="post-more">···</span>
                  </div>

                  {post.hasSpoiler ? (
                    <div style={{ position: 'relative' }}>
                      <p className="post-content" style={{ filter: 'blur(8px)', margin: 0 }}>{post.content}</p>
                      <button className="post-show-btn" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
                        Show content
                      </button>
                    </div>
                  ) : (
                    <p className="post-content">{post.content}</p>
                  )}

                  {post.postTags?.length > 0 && (
                    <div className="post-tags">
                      {post.postTags.map(pt => <span key={pt.tag.id} className="post-tag">#{pt.tag.name}</span>)}
                    </div>
                  )}

                  <div className="post-actions">
                    {post.isTheory && <span className="post-type-badge"><FontAwesomeIcon icon={faWandMagicSparkles} /> Theory</span>}
                    {post.hasSpoiler && <span className="post-show"><FontAwesomeIcon icon={faTriangleExclamation} /> Contains spoiler</span>}
                    <div className="post-action-group">
                      <span><FontAwesomeIcon icon={faHeart} /> {post._count?.loves ?? 0}</span>
                      <span><FontAwesomeIcon icon={faComment} /> {post._count?.comments ?? 0}</span>
                      <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div className="profile-bottom-col">
              <h3 className="profile-section-title">Reviews</h3>
              {reviews.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Nothing here yet.</p>}

              {reviews.map(review => (
                <div key={review.id} className="post-card">
                  <div className="post-header">
                    <div className="post-info">
                      {/* schema: review.name = título da review, review.book.name = nome do livro */}
                      <p className="review-name">{review.name}</p>
                      <p className="review-book-title">{review.book?.name}</p>
                    </div>
                    {/* schema: review.stars */}
                    <Stars count={review.stars} />
                    <span className="post-more">···</span>
                  </div>

                  {review.hasSpoiler ? (
                    <div style={{ position: 'relative' }}>
                      <p className="post-content" style={{ filter: 'blur(8px)', margin: 0 }}>{review.content}</p>
                      <button className="post-show-btn" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
                        Show content
                      </button>
                    </div>
                  ) : (
                    <p className="post-content">{review.content}</p>
                  )}

                  {/* schema: review.recommend (boolean) */}
                  <span className={`recommend-badge ${review.recommend ? 'yes' : 'no'}`} style={{ marginTop: review.hasSpoiler ? 17 : 0 }}>
                    {review.recommend ? '✓ Recommend' : '✗ Not recommend'}
                  </span>

                  <div className="post-actions">
                    {review.hasSpoiler && <span className="post-show"><FontAwesomeIcon icon={faTriangleExclamation} /> Contains spoiler</span>}
                    <div className="post-action-group">
                      <span><FontAwesomeIcon icon={faHeart} /> {review._count?.loves ?? 0}</span>
                      <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      {editingShelf && (
        <EditShelfModal shelf={editingShelf} onClose={() => setEditingShelf(null)} onSave={handleShelfSave} />
      )}
      {showLogout && (
        <LogoutModal onClose={() => setShowLogout(false)} onConfirm={handleLogout} />
      )}
    </div>
  );
};

export default Profile;