import { useState } from 'react';
import { useNavigate } from 'react-router';
import '../css/Registro.css';

function RegistroOferente() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', primerApellido: '', correo: '', contrasenna: '',
    nacionalidad: '', telefono: '', ubicacion: '',
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
      const res = await fetch('/api/oferentes/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text || 'Error al registrar.');
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
            Tu cuenta como oferente está pendiente de aprobación por un administrador.
            Una vez aprobada podrás iniciar sesión y gestionar tu perfil.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  const fields = [
    { name: 'nombre',         label: 'Nombre',               type: 'text',     required: true },
    { name: 'primerApellido', label: 'Primer Apellido',       type: 'text',     required: true },
    { name: 'correo',         label: 'Correo electrónico',    type: 'email',    required: true },
    { name: 'contrasenna',    label: 'Contraseña',            type: 'password', required: true },
    { name: 'nacionalidad',   label: 'Nacionalidad',          type: 'text',     required: true },
    { name: 'telefono',       label: 'Teléfono',              type: 'text',     required: false },
    { name: 'ubicacion',      label: 'Ubicación',             type: 'text',     required: true },
  ];

  return (
    <div className="registro-container">
      <div className="registro-box">
        <h2>Registro de Oferente</h2>
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
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegistroOferente;
