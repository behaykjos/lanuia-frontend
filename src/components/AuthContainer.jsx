import React from 'react'

const AuthContainer = ({ children }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {children}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f6'
  },
  card: {
    width: '400px',
    padding: '32px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }
}

export default AuthContainer