const OPEN_LIBRARY_API = 'https://openlibrary.org';

const normalizeAuthorId = (authorKey) => {
  if (!authorKey) return '';
  return authorKey.replace('/authors/', '');
};

export function getAuthorImage(authorId) {
  const id = normalizeAuthorId(authorId);
  if (!id) return null;
  return `https://covers.openlibrary.org/a/olid/${id}-M.jpg`;
}

// Utilitário genérico de fetch com retry, igual ao do Google Books
async function fetchWithRetry(url, retries = 2, delay = 800) {
  try {
    const res = await fetch(url);

    if ((res.status === 429 || res.status === 503) && retries > 0) {
      console.warn(`Open Library instável (Status ${res.status}). Retry em ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return await fetchWithRetry(url, retries - 1, delay * 2);
    }

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return await fetchWithRetry(url, retries - 1, delay * 2);
    }
    console.error('Erro de rede na Open Library:', error);
    return null;
  }
}

export async function searchAuthorsByName(query) {
  if (!query) return [];

  try {
    const url = `${OPEN_LIBRARY_API}/search/authors.json?q=${encodeURIComponent(query)}`;
    const data = await fetchWithRetry(url);
    if (!data) return [];

    return (data.docs || []).map((author) => ({
      key: author.key,
      name: author.name,
      work_count: author.work_count || 0,
      birth_date: author.birth_date || null,
      top_work: author.top_work || null,
      image: author.key ? getAuthorImage(author.key) : null,
    }));
  } catch (error) {
    console.error('Erro ao buscar autores:', error);
    return [];
  }
}

export async function getAuthorDetails(authorKey) {
  if (!authorKey) return null;

  try {
    const key = authorKey.startsWith('/authors/') ? authorKey : `/authors/${authorKey}`;
    const data = await fetchWithRetry(`${OPEN_LIBRARY_API}${key}.json`);
    if (!data) return null;

    return {
      key,
      name: data.name || 'Autor sem nome',
      bio: typeof data.bio === 'string' ? data.bio : data.bio?.value || '',
      birth_date: data.birth_date || null,
      death_date: data.death_date || null,
      photos: data.photos || [],
      alternate_names: data.alternate_names || [],
      wikipedia: data.wikipedia || null,
      image: data.photos?.length
        ? `https://covers.openlibrary.org/a/id/${data.photos[0]}-M.jpg`
        : getAuthorImage(key),
    };
  } catch (error) {
    console.error('Erro ao obter detalhes do autor:', error);
    return null;
  }
}

export async function getAuthorWorks(authorKey, limit = 20) {
  if (!authorKey) return [];

  try {
    const key = authorKey.startsWith('/authors/') ? authorKey : `/authors/${authorKey}`;
    const data = await fetchWithRetry(`${OPEN_LIBRARY_API}${key}/works.json?limit=${limit}`);
    if (!data) return [];

    return (data.entries || []).map((work) => ({
      key: work.key,
      title: work.title,
      first_publish_year: work.first_publish_year || null,
      coverId: work.covers?.[0] || null,
    }));
  } catch (error) {
    console.error('Erro ao obter obras do autor:', error);
    return [];
  }
}

export function getWorkCoverUrl(coverId) {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}