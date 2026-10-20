/**
 * postulante.js
 * Lógica del panel del Postulante.
 * Perfil + hoja de vida + búsqueda de vacantes + postulaciones.
 */

// =====================================================
// ESTADO GLOBAL
// =====================================================
let postulanteId = null;
let perfilActual = null;
let vacanteSeleccionada = null;
let modalDetalle, modalConfirmar;

// =====================================================
// INICIALIZACIÓN
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {

    // Verificar sesión
    if (!Session.estaAutenticado()) {
        alert('Debes iniciar sesión');
        window.location.href = '../login.html';
        return;
    }

    if (Session.obtenerRol() !== 'POSTULANTE') {
        alert('Acceso denegado. Solo postulantes.');
        window.location.href = '../login.html';
        return;
    }

    document.getElementById('usuario-email').textContent = Session.obtenerEmail();

    // Inicializar modales
    modalDetalle = new bootstrap.Modal(document.getElementById('modal-detalle-vacante'));
    modalConfirmar = new bootstrap.Modal(document.getElementById('modal-confirmar-postulacion'));

    // Registrar eventos
    registrarEventos();

    // Cargar perfil (necesario para obtener el ID del postulante)
    try {
        perfilActual = await PostulanteAPI.verPerfil();
        postulanteId = perfilActual.id;
        
        // Si el backend no devuelve el nombre de la hoja de vida, 
        // pero sabemos que el campo existe en el objeto, lo dejamos así.
        // Si el perfil se acaba de cargar y el usuario ya tenía una hoja de vida,
        // el backend debería devolverla en el perfil.
        cargarDatosPerfil(perfilActual);
    } catch (error) {
        mostrarAlerta('Error al cargar perfil: ' + error.message, 'danger');
    }

    // Cargar vacantes
    cargarVacantesDisponibles();
});

// =====================================================
// EVENTOS
// =====================================================
function registrarEventos() {

    document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
        if (confirm('¿Cerrar sesión?')) {
            Session.cerrarSesion();
            window.location.href = '../login.html';
        }
    });

    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            cambiarSeccion(link.dataset.seccion);
        });
    });

    document.getElementById('btn-buscar').addEventListener('click', buscarVacantes);
    document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
    document.getElementById('btn-refrescar-postulaciones').addEventListener('click', cargarMisPostulaciones);
    document.getElementById('filtro-estado-postulaciones').addEventListener('change', cargarMisPostulaciones);

    document.getElementById('form-perfil').addEventListener('submit', (e) => {
        e.preventDefault();
        guardarPerfil();
    });

    document.getElementById('form-hoja-vida').addEventListener('submit', (e) => {
        e.preventDefault();
        subirHojaDeVida();
    });

    document.getElementById('btn-descargar-hv').addEventListener('click', descargarHojaDeVida);
    document.getElementById('btn-postularme').addEventListener('click', abrirModalConfirmarPostulacion);
    document.getElementById('btn-confirmar-postulacion').addEventListener('click', confirmarPostulacion);
}

// =====================================================
// CAMBIO DE SECCIÓN
// =====================================================
function cambiarSeccion(seccion) {
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.seccion === seccion);
    });

    document.getElementById('seccion-vacantes').classList.toggle('d-none', seccion !== 'vacantes');
    document.getElementById('seccion-mis-postulaciones').classList.toggle('d-none', seccion !== 'mis-postulaciones');
    document.getElementById('seccion-perfil').classList.toggle('d-none', seccion !== 'perfil');

    if (seccion === 'mis-postulaciones') cargarMisPostulaciones();
    if (seccion === 'perfil') recargarPerfil();
}

// =====================================================
// PERFIL
// =====================================================
function cargarDatosPerfil(perfil) {
    document.getElementById('perfil-nombre').value = perfil.nombreCompleto || '';
    document.getElementById('perfil-email').value = perfil.email || '';
    document.getElementById('perfil-telefono').value = perfil.telefono || '';
    document.getElementById('perfil-direccion').value = perfil.direccion || '';

    // Estado de la hoja de vida
    actualizarEstadoHojaDeVida();
}

async function recargarPerfil() {
    try {
        perfilActual = await PostulanteAPI.verPerfil();
        cargarDatosPerfil(perfilActual);
    } catch (error) {
        mostrarAlerta('Error al recargar perfil: ' + error.message, 'danger');
    }
}

async function guardarPerfil() {
    const data = {
        nombreCompleto: document.getElementById('perfil-nombre').value.trim(),
        email: document.getElementById('perfil-email').value.trim(),
        password: document.getElementById('perfil-password').value,
        telefono: document.getElementById('perfil-telefono').value.trim() || null,
        direccion: document.getElementById('perfil-direccion').value.trim() || null
    };

    mostrarLoader(true);
    try {
        perfilActual = await PostulanteAPI.editarPerfil(data);
        document.getElementById('perfil-password').value = '';
        mostrarAlerta('Perfil actualizado correctamente', 'success');
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// HOJA DE VIDA
// =====================================================
function actualizarEstadoHojaDeVida() {
    const contenedor = document.getElementById('estado-hoja-vida');
    
    // Verificamos si el perfil tiene el nombre de la hoja de vida
    if (perfilActual && perfilActual.hojaVidaNombre) {
        contenedor.innerHTML = `
            <div class="hv-cargada">
                <i class="bi bi-check-circle-fill me-1"></i>
                PDF cargado: <strong>${escapeHtml(perfilActual.hojaVidaNombre)}</strong>
            </div>
        `;
    } else {
        contenedor.innerHTML = `
            <div class="hv-no-cargada">
                <i class="bi bi-exclamation-circle-fill me-1"></i>
                No has subido tu hoja de vida.
            </div>
            <p class="text-muted small mt-1">Debes subirla para poder postularte.</p>
        `;
    }
}

async function subirHojaDeVida() {
    const input = document.getElementById('input-hoja-vida');
    if (!input.files || input.files.length === 0) {
        mostrarAlerta('Selecciona un archivo PDF', 'warning');
        return;
    }

    const archivo = input.files[0];
    mostrarLoader(true);
    try {
        // 1. Subir el archivo al backend
        await PostulanteAPI.subirHojaDeVida(archivo);
        
        // 2. Actualizar el objeto local con el nombre del archivo
        // (Esto es porque el backend actual no devuelve el nombre de la hoja de vida en el JSON del perfil)
        perfilActual.hojaVidaNombre = archivo.name;
        
        // 3. Mostrar mensaje de éxito y actualizar la vista
        mostrarAlerta('Hoja de vida subida correctamente', 'success');
        input.value = '';
        actualizarEstadoHojaDeVida();
        
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

async function descargarHojaDeVida() {
    if (!perfilActual || !perfilActual.hojaVidaNombre) {
        mostrarAlerta('No tienes hoja de vida cargada', 'warning');
        return;
    }

    mostrarLoader(true);
    try {
        const blob = await PostulanteAPI.descargarHojaDeVida();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = perfilActual.hojaVidaNombre || 'hoja_vida.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        mostrarAlerta('Error al descargar: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// VACANTES
// =====================================================
async function cargarVacantesDisponibles() {
    mostrarLoader(true);
    try {
        const vacantes = await VacanteAPI.listarPorEstado('ABIERTA');
        renderizarVacantes(vacantes);
    } catch (error) {
        mostrarAlerta('Error al cargar vacantes: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

async function buscarVacantes() {
    const titulo = document.getElementById('filtro-titulo').value.trim();
    const ubicacion = document.getElementById('filtro-ubicacion').value.trim();

    mostrarLoader(true);
    try {
        let lista;
        if (titulo && ubicacion) {
            lista = await VacanteAPI.buscarPorTituloYUbicacion(titulo, ubicacion);
        } else if (titulo) {
            lista = await VacanteAPI.buscarPorTitulo(titulo);
        } else if (ubicacion) {
            lista = await VacanteAPI.buscarPorUbicacion(ubicacion);
        } else {
            lista = await VacanteAPI.listarPorEstado('ABIERTA');
        }
        // Filtrar solo ABIERTAS
        lista = lista.filter(v => v.estado === 'ABIERTA');
        renderizarVacantes(lista);
    } catch (error) {
        mostrarAlerta('Error al buscar: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

function limpiarFiltros() {
    document.getElementById('filtro-titulo').value = '';
    document.getElementById('filtro-ubicacion').value = '';
    cargarVacantesDisponibles();
}

function renderizarVacantes(lista) {
    const contenedor = document.getElementById('lista-vacantes');

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-search"></i>
                    <p>No se encontraron vacantes disponibles.</p>
                </div>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = lista.map(v => `
        <div class="col-md-6 col-lg-4">
            <div class="vacante-card card">
                <div class="card-body">
                    <h5 class="card-title">${escapeHtml(v.titulo)}</h5>
                    <div class="vacante-ubicacion">
                        <i class="bi bi-geo-alt-fill me-1"></i>
                        ${escapeHtml(v.ubicacion)}
                    </div>
                    <div class="vacante-descripcion">
                        ${escapeHtml(v.descripcion)}
                    </div>
                    <div class="vacante-salario">
                        ${v.salario ? '$' + Number(v.salario).toLocaleString('es-CO') : 'Salario a convenir'}
                    </div>
                </div>
                <div class="card-footer">
                    <span class="badge-estado badge-${v.estado}">${v.estado}</span>
                    <div>
                        <button class="btn btn-accion btn-accion-ver" title="Ver detalle"
                                onclick="verDetalleVacante(${v.id})">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                        <button class="btn btn-accion btn-accion-postular"
                                onclick="postularDirecto(${v.id})"
                                style="background-color: #198754;">
                            <i class="bi bi-send-fill"></i>
                            Postularme
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// =====================================================
// DETALLE DE VACANTE
// =====================================================
async function verDetalleVacante(id) {
    mostrarLoader(true);
    try {
        const v = await VacanteAPI.buscarPorId(id);
        vacanteSeleccionada = v;

        document.getElementById('detalle-vacante-contenido').innerHTML = `
            <div class="detalle-seccion">
                <div class="detalle-label">Título</div>
                <div class="detalle-valor">${escapeHtml(v.titulo)}</div>
            </div>
            <div class="detalle-seccion">
                <div class="detalle-label">Descripción</div>
                <div class="detalle-valor">${escapeHtml(v.descripcion)}</div>
            </div>
            <div class="detalle-seccion">
                <div class="detalle-label">Requisitos</div>
                <div class="detalle-valor">${v.requisitos ? escapeHtml(v.requisitos) : '—'}</div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="detalle-seccion">
                        <div class="detalle-label">Salario</div>
                        <div class="detalle-valor">${v.salario ? '$' + Number(v.salario).toLocaleString('es-CO') : 'A convenir'}</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="detalle-seccion">
                        <div class="detalle-label">Ubicación</div>
                        <div class="detalle-valor">${escapeHtml(v.ubicacion)}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="detalle-seccion">
                        <div class="detalle-label">Estado</div>
                        <div class="detalle-valor">
                            <span class="badge-estado badge-${v.estado}">${v.estado}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="detalle-seccion">
                        <div class="detalle-label">Fecha de Publicación</div>
                        <div class="detalle-valor">${formatearFecha(v.fechaPublicacion)}</div>
                    </div>
                </div>
            </div>
        `;

        // Ocultar botón "Postularme" si no está ABIERTA
        document.getElementById('btn-postularme').style.display =
            v.estado === 'ABIERTA' ? 'inline-block' : 'none';

        modalDetalle.show();
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// POSTULARSE
// =====================================================
function abrirModalConfirmarPostulacion() {
    if (!vacanteSeleccionada) return;
    if (!perfilActual || !perfilActual.hojaVidaNombre) {
        mostrarAlerta('Debes subir tu hoja de vida antes de postularte', 'warning');
        return;
    }
    document.getElementById('confirmar-postulacion-titulo').textContent = vacanteSeleccionada.titulo;
    modalDetalle.hide();
    modalConfirmar.show();
}

function postularDirecto(vacanteId) {
    if (!perfilActual || !perfilActual.hojaVidaNombre) {
        mostrarAlerta('Debes subir tu hoja de vida antes de postularte', 'warning');
        return;
    }
    
    // Buscar el título de la vacante en el DOM o hacer una petición rápida
    // Para simplificar, le pedimos al usuario que use "Ver detalle" para postularse, 
    // o hacemos una petición rápida para obtener el título.
    VacanteAPI.buscarPorId(vacanteId).then(v => {
        vacanteSeleccionada = v;
        document.getElementById('confirmar-postulacion-titulo').textContent = v.titulo;
        modalConfirmar.show();
    }).catch(err => {
        mostrarAlerta('Error: ' + err.message, 'danger');
    });
}

async function confirmarPostulacion() {
    if (!vacanteSeleccionada) return;

    mostrarLoader(true);
    try {
        await PostulacionAPI.postularse(vacanteSeleccionada.id, postulanteId);
        mostrarAlerta('Postulación realizada con éxito', 'success');
        modalConfirmar.hide();
        vacanteSeleccionada = null;
        cargarVacantesDisponibles();
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// MIS POSTULACIONES
// =====================================================
async function cargarMisPostulaciones() {
    const estado = document.getElementById('filtro-estado-postulaciones').value;

    mostrarLoader(true);
    try {
        let lista;
        if (estado) {
            lista = await PostulacionAPI.listarMisPostulacionesPorEstado(postulanteId, estado);
        } else {
            lista = await PostulacionAPI.listarMisPostulaciones(postulanteId);
        }
        renderizarMisPostulaciones(lista);
    } catch (error) {
        mostrarAlerta('Error al cargar postulaciones: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

function renderizarMisPostulaciones(lista) {
    const tbody = document.getElementById('tabla-mis-postulaciones');

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="bi bi-inbox"></i>
                        <p>No tienes postulaciones todavía.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${escapeHtml(p.vacanteTitulo || '—')}</td>
            <td><span class="badge-estado badge-${p.estado}">${p.estado}</span></td>
            <td>${formatearFecha(p.fechaPostulacion)}</td>
            <td>${formatearFecha(p.fechaActualizacion)}</td>
            <td class="text-center">
                <button class="btn btn-accion btn-accion-ver" title="Ver detalle"
                        onclick="verDetallePostulacion(${p.id})">
                    <i class="bi bi-eye-fill"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function verDetallePostulacion(id) {
    mostrarLoader(true);
    try {
        const p = await PostulacionAPI.buscarPorId(id);
        alert(`Postulación #${p.id}\n` +
              `Vacante: ${p.vacanteTitulo}\n` +
              `Estado: ${p.estado}\n` +
              `Fecha: ${formatearFecha(p.fechaPostulacion)}`);
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// UTILIDADES
// =====================================================
function mostrarLoader(mostrar) {
    document.getElementById('loader').classList.toggle('d-none', !mostrar);
}

function mostrarAlerta(mensaje, tipo = 'info') {
    const container = document.getElementById('alertas-container');
    const id = 'alerta-' + Date.now();
    const html = `
        <div class="alert alert-${tipo} alert-dismissible fade show alert-flotante" role="alert" id="${id}">
            ${escapeHtml(mensaje)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.remove();
    }, 4000);
}

function escapeHtml(texto) {
    if (texto == null) return '';
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatearFecha(fecha) {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleString('es-CO', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}