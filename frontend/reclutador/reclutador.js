/**
 * reclutador.js
 * Lógica del panel del Reclutador.
 * CRUD de Vacantes + gestión de Postulaciones recibidas.
 */

// =====================================================
// ESTADO GLOBAL
// =====================================================
let reclutadorId = null;
let vacantes = [];
let vacanteAEliminar = null;
let vacanteACerrar = null;
let postulacionAEstado = null;

// Modales
let modalVacante, modalDetalle, modalEstado, modalCerrar, modalEliminar;

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

    if (Session.obtenerRol() !== 'RECLUTADOR') {
        alert('Acceso denegado. Solo reclutadores.');
        window.location.href = '../login.html';
        return;
    }

    document.getElementById('usuario-email').textContent = Session.obtenerEmail();

    // Inicializar modales
    modalVacante = new bootstrap.Modal(document.getElementById('modal-vacante'));
    modalDetalle = new bootstrap.Modal(document.getElementById('modal-detalle-vacante'));
    modalEstado = new bootstrap.Modal(document.getElementById('modal-estado-postulacion'));
    modalCerrar = new bootstrap.Modal(document.getElementById('modal-cerrar-vacante'));
    modalEliminar = new bootstrap.Modal(document.getElementById('modal-eliminar-vacante'));

    // Registrar eventos
    registrarEventos();

       // Obtener el ID del reclutador logueado a partir de su email
    try {
        const emailLogueado = Session.obtenerEmail();
        const todos = await ReclutadorAPI.listar(); // Solo funciona si el reclutador tiene permiso de ver la lista, o si lo hacemos como admin.
        // NOTA: Si da error 403, el reclutador no tiene permiso para listar a otros reclutadores.
        // En ese caso, usaremos un endpoint alternativo o guardaremos el ID en el login.
        
        // OPCIÓN TEMPORAL: Hardcodear el ID si falla
        // reclutadorId = 2; 
    } catch (e) {
        console.warn("No se pudo obtener el ID automáticamente. Usando valor por defecto.");
        reclutadorId = 2; // Cambia este número por el ID real de Yoseph en la base de datos
    }

    // Cargar dashboard
    cargarDashboard();
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

    document.getElementById('btn-nueva-vacante').addEventListener('click', abrirModalCrearVacante);
    document.getElementById('form-vacante').addEventListener('submit', (e) => {
        e.preventDefault();
        guardarVacante();
    });

    document.getElementById('btn-buscar').addEventListener('click', buscarVacantes);
    document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
    document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);

    document.getElementById('btn-refrescar-postulaciones').addEventListener('click', cargarPostulaciones);
    document.getElementById('filtro-vacante-postulaciones').addEventListener('change', cargarPostulaciones);
    document.getElementById('filtro-estado-postulaciones').addEventListener('change', cargarPostulaciones);

    document.getElementById('btn-guardar-estado').addEventListener('click', guardarEstadoPostulacion);
    document.getElementById('btn-confirmar-cerrar-vacante').addEventListener('click', confirmarCerrarVacante);
    document.getElementById('btn-confirmar-eliminar-vacante').addEventListener('click', confirmarEliminarVacante);
}

// =====================================================
// CAMBIO DE SECCIÓN
// =====================================================
function cambiarSeccion(seccion) {
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.seccion === seccion);
    });

    document.getElementById('seccion-dashboard').classList.toggle('d-none', seccion !== 'dashboard');
    document.getElementById('seccion-vacantes').classList.toggle('d-none', seccion !== 'vacantes');
    document.getElementById('seccion-postulaciones').classList.toggle('d-none', seccion !== 'postulaciones');

    if (seccion === 'vacantes') cargarVacantes();
    if (seccion === 'postulaciones') cargarPostulaciones();
}

// =====================================================
// DASHBOARD
// =====================================================
async function cargarDashboard() {
    mostrarLoader(true);
    try {
        const todas = await VacanteAPI.listarTodas();

        const abiertas = todas.filter(v => v.estado === 'ABIERTA').length;
        const enProceso = todas.filter(v => v.estado === 'EN_PROCESO').length;
        const cerradas = todas.filter(v => v.estado === 'CERRADA').length;

        document.getElementById('stat-total-vacantes').textContent = todas.length;
        document.getElementById('stat-vacantes-abiertas').textContent = abiertas;
        document.getElementById('stat-vacantes-proceso').textContent = enProceso;
        document.getElementById('stat-vacantes-cerradas').textContent = cerradas;

        // Cargar postulaciones para stats
        let totalPost = 0;
        let recibidas = 0;
        for (const v of todas) {
            try {
                const posts = await PostulacionAPI.listarPorVacante(v.id);
                totalPost += posts.length;
                recibidas += posts.filter(p => p.estado === 'RECIBIDA').length;
            } catch (e) { /* ignorar */ }
        }

        document.getElementById('stat-total-postulaciones').textContent = totalPost;
        document.getElementById('stat-postulaciones-recibidas').textContent = recibidas;

    } catch (error) {
        mostrarAlerta('Error al cargar dashboard: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// VACANTES - CARGAR
// =====================================================
async function cargarVacantes() {
    mostrarLoader(true);
    try {
        vacantes = await VacanteAPI.listarTodas();
        renderizarVacantes(vacantes);
        llenarSelectVacantes();
    } catch (error) {
        mostrarAlerta('Error al cargar vacantes: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// VACANTES - RENDERIZAR
// =====================================================
function renderizarVacantes(lista) {
    const tbody = document.getElementById('tabla-vacantes');

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="bi bi-file-earmark-x"></i>
                        <p>No hay vacantes registradas.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(v => `
        <tr>
            <td>${v.id}</td>
            <td>${escapeHtml(v.titulo)}</td>
            <td>${escapeHtml(v.ubicacion)}</td>
            <td>${v.salario ? '$' + Number(v.salario).toLocaleString('es-CO') : '—'}</td>
            <td><span class="badge-estado badge-${v.estado}">${v.estado}</span></td>
            <td>${formatearFecha(v.fechaPublicacion)}</td>
            <td class="text-center">
                <button class="btn btn-accion btn-accion-ver" title="Ver detalle"
                        onclick="verDetalle(${v.id})">
                    <i class="bi bi-eye-fill"></i>
                </button>
                <button class="btn btn-accion btn-accion-postulaciones" title="Ver postulaciones"
                        onclick="verPostulacionesDeVacante(${v.id})">
                    <i class="bi bi-people-fill"></i>
                </button>
                ${v.estado !== 'CERRADA' ? `
                    <button class="btn btn-accion btn-accion-editar" title="Editar"
                            onclick="abrirModalEditarVacante(${v.id})">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-accion btn-accion-cerrar" title="Cerrar"
                            onclick="abrirModalCerrar(${v.id})">
                        <i class="bi bi-x-circle-fill"></i>
                    </button>
                ` : ''}
                <button class="btn btn-accion btn-accion-eliminar" title="Eliminar"
                        onclick="abrirModalEliminarVacante(${v.id})">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// =====================================================
// VACANTES - FILTROS
// =====================================================
function aplicarFiltros() {
    const estado = document.getElementById('filtro-estado').value;
    let lista = [...vacantes];
    if (estado) lista = lista.filter(v => v.estado === estado);
    renderizarVacantes(lista);
}

async function buscarVacantes() {
    const titulo = document.getElementById('filtro-titulo').value.trim();
    const ubicacion = document.getElementById('filtro-ubicacion').value.trim();

    mostrarLoader(true);
    try {
        let resultado;
        if (titulo && ubicacion) {
            resultado = await VacanteAPI.buscarPorTituloYUbicacion(titulo, ubicacion);
        } else if (titulo) {
            resultado = await VacanteAPI.buscarPorTitulo(titulo);
        } else if (ubicacion) {
            resultado = await VacanteAPI.buscarPorUbicacion(ubicacion);
        } else {
            resultado = vacantes;
        }
        renderizarVacantes(resultado);
    } catch (error) {
        mostrarAlerta('Error al buscar: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

function limpiarFiltros() {
    document.getElementById('filtro-titulo').value = '';
    document.getElementById('filtro-ubicacion').value = '';
    document.getElementById('filtro-estado').value = '';
    renderizarVacantes(vacantes);
}

// =====================================================
// VACANTES - MODAL CREAR
// =====================================================
function abrirModalCrearVacante() {
    document.getElementById('modal-vacante-titulo').textContent = 'Nueva Vacante';
    document.getElementById('form-vacante').reset();
    document.getElementById('vacante-id').value = '';
    document.getElementById('grupo-estado-vacante').style.display = 'none';
    modalVacante.show();
}

// =====================================================
// VACANTES - MODAL EDITAR
// =====================================================
function abrirModalEditarVacante(id) {
    const v = vacantes.find(x => x.id === id);
    if (!v) return;

    document.getElementById('modal-vacante-titulo').textContent = 'Editar Vacante';
    document.getElementById('vacante-id').value = v.id;
    document.getElementById('vacante-titulo').value = v.titulo || '';
    document.getElementById('vacante-descripcion').value = v.descripcion || '';
    document.getElementById('vacante-requisitos').value = v.requisitos || '';
    document.getElementById('vacante-salario').value = v.salario || '';
    document.getElementById('vacante-ubicacion').value = v.ubicacion || '';
    document.getElementById('vacante-estado').value = v.estado || 'ABIERTA';
    document.getElementById('grupo-estado-vacante').style.display = 'block';

    modalVacante.show();
}

// =====================================================
// VACANTES - GUARDAR
// =====================================================
async function guardarVacante() {
    const id = document.getElementById('vacante-id').value;

    const data = {
        titulo: document.getElementById('vacante-titulo').value.trim(),
        descripcion: document.getElementById('vacante-descripcion').value.trim(),
        requisitos: document.getElementById('vacante-requisitos').value.trim() || null,
        salario: document.getElementById('vacante-salario').value || null,
        ubicacion: document.getElementById('vacante-ubicacion').value.trim(),
        estado: document.getElementById('vacante-estado').value || 'ABIERTA',
        reclutadorId: reclutadorId
    };

    mostrarLoader(true);
    try {
        if (id) {
            await VacanteAPI.actualizar(id, data);
            mostrarAlerta('Vacante actualizada correctamente', 'success');
        } else {
            await VacanteAPI.crear(data);
            mostrarAlerta('Vacante creada correctamente', 'success');
        }
        modalVacante.hide();
        await cargarVacantes();
        await cargarDashboard();
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// VACANTES - VER DETALLE
// =====================================================
async function verDetalle(id) {
    mostrarLoader(true);
    try {
        const v = await VacanteAPI.buscarPorId(id);

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
                        <div class="detalle-valor">${v.salario ? '$' + Number(v.salario).toLocaleString('es-CO') : '—'}</div>
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
                        <div class="detalle-label">Reclutador</div>
                        <div class="detalle-valor">${escapeHtml(v.reclutadorNombre || '—')}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="detalle-seccion">
                        <div class="detalle-label">Fecha Publicación</div>
                        <div class="detalle-valor">${formatearFecha(v.fechaPublicacion)}</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="detalle-seccion">
                        <div class="detalle-label">Fecha Cierre</div>
                        <div class="detalle-valor">${formatearFecha(v.fechaCierre)}</div>
                    </div>
                </div>
            </div>
        `;

        modalDetalle.show();
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// VACANTES - MODAL CERRAR
// =====================================================
function abrirModalCerrar(id) {
    const v = vacantes.find(x => x.id === id);
    if (!v) return;
    vacanteACerrar = id;
    document.getElementById('cerrar-vacante-titulo').textContent = v.titulo;
    modalCerrar.show();
}

async function confirmarCerrarVacante() {
    if (!vacanteACerrar) return;
    mostrarLoader(true);
    try {
        await VacanteAPI.cerrar(vacanteACerrar);
        mostrarAlerta('Vacante cerrada correctamente', 'success');
        modalCerrar.hide();
        vacanteACerrar = null;
        await cargarVacantes();
        await cargarDashboard();
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// VACANTES - MODAL ELIMINAR
// =====================================================
function abrirModalEliminarVacante(id) {
    const v = vacantes.find(x => x.id === id);
    if (!v) return;
    vacanteAEliminar = id;
    document.getElementById('eliminar-vacante-titulo').textContent = v.titulo;
    modalEliminar.show();
}

async function confirmarEliminarVacante() {
    if (!vacanteAEliminar) return;
    mostrarLoader(true);
    try {
        await VacanteAPI.eliminar(vacanteAEliminar);
        mostrarAlerta('Vacante eliminada', 'success');
        modalEliminar.hide();
        vacanteAEliminar = null;
        await cargarVacantes();
        await cargarDashboard();
    } catch (error) {
        mostrarAlerta('Error: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

// =====================================================
// POSTULACIONES
// =====================================================
function llenarSelectVacantes() {
    const select = document.getElementById('filtro-vacante-postulaciones');
    select.innerHTML = '<option value="">Todas mis vacantes</option>';
    vacantes.forEach(v => {
        select.innerHTML += `<option value="${v.id}">${escapeHtml(v.titulo)}</option>`;
    });
}

async function cargarPostulaciones() {
    const vacanteId = document.getElementById('filtro-vacante-postulaciones').value;
    const estado = document.getElementById('filtro-estado-postulaciones').value;

    mostrarLoader(true);
    try {
        let lista = [];

        if (vacanteId) {
            if (estado) {
                lista = await PostulacionAPI.listarPorVacanteYEstado(vacanteId, estado);
            } else {
                lista = await PostulacionAPI.listarPorVacante(vacanteId);
            }
        } else {
            // Cargar todas las postulaciones de todas las vacantes
            const todas = await VacanteAPI.listarTodas();
            for (const v of todas) {
                try {
                    const posts = await PostulacionAPI.listarPorVacante(v.id);
                    lista.push(...posts);
                } catch (e) { /* ignorar */ }
            }
            if (estado) lista = lista.filter(p => p.estado === estado);
        }

        renderizarPostulaciones(lista);
    } catch (error) {
        mostrarAlerta('Error al cargar postulaciones: ' + error.message, 'danger');
    } finally {
        mostrarLoader(false);
    }
}

function renderizarPostulaciones(lista) {
    const tbody = document.getElementById('tabla-postulaciones');

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="bi bi-inbox"></i>
                        <p>No hay postulaciones.</p>
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
            <td>${escapeHtml(p.postulanteNombre || '—')}</td>
            <td>${escapeHtml(p.postulanteEmail || '—')}</td>
            <td><span class="badge-estado badge-${p.estado}">${p.estado}</span></td>
            <td>${formatearFecha(p.fechaPostulacion)}</td>
            <td class="text-center">
                <button class="btn btn-accion btn-accion-editar" title="Cambiar estado"
                        onclick="abrirModalEstado(${p.id}, '${escapeHtml(p.postulanteNombre)}', '${p.estado}')">
                    <i class="bi bi-pencil-fill"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// =====================================================
// POSTULACIONES - VER DESDE VACANTE
// =====================================================
function verPostulacionesDeVacante(vacanteId) {
    cambiarSeccion('postulaciones');
    setTimeout(() => {
        document.getElementById('filtro-vacante-postulaciones').value = vacanteId;
        cargarPostulaciones();
    }, 100);
}

// =====================================================
// POSTULACIONES - MODAL ESTADO
// =====================================================
function abrirModalEstado(id, nombre, estadoActual) {
    postulacionAEstado = id;
    document.getElementById('postulacion-id-estado').value = id;
    document.getElementById('postulacion-nombre-estado').textContent = nombre;
    document.getElementById('select-nuevo-estado').value = estadoActual;
    modalEstado.show();
}

async function guardarEstadoPostulacion() {
    const id = document.getElementById('postulacion-id-estado').value;
    const nuevoEstado = document.getElementById('select-nuevo-estado').value;

    if (!id || !nuevoEstado) return;

    mostrarLoader(true);
    try {
        await PostulacionAPI.actualizarEstado(id, nuevoEstado);
        mostrarAlerta('Estado actualizado correctamente', 'success');
        modalEstado.hide();
        postulacionAEstado = null;
        await cargarPostulaciones();
        await cargarDashboard();
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