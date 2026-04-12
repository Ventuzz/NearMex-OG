/**
 * Controlador de Preguntas.
 */
const db = require('../config/db');
const { sendQuestionDeletionEmail, sendQuestionDeletedToAnswerersEmail } = require('../services/emailService');

exports.getQuestions = async (req, res) => {
    const { destinationId } = req.params;
    try {
        const [questions] = await db.execute(
            `SELECT q.*, u.username, u.avatar 
             FROM questions q 
             JOIN users u ON q.user_id = u.id 
             WHERE q.destination_id = ? AND q.is_visible = TRUE
             ORDER BY q.created_at DESC`,
            [destinationId]
        );
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener preguntas' });
    }
};

exports.createQuestion = async (req, res) => {
    const { destinationId, content } = req.body;
    const userId = req.user.userId;
    try {
        await db.execute(
            'INSERT INTO questions (user_id, destination_id, content) VALUES (?, ?, ?)',
            [userId, destinationId, content]
        );
        res.status(201).json({ message: 'Pregunta agregada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear pregunta' });
    }
};

exports.deleteQuestion = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
        const [result] = await db.execute(
            'UPDATE questions SET is_visible = FALSE WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Pregunta no encontrada o no autorizada' });
        res.json({ message: 'Pregunta eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar pregunta' });
    }
};

exports.deleteQuestionAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const [info] = await db.execute(
            `SELECT u.email, u.username, d.name AS destination_name 
             FROM questions q
             JOIN users u ON q.user_id = u.id
             JOIN destinations d ON q.destination_id = d.id
             WHERE q.id = ?`,
            [id]
        );
        if (info.length === 0) return res.status(404).json({ message: 'Pregunta no encontrada' });
        
        // Find answerers before deleting the question
        const [answerers] = await db.execute(
            `SELECT DISTINCT u.email, u.username 
             FROM answers a 
             JOIN users u ON a.user_id = u.id 
             WHERE a.question_id = ? AND a.is_visible = TRUE`,
            [id]
        );

        await db.execute('UPDATE questions SET is_visible = FALSE WHERE id = ?', [id]);
        
        sendQuestionDeletionEmail(info[0].email, info[0].username, info[0].destination_name);

        answerers.forEach(answerer => {
            // Avoid sending redundant email to the question owner if they answered their own question somehow (even though it's blocked now)
            if (answerer.email !== info[0].email) {
                sendQuestionDeletedToAnswerersEmail(answerer.email, answerer.username, info[0].destination_name);
            }
        });

        res.json({ message: 'Pregunta eliminada por admin' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar pregunta (admin)' });
    }
};

exports.getUserQuestions = async (req, res) => {
    const userId = req.user.userId;
    try {
        const [questions] = await db.execute(
            `SELECT q.*, d.name AS destination_name 
             FROM questions q 
             JOIN destinations d ON q.destination_id = d.id 
             WHERE q.user_id = ? AND q.is_visible = TRUE
             ORDER BY q.created_at DESC`,
            [userId]
        );
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener preguntas del usuario' });
    }
};
