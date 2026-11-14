import { useEffect, useState } from 'react';
import { vacanteService, postulacionService, authService } from '../../services/api';
import Sidebar from '../Sidebar';
import VacantesDisponibles from './VacantesDisponibles';
import MisPostulaciones from './MisPostulaciones';
import MiPerfil from './MiPerfil';

export default function PostulanteDashboard() {
  const [vacantes, setVacantes] = useState([]);
  const [misPostulaciones, setMisPostulaciones] = useState([]);
  const [pestanaActiva, setPestanaActiva] = useState('empleo');
  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [miId, setMiId] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Obtenemos el ID real del postulante que inició sesión
  useEffect(() => {
    const obtenerId = async () => {
      try {
        const idResponse = await authService.obtenerMiId();
        setMiId(idResponse.data);
        cargarDatos(idResponse.data);
      } catch (e) {
        console.error("Error obteniendo ID:", e);
      } finally {
        setCargando(false);
      }
    };
    obtenerId();
  }, []);

  const cargarDatos = async (id) => {
    try {
      const resVacantes = await vacanteService.listarPorEstado('ABIERTA');
      setVacantes(resVacantes.data);

      const resPostulaciones = await postulacionService.misPostulaciones(id);
      setMisPostulaciones(resPostulaciones.data);
    } catch (e) {
      console.error(e);
    }
  };

  const recargarDatos = () => {
    if (miId) cargarDatos(miId);
  };

  const vacantesFiltradas = vacantes.filter(v => 
    v.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) &&
    v.ubicacion.toLowerCase().includes(filtroUbicacion.toLowerCase())
  );

  if (cargando || !miId) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status"></div>
          <h5 className="text-muted">Cargando tu perfil...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <Sidebar rol="POSTULANTE" seccionActual="postulaciones" />
      
      <div className="flex-grow-1 p-4 p-md-5 w-100" style={{ marginLeft: '260px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Portal del Postulante</h2>
            <p className="text-secondary mb-0">Gestiona tu perfil y encuentra nuevas oportunidades.</p>
          </div>
        </div>

        <ul className="nav nav-tabs mb-4 border-bottom-0">
          <li className="nav-item">
            <button className={`nav-link fw-bold ${pestanaActiva === 'empleo' ? 'active text-success border-bottom border-success border-3 bg-transparent' : 'text-muted bg-transparent'}`} onClick={() => setPestanaActiva('empleo')}>
              <i className="fas fa-search me-2"></i> Buscar Empleo
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link fw-bold ${pestanaActiva === 'perfil' ? 'active text-success border-bottom border-success border-3 bg-transparent' : 'text-muted bg-transparent'}`} onClick={() => setPestanaActiva('perfil')}>
              <i className="fas fa-user-circle me-2"></i> Mi Perfil y Hoja de Vida
            </button>
          </li>
        </ul>

        {pestanaActiva === 'empleo' ? (
          <>
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-3">
                <div className="row g-2">
                  <div className="col-md-5">
                    <input type="text" className="form-control" placeholder="Cargo o título..." value={filtroTitulo} onChange={e => setFiltroTitulo(e.target.value)} />
                  </div>
                  <div className="col-md-5">
                    <input type="text" className="form-control" placeholder="Ubicación..." value={filtroUbicacion} onChange={e => setFiltroUbicacion(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <h5 className="fw-bold text-success mb-4"><i className="fas fa-bullhorn me-2"></i> Vacantes Disponibles</h5>
                    <VacantesDisponibles vacantes={vacantesFiltradas} postulanteId={miId} recargarPostulaciones={recargarDatos} />
                  </div>
                </div>
              </div>
              
              <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <h5 className="fw-bold text-success mb-4"><i className="fas fa-clipboard-check me-2"></i> Mis Postulaciones</h5>
                    <MisPostulaciones postulaciones={misPostulaciones} />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <MiPerfil recargarDatos={recargarDatos} />
        )}
      </div>
    </div>
  );
}