import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage, faXmark, faTriangleExclamation,
  faHashtag, faPaperPlane, faEye, faEyeSlash,
  faWandMagicSparkles, faHeart, faComment, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import ImageGrid from '../components/ImageGrid';
import api from '../services/api';

const MAX_CHARS = 2000;

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isTheory, setIsTheory] = useState(false);
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]); // URLs locais para preview
  const [preview, setPreview] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const charsLeft = MAX_CHARS - content.length;

  const handleImage = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 10 - images.length;
    const toAdd = files.slice(0, remaining).map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...toAdd]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagKey = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#*/, '');
      if (tag && !tags.includes(tag)) setTags(prev => [...prev, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError('');

    try {
      // 1. Vai buscar o token armazenado no localStorage
      const storedUser = localStorage.getItem('@Lanuia:user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const token = userData?.token; // Confirma se a propriedade se chama 'token' no teu backend

      // Se não houver token, bloqueia antes de gastar largura de banda
      if (!token) {
        setError('Session expired. Please, log in again.');
        setLoading(false);
        return;
      }

      // 2. Cria a configuração com o Header Authorization Bearer
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const imageUrl = images.find(img => img.startsWith('http')) ?? null;

      // 3. Passa a 'config' como o terceiro parâmetro do api.post
      await api.post('/posts', {
        content: content.trim(),
        image: imageUrl,
        hasSpoiler,
        isTheory,
        tags,
      }, config); // <--- O segredo está aqui

      // Reset do formulário
      setContent('');
      setIsTheory(false);
      setHasSpoiler(false);
      setTags([]);
      setImages([]);
      setPreview(false);

      navigate('/feed');
    } catch (err) {
      console.error(err);
      // Exibe uma mensagem mais clara caso o servidor devolva 401 explicitamente
      if (err.response?.status === 401) {
        setError('Not authorized. Your login may have expired.');
      } else {
        setError('Erro publishing. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem('@Lanuia:user') || '{}');

  return (
    <div className="layout">
      <Sidebar />

      <main className="feed">
        <div className="create-container create-container-wide">

          <div className="create-header">
            <h1 className="create-title">New post</h1>
            <button
              className="create-preview-btn"
              onClick={() => { setPreview(v => !v); setSpoilerRevealed(false); }}
            >
              <FontAwesomeIcon icon={preview ? faEyeSlash : faEye} />
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {error && (
            <div className="warning-banner" style={{ borderRadius: 10, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {!preview ? (
            <div className="create-form">

              <div className="create-toggles">
                <button
                  className={`create-toggle-btn ${isTheory ? 'active' : ''}`}
                  onClick={() => setIsTheory(v => !v)}
                >
                  <FontAwesomeIcon icon={faWandMagicSparkles} />
                  Theory
                </button>
                <button
                  className={`create-toggle-btn ${hasSpoiler ? 'active' : ''}`}
                  onClick={() => setHasSpoiler(v => !v)}
                >
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  Contains spoiler
                </button>
              </div>

              <div className="create-textarea-wrapper">
                <textarea
                  className="create-textarea"
                  placeholder="What do you have in mind?"
                  value={content}
                  onChange={e => e.target.value.length <= MAX_CHARS && setContent(e.target.value)}
                />
                <span className={`create-char-count ${charsLeft < 100 ? 'warning' : ''}`}>
                  {charsLeft}
                </span>
              </div>

              <ImageGrid images={images} onRemove={removeImage} editable={true} />

              <div className="create-tags-wrapper">
                <FontAwesomeIcon icon={faHashtag} style={{ color: 'var(--search-color)', flexShrink: 0 }} />
                <div className="create-tags-input-area">
                  {tags.map(tag => (
                    <span key={tag} className="create-tag">
                      #{tag}
                      <button className="create-tag-remove" onClick={() => removeTag(tag)}>
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </span>
                  ))}
                  <input
                    className="create-tag-input"
                    placeholder={tags.length === 0 ? 'Add #tags...' : ''}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKey}
                  />
                </div>
              </div>

              <div className="create-footer">
                <div className="create-footer-left">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImage}
                  />
                  <button
                    className="create-icon-btn"
                    onClick={() => fileRef.current.click()}
                    title="Attach images"
                    disabled={images.length >= 10}
                    style={{ opacity: images.length >= 10 ? 0.4 : 1 }}
                  >
                    <FontAwesomeIcon icon={faImage} />
                  </button>
                </div>

                <button
                  className="create-post-btn"
                  disabled={!content.trim() || loading}
                  onClick={handleSubmit}
                >
                  {loading
                    ? <FontAwesomeIcon icon={faSpinner} spin />
                    : <><FontAwesomeIcon icon={faPaperPlane} /> Publish</>
                  }
                </button>
              </div>

            </div>
          ) : (
            <div className="create-preview-card">
              <div className="post-card">
                <div className="post-header">
                  <div className="profile-avatar">{user?.name?.[0] || 'T'}</div>
                  <div className="post-info">
                    <p className="post-name">{user?.name || 'Tu'}</p>
                  </div>
                  <span className="post-more">···</span>
                </div>

                {hasSpoiler ? (
                  <div style={{ position: 'relative' }}>
                    <div style={{ filter: spoilerRevealed ? 'none' : 'blur(8px)' }}>
                      <p className="post-content">{content || 'The content of your post will appear here...'}</p>
                      <ImageGrid images={images} />
                    </div>
                    {!spoilerRevealed && (
                      <button
                        className="post-show-btn"
                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}
                        onClick={() => setSpoilerRevealed(true)}
                      >
                        Show content
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="post-content">
                      {content || <span style={{ color: '#bbb' }}>Your post's content will appear here...</span>}
                    </p>
                    <ImageGrid images={images} />
                  </>
                )}

                {tags.length > 0 && (
                  <div className="post-tags">
                    {tags.map(tag => <span key={tag} className="post-tag">#{tag}</span>)}
                  </div>
                )}

                <div className="post-actions">
                  {isTheory && (
                    <span className="post-type-badge">
                      <FontAwesomeIcon icon={faWandMagicSparkles} /> Theory
                    </span>
                  )}
                  {hasSpoiler && <span className="post-show">Contains spoiler</span>}
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 0</span>
                    <span><FontAwesomeIcon icon={faComment} /> 0</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>
              <p className="create-preview-note">This is how your post will appear on feed.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CreatePost;