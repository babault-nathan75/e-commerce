import PDFDocument from "pdfkit";

export async function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    try {
      if (!order || !order.items || order.items.length === 0) {
        throw new Error("Commande invalide pour génération PDF");
      }

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", (b) => buffers.push(b));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      /* ===== HEADER ===== */
      doc
        .fontSize(20)
        .text("FACTURE - MY-ECOMMERCE", { align: "center" })
        .moveDown(2);

      /* ===== INFOS COMMANDE ===== */
      doc.fontSize(11);
      doc.text(`Commande : ${order.orderCode}`);
      doc.text(`Date : ${new Date(order.createdAt).toLocaleString()}`);
      doc.text(`Statut : ${order.status}`);
      doc.moveDown();

      /* ===== CLIENT ===== */
      doc.fontSize(13).text("Informations client", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(11);
      doc.text(`Nom : ${order.customerName || "—"}`);
      doc.text(`Email : ${order.customerEmail || "—"}`);
      doc.text(`Téléphone : ${order.customerPhone || "—"}`);
      doc.text(`Adresse : ${order.deliveryAddress || "—"}`);
      doc.moveDown(1.5);

      /* ===== ARTICLES ===== */
      doc.fontSize(13).text("Détail de la commande", { underline: true });
      doc.moveDown();

      order.items.forEach((item, index) => {
  doc
    .fontSize(11)
    .text(`${index + 1}. ${item.name}`, { bold: true })
    .text(`   Quantité : ${item.quantity}`)
    .text(`   Prix unitaire : ${item.price.toLocaleString()} FCFA`)
    .text(`   Sous-total : ${(item.quantity * item.price).toLocaleString()} FCFA`);
  doc.moveDown();
});


      /* ===== TOTAL ===== */
      doc.moveDown();
      doc.fontSize(14).text(
        `TOTAL À PAYER : ${order.totalPrice} FCFA`,
        { align: "right" }
      );

      /* ===== FOOTER ===== */
      doc.moveDown(2);
      doc
        .fontSize(10)
        .text(
          "Merci pour votre commande sur my-ecommerce.",
          { align: "center", italic: true }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
