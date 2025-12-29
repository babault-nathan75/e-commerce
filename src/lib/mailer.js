import nodemailer from "nodemailer";

function hasSMTP() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

export function buildOrderText(order) {
  const lines = [];
  lines.push(`Commande: ${order.orderCode}`);
  lines.push(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  lines.push(`Statut: ${order.status}`);
  lines.push("");
  lines.push("Articles:");
  order.items.forEach((it) => {
    lines.push(`- ${it.name} | ${it.quantity} x ${it.price} = ${it.quantity * it.price}`);
  });
  lines.push("");
  lines.push(`Total articles: ${order.totalItems}`);
  lines.push(`Total: ${order.totalPrice}`);
  lines.push("");
  lines.push("Client:");
  lines.push(`Nom: ${order.customerName}`);
  lines.push(`Email: ${order.customerEmail}`);
  lines.push(`Contact: ${order.customerPhone}`);
  lines.push(`Adresse livraison: ${order.deliveryAddress}`);
  return lines.join("\n");
}

export async function sendMail({ to, cc, bcc, subject, text }) {
  if (!hasSMTP()) {
    console.log("------ EMAIL (fallback dev) ------");
    console.log("TO:", to);
    if (cc) console.log("CC:", cc);
    if (bcc) console.log("BCC:", bcc);
    console.log("SUBJECT:", subject);
    console.log(text);
    console.log("------ END EMAIL ------");
    return { ok: true, fallback: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    cc,
    bcc,
    subject,
    text
  });

  return { ok: true };
}