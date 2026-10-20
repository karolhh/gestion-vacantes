/**
 * request.js
 * Wrapper para hacer peticiones HTTP al backend Spring Boot.
 * Maneja automáticamente el token JWT almacenado en localStorage.
 */

const API_BASE_URL = 'http://localhost:9098';

async function request(endpoint, method = 'GET', body = null, headers = {}) {

    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    const token = localStorage.getItem('token');
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const finalHeaders = { ...defaultHeaders, ...headers };

    const options = {
        method: method,
        headers: finalHeaders
    };

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);

        if (response.status === 204) {
            return null;
        }

        let data = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const error = new Error(data?.mensaje || data?.error || `Error ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;

    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('No se pudo conectar con el servidor. Verifique que el backend esté corriendo.');
        }
        throw error;
    }
}

async function requestUpload(endpoint, formData, method = 'POST') {

    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: formData
    });

    if (response.status === 204) {
        return null;
    }

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const error = new Error(data?.mensaje || data?.error || `Error ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}