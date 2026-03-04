import React, { useEffect, useState } from "react";
import { Home, BookOpen, Library, MessageCircle, PlusCircle, MoreHorizontal } from "lucide-react";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

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

  const initials = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  return (
    <aside className="w-64 h-screen bg-[#F6F2F4] border-r border-[#E8DCE2] flex flex-col px-6 py-8">
      
      {/* Logo */}
      <div className="mb-12">
        <h1 className="text-3xl font-serif text-[#7A2E47] tracking-wide lanuia">
          Lanuia
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <div
              key={index}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all
                ${
                  isActive
                    ? "bg-[#E8AFC2] text-white font-semibold shadow-sm"
                    : "text-[#5E5E5E] hover:bg-[#F1E6EB]"
                }`}
            >
              <Icon size={22} />
              <span className="text-[15px]">{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Perfil */}
      <div className="mt-auto flex items-center justify-between p-3 rounded-xl hover:bg-[#F1E6EB] cursor-pointer transition">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#E8AFC2] rounded-full flex items-center justify-center text-white font-semibold">
            {initials(user?.name || user?.nick || "UT")}
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-[#2F2F2F]">
              {user?.name || user?.nick || "Usuário teste"}
            </span>
            <span className="text-xs text-gray-500">
              @{user?.nick || "username"}
            </span>
          </div>
        </div>

        <MoreHorizontal size={18} className="text-gray-400" />
      </div>
    </aside>
  );
};

export default Sidebar;