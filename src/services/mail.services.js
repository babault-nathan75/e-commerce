import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendOrderMail({ to, subject, html, pdfPath }) {
  return transporter.sendMail({
    from: `"my-ecommerce" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: "facture.pdf",
        path: `public${pdfPath}`
      }
    ]
  });
}
