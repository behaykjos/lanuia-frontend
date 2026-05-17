import React from 'react'
import Register from '../auth/Register'
import heroImage from '../assets/intro.JPG'

const RegisterPage = () => {
  return (
    <div className="landing">
      <div className="landing-left">
        <div style={{ padding: '40px', maxWidth: '400px' }}>
          <Register />
        </div>
      </div>
      <div className="landing-right">
        <img src={heroImage} alt="Lanuia preview" />
      </div>
    </div>
  )
}

export default RegisterPage
