const express = require('express');
const { getDestinations, getDestinationById } = require('../controllers/destinationController');
const router = express.Router();

router.get('/', getDestinations);
router.get('/:id', getDestinationById);

module.exports = router;
