import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { reclutadorService } from '../../services/api';

export default function ReclutadorForm() {
  const [form, setForm] = useState({ nombreCompleto: '', email: '', password: '', telefono: '', departamento: '', direccion: '', rol: 'RECLUTADOR', activo: true });
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      reclutadorService.obtener(id).then(res => setForm(res.data));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) await reclutadorService.actualizar(id, form);
      else await reclutadorService.crear(form);
      
      Swal.fire('Guardado', 'Operación exitosa', 'success');
      navigate('/admin');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.mensaje || 'Error', 'error');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f1f5f9', marginLeft: '260px' }}>
      <div className="card shadow-sm border-0 rounded-4 w-100" style={{ maxWidth: '700px' }}>
        <div className="card-body p-5">
          <h3 className="fw-bold mb-4">{id ? 'Editar' : 'Registrar'} Reclutador</h3>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Nombre Completo</label>
                <input type="text" className="form-control form-control-lg bg-light" value={form.nombreCompleto} onChange={e => setForm({...form, nombreCompleto: e.target.value})} required />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Email</label>
                <input type="email" className="form-control form-control-lg bg-light" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Contraseña</label>
                <input type="password" className="form-control form-control-lg bg-light" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!id} placeholder={id ? "Dejar en blanco para no cambiar" : ""} />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Teléfono</label>
                <input type="text" className="form-control form-control-lg bg-light" value={form.telefono || ''} onChange={e => setForm({...form, telefono: e.target.value})} />
              </div>
            </div>
            <div className="d-flex justify-content-end mt-5">
              <button type="button" className="btn btn-light border me-2 px-4" onClick={() => navigate('/admin')}>Cancelar</button>
              <button type="submit" className="btn btn-primary px-4">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}