import { useNavigate, Link } from 'react-router-dom';

export default function Sidebar({ rol, seccionActual }) {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div 
      className="d-flex flex-column text-white p-3 shadow-lg vh-100" 
      style={{ 
        width: '260px', 
        position: 'fixed', 
        zIndex: 1000, 
        backgroundColor: '#1e293b', // Gris azulado oscuro corporativo
        borderRight: '1px solid #334155'
      }}
    >
      <div className="d-flex align-items-center mb-4 mt-2 px-2 border-bottom pb-3 border-secondary">
        <div className="bg-primary rounded p-2 me-3 shadow-sm">
          <i className="fas fa-briefcase text-white"></i>
        </div>
        <h5 className="mb-0 fw-bold">Gestión V.</h5>
      </div>
      
      <div className="p-3 rounded-3 mb-4 shadow-sm" style={{ backgroundColor: '#334155' }}>
        <div className="small text-truncate mb-2 text-light opacity-75">
          <i className="fas fa-envelope me-2"></i>{email}
        </div>
        <span className="badge bg-primary px-3 py-1 rounded-pill shadow-sm">{rol}</span>
      </div>

      <ul className="nav nav-pills flex-column mb-auto">
        {rol === 'ADMIN' && (
          <li className="nav-item mb-2">
            <Link to="/admin" className={`nav-link text-white d-flex align-items-center ${seccionActual === 'reclutadores' ? 'active shadow' : 'opacity-75'}`}>
              <i className="fas fa-users me-3"></i> Reclutadores
            </Link>
          </li>
        )}
        {rol === 'RECLUTADOR' && (
          <li className="nav-item mb-2">
            <Link to="/reclutador" className={`nav-link text-white d-flex align-items-center ${seccionActual === 'vacantes' ? 'active shadow' : 'opacity-75'}`}>
              <i className="fas fa-file-alt me-3"></i> Mis Vacantes
            </Link>
          </li>
        )}
        {rol === 'POSTULANTE' && (
          <li className="nav-item mb-2">
            <Link to="/postulante" className={`nav-link text-white d-flex align-items-center ${seccionActual === 'postulaciones' ? 'active shadow' : 'opacity-75'}`}>
              <i className="fas fa-search me-3"></i> Portal de Empleo
            </Link>
          </li>
        )}
      </ul>

      <hr className="text-secondary" />
      <button onClick={cerrarSesion} className="btn btn-outline-danger w-100 text-start border-0 rounded-3">
        <i className="fas fa-sign-out-alt me-3"></i> Cerrar Sesión
      </button>
    </div>
  );
}