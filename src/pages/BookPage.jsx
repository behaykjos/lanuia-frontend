import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faHeart, faComment, faPaperPlane,
  faChevronRight, faBookmark, faShareNodes
} from '@fortawesome/free-solid-svg-icons';

const BookPage = () => {
  const [savedToShelf, setSavedToShelf] = useState(false);

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
                <h1 className="book-title">Powerless</h1>
                <span className="book-saga-badge">14+</span>
              </div>
              <p className="book-author-link">Lauren Roberts</p>
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
              <span className="book-rating-number">4,3</span>
              <FontAwesomeIcon icon={faStar} style={{ color: 'var(--text-secondary)', fontSize: 20 }} />
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
              <span>2.0</span>
              <span style={{ fontSize: 12, color: '#aaa' }}>Avaliações totais</span>
            </div>
          </div>

          {/* Sinopse */}
          <div className="book-synopsis">
            <h3 className="book-section-title">Sinopse</h3>
            <p className="book-synopsis-text">
              Num mundo onde o poder define tudo, Paedyn Gray não tem nenhum. Filha de um pai que a treinou para sobreviver em Ilya, uma cidade que elimina os fracos, ela aprendeu a fingir ser o que não é. Mas quando é forçada a participar nos Purges Trials ao lado do príncipe Kai Azer — o Elite mais perigoso do reino — os seus segredos podem custar-lhe a vida.
            </p>
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
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
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
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                </div>
                <span className="post-more">···</span>
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                <p className="post-content" style={{ filter: 'blur(8px)', margin: 0, display: 'inline-block' }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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

          <div className="book-cover-large wine">
            Powerless
          </div>

          <div className="book-tags-section">
            <span className="post-tag">#romantasy</span>
            <span className="post-tag">#magic</span>
            <span className="post-tag">#powerless</span>
            <span className="post-tag">#laurenroberts</span>
            <span className="post-tag">#fantasy</span>
            <span className="post-tag">#ya</span>
            <span className="post-tag">#slowburn</span>
            <span className="post-tag">#enemies2lovers</span>
          </div>

          <button className="books-see-more" style={{ marginTop: 12, justifyContent: 'center' }}>
            Explorar mais... <FontAwesomeIcon icon={faChevronRight} />
          </button>

        </aside>

      </main>
    </div>
  );
};

export default BookPage;