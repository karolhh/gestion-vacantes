import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { reclutadorService } from '../../services/api';
import Sidebar from '../Sidebar';

export default function AdminDashboard() {
  const [reclutadores, setReclutadores] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  useEffect(() => { cargarReclutadores(); }, []);

  const cargarReclutadores = async () => {
    try {
      const res = await reclutadorService.listar();
      setReclutadores(res.data);
    } catch (e) {
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    }
  };

  const eliminar = (id) => {
    Swal.fire({
      title: '¿Eliminar reclutador?',
      text: "Si tiene vacantes asociadas, no se podrá borrar.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await reclutadorService.eliminar(id);
          Swal.fire('Eliminado', 'El reclutador ha sido borrado.', 'success');
          cargarReclutadores();
        } catch (e) {
          Swal.fire('Error', 'Este reclutador tiene vacantes asignadas y no se puede eliminar.', 'error');
        }
      }
    });
  };

  const reclutadoresFiltrados = reclutadores.filter(r => {
    const matchEstado = filtro === 'todos' ? true : (filtro === 'activos' ? r.activo : !r.activo);
    const matchBusqueda = r.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) || r.email.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  return (
    <div className="d-flex" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <Sidebar rol="ADMIN" seccionActual="reclutadores" />
      
      <div className="flex-grow-1 p-4 p-md-5 w-100" style={{ marginLeft: '260px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Gestión de Reclutadores</h2>
            <p className="text-secondary mb-0">Administra el personal de selección de la empresa.</p>
          </div>
          <button className="btn btn-primary px-4 py-2 rounded-3 shadow-sm fw-medium" onClick={() => navigate('/admin/crear')}>
            <i className="fas fa-plus me-2"></i> Nuevo Reclutador
          </button>
        </div>

        {/* Filtros del Admin */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3">
            <div className="row g-2">
              <div className="col-md-4">
                <select className="form-select" value={filtro} onChange={e => setFiltro(e.target.value)}>
                  <option value="todos">Todos los reclutadores</option>
                  <option value="activos">Solo activos</option>
                  <option value="inactivos">Solo inactivos</option>
                </select>
              </div>
              <div className="col-md-6">
                <input type="text" className="form-control" placeholder="Buscar por nombre o email..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <div className="col-md-2">
                <button className="btn btn-outline-secondary w-100" onClick={cargarReclutadores}><i className="fas fa-sync-alt me-1"></i> Refrescar</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light text-secondary">
                <tr>
                  <th className="ps-4 py-3">ID</th>
                  <th className="py-3">Nombre</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Estado</th>
                  <th className="text-end pe-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reclutadoresFiltrados.map(r => (
                  <tr key={r.id}>
                    <td className="ps-4 text-muted fw-medium">#{r.id}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                          {r.nombreCompleto.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-medium text-dark">{r.nombreCompleto}</span>
                      </div>
                    </td>
                    <td className="text-muted">{r.email}</td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${r.activo ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                        {r.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-light text-primary border me-2" onClick={() => navigate(`/admin/editar/${r.id}`)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="btn btn-sm btn-light text-danger border" onClick={() => eliminar(r.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {reclutadoresFiltrados.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted py-4">No se encontraron resultados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}