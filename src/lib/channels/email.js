import nodemailer from "nodemailer";

// --- CONFIGURATION DE LA PASSERELLE SMTP HEBRON ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true pour 465, false pour 587/STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // PROTOCOLE DE PERFORMANCE : Réutilisation des connexions
  pool: true, 
  maxConnections: 3,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5 
});

/**
 * TRANSMISSION : Module de Notification Multi-Canal
 * Envoie des données sécurisées vers les opérateurs ou clients.
 */
export async function sendEmail({ to, subject, html, attachments = [] }) {
  console.log(`[MAIL PROTOCOL] : Initialisation de la transmission vers ${to}...`);

  const mailOptions = {
    from: `"HEBRON IVOIRE - NOTIFICATION" <${process.env.SMTP_USER}>`,
    to,
    subject: `[SYSTEM] ${subject}`,
    html: `
      <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: #232f3e; padding: 20px; text-align: center; border-bottom: 4px solid #f97316;">
          <h2 style="color: white; margin: 0; text-transform: uppercase; letter-spacing: 2px; font-size: 16px;">Hebron Terminal</h2>
        </div>
        <div style="padding: 30px; color: #1e293b; background: #ffffff;">
          ${html}
        </div>
        <div style="background: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
            ID Transmission : ${Date.now()} | Sécurisé par le protocole Hebron
          </p>
        </div>
      </div>
    `,
    attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAIL PROTOCOL] : Succès. Message-ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[CRITICAL ERROR] : Échec de la passerelle SMTP.`, {
      target: to,
      error: error.message
    });
    return { success: false, error: error.message };
  }
}