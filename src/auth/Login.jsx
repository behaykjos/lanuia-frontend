import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

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
      const res = await fetch('http://localhost:3333/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Salvar dados no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem('@Lanuia:token', data.token);

      // Redireciona para o Feed
      navigate("/feed");
    } catch (err) {
      setError(err.message);
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

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        <span 
          className="btn-secondary" 
          onClick={() => navigate('/forgot-password')} 
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
        >
          Forgot password?
        </span>
      </p>
    </div>
  );
};

export default Login;