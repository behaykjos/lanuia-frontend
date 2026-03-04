import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Confirm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token) {
      // redireciona imediatamente sem mostrar a página
      navigate('/feed');
      return;
    }

    fetch(`http://localhost:3333/auth/confirm?token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          // atualizar localStorage se já estivermos logados
          const stored = localStorage.getItem('user');
          if (stored) {
            try {
              const u = JSON.parse(stored);
              u.isActive = true;
              localStorage.setItem('user', JSON.stringify(u));
            } catch {}
          }

          const tokenInStorage = localStorage.getItem('token');
          const redirectTo = tokenInStorage ? '/feed?activated=true' : '/login?activated=true';
          navigate(redirectTo);
        } else {
          // falhou, vamos pro feed também (poderíamos mostrar toast/error)
          navigate('/feed');
        }
      })
      .catch(() => {
        navigate('/feed');
      });
  }, [location, navigate]);

  // não renderiza nada; a página só existe para executar o efeito
  return null;
};

export default Confirm;