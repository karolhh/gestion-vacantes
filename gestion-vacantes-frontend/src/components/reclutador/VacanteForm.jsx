import { useState } from 'react';
import Swal from 'sweetalert2';
import { vacanteService } from '../../services/api';

export default function VacanteForm({ reclutadorId, onVacanteCreada, onCancelar }) {
  const [form, setForm] = useState({ 
    titulo: '', descripcion: '', requisitos: '', salario: '', ubicacion: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones en el frontend
    if (!form.titulo || !form.descripcion || !form.ubicacion) {
      Swal.fire('Atención', 'Los campos Título, Descripción y Ubicación son obligatorios.', 'warning');
      return;
    }

    // Construimos el objeto asegurando los tipos de datos correctos
    // AGREGAMOS EL CAMPO "estado" QUE FALTABA
    const dataAEnviar = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      requisitos: form.requisitos.trim() || null,
      salario: form.salario ? parseFloat(form.salario) : null,
      ubicacion: form.ubicacion.trim(),
      estado: 'ABIERTA', // <-- ESTO ES LO QUE FALTABA
      reclutadorId: parseInt(reclutadorId) 
    };

    console.log("Enviando al backend:", dataAEnviar);

    try {
      await vacanteService.crear(dataAEnviar);
      Swal.fire('Éxito', 'Vacante publicada correctamente', 'success');
      onVacanteCreada();
    } catch (error) {
      console.error("Error del backend:", error.response);
      
      let mensajeError = 'Error al crear la vacante';
      
      if (error.response && error.response.data) {
        if (error.response.data.errores) {
          mensajeError = Object.values(error.response.data.errores)[0];
        } else if (error.response.data.mensaje) {
          mensajeError = error.response.data.mensaje;
        }
      }
      
      Swal.fire('Error', mensajeError, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h5 className="fw-bold mb-4 text-primary"><i className="fas fa-file-signature me-2"></i>Nueva Oferta Laboral</h5>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label text-muted small fw-bold">Título del Puesto *</label>
          <input type="text" className="form-control form-control-lg bg-light" placeholder="Ej. Desarrollador Full Stack" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required />
        </div>
        <div className="col-md-6">
          <label className="form-label text-muted small fw-bold">Ubicación *</label>
          <input type="text" className="form-control form-control-lg bg-light" placeholder="Ej. Remoto / Bogotá" value={form.ubicacion} onChange={e => setForm({...form, ubicacion: e.target.value})} required />
        </div>
        <div className="col-md-6">
          <label className="form-label text-muted small fw-bold">Salario (Opcional)</label>
          <input type="number" className="form-control form-control-lg bg-light" placeholder="Ej. 5000000" value={form.salario} onChange={e => setForm({...form, salario: e.target.value})} />
        </div>
        <div className="col-md-6">
          <label className="form-label text-muted small fw-bold">Requisitos Clave</label>
          <input type="text" className="form-control form-control-lg bg-light" placeholder="Ej. Java, Spring Boot" value={form.requisitos} onChange={e => setForm({...form, requisitos: e.target.value})} />
        </div>
        <div className="col-12">
          <label className="form-label text-muted small fw-bold">Descripción del Puesto *</label>
          <textarea className="form-control bg-light" rows="3" placeholder="Describe las funciones del cargo..." value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required></textarea>
        </div>
      </div>
      <div className="mt-4">
        <button type="submit" className="btn btn-success px-4 py-2 fw-medium rounded-3 me-2">
          <i className="fas fa-check me-2"></i> Publicar
        </button>
        <button type="button" className="btn btn-light border px-4 py-2 rounded-3" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}