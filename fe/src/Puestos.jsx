import './css/Puestos.css';
import { useEffect, useState } from 'react';

function Puestos() {
    const [puestos, setPuestos] = useState([]);

    useEffect(() => {
        if (puestos.length === 0)
            handleList();
    }, []);

    const backend = "/api";

    function handleList() {
        const request = new Request(backend + '/puestos/ultimos', { method: 'GET', headers: {} });
        (async () => {
            const response = await fetch(request);
            if (!response.ok) { alert("Error: " + response.status); return; }
            const data = await response.json();
            setPuestos(data);
        })();
    }

    return (
        <>
            <div className="puestos-header">
                <h1 className="puestos-title">Bolsa de Empleo</h1>
                <p className="puestos-subtitle">Últimos 5 puestos públicos</p>
            </div>
            <div className="puestos-container">
                <List list={puestos} />
            </div>
        </>
    );
}

function List({ list }) {
    return (
        <div id="listadoDiv">
            {list.length === 0
                ? <div className="empty-state">No hay puestos públicos registrados aún.</div>
                : <div className="cards-grid">{list.map(puesto => <Card puesto={puesto} key={puesto.id} />)}</div>
            }
        </div>
    );
}

export function Card({ puesto }) {
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-empresa">{puesto.empresa?.nombre}</h3>
                {puesto.tipo === 'privado' && <span className="card-tipo-badge">Privado</span>}
            </div>
            <div className="card-body">
                <p className="card-descripcion">{puesto.descripcion}</p>
                <div className="card-salario">
                    <span className="label">Salario:</span>
                    <span className="value">₡{puesto.salario}</span>
                </div>
            </div>
            <div className="card-tooltip">
                <p className="tooltip-title">Características requeridas</p>
                <div className="tooltip-tags">
                    {puesto.caracteristicas?.length > 0
                        ? puesto.caracteristicas.map((c, i) => (
                            <span key={i} className="tooltip-tag">
                                {c.caracteristicaCaracteristica?.nombre} · Niv. {c.nivel}
                            </span>
                        ))
                        : <span className="tooltip-sin-caract">Sin características definidas</span>
                    }
                </div>
            </div>
        </div>
    );
}

export default Puestos;
