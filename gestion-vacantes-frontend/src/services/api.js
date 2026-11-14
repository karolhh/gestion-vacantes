import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9098',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (postulante) => api.post('/api/auth/register', postulante),
  obtenerMiId: () => api.get('/api/auth/me'),
};

export const reclutadorService = {
  listar: () => api.get('/api/admin/reclutadores'),
  obtener: (id) => api.get(`/api/admin/reclutadores/${id}`),
  crear: (data) => api.post('/api/admin/reclutadores', data),
  actualizar: (id, data) => api.put(`/api/admin/reclutadores/${id}`, data),
  eliminar: (id) => api.delete(`/api/admin/reclutadores/${id}`),
};

export const vacanteService = {
  listarTodas: () => api.get('/api/vacantes'),
  listarPorEstado: (estado) => api.get(`/api/vacantes/estado/${estado}`),
  listarPorReclutador: (reclutadorId) => api.get(`/api/vacantes/reclutador/${reclutadorId}`),
  crear: (data) => api.post('/api/vacantes', data),
  cerrar: (id) => api.patch(`/api/vacantes/${id}/cerrar`),
  eliminar: (id) => api.delete(`/api/vacantes/${id}`),
};

export const postulacionService = {
  postularse: (vacanteId, postulanteId) => api.post('/api/postulaciones', { vacanteId, postulanteId }),
  listarTodas: () => api.get('/api/postulaciones'), // <-- NUEVA FUNCIÓN GLOBAL
  listarPorVacante: (vacanteId) => api.get(`/api/postulaciones/vacante/${vacanteId}`),
  actualizarEstado: (id, estado) => api.patch(`/api/postulaciones/${id}/estado/${estado}`),
  misPostulaciones: (postulanteId) => api.get(`/api/postulaciones/mis-postulaciones/${postulanteId}`),
};

export const postulanteService = {
  verPerfil: () => api.get('/api/postulantes/me'),
  editarPerfil: (data) => api.put('/api/postulantes/me', data),
  subirHojaDeVida: (archivo) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return api.post('/api/postulantes/me/hoja-vida', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  descargarHojaDeVida: () => {
    return api.get('/api/postulantes/me/hoja-vida', { 
        responseType: 'blob'
    });
  }
};