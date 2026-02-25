/**
 * Controlador de Favoritos.
 * Gestiona agregar, obtener y eliminar destinos favoritos del usuario.
 */

const db = require('../config/db');

/**
 * Obtiene todos los favoritos del usuario autenticado.
 * Hace JOIN con destinations para devolver los datos completos del destino.
 */
exports.getFavorites = async (req, res) => {
    const userId = req.user.userId;

    try {
        const [favorites] = await db.execute(
            `SELECT d.*
             FROM favorites f
             JOIN destinations d ON f.destination_id = d.id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC`,
            [userId]
        );
        res.json(favorites);
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({ message: 'Error al obtener favoritos' });
    }
};

/**
 * Obtiene solo los IDs de favoritos del usuario autenticado.
 */
exports.getFavoriteIds = async (req, res) => {
    const userId = req.user.userId;

    try {
        const [rows] = await db.execute(
            'SELECT destination_id FROM favorites WHERE user_id = ?',
            [userId]
        );
        const ids = rows.map(r => r.destination_id);
        res.json(ids);
    } catch (error) {
        console.error('Error al obtener IDs de favoritos:', error);
        res.status(500).json({ message: 'Error al obtener favoritos' });
    }
};

/**
 * Agrega un destino a los favoritos del usuario.
 * Si ya existe el favorito, ignora la inserción (IGNORE).
 */
exports.addFavorite = async (req, res) => {
    const userId = req.user.userId;
    const { destinationId } = req.body;

    if (!destinationId) {
        return res.status(400).json({ message: 'destinationId es requerido' });
    }

    try {
        await db.execute(
            'INSERT IGNORE INTO favorites (user_id, destination_id) VALUES (?, ?)',
            [userId, destinationId]
        );
        res.status(201).json({ message: 'Agregado a favoritos' });
    } catch (error) {
        console.error('Error al agregar favorito:', error);
        res.status(500).json({ message: 'Error al agregar favorito' });
    }
};

/**
 * Elimina un destino de los favoritos del usuario.
 */
exports.removeFavorite = async (req, res) => {
    const userId = req.user.userId;
    const { destinationId } = req.params;

    try {
        const [result] = await db.execute(
            'DELETE FROM favorites WHERE user_id = ? AND destination_id = ?',
            [userId, destinationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Favorito no encontrado' });
        }

        res.json({ message: 'Eliminado de favoritos' });
    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        res.status(500).json({ message: 'Error al eliminar favorito' });
    }
};
