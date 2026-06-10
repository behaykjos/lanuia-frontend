import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Root from './pages/Root';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Feed from './pages/Feed';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import ActivateAccount from './pages/ActivateAccount';
import Books from './pages/Books';
import Shelf from './pages/Shelf';
import Messages from './pages/DirectMessages';
import Profile from './pages/Profile';
import Confirm from './pages/Confirm';
import ProtectedRoute from './components/ProtectedRoute';
import CreatePost from './pages/CreatePost';
import CreateReview from './pages/CreateReview';
import AuthorPage from './pages/AuthorPage';
import BookPage from './pages/BookPage';

function BodyClassManager() {
  const location = useLocation();

  useEffect(() => {
    const appRoutes = ['/feed', '/books', '/shelf', '/messages', '/profile', '/createpost', '/createreview', '/authorpage', '/bookpage'];
    const isAppRoute = appRoutes.some(route => location.pathname.startsWith(route));

    if (isAppRoute) {
      document.body.classList.add('app-layout');
    } else {
      document.body.classList.remove('app-layout');
    }
  }, [location]);

  return null;
}

function PageWrapper() {
  return (
    <div className="page-transition">
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <BodyClassManager />
      <Routes>
        <Route element={<PageWrapper />}>
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
          <Route 
            path="/books" 
            element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/authorpage" 
            element={
              <ProtectedRoute>
                <AuthorPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookpage" 
            element={
              <ProtectedRoute>
                <BookPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shelf" 
            element={
              <ProtectedRoute>
                <Shelf />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/createpost" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/createreview" 
            element={
              <ProtectedRoute>
                <CreateReview />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/confirm" element={<Confirm />} />

          {/* Novas Rotas de Autenticação */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/activate" element={<ActivateAccount />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;