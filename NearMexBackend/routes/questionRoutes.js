const express = require('express');
const { getQuestions, createQuestion, deleteQuestion, deleteQuestionAdmin, getUserQuestions } = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/user', authMiddleware, getUserQuestions);
router.get('/:destinationId', getQuestions);
router.post('/', authMiddleware, createQuestion);
router.delete('/:id', authMiddleware, deleteQuestion);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteQuestionAdmin);

module.exports = router;
