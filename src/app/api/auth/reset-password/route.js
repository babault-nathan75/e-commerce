import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // 1. Trouver l'utilisateur avec ce token ET vérif que la date n'est pas passée ($gt = greater than)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });
    }

    // 2. Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Mettre à jour l'utilisateur et nettoyer les tokens
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return NextResponse.json({ message: "Mot de passe mis à jour." }, { status: 200 });

  } catch (error) {
    console.error("Erreur reset-password:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}