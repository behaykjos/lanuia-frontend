import React from 'react'
import Login from '../auth/Login'
import heroImage from '../assets/intro.JPG'

const LoginPage = () => {
  return (
    <div className="landing">
      <div className="landing-left">
        <div style={{ padding: '40px', maxWidth: '400px' }}>
          <Login />
        </div>
      </div>
      <div className="landing-right">
        <img src={heroImage} alt="Lanuia preview" />
      </div>
    </div>
  )
}

export default LoginPage
