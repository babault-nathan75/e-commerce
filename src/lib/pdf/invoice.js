import PDFDocument from "pdfkit";
import path from "path";

export async function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    try {
      // Configuration des chemins vers les polices dans le dossier public
      const fontRegular = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");
      const fontBold = path.join(process.cwd(), "public", "fonts", "Roboto-Bold.ttf");

      const doc = new PDFDocument({ 
        size: "A4", 
        margin: 50,
        // On définit la police par défaut dès la création pour éviter qu'il cherche Helvetica
        font: fontRegular 
      });

      const buffers = [];
      doc.on("data", (b) => buffers.push(b));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      /* ===== HEADER ===== */
      doc
        .font(fontBold) // Utilisation de Roboto-Bold
        .fontSize(20)
        .text("FACTURE - MY-ECOMMERCE", { align: "center" })
        .moveDown(2);

      /* ===== INFOS COMMANDE ===== */
      doc.font(fontRegular).fontSize(11);
      doc.text(`Commande : ${order.orderCode}`);
      doc.text(`Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`);
      doc.text(`Statut : ${order.status}`);
      doc.moveDown();

      /* ===== CLIENT ===== */
      doc.font(fontBold).fontSize(13).text("Informations client", { underline: true });
      doc.moveDown(0.5);

      doc.font(fontRegular).fontSize(11);
      doc.text(`Nom : ${order.customerName || "—"}`);
      doc.text(`Email : ${order.customerEmail || "—"}`);
      doc.text(`Téléphone : ${order.customerPhone || "—"}`);
      doc.text(`Adresse : ${order.deliveryAddress || "—"}`);
      doc.moveDown(1.5);

      /* ===== ARTICLES ===== */
      doc.font(fontBold).fontSize(13).text("Détail de la commande", { underline: true });
      doc.moveDown();

      order.items.forEach((item, index) => {
        doc.font(fontBold).fontSize(11).text(`${index + 1}. ${item.name}`);
        doc.font(fontRegular)
           .text(`   Quantité : ${item.quantity}`)
           .text(`   Prix unitaire : ${item.price.toLocaleString()} FCFA`)
           .text(`   Sous-total : ${(item.quantity * item.price).toLocaleString()} FCFA`);
        doc.moveDown();
      });

      /* ===== TOTAL ===== */
      doc.moveDown();
      doc.font(fontBold).fontSize(14).text(
        `TOTAL À PAYER : ${order.totalPrice.toLocaleString()} FCFA`,
        { align: "right" }
      );

      /* ===== FOOTER ===== */
      doc.moveDown(2);
      doc.font(fontRegular).fontSize(10).text(
        "Merci pour votre confiance.",
        { align: "center" }
      );

      doc.end();
    } catch (err) {
      console.error("Erreur génération PDF détaillée:", err);
      reject(err);
    }
  });
}