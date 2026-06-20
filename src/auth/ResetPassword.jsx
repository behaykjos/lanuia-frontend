import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import heroImage from '../assets/intro.JPG';
import api from '../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("@Lanuia:user"))
  const username = storedUser?.name || ""
  const token = searchParams.get('token');
  const doPasswordsMatch = password === confirmPassword;

  const validatePassword = (pwd) => ({
    minLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(pwd),
    notUsername: pwd.toLowerCase() !== username.toLowerCase()
  });

  const passwordRequirements = validatePassword(password);
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!isPasswordValid) {
      return setError('Password must meet all requirements');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      await api.post('/auth/reset-password', { token, password });

      setMessage('Password reset successfully! You can now log in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to reset password';
      setError(errorMessage);
    }
  };

  if (!token) {
    return (
      <div className="landing">
        <div className="landing-left">
          <div style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
            <h1>Invalid Request</h1>
            <p>No reset token provided. Please request a new link.</p>
            <button onClick={() => navigate('/forgot-password')} className="primary-btn">Go to Forgot Password</button>
          </div>
        </div>
        <div className="landing-right">
          <img src={heroImage} alt="Lanuia preview" />
        </div>
      </div>
    );
  }

  return (
    <div className="landing">
      {/* ESQUERDA */}
      <div className="landing-left">
        <div style={{ padding: '40px', maxWidth: '500px' }}>
          <h1 className="lanuia">Set New<br />Password</h1>
          <p>Please enter your new password below.</p>
          &nbsp;
          
          <form onSubmit={handleSubmit}>
            <div className="field"
              onFocus={() => setShowPasswordPolicy(true)}
              onBlur={() => setShowPasswordPolicy(false)}
            >
              <label className="field-label">New Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
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
              {showPasswordPolicy && (
                <div className="password-policy">
                  <p>Password Requirements:</p>
                  <ul>
                    <li style={{ color: passwordRequirements.minLength ? 'green' : 'red' }}>
                      At least 8 characters
                    </li>
                    <li style={{ color: passwordRequirements.hasUppercase && passwordRequirements.hasLowercase ? 'green' : 'red' }}>
                      Uppercase and lowercase letters
                    </li>
                    <li style={{ color: passwordRequirements.hasNumber && passwordRequirements.hasSpecialChar ? 'green' : 'red' }}>
                      Numbers and special characters
                    </li>
                    <li style={{ color: passwordRequirements.notUsername ? 'green' : 'red' }}>
                      Must not be your username
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="field">
              <label className="field-label">Confirm New Password</label>
              <div className="password-wrapper" style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ paddingRight: '30px' }}
                />
                {confirmPassword && (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '18px',
                      color: doPasswordsMatch ? 'green' : 'red',
                    }}
                  >
                    {doPasswordsMatch ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </div>

            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}

            <button type="submit" className="primary-btn" disabled={!isPasswordValid || !doPasswordsMatch}>
              Reset Password
            </button>
          </form>
        </div>
      </div>

      {/* DIREITA */}
      <div className="landing-right">
        <img src={heroImage} alt="Lanuia preview" />
      </div>
    </div>
  );
};

export default ResetPassword;