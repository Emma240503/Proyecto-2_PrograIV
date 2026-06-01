import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import ArbolCaracteristicas from '../components/ArbolCaracteristicas.jsx';
import { getToken } from '../auth.js';
import '../css/Dashboard.css';

function DashboardEmpresa() {
  const navigate = useNavigate();
  const token = getToken();
  const [tab, setTab] = useState('lista');
  const [puestos, setPuestos] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [puestoSel, setPuestoSel] = useState(null);
  const [form, setForm] = useState({ descripcion: '', salario: '', tipo: 'publico' });
  const [selCaract, setSelCaract] = useState({});
  const [treeKey, setTreeKey] = useState(0);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  function ah() {
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchPuestos();
  }, []);

  async function fetchPuestos() {
    const res = await fetch('/api/empresa/puestos', { headers: ah() });
    if (res.ok) setPuestos(await res.json());
  }

  async function desactivar(id) {
    await fetch(`/api/empresa/puestos/${id}/desactivar`, { method: 'POST', headers: ah() });
    fetchPuestos();
  }

  async function verCandidatos(puesto) {
    setPuestoSel(puesto);
    setCandidatos([]);
    setTab('candidatos');
    const res = await fetch(`/api/empresa/puestos/${puesto.id}/candidatos`, { headers: ah() });
    if (res.ok) setCandidatos(await res.json());
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError(''); setMsg('');
    const caracteristicaIds = [];
    const niveles = [];
    Object.entries(selCaract).forEach(([id, val]) => {
      if (val.checked) {
        caracteristicaIds.push(parseInt(id));
        niveles.push(val.nivel || 1);
      }
    });
    const body = { ...form, salario: parseFloat(form.salario), caracteristicaIds, niveles };
    const res = await fetch('/api/empresa/puestos', {
      method: 'POST',
      headers: ah(),
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setForm({ descripcion: '', salario: '', tipo: 'publico' });
      setSelCaract({});
      setTreeKey(k => k + 1);
      setMsg('Puesto publicado exitosamente.');
      fetchPuestos();
      setTab('lista');
    } else {
      setError('Error al crear el puesto.');
    }
  }

  const tabs = [
    { key: 'lista',      label: 'Mis Puestos' },
    { key: 'nuevo',      label: 'Publicar Puesto' },
    ...(puestoSel ? [{ key: 'candidatos', label: 'Candidatos' }] : []),
  ];

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Panel de Empresa</h2>
      <div className="dashboard-tabs">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`dashboard-tab${tab === key ? ' active' : ''}`}
            onClick={() => { setTab(key); setError(''); setMsg(''); }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'lista' && (
        <div className="dashboard-section">
          <h3>Mis Puestos Publicados</h3>
          {msg && <p className="form-success">{msg}</p>}
          {puestos.length === 0
            ? <p className="empty-state">No has publicado puestos aún.</p>
            : <div className="item-list">
                {puestos.map(p => (
                  <div className="item-card" key={p.id}>
                    <div className="item-card-info">
                      <strong>{p.descripcion}</strong>
                      <span>
                        ₡{p.salario} ·{' '}
                        <span className={`puesto-type-badge puesto-type-${p.tipo}`}>{p.tipo}</span>
                      </span>
                    </div>
                    <div className="item-card-actions">
                      <button className="btn-secondary" onClick={() => verCandidatos(p)}>
                        Ver candidatos
                      </button>
                      <button className="btn-danger" onClick={() => desactivar(p.id)}>
                        Desactivar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {tab === 'nuevo' && (
        <div className="dashboard-section">
          <h3>Publicar Nuevo Puesto</h3>
          <form onSubmit={handleCrear}>
            <div className="form-group">
              <label>Descripción del puesto</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                rows="3"
                required
              />
            </div>
            <div className="form-group">
              <label>Salario (₡)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.salario}
                onChange={e => setForm(f => ({ ...f, salario: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Visibilidad</label>
              <select
                value={form.tipo}
                onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              >
                <option value="publico">Público</option>
                <option value="privado">Privado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Características requeridas (marque y asigne nivel 1-5)</label>
              <div className="tree-select-panel">
                <ArbolCaracteristicas
                  key={treeKey}
                  baseUrl="/api/puestos/caracteristicas"
                  onSelectionChange={setSelCaract}
                  mode="level"
                />
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary">Publicar Puesto</button>
          </form>
        </div>
      )}

      {tab === 'candidatos' && puestoSel && (
        <div className="dashboard-section">
          <h3>Candidatos — {puestoSel.descripcion}</h3>
          {candidatos.length === 0
            ? <p className="empty-state">No hay candidatos para este puesto.</p>
            : <div className="item-list">
                {candidatos.map((c, i) => (
                  <div className="candidato-item" key={c.oferente?.id ?? i}>
                    <span>{c.oferente.nombre} {c.oferente.primerApellido}</span>
                    <span className="candidato-match">
                      {c.porcentaje.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
          }
        </div>
      )}
    </div>
  );
}

export default DashboardEmpresa;
