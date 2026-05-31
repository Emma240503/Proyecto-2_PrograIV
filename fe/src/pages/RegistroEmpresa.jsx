import { useState } from 'react';
import { useNavigate } from 'react-router';
import '../css/Registro.css';

function RegistroEmpresa() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', correo: '', contrasenna: '', ubicacion: '', telefono: '', descripcion: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/empresas/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text || 'Error al registrar la empresa.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="registro-container">
        <div className="registro-box">
          <h2>Registro exitoso</h2>
          <p>
            Tu solicitud de empresa ha sido enviada y está pendiente de aprobación por un
            administrador. Te notificaremos cuando tu cuenta esté activa.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  const fields = [
    { name: 'nombre',      label: 'Nombre de la empresa',  type: 'text',     required: true },
    { name: 'correo',      label: 'Correo electrónico',     type: 'email',    required: true },
    { name: 'contrasenna', label: 'Contraseña',             type: 'password', required: true },
    { name: 'ubicacion',   label: 'Ubicación',              type: 'text',     required: true },
    { name: 'telefono',    label: 'Teléfono',               type: 'text',     required: false },
  ];

  return (
    <div className="registro-container">
      <div className="registro-box">
        <h2>Registro de Empresa</h2>
        <form onSubmit={handleSubmit}>
          {fields.map(({ name, label, type, required }) => (
            <div className="form-group" key={name}>
              <label>{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required={required}
              />
            </div>
          ))}
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows="3"
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegistroEmpresa;
