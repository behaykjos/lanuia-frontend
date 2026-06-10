import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faHeart, faComment, faPaperPlane,
  faChevronRight, faWandMagicSparkles, faGlobe, faLock, faXmark
} from '@fortawesome/free-solid-svg-icons';

const EditModal = ({ shelf, onClose, onSave }) => {
  const [title, setTitle] = useState(shelf.title);
  const [isPublic, setIsPublic] = useState(shelf.isPublic);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <div className="field" style={{ marginBottom: 20 }}>
          <label className="field-label">Título</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ borderRadius: 10, border: '1px solid #e8d0d8', padding: '10px 14px', fontSize: 14 }}
          />
        </div>
        <div className="field" style={{ marginBottom: 28 }}>
          <label className="field-label" style={{ marginBottom: 10, display: 'block' }}>Visibilidade</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setIsPublic(true)} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', border: isPublic ? '2px solid #E8AFC2' : '1px solid #eee', background: isPublic ? '#fdeef3' : 'white', color: isPublic ? '#9d6b7a' : '#888', fontWeight: isPublic ? 700 : 400, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <FontAwesomeIcon icon={faGlobe} /> Pública
            </button>
            <button onClick={() => setIsPublic(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', border: !isPublic ? '2px solid #E8AFC2' : '1px solid #eee', background: !isPublic ? '#fdeef3' : 'white', color: !isPublic ? '#9d6b7a' : '#888', fontWeight: !isPublic ? 700 : 400, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <FontAwesomeIcon icon={faLock} /> Privada
            </button>
          </div>
        </div>
        <button onClick={() => onSave({ title, isPublic })} style={{ width: '100%', padding: '12px', borderRadius: 20, background: '#E8AFC2', color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Guardar alterações
        </button>
      </div>
    </div>
  );
};

const SHELVES = [
  { id: 1, title: 'Melhores romances do booktok', isPublic: true, books: [{ id: 1, color: 'pink', title: 'It Ends with Us' }, { id: 2, color: 'purple', title: 'Ugly Love' }, { id: 3, color: 'rose', title: 'November 9' }] },
  { id: 2, title: 'Fantasia épica', isPublic: true, books: [{ id: 4, color: 'wine', title: 'ACOTAR' }, { id: 5, color: 'lilac', title: 'The Name of the Wind' }, { id: 6, color: 'slate', title: 'Mistborn' }] },
  { id: 3, title: 'Sci-fi que me marcaram', isPublic: false, books: [{ id: 7, color: 'purple', title: 'Ninth House' }, { id: 8, color: 'mauve', title: 'The Priory' }] },
  { id: 4, title: 'Livros para ler antes de morrer', isPublic: false, books: [{ id: 9, color: 'pink', title: 'Duna' }] },
];

const Profile = () => {
  const [editingShelf, setEditingShelf] = useState(null);
  const [shelves, setShelves] = useState(SHELVES);

  const handleSave = (updated) => {
    setShelves(prev => prev.map(s => s.id === editingShelf.id ? { ...s, ...updated } : s));
    setEditingShelf(null);
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="profile-main">

        {/* COLUNA ESQUERDA */}
        <aside className="profile-info-col">
          <div className="profile-page-avatar">U</div>
          <h2 className="profile-page-name">Utilizador teste</h2>
          <p className="profile-page-nick">@utilizadorteste6</p>
          <p className="profile-page-stats-line">
            <strong>53</strong> conexões · <strong>14</strong> a seguir
          </p>
          <button className="profile-edit-btn">Editar Perfil</button>
          <p className="profile-page-bio">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="profile-content">

          {/* Banner */}
          <div className="profile-banner">
            <div className="profile-banner-overlay" />
          </div>

          {/* Estantes públicas */}
          <div className="profile-section-block">
            <div className="profile-section-header">
              <h3 className="profile-section-title">Estantes públicas</h3>
              <span className="books-see-more">Ver todas <FontAwesomeIcon icon={faChevronRight} /></span>
            </div>

            <div className="profile-shelves-row">
              {shelves.filter(s => s.isPublic).map(shelf => (
                <div key={shelf.id} className="profile-shelf-card">
                  <div className={`profile-shelf-img ${shelf.books[0]?.color || 'pink'}`}>
                    {shelf.books[0]?.title}
                  </div>
                  <div className="profile-shelf-info">
                    <h3 className="profile-shelf-name">{shelf.title}</h3>
                    <span className="profile-shelf-count">{shelf.books.length} livros</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publicações e Reviews lado a lado */}
          <div className="profile-bottom-grid">

            {/* Publicações & Teorias */}
            <div className="profile-bottom-col">
              <h3 className="profile-section-title">Publicações & Teorias</h3>

              <div className="post-card">
                <div className="post-header" style={{ marginBottom: 'auto' }}>
                  <span className="post-more">···</span>
                </div>
                <p className="post-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <div className="post-tags">
                  <span className="post-tag">#memes</span>
                  <span className="post-tag">#romantasy</span>
                </div>
                <div className="post-actions">
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 350</span>
                    <span><FontAwesomeIcon icon={faComment} /> 66</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>

              <div className="post-card">
                <div className="post-header" style={{ marginBottom: 'auto' }}>
                  <span className="post-more">···</span>
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <p className="post-content" style={{ filter: 'blur(8px)', margin: 0, display: 'inline-block' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <button className="post-show-btn" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>Mostrar publicação</button>
                </div>
                <div className="post-actions" style={{ marginTop: 12 }}>
                  <span className="post-type-badge"><FontAwesomeIcon icon={faWandMagicSparkles} /> Teoria</span>
                  <span className="post-show">Contém spoiler</span>
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 44</span>
                    <span><FontAwesomeIcon icon={faComment} /> 12</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="profile-bottom-col">
              <h3 className="profile-section-title">Reviews</h3>

              <div className="post-card">
                <div className="post-header">
                  <div className="post-info">
                    <p className="review-name">Esperava Mais</p>
                    <p className="review-book-title">Vermelho, Branco e Sangue Azul</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <span className="post-more">···</span>
                </div>
                <p className="post-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <span className="recommend-badge no">✗ Não recomendo</span>
                <div className="post-actions">
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 140</span>
                    <span><FontAwesomeIcon icon={faComment} /> 99</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>

              <div className="post-card">
                <div className="post-header">
                  <div className="post-info">
                    <p className="review-name">Que final perfeito</p>
                    <p className="review-book-title">Rainha do Nada</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <span className="post-more">···</span>
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <p className="post-content" style={{ filter: 'blur(8px)', margin: 0, display: 'inline-block' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <button className="post-show-btn" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>Mostrar publicação</button>
                </div>
                <span className="recommend-badge yes" style={{ marginTop: '17px' }}>✓ Recomendo</span>
                <div className="post-actions">
                  <span className="post-show">Contém spoiler</span>
                  <div className="post-action-group">
                    <span><FontAwesomeIcon icon={faHeart} /> 280</span>
                    <span><FontAwesomeIcon icon={faComment} /> 45</span>
                    <span><FontAwesomeIcon icon={faPaperPlane} /></span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {editingShelf && (
        <EditModal shelf={editingShelf} onClose={() => setEditingShelf(null)} onSave={handleSave} />
      )}
    </div>
  );
};

export default Profile;