/**
 * auth.js
 * Lógica de login y registro de postulantes.
 */

document.addEventListener('DOMContentLoaded', () => {

    const formLogin = document.getElementById('form-login');
    const formRegistro = document.getElementById('form-registro');

    // =====================================================
    // LOGIN
    // =====================================================
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const btn = document.getElementById('btn-login');

            // Deshabilitar botón para evitar doble clic
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Ingresando...';

            try {
                // 1. Hacer login
                const response = await AuthAPI.login(email, password);

                // 2. Guardar sesión
                Session.guardarSesion(response);

                // 3. Redirigir según el rol
                if (response.rol === 'ADMIN') {
                    window.location.href = 'admin/admin.html';
                } else if (response.rol === 'RECLUTADOR') {
                    window.location.href = 'reclutador/reclutador.html';
                } else if (response.rol === 'POSTULANTE') {
                    window.location.href = 'postulante/postulante.html';
                } else {
                    throw new Error('Rol no reconocido');
                }

            } catch (error) {
                mostrarAlertaLogin(error.message || 'Credenciales inválidas', 'danger');
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Ingresar';
            }
        });
    }

    // =====================================================
    // REGISTRO
    // =====================================================
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                nombreCompleto: document.getElementById('reg-nombre').value.trim(),
                email: document.getElementById('reg-email').value.trim(),
                password: document.getElementById('reg-password').value,
                telefono: document.getElementById('reg-telefono').value.trim() || null,
                direccion: document.getElementById('reg-direccion').value.trim() || null
            };

            const btn = document.getElementById('btn-registro');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Creando cuenta...';

            try {
                // 1. Registrar el postulante
                await AuthAPI.register(data);
                
                mostrarAlertaLogin('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.', 'success');
                
                // 2. Limpiar formulario
                formRegistro.reset();

                // 3. Cambiar a la pestaña de login después de 2 segundos
                setTimeout(() => {
                    const tabLogin = document.getElementById('tab-login');
                    if (tabLogin) new bootstrap.Tab(tabLogin).show();
                }, 2000);

            } catch (error) {
                mostrarAlertaLogin(error.message || 'Error al crear la cuenta', 'danger');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-person-check me-1"></i> Crear Cuenta';
            }
        });
    }

});

// =====================================================
// FUNCIÓN DE ALERTAS
// =====================================================
function mostrarAlertaLogin(mensaje, tipo = 'info') {
    const container = document.getElementById('alertas-container');
    if (!container) {
        alert(mensaje);
        return;
    }

    const id = 'alerta-' + Date.now();
    const html = `
        <div class="alert alert-${tipo} alert-dismissible fade show alert-flotante" role="alert" id="${id}">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.remove();
    }, 5000);
}