import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPenNib, faCirclePlus, faSeedling } from '@fortawesome/free-solid-svg-icons';

const Books = () => {
  return (
    <div className="layout">
      <Sidebar />
 
      <main className="feed">

          {/* Banner autor em destaque (ocupa toda a largura do feed) */}
          <div className="author-banner">
            <div className="author-banner-info">
              <span className="author-banner-label">Autores Sugeridos</span>
              <h2 className="author-banner-name">Colleen Hoover</h2>
              <p className="author-banner-bio">Nascida Margaret Colleen Fennell, é uma escritora norte-americana que aborda temas frágeis em seus livros de romance new-adult.</p>
              <div className="author-banner-actions">
                <button className="btn-explore">Explorar</button>
                <button className="btn-more-info">Mais informações</button>
              </div>
            </div>
            <div className="author-banner-image">
              <img src="https://cloudfront-us-east-1.images.arcpublishing.com/estadao/WGRIX7CIP5FSFPL5QN7S6AOLGA.jpg" alt="Colleen Hoover" />
            </div>
          </div>

        <div className="books-container">
 
          {/* Recomendações */}
          <div className="books-section">
            <div className="books-section-header">
              <h3>Recomendações</h3>
            </div>
            <div className="books-row">
              <div className="book-cover pink">It Ends<br/>with Us</div>
              <div className="book-cover purple">Ugly Love</div>
              <div className="book-cover rose">November 9</div>
              <div className="book-cover mauve">Confess</div>
              <div className="book-cover blush">Verity</div>
              <div className="book-cover wine">Reminders</div>
            </div>
          </div>
 
          {/* Livros Independentes */}
          <div className="books-section">
            <div className="books-section-header">
              <h3>Livros independentes</h3>
            </div>
            <div className="books-row">
              <div className="book-cover sage">The Flatshare</div>
              <div className="book-cover teal">Beach Read</div>
              <div className="book-cover coral">People We<br/>Meet</div>
              <div className="book-cover dusty">One Day</div>
              <div className="book-cover slate">Normal<br/>People</div>
              <div className="book-cover lilac">Daisy Jones</div>
            </div>
          </div>
 
        </div>
      </main>
 
      {/* Coluna direita */}
      <aside className="right-column">
              <div className="search-container">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input placeholder="Searching for something?" />
              </div>
 
        <div className="tags-box">
            <h3><FontAwesomeIcon icon={faSeedling} /> Categorias do momento</h3>
            <div className="tag-card"><p>Romantasy</p><span>201K livros</span></div>
            <div className="tag-card"><p>Romance contemporâneo</p><span>98.3K livros</span></div>
            <div className="tag-card"><p>Fantasia</p><span>87.6K livros</span></div>
            <div className="tag-card"><p>Young Adult</p><span>76.5K livros</span></div>
            <div className="tag-card"><p>Boys Love</p><span>65.2K livros</span></div>
        </div>
 
        <div className="suggestions-box">
          <h3><FontAwesomeIcon icon={faPenNib} /> Autores para ti</h3>
          <div className="suggestion-card">
            <div className="profile-avatar" style={{ width: 38, height: 38, fontSize: 13, background: '#c8a4b8' }}>SJM</div>
            <div className="suggestion-info">
              <span className="suggestion-name">Sarah J. Maas</span>
              <span className="suggestion-total">17 livros publicados</span>
            </div>
            <button className="follow-btn"><FontAwesomeIcon icon={faCirclePlus} /></button>
          </div>
          <div className="suggestion-card">
            <div className="profile-avatar" style={{ width: 38, height: 38, fontSize: 13, background: '#b8869e' }}>LR</div>
            <div className="suggestion-info">
              <span className="suggestion-name">Lauren Roberts</span>
              <span className="suggestion-total">12 livros publicados</span>
            </div>
            <button className="follow-btn"><FontAwesomeIcon icon={faCirclePlus} /></button>
          </div>
          <div className="suggestion-card">
            <div className="profile-avatar" style={{ width: 38, height: 38, fontSize: 13, background: '#d4a0b5' }}>HB</div>
            <div className="suggestion-info">
              <span className="suggestion-name">Holly Black</span>
              <span className="suggestion-total">8 livros publicados</span>
            </div>
            <button className="follow-btn"><FontAwesomeIcon icon={faCirclePlus} /></button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Books
