import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Pour sécurité, on peut renvoyer 200 même si l'user n'existe pas, 
      // mais pour le debug on met 404 ici.
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // 1. Générer le token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // 2. Sauvegarder le token haché et l'expiration (1 heure) dans la DB
    // On peut hacher le token pour plus de sécurité, ici on fait simple pour l'exemple
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    // 3. Configurer l'envoi d'email (Utilisez vos vrais identifiants SMTP)
    // Exemple avec Gmail (nécessite "App Password") ou Mailtrap pour tester
    const transporter = nodemailer.createTransport({
      service: "gmail", // ou host: 'smtp.example.com'
      auth: {
        user: process.env.EMAIL_USER, // Votre email (ex: monboutique@gmail.com)
        pass: process.env.EMAIL_PASS, // Votre mot de passe d'application
      },
    });

    // 4. Créer le lien
    // ATTENTION : Changez localhost:3000 par votre vrai domaine en prod
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"Hebron Ivoire" <no-reply@hebronivoire.ci>',
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Mot de passe oublié ?</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p>
          <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
          <p style="margin-top: 20px; font-size: 12px; color: #888;">Ce lien expire dans 1 heure.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email envoyé avec succès" }, { status: 200 });

  } catch (error) {
    console.error("Erreur forgot-password:", error);
    return NextResponse.json({ error: "Erreur serveur lors de l'envoi." }, { status: 500 });
  }
}