import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Root from './pages/Root';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Feed from './pages/Feed';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import ActivateAccount from './pages/ActivateAccount';
import Confirm from './pages/Confirm';
import ProtectedRoute from './components/ProtectedRoute';

function BodyClassManager() {
  const location = useLocation();

  useEffect(() => {
    const appRoutes = ['/feed', '/livros', '/estante', '/mensagens', '/perfil'];
    const isAppRoute = appRoutes.some(route => location.pathname.startsWith(route));

    if (isAppRoute) {
      document.body.classList.add('app-layout');
    } else {
      document.body.classList.remove('app-layout');
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <BodyClassManager />
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/feed" 
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          } 
        />
        <Route path="/confirm" element={<Confirm />} />

        
          {/* Novas Rotas de Autenticação */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/activate" element={<ActivateAccount />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;