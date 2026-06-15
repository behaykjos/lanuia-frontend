const BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

/**
 * Busca livros na API do Google Books.
 * @param {string} query - Termo de busca (título, autor, etc. )
 * @returns {Promise<Array>} - Lista de volumes encontrados ou array vazio.
 */
export async function searchBooks(query) {
  if (!query) return [];

  try {
    const url = API_KEY 
      ? `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=12&key=${API_KEY}`
      : `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=12`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Erro na busca do Google Books: ${res.statusText}`);
    }

    const data = await res.json();

    return (data.items || []).map((book) => {
      const imageLinks = book.volumeInfo.imageLinks;

      const thumbnail =
        imageLinks?.thumbnail
          ?.replace("http://", "https://")
          ?.replace("zoom=1", "zoom=2") ||
        imageLinks?.smallThumbnail;

      return {
        id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        thumbnail,
      };
    });

  } catch (error) {
    console.error("Erro ao buscar livros no Google Books:", error);
    return [];
  }
}

/**
 * Busca detalhes de um livro específico pelo ID do Google.
 */
export async function getBookDetails(googleBookId) {
  try {
    const url = API_KEY 
      ? `${BASE_URL}/${googleBookId}?key=${API_KEY}`
      : `${BASE_URL}/${googleBookId}`;

    const res = await fetch(url);
    if (!res.ok) return null;
    
    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar detalhes do livro:", error);
    return null;
  }
}