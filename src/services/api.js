import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333',
} );

// Adiciona o token automaticamente em todas as requisições se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Lanuia:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
