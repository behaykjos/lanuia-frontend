const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

export async function searchBooks(query) {
  try {
    const res = await fetch(
      `${GOOGLE_BOOKS_API}/volumes?q=${encodeURIComponent(query)}&maxResults=12&key=${API_KEY}`
    );
    if (!res.ok) throw new Error(`Erro na busca do Google Books: `);
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Erro ao buscar livros no Google Books:', error);
    return [];
  }
}

export async function getBookDetails(id) {
  try {
    const res = await fetch(`${GOOGLE_BOOKS_API}/volumes/${id}?key=${API_KEY}`);
    if (!res.ok) throw new Error('Erro ao buscar detalhes do livro');
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar detalhes do livro:', error);
    return null;
  }
}

export async function getBooksByAuthor(authorName, lang = 'en', limit = 40) {
  if (!authorName) return [];

  try {
    const fetchBooks = async (langRestrict) => {
      const params = new URLSearchParams({
        q: `inauthor:"${authorName}"`,
        maxResults: '40',
        langRestrict,
        key: API_KEY,
      });
      const res = await fetch(`${GOOGLE_BOOKS_API}/volumes?${params}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.items || [];
    };

    // busca em PT e EN em paralelo
    const [ptBooks, enBooks] = await Promise.all([
      fetchBooks(lang === 'en' ? 'en' : 'pt'),
      fetchBooks('en'),
    ]);

    // formata todos
    const format = (item) => {
      const info = item.volumeInfo;
      const thumbnail =
        info.imageLinks?.thumbnail?.replace('http://', 'https://') ||
        info.imageLinks?.smallThumbnail?.replace('http://', 'https://') ||
        null;
      return {
        key: item.id,
        googleId: item.id,
        title: info.title || 'Sem título',
        first_publish_year: info.publishedDate
          ? parseInt(info.publishedDate.substring(0, 4))
          : null,
        thumbnail,
        language: info.language || lang,
        categories: info.categories || [],
      };
    };

    const ptFormatted = ptBooks.map(format);
    const enFormatted = enBooks.map(format);

    // junta: PT tem prioridade, EN preenche o que faltar
    const seen = new Set();
    const result = [];

    for (const book of [...ptFormatted, ...enFormatted]) {
      const normalized = book.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push(book);
      }
    }

    return result;
  } catch (error) {
    console.error('Erro ao buscar livros do autor:', error);
    return [];
  }
}