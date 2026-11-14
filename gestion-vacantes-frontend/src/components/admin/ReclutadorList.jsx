import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { reclutadorService } from '../../services/api';

export default function ReclutadorList({ reclutadores, recargar }) {
  const navigate = useNavigate();

  const eliminar = (id) => {
    Swal.fire({
      title: '¿Eliminar reclutador?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await reclutadorService.eliminar(id);
          Swal.fire('Eliminado', 'El reclutador ha sido borrado.', 'success');
          recargar(); // Vuelve a pedir la lista al backend
        } catch (e) {
          Swal.fire('Error', 'No se pudo eliminar', 'error');
        }
      }
    });
  };

  return (
    <table className="table table-bordered table-hover shadow-sm">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {reclutadores.map(r => (
          <tr key={r.id}>
            <td>{r.id}</td>
            <td>{r.nombreCompleto}</td>
            <td>{r.email}</td>
            <td>
              <span className={`badge ${r.activo ? 'bg-success' : 'bg-danger'}`}>
                {r.activo ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td>
              <button className="btn btn-warning btn-sm me-2" onClick={() => navigate(`/admin/editar/${r.id}`)}>
                <i className="fas fa-edit"></i> Editar
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(r.id)}>
                <i className="fas fa-trash"></i> Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}