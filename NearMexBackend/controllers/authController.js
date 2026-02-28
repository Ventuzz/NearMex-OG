const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');

/**
 * Controlador de Autenticación.
 * Maneja el registro e inicio de sesión de usuarios.
 */

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El usuario o correo ya existe' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insertar usuario en la base de datos
        await db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

/**
 * Inicia sesión de un usuario existente.
 * Verifica email y contraseña.
 * Genera y devuelve un token JWT si las credenciales son correctas.
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por email
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];
        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token JWT con vigencia de 7 días
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, userId: user.id, username: user.username, role: user.role, avatar: user.avatar, address: user.address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

/**
 * Obtiene el perfil completo del usuario autenticado (incluye bio).
 */
exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, username, email, bio, role, avatar, address, created_at FROM users WHERE id = ?', [req.user.userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
};

/**
 * Actualiza la biografía del usuario.
 */
exports.updateProfile = async (req, res) => {
    const { bio, avatar, address } = req.body;
    try {
        await db.execute('UPDATE users SET bio = ?, avatar = ?, address = ? WHERE id = ?', [bio, avatar, address, req.user.userId]);
        res.json({ message: 'Perfil actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
};

/**
 * Solicita restablecer la contraseña.
 * Genera un token, lo guarda en la BD con expiración y envía el correo.
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const [users] = await db.execute('SELECT id, username FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // No revelamos si el correo existe o no por seguridad
            return res.json({ message: 'Si el correo existe en nuestra base de datos, recibirás un enlace de recuperación pronto.' });
        }

        const user = users[0];

        // Crear token aleatorio de 32 bytes (64 caracteres hex)
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Expiración en 1 hora
        const expireDate = new Date(Date.now() + 3600000); // 1 hora
        // Formatear a datetime de MySQL: YYYY-MM-DD HH:MM:SS
        const formattedDate = expireDate.toISOString().slice(0, 19).replace('T', ' ');

        await db.execute(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [resetToken, formattedDate, user.id]
        );

        // Crear la URL que el usuario clickeará
        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

        // Enviar el correo electrónico
        const { sendPasswordResetEmail } = require('../services/emailService');
        sendPasswordResetEmail(email, user.username, resetUrl);

        res.json({ message: 'Si el correo existe en nuestra base de datos, recibirás un enlace de recuperación pronto.' });
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ message: 'Error en el servidor al procesar la solicitud.' });
    }
};

/**
 * Restablece la contraseña usando el token.
 */
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Buscar al usuario que tenga este token y que no haya expirado
        const [users] = await db.execute(
            'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'El enlace es inválido o ha expirado.' });
        }

        const user = users[0];

        // Encriptar la nueva contraseña
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Actualizar contraseña y limpiar el token y expiración
        await db.execute(
            'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
    } catch (error) {
        console.error("Error en resetPassword:", error);
        res.status(500).json({ message: 'Error en el servidor al intentar cambiar la contraseña.' });
    }
};
