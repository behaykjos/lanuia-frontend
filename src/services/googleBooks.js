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

  const fetchBooks = async (langRestrict, retries = 2, delay = 1000) => {
    const params = new URLSearchParams({
      q: `inauthor:"${authorName}"`,
      maxResults: '40',
      langRestrict,
      key: API_KEY,
    });

    try {
      const res = await fetch(`${GOOGLE_BOOKS_API}/volumes?${params}`);
      
      // Se der erro 503 (ou 429 de limite) e ainda tivermos tentativas restando
      if ((res.status === 503 || res.status === 429) && retries > 0) {
        console.warn(`Servidor instável (Status ${res.status}). Tentando novamente em ${delay}ms...`);
        // Aguarda o tempo estipulado
        await new Promise(resolve => setTimeout(resolve, delay));
        // Tenta de novo, diminuindo 1 tentativa e dobrando o tempo de espera
        return await fetchBooks(langRestrict, retries - 1, delay * 2);
      }

      if (!res.ok) return [];
      const data = await res.json();
      return data.items || [];
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await fetchBooks(langRestrict, retries - 1, delay * 2);
      }
      return [];
    }
  };
}