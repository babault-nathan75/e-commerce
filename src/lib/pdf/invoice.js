import PDFDocument from "pdfkit";
import path from "path";

/**
 * PROTOCOLE : Générateur de Documents Officiels Hebron
 * Statut : Transmission Sécurisée de Données (Buffer)
 */
export async function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    try {
      // Chemins vers les assets système
      const fontRegular = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");
      const fontBold = path.join(process.cwd(), "public", "fonts", "Roboto-Bold.ttf");

      const doc = new PDFDocument({ 
        size: "A4", 
        margin: 50,
        font: fontRegular // Défaut pour éviter les fallbacks Helvetica
      });

      // Couleurs Hebron
      const navy = "#232f3e";
      const orange = "#f97316";
      const lightGray = "#f8fafc";

      const buffers = [];
      doc.on("data", (b) => buffers.push(b));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      /* ===== HEADER : IDENTITÉ HEBRON ===== */
      doc.rect(0, 0, 600, 120).fill(navy); // Bandeau supérieur
      
      doc.fillColor("#ffffff")
         .font(fontBold)
         .fontSize(22)
         .text("HEBRON IVOIRE SHOPS", 50, 45);
      
      doc.fontSize(9)
         .font(fontRegular)
         .text("TERMINAL LOGISTIQUE D'IMPORTATION", 50, 75)
         .text("UNITÉ DE DISTRIBUTION : ABIDJAN, CI", 50, 88);

      doc.fillColor(orange)
         .fontSize(14)
         .font(fontBold)
         .text("FACTURE D'ORDRE", 400, 55, { align: "right" });
      
      doc.fillColor("#ffffff")
         .fontSize(10)
         .text(`RÉF : ${order.orderCode}`, 400, 75, { align: "right" });

      doc.moveDown(5);

      /* ===== INFOS SESSION & CLIENT ===== */
      const infoY = 150;
      doc.fillColor(navy).font(fontBold).fontSize(10).text("DONNÉES CLIENT :", 50, infoY);
      doc.fillColor("#000000").font(fontRegular).fontSize(10)
         .text(order.customerName || "Opérateur Externe", 50, infoY + 15)
         .text(order.customerEmail || "N/A", 50, infoY + 28)
         .text(order.customerPhone || "N/A", 50, infoY + 41)
         .text(`ADDR : ${order.deliveryAddress || "Retrait Agence"}`, 50, infoY + 54);

      doc.fillColor(navy).font(fontBold).text("DÉTAILS SYSTÈME :", 400, infoY, { align: "right" });
      doc.fillColor("#000000").font(fontRegular)
         .text(`DATE : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, 400, infoY + 15, { align: "right" })
         .text(`STATUT : ${order.status.toUpperCase()}`, 400, infoY + 28, { align: "right" });

      doc.moveDown(5);

      /* ===== TABLEAU D'INVENTAIRE ===== */
      const tableTop = 280;
      doc.rect(50, tableTop, 500, 22).fill(navy);
      
      doc.fillColor("#ffffff").font(fontBold).fontSize(9);
      doc.text("UNITÉ / DÉSIGNATION", 65, tableTop + 7);
      doc.text("QTÉ", 350, tableTop + 7);
      doc.text("PRIX UNIT.", 400, tableTop + 7);
      doc.text("TOTAL", 480, tableTop + 7);

      let currentY = tableTop + 28;
      doc.fillColor("#000000").font(fontRegular).fontSize(9);

      order.items.forEach((item, index) => {
        // Alternance de fond pour lisibilité industrielle
        if (index % 2 === 0) {
          doc.rect(50, currentY - 5, 500, 20).fill(lightGray);
        }
        
        doc.fillColor("#000000")
           .font(fontBold).text(item.name.toUpperCase(), 65, currentY)
           .font(fontRegular)
           .text(item.quantity.toString(), 350, currentY)
           .text(`${item.price.toLocaleString()} FCFA`, 400, currentY)
           .text(`${(item.quantity * item.price).toLocaleString()} FCFA`, 480, currentY);
        
        currentY += 20;
      });

      /* ===== TOTAL GÉNÉRAL ===== */
      doc.moveDown(2);
      doc.rect(350, currentY + 10, 200, 40).fill(navy);
      doc.fillColor("#ffffff").font(fontBold).fontSize(12)
         .text("TOTAL À RÉGLER", 365, currentY + 22);
      doc.fillColor(orange)
         .text(`${order.totalPrice.toLocaleString()} FCFA`, 420, currentY + 22, { align: "right" });

      /* ===== FOOTER : PROTOCOLE DE CONFIANCE ===== */
      const footerY = 760;
      doc.rect(50, footerY, 500, 1).fill(navy);
      doc.fillColor("#94a3b8")
         .font(fontRegular)
         .fontSize(8)
         .text("Ce document est une preuve d'ordre générée par le système Hebron Ivoire Shops.", 50, footerY + 15, { align: "center" })
         .text("ID Session : " + Date.now(), { align: "center" });

      doc.end();
    } catch (err) {
      console.error("[PDF ERROR] : Échec de génération critique.", err);
      reject(err);
    }
  });
}