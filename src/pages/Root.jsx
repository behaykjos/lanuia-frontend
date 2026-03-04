import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from '../pages/Landing';

const Root = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('@Lanuia:token');
    
    if (token) {
      // O utilizador tem token salvo, redireciona para /feed
      navigate('/feed', { replace: true });
    } else {
      // Sem token, mostra a Landing page
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <Landing />;
};

export default Root;
