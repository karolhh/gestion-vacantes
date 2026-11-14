export default function MisPostulaciones({ postulaciones }) {
  if (postulaciones.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="fas fa-inbox fa-3x text-muted mb-3 opacity-50"></i>
        <p className="text-muted small">Aún no te has postulado a ninguna vacante.</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {postulaciones.map(p => (
        <div key={p.id} className="border rounded-3 p-3 bg-light">
          <h6 className="fw-bold mb-1 text-dark">{p.vacanteTitulo}</h6>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted"><i className="far fa-calendar-alt me-1"></i> {new Date(p.fechaPostulacion).toLocaleDateString()}</small>
            <span className={`badge rounded-pill ${p.estado === 'RECIBIDA' ? 'bg-warning text-dark' : p.estado === 'CONTRATADA' ? 'bg-success' : 'bg-info text-dark'}`}>
              {p.estado}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}