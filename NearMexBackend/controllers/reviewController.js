/**
 * Controlador de Reseñas.
 * Gestiona la creación, lectura, actualización y eliminación de reseñas.
 */

const db = require('../config/db');

/**
 * Obtiene todas las reseñas de un destino específico.
 * Realiza un JOIN con la tabla de usuarios para obtener el nombre del usuario.
 */
exports.getReviews = async (req, res) => {
    const { destinationId } = req.params;

    try {
        const [reviews] = await db.execute(
            `SELECT r.*, u.username, u.avatar 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.destination_id = ? 
             ORDER BY r.created_at DESC`,
            [destinationId]
        );
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener reseñas' });
    }
};

/**
 * Obtiene todas las reseñas creadas por un usuario específico (el autenticado).
 * Incluye también la información de qué destino es.
 */
exports.getUserReviews = async (req, res) => {
    const userId = req.user.userId;

    try {
        const [reviews] = await db.execute(
            `SELECT r.*, d.name as destination_name
             FROM reviews r 
             JOIN destinations d ON r.destination_id = d.id
             WHERE r.user_id = ? 
             ORDER BY r.created_at DESC`,
            [userId]
        );
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener reseñas del usuario' });
    }
};

/**
 * Crea una nueva reseña para un destino.
 */
exports.createReview = async (req, res) => {
    const { destinationId, rating, comment } = req.body;
    const userId = req.user.userId;

    try {
        await db.execute(
            'INSERT INTO reviews (user_id, destination_id, rating, comment) VALUES (?, ?, ?, ?)',
            [userId, destinationId, rating, comment]
        );
        res.status(201).json({ message: 'Reseña agregada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear reseña' });
    }
};

/**
 * Actualiza una reseña existente.
 * Verifica que la reseña pertenezca al usuario que intenta modificarla.
 */
exports.updateReview = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    try {
        const [result] = await db.execute(
            'UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?',
            [rating, comment, id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reseña no encontrada o no autorizada' });
        }

        res.json({ message: 'Reseña actualizada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar reseña' });
    }
};

/**
 * Elimina una reseña existente.
 * Verifica que la reseña pertenezca al usuario que intenta eliminarla.
 */
exports.deleteReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const [result] = await db.execute(
            'DELETE FROM reviews WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reseña no encontrada o no autorizada' });
        }

        res.json({ message: 'Reseña eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar reseña' });
    }
};

/**
 * Elimina cualquier reseña existente (Solo Admin).
 */
exports.deleteReviewAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute(
            'DELETE FROM reviews WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }

        res.json({ message: 'Reseña eliminada exitosamente por el administrador' });
    } catch (error) {
        console.error("Error al eliminar reseña (admin):", error);
        res.status(500).json({ message: 'Error al eliminar reseña' });
    }
};
