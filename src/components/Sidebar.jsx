import React, { useEffect, useState } from "react";
import { Home, BookOpen, Library, MessageCircle, PlusCircle, MoreHorizontal, Palette } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const menuItems = [
    { icon: Home, label: "Página inicial", path: "/feed" },
    { icon: BookOpen, label: "Livros", path: "/books" },
    { icon: Library, label: "Estante", path: "/shelf" },
    { icon: MessageCircle, label: "Mensagens diretas", path: "/messages" },
    { icon: PlusCircle, label: "Criar", path: "/create" },
  ];

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
          const isActive = location.pathname === item.path;

          return (
            <div
              key={index}
              className={`menu-item ${isActive ? "active" : ""}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Perfil */}
      <div className="profile-section">
        <div className="profile-info">
          <div className="profile-avatar">
            {user?.name?.[0] || "U"}
          </div>
          <div className="profile-details">
            <span className="profile-name">{user?.name || "Utilizador teste"}</span>
            <span className="profile-handle">@{user?.username || "utilizadorteste6"}</span>
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
