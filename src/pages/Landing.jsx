import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Login from '../auth/Login';
import Register from '../auth/Register';
import ForgotPassword from '../auth/ForgotPassword';
import ResetPassword from '../auth/ResetPassword';
import DeleteAccount from '../auth/DeleteAccount'; // 1. Importamos o novo componente
import heroImage from '../assets/intro.JPG';
import api from '../services/api';

const Landing = () => {
  const [view, setView] = useState('welcome');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 2. Verifica se veio um token de delete na URL para abrir a tela certa automaticamente
  useEffect(() => {
    if (searchParams.get('token') && window.location.pathname.includes('delete')) {
      setView('delete-account');
    }
  }, [searchParams]);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });

      const data = res.data;

      localStorage.setItem('@Lanuia:token', data.token);
      localStorage.setItem('@Lanuia:user', JSON.stringify(data.user));

      navigate('/feed');
    } catch (err) {
      setError('Google login failed');
    }
  };

  return (
    <div className="landing">
      {/* ESQUERDA */}
      <div className="landing-left">

        {view === 'welcome' && (
          <>
            <h1 className="lanuia">Where stories flow <br /> and minds glow.</h1>
            <br />
            <p>Find your people and dive into new literary worlds together. Explore our reviews, spil your theories and create a new <i>fandomverse</i>.</p>
            <br /><br />

            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError('Google login failed')}
              text="continue_with"
            />

            <div className="divider">
              <span>or</span>
            </div>

            <button className="primary" onClick={() => setView('login')}>
              Login
            </button>

            <br />
            <p className="muted">
              Don’t have an account?{' '}
              <span className='btn-secondary' onClick={() => setView('register')}>Register</span>
            </p>

            {error && <p className="error-text">{error}</p>}
          </>
        )}

        {view === 'login' && (
          <>
            <Login />
            <p style={{ marginTop: '20px', textAlign: 'center' }}>
              <span className="btn-secondary" onClick={() => setView('forgot-password')}>
                Forgot password?
              </span>
            </p>
            <br />
            <p className="switch-text">
              Don't have an account?{' '}
              <span className='btn-secondary' onClick={() => setView('register')}>
                Sign Up
              </span>
            </p>
          </>
        )}

        {view === 'register' && (
          <>
            <Register />
            <br />
            <p className="switch-text">
              Already have an account?{' '}
              <span className='btn-secondary' onClick={() => setView('login')}>
                Login
              </span>
            </p>
          </>
        )}

        {view === 'forgot-password' && (
          <>
            <ForgotPassword />
            <br />
            <p className="switch-text">
              {' '}
              <span className='btn-secondary' onClick={() => setView('login')}>
                Back to Login
              </span>
            </p>
          </>
        )}

        {view === 'reset-password' && (
          <>
            <ResetPassword />
          </>
        )}

        {/* 3. Nova view adicionada para renderizar o DeleteAccount mantendo o padrão */}
        {view === 'delete-account' && (
          <>
            <DeleteAccount />
          </>
        )}
      </div>

      {/* DIREITA */}
      <div className="landing-right">
        <img src={heroImage} alt="Lanuia preview" />
      </div>
    </div>
  );
};

export default Landing;