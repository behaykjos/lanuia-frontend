import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import heroImage from '../assets/intro.JPG'; // Importado para manter o padrão da direita
import api from '../services/api';

const DeleteAccount = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
 
  const handleDelete = async (e) => {
    if (e) e.preventDefault(); // Previne o comportamento padrão do form
    if (!password) return setError('Insere a tua palavra-passe.');
    
    setLoading(true);
    setError(null);
    try {
      await api.post('/users/me/delete-confirm', { token, password });
      setDone(true);
      localStorage.removeItem('@Lanuia:token');
      localStorage.removeItem('@Lanuia:user');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao eliminar conta.');
    } finally {
      setLoading(false);
    }
  };
 
  // Estado 1: Link inválido (Garante o mesmo layout de duas colunas)
  if (!token) {
    return (
      <div className="landing">
        <div className="landing-left">
          <div style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: 'auto' }}>
            <h1>Pedido Inválido</h1>
            <p style={{ color: '#c0392b', fontWeight: 600 }}>O token de confirmação está em falta ou é inválido.</p>
            <button onClick={() => navigate('/')} className="primary-btn">Voltar ao início</button>
          </div>
        </div>
        <div className="landing-right">
          <img src={heroImage} alt="Lanuia preview" />
        </div>
      </div>
    );
  }
 
  // Estado 2: Sucesso (Garante o mesmo layout de duas colunas)
  if (done) {
    return (
      <div className="landing">
        <div className="landing-left">
          <div style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: 'auto' }}>
            <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 10, color: '#3d1f2b' }}>Conta eliminada</h2>
            <p style={{ color: '#888', fontSize: 14 }}>A tua conta foi permanentemente eliminada. Serás redirecionado em breve.</p>
          </div>
        </div>
        <div className="landing-right">
          <img src={heroImage} alt="Lanuia preview" />
        </div>
      </div>
    );
  }

  // Estado 3: Formulário de Confirmação Principal
  return (
    <div className="landing">
      {/* ESQUERDA */}
      <div className="landing-left">
        <div style={{ padding: '40px', maxWidth: '500px', margin: 'auto', width: '100%' }}>
          <h1 className="lanuia">Delete<br />Account</h1>
          <p style={{ color: '#555', marginBottom: '20px' }}>
            Esta ação é <strong style={{ color: '#c0392b' }}>permanente e irreversível</strong>. Todos os teus dados, publicações, reviews e estantes serão eliminados de forma definitiva.
          </p>
          
          <form onSubmit={handleDelete}>
            <div className="field">
              <label className="field-label">Confirma a tua palavra-passe</label>
              <div className="password-wrapper" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Palavra-passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '45px' }} // Espaço para o ícone não sobrepor o texto
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#bbb'
                  }}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            
            {error && (
              <p className="error-text" style={{ color: 'red', marginTop: '10px' }}>{error}</p>
            )}
            
            <button 
              type="submit" 
              className="primary-btn" 
              disabled={loading || !password}
              style={{ 
                background: loading || !password ? '#e6b3ae' : '#c0392b', 
                marginTop: '20px',
                cursor: loading || !password ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Eliminar conta permanentemente'}
            </button>

            <p className="switch-text" style={{ marginTop: '20px', textAlign: 'center' }}>
              Mudaste de ideias?{' '}
              <span className='btn-secondary' onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                Voltar atrás
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* DIREITA */}
      <div className="landing-right">
        <img src={heroImage} alt="Lanuia preview" />
      </div>
    </div>
  );
};

export default DeleteAccount;