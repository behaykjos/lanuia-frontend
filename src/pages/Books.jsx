import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { searchBooks } from '../services/googleBooks';
// Importação atualizada para incluir o getAuthorDetails que já tens no teu ficheiro
import { searchAuthorsByName, getAuthorImage, getAuthorDetails } from '../services/openLibrary';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPenNib, faCirclePlus, faSeedling, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const ALL_CATEGORIES = [
  { id: 'romance', label: 'Romance', query: 'subject:romance bestseller' },
  { id: 'fantasy', label: 'Fantasia', query: 'subject:fantasy magic' },
  { id: 'romantasy', label: 'Romantasy', query: 'fantasy romance fae magic' },
  { id: 'dark', label: 'Dark Romance', query: 'dark romance enemies lovers' },
  { id: 'ya', label: 'Young Adult', query: 'subject:young adult fiction' },
  { id: 'thriller', label: 'Thriller', query: 'subject:thriller suspense' },
  { id: 'mystery', label: 'Mistério', query: 'subject:mystery detective' },
  { id: 'classics', label: 'Clássicos', query: 'subject:classics literature' },
  { id: 'scifi', label: 'Ficção Científica', query: 'subject:science fiction' },
  { id: 'horror', label: 'Horror', query: 'subject:horror scary' },
  { id: 'historical', label: 'Romance Histórico', query: 'historical romance regency' },
  { id: 'contemporary', label: 'Romance Contemporâneo', query: 'contemporary romance adult' },
  { id: 'newadult', label: 'New Adult', query: 'new adult romance college' },
  { id: 'paranormal', label: 'Paranormal', query: 'paranormal romance vampire' },
  { id: 'manga', label: 'Manga & Webtoon', query: 'manga romance shojo' },
  { id: 'poetry', label: 'Poesia', query: 'subject:poetry love' },
  { id: 'selfhelp', label: 'Autoajuda', query: 'subject:self-help personal development' },
  { id: 'biography', label: 'Biografia', query: 'subject:biography memoir' },
  { id: 'crime', label: 'Crime & Policial', query: 'subject:crime fiction murder' },
  { id: 'lgbtq', label: 'LGBTQ+', query: 'lgbtq romance queer fiction' },
  { id: 'booktok', label: 'BookTok Favoritos', query: 'colleen hoover taylor jenkins reid' },
  { id: 'enemies', label: 'Enemies to Lovers', query: 'enemies to lovers romance' },
  { id: 'slowburn', label: 'Slow Burn', query: 'slow burn romance tension' },
  { id: 'spicy', label: 'Spicy Romance', query: 'spicy romance adult fiction' },
  { id: 'fae', label: 'Fae & Magia', query: 'fae magic court fantasy' },
  { id: 'dystopia', label: 'Distopia', query: 'subject:dystopian fiction' },
  { id: 'adventure', label: 'Aventura', query: 'subject:adventure action' },
  { id: 'graphic', label: 'Graphic Novels', query: 'subject:graphic novels comics' },
  { id: 'portuguese', label: 'Autores Portugueses', query: 'autores portugueses ficção' },
  { id: 'brazilian', label: 'Literatura Brasileira', query: 'literatura brasileira romance' },
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
    };
  }

  return item;
};

// FUNÇÃO AUXILIAR: Extrai apenas a primeira frase de um texto de biografia
const getFirstSentence = (bioText) => {
  if (!bioText) return '';
  // Divide o texto no primeiro ponto final seguido de espaço ou quebra de linha
  const sentences = bioText.split(/\.\s+/);
  return sentences[0] ? `${sentences[0]}.` : bioText;
};

const BookCard = ({ book, onAuthorClick }) => {
  const navigate = useNavigate();
  const authorName = book.authors?.[0] || book.volumeInfo?.authors?.[0];

  return (
    <div onClick={() => navigate(`/bookpage/${book.id}`)} style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, width: 138 }}>
      {/* capa — sem alterações */}
      <div style={{ width: 138, height: 220, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', background: '#f0eaed', flexShrink: 0 }}>
        {book.thumbnail ? (
          <img src={book.thumbnail} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
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
          onClick={(e) => {
            e.stopPropagation();
            onAuthorClick(authorName); // passa só o nome, a Books.jsx trata do resto
          }}
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
  
  const [personalizedBooks, setPersonalizedBooks] = useState([]);
  const [featuredAuthor, setFeaturedAuthor] = useState(null);
  const [worksCount, setWorksCount] = useState(null);

  const [visibleAuthors, setVisibleAuthors] = useState(12);
  const [categoryBooks, setCategoryBooks] = useState({});
  const [suggestedAuthors, setSuggestedAuthors] = useState([]);

  const [searchParams] = useSearchParams();

  const user = JSON.parse(localStorage.getItem('@Lanuia:user') || '{}');

  const buildRecommendationQuery = () => {
    const favoriteCategory = user.favoriteCategory || 'romance';
    const favoriteAuthor = user.favoriteAuthor || '';
    const favoriteTags = Array.isArray(user.favoriteTags) ? user.favoriteTags : [];

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
      portuguese: 'autores portugueses ficção',
      brazilian: 'literatura brasileira romance',
    };

    if (favoriteAuthor) return `${favoriteAuthor} books`;
    if (favoriteTags.length > 0) return favoriteTags.slice(0, 2).join(' ');
    return categoryMap[favoriteCategory] || 'subject:romance bestseller';
  };

  const getAuthorWorksCount = async (authorKey) => {
    const id = authorKey.replace('/authors/', '');
    try {
      const res = await fetch(`https://openlibrary.org/authors/${id}/works.json?limit=1000`);
      const data = await res.json();
      return data?.entries?.length || 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  };

  useEffect(() => {
    const loadPersonalizedData = async () => {
      try {
        const preferredQuery = buildRecommendationQuery();
        const books = await searchBooks(preferredQuery);
        setPersonalizedBooks(books.map(buildBookCardData).slice(0, 15));

        const preferredAuthorName =
          user.favoriteAuthor ||
          (user.favoriteCategory === 'fantasy' ? 'Sarah J. Maas' : 'Colleen Hoover');

        const authorsList = await searchAuthorsByName(preferredAuthorName);
        const author = Array.isArray(authorsList) ? authorsList[0] : authorsList;

        if (author && author.key) {
          const image = getAuthorImage(author.key.replace('/authors/', ''));

          const details = await getAuthorDetails(author.key);
          const firstSentenceBio = details?.bio 
            ? getFirstSentence(details.bio) 
            : 'Autora sugerida com base nas tuas preferências.';

          setFeaturedAuthor({
            name: author.name,
            bio: firstSentenceBio,
            image: image,
            key: author.key,
          });

          const count = await getAuthorWorksCount(author.key);
          setWorksCount(count);
        }
      } catch (err) {
        setPersonalizedBooks(FALLBACK_BOOKS);
      }
    };

    loadPersonalizedData();
  }, []);

  useEffect(() => {
    const tag = searchParams.get('tag');
    if (!tag) return;

    const doTagSearch = async () => {
      try {
        setLoading(true);
        setQuery(tag);
        setActiveTag(tag);  // ← novo
        const books = await searchBooks(`subject:${tag}`);  // ← subject: para resultados mais precisos
        setBookResults((books || []).map(buildBookCardData).slice(0, 20));
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

  const getSuggestedAuthors = () => {
    const favoriteCategory = user.favoriteCategory || 'romance';
    const favoriteAuthor = user.favoriteAuthor || '';
    const favoriteTags = Array.isArray(user.favoriteTags) ? user.favoriteTags : [];

    const suggestionsByCategory = {
      romance: ['Colleen Hoover', 'Emily Henry', 'Ana Huang'],
      fantasy: ['Sarah J. Maas', 'Holly Black', 'Rebecca Yarros'],
      romantasy: ['Sarah J. Maas', 'Rebecca Yarros', 'Carissa Broadbent'],
      dark: ['H.D. Carlton', 'Katee Robert', 'Rina Kent'],
      ya: ['Jenny Han', 'Holly Jackson', 'Stephanie Garber'],
      thriller: ['Freida McFadden', 'Tess Gerritsen', 'Lisa Jewell'],
      mystery: ['Agatha Christie', 'Richard Osman', 'Louise Penny'],
      classics: ['Jane Austen', 'George Orwell', 'Virginia Woolf'],
      scifi: ['Frank Herbert', 'Isaac Asimov', 'Ursula K. Le Guin'],
      horror: ['Stephen King', 'Shirley Jackson', 'Paul Tremblay'],
    };

    const base = suggestionsByCategory[favoriteCategory] || ['Colleen Hoover', 'Sarah J. Maas', 'Holly Black'];

    if (favoriteAuthor) {
      return [favoriteAuthor, ...base.filter((a) => a !== favoriteAuthor)];
    }

    return base;
  };

  useEffect(() => {
    const loadSuggestedAuthors = async () => {
      try {
        const names = getSuggestedAuthors().slice(0, 3);

        const results = await Promise.all(
          names.map(async (authorName) => {
            const authors = await searchAuthorsByName(authorName);
            const author = authors?.[0];

            if (!author?.key) {
              return {
                name: authorName,
                key: authorName,
                image: '',
                work_count: null,
              };
            }

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
      } catch (err) {
        setSuggestedAuthors([]);
      }
    };

    loadSuggestedAuthors();
  }, []);

  const renderSection = (title, books) => {
    if (!books || books.length === 0) return null;
    return (
      <div className="books-section">
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
        // fallback: passa só o nome se não encontrar key
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

      const author = authors?.[0];

      setBookResults((books || []).map(buildBookCardData).slice(0, 15));
      setAllAuthorResults(authors || []);
      setAuthorResults((authors || []).slice(0, 12));
      setVisibleAuthors(12);
      setActiveTab('books');

      if (author?.key) {
        const image = getAuthorImage(author.key.replace('/authors/', ''));
        const details = await getAuthorDetails(author.key);
        const firstSentenceBio = details?.bio ? getFirstSentence(details.bio) : 'Autor encontrado na pesquisa';

        setFeaturedAuthor({
          name: author.name,
          bio: firstSentenceBio,
          image,
          key: author.key,
        });

        const count = await getAuthorWorksCount(author.key);
        setWorksCount(count);
      }

      setIsSearching(true);
    } catch (err) {
      setError('Não foi possível pesquisar neste momento.');
      setBookResults(FALLBACK_BOOKS);
      setIsSearching(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCatalog = () => {
    setQuery('');
    setBookResults([]);
    setAuthorResults([]);
    setError('');
    setIsSearching(false);
    setFeaturedAuthor(null);
    setWorksCount(null);
    setActiveTab('books');
    setActiveTag('');
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
        {!isSearching && featuredAuthor && (
          <div className="author-banner">
            <div className="author-banner-info">
              <span className="author-banner-label">Autores Sugeridos</span>
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

            <div className="author-banner-image">
              {featuredAuthor.image ? (
                <img 
                  // Substitui o "-M.jpg" por "-L.jpg" dinamicamente
                  src={featuredAuthor.image.replace('-M.jpg', '-L.jpg')} 
                  alt={featuredAuthor.name} 
                />
              ) : (
                <div className="book-cover-large wine">{featuredAuthor.name}</div>
              )}
            </div>
          </div>
        )}

        {isSearching && (
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', // Faz um ficar embaixo do outro
              alignItems: 'flex-start', // Alinha eles à esquerda
              gap: 8, // Espaço vertical entre o botão e o texto
              alignSelf: 'flex-start', 
              marginTop: '10px', 
              marginLeft: '40px' 
            }}
          >
            <span
              className="btn-secondary"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                window.location.href = '/books'; 
              }}
            >
              &larr; Voltar
            </span>
            
            {activeTag && (
              <h3 style={{ margin: 0, fontSize: 24, color: 'var(--text-primary)' }}> {/* Mudei o fontSize de 16 para 24 */}
                Resultados para <span style={{ color: 'var(--text-tertiary)' }}>#{activeTag}</span>
              </h3>
            )}
          </div>
        )}

        {isSearching && (
          <div className="feed-tabs">
            <button
              className={activeTab === 'books' ? 'active-tab' : ''}
              onClick={() => setActiveTab('books')}
            >
              Livros
            </button>
            <button
              className={activeTab === 'authors' ? 'active-tab' : ''}
              onClick={() => setActiveTab('authors')}
            >
              Autores
            </button>
          </div>
        )}

        <div className="books-container">
          {isSearching ? (
            <>
              {activeTab === 'books' && (
                <div className="search-results-grid">
                  {bookResults.map((book) => (
                    <BookCard key={book.id} book={book} onAuthorClick={handleAuthorNavigate} />
                  ))}
                </div>
              )}

              {activeTab === 'authors' && (
                <div>
                  <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
                    Exibindo {Math.min(visibleAuthors, allAuthorResults.length)} de {allAuthorResults.length} autores
                  </p>

                  <div className="search-results-grid">
                    {allAuthorResults.slice(0, visibleAuthors).map((author) => {
                      const authorId = author.key.replace('/authors/', '');
                      const image = getAuthorImage(authorId);
                      const count = author.work_count ?? 0;

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
                              style={{
                                width: 38,
                                height: 38,
                                objectFit: 'cover',
                                display: 'block',
                                borderRadius: '50%',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#ddd',
                              }}
                            >
                              ?
                            </div>
                          )}

                          <div className="suggestion-info">
                            <span className="suggestion-name">{author.name}</span>
                            <span className="suggestion-total">{author.work_count != null ? `${author.work_count} livros publicados` : 'Sem dados'}</span>
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
                      Carregar mais
                    </span>
                  )}
                  <p>&nbsp;</p>
                </div>
              )}
            </>
          ) : (
            <>
              {renderSection('✨ Recomendados para ti', personalizedBooks)}
            </>
          )}
        </div>
      </main>

      <aside className="right-column">
        <div className="search-container" style={{ marginTop: 20 }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            placeholder="O que procuras?"
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

        <div className="tags-box">
          <h3><FontAwesomeIcon icon={faSeedling} /> Categorias</h3>
          {ALL_CATEGORIES.slice(0, 10).map((cat) => (
            <div key={cat.id} className="tag-card">
              <p>{cat.label}</p>
            </div>
          ))}
        </div>

        <div className="suggestions-box">
          <h3><FontAwesomeIcon icon={faPenNib} /> Autores para ti</h3>

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
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />

              <div className="suggestion-info">
                <span className="suggestion-name">{author.name}</span>
                <span className="suggestion-total">
                  {author.work_count ?? 0} livros publicados
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