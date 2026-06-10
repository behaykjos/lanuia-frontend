import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Lightbox — mostra todas as imagens ao clicar
const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  const prev = (e) => { e.stopPropagation(); setCurrent(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setCurrent(i => (i + 1) % images.length); };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>
        <FontAwesomeIcon icon={faXmark} />
      </button>

      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        {images.length > 1 && (
          <button className="lightbox-nav lightbox-prev" onClick={prev}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}
        <img src={images[current]} alt={`imagem ${current + 1}`} className="lightbox-img" />
        {images.length > 1 && (
          <button className="lightbox-nav lightbox-next" onClick={next}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="lightbox-dots">
          {images.map((_, i) => (
            <span
              key={i}
              className={`lightbox-dot ${i === current ? 'active' : ''}`}
              onClick={e => { e.stopPropagation(); setCurrent(i); }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Grid de imagens
const ImageGrid = ({ images, onRemove, editable = false }) => {
  const [lightbox, setLightbox] = useState(null); // índice da imagem no lightbox

  const count = images.length;
  if (count === 0) return null;

  const open = (i) => setLightbox(i);

  // Célula individual
  const Cell = ({ index, style = {}, children }) => (
    <div
      className="img-grid-cell"
      style={style}
      onClick={() => open(index)}
    >
      <img src={images[index]} alt={`foto ${index + 1}`} className="img-grid-img" />

      {/* Overlay "+N" na 4ª imagem quando há mais de 4 */}
      {index === 3 && count > 4 && (
        <div className="img-grid-more">
          +{count - 4}
        </div>
      )}

      {/* Botão remover (só no modo edição) */}
      {editable && onRemove && (
        <button
          className="img-grid-remove"
          onClick={e => { e.stopPropagation(); onRemove(index); }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}

      {children}
    </div>
  );

  // Layouts consoante número de imagens
  const renderGrid = () => {
    if (count === 1) {
      return (
        <div className="img-grid img-grid-1">
          <Cell index={0} />
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="img-grid img-grid-2">
          <Cell index={0} />
          <Cell index={1} />
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className="img-grid img-grid-3">
          <Cell index={0} style={{ gridRow: 'span 2' }} />
          <Cell index={1} />
          <Cell index={2} />
        </div>
      );
    }

    // 4 ou mais — mostra sempre só 4 células
    return (
      <div className="img-grid img-grid-4">
        <Cell index={0} />
        <Cell index={1} />
        <Cell index={2} />
        <Cell index={3} />
      </div>
    );
  };

  return (
    <>
      {renderGrid()}
      {lightbox !== null && (
        <Lightbox
          images={images}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
};

export default ImageGrid;