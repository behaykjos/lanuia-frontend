import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('http://localhost:3333/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setMessage('If an account exists for this email, you will receive a reset link shortly.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h1 className="lanuia">Reset Password</h1>
      <p style={{ maxWidth: '500px', margin: 'auto' }}>Enter your email address and we'll send you a link to reset your password.</p>
      <br></br>
      
      <form onSubmit={handleSubmit}>
        <label>Email Address</label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}

        <button type="submit" className="primary-btn">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;