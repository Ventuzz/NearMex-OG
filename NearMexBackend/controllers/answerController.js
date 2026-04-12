/**
 * Controlador de Respuestas.
 */
const db = require('../config/db');
const { sendQuestionAnsweredEmail, sendAnswerDeletionEmail } = require('../services/emailService');

exports.getAnswers = async (req, res) => {
    const { questionId } = req.params;
    try {
        const [answers] = await db.execute(
            `SELECT a.*, u.username, u.avatar 
             FROM answers a 
             JOIN users u ON a.user_id = u.id 
             WHERE a.question_id = ? AND a.is_visible = TRUE
             ORDER BY a.created_at ASC`,
            [questionId]
        );
        res.json(answers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener respuestas' });
    }
};

exports.createAnswer = async (req, res) => {
    const { questionId, content } = req.body;
    const userId = req.user.userId;
    try {
        // Verificar que el usuario no esté respondiendo a su propia pregunta
        const [qOwner] = await db.execute(`SELECT user_id FROM questions WHERE id = ?`, [questionId]);
        if (qOwner.length > 0 && qOwner[0].user_id === userId) {
            return res.status(400).json({ message: 'No puedes responder a tu propia pregunta' });
        }

        await db.execute(
            'INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)',
            [questionId, userId, content]
        );

        // Get question info to send email
        const [qInfo] = await db.execute(
            `SELECT q.content as question_content, q.user_id as question_user_id, u.email as question_user_email, u.username as question_username, d.name as destination_name
             FROM questions q
             JOIN users u ON q.user_id = u.id
             JOIN destinations d ON q.destination_id = d.id
             WHERE q.id = ?`,
            [questionId]
        );

        const [uInfo] = await db.execute(`SELECT username FROM users WHERE id = ?`, [userId]);

        if (qInfo.length > 0 && uInfo.length > 0) {
            const q = qInfo[0];
            // Don't send email if the answerer is the questioner
            if (q.question_user_email && userId !== q.question_user_id) {
                 sendQuestionAnsweredEmail(q.question_user_email, q.question_username, q.destination_name, q.question_content, uInfo[0].username);
            }
        }

        res.status(201).json({ message: 'Respuesta agregada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear respuesta' });
    }
};

exports.deleteAnswer = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
        const [result] = await db.execute(
            'UPDATE answers SET is_visible = FALSE WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Respuesta no encontrada o no autorizada' });
        res.json({ message: 'Respuesta eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar respuesta' });
    }
};

exports.deleteAnswerAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const [info] = await db.execute(
            `SELECT u.email, u.username, d.name AS destination_name 
             FROM answers a
             JOIN users u ON a.user_id = u.id
             JOIN questions q ON a.question_id = q.id
             JOIN destinations d ON q.destination_id = d.id
             WHERE a.id = ?`,
            [id]
        );
        if (info.length === 0) return res.status(404).json({ message: 'Respuesta no encontrada' });
        
        await db.execute('UPDATE answers SET is_visible = FALSE WHERE id = ?', [id]);
        sendAnswerDeletionEmail(info[0].email, info[0].username, info[0].destination_name);
        res.json({ message: 'Respuesta eliminada por admin' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar respuesta (admin)' });
    }
};

exports.getUserAnswers = async (req, res) => {
    const userId = req.user.userId;
    try {
        const [answers] = await db.execute(
            `SELECT a.*, q.content AS question_content, d.name AS destination_name, d.id AS destination_id 
             FROM answers a 
             JOIN questions q ON a.question_id = q.id 
             JOIN destinations d ON q.destination_id = d.id 
             WHERE a.user_id = ? AND a.is_visible = TRUE AND q.is_visible = TRUE
             ORDER BY a.created_at DESC`,
            [userId]
        );
        res.json(answers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener respuestas del usuario' });
    }
};
