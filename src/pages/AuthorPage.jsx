import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faStar, faChevronRight, faEllipsis } from '@fortawesome/free-solid-svg-icons';

const AuthorPage = () => {
  const [following, setFollowing] = useState(false);

  return (
    <div className="layout">
      <Sidebar />

      <main className="author-main">

        {/* COLUNA ESQUERDA — Info do autor */}
        <aside className="author-info-col">

          <div className="author-avatar-wrapper">
            <div className="author-avatar-large">S J</div>
          </div>

          <h1 className="author-info-name">Sarah J. Maas</h1>

          <div className="author-stats">
            <span><strong>17</strong> livros</span>
            <span className="author-stats-dot">·</span>
            <span><strong>140K</strong> seguidores</span>
          </div>

          <div className="author-info-actions">
            <button
              className={`author-follow-btn ${following ? 'following' : ''}`}
              onClick={() => setFollowing(v => !v)}
            >
              {following ? 'A seguir' : 'Seguir'}
            </button>
            <button className="author-more-btn">
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </div>

          <p className="author-bio">
            Sarah Janet Maas é uma escritora norte-americana de fantasia. Sua obra alcançou o patamar de best-seller do New York Times e USA Today. Seu livro de estreia: Trono de Vidro, foi publicado em português em 2013 pela Galera Record.
          </p>

          <div className="author-site">
            <span>
                <FontAwesomeIcon icon={faGlobe} style={{ color: 'var(--text-primary)' }} />
                <a href="#" className="author-site-link">Site oficial</a>
            </span>
            <span className="author-rating">
              4.6 <FontAwesomeIcon icon={faStar} style={{ color: 'var(--text-primary)', fontSize: 12 }} />
            </span>
          </div>

        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="author-content">

          {/* Sagas */}
          <div className="books-section">
            <div className="books-section-header">
              <h3>Sagas de livros</h3>
            </div>
            <div className="author-sagas-row">
              <div className="author-saga-card">
                <div className="book-cover wine" style={{ width: 166, height: 253 }}>Trono de Vidro</div>
                <span className="author-saga-title">Trono de Vidro</span>
                <span className="author-saga-year">2012</span>
              </div>
              <div className="author-saga-card">
                <div className="book-cover rose" style={{ width: 166, height: 253 }}>Corte de Espinhos e Rosas</div>
                <span className="author-saga-title">Corte de Espinhos e Rosas</span>
                <span className="author-saga-year">2015</span>
              </div>
              <div className="author-saga-card">
                <div className="book-cover purple" style={{ width: 166, height: 253 }}>Cidade da Lua Crescente</div>
                <span className="author-saga-title">Cidade da Lua Crescente</span>
                <span className="author-saga-year">2020</span>
              </div>
            </div>
          </div>

          {/* Livros publicados */}
          <div className="books-section">
            <div className="books-section-header">
              <h3>Livros publicados</h3>
              <span className="books-see-more">Ver todos <FontAwesomeIcon icon={faChevronRight} /></span>
            </div>
            <div className="books-row">
              <div className="author-saga-card">
                <div className="book-cover wine" style={{ width: 166, height: 253 }} />
                <span className="author-saga-title">Trono de Vidro</span>
                <span className="author-saga-year">2012</span>
              </div>
              <div className="author-saga-card">
                <div className="book-cover mauve" style={{ width: 166, height: 253 }} />
                <span className="author-saga-title">Coroa da Meia-Noite</span>
                <span className="author-saga-year">2013</span>
              </div>
              <div className="author-saga-card">
                <div className="book-cover slate" style={{ width: 166, height: 253 }} />
                <span className="author-saga-title">A Lâmina da Assassina</span>
                <span className="author-saga-year">2014</span>
              </div>
              <div className="author-saga-card">
                <div className="book-cover purple" style={{ width: 166, height: 253 }} />
                <span className="author-saga-title">Herdeira do Fogo</span>
                <span className="author-saga-year">2015</span>
              </div>
              <div className="author-saga-card">
                <div className="book-cover rose" style={{ width: 166, height: 253 }} />
                <span className="author-saga-title">Corte de Espinhos e Rosas</span>
                <span className="author-saga-year">2015</span>
              </div>
              <div className="author-saga-card">
                <div className="book-cover pink" style={{ width: 166, height: 253 }} />
                <span className="author-saga-title">Corte de Névoa e Fúria</span>
                <span className="author-saga-year">2016</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default AuthorPage;