import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

/**
 * Proveedor de Contexto de Autenticación.
 * Gestiona el estado global del usuario y proporciona funciones de autenticación
 * a toda la aplicación.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Efecto para verificar si hay una sesión activa al cargar la aplicación y refrescar datos
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (token && userData) {
                // Carga inicial rápida desde caché local
                setUser(JSON.parse(userData));

                // Sincronización silenciosa en segundo plano
                try {
                    const response = await api.get('/auth/profile');
                    const freshUser = {
                        userId: response.data.id,
                        username: response.data.username,
                        role: response.data.role,
                        avatar: response.data.avatar,
                        address: response.data.address
                    };
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                } catch (error) {
                    console.error("Error al sincronizar el perfil con el servidor:", error);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    /**
     * Inicia sesión en la aplicación.
     * Envía credenciales al backend y guarda el token y datos de usuario si es exitoso.
     */
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, userId, username, role, avatar, address } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ userId, username, role, avatar, address }));
            setUser({ userId, username, role, avatar, address });
            return { success: true, role };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión' };
        }
    };

    /**
     * Registra un nuevo usuario.
     */
    const register = async (username, email, password) => {
        try {
            await api.post('/auth/register', { username, email, password });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error al registrarse' };
        }
    };

    /**
     * Cierra la sesión actual.
     * Elimina el token y datos de usuario del almacenamiento local y resetea el estado.
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
