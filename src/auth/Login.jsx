import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import api from '../services/api';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Faz a requisição usando o Axios
      const res = await api.post('/auth/login', { identifier, password });

      // 2. No Axios, os dados já vêm prontos em res.data (não precisa de res.json())
      const data = res.data; 

      // Salvar dados no localStorage
      localStorage.setItem('@Lanuia:token', data.token);
      localStorage.setItem('@Lanuia:user', JSON.stringify(data.user));

      // Redireciona para o Feed
      navigate("/feed");
    } catch (err) {
      // 3. O Axios joga erros de status (como 400 ou 401) direto para o catch.
      // Pegamos a mensagem que veio do seu servidor backend se ela existir.
      const mensagemErro = err.response?.data?.error || 'Login failed';
      setError(mensagemErro);
    }
  };

  // mostrar mensagem de sucesso recebida via query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('activated') === 'true') {
      setSuccess('Conta ativada! Faça login para continuar.');
      // limpar query para evitar repetição
      window.history.replaceState({}, document.title, '/login');
    }
  }, [location]);

  return (
    <div className="login-container">
      <h1 className="lanuia">Login</h1>

      <form onSubmit={handleSubmit}>
        <label>Email or Username</label>
        <input
          type="text"
          placeholder="Your email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <div className="field">
          <label>Password</label>

          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <p className="error-text">{error}</p>
        )}
        {success && (
          <p className="success-text" style={{ color: 'green' }}>{success}</p>
        )}

        <button type="submit" className="primary-btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;