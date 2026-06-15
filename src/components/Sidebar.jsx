import React, { useEffect, useRef, useState } from "react";
import { Home, BookOpen, Library, MessageCircle, PlusCircle, Palette } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const createMenuRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("@Lanuia:user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const menuItems = [
    { icon: Home, label: "Página inicial", path: "/feed" },
    { icon: BookOpen, label: "Livros", path: "/books" },
    { icon: Library, label: "Estante", path: "/shelf" },
    { icon: MessageCircle, label: "Mensagens diretas", path: "/messages" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="sidebar-container">
      {/* Logo */}
      <div className="logo-section">
        <h1 className="lanuia">Lanuia</h1>
      </div>

      {/* Menu */}
      <nav className="menu-section">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="create-menu-wrapper" ref={createMenuRef}>
          <button
            type="button"
            className={`menu-item ${showCreateMenu ? 'active' : ''}`}
            onClick={() => setShowCreateMenu(v => !v)}
          >
            <PlusCircle size={22} />
            <span>Criar</span>
          </button>
          {showCreateMenu && (
            <div className="create-menu-dropdown">
              <button
                type="button"
                className="create-menu-option"
                onClick={() => {
                  setShowCreateMenu(false);
                  navigate('/createpost');
                }}
              >
                Post
              </button>
              <button
                type="button"
                className="create-menu-option"
                onClick={() => {
                  setShowCreateMenu(false);
                  navigate('/createreview');
                }}
              >
                Review
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Perfil */}
      <div className="profile-section" onClick={e => e.stopPropagation()}>
        <div className="profile-info">
          <div className="profile-avatar" style={{ flexShrink: 0 }}>
            {user?.name?.[0] || "U"}
          </div>
          <div className="profile-details">
            <span className="profile-name">{user?.name || "Utilizador"}</span>
            <span className="profile-handle">@{user?.nick || user?.username || "utilizador"}</span>
          </div>
        </div>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Trocar para tema ${theme === 'green' ? 'rosa' : 'verde'}`}
        >
          <Palette size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;