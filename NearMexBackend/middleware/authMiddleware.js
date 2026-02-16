const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Middleware de Autenticación.
 * Verifica si la petición tiene un token JWT válido en el header 'Authorization'.
 * Si es válido, añade el usuario decodificado a req.user y permite continuar.
 * Si no, devuelve un error 401 (No autorizado).
 */
module.exports = (req, res, next) => {
    // Obtener el token del header
    const token = req.header('Authorization');

    // Verificar si no hay token
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado, no hay token' });
    }

    try {
        // Verificar el token (quitando el prefijo 'Bearer ')
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

        // Añadir el usuario decodificado a la petición
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};
