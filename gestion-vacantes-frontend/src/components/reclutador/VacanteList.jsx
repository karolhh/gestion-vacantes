export default function VacanteList({ vacantes, onCerrar, onEliminar }) {
  if (vacantes.length === 0) {
    return <div className="text-center text-muted py-5">No se encontraron vacantes.</div>;
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="card-body p-0">
        <table className="table table-hover mb-0 align-middle">
          <thead className="bg-light text-secondary">
            <tr>
              <th className="ps-4 py-3">Puesto</th>
              <th className="py-3">Ubicación</th>
              <th className="py-3">Salario</th>
              <th className="py-3">Estado</th>
              <th className="text-end pe-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vacantes.map(v => (
              <tr key={v.id}>
                <td className="ps-4 fw-medium text-dark">{v.titulo}</td>
                <td className="text-muted"><i className="fas fa-map-marker-alt text-danger me-2"></i>{v.ubicacion}</td>
                <td className="text-success fw-medium">${v.salario ? Number(v.salario).toLocaleString() : 'A convenir'}</td>
                <td>
                  <span className={`badge rounded-pill px-3 py-2 ${v.estado === 'ABIERTA' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                    {v.estado}
                  </span>
                </td>
                <td className="text-end pe-4">
                  {v.estado !== 'CERRADA' && (
                    <button className="btn btn-sm btn-light text-warning border me-2" onClick={() => onCerrar(v.id)} title="Cerrar Vacante">
                      <i className="fas fa-lock"></i>
                    </button>
                  )}
                  <button className="btn btn-sm btn-light text-danger border" onClick={() => onEliminar(v.id)} title="Eliminar">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}