import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChampagneGlasses } from '@fortawesome/free-solid-svg-icons';


const ActivateAccount = () => {
  const [status, setStatus] = useState('activating'); // 'activating', 'success', 'error'
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    const activate = async () => {
      if (!token) {
        setStatus('error');
        setError('No activation token provided.');
        return;
      }

      try {
        const res = await fetch(`http://localhost:3333/auth/activate?token=${token}`, {
          method: 'GET',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Activation failed');
        }

        setStatus('success');
        setTimeout(() => navigate('/login'), 5000);
      } catch (err) {
        setStatus('error');
        setError(err.message);
      }
    };

    activate();
  }, [token, navigate]);

  return (
    <div style={{ padding: '80px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {status === 'activating' && (
        <>
          <h1>Activating your account...</h1>
          <p>Please wait while we verify your email.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <h1 style={{ color: 'green' }}>Account Activated! <FontAwesomeIcon icon={faChampagneGlasses} /></h1>
          <p>Your email has been successfully verified. You will be redirected to login in a few seconds.</p>
          <button onClick={() => navigate('/login')} className="primary-btn">Go to Login Now</button>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 style={{ color: 'red' }}>Activation Failed</h1>
          <p>{error}</p>
          <p>The link may be expired or invalid. Please try registering again or contact support.</p>
          <button onClick={() => navigate('/')} className="primary-btn">Back to Home</button>
        </>
      )}
    </div>
  );
};

export default ActivateAccount;