import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Root from './pages/Root';
import Landing from './pages/Landing';
import Login from './auth/Login';
import Register from './auth/Register';
import Feed from './pages/Feed';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import ActivateAccount from './pages/ActivateAccount';
import Confirm from './pages/Confirm';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
  );
}

export default App;