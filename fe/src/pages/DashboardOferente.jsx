import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import ArbolCaracteristicas from '../components/ArbolCaracteristicas.jsx';
import { getToken, getId } from '../auth.js';
import '../css/Dashboard.css';

function DashboardOferente() {
  const navigate = useNavigate();
  const token = getToken();
  const id = getId();
  const [tab, setTab] = useState('perfil');
  const [perfil, setPerfil] = useState(null);
  const [habilidades, setHabilidades] = useState([]);
  const [selCaract, setSelCaract] = useState({});
  const [treeKey, setTreeKey] = useState(0);
  const [cvFile, setCvFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  function ah() {
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchPerfil();
    fetchHabilidades();
  }, []);

  async function fetchPerfil() {
    const res = await fetch('/api/oferente/perfil', { headers: ah() });
    if (res.ok) setPerfil(await res.json());
  }

  async function fetchHabilidades() {
    const res = await fetch('/api/oferente/habilidades', { headers: ah() });
    if (res.ok) setHabilidades(await res.json());
  }

  async function agregarHabilidad() {
    setMsg(''); setError('');
    const entries = Object.entries(selCaract).filter(([, v]) => v.checked);
    if (entries.length === 0) { setError('Selecciona al menos una característica.'); return; }
    for (const [caracteristicaId, val] of entries) {
      const res = await fetch('/api/oferente/habilidades', {
        method: 'POST',
        headers: ah(),
        body: JSON.stringify({ caracteristicaId: parseInt(caracteristicaId), nivel: val.nivel || 1 }),
      });
      if (!res.ok) { setError('Error al agregar habilidad.'); return; }
    }
    setSelCaract({});
    setTreeKey(k => k + 1);
    setMsg('Habilidad(es) agregada(s) correctamente.');
    fetchHabilidades();
  }

  async function eliminarHabilidad(habilidadId) {
    setMsg(''); setError('');
    const res = await fetch(`/api/oferente/habilidades/${habilidadId}`, {
      method: 'DELETE',
      headers: ah(),
    });
    if (res.ok) fetchHabilidades();
    else setError('Error al eliminar la habilidad.');
  }

  async function subirCV() {
    if (!cvFile) { setError('Selecciona un archivo PDF primero.'); return; }
    setMsg(''); setError('');
    const formData = new FormData();
    formData.append('file', cvFile);
    const res = await fetch('/api/oferente/curriculum', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) {
      setMsg('CV subido exitosamente.');
      setCvFile(null);
    } else {
      setError('Error al subir el CV.');
    }
  }

  async function verCV() {
    setMsg(''); setError('');
    const res = await fetch(`/api/oferente/curriculum/${id}`, { headers: ah() });
    if (!res.ok) { setError('No se encontró un CV registrado.'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  const tabList = [
    { key: 'perfil',      label: 'Mi Perfil' },
    { key: 'habilidades', label: 'Habilidades' },
    { key: 'curriculum',  label: 'Currículum' },
  ];

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Panel de Oferente</h2>
      <div className="dashboard-tabs">
        {tabList.map(({ key, label }) => (
          <button
            key={key}
            className={`dashboard-tab${tab === key ? ' active' : ''}`}
            onClick={() => { setTab(key); setMsg(''); setError(''); }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'perfil' && (
        <div className="dashboard-section">
          <h3>Información Personal</h3>
          {perfil
            ? <div className="perfil-grid">
                {[
                  ['Nombre completo', `${perfil.nombre ?? ''} ${perfil.primerApellido ?? ''}`.trim()],
                  ['Correo',          perfil.correo],
                  ['Nacionalidad',    perfil.nacionalidad],
                  ['Teléfono',        perfil.telefono],
                  ['Ubicación',       perfil.ubicacion],
                  ['Estado',          perfil.estado],
                ].map(([label, value]) => (
                  <div className="perfil-item" key={label}>
                    <label>{label}</label>
                    <span>{value || '—'}</span>
                  </div>
                ))}
              </div>
            : <p className="empty-state">Cargando perfil...</p>
          }
        </div>
      )}

      {tab === 'habilidades' && (
        <div className="dashboard-section">
          <h3>Mis Habilidades</h3>
          {msg && <p className="form-success">{msg}</p>}
          {error && <p className="form-error">{error}</p>}
          <div className="item-list" style={{ marginBottom: '24px' }}>
            {habilidades.length === 0
              ? <p className="empty-state">No tienes habilidades registradas.</p>
              : habilidades.map(h => (
                  <div className="habilidad-item" key={h.id}>
                    <span className="habilidad-info">
                      {h.caracteristicaCaracteristica?.nombre || h.caracteristica?.nombre || 'Habilidad'}
                      <span className="nivel-badge">Nivel {h.nivel}</span>
                    </span>
                    <button className="btn-danger" onClick={() => eliminarHabilidad(h.id)}>
                      Eliminar
                    </button>
                  </div>
                ))
            }
          </div>
          <h3>Agregar Habilidad</h3>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px', marginTop: 0 }}>
            Selecciona una característica, asigna un nivel (1-5) y presiona Agregar.
          </p>
          <div className="tree-select-panel" style={{ marginBottom: '12px' }}>
            <ArbolCaracteristicas
              key={treeKey}
              baseUrl="/api/puestos/caracteristicas"
              onSelectionChange={setSelCaract}
              mode="level"
            />
          </div>
          <button
            className="btn-primary"
            style={{ width: 'auto' }}
            onClick={agregarHabilidad}
          >
            Agregar Habilidad
          </button>
        </div>
      )}

      {tab === 'curriculum' && (
        <div className="dashboard-section">
          <h3>Currículum Vitae (PDF)</h3>
          {msg && <p className="form-success">{msg}</p>}
          {error && <p className="form-error">{error}</p>}
          <div className="cv-section">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={e => setCvFile(e.target.files[0] || null)}
            />
            <button
              className="btn-primary"
              style={{ width: 'auto', marginTop: 0 }}
              onClick={subirCV}
              disabled={!cvFile}
            >
              Subir CV
            </button>
          </div>
          <div style={{ marginTop: '16px' }}>
            <button className="btn-secondary" onClick={verCV}>
              Ver / Descargar CV actual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardOferente;
