const express = require('express');
const { getAnswers, createAnswer, deleteAnswer, deleteAnswerAdmin, getUserAnswers } = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/user', authMiddleware, getUserAnswers);
router.get('/:questionId', getAnswers);
router.post('/', authMiddleware, createAnswer);
router.delete('/:id', authMiddleware, deleteAnswer);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteAnswerAdmin);

module.exports = router;
