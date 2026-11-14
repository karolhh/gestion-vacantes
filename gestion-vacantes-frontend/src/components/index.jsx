import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div 
      className="vh-100 d-flex flex-column align-items-center justify-content-center text-center text-white p-4"
      style={{ 
        background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="bg-white bg-opacity-10 p-5 rounded-5 shadow-lg backdrop-blur" style={{ backdropFilter: 'blur(10px)', maxWidth: '800px' }}>
        <i className="fas fa-briefcase fa-4x mb-4 text-primary"></i>
        <h1 className="display-3 fw-bold mb-3">Gestión de Vacantes</h1>
        <p className="lead mb-5 text-light opacity-75">
          Conectamos el mejor talento con las mejores empresas. Únete a nuestra plataforma para encontrar tu próxima oportunidad laboral o gestionar tu equipo.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/login" className="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-pill shadow">
            Iniciar Sesión <i className="fas fa-arrow-right ms-2"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}