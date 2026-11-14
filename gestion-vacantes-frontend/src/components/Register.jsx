import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { authService } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ nombreCompleto: '', email: '', password: '', telefono: '', direccion: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await authService.register({ ...form, rol: 'POSTULANTE' });
      Swal.fire('Éxito', 'Cuenta creada. Ahora puedes iniciar sesión.', 'success');
      navigate('/login');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.mensaje || 'No se pudo crear la cuenta', 'error');
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-dark mb-1">Crear Cuenta</h3>
            <p className="text-muted small">Regístrate para postularte a las vacantes.</p>
          </div>
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Nombre Completo</label>
              <input type="text" className="form-control" value={form.nombreCompleto} onChange={e => setForm({...form, nombreCompleto: e.target.value})} required />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Correo Electrónico</label>
              <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Contraseña</label>
              <input type="password" className="form-control" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength="8" />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small fw-bold">Teléfono</label>
                <input type="text" className="form-control" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small fw-bold">Dirección</label>
                <input type="text" className="form-control" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn btn-success w-100 py-2 fw-bold rounded-3 mb-3">Registrarme</button>
            <div className="text-center">
              <Link to="/login" className="text-decoration-none text-muted small">Volver al Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}