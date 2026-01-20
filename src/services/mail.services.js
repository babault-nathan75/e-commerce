import nodemailer from "nodemailer";
import path from "path";

// --- CONFIGURATION DU TRANSPORTEUR TACTIQUE ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // TLS pour le port 465, false pour 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Optimisation pour éviter les timeouts sur les gros fichiers PDF
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

/**
 * PROTOCOLE : Transmission d'Ordre Client
 * Envoie la confirmation de commande avec la facture jointe.
 */
export async function sendOrderMail({ to, subject, html, pdfPath }) {
  // Construction du chemin absolu pour l'environnement Node (Fix pour Vercel/Ubuntu)
  const absolutePath = path.join(process.cwd(), "public", pdfPath);

  const mailOptions = {
    from: `"HEBRON OPS - NOTIFICATION" <${process.env.SMTP_USER}>`,
    to,
    subject: `[ORDRE CONFIRMÉ] - ${subject}`,
    html: `
      <div style="font-family: 'Helvetica', sans-serif; background: #f4f4f4; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #232f3e; padding: 20px; text-align: center; border-bottom: 4px solid #f97316;">
             <h1 style="color: #ffffff; text-transform: uppercase; font-size: 18px; letter-spacing: 2px; margin: 0;">Transmission de Données Hebron</h1>
          </div>
          <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
            ${html}
          </div>
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
              Document de Facturation n°${pdfPath.split('-').pop().split('.')[0]} / Sécurisé par Hebron Ivoire
            </p>
          </div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `facture-hebron-${Date.now()}.pdf`,
        path: absolutePath,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    console.log(`[MAIL SYSTEM] : Tentative de transmission vers ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAIL SYSTEM] : Ordre transmis avec succès. ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[MAIL SYSTEM] ERROR : Échec de la transmission.`, error);
    return { success: false, error: error.message };
  }
}