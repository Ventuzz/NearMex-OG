const express = require('express');
const { getDestinations, getDestinationById, createDestination, updateDestination, deleteDestination } = require('../controllers/destinationController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/', getDestinations);
router.get('/:id', getDestinationById);

// Rutas protegidas para administradores
router.post('/', authMiddleware, adminMiddleware, createDestination);
router.put('/:id', authMiddleware, adminMiddleware, updateDestination);
router.delete('/:id', authMiddleware, adminMiddleware, deleteDestination);

module.exports = router;
