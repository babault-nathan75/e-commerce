import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * PROTOCOLE : Générateur de Facture Tactique Hebron
 * Produit un document PDF haute précision pour les ordres de mission.
 */
export async function generateOrderPDF(order) {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.join(process.cwd(), "public/invoices");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const fileName = `order-${order.orderCode}.pdf`;
      const filePath = path.join(dir, fileName);
      const doc = new PDFDocument({ margin: 50, size: "A4" });

      // Couleurs Hebron
      const navy = "#232f3e";
      const orange = "#f97316";
      const lightGray = "#f8fafc";

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // --- HEADER : IDENTITÉ SYSTÈME ---
      doc.rect(0, 0, 600, 120).fill(navy); // Bandeau Navy
      doc.fillColor("#ffffff")
         .fontSize(22)
         .font("Helvetica-Bold")
         .text("HEBRON IVOIRE SHOPS", 50, 45);
      
      doc.fontSize(10)
         .font("Helvetica")
         .text("TERMINAL D'IMPORTATION LOGISTIQUE", 50, 75)
         .text("BASE : ABIDJAN, COCODY ANGRÉ", 50, 88);

      doc.fillColor(orange)
         .fontSize(14)
         .font("Helvetica-Bold")
         .text("FACTURE OFFICIELLE", 400, 55, { align: "right" });
      
      doc.fillColor("#ffffff")
         .fontSize(10)
         .text(`RÉF : ${order.orderCode}`, 400, 75, { align: "right" });

      doc.moveDown(5);

      // --- BLOC CLIENT & INFOS ---
      const customerY = 150;
      doc.fillColor(navy).font("Helvetica-Bold").fontSize(10).text("DESTINATAIRE :", 50, customerY);
      doc.fillColor("#000000").font("Helvetica").text(order.guest?.name || "Opérateur Externe", 50, customerY + 15);
      doc.text(order.guest?.email || order.userEmail, 50, customerY + 28);
      doc.text(order.contactPhone || "N/A", 50, customerY + 41);

      doc.fillColor(navy).font("Helvetica-Bold").text("DATE D'ÉMISSION :", 400, customerY, { align: "right" });
      doc.fillColor("#000000").font("Helvetica").text(new Date().toLocaleDateString("fr-FR"), 400, customerY + 15, { align: "right" });

      doc.moveDown(4);

      // --- TABLEAU DES PRODUITS (STYLE TERMINAL) ---
      const tableTop = 260;
      doc.rect(50, tableTop, 500, 20).fill(navy);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
      doc.text("DÉSIGNATION UNITÉ", 60, tableTop + 6);
      doc.text("QTÉ", 350, tableTop + 6);
      doc.text("PRIX UNIT.", 400, tableTop + 6);
      doc.text("TOTAL", 480, tableTop + 6);

      let currentY = tableTop + 25;
      doc.fillColor("#000000").font("Helvetica").fontSize(9);

      order.items.forEach((item, index) => {
        // Alternance de gris pour la lisibilité
        if (index % 2 === 0) {
          doc.rect(50, currentY - 5, 500, 20).fill(lightGray);
        }
        
        doc.fillColor("#000000")
           .text(item.name.toUpperCase(), 60, currentY)
           .text(item.quantity.toString(), 350, currentY)
           .text(`${item.price.toLocaleString()} FCFA`, 400, currentY)
           .text(`${(item.price * item.quantity).toLocaleString()} FCFA`, 480, currentY);
        
        currentY += 20;
      });

      // --- TOTAL FINAL ---
      doc.rect(350, currentY + 10, 200, 40).fill(navy);
      doc.fillColor("#ffffff")
         .font("Helvetica-Bold")
         .fontSize(12)
         .text("TOTAL À RÉGLER", 365, currentY + 18);
      doc.fillColor(orange)
         .text(`${order.totalPrice.toLocaleString()} FCFA`, 420, currentY + 18, { align: "right" });

      // --- FOOTER : PROTOCOLE SÉCURITÉ ---
      const footerY = 750;
      doc.rect(50, footerY, 500, 1).fill(navy);
      doc.fillColor("#94a3b8")
         .fontSize(8)
         .font("Helvetica-Oblique")
         .text("Ce document est généré par le système Hebron Ivoire Shops. Session sécurisée SSL-256.", 50, footerY + 10, { align: "center" });

      doc.end();

      // ATTENTE DE LA FIN D'ÉCRITURE DU FLUX
      stream.on("finish", () => {
        console.log(`[PDF SYSTEM] : Facture ${order.orderCode} finalisée.`);
        resolve(`/invoices/${fileName}`);
      });

      stream.on("error", (err) => {
        console.error(`[PDF SYSTEM] ERROR : Échec d'écriture.`, err);
        reject(err);
      });

    } catch (error) {
      console.error(`[PDF SYSTEM] CRITICAL ERROR :`, error);
      reject(error);
    }
  });
}