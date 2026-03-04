import React from 'react';

const Navbar = ({ onLogin, onRegister }) => {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>Lanuia</div>

      <div style={styles.actions}>
        <button style={styles.loginBtn} onClick={onLogin}>
          Login
        </button>
        <button style={styles.registerBtn} onClick={onRegister}>
          Register
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    borderBottom: '1px solid #eee',
    zIndex: 1000,
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  loginBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
  },
  registerBtn: {
    background: '#000',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default Navbar;
