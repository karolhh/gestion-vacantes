import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { authService } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('rol', response.data.rol);

      Swal.fire({ icon: 'success', title: 'Bienvenido', timer: 1500, showConfirmButton: false });

      setTimeout(() => {
        if (response.data.rol === 'ADMIN') window.location.href = '/admin';
        else if (response.data.rol === 'RECLUTADOR') window.location.href = '/reclutador';
        else if (response.data.rol === 'POSTULANTE') window.location.href = '/postulante';
      }, 1600);
      
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.mensaje || 'Credenciales inválidas' });
    }
  };

  return (
    <div 
      className="vh-100 d-flex align-items-center justify-content-center p-4"
      style={{ 
        // Mismo gradiente oscuro del Index
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
      }}
    >
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff' }}>
        <div className="card-body p-5">
          
          <div className="text-center mb-4">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '65px', height: '65px' }}>
              <i className="fas fa-briefcase fa-xl"></i>
            </div>
            <h3 className="fw-bold text-dark mb-1">Bienvenido</h3>
            <p className="text-muted small">Ingresa tus credenciales para acceder.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Correo Electrónico</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="fas fa-envelope text-muted"></i></span>
                <input type="email" className="form-control bg-light border-start-0 ps-0" placeholder="admin@gestion.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="fas fa-lock text-muted"></i></span>
                <input type="password" className="form-control bg-light border-start-0 ps-0" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold rounded-3 mb-3">
              Ingresar
            </button>
             {/* NUEVO ENLACE PARA REGISTRARSE */}
            <div className="text-center mb-3">
              <span className="text-muted small">¿No tienes cuenta? </span>
              <a href="/register" className="text-primary small fw-bold text-decoration-none">Regístrate aquí</a>
            </div>
            <div className="text-center mt-3">
              <a href="/" className="text-decoration-none text-muted small hover-primary">
                <i className="fas fa-arrow-left me-1"></i> Volver al inicio
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}