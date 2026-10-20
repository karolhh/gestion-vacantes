/**
 * admin.js
 * Lógica del panel del Administrador.
 * CRUD de Reclutadores + lectura de Vacantes y Postulaciones.
 */

// =====================================================
// ESTADO GLOBAL
// =====================================================
let reclutadores = [];
let reclutadorAEliminar = null;
let modalReclutador = null;
let modalEliminar = null;

// =====================================================
// INICIALIZACIÓN
// =====================================================
document.addEventListener('DOMContentLoaded', () => {

    // Verificar sesión
    if (!Session.estaAutenticado()) {
        alert('Debes iniciar sesión');
        window.location.href = '../login.html';
        return;
    }

    // Verificar rol ADMIN
    if (Session.obtenerRol() !== 'ADMIN') {
        alert('Acceso denegado. Solo administradores.');
        window.location.href = '../login.html';
        return;
    }

    // Mostrar email del usuario
    document.getElementById('usuario-email').textContent = Session.obtenerEmail();

    // Inicializar modales de Bootstrap
    modalReclutador = new bootstrap.Modal(document.getElementById('modal-reclutador'));
    modalEliminar = new bootstrap.Modal(document.getElementById('modal-eliminar'));

    // Registrar eventos
    registrarEventos();

    // Cargar datos iniciales
    cargarReclutadores();
});

// =====================================================
// EVENTOS
// =====================================================
function registrarEventos() {

    // Cerrar sesión
    document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
        if (confirm('¿Cerrar sesión?')) {
            Session.cerrarSesion();
            window.location.href = '../login.html';
        }
    });

    // Cambio de sección en sidebar
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            cambiarSeccion(link.dataset.seccion);
        });
    });

    // Botón nuevo reclutador
    document.getElementById('btn-nuevo-reclutador').addEventListener('click', () => {
        abrirModalCrear();
    });

    // Botón refrescar
    document.getElementById('btn-refrescar-reclutadores').addEventListener('click', () => {
        cargarReclutadores();
    });

    // Filtros
    document.getElementById('filtro-reclutadores').addEventListener('change', aplicarFiltros);
    document.getElementById('busqueda-reclutadores').addEventListener('input', aplicarFiltros);

    // Submit del formulario
    document.getElementById('form-reclutador').addEventListener('submit', (e) => {
        e.preventDefault();
        guardarReclutador();
    });

    // Confirmar eliminar
    document.getElementById('btn-confirmar-eliminar').addEventListener('click', () => {
        eliminarReclutador();
    });
}

// =====================================================
// CAMBIO DE SECCIÓN
// =====================================================
function cambiarSeccion(seccion) {

    // Actualizar clase activa en sidebar
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.seccion === seccion);
    });

    // Mostrar/ocultar secciones
    document.getElementById('seccion-reclutadores').classList.toggle('d-none', seccion !== 'reclutadores');
    document.getElementById('seccion-vacantes').classList.toggle('d-none', seccion !== 'vacantes');
    document.getElementById('seccion-postulaciones').classList.toggle('d-none', seccion !== 'postulaciones');

    // Cargar datos según la sección
    if (seccion === 'vacantes') cargarVacantes();
    if (seccion === 'postulaciones') cargarPostulaciones();
}

// =====================================================
// CARGAR RECLUTADORES
// =====================================================
async function cargarReclutadores() {
    mostrarLoader(true);
    try {
        reclutadores = await ReclutadorAPI.listar();
        renderizarReclutadores(reclutadores);
    } catch (error) {
        mostrarAlerta('Error al cargar reclutadores: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// RENDERIZAR TABLA DE RECLUTADORES
// =====================================================
function renderizarReclutadores(lista) {

    const tbody = document.getElementById('tabla-reclutadores');

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="bi bi-people"></i>
                        <p>No hay reclutadores registrados.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${escapeHtml(r.nombreCompleto)}</td>
            <td>${escapeHtml(r.email)}</td>
            <td>${r.telefono ? escapeHtml(r.telefono) : '<span class="text-muted">—</span>'}</td>
            <td>${r.departamento ? escapeHtml(r.departamento) : '<span class="text-muted">—</span>'}</td>
            <td>
                ${r.activo
                    ? '<span class="estado-activo"><i class="bi bi-check-circle-fill me-1"></i>Activo</span>'
                    : '<span class="estado-inactivo"><i class="bi bi-x-circle-fill me-1"></i>Inactivo</span>'}
            </td>
            <td class="text-center">
                <button class="btn btn-accion btn-accion-editar" title="Editar"
                        onclick="abrirModalEditar(${r.id})">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                ${r.activo
                    ? `<button class="btn btn-accion btn-accion-deshabilitar" title="Deshabilitar"
                              onclick="deshabilitar(${r.id})">
                          <i class="bi bi-pause-fill"></i>
                       </button>`
                    : `<button class="btn btn-accion btn-accion-habilitar" title="Habilitar"
                              onclick="habilitar(${r.id})">
                          <i class="bi bi-play-fill"></i>
                       </button>`}
                <button class="btn btn-accion btn-accion-eliminar" title="Eliminar"
                        onclick="abrirModalEliminar(${r.id})">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// =====================================================
// FILTROS
// =====================================================
function aplicarFiltros() {

    const filtro = document.getElementById('filtro-reclutadores').value;
    const busqueda = document.getElementById('busqueda-reclutadores').value.toLowerCase();

    let lista = [...reclutadores];

    // Filtro por estado
    if (filtro === 'activos') lista = lista.filter(r => r.activo);
    if (filtro === 'inactivos') lista = lista.filter(r => !r.activo);

    // Filtro por búsqueda
    if (busqueda) {
        lista = lista.filter(r =>
            r.nombreCompleto.toLowerCase().includes(busqueda) ||
            r.email.toLowerCase().includes(busqueda)
        );
    }

    renderizarReclutadores(lista);
}

// =====================================================
// MODAL CREAR
// =====================================================
function abrirModalCrear() {
    document.getElementById('modal-reclutador-titulo').textContent = 'Nuevo Reclutador';
    document.getElementById('form-reclutador').reset();
    document.getElementById('reclutador-id').value = '';
    document.getElementById('reclutador-password').required = true;
    document.getElementById('reclutador-password-hint').textContent =
        'Obligatoria al crear. Mínimo 8 caracteres.';
    modalReclutador.show();
}

// =====================================================
// MODAL EDITAR
// =====================================================
function abrirModalEditar(id) {
    const r = reclutadores.find(x => x.id === id);
    if (!r) return;

    document.getElementById('modal-reclutador-titulo').textContent = 'Editar Reclutador';
    document.getElementById('reclutador-id').value = r.id;
    document.getElementById('reclutador-nombre').value = r.nombreCompleto || '';
    document.getElementById('reclutador-email').value = r.email || '';
    document.getElementById('reclutador-password').value = '';
    document.getElementById('reclutador-password').required = false;
    document.getElementById('reclutador-password-hint').textContent =
        'Déjala vacía para no cambiar la contraseña actual.';
    document.getElementById('reclutador-telefono').value = r.telefono || '';
    document.getElementById('reclutador-departamento').value = r.departamento || '';
    document.getElementById('reclutador-direccion').value = r.direccion || '';

    modalReclutador.show();
}

// =====================================================
// GUARDAR (crear o actualizar)
// =====================================================
async function guardarReclutador() {

    const id = document.getElementById('reclutador-id').value;

    const data = {
        nombreCompleto: document.getElementById('reclutador-nombre').value.trim(),
        email: document.getElementById('reclutador-email').value.trim(),
        password: document.getElementById('reclutador-password').value,
        telefono: document.getElementById('reclutador-telefono').value.trim() || null,
        departamento: document.getElementById('reclutador-departamento').value.trim() || null,
        direccion: document.getElementById('reclutador-direccion').value.trim() || null,
        rol: 'RECLUTADOR',
        activo: true
    };

    mostrarLoader(true);
    try {
        if (id) {
            // Actualizar
            if (!data.password) delete data.password;
            await ReclutadorAPI.actualizar(id, data);
            mostrarAlerta('Reclutador actualizado correctamente', 'success');
        } else {
            // Crear
            if (!data.password) {
                throw new Error('La contraseña es obligatoria al crear');
            }
            await ReclutadorAPI.crear(data);
            mostrarAlerta('Reclutador creado correctamente', 'success');
        }

        modalReclutador.hide();
        await cargarReclutadores();

    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// DESHABILITAR
// =====================================================
async function deshabilitar(id) {
    if (!confirm('¿Deshabilitar este reclutador?')) return;
    mostrarLoader(true);
    try {
        await ReclutadorAPI.deshabilitar(id);
        mostrarAlerta('Reclutador deshabilitado', 'success');
        await cargarReclutadores();
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// HABILITAR
// =====================================================
async function habilitar(id) {
    mostrarLoader(true);
    try {
        await ReclutadorAPI.habilitar(id);
        mostrarAlerta('Reclutador habilitado', 'success');
        await cargarReclutadores();
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// MODAL ELIMINAR
// =====================================================
function abrirModalEliminar(id) {
    const r = reclutadores.find(x => x.id === id);
    if (!r) return;
    reclutadorAEliminar = id;
    document.getElementById('eliminar-nombre').textContent = r.nombreCompleto;
    modalEliminar.show();
}

// =====================================================
// ELIMINAR
// =====================================================
async function eliminarReclutador() {
    if (!reclutadorAEliminar) return;
    mostrarLoader(true);
    try {
        await ReclutadorAPI.eliminar(reclutadorAEliminar);
        mostrarAlerta('Reclutador eliminado', 'success');
        modalEliminar.hide();
        reclutadorAEliminar = null;
        await cargarReclutadores();
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// CARGAR VACANTES (solo lectura)
// =====================================================
async function cargarVacantes() {
    mostrarLoader(true);
    try {
        const vacantes = await VacanteAPI.listarTodas();
        renderizarVacantes(vacantes);
    } catch (error) {
        mostrarAlerta('Error al cargar vacantes: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

function renderizarVacantes(lista) {
    const tbody = document.getElementById('tabla-vacantes');
    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay vacantes publicadas.</td></tr>`;
        return;
    }
    tbody.innerHTML = lista.map(v => `
        <tr>
            <td>${v.id}</td>
            <td>${escapeHtml(v.titulo)}</td>
            <td>${escapeHtml(v.ubicacion)}</td>
            <td>${v.salario ? '$' + Number(v.salario).toLocaleString('es-CO') : '—'}</td>
            <td><span class="badge-estado badge-${v.estado}">${v.estado}</span></td>
            <td>${escapeHtml(v.reclutadorNombre || '—')}</td>
            <td>${formatearFecha(v.fechaPublicacion)}</td>
        </tr>
    `).join('');
}

// =====================================================
// CARGAR POSTULACIONES (solo lectura)
// =====================================================
async function cargarPostulaciones() {
    mostrarLoader(true);
    try {
        // El admin puede ver todas las postulaciones, pero necesitamos una vacante.
        // Como no hay endpoint global, listamos todas las vacantes y sus postulaciones.
        const vacantes = await VacanteAPI.listarTodas();
        const todas = [];
        for (const v of vacantes) {
            try {
                const posts = await PostulacionAPI.listarPorVacante(v.id);
                todas.push(...posts);
            } catch (e) {
                // Ignorar si falla
            }
        }
        renderizarPostulaciones(todas);
    } catch (error) {
        mostrarAlerta('Error al cargar postulaciones: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

function renderizarPostulaciones(lista) {
    const tbody = document.getElementById('tabla-postulaciones');
    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay postulaciones.</td></tr>`;
        return;
    }
    tbody.innerHTML = lista.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${escapeHtml(p.vacanteTitulo || '—')}</td>
            <td>${escapeHtml(p.postulanteNombre || '—')}</td>
            <td>${escapeHtml(p.postulanteEmail || '—')}</td>
            <td><span class="badge-estado badge-${p.estado}">${p.estado}</span></td>
            <td>${formatearFecha(p.fechaPostulacion)}</td>
        </tr>
    `).join('');
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