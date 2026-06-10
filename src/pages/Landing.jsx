import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Login from '../auth/Login';
import Register from '../auth/Register';
import ForgotPassword from '../auth/ForgotPassword';
import ResetPassword from '../auth/ResetPassword';
import heroImage from '../assets/intro.JPG' 

const Landing = () => {
  const [view, setView] = useState('welcome');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch('http://localhost:3333/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Google login failed');
      }

      // save token and user info so other parts of the app can use them
      localStorage.setItem('@Lanuia:token', data.token);
      localStorage.setItem('@Lanuia:user', JSON.stringify(data.user));
      // use react-router navigate instead of a full page reload
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
            <h1 className="lanuia">Where stories flow and minds glow.</h1>
            <br></br>
            <p>Find your people and dive into new literary worlds together. Explore our reviews, spil your theories and create a new <i>fandomverse</i>.</p>
            <br></br><br></br>

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

            <br></br>
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
            <br></br>
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
            <br></br>
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
            <br></br>
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
      </div>

      {/* DIREITA */}
      <div className="landing-right">
        <img src={heroImage} alt="Lanuia preview" />
      </div>
    </div>
  );
};

export default Landing;