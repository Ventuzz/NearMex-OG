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
            from: `"Avisos NearMex" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
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
