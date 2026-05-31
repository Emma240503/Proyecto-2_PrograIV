import { useState, useEffect } from 'react';
import '../css/ArbolCaracteristicas.css';

function ArbolCaracteristicas({ baseUrl, onSelectionChange, mode = 'checkbox', headers = {} }) {
  const [raices, setRaices] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [hijos, setHijos] = useState({});
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(baseUrl, { headers })
      .then(r => r.json())
      .then(data => { setRaices(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [baseUrl]);

  async function toggleExpand(id) {
    const nowOpen = !expanded[id];
    setExpanded(prev => ({ ...prev, [id]: nowOpen }));
    if (nowOpen && !hijos[id]) {
      try {
        const res = await fetch(`${baseUrl}/${id}/hijos`, { headers });
        const data = await res.json();
        setHijos(prev => ({ ...prev, [id]: data }));
      } catch {}
    }
  }

  function updateSelected(newSelected) {
    setSelected(newSelected);
    onSelectionChange && onSelectionChange(newSelected);
  }

  function handleCheck(id, checked) {
    const copy = { ...selected };
    if (checked) {
      copy[id] = { checked: true, nivel: copy[id]?.nivel || 1 };
    } else {
      delete copy[id];
    }
    updateSelected(copy);
  }

  function handleNivel(id, nivel) {
    updateSelected({ ...selected, [id]: { checked: true, nivel: parseInt(nivel) || 1 } });
  }

  function renderNode(node) {
    const children = hijos[node.id] || [];
    const isExpanded = !!expanded[node.id];
    const sel = selected[node.id];

    return (
      <div key={node.id} className="tree-node">
        <div className="tree-row">
          <button type="button" className="tree-toggle" onClick={() => toggleExpand(node.id)}>
            {isExpanded ? '▾' : '▸'}
          </button>
          <input
            type="checkbox"
            id={`caract-${node.id}`}
            checked={!!sel?.checked}
            onChange={e => handleCheck(node.id, e.target.checked)}
          />
          <label htmlFor={`caract-${node.id}`} className="tree-label">
            {node.nombre}
          </label>
          {mode === 'level' && sel?.checked && (
            <input
              type="number"
              min="1"
              max="5"
              value={sel.nivel}
              onChange={e => handleNivel(node.id, e.target.value)}
              className="nivel-input"
              title="Nivel requerido (1-5)"
            />
          )}
        </div>
        {isExpanded && children.length > 0 && (
          <div className="tree-children">
            {children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Cargando...</p>;
  }

  if (raices.length === 0) {
    return <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Sin características disponibles.</p>;
  }

  return (
    <div className="arbol-container">
      {raices.map(r => renderNode(r))}
    </div>
  );
}

export default ArbolCaracteristicas;
