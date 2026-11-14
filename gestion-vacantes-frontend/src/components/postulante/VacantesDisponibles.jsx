import Swal from 'sweetalert2';
import { postulacionService } from '../../services/api';

export default function VacantesDisponibles({ vacantes, postulanteId, recargarPostulaciones }) {

  const postularme = async (vacanteId) => {
    try {
      await postulacionService.postularse(vacanteId, postulanteId);
      Swal.fire('Éxito', 'Te has postulado correctamente', 'success');
      recargarPostulaciones();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.mensaje || 'No se pudo postular', 'error');
    }
  };

  const verDetalle = (v) => {
    Swal.fire({
      title: `<strong>${v.titulo}</strong>`,
      html: `
        <div class="text-start">
          <p><b>Ubicación:</b> ${v.ubicacion}</p>
          <p><b>Salario:</b> $${v.salario ? Number(v.salario).toLocaleString() : 'A convenir'}</p>
          <p><b>Descripción:</b> ${v.descripcion}</p>
          <p><b>Requisitos:</b> ${v.requisitos || 'No especificados'}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Postularme',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#4f46e5'
    }).then((result) => {
      if (result.isConfirmed) {
        postularme(v.id);
      }
    });
  };

  if (vacantes.length === 0) {
    return <div className="text-center text-muted py-5">No hay vacantes disponibles con esos filtros.</div>;
  }

  return (
    <div className="row g-4">
      {vacantes.map(v => (
        <div className="col-12 col-md-6" key={v.id}>
          <div className="card h-100 border border-light shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h5 className="card-title fw-bold text-dark mb-0">{v.titulo}</h5>
              </div>
              <div className="mb-3 text-muted small">
                <div className="mb-1"><i className="fas fa-map-marker-alt text-danger me-2"></i> {v.ubicacion}</div>
                <div><i className="fas fa-money-bill-wave text-success me-2"></i> ${v.salario ? Number(v.salario).toLocaleString() : 'A convenir'}</div>
              </div>
              <p className="card-text text-secondary small mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {v.descripcion}
              </p>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary w-50 rounded-pill fw-bold" onClick={() => verDetalle(v)}>
                  Ver Detalle
                </button>
                <button className="btn btn-primary w-50 rounded-pill fw-bold" onClick={() => postularme(v.id)}>
                  Postularme
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}