import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getBookDetails } from '../services/googleBooks';
import { searchAuthorsByName } from '../services/openLibrary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart, faComment, faPaperPlane, faChevronRight, faBookmark, faShareNodes } from '@fortawesome/free-solid-svg-icons';

const BookPage = () => {
  const [savedToShelf, setSavedToShelf] = useState(false);
  const [book, setBook] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getBookDetails(id).then(setBook);
    }
  }, [id]);

  const navigate = useNavigate();

  const handleAuthorClick = async (authorName) => {
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

  if (!book) return (
    <div className="layout">
      <Sidebar />
      <main className="book-main" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#aaa' }}>A carregar...</p>
      </main>
    </div>
  );

  const info = book.volumeInfo;

  // Classificação Etária
  const getAgeRating = (maturityRating) => {
    const rating = maturityRating?.toUpperCase().trim();

    switch (rating) {
      case 'MATURE':
        return '+18';
      case 'NOT_MATURE':
        return 'Livre'; 
      case 'TEEN':
      case '16+':
        return '+16';
      case '14+':
        return '+14';
      case '12+':
        return '+12';
      case '10+':
      case 'LIVRE':
      case 'FREE':
      case 'ALL':
        return '+10';
      case 'TODOS':
      case 'TODAS':
      case 'TO DES':
      case 'LIVRE':
        return 'Todes';
      default:
        return rating || '+14';
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="book-main">

        {/* COLUNA ESQUERDA — Info e posts */}
        <div className="book-content">

          {/* Cabeçalho do livro */}
          <div className="book-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 className="book-title">{info.title}</h1>
                {info.maturityRating && (
                  <span className="book-saga-badge">
                    {getAgeRating(info.maturityRating)}
                  </span>
                )}
              </div>
              <p className="book-author-link">
                {info.authors?.length > 0 ? (
                  info.authors.map((author, index) => (
                    <span key={author}>
                      <span
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleAuthorClick(author)}
                      >
                        {author}
                      </span>
                      {index < info.authors.length - 1 && ', '}
                    </span>
                  ))
                ) : 'Autor desconhecido'}
              </p>
            </div>

            <div className="book-header-actions">
              <button
                className={`book-shelf-btn ${savedToShelf ? 'saved' : ''}`}
                onClick={() => setSavedToShelf(v => !v)}
              >
                <FontAwesomeIcon icon={faBookmark} />
                {savedToShelf ? 'Na estante' : 'Adicionar à estante'}
              </button>
              <button className="author-more-btn">
                <FontAwesomeIcon icon={faShareNodes} />
              </button>
            </div>
          </div>

          {/* Média de classificação */}
          <div className="book-rating-section">
            <div className="book-rating-score">
              <span className="book-rating-number">
                {info.averageRating ? info.averageRating.toFixed(1).replace('.', ',') : '—'}
              </span>
              <FontAwesomeIcon icon={faStar} style={{ color: '#E8AFC2', fontSize: 20 }} />
            </div>
            <div className="book-rating-stars">
              {[5,4,3,2,1].map(n => (
                <div key={n} className="book-rating-bar-row">
                  <span className="book-rating-bar-label">{n}</span>
                  <div className="book-rating-bar-track">
                    <div
                      className="book-rating-bar-fill"
                      style={{ width: `${[72, 55, 30, 15, 8][5 - n]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="book-rating-total">
              <span>{info.ratingsCount ? `${(info.ratingsCount / 1000).toFixed(1)}K` : '—'}</span>
              <span style={{ fontSize: 12, color: '#aaa' }}>Avaliações totais</span>
            </div>
          </div>

          {/* Sinopse */}
          <div className="book-synopsis">
            <h3 className="book-section-title">Sinopse</h3>
            {info.description ? (
              <p
                className="book-synopsis-text"
                dangerouslySetInnerHTML={{ __html: info.description }}
              />
            ) : (
              <p className="book-synopsis-text" style={{ color: '#aaa' }}>Sinopse não disponível.</p>
            )}
          </div>

          {/* Posts da comunidade */}
          <div className="book-community">
            <h3 className="book-section-title">Reviews da comunidade</h3>

            <div className="post-card">
              <div className="post-header">
                <div className="profile-avatar">M</div>
                <div className="post-info">
                  <p className="review-name">Melhor livro da minha vida</p>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(i => <FontAwesomeIcon key={i} icon={faStar} style={{ color: '#E8AFC2', fontSize: 13 }} />)}
                </div>
                <span className="post-more">···</span>
              </div>
              <p className="post-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <span className="recommend-badge yes">✓ Recomendo</span>
              <div className="post-actions">
                <span className="post-name">Nakyum</span>
                <div className="post-action-group">
                  <span><FontAwesomeIcon icon={faHeart} /> 214</span>
                  <span><FontAwesomeIcon icon={faComment} /> 33</span>
                  <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                </div>
              </div>
            </div>

            <div className="post-card">
              <div className="post-header">
                <div className="profile-avatar">N</div>
                <div className="post-info">
                  <p className="review-name">Nothing's new</p>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(i => <FontAwesomeIcon key={i} icon={faStar} style={{ color: i <= 3 ? '#E8AFC2' : '#e8d0d8', fontSize: 13 }} />)}
                </div>
                <span className="post-more">···</span>
              </div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <p className="post-content" style={{ filter: 'blur(8px)', margin: 0, display: 'inline-block' }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <button className="post-show-btn" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
                  Mostrar publicação
                </button>
              </div>
              <span className="recommend-badge no" style={{ marginTop: '17px' }}>✗ Não recomendo</span>
              <div className="post-actions">
                <span className="post-name">He/She/It</span>
                <span className="post-show">Contém spoiler</span>
                <div className="post-action-group">
                  <span><FontAwesomeIcon icon={faHeart} /> 98</span>
                  <span><FontAwesomeIcon icon={faComment} /> 12</span>
                  <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA — Capa e tags */}
        <aside className="book-sidebar">

          {info.imageLinks?.thumbnail ? (
            <img
              src={info.imageLinks.thumbnail.replace('http://', 'https://')}
              alt={info.title}
              style={{ width: 160, height: 240, objectFit: 'cover', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
            />
          ) : (
            <div className="book-cover-large wine">{info.title}</div>
          )}

          {/* Formata as categorias em tags individuais */}
          {(() => {
            const rawCategories = info.categories || [];
            const tags = [...new Set(
              rawCategories
                .flatMap(cat => cat.split('/'))
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0)
            )];

            return (
              <div className="book-tags-section">
                {tags.length > 0 ? tags.map(tag => (
                  <span
                    key={tag}
                    className="post-tag"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/books?tag=${encodeURIComponent(tag)}`)}
                  >
                    #{tag}
                  </span>
                )) : (
                  <>
                    <span className="post-tag" onClick={() => navigate('/books?tag=livros')} style={{ cursor: 'pointer' }}>#livros</span>
                    <span className="post-tag" onClick={() => navigate('/books?tag=lanuia')} style={{ cursor: 'pointer' }}>#lanuia</span>
                  </>
                )}
              </div>
            );
          })()}

        </aside>

      </main>
    </div>
  );
};

export default BookPage;