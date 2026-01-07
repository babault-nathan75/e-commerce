import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import sanitize from 'mongo-sanitize';

// Schéma de validation
// Schéma de validation assoupli
const UpdateSchema = z.object({
  name: z.string().min(2, "Le nom doit avoir 2 caractères min.").optional(),
  email: z.string().email("Format d'email invalide").optional(),
  phone: z.string().optional(), // Rendu optionnel sans contrainte de taille
  address: z.string().optional() // Rendu totalement optionnel pour éviter les erreurs "trop court"
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).select("name email phone address isAdmin createdAt");
  if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

  return NextResponse.json({ ok: true, user });
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const cleanBody = sanitize(body);
    const data = UpdateSchema.parse(cleanBody);

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    // 1. Gestion de l'email (vérification d'unicité)
    if (data.email && data.email !== user.email) {
      const emailExists = await User.findOne({ email: data.email });
      if (emailExists) {
        return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
      }
      user.email = data.email;
    }

    // 2. Mise à jour des champs standards
    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;

    // 3. Condition Admin pour l'adresse
    // Si l'utilisateur n'est PAS admin, on autorise la mise à jour de l'adresse
    if (!user.isAdmin && data.address !== undefined) {
      user.address = data.address;
    } else if (user.isAdmin) {
      // Optionnel : on s'assure que l'adresse reste vide ou inchangée pour les admins
      user.address = ""; 
    }

    await user.save();

    return NextResponse.json({
      ok: true,
      message: "Vos données ont été mise à jour",
      user: { 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        address: user.address, 
        isAdmin: user.isAdmin 
      }
    });

  } catch (error) {
    console.error("Erreur API Profile:", error);

    if (error.name === "ZodError" || error.issues || error.errors) {
      const firstError = error.errors?.[0] || error.issues?.[0];
      const message = firstError?.message || "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json({ error: "Cet email est déjà pris" }, { status: 400 });
    }

    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}