import axios from 'axios';

const api = axios.create({
  // Prioriza a URL definida no .env do frontend (VITE_API_URL)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
} );

/**
 * Interceptor para Autenticação
 * Verifica se existe um token no localStorage antes de cada requisição.
 * Se existir, adiciona-o ao cabeçalho Authorization.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Lanuia:token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Interceptor para Erros (Opcional, mas recomendado)
 * Pode ser usado para redirecionar para o login se o token expirar (erro 401).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('@Lanuia:token');
      localStorage.removeItem('@Lanuia:user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;