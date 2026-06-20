import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faLock, faGlobe, faPen, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

const SHELVES = [
  {
    id: 1,
    title: 'Best booktok romances',
    isPublic: true,
    books: [
      { id: 1, color: 'pink', title: 'It Ends with Us' },
      { id: 2, color: 'purple', title: 'Ugly Love' },
      { id: 3, color: 'rose', title: 'November 9' },
      { id: 4, color: 'mauve', title: 'Confess' },
      { id: 5, color: 'blush', title: 'Verity' },
    ],
  },
  {
    id: 2,
    title: 'Recommended for me',
    isPublic: false,
    books: [
      { id: 6, color: 'sage', title: 'The Flatshare' },
      { id: 7, color: 'teal', title: 'Beach Read' },
      { id: 8, color: 'coral', title: 'People We Meet' },
      { id: 9, color: 'dusty', title: 'One Day' },
    ],
  },
  {
    id: 3,
    title: 'Epic fantasy',
    isPublic: true,
    books: [
      { id: 10, color: 'wine', title: 'ACOTAR' },
      { id: 11, color: 'lilac', title: 'The Name of the Wind' },
      { id: 12, color: 'slate', title: 'Mistborn' },
      { id: 13, color: 'purple', title: 'Ninth House' },
      { id: 14, color: 'mauve', title: 'The Priory' },
    ],
  },
];

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
          <label className="field-label">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ borderRadius: 10, border: '1px solid #e8d0d8', padding: '10px 14px', fontSize: 14 }}
          />
        </div>

        <div className="field" style={{ marginBottom: 28 }}>
          <label className="field-label" style={{ marginBottom: 10, display: 'block' }}>Visibility</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setIsPublic(true)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                border: isPublic ? '2px solid #E8AFC2' : '1px solid #eee',
                background: isPublic ? '#fdeef3' : 'white',
                color: isPublic ? '#9d6b7a' : '#888',
                fontWeight: isPublic ? 700 : 400, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <FontAwesomeIcon icon={faGlobe} /> Public
            </button>
            <button
              onClick={() => setIsPublic(false)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                border: !isPublic ? '2px solid #E8AFC2' : '1px solid #eee',
                background: !isPublic ? '#fdeef3' : 'white',
                color: !isPublic ? '#9d6b7a' : '#888',
                fontWeight: !isPublic ? 700 : 400, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <FontAwesomeIcon icon={faLock} /> Private
            </button>
          </div>
        </div>

        <button
          onClick={() => onSave({ title, isPublic })}
          style={{
            width: '100%', padding: '12px', borderRadius: 20,
            background: 'var(--accent-extra-soft', color: 'white', border: 'none',
            fontWeight: 700, fontSize: 15, cursor: 'pointer'
          }}
        >
          Guardar alterações
        </button>
      </div>
    </div>
  );
};

const Shelf = () => {
  const [shelves, setShelves] = useState(SHELVES);
  const [editingShelf, setEditingShelf] = useState(null);

  const handleSave = (updated) => {
    setShelves(prev => prev.map(s =>
      s.id === editingShelf.id ? { ...s, ...updated } : s
    ));
    setEditingShelf(null);
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="feed">
        <div className="shelf-container">

          <div className="shelf-header">
            <h1 className="shelf-title">
              Book shelf
            </h1>
            <button className="shelf-new-btn">
              <FontAwesomeIcon icon={faPlus} /> Create new </button>
          </div>

          {shelves.map(shelf => (
            <div key={shelf.id} className="shelf-section">
              <div className="shelf-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 className="shelf-section-title">{shelf.title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="books-see-more">
                    See more <FontAwesomeIcon icon={faChevronRight} />
                  </span>
                </div>
              </div>

              <p>
                <span className="shelf-visibility-badge">
                    <FontAwesomeIcon icon={shelf.isPublic ? faGlobe : faLock} />
                    {shelf.isPublic ? ' Pública' : ' Privada'}
                </span>
                &nbsp;
                <span className="shelf-count">{shelf.books.length} books</span>
              </p>
              <br></br>

              <div className="books-row">
                {shelf.books.map(book => (
                  <div key={book.id} className={`book-cover ${book.color}`}>
                    {book.title}
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </main>

      {editingShelf && (
        <EditModal
          shelf={editingShelf}
          onClose={() => setEditingShelf(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Shelf;