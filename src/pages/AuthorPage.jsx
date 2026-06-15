import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faStar, faChevronRight, faEllipsis, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { getAuthorDetails, getAuthorWorks, getAuthorImage } from '../services/openLibrary';

const AuthorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starAverage, setStarAverage] = useState(null)

  const authorKey = searchParams.get('key');   // ex: /authors/OL23919A
  const authorName = searchParams.get('name'); // fallback

  useEffect(() => {
    if (!authorKey) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const [details, authorWorks] = await Promise.all([
          getAuthorDetails(authorKey),
          getAuthorWorks(authorKey, 20),
        ]);
        setAuthor(details);
        const load = async () => {
  try {
    setLoading(true);
    const [details, authorWorks] = await Promise.all([
      getAuthorDetails(authorKey),
      getAuthorWorks(authorKey, 20),
    ]);
    console.log('AUTHOR DETAILS:', JSON.stringify(details, null, 2)); // ← adiciona isto
    setAuthor(details);
    setWorks(authorWorks);
  } catch (err) {
    console.error('Erro ao carregar autor:', err);
  } finally {
    setLoading(false);
  }
};
        setWorks(authorWorks);
      } catch (err) {
        console.error('Erro ao carregar autor:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authorKey]);

  useEffect(() => {
    if (!author?.name) return
    fetch(`${import.meta.env.VITE_API_URL}/reviews/author/${encodeURIComponent(author.name)}/average`)
      .then(r => r.json())
      .then(data => setStarAverage(data.average))
      .catch(() => {})
  }, [author?.name])

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="author-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#999' }}>A carregar autor...</p>
        </main>
      </div>
    );
  }

  if (!author && !authorName) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="author-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#999' }}>Autor não encontrado.</p>
        </main>
      </div>
    );
  }

  const displayName = author?.name || authorName || 'Autor desconhecido';
  const initials = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="layout">
      <Sidebar />

      <main className="author-main">

        {/* COLUNA ESQUERDA */}
        <aside className="author-info-col">

          <span
            className="btn-secondary"
            style={{ alignSelf: 'flex-start', cursor: 'pointer', marginBottom: 12, fontSize: 13 }}
            onClick={() => navigate(-1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Voltar
          </span>

          <div className="author-avatar-wrapper">
            {author?.image ? (
              <img
                src={author.image.replace('-M.jpg', '-L.jpg')}
                alt={displayName}
                className="author-avatar-large"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <div className="author-avatar-large">{initials}</div>
            )}
          </div>

          <h1 className="author-info-name">{displayName}</h1>

          <div className="author-stats">
            {works.length > 0 && (
              <span><strong>{works.length}</strong> obras</span>
            )}
            {author?.birth_date && (
              <>
                <span className="author-stats-dot">·</span>
                <span>n. {author.birth_date}</span>
              </>
            )}
          </div>

          <div className="author-info-actions">
            <button
              className={`author-follow-btn ${following ? 'following' : ''}`}
              onClick={() => setFollowing(v => !v)}
            >
              {following ? 'A seguir' : 'Seguir'}
            </button>
            <button className="author-more-btn">
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </div>

          {author?.bio && (
            <p className="author-bio">{author.bio}</p>
          )}

          <div className="author-site">
            {author?.wikipedia && (
              <span>
                <FontAwesomeIcon icon={faGlobe} style={{ color: 'var(--text-primary)' }} />
                <a href={author.wikipedia} target="_blank" rel="noreferrer" className="author-site-link">
                  Wikipedia
                </a>
              </span>
            )}
            {starAverage !== null && (
              <span className="author-rating">
                {starAverage} <FontAwesomeIcon icon={faStar} style={{ color: 'var(--text-primary)', fontSize: 12 }} />
              </span>
            )}
          </div>

        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="author-content">
          <div className="books-section">
            <div className="books-section-header">
              <h3>Obras publicadas</h3>
            </div>
            <div className="books-row">
              {works.length > 0 ? works.map((work) => (
                <div key={work.key} className="author-saga-card">
                  <div className="book-cover rose" style={{ width: 138, height: 220 }}>
                    {work.title}
                  </div>
                  <span className="author-saga-title">{work.title}</span>
                  {work.first_publish_year && (
                    <span className="author-saga-year">{work.first_publish_year}</span>
                  )}
                </div>
              )) : (
                <p style={{ color: '#999', fontSize: 13 }}>Sem obras disponíveis.</p>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AuthorPage;