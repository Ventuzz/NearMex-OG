const express = require('express');
const { getReviews, getUserReviews, createReview, updateReview, deleteReview, deleteReviewAdmin } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

// Rutas específicas primero para evitar conflictos de parámetros
router.get('/user', authMiddleware, getUserReviews);
router.get('/:destinationId', getReviews);
router.post('/', authMiddleware, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

// Ruta para administradores (eliminar cualquier reseña)
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteReviewAdmin);

module.exports = router;
