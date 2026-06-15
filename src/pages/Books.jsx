import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { searchBooks } from '../services/googleBooks';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPenNib, faCirclePlus, faSeedling } from '@fortawesome/free-solid-svg-icons';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/bookpage/${book.id}`)} // 👈 MELHOR ROTA
      style={{
        cursor: 'pointer',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        width: 143
      }}
    >
      {book.thumbnail ? (
        <img
          src={book.thumbnail}
          alt={book.title}
          onError={(e) => e.target.src = '/fallback-book.png'}
          style={{
            width: 143,
            height: 214,
            objectFit: 'cover',
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }}
        />
      ) : (
        <div className="book-cover pink" style={{ width: 143, height: 214, fontSize: 11 }}>
          {book.title}
        </div>
      )}

      <span style={{ fontSize: 12, fontWeight: 600, color: '#2F2F2F' }}>
        {book.title}
      </span>
    </div>
  );
};

const Books = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [independentBooks, setIndependentBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitialBooks = async () => {
      const recs = await searchBooks('subject:romance');
      const indies = await searchBooks('subject:fantasy');

      setRecommendedBooks(recs.slice(0, 6));
      setIndependentBooks(indies.slice(0, 6));
    };

    loadInitialBooks();
  }, []);

  const handleSearch = async (query) => {
    if (query.length > 2) {
      setLoading(true);
      const results = await searchBooks(query);
      setSearchResults(results);
      setLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="feed">

        {/* Banner */}
        <div className="author-banner">
          <div className="author-banner-info">
            <span className="author-banner-label">Autores Sugeridos</span>
            <h2 className="author-banner-name">Colleen Hoover</h2>
            <p className="author-banner-bio">
              Escritora norte-americana famosa por romances intensos.
            </p>
          </div>
          <div className="author-banner-image">
            <img src="https://cloudfront-us-east-1.images.arcpublishing.com/estadao/WGRIX7CIP5FSFPL5QN7S6AOLGA.jpg" />
          </div>
        </div>

        <div className="books-container">

          {/* RESULTADOS */}
          {searchResults.length > 0 && (
            <div className="books-section">
              <h3>Resultados</h3>
              <div className="books-row">
                {loading
                  ? <p>A carregar...</p>
                  : searchResults.map(book => (
                      <BookCard key={book.id} book={book} />
                    ))
                }
              </div>
            </div>
          )}

          {/* RECOMENDADOS */}
          <div className="books-section">
            <h3>Recomendações</h3>
            <div className="books-row">
              {recommendedBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>

          {/* INDEPENDENTES */}
          <div className="books-section">
            <h3>Fantasia</h3>
            <div className="books-row">
              {independentBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* LATERAL DIREITA */}
      <aside className="right-column">
        <div className="search-container">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            placeholder="Buscar livros..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </aside>
    </div>
  );
};

export default Books;