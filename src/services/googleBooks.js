const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

const EXPLICIT_TITLE_WORDS = [
  'seduced', 'naked', 'bare', 'naughty', 'filthy', 'dirty', 'sinful',
  'lust', 'erotic', 'erotica', 'seduction', 'forbidden desire', 'adults',
  'wet', 'hard', 'stroking', 'climax', 'orgasm', 'arousal', 'xxx', 'porn', 'nude',
];

// Transforma o item cru da API do Google Books no formato achatado usado em todo o projeto
function flattenGoogleBook(item) {
  const info = item.volumeInfo || {};
  const thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;

  return {
    id: item.id,           // usado em Books.jsx: navigate(`/bookpage/${book.id}`)
    googleId: item.id,     // usado em AuthorPage.jsx: navigate(`/bookpage/${book.googleId}`)
    title: info.title || 'Sem título',
    thumbnail: thumbnail ? thumbnail.replace('http://', 'https://') : null,
    authors: info.authors || [],
    language: info.language || null,
    description: info.description || '',
    maturityRating: info.maturityRating || null,
    publishedDate: info.publishedDate || null,
  };
}

export function filterSafeBooks(books) {
  return books.filter((book) => {
    if (book.maturityRating === 'MATURE') return false;
    const titleLower = (book.title || '').toLowerCase();
    const descLower = (book.description || '').toLowerCase();
    return !EXPLICIT_TITLE_WORDS.some(
      (word) => titleLower.includes(word) || descLower.includes(word)
    );
  });
}

let requestQueue = Promise.resolve();
const MIN_GAP_MS = 350; // espaçamento mínimo entre pedidos consecutivos

function queueRequest(fn) {
  const run = requestQueue.then(async () => {
    const result = await fn();
    await new Promise((resolve) => setTimeout(resolve, MIN_GAP_MS));
    return result;
  });
  // Mesmo que `fn` falhe, a fila continua a andar para o próximo pedido
  requestQueue = run.catch(() => {});
  return run;
}

async function fetchWithRetry(url, retries = 3, delay = 1500) {
  return queueRequest(async () => {
    const attempt = async (retriesLeft, currentDelay) => {
      try {
        const res = await fetch(url);

        if ((res.status === 429 || res.status === 503) && retriesLeft > 0) {
          console.warn(`Google Books instável (Status ${res.status}). Retry em ${currentDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          return await attempt(retriesLeft - 1, currentDelay * 2);
        }

        if (!res.ok) return null;
        return await res.json();
      } catch (error) {
        if (retriesLeft > 0) {
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          return await attempt(retriesLeft - 1, currentDelay * 2);
        }
        console.error('Erro de rede no Google Books:', error);
        return null;
      }
    };

    return attempt(retries, delay);
  });
}

export async function searchBooks(query) {
  try {
    const url = `${GOOGLE_BOOKS_API}/volumes?q=${encodeURIComponent(query)}&maxResults=12&key=${API_KEY}`;
    const data = await fetchWithRetry(url);
    if (!data?.items) return [];
    return filterSafeBooks(data.items.map(flattenGoogleBook));
  } catch (error) {
    console.error('Erro ao buscar livros no Google Books:', error);
    return [];
  }
}

export async function getBookDetails(id) {
  try {
    const url = `${GOOGLE_BOOKS_API}/volumes/${id}?key=${API_KEY}`;
    const item = await fetchWithRetry(url);
    return item ? flattenGoogleBook(item) : null;
  } catch (error) {
    console.error('Erro ao buscar detalhes do livro:', error);
    return null;
  }
}

export async function getBooksByAuthor(authorName, lang = 'en', limit = 40) {
  if (!authorName) return [];

  const params = new URLSearchParams({
    q: `inauthor:"${authorName}"`,
    maxResults: '40',
    langRestrict: lang,
    key: API_KEY,
  });

  const data = await fetchWithRetry(`${GOOGLE_BOOKS_API}/volumes?${params}`);
  if (!data?.items) return [];

  const flattened = data.items.map(flattenGoogleBook);
  return filterSafeBooks(flattened).slice(0, limit);
}