import React from 'react'
import Login from '../auth/Login'
import Register from '../auth/Register'
import AuthContainer from '../components/AuthContainer'

const AuthPage = ({ mode, onBack }) => {
  return (
    <AuthContainer>
      {mode === 'login' ? <Login /> : <Register />}
      <button onClick={onBack} style={{ marginTop: '16px' }}>
        ← Voltar
      </button>
    </AuthContainer>
  )
}

export default AuthPage
