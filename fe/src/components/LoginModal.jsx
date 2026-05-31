import { useState } from 'react';
import { useNavigate } from 'react-router';
import '../css/LoginModal.css';

function LoginModal({ onClose, onLogin }) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, clave }),
      });
      if (!res.ok) {
        setError('Credenciales incorrectas. Verifique su usuario y clave.');
        return;
      }
      const data = await res.json();
      onLogin(data);
      if (data.rol === 'EMPRESA') navigate('/dashboard/empresa');
      else if (data.rol === 'OFERENTE') navigate('/dashboard/oferente');
      else if (data.rol === 'ADMIN') navigate('/dashboard/admin');
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder="Correo o ID (administrador)"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Clave</label>
            <input
              type="password"
              value={clave}
              onChange={e => setClave(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
