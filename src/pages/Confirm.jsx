import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';  // 1. mudou de { api } para import default

const Confirm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token) {
      navigate('/feed');
      return;
    }

    // 2. substituiu o fetch por api.get
    api.get(`/auth/confirm?token=${token}`)
      .then((res) => {
        if (res.status === 200) {
          const { user, token: jwtToken } = res.data;

          // 3. corrigiu as chaves do localStorage
          if (user) localStorage.setItem('@Lanuia:user', JSON.stringify(user));
          if (jwtToken) localStorage.setItem('@Lanuia:token', jwtToken);

          navigate('/feed?activated=true');
        } else {
          navigate('/feed');
        }
      })
      .catch(() => {
        navigate('/feed');
      });
  }, [location, navigate]);

  return null;
};

export default Confirm;