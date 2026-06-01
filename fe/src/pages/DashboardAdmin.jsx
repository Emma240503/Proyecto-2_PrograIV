import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getToken } from '../auth.js';
import '../css/Dashboard.css';

function DashboardAdmin() {
  const navigate = useNavigate();
  const token = getToken();
  const [tab, setTab] = useState('empresas');
  const [empresas, setEmpresas] = useState([]);
  const [oferentes, setOferentes] = useState([]);
  const [raices, setRaices] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [hijos, setHijos] = useState({});
  const [addingUnder, setAddingUnder] = useState(undefined);
  const [addingRoot, setAddingRoot] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  function ah() {
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchEmpresas();
    fetchOferentes();
    fetchRaices();
  }, []);

  async function fetchEmpresas() {
    const res = await fetch('/api/admin/empresas/pendientes', { headers: ah() });
    if (res.ok) setEmpresas(await res.json());
  }

  async function fetchOferentes() {
    const res = await fetch('/api/admin/oferentes/pendientes', { headers: ah() });
    if (res.ok) setOferentes(await res.json());
  }

  async function fetchRaices() {
    const res = await fetch('/api/admin/caracteristicas', { headers: ah() });
    if (res.ok) setRaices(await res.json());
  }

  async function aprobarEmpresa(id) {
    await fetch(`/api/admin/empresas/${id}/aprobar`, { method: 'POST', headers: ah() });
    setMsg('Empresa aprobada.');
    fetchEmpresas();
  }

  async function aprobarOferente(id) {
    await fetch(`/api/admin/oferentes/${id}/aprobar`, { method: 'POST', headers: ah() });
    setMsg('Oferente aprobado.');
    fetchOferentes();
  }

  async function toggleExpand(id) {
    const nowOpen = !expanded[id];
    setExpanded(prev => ({ ...prev, [id]: nowOpen }));
    if (nowOpen && !hijos[id]) {
      const res = await fetch(`/api/admin/caracteristicas/${id}/hijos`, { headers: ah() });
      if (res.ok) {
        const data = await res.json();
        setHijos(prev => ({ ...prev, [id]: data }));
      }
    }
  }

  async function agregarCaracteristica(padreId) {
    if (!newNombre.trim()) return;
    setError('');
    const body = { nombre: newNombre.trim(), padreId: padreId ?? null };
    const res = await fetch('/api/admin/caracteristicas', {
      method: 'POST',
      headers: ah(),
      body: JSON.stringify(body),
    });
    if (!res.ok) { setError('Error al agregar característica.'); return; }
    setNewNombre('');
    setAddingUnder(undefined);
    setAddingRoot(false);
    setMsg('Característica agregada.');
    if (padreId != null) {
      const r2 = await fetch(`/api/admin/caracteristicas/${padreId}/hijos`, { headers: ah() });
      if (r2.ok) {
        const data = await r2.json();
        setHijos(prev => ({ ...prev, [padreId]: data }));
      }
    } else {
      fetchRaices();
    }
  }

  function cancelAdd() {
    setAddingUnder(undefined);
    setAddingRoot(false);
    setNewNombre('');
  }

  function renderNode(node) {
    const isExpanded = !!expanded[node.caracteristicaId];
    const children = hijos[node.caracteristicaId] || [];
    const isAdding = addingUnder === node.caracteristicaId;

    return (
      <div key={node.caracteristicaId} className="admin-tree-node">
        <div className="admin-tree-row">
          <button type="button" className="admin-tree-toggle" onClick={() => toggleExpand(node.caracteristicaId)}>
            {isExpanded ? '▾' : '▸'}
          </button>
          <span className="admin-tree-label">{node.nombre}</span>
          <button
            type="button"
            className="admin-tree-add"
            title="Agregar característica hija"
            onClick={() => { setAddingUnder(node.caracteristicaId); setAddingRoot(false); setNewNombre(''); }}
          >
            +
          </button>
        </div>
        {isAdding && (
          <div className="add-caract-form" style={{ marginLeft: '30px' }}>
            <input
              value={newNombre}
              onChange={e => setNewNombre(e.target.value)}
              placeholder={`Sub-característica de "${node.nombre}"`}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && agregarCaracteristica(node.caracteristicaId)}
            />
            <button className="confirm" onClick={() => agregarCaracteristica(node.caracteristicaId)}>✓</button>
            <button className="cancel" onClick={cancelAdd}>✕</button>
          </div>
        )}
        {isExpanded && (
          <div className="admin-tree-children">
            {children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Panel de Administración</h2>
      <div className="dashboard-tabs">
        {[
          { key: 'empresas',        label: 'Empresas pendientes' },
          { key: 'oferentes',       label: 'Oferentes pendientes' },
          { key: 'caracteristicas', label: 'Características' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`dashboard-tab${tab === key ? ' active' : ''}`}
            onClick={() => { setTab(key); setMsg(''); setError(''); }}
          >
            {label}
          </button>
        ))}
      </div>

      {msg && <p className="form-success" style={{ marginBottom: '16px' }}>{msg}</p>}
      {error && <p className="form-error" style={{ marginBottom: '16px' }}>{error}</p>}

      {tab === 'empresas' && (
        <div className="dashboard-section">
          <h3>Empresas Pendientes de Aprobación</h3>
          {empresas.length === 0
            ? <p className="empty-state">No hay empresas pendientes de aprobación.</p>
            : <div className="item-list">
                {empresas.map(e => (
                  <div className="item-card" key={e.id}>
                    <div className="item-card-info">
                      <strong>{e.nombre}</strong>
                      <span>{e.correo}{e.ubicacion ? ` · ${e.ubicacion}` : ''}</span>
                    </div>
                    <button className="btn-success" onClick={() => aprobarEmpresa(e.id)}>
                      Aprobar
                    </button>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {tab === 'oferentes' && (
        <div className="dashboard-section">
          <h3>Oferentes Pendientes de Aprobación</h3>
          {oferentes.length === 0
            ? <p className="empty-state">No hay oferentes pendientes de aprobación.</p>
            : <div className="item-list">
                {oferentes.map(o => (
                  <div className="item-card" key={o.id}>
                    <div className="item-card-info">
                      <strong>{o.nombre} {o.primerApellido}</strong>
                      <span>{o.correo}{o.nacionalidad ? ` · ${o.nacionalidad}` : ''}</span>
                    </div>
                    <button className="btn-success" onClick={() => aprobarOferente(o.id)}>
                      Aprobar
                    </button>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {tab === 'caracteristicas' && (
        <div className="dashboard-section">
          <h3>Árbol de Características</h3>
          <div style={{ marginBottom: '12px' }}>
            <button
              className="btn-secondary"
              onClick={() => { setAddingRoot(true); setAddingUnder(undefined); setNewNombre(''); }}
            >
              + Agregar categoría raíz
            </button>
          </div>
          {addingRoot && (
            <div className="add-caract-form" style={{ marginBottom: '12px' }}>
              <input
                value={newNombre}
                onChange={e => setNewNombre(e.target.value)}
                placeholder="Nombre de la nueva categoría raíz"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && agregarCaracteristica(null)}
              />
              <button className="confirm" onClick={() => agregarCaracteristica(null)}>✓</button>
              <button className="cancel" onClick={cancelAdd}>✕</button>
            </div>
          )}
          {raices.length === 0
            ? <p className="empty-state">No hay características registradas.</p>
            : raices.map(r => renderNode(r))
          }
        </div>
      )}
    </div>
  );
}

export default DashboardAdmin;
