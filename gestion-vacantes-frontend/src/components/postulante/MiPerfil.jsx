import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { postulanteService } from '../../services/api';

export default function MiPerfil({ recargarDatos }) {
  const [perfil, setPerfil] = useState({
    nombreCompleto: '', email: '', telefono: '', direccion: '', password: ''
  });
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [nombreArchivoActual, setNombreArchivoActual] = useState(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const res = await postulanteService.verPerfil();
      setPerfil({
        nombreCompleto: res.data.nombreCompleto,
        email: res.data.email,
        telefono: res.data.telefono || '',
        direccion: res.data.direccion || '',
        password: ''
      });
      // Guardamos el nombre del archivo si ya existe en la BD
      setNombreArchivoActual(res.data.hojaVidaNombre || null);
    } catch (error) {
      Swal.fire('Error', 'No se pudo cargar el perfil', 'error');
    }
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await postulanteService.editarPerfil(perfil);
      Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success');
      setPerfil({ ...perfil, password: '' });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.mensaje || 'Error al actualizar', 'error');
    } finally {
      setCargando(false);
    }
  };

  const subirPDF = async () => {
    if (!archivo) {
      Swal.fire('Atención', 'Selecciona un archivo PDF primero', 'warning');
      return;
    }
    setCargando(true);
    try {
      await postulanteService.subirHojaDeVida(archivo);
      Swal.fire('Éxito', 'Hoja de vida subida correctamente', 'success');
      setArchivo(null);
      setNombreArchivoActual(archivo.name); // Actualizamos el estado local
      document.getElementById('input-file').value = ''; // Limpiar el input
      recargarDatos(); 
    } catch (error) {
      Swal.fire('Error', error.response?.data?.mensaje || 'Error al subir el PDF', 'error');
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      const res = await postulanteService.descargarHojaDeVida();
      // Creamos un enlace temporal para forzar la descarga en el navegador
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivoActual || 'Hoja_de_Vida.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      Swal.fire('Error', 'No se pudo descargar el archivo', 'error');
    }
  };

  return (
    <div className="row g-4">
      {/* Formulario de Datos Personales */}
      <div className="col-12 col-lg-7">
        <div className="card border-0 shadow-sm rounded-4 h-100">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
            <h5 className="fw-bold text-primary mb-0"><i className="fas fa-user-edit me-2"></i> Datos Personales</h5>
          </div>
          <div className="card-body p-4">
            <form onSubmit={guardarPerfil}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">Nombre Completo</label>
                  <input type="text" className="form-control" value={perfil.nombreCompleto} onChange={e => setPerfil({...perfil, nombreCompleto: e.target.value})} required />
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">Correo Electrónico</label>
                  <input type="email" className="form-control" value={perfil.email} onChange={e => setPerfil({...perfil, email: e.target.value})} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Teléfono</label>
                  <input type="text" className="form-control" value={perfil.telefono} onChange={e => setPerfil({...perfil, telefono: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Dirección</label>
                  <input type="text" className="form-control" value={perfil.direccion} onChange={e => setPerfil({...perfil, direccion: e.target.value})} />
                </div>
                <div className="col-12 mt-4">
                  <label className="form-label text-muted small fw-bold">Nueva Contraseña (Opcional)</label>
                  <input type="password" className="form-control" placeholder="Dejar en blanco para no cambiar" value={perfil.password} onChange={e => setPerfil({...perfil, password: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-4 px-4 py-2 rounded-3" disabled={cargando}>
                {cargando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tarjeta de Hoja de Vida */}
      <div className="col-12 col-lg-5">
        <div className="card border-0 shadow-sm rounded-4 h-100">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
            <h5 className="fw-bold text-success mb-0"><i className="fas fa-file-pdf me-2"></i> Hoja de Vida</h5>
          </div>
          <div className="card-body p-4 d-flex flex-column justify-content-center">
            
            {/* Si ya hay un archivo, mostramos la opción de descargar */}
            {nombreArchivoActual ? (
              <div className="text-center mb-4">
                <i className="fas fa-file-pdf fa-4x text-success mb-3"></i>
                <h6 className="fw-bold">{nombreArchivoActual}</h6>
                <p className="text-muted small">Tu hoja de vida está guardada en el sistema.</p>
                <button className="btn btn-outline-primary w-100 py-2 rounded-3 mb-2" onClick={descargarPDF}>
                  <i className="fas fa-download me-2"></i> Descargar Documento
                </button>
              </div>
            ) : (
              <div className="text-center mb-4">
                <i className="fas fa-cloud-upload-alt fa-4x text-muted mb-3 opacity-50"></i>
                <p className="text-muted small">No has subido ninguna hoja de vida aún.</p>
              </div>
            )}

            <hr />
            
            {/* Formulario para subir/reemplazar */}
            <label className="form-label text-muted small fw-bold">
              {nombreArchivoActual ? 'Reemplazar archivo actual:' : 'Subir archivo PDF:'}
            </label>
            <input 
              type="file" 
              id="input-file"
              className="form-control mb-3" 
              accept=".pdf" 
              onChange={(e) => setArchivo(e.target.files[0])} 
            />
            <button className="btn btn-success w-100 py-2 rounded-3" onClick={subirPDF} disabled={cargando || !archivo}>
              {cargando ? 'Subiendo...' : (nombreArchivoActual ? 'Subir Nuevo PDF' : 'Subir PDF')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}