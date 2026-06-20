import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Inicializa com o tema guardado no localStorage ou 'green' por padrão
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('@Lanuia:theme') || 'green';
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === 'green') return 'pink';
      if (prevTheme === 'pink') return 'dark';
      return 'green'; // Se for 'dark', volta para o verde
    });
  };

  // 🔴 ESTA É A PARTE CRUCIAL QUE ATIVA O CSS DO THEME-DARK
  useEffect(() => {
    // Guarda a preferência do utilizador
    localStorage.setItem('@Lanuia:theme', theme);

    // Remove as classes antigas para evitar conflitos
    document.body.classList.remove('theme-pink', 'theme-dark');
    
    // Remove o atributo antigo do HTML
    document.documentElement.removeAttribute('data-theme');

    // Injeta o tema atual no DOM para o CSS conseguir ler
    if (theme === 'pink') {
      document.body.classList.add('theme-pink');
      document.documentElement.setAttribute('data-theme', 'pink');
    } else if (theme === 'dark') {
      document.body.classList.add('theme-dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);