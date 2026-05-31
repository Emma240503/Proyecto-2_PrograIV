import { useState } from 'react';
import ArbolCaracteristicas from '../components/ArbolCaracteristicas.jsx';
import '../css/Buscar.css';
import '../css/Puestos.css';

function Buscar() {
  const [selection, setSelection] = useState({});
  const [resultados, setResultados] = useState([]);
  const [buscado, setBuscado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBuscar() {
    const ids = Object.keys(selection).filter(id => selection[id]?.checked);
    setLoading(true);
    try {
      const params = ids.map(id => `caracteristicaIds=${encodeURIComponent(id)}`).join('&');
      const url = `/api/puestos/buscar${params ? '?' + params : ''}`;
      const res = await fetch(url);
      if (!res.ok) { alert('Error al buscar puestos'); return; }
      setResultados(await res.json());
      setBuscado(true);
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="buscar-layout">
      <aside className="buscar-sidebar">
        <h2>Filtrar por características</h2>
        <ArbolCaracteristicas
          baseUrl="/api/puestos/caracteristicas"
          onSelectionChange={setSelection}
          mode="checkbox"
        />
        <button className="btn-primary buscar-btn" onClick={handleBuscar} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </aside>

      <main className="buscar-resultados">
        <h2>Resultados</h2>
        {!buscado
          ? <p className="empty-state">Selecciona una o más características y presiona Buscar.</p>
          : resultados.length === 0
            ? <p className="empty-state">No se encontraron puestos con esas características.</p>
            : <div className="cards-grid">
                {resultados.map(p => <PuestoCard puesto={p} key={p.id} />)}
              </div>
        }
      </main>
    </div>
  );
}

function PuestoCard({ puesto }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-empresa">{puesto.empresa?.nombre}</h3>
      </div>
      <div className="card-body">
        <p className="card-descripcion">{puesto.descripcion}</p>
        <div className="card-salario">
          <span className="label">Salario:</span>
          <span className="value">₡{puesto.salario}</span>
        </div>
      </div>
      <div className="card-footer">
        <div className="caracteristicas">
          {puesto.caracteristicas?.length > 0
            ? puesto.caracteristicas.map((c, i) => (
                <span key={i} className="tag">
                  {c.caracteristicaCaracteristica?.nombre} (niv. {c.nivel})
                </span>
              ))
            : <span className="sinCaract">Sin características</span>
          }
        </div>
      </div>
    </div>
  );
}

export default Buscar;
