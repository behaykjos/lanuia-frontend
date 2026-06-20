import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { searchBooks, getBooksByAuthor, filterSafeBooks } from '../services/googleBooks';
import { searchAuthorsByName, getAuthorImage, getAuthorDetails } from '../services/openLibrary';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPenNib, faCirclePlus, faSeedling } from '@fortawesome/free-solid-svg-icons';

const ALL_CATEGORIES = [
  { id: 'romance', label: 'Romance', query: 'subject:romance bestseller' },
  { id: 'fantasy', label: 'Fantasy', query: 'subject:fantasy magic' },
  { id: 'romantasy', label: 'Romantasy', query: 'fantasy romance fae magic' },
  { id: 'dark', label: 'Dark Romance', query: 'dark romance enemies lovers' },
  { id: 'ya', label: 'Young Adult', query: 'subject:young adult fiction' },
  { id: 'thriller', label: 'Thriller', query: 'subject:thriller suspense' },
  { id: 'mystery', label: 'Mistery', query: 'subject:mystery detective' },
  { id: 'classics', label: 'Classics', query: 'subject:classics literature' },
  { id: 'scifi', label: 'Science Fiction', query: 'subject:science fiction' },
  { id: 'horror', label: 'Horror', query: 'subject:horror scary' },
  { id: 'historical', label: 'Historical Romance', query: 'historical romance regency' },
  { id: 'contemporary', label: 'Contemporary', query: 'contemporary romance adult' },
  { id: 'newadult', label: 'New Adult', query: 'new adult romance college' },
  { id: 'paranormal', label: 'Paranormal', query: 'paranormal romance vampire' },
  { id: 'manga', label: 'Manga & Webtoon', query: 'manga romance shojo' },
  { id: 'poetry', label: 'Poetry', query: 'subject:poetry love' },
  { id: 'selfhelp', label: 'Selfhelp', query: 'subject:self-help personal development' },
  { id: 'biography', label: 'Biography', query: 'subject:biography memoir' },
  { id: 'crime', label: 'Crime & Policial', query: 'subject:crime fiction murder' },
  { id: 'lgbtq', label: 'LGBTQIAPN+', query: 'lgbtq romance queer fiction' },
  { id: 'booktok', label: 'BookTok Favorites', query: 'colleen hoover taylor jenkins reid' },
  { id: 'enemies', label: 'Enemies to Lovers', query: 'enemies to lovers romance' },
  { id: 'slowburn', label: 'Slow Burn', query: 'slow burn romance tension' },
  { id: 'spicy', label: 'Spicy Romance', query: 'spicy romance adult fiction' },
  { id: 'fae', label: 'Fae & Magia', query: 'fae magic court fantasy' },
  { id: 'dystopia', label: 'Distopia', query: 'subject:dystopian fiction' },
  { id: 'adventure', label: 'Adventure', query: 'subject:adventure action' },
  { id: 'graphic', label: 'Graphic Novels', query: 'subject:graphic novels comics' },
];

const CATALOG_SECTIONS = [
  {
    id: 'booktok',
    label: 'BookTok Favorites',
    query: 'BookTok romance fiction',
  },
  {
    id: 'nyt',
    label: 'New York Times Bestsellers',
    query: '"New York Times bestselling" romance fiction',
  },
  {
    id: 'adapted',
    label: 'Adapted to the Screen',
    query: 'subject:fiction adapted film bestseller romance',
  },
  {
    id: 'manga',
    label: 'Manga & Webtoon',
    query: 'subject:manga shojo romance',
  },
  {
    id: 'lovetriangle',
    label: 'Love Triangle',
    query: 'love triangle romance young adult',
  },
  {
    id: 'darkromance',
    label: 'Dark Romance',
    query: 'dark romance',
  },
  {
    id: 'enemiestolovers',
    label: 'Enemies to Lovers',
    query: 'enemies to lovers romance',
  },
  {
    id: 'fae',
    label: 'Fae & Magia',
    query: 'fae magic court fantasy romance',
  },
  {
    id: 'slowburn',
    label: 'Slow Burn',
    query: 'slow burn romance tension',
  },
  {
    id: 'horror',
    label: 'Horror & Suspense',
    query: 'subject:horror supernatural thriller',
  },
  {
    id: 'children',
    label: 'Ideal for Kids',
    query: 'subject:juvenile fiction adventure animals',
  },
  {
    id: 'recent',
    label: 'Recently published',
    query: 'fiction romance 2026',
  },
];

const FEATURED_AUTHOR_POOL = [
  'Colleen Hoover',
  'Sarah J. Maas',
  'Emily Henry',
  'Holly Black',
  'Rebecca Yarros',
  'Freida McFadden',
  'Ana Huang',
  'H.D. Carlton',
  'Jenny Han',
  'Stephanie Garber',
];

const FALLBACK_BOOKS = [
  { id: 'fb1', title: 'Book One', authors: ['Fallback Author'], thumbnail: '' },
  { id: 'fb2', title: 'Book Two', authors: ['Fallback Author'], thumbnail: '' },
  { id: 'fb3', title: 'Book Three', authors: ['Fallback Author'], thumbnail: '' },
  { id: 'fb4', title: 'Book Four', authors: ['Fallback Author'], thumbnail: '' },
  { id: 'fb5', title: 'Book Five', authors: ['Fallback Author'], thumbnail: '' },
];

const buildBookCardData = (item) => {
  if (item?.volumeInfo) {
    const imageLinks = item.volumeInfo.imageLinks;
    const thumbnail =
      imageLinks?.thumbnail?.replace('http://', 'https://') ||
      imageLinks?.smallThumbnail?.replace('http://', 'https://');
    return {
      id: item.id,
      title: item.volumeInfo.title || 'Sem título',
      authors: item.volumeInfo.authors || [],
      thumbnail,
      volumeInfo: item.volumeInfo,
      maturityRating: item.volumeInfo.maturityRating || 'NOT_MATURE',
    };
  }
  return item;
};

// Títulos/palavras que indicam conteúdo explícito nos títulos visíveis
const EXPLICIT_TITLE_WORDS = [
  'seduced', 'naked', 'bare', 'naughty', 'filthy', 'dirty', 'sinful',
  'lust', 'erotic', 'erotica', 'seduction', 'forbidden desire', 'adults',
  'wet', 'hard', 'stroking', 'climax', 'orgasm', 'arousal', 'xxx', 'porn', 'nude',
];

// Extrai as primeiras DUAS frases de uma bio
const getFirstTwoSentences = (bioText) => {
  if (!bioText) return '';
  const sentences = bioText.split(/\.\s+/);
  if (sentences.length === 1) return bioText;
  const two = sentences.slice(0, 2).join('. ');
  return two.endsWith('.') ? two : `${two}.`;
};

// Escolhe um autor da pool de forma rotativa (muda a cada 12h)
const getRotatingAuthorName = (userFavorite) => {
  if (userFavorite) return userFavorite;
  const key = '@Lanuia:featuredAuthorIndex';
  const tsKey = '@Lanuia:featuredAuthorTs';
  const INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 horas

  const now = Date.now();
  const lastTs = parseInt(localStorage.getItem(tsKey) || '0', 10);
  let index = parseInt(localStorage.getItem(key) || '0', 10);

  if (now - lastTs > INTERVAL_MS) {
    index = (index + 1) % FEATURED_AUTHOR_POOL.length;
    localStorage.setItem(key, String(index));
    localStorage.setItem(tsKey, String(now));
  }

  return FEATURED_AUTHOR_POOL[index];
};

// Escolhe 5 autores sugeridos rotativos (diferentes do featured)
const getRotatingSuggestedAuthors = (featuredName) => {
  const key = '@Lanuia:suggestedAuthorsIndex';
  const tsKey = '@Lanuia:suggestedAuthorsTs';
  const INTERVAL_MS = 12 * 60 * 60 * 1000;

  const now = Date.now();
  const lastTs = parseInt(localStorage.getItem(tsKey) || '0', 10);
  let startIndex = parseInt(localStorage.getItem(key) || '3', 10);

  if (now - lastTs > INTERVAL_MS) {
    startIndex = (startIndex + 5) % FEATURED_AUTHOR_POOL.length;
    localStorage.setItem(key, String(startIndex));
    localStorage.setItem(tsKey, String(now));
  }

  const pool = FEATURED_AUTHOR_POOL.filter((n) => n !== featuredName);
  const result = [];
  for (let i = 0; i < 5; i++) {
    result.push(pool[(startIndex + i) % pool.length]);
  }
  return result;
};

const BookCard = ({ book, onAuthorClick }) => {
  const navigate = useNavigate();
  const authorName = book.authors?.[0] || book.volumeInfo?.authors?.[0];

  return (
    <div
      onClick={() => navigate(`/bookpage/${book.id}`)}
      style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, width: 138 }}
    >
      <div style={{ width: 138, height: 220, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', background: '#f0eaed', flexShrink: 0 }}>
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #e991b0, #c45e84)', display: 'flex', alignItems: 'flex-end', padding: 8, color: 'white', fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>
            {book.title}
          </div>
        )}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#2F2F2F', lineHeight: 1.3, maxWidth: 138 }}>
        {book.title}
      </span>
      {authorName && (
        <span
          style={{ fontSize: 11, color: '#666', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onAuthorClick(authorName); }}
        >
          {authorName}
        </span>
      )}
    </div>
  );
};

const Books = () => {
  const navigate = useNavigate();

  const [bookResults, setBookResults] = useState([]);
  const [authorResults, setAuthorResults] = useState([]);
  const [allAuthorResults, setAllAuthorResults] = useState([]);
  const [activeTag, setActiveTag] = useState('');
  const [activeTab, setActiveTab] = useState('books');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Banner: guardado no início e nunca mudado durante a sessão
  const [featuredAuthor, setFeaturedAuthor] = useState(null);
  const featuredAuthorLoadedRef = useRef(false);

  const [personalizedBooks, setPersonalizedBooks] = useState([]);
  const [visibleBooks, setVisibleBooks] = useState(20);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [catalogSections, setCatalogSections] = useState({});
  const [categoryCounts, setCategoryCounts] = useState({});
  const [suggestedAuthors, setSuggestedAuthors] = useState([]);
  const [visibleAuthors, setVisibleAuthors] = useState(12);
  const [worksCount, setWorksCount] = useState(null);
  const [topCategories, setTopCategories] = useState([]);

  const [searchParams] = useSearchParams();

  const user = JSON.parse(localStorage.getItem('@Lanuia:user') || '{}');

  // Livros recentemente visitados — lidos do localStorage no arranque
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('@Lanuia:recentlyViewed') || '[]');
      setRecentlyViewed(stored.slice(0, 12));
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

  const buildRecommendationQuery = () => {
    const categoryMap = {
      romance: 'subject:romance bestseller',
      fantasy: 'subject:fantasy magic',
      romantasy: 'fantasy romance fae magic',
      dark: 'dark romance enemies lovers',
      ya: 'subject:young adult fiction',
      thriller: 'subject:thriller suspense',
      mystery: 'subject:mystery detective',
      classics: 'subject:classics literature',
      scifi: 'subject:science fiction',
      horror: 'subject:horror scary',
      historical: 'historical romance regency',
      contemporary: 'contemporary romance adult',
      newadult: 'new adult romance college',
      paranormal: 'paranormal romance vampire',
      manga: 'manga romance shojo',
      poetry: 'subject:poetry love',
      selfhelp: 'subject:self-help personal development',
      biography: 'subject:biography memoir',
      crime: 'subject:crime fiction murder',
      lgbtq: 'lgbtq romance queer fiction',
      booktok: 'colleen hoover taylor jenkins reid',
      enemies: 'enemies to lovers romance',
      slowburn: 'slow burn romance tension',
      spicy: 'spicy romance adult fiction',
      fae: 'fae magic court fantasy',
      dystopia: 'subject:dystopian fiction',
      adventure: 'subject:adventure action',
      graphic: 'subject:graphic novels comics',
    };
    const favoriteCategory = user.favoriteCategory || 'romance';
    const favoriteAuthor = user.favoriteAuthor || '';
    const favoriteTags = Array.isArray(user.favoriteTags) ? user.favoriteTags : [];
    if (favoriteAuthor) return `${favoriteAuthor} books`;
    if (favoriteTags.length > 0) return favoriteTags.slice(0, 2).join(' ');
    return categoryMap[favoriteCategory] || 'subject:romance bestseller';
  };

  // Carrega o banner UMA vez (ao montar o componente)
  useEffect(() => {
    if (featuredAuthorLoadedRef.current) return;
    featuredAuthorLoadedRef.current = true;

    const loadFeatured = async () => {
      try {
        const authorName = getRotatingAuthorName(user.favoriteAuthor || '');
        const authorsList = await searchAuthorsByName(authorName);
        const author = Array.isArray(authorsList) ? authorsList[0] : authorsList;

        if (author?.key) {
          const image = getAuthorImage(author.key.replace('/authors/', ''));
          const details = await getAuthorDetails(author.key);
          const bio = details?.bio ? getFirstTwoSentences(details.bio) : 'Author suggested based on community preferences';

          setFeaturedAuthor({
            name: author.name,
            bio,
            image,
            key: author.key,
          });
        }
      } catch {
        // silencioso
      }
    };

    loadFeatured();
  }, []);

  // Livros personalizados — sempre filtrados (aparecem logo de cara)
  useEffect(() => {
    const loadPersonalizedBooks = async () => {
      try {
        const preferredQuery = buildRecommendationQuery();
        const books = await searchBooks(preferredQuery);
        const safe = filterSafeBooks(books.map(buildBookCardData));
        setPersonalizedBooks(safe.slice(0, 15));
      } catch {
        setPersonalizedBooks(FALLBACK_BOOKS);
      }
    };
    loadPersonalizedBooks();
  }, []);

  // Secções que podem ter conteúdo adulto — não filtradas
  const ADULT_SECTION_IDS = new Set(['sensual', 'darkromance']);

  // Catálogos adicionais — carrega em lotes de 3 para não sobrecarregar a API
  useEffect(() => {
    const loadCatalogs = async () => {
      const results = {};
      const BATCH_SIZE = 2;

      for (let i = 0; i < CATALOG_SECTIONS.length; i += BATCH_SIZE) {
        const batch = CATALOG_SECTIONS.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (section) => {
            try {
              const books = await searchBooks(section.query);
              const mapped = books.map(buildBookCardData);
              // Filtra conteúdo explícito em todas as secções excepto as adultas
              results[section.id] = ADULT_SECTION_IDS.has(section.id)
                ? mapped.slice(0, 10)
                : filterSafeBooks(mapped).slice(0, 10);
            } catch {
              results[section.id] = [];
            }
          })
        );

        // Actualiza o estado após cada lote — o utilizador vê as secções aparecerem progressivamente
        setCatalogSections((prev) => ({ ...prev, ...results }));

        // Pausa entre lotes para não dar 503
        if (i + BATCH_SIZE < CATALOG_SECTIONS.length) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    };
    loadCatalogs();
  }, []);

  // Autores sugeridos (rotativos)
  useEffect(() => {
    const loadSuggestedAuthors = async () => {
      try {
        const featuredName = getRotatingAuthorName(user.favoriteAuthor || '');
        const names = getRotatingSuggestedAuthors(featuredName);

        const results = await Promise.all(
          names.map(async (authorName) => {
            const authors = await searchAuthorsByName(authorName);
            const author = authors?.[0];
            if (!author?.key) return { name: authorName, key: authorName, image: '', work_count: null };
            const authorId = author.key.replace('/authors/', '');
            return {
              name: author.name,
              key: author.key,
              image: getAuthorImage(authorId),
              work_count: author.work_count ?? null,
            };
          })
        );
        setSuggestedAuthors(results);
      } catch {
        setSuggestedAuthors([]);
      }
    };
    loadSuggestedAuthors();
  }, []);

  // Pesquisa por tag (URL param)
  useEffect(() => {
    const tag = searchParams.get('tag');
    if (!tag) return;
    const doTagSearch = async () => {
      try {
        setLoading(true);
        setQuery(tag);
        setActiveTag(tag);
        const books = await searchBooks(`subject:${tag}`);
        setBookResults((books || []).map(buildBookCardData));
        setVisibleBooks(20);
        setIsSearching(true);
        setActiveTab('books');
      } catch {
        setBookResults(FALLBACK_BOOKS);
        setIsSearching(true);
      } finally {
        setLoading(false);
      }
    };
    doTagSearch();
  }, [searchParams]);

  useEffect(() => {
    setTopCategories(getRotatingTopCategories());
  }, []);

  const getRotatingTopCategories = () => {
    const key = '@Lanuia:topCategoriesIndex';
    const tsKey = '@Lanuia:topCategoriesTs';
    const INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 horas

    const now = Date.now();
    const lastTs = parseInt(localStorage.getItem(tsKey) || '0', 10);
    let startIndex = parseInt(localStorage.getItem(key) || '0', 10);

    if (now - lastTs > INTERVAL_MS) {
      startIndex = (startIndex + 5) % ALL_CATEGORIES.length;
      localStorage.setItem(key, String(startIndex));
      localStorage.setItem(tsKey, String(now));
    }

    const result = [];
    for (let i = 0; i < 5; i++) {
      result.push(ALL_CATEGORIES[(startIndex + i) % ALL_CATEGORIES.length]);
    }
    return result;
  };

  const renderSection = (title, books, sectionKey) => {
    if (!books || books.length === 0) return null;
    return (
      <div key={sectionKey} className="books-section">
        <div className="books-section-header">
          <h3>{title}</h3>
        </div>
        <div className="books-row">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onAuthorClick={handleAuthorNavigate} />
          ))}
        </div>
      </div>
    );
  };

  const handleAuthorNavigate = async (authorName) => {
    try {
      const authors = await searchAuthorsByName(authorName);
      const author = authors?.[0];
      if (author?.key) {
        navigate(`/authorpage?key=${encodeURIComponent(author.key)}`);
      } else {
        navigate(`/authorpage?name=${encodeURIComponent(authorName)}`);
      }
    } catch {
      navigate(`/authorpage?name=${encodeURIComponent(authorName)}`);
    }
  };

  const handleSearchKeyDown = async (e) => {
    if (e.key !== 'Enter') return;
    const term = query.trim();
    if (term.length <= 2) return;
    setActiveTag('');

    try {
      setLoading(true);
      setError('');

      const [books, authors] = await Promise.all([
        searchBooks(term),
        searchAuthorsByName(term),
      ]);

      setBookResults((books || []).map(buildBookCardData));
      setVisibleBooks(20);
      setAllAuthorResults(authors || []);
      setAuthorResults((authors || []).slice(0, 12));
      setVisibleAuthors(12);
      setActiveTab('books');
      setIsSearching(true);

      // NÃO atualiza o featuredAuthor aqui — fica com o banner original
    } catch (err) {
      setError('It was not possible to search at the time.');
      setBookResults(FALLBACK_BOOKS);
      setIsSearching(true);
    } finally {
      setLoading(false);
    }
  };

  const handleExploreFeaturedAuthor = () => {
    if (featuredAuthor?.key) {
      navigate(`/authorpage?key=${encodeURIComponent(featuredAuthor.key)}`);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="feed">
        {/* Banner do autor — só aparece quando NÃO está a pesquisar */}
        {!isSearching && featuredAuthor && (
          <div className="author-banner">
            <div className="author-banner-info">
              <span className="author-banner-label">Suggested Authors</span>
              <h2 className="author-banner-name">{featuredAuthor.name}</h2>
              <p className="author-banner-bio">{featuredAuthor.bio}</p>
              <div className="author-banner-actions">
                <button className="btn-explore" onClick={handleExploreFeaturedAuthor}>
                  Explorar
                </button>
                <button className="btn-more-info" onClick={handleExploreFeaturedAuthor}>
                  Mais informações
                </button>
              </div>
            </div>
            <div
              className="author-banner-image"
              style={
                featuredAuthor.image
                  ? {
                      backgroundImage: `url(${featuredAuthor.image.replace('-M.jpg', '-L.jpg')})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center top',
                      backgroundRepeat: 'no-repeat',
                    }
                  : {}
              }
            >
              {!featuredAuthor.image && (
                <div className="book-cover-large wine">{featuredAuthor.name}</div>
              )}
            </div>
          </div>
        )}

        {/* Cabeçalho de pesquisa */}
        {isSearching && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, alignSelf: 'flex-start', marginTop: '10px', marginLeft: '40px' }}>
            <span
              className="btn-secondary"
              style={{ cursor: 'pointer' }}
              onClick={() => { window.location.href = '/books'; }}
            >
              &larr; Voltar
            </span>
            {activeTag && (
              <h3 style={{ margin: 0, fontSize: 24, color: 'var(--text-primary)' }}>
                Resultados para <span style={{ color: 'var(--text-tertiary)' }}>#{activeTag}</span>
              </h3>
            )}
          </div>
        )}

        {isSearching && (
          <div className="feed-tabs">
            <button className={activeTab === 'books' ? 'active-tab' : ''} onClick={() => setActiveTab('books')}>
              Books
            </button>
            <button className={activeTab === 'authors' ? 'active-tab' : ''} onClick={() => setActiveTab('authors')}>
              Authors
            </button>
          </div>
        )}

        <div className="books-container">
          {isSearching ? (
            <>
              {activeTab === 'books' && (
                <div>
                  <div className="search-results-grid">
                    {bookResults.slice(0, visibleBooks).map((book) => (
                      <BookCard key={book.id} book={book} onAuthorClick={handleAuthorNavigate} />
                    ))}
                  </div>
                  {visibleBooks < bookResults.length && (
                    <span
                      className="btn-secondary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setVisibleBooks((prev) => Math.min(prev + 20, bookResults.length))}
                    >
                      Load more
                    </span>
                  )}
                </div>
              )}

              {activeTab === 'authors' && (
                <div>
                  <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
                    Exibindo {Math.min(visibleAuthors, allAuthorResults.length)} de {allAuthorResults.length} authors
                  </p>
                  <div className="search-results-grid">
                    {allAuthorResults.slice(0, visibleAuthors).map((author) => {
                      const authorId = author.key.replace('/authors/', '');
                      const image = getAuthorImage(authorId);
                      return (
                        <div
                          key={author.key}
                          className="suggestion-card"
                          onClick={() => navigate(`/authorpage?key=${encodeURIComponent(author.key)}`)}
                          style={{ cursor: 'pointer', gridColumn: 'span 10' }}
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={author.name}
                              style={{ width: 38, height: 38, objectFit: 'cover', display: 'block', borderRadius: '50%' }}
                            />
                          ) : (
                            <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ddd' }}>
                              ?
                            </div>
                          )}
                          <div className="suggestion-info">
                            <span className="suggestion-name">{author.name}</span>
                            <span className="suggestion-total">
                              {author.work_count != null ? `${author.work_count} livros publicados` : 'Sem dados'}
                            </span>
                          </div>
                          <button className="follow-btn" onClick={(e) => e.stopPropagation()}>
                            <FontAwesomeIcon icon={faCirclePlus} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {visibleAuthors < allAuthorResults.length && (
                    <span
                      className="btn-secondary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setVisibleAuthors((prev) => Math.min(prev + 12, allAuthorResults.length))}
                    >
                      Load more
                    </span>
                  )}
                  <p>&nbsp;</p>
                </div>
              )}
            </>
          ) : (
            <>
              {recentlyViewed.length > 0 && renderSection('Recently Viewed', recentlyViewed, 'recently-viewed')}
              {renderSection('Recommended for you', personalizedBooks, 'personalized')}
              {CATALOG_SECTIONS.map((section) =>
                renderSection(section.label, catalogSections[section.id], section.id)
              )}
            </>
          )}
        </div>
      </main>

      <aside className="right-column">
        <div className="search-container" style={{ marginTop: 20 }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            placeholder="Searching for something?"
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              if (value.trim() === '') {
                setIsSearching(false);
                setBookResults([]);
                setAuthorResults([]);
                setError('');
                setActiveTab('books');
              }
            }}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        {/* Top 5 categorias com contagem */}
        <div className="tags-box">
          <h3><FontAwesomeIcon icon={faSeedling} /> Categories</h3>
          {topCategories.map((cat) => (
            <div
              key={cat.id}
              className="tag-card"
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 6 }}
              onClick={() => {
                setQuery(cat.label);
                setActiveTag(cat.id);
                setLoading(true);
                searchBooks(cat.query)
                  .then((books) => {
                    setBookResults((books || []).map(buildBookCardData));
                    setVisibleBooks(20);
                    setIsSearching(true);
                    setActiveTab('books');
                  })
                  .catch(() => {
                    setBookResults(FALLBACK_BOOKS);
                    setIsSearching(true);
                  })
                  .finally(() => setLoading(false));
              }}
            >
              <p style={{ margin: 0, flex: 1, textAlign: 'left' }}>{cat.label}</p>
            </div>
          ))}
        </div>

        {/* Autores sugeridos */}
        <div className="suggestions-box">
          <h3><FontAwesomeIcon icon={faPenNib} /> Authors for you</h3>
          {suggestedAuthors.map((author) => (
            <div
              key={author.key}
              className="suggestion-card"
              onClick={() => navigate(`/authorpage?key=${encodeURIComponent(author.key)}`)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={author.image}
                alt={author.name}
                className="profile-avatar"
                style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="suggestion-info">
                <span className="suggestion-name">{author.name}</span>
                <span className="suggestion-total">
                  {author.work_count != null ? `${author.work_count} books published` : 'Author'}
                </span>
              </div>
              <button className="follow-btn" onClick={(e) => e.stopPropagation()}>
                <FontAwesomeIcon icon={faCirclePlus} />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Books;