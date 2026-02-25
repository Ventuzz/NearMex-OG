/**
 * Middleware para verificar si el usuario es administrador.
 * Asume que req.user ya ha sido poblado por authMiddleware con el JWT decodificado.
 */
module.exports = (req, res, next) => {
    // Verificar que req.user exista y que tenga el rol de 'admin'
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso denegado: Se requieren permisos de administrador' });
    }
};
