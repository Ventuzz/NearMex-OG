const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: true, // true para port 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Envia un correo electrónico notificando a un usuario que su reseña ha sido eliminada por un administrador.
 * 
 * @param {string} toEmail - El correo electrónico del usuario.
 * @param {string} username - El nombre del usuario.
 * @param {string} destinationName - El nombre del destino donde se encontraba la reseña.
 */
exports.sendReviewDeletionEmail = async (toEmail, username, destinationName) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("ADVERTENCIA: Credenciales SMTP no configuradas. El correo no se enviará.");
            return;
        }

        const mailOptions = {
            from: `"Avisos NearMex" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Notificación: Una de tus reseñas ha sido eliminada',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #660000;">Hola ${username},</h2>
                    <p>Te informamos que un administrador de <strong>NearMex</strong> ha retirado tu reseña sobre el destino <strong>${destinationName}</strong>.</p>
                    <p>Esto puede suceder si el contenido incumple nuestros lineamientos o debido a razones de moderación interna.</p>
                    <br>
                    <p>Si tienes alguna duda o crees que esto fue un error, puedes ponerte en contacto con nosotros.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">Este es un mensaje automático, por favor no respondas a este correo.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo enviado exitosamente a ${toEmail}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("Error al enviar correo de notificación:", error);
    }
};

/**
 * Envia un correo electrónico con un enlace para recuperar la contraseña.
 * 
 * @param {string} toEmail - El correo electrónico del usuario.
 * @param {string} username - El nombre del usuario.
 * @param {string} resetUrl - La URL única con el token para resetear la contraseña.
 */
exports.sendPasswordResetEmail = async (toEmail, username, resetUrl) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("ADVERTENCIA: Credenciales SMTP no configuradas. El correo de recuperación no se enviará.");
            return;
        }

        const mailOptions = {
            from: `"Soporte NearMex" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Recuperación de Contraseña - NearMex',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #660000;">Hola ${username},</h2>
                    <p>Has solicitado restablecer tu contraseña para tu cuenta en <strong>NearMex</strong>.</p>
                    <p>Haz clic en el siguiente enlace, o cópialo y pégalo en tu navegador, para crear una nueva contraseña:</p>
                    <div style="margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #660000; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi Contraseña</a>
                    </div>
                    <p style="font-size: 14px;">Este enlace expirará en 1 hora.</p>
                    <p style="font-size: 14px;">Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña no cambiará hasta que accedas al enlace y crees una nueva.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">Esto es un mensaje automático, por favor no respondas a este correo.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo de recuperación enviado a ${toEmail}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("Error al enviar correo de recuperación:", error);
    }
};

/**
 * Envia un correo electrónico de bienvenida a un usuario recién registrado.
 * 
 * @param {string} toEmail - El correo electrónico del usuario.
 * @param {string} username - El nombre del usuario.
 */
exports.sendWelcomeEmail = async (toEmail, username) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("ADVERTENCIA: Credenciales SMTP no configuradas. El correo de bienvenida no se enviará.");
            return;
        }

        const mailOptions = {
            from: `"Equipo NearMex" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: '¡Bienvenido a NearMex!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #660000; text-align: center;">¡Hola ${username}, bienvenido a NearMex!</h2>
                    <p style="font-size: 16px;">Estamos muy contentos de que te hayas unido a nuestra comunidad. NearMex es la plataforma ideal para descubrir, guardar y reseñar tus destinos favoritos.</p>
                    <p style="font-size: 16px;">Aquí tienes algunas cosas que puedes hacer ahora mismo:</p>
                    <ul style="font-size: 16px; color: #555;">
                        <li><strong>Explorar el Catálogo:</strong> Descubre nuevos lugares y maravillas por visitar.</li>
                        <li><strong>Crear tu Biblioteca:</strong> Guarda destinos en tus favoritos para tu próximo viaje.</li>
                        <li><strong>Compartir tu Experiencia:</strong> Escribe reseñas para calificar los lugares en los que ya has estado.</li>
                        <li><strong>Personalizar tu Perfil:</strong> Agrega tu biografía y foto de perfil.</li>
                    </ul>
                    <br>
                    <p style="font-size: 14px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en ponerte en contacto con nosotros.</p>
                    <p style="font-size: 14px;">¡Que tengas un excelente viaje!</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">Has recibido este correo porque te registraste en NearMex. Por favor no respondas a este mensaje automático.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo de bienvenida enviado a ${toEmail}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("Error al enviar correo de bienvenida:", error);
    }
};
