import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Instancia de Axios pre-configurada para realizar peticiones al backend.
 * Define la URL base de la API.
 */
const api = axios.create({
    baseURL: API_URL,
});

/**
 * Interceptor de peticiones.
 * Añade automáticamente el token de autenticación (JWT) al header 'Authorization'
 * de cada petición saliente si existe un token guardado en localStorage.
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
