import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Feed = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [activatedMessage, setActivatedMessage] = useState(false);

  // 🔹 Recarrega perfil do servidor e sincroniza estado/localStorage
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:3333/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const fresh = await res.json();
        setUser(fresh);
        localStorage.setItem("user", JSON.stringify(fresh));
      }
    } catch (err) {
      console.error("could not refresh user", err);
    }
  };

  // 🔹 Verifica se veio da ativação (query string) e recarrega usuário
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("activated") === "true") {
      setActivatedMessage(true);
      // tiramos o ?activated=true para que o refreshUser não seja chamado
      // repetidas vezes em renderizações futuras
      window.history.replaceState({}, document.title, "/feed");
      // garantir que o estado local reflete a ativação
      refreshUser();
    }
  }, [location]);

  // esconder a mensagem de sucesso automaticamente depois de alguns segundos
  useEffect(() => {
    if (activatedMessage) {
      const timer = setTimeout(() => setActivatedMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [activatedMessage]);

  // sempre que o componente monta, tentar sincronizar o perfil a partir do backend
  useEffect(() => {
    refreshUser();
  }, []);

  // 🔹 Verifica se existe user logado
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("@Lanuia:token");
    navigate("/");
  };

  // 🔹 Reenviar email de ativação
  const handleResendEmail = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3333/auth/resend-activation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      alert(data.message || "Activation email sent again.");

      // se a mensagem indicar que a conta já está ativa, atualizar localStorage
      if (data.message && data.message.toLowerCase().includes("activated")) {
        // o backend pode já ter ativado a conta, tentar buscar o usuário atualizado
        await refreshUser();
        // também limpar a mensagem de aviso (opcional)
        setActivatedMessage(true);
      }
    } catch (error) {
      console.error(error);
      alert("Error sending activation email.");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="layout">

      <Sidebar />

      <main className="feed">
        <div className="feed-tabs">
          <button className="active-tab">Publicações</button>
          <button>Reviews</button>
        </div>

        <div className="post-card">
          <div className="post-header">
            <div className="avatar">F</div>
            <div>
              <p className="post-name">{user.name}</p>
              <p className="post-username">@{user.username}</p>
            </div>
          </div>

          <p className="post-content">
            Aqui vai aparecer o conteúdo real da publicação.
          </p>

          <div className="post-actions">
            <span>💬 12</span>
            <span>♡ 44</span>
          </div>
        </div>
      </main>

      <aside className="right-column">
        <input
          className="search"
          placeholder="Pesquisar posts, utilizadores, #tags"
        />

        <div className="tags-box">
          <h3>Top #tags da semana</h3>

          <div className="tag-card">
            <p>#imagine</p>
            <span>123.4K posts</span>
          </div>

          <div className="tag-card">
            <p>#romantasy</p>
            <span>65.2K posts</span>
          </div>
        </div>
      </aside>

    </div>
  );
};

export default Feed;