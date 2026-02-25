const express = require('express');
const { getFavorites, getFavoriteIds, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Todas las rutas de favoritos requieren autenticación
router.get('/', authMiddleware, getFavorites);
router.get('/ids', authMiddleware, getFavoriteIds);
router.post('/', authMiddleware, addFavorite);
router.delete('/:destinationId', authMiddleware, removeFavorite);

module.exports = router;
