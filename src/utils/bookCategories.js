/**
 * Sistema de Categorias e Classificação Etária (AgeRating)
 * Alinhado com a lógica de filtragem do BookPage.jsx
 */

export const categoryRatings = {
  "Livre": [
    "juvenile fiction", "animals", "stories in verse", "bedtime", "activity", 
    "elementary", "nonfiction", "education", "elementary"
  ],
  "+12": [
    "action", "aventure", "fantasy", "magic", "comic", 
    "graphic novels", "manga", "shonen"
  ],
  "+14": [
    "romance", "contemporary", "dystopian", "dark fantasy", 
    "young adult", "science fiction"
  ],
  "+16": [
    "fiction", "thrillers", "suspense", "crime", "mistery & detective", 
    "murder", "hard-boiled"
  ],
  "+18": [
    "dark romance", "erotica", "horror", "psychological",
    "abuse", "sensual", "hentai", "yaoi", "yuri"
  ]
};

/**
 * Retorna todas as categorias permitidas para uma determinada idade.
 * @param {number} userAge - Idade calculada do utilizador
 * @returns {string[]} Lista de categorias permitidas
 */
export const getAllowedCategories = (userAge) => {
  let allowed = [...categoryRatings["Livre"]];
  
  if (userAge >= 12) allowed = [...allowed, ...categoryRatings["+12"]];
  if (userAge >= 14) allowed = [...allowed, ...categoryRatings["+14"]];
  if (userAge >= 16) allowed = [...allowed, ...categoryRatings["+16"]];
  if (userAge >= 18) allowed = [...allowed, ...categoryRatings["+18"]];
  
  // Remove duplicatas e ordena alfabeticamente
  return [...new Set(allowed)].sort();
};
