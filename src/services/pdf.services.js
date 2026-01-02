import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateOrderPDF(order) {
  const dir = path.join(process.cwd(), "public/invoices");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `order-${order.orderCode}.pdf`);
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("Facture de commande", { align: "center" });
  doc.moveDown();

  doc.text(`Code: ${order.orderCode}`);
  doc.text(`Client: ${order.guest?.email || order.userEmail}`);
  doc.text(`Total: ${order.totalPrice} FCFA`);
  doc.moveDown();

  order.items.forEach(i => {
    doc.text(`${i.name} x${i.quantity} — ${i.price} FCFA`);
  });

  doc.end();

  return `/invoices/order-${order.orderCode}.pdf`;
}
