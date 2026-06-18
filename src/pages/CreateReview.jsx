import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { searchBooks } from '../services/googleBooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faXmark, faTriangleExclamation, faPaperPlane, faEye, faEyeSlash, faStar, faHeart, faComment, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const MAX_CHARS = 2000;

const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 6 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        style={{
          fontSize: 22,
          cursor: 'pointer',
          color: i <= value ? 'var(--accent-primary)' : 'var(--text-tertiary)',
          transition: 'color 0.15s, transform 0.15s',
        }}
        onClick={() => onChange(i)}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      />
    ))}
  </div>
);

const CreateReview = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [reviewName, setReviewName] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [stars, setStars] = useState(0);
  const [recommend, setRecommend] = useState(null);
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const fileRef = useRef(null);
  const dropdownRef = useRef(null);

  const charsLeft = MAX_CHARS - content.length;
  const canPost = content.trim().length > 0 && bookQuery.trim().length > 0 && stars > 0;

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Efeito de DEBOUNCE: Só faz a chamada à API 500ms após o utilizador parar de digitar
  useEffect(() => {
    if (bookQuery.trim().length <= 2) {
      setSuggestions([]);
      return;
    }

    // Se o texto atual for exatamente igual ao título do livro selecionado, não pesquisa de novo
    if (suggestions.some(book => book.volumeInfo?.title === bookQuery)) {
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchBooks(bookQuery);
        setSuggestions(results || []);
      } catch (err) {
        console.error("Erro ao procurar livros na Google Books API:", err);
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [bookQuery]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    e.target.value = '';
  };

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('@Lanuia:user') || '{}');
    } catch {
      return {};
    }
  })();

  return (
    <div className="layout">
      <Sidebar />

      <main className="feed">
        <div className="create-container create-container-wide">

          <div className="create-header">
            <h1 className="create-title">Nova review</h1>
            <button
              className="create-preview-btn"
              onClick={() => { setPreview(v => !v); setSpoilerRevealed(false); }}
            >
              <FontAwesomeIcon icon={preview ? faEyeSlash : faEye} />
              {preview ? 'Editar' : 'Pré-visualizar'}
            </button>
          </div>

          {!preview ? (
            <div className="create-form">

              <div className="review-field">
                <label className="field-label">Título da review</label>
                <input
                  className="review-input"
                  placeholder="Ex: Melhor obra da minha VIDA"
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                />
              </div>

              <div className="review-field" style={{ position: 'relative' }} ref={dropdownRef}>
                <label className="field-label">Livro</label>
                <div className="review-book-search-bar">
                  <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: 'var(--search-color)', flexShrink: 0 }} />
                  <input
                    className="review-book-search-input"
                    placeholder="Pesquisar livro..."
                    value={bookQuery}
                    onChange={(e) => setBookQuery(e.target.value)}
                  />
                </div>

                {suggestions.length > 0 && (
                  <div className="search-suggestions-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    zIndex: 1000,
                    maxHeight: '250px',
                    overflowY: 'auto',
                    marginTop: '4px'
                  }}>
                    {suggestions
                      .filter(book => book.volumeInfo)
                      .map(book => {
                        const thumbnail = book.volumeInfo.imageLinks?.smallThumbnail || book.volumeInfo.imageLinks?.thumbnail;

                        return (
                          <div
                            key={book.id}
                            className="suggestion-item"
                            onClick={() => {
                              setBookQuery(book.volumeInfo.title);
                              setSelectedBookId(book.id);
                              setSuggestions([]); 
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0eaed'
                            }}
                          >
                            {thumbnail && (
                              <img 
                                src={thumbnail.replace('http://', 'https://')} 
                                alt="" 
                                style={{ width: '30px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                              />
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <strong style={{ fontSize: '13px', color: '#2F2F2F' }}>{book.volumeInfo.title}</strong>
                              {book.volumeInfo.authors?.[0] && (
                                <span style={{ fontSize: '11px', color: '#666' }}>{book.volumeInfo.authors[0]}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="review-field" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label className="field-label">Classificação</label>
                  <StarRating value={stars} onChange={setStars} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                  <label className="field-label">Recomendo?</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className={`create-toggle-btn ${recommend === true ? 'active' : ''}`}
                      onClick={() => setRecommend(recommend === true ? null : true)}
                    >✓ Sim</button>
                    <button
                      className={`create-toggle-btn ${recommend === false ? 'active-no' : ''}`}
                      onClick={() => setRecommend(recommend === false ? null : false)}
                    >✗ Não</button>
                  </div>
                </div>
              </div>

              <div className="create-textarea-wrapper">
                <textarea
                  className="create-textarea"
                  placeholder="Como é o desenvolvimento do personagem protagonista? O plot é bom? Te identificaste com a história? Partilha pormenores da tua leitura para incentivares outros bookstans a lerem o livro."
                  value={content}
                  onChange={e => e.target.value.length <= MAX_CHARS && setContent(e.target.value)}
                />
                <span className={`create-char-count ${charsLeft < 100 ? 'warning' : ''}`}>
                  {charsLeft}
                </span>
              </div>

              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
              {image ? (
                <div className="review-image-preview">
                  <img src={image} alt="anexo" />
                  <button className="img-grid-remove" onClick={() => setImage(null)}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              ) : null}

              <div className="create-footer" style={{ paddingTop: image ? 12 : 0 }}>
                <div className="create-footer-left">
                  {!image && (
                    <button className="create-icon-btn" onClick={() => fileRef.current.click()} title="Anexar imagem">
                      <FontAwesomeIcon icon={faImage} />
                    </button>
                  )}
                  <button
                    className={`create-toggle-btn ${hasSpoiler ? 'active' : ''}`}
                    onClick={() => setHasSpoiler(v => !v)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    Contém spoiler
                  </button>
                </div>
                <button
                  className="create-post-btn"
                  disabled={!canPost}
                  onClick={() => alert('Post enviado!')}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  Publicar
                </button>
              </div>

            </div>
          ) : (
            <div className="create-preview-card">
              <div className="post-card">
                <div className="post-header">
                  <div className="profile-avatar">{storedUser?.name?.[0] || 'T'}</div>
                  <div className="post-info">
                    <p className="review-name">{reviewName || 'Título da review'}</p>
                    <p className="review-book-title">{bookQuery || 'Nome do livro'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(i => (
                      <FontAwesomeIcon key={i} icon={faStar} style={{ color: i <= stars ? 'var(--accent-primary)' : 'var(--text-tertiary)', fontSize: 14 }} />
                    ))}
                  </div>
                  <span className="post-more">···</span>
                </div>

                {hasSpoiler && !image ? (
                  <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <p className="post-content" style={{ filter: spoilerRevealed ? 'none' : 'blur(8px)', margin: 0, display: 'inline-block' }}>
                      {content || 'Conteúdo da review vai aparecer aqui...'}
                    </p>
                    {!spoilerRevealed && (
                      <button className="post-show-btn" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }} onClick={() => setSpoilerRevealed(true)}>
                        Mostrar review
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="post-content">{content || <span style={{ color: '#bbb' }}>Conteúdo da review vai aparecer aqui...</span>}</p>
                )}

                {image && (
                  <img src={image} alt="anexo" style={{ width: '100%', borderRadius: 12, marginBottom: 12, objectFit: 'cover', maxHeight: 300 }} />
                )}

                {recommend !== null && (
                  <span className={`recommend-badge ${recommend ? 'yes' : 'no'}`} style={{ marginBottom: 8, display: 'inline-block' }}>
                    {recommend ? '✓ Recomendo' : '✗ Não recomendo'}
                  </span>
                )}

                <div className="post-actions">
                  <span className="post-name">{storedUser?.name || 'Tu'}</span>
                  {hasSpoiler && <span className="post-show">Contém spoiler</span>}
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 0</span>
                    <span><FontAwesomeIcon icon={faComment} /> 0</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>
              <p className="create-preview-note">Assim é como a tua review vai aparecer no feed.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CreateReview;