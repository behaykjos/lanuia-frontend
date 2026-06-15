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

export async function searchAuthorsByName(query) {
  if (!query) return [];

  try {
    const res = await fetch(
      `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(query)}`
    );
    if (!res.ok) return [];

    const data = await res.json();

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
    const res = await fetch(`${OPEN_LIBRARY_API}${key}.json`);
    if (!res.ok) return null;

    const data = await res.json();

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
    const res = await fetch(`${OPEN_LIBRARY_API}${key}/works.json?limit=${limit}`);
    if (!res.ok) return [];

    const data = await res.json();

    return (data.entries || []).map((work) => ({
      key: work.key,
      title: work.title,
      first_publish_year: work.first_publish_year || null,
    }));
  } catch (error) {
    console.error('Erro ao obter obras do autor:', error);
    return [];
  }
}