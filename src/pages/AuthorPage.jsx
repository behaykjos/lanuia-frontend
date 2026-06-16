import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faStar, faEllipsis, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { getAuthorDetails, getAuthorWorks } from '../services/openLibrary';
import { searchBooks } from '../services/googleBooks';

const AuthorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [sagas, setSagas] = useState([]);
  const [standalones, setStandalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starAverage, setStarAverage] = useState(null);
  const [followers, setFollowers] = useState(0);

  const authorKey = searchParams.get('key');
  const authorName = searchParams.get('name');

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
          getAuthorWorks(authorKey, 40),
        ]);
        setAuthor(details);
        setWorks(authorWorks);

        // Busca capas na Google Books API para as obras
        if (details?.name && authorWorks.length > 0) {
          const worksWithCovers = await Promise.all(
            authorWorks.slice(0, 20).map(async (work) => {
              try {
                const results = await searchBooks(`${work.title} ${details.name}`);
                const match = results?.[0];
                const thumbnail = match?.volumeInfo?.imageLinks?.thumbnail?.replace('http://', 'https://') || null;
                return { ...work, thumbnail, googleId: match?.id || null };
              } catch {
                return { ...work, thumbnail: null, googleId: null };
              }
            })
          );

          // Separa sagas de standalone (heurística: obras com séries no título ou mais de 1 livro com nome similar)
          const sagaMap = new Map();
          const standAloneList = [];

          worksWithCovers.forEach((work) => {
            // Detecta se o título tem número (ex: "Book 1", "#1") — sinal de saga
            const hasSeries = /\b(#?\d+|book \d+|vol\.?\s*\d+|parte \d+)\b/i.test(work.title);
            if (hasSeries) {
              const sagaName = work.title.replace(/\s*(#?\d+|book \d+|vol\.?\s*\d+|parte \d+).*/i, '').trim();
              if (!sagaMap.has(sagaName)) sagaMap.set(sagaName, []);
              sagaMap.get(sagaName).push(work);
            } else {
              standAloneList.push(work);
            }
          });

          setSagas([...sagaMap.entries()].map(([name, books]) => ({ name, books })));
          setStandalones(standAloneList);
        }
      } catch (err) {
        console.error('Erro ao carregar autor:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authorKey]);

  useEffect(() => {
    if (!author?.name) return;
    fetch(`${import.meta.env.VITE_API_URL}/reviews/author/${encodeURIComponent(author.name)}/average`)
      .then(r => r.json())
      .then(data => setStarAverage(data.average))
      .catch(() => {});
  }, [author?.name]);

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
            <span className="author-stats-dot">·</span>
            <span><strong>{followers}</strong> seguidores</span>
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

          {/* Sagas */}
          {sagas.length > 0 && (
            <div className="books-section">
              <div className="books-section-header">
                <h3>Sagas de livros</h3>
              </div>
              <div className="author-sagas-row">
                {sagas.map((saga) => (
                  <div key={saga.name} className="author-saga-card">
                    {saga.books[0]?.thumbnail ? (
                      <img
                        src={saga.books[0].thumbnail}
                        alt={saga.name}
                        style={{ width: 166, height: 253, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ) : (
                      <div className="book-cover rose" style={{ width: 166, height: 253 }}>
                        {saga.name}
                      </div>
                    )}
                    <span className="author-saga-title">{saga.name}</span>
                    <span className="author-saga-year">{saga.books[0]?.first_publish_year || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Livros publicados */}
          <div className="books-section">
            <div className="books-section-header">
              <h3>Livros publicados</h3>
            </div>
            <div className="books-row">
              {standalones.length > 0 ? standalones.map((work) => (
                <div
                  key={work.key}
                  className="author-saga-card"
                  style={{ cursor: work.googleId ? 'pointer' : 'default' }}
                  onClick={() => work.googleId && navigate(`/bookpage/${work.googleId}`)}
                >
                  {work.thumbnail ? (
                    <img
                      src={work.thumbnail}
                      alt={work.title}
                      style={{ width: 138, height: 220, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ) : (
                    <div className="book-cover rose" style={{ width: 138, height: 220 }}>
                      {work.title}
                    </div>
                  )}
                  <span className="author-saga-title">{work.title}</span>
                  {work.first_publish_year && (
                    <span className="author-saga-year">{work.first_publish_year}</span>
                  )}
                </div>
              )) : works.slice(0, 20).map((work) => (
                <div key={work.key} className="author-saga-card">
                  <div className="book-cover rose" style={{ width: 138, height: 220 }}>
                    {work.title}
                  </div>
                  <span className="author-saga-title">{work.title}</span>
                  {work.first_publish_year && (
                    <span className="author-saga-year">{work.first_publish_year}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AuthorPage;