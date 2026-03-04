import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('@Lanuia:token');
    
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const token = localStorage.getItem('token') || localStorage.getItem('@Lanuia:token');
  
  if (!token) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
