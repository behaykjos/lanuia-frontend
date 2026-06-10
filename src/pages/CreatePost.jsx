import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage, faXmark, faLightbulb, faTriangleExclamation,
  faHashtag, faPaperPlane, faEye, faEyeSlash,
  faWandMagicSparkles, faHeart, faComment
} from '@fortawesome/free-solid-svg-icons';
import ImageGrid from '../components/ImageGrid';

const MAX_CHARS = 2000;

const Create = () => {
  const [content, setContent] = useState('');
  const [isTheory, setIsTheory] = useState(false);
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef(null);

  const charsLeft = MAX_CHARS - content.length;

  const handleImage = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 10 - images.length;
    const toAdd = files.slice(0, remaining).map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...toAdd]);
    e.target.value = ''; // permite selecionar as mesmas imagens de novo
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

  const canPost = content.trim().length > 0;
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

  return (
    <div className="layout">
      <Sidebar />

      <main className="feed">
        <div className="create-container create-container-wide">

          <div className="create-header">
            <h1 className="create-title">Nova publicação</h1>
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

              {/* Tipo de publicação */}
              <div className="create-toggles">
                <button
                  className={`create-toggle-btn ${isTheory ? 'active' : ''}`}
                  onClick={() => setIsTheory(v => !v)}
                >
                  <FontAwesomeIcon icon={faWandMagicSparkles} />
                  Teoria
                </button>
                <button
                  className={`create-toggle-btn ${hasSpoiler ? 'active' : ''}`}
                  onClick={() => setHasSpoiler(v => !v)}
                >
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  Contém spoiler
                </button>
              </div>

              {/* Área de texto */}
              <div className="create-textarea-wrapper">
                <textarea
                  className="create-textarea"
                  placeholder="O que tens na cabeça?"
                  value={content}
                  onChange={e => e.target.value.length <= MAX_CHARS && setContent(e.target.value)}
                />
                <span className={`create-char-count ${charsLeft < 100 ? 'warning' : ''}`}>
                  {charsLeft}
                </span>
              </div>

              {/* Imagem anexada */}
              <ImageGrid images={images} onRemove={removeImage} editable={true} />

              {/* Tags */}
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
                    placeholder={tags.length === 0 ? 'Adicionar #tags...' : ''}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKey}
                  />
                </div>
              </div>

              {/* Rodapé */}
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
                    title="Anexar imagens"
                    disabled={images.length >= 10}
                    style={{ opacity: images.length >= 10 ? 0.4 : 1 }}
                  >
                    <FontAwesomeIcon icon={faImage} />
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
            /* Pré-visualização */
            <div className="create-preview-card">
              <div className="post-card">
                <div className="post-header">
                  <div className="profile-avatar">
                    {JSON.parse(localStorage.getItem('@Lanuia:user') || '{}')?.name?.[0] || 'T'}
                  </div>
                  <div className="post-info">
                    <p className="post-name">
                      {JSON.parse(localStorage.getItem('@Lanuia:user') || '{}')?.name || 'Tu'}
                    </p>
                  </div>
                  <span className="post-more">···</span>
                </div>

                {hasSpoiler ? (
                  <div style={{ position: 'relative' }}>
                    <div style={{ filter: spoilerRevealed ? 'none' : 'blur(8px)' }}>
                      <p className="post-content">
                        {content || 'Conteúdo do teu post vai aparecer aqui...'}
                      </p>
                      <ImageGrid images={images} />
                    </div>

                    {!spoilerRevealed && (
                      <button
                        className="post-show-btn"
                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}
                        onClick={() => setSpoilerRevealed(true)}
                      >
                        Mostrar publicação
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="post-content">
                      {content || <span style={{ color: '#bbb' }}>Conteúdo do teu post vai aparecer aqui...</span>}
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
                      <FontAwesomeIcon icon={faWandMagicSparkles} /> Teoria
                    </span>
                  )}
                  &nbsp;
                  {hasSpoiler && <span className="post-show">Contém spoiler</span>}
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 0</span>
                    <span><FontAwesomeIcon icon={faComment} /> 0</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>
              <p className="create-preview-note">Assim é como o teu post vai aparecer no feed.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Create;