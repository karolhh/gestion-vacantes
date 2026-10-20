/**
 * api.js
 * Funciones específicas para cada endpoint del backend.
 * Usan el wrapper request() de request.js
 */

// =====================================================
// AUTENTICACIÓN
// =====================================================
const AuthAPI = {
    login: (email, password) =>
        request('/api/auth/login', 'POST', { email, password }),

    register: (postulante) =>
        request('/api/auth/register', 'POST', postulante)
};

// =====================================================
// RECLUTADORES (ADMIN)
// =====================================================
const ReclutadorAPI = {
    listar: () =>
        request('/api/admin/reclutadores', 'GET'),

    listarActivos: () =>
        request('/api/admin/reclutadores/activos', 'GET'),

    buscarPorId: (id) =>
        request(`/api/admin/reclutadores/${id}`, 'GET'),

    crear: (reclutador) =>
        request('/api/admin/reclutadores', 'POST', reclutador),

    actualizar: (id, reclutador) =>
        request(`/api/admin/reclutadores/${id}`, 'PUT', reclutador),

    deshabilitar: (id) =>
        request(`/api/admin/reclutadores/${id}/deshabilitar`, 'PATCH'),

    habilitar: (id) =>
        request(`/api/admin/reclutadores/${id}/habilitar`, 'PATCH'),

    eliminar: (id) =>
        request(`/api/admin/reclutadores/${id}`, 'DELETE')
};

// =====================================================
// VACANTES
// =====================================================
const VacanteAPI = {
    listarTodas: () =>
        request('/api/vacantes', 'GET'),

    listarPorEstado: (estado) =>
        request(`/api/vacantes/estado/${estado}`, 'GET'),

    buscarPorId: (id) =>
        request(`/api/vacantes/${id}`, 'GET'),

    buscarPorTitulo: (titulo) =>
        request(`/api/vacantes/buscar/titulo?titulo=${encodeURIComponent(titulo)}`, 'GET'),

    buscarPorUbicacion: (ubicacion) =>
        request(`/api/vacantes/buscar/ubicacion?ubicacion=${encodeURIComponent(ubicacion)}`, 'GET'),

    buscarPorTituloYUbicacion: (titulo, ubicacion) =>
        request(`/api/vacantes/buscar?titulo=${encodeURIComponent(titulo)}&ubicacion=${encodeURIComponent(ubicacion)}`, 'GET'),

    listarPorReclutador: (reclutadorId) =>
        request(`/api/vacantes/reclutador/${reclutadorId}`, 'GET'),

    listarPorReclutadorYEstado: (reclutadorId, estado) =>
        request(`/api/vacantes/reclutador/${reclutadorId}/estado/${estado}`, 'GET'),

    crear: (vacante) =>
        request('/api/vacantes', 'POST', vacante),

    actualizar: (id, vacante) =>
        request(`/api/vacantes/${id}`, 'PUT', vacante),

    cerrar: (id) =>
        request(`/api/vacantes/${id}/cerrar`, 'PATCH'),

    eliminar: (id) =>
        request(`/api/vacantes/${id}`, 'DELETE')
};

// =====================================================
// POSTULACIONES
// =====================================================
const PostulacionAPI = {
    postularse: (vacanteId, postulanteId) =>
        request('/api/postulaciones', 'POST', { vacanteId, postulanteId }),

    listarMisPostulaciones: (postulanteId) =>
        request(`/api/postulaciones/mis-postulaciones/${postulanteId}`, 'GET'),

    listarMisPostulacionesPorEstado: (postulanteId, estado) =>
        request(`/api/postulaciones/mis-postulaciones/${postulanteId}/estado/${estado}`, 'GET'),

    buscarPorId: (id) =>
        request(`/api/postulaciones/${id}`, 'GET'),

    listarPorVacante: (vacanteId) =>
        request(`/api/postulaciones/vacante/${vacanteId}`, 'GET'),

    listarPorVacanteYEstado: (vacanteId, estado) =>
        request(`/api/postulaciones/vacante/${vacanteId}/estado/${estado}`, 'GET'),

    actualizarEstado: (id, estado) =>
        request(`/api/postulaciones/${id}/estado/${estado}`, 'PATCH'),

    eliminar: (id) =>
        request(`/api/postulaciones/${id}`, 'DELETE')
};

// =====================================================
// POSTULANTES (PERFIL)
// =====================================================
const PostulanteAPI = {
    verPerfil: () =>
        request('/api/postulantes/me', 'GET'),

    editarPerfil: (postulante) =>
        request('/api/postulantes/me', 'PUT', postulante),

    subirHojaDeVida: (archivo) => {
        const formData = new FormData();
        formData.append('archivo', archivo);
        return requestUpload('/api/postulantes/me/hoja-vida', formData, 'POST');
    },

    descargarHojaDeVida: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/postulantes/me/hoja-vida`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) {
            throw new Error('No se pudo descargar la hoja de vida');
        }
        return await response.blob();
    }
};

// =====================================================
// UTILIDADES DE SESIÓN
// =====================================================
const Session = {
    guardarSesion: (authResponse) => {
        localStorage.setItem('token', authResponse.token);
        localStorage.setItem('email', authResponse.email);
        localStorage.setItem('rol', authResponse.rol);
    },

    cerrarSesion: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('rol');
    },

    obtenerToken: () => localStorage.getItem('token'),

    obtenerRol: () => localStorage.getItem('rol'),

    obtenerEmail: () => localStorage.getItem('email'),

    estaAutenticado: () => !!localStorage.getItem('token')
};