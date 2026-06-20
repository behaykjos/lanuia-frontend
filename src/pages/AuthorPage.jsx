import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getAuthorDetails, getAuthorWorks, getWorkCoverUrl } from '../services/openLibrary';
import { getBooksByAuthor } from '../services/googleBooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faStar, faEllipsis, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const AuthorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [standalones, setStandalones] = useState([]);
  const [collections, setCollections] = useState([]);
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

        const lang = navigator.language?.substring(0, 2) || 'en';

        const [details, openLibraryWorks] = await Promise.all([
          getAuthorDetails(authorKey),
          getAuthorWorks(authorKey, 100),
        ]);
        setAuthor(details);

        const normalizeTitle = (title) => {
          return (title || '')
            .toLowerCase()
            .replace(/\(vol\.?\s*\d+[^)]*\)/gi, '')
            .replace(/[-–]\s*(trono de vidro|acotar|cidade da lua crescente|crescent city|throne of glass|a court of)[^$]*/gi, '')
            .replace(/\s*(vol\.?\s*\d+|#?\d+|livro \d+)\s*/gi, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        };

        let googleBooks = [];
        if (details?.name) {
          googleBooks = await getBooksByAuthor(details.name, lang, 100);
        }

        // Indexa os livros do Google Books por título normalizado, para conseguirmos
        // ir buscar a capa/thumbnail/googleId de cada obra real da Open Library
        const googleByTitle = new Map();
        googleBooks.forEach((book) => {
          const key = normalizeTitle(book.title);
          if (key && !googleByTitle.has(key)) {
            googleByTitle.set(key, book);
          }
        });

        const findGoogleMatch = (workTitleNormalized, googleByTitle, googleList) => {
          if (googleByTitle.has(workTitleNormalized)) {
            return googleByTitle.get(workTitleNormalized);
          }
          return googleList.find((book) => {
            const t = normalizeTitle(book.title);
            return t.includes(workTitleNormalized) || workTitleNormalized.includes(t);
          });
        };

        // A lista de obras REAIS vem da Open Library (já é por obra, não por edição)
        const mergedWorks = openLibraryWorks.map((work) => {
          const workTitleNorm = normalizeTitle(work.title);
          const match = findGoogleMatch(workTitleNorm, googleByTitle, googleBooks);
          const openLibraryCover = getWorkCoverUrl(work.coverId);

          return {
            key: work.key,
            title: work.title,
            first_publish_year: work.first_publish_year,
            thumbnail: match?.thumbnail || openLibraryCover, // Google primeiro, Open Library a seguir
            googleId: match?.googleId || null,
          };
        });

        // Separa edições especiais/coleções dentro dessa lista já correta
        const collectionList = [];
        const allWorksList = [];

        mergedWorks.forEach((book) => {
          const title = book.title.toLowerCase();
          const isCollection =
            title.includes('box') ||
            title.includes('collection') ||
            title.includes('edição') ||
            title.includes('ed.') ||
            title.includes('deluxe') ||
            title.includes('especial') ||
            title.includes('limitada');

          if (isCollection) {
            collectionList.push(book);
          } else {
            allWorksList.push(book);
          }
        });

        setWorks(mergedWorks);
        setStandalones(allWorksList);
        setCollections(collectionList);
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
          <p style={{ color: '#999' }}>Loading author...</p>
        </main>
      </div>
    );
  }

  if (!author && !authorName) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="author-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#999' }}>Author not found.</p>
        </main>
      </div>
    );
  }

  const displayName = author?.name || authorName || 'Autor desconhecido';
  const initials = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const BookCard = ({ book, width = 138, height = 220 }) => (
    <div
      className="author-saga-card"
      style={{ cursor: book.googleId ? 'pointer' : 'default' }}
      onClick={() => book.googleId && navigate(`/bookpage/${book.googleId}`)}
    >
      {book.thumbnail ? (
        <img
          src={book.thumbnail}
          alt={book.title}
          style={{ width, height, objectFit: 'cover', borderRadius: 8 }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="book-cover rose" style={{ width, height }}>
          {book.title}
        </div>
      )}
      <span className="author-saga-title">{book.title}</span>
      {book.first_publish_year && (
        <span className="author-saga-year">{book.first_publish_year}</span>
      )}
    </div>
  );

  return (
    <div className="layout">
      <Sidebar />

      <main className="author-main">

        <aside className="author-info-col">

          <span
            className="btn-secondary"
            style={{ alignSelf: 'flex-start', cursor: 'pointer', marginBottom: 12, fontSize: 13 }}
            onClick={() => navigate(-1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Go back
          </span>

          {/* Avatar: wrapper quadrado com overflow hidden garante círculo perfeito */}
          <div
            className="author-avatar-wrapper"
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              alignSelf: 'center',
              background: '#e8d5dc',
            }}
          >
            {author?.image ? (
              <img
                src={author.image.replace('-M.jpg', '-L.jpg')}
                alt={displayName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block',
                }}
                onError={(e) => {
                  // Se a imagem falhar, mostra as iniciais
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:600;color:#c45e84;">${initials}</div>`;
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 600, color: '#c45e84' }}>
                {initials}
              </div>
            )}
          </div>

          <h1 className="author-info-name">{displayName}</h1>

          <div className="author-stats">
            {works.length > 0 && (
              <span><strong>{standalones.length}</strong> works</span>
            )}
            <span className="author-stats-dot">·</span>
            <span><strong>{followers}</strong> followers</span>
          </div>

          <div className="author-info-actions">
            <button
              className={`author-follow-btn ${following ? 'following' : ''}`}
              onClick={() => setFollowing(v => !v)}
            >
              {following ? 'Following' : 'Follow'}
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

        <div className="author-content">

          {standalones.length > 0 && (
            <div className="books-section">
              <div className="books-section-header">
                <h3>Published books</h3>
              </div>
              <div className="books-row">
                {standalones.map((book) => (
                  <BookCard key={book.key} book={book} />
                ))}
              </div>
            </div>
          )}

          {collections.length > 0 && (
            <div className="books-section">
              <div className="books-section-header">
                <h3>Special editions</h3>
              </div>
              <div className="books-row">
                {collections.map((book) => (
                  <BookCard key={book.key} book={book} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AuthorPage;