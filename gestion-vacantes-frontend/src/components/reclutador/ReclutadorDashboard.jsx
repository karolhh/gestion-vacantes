import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { vacanteService, postulacionService, authService } from '../../services/api';
import Sidebar from '../Sidebar';
import VacanteForm from './VacanteForm';
import VacanteList from './VacanteList';

export default function ReclutadorDashboard() {
  const [vacantes, setVacantes] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pestana, setPestana] = useState('vacantes');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busquedaTitulo, setBusquedaTitulo] = useState('');
  const [busquedaUbicacion, setBusquedaUbicacion] = useState('');
  const [cargando, setCargando] = useState(true);
  
  // Necesitamos el ID del reclutador para cuando cree una nueva vacante
  const [reclutadorId, setReclutadorId] = useState(null);

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        // 1. Obtener el ID del reclutador actual
        const idResponse = await authService.obtenerMiId();
        setReclutadorId(idResponse.data);

        // 2. Traer TODAS las vacantes del sistema
        const resVacantes = await vacanteService.listarTodas();
        setVacantes(resVacantes.data);

        // 3. Traer TODAS las postulaciones del sistema
        const resPostulaciones = await postulacionService.listarTodas();
        setPostulaciones(resPostulaciones.data);

      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        setCargando(false);
      }
    };
    cargarTodo();
  }, []);

  const recargar = async () => {
    setCargando(true);
    const resVacantes = await vacanteService.listarTodas();
    setVacantes(resVacantes.data);
    
    const resPostulaciones = await postulacionService.listarTodas();
    setPostulaciones(resPostulaciones.data);
    setCargando(false);
  };

  const cerrarVacante = (id) => {
    Swal.fire({
      title: '¿Cerrar vacante?', text: "No se recibirán más postulaciones.", icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, cerrar', confirmButtonColor: '#f59e0b'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await vacanteService.cerrar(id);
        Swal.fire('Cerrada', 'La vacante ya no recibe postulaciones.', 'success');
        recargar();
      }
    });
  };

  const eliminarVacante = (id) => {
    Swal.fire({
      title: '¿Eliminar vacante?', text: "Esta acción no se puede deshacer.", icon: 'error',
      showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#dc3545'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await vacanteService.eliminar(id);
          Swal.fire('Eliminada', '', 'success');
          recargar();
        } catch (e) {
          Swal.fire('Error', 'No se puede eliminar porque tiene postulaciones asociadas.', 'error');
        }
      }
    });
  };

  const cambiarEstadoPostulacion = (id, estadoActual) => {
    Swal.fire({
      title: 'Cambiar Estado', input: 'select',
      inputOptions: { 'RECIBIDA': 'Recibida', 'REVISADA': 'Revisada', 'PRESELECCIONADA': 'Preseleccionada', 'CONTRATADA': 'Contratada', 'RECHAZADA': 'Rechazada' },
      inputValue: estadoActual, showCancelButton: true, confirmButtonText: 'Actualizar'
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        await postulacionService.actualizarEstado(id, result.value);
        Swal.fire('Actualizado', 'El estado ha cambiado.', 'success');
        recargar();
      }
    });
  };

  const vacantesFiltradas = vacantes.filter(v => {
    const matchEstado = filtroEstado ? v.estado === filtroEstado : true;
    const matchTitulo = v.titulo.toLowerCase().includes(busquedaTitulo.toLowerCase());
    const matchUbicacion = v.ubicacion.toLowerCase().includes(busquedaUbicacion.toLowerCase());
    return matchEstado && matchTitulo && matchUbicacion;
  });

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <h5 className="text-muted">Cargando información global...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <Sidebar rol="RECLUTADOR" seccionActual={pestana} />
      <div className="flex-grow-1 p-4 p-md-5 w-100" style={{ marginLeft: '260px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Panel del Reclutador</h2>
            <p className="text-secondary mb-0">Gestiona las ofertas y revisa a todos los candidatos del sistema.</p>
          </div>
          {pestana === 'vacantes' && (
            <button className="btn btn-primary px-4 py-2 rounded-3 shadow-sm fw-medium" onClick={() => setMostrarForm(!mostrarForm)}>
              {mostrarForm ? <><i className="fas fa-times me-2"></i> Cancelar</> : <><i className="fas fa-plus me-2"></i> Publicar Vacante</>}
            </button>
          )}
        </div>

        <ul className="nav nav-tabs mb-4 border-bottom-0">
          <li className="nav-item">
            <button className={`nav-link fw-bold ${pestana === 'vacantes' ? 'active text-primary border-bottom border-primary border-3 bg-transparent' : 'text-muted bg-transparent'}`} onClick={() => setPestana('vacantes')}>
              <i className="fas fa-file-alt me-2"></i> Todas las Vacantes
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link fw-bold ${pestana === 'postulaciones' ? 'active text-primary border-bottom border-primary border-3 bg-transparent' : 'text-muted bg-transparent'}`} onClick={() => setPestana('postulaciones')}>
              <i className="fas fa-users me-2"></i> Todas las Postulaciones
            </button>
          </li>
        </ul>

        {mostrarForm && (
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <VacanteForm reclutadorId={reclutadorId} onVacanteCreada={() => { setMostrarForm(false); recargar(); }} onCancelar={() => setMostrarForm(false)} />
            </div>
          </div>
        )}

        {pestana === 'vacantes' ? (
          <>
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-3">
                <div className="row g-2">
                  <div className="col-md-3">
                    <select className="form-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                      <option value="">Todos los estados</option>
                      <option value="ABIERTA">Abiertas</option>
                      <option value="EN_PROCESO">En Proceso</option>
                      <option value="CERRADA">Cerradas</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <input type="text" className="form-control" placeholder="Buscar por título..." value={busquedaTitulo} onChange={e => setBusquedaTitulo(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <input type="text" className="form-control" placeholder="Buscar por ubicación..." value={busquedaUbicacion} onChange={e => setBusquedaUbicacion(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <VacanteList vacantes={vacantesFiltradas} onCerrar={cerrarVacante} onEliminar={eliminarVacante} />
          </>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-0">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light text-secondary">
                  <tr><th className="ps-4 py-3">Postulante</th><th className="py-3">Email</th><th className="py-3">Vacante</th><th className="py-3">Estado</th><th className="text-end pe-4 py-3">Acciones</th></tr>
                </thead>
                <tbody>
                  {postulaciones.map(p => (
                    <tr key={p.id}>
                      <td className="ps-4 fw-medium text-dark">{p.postulanteNombre}</td>
                      <td className="text-muted">{p.postulanteEmail}</td>
                      <td>{p.vacanteTitulo}</td>
                      <td><span className={`badge rounded-pill ${p.estado === 'RECIBIDA' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>{p.estado}</span></td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-light text-primary border" onClick={() => cambiarEstadoPostulacion(p.id, p.estado)}>
                          <i className="fas fa-edit"></i> Cambiar Estado
                        </button>
                      </td>
                    </tr>
                  ))}
                  {postulaciones.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-4">No hay postulaciones en el sistema.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}