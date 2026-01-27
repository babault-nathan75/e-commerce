// src/app/admin/layout.js
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route"; // Vérifie ton chemin
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // 🛡️ Protection : Si pas admin, retour à l'accueil
  if (!session?.user?.isAdmin) {
    redirect("/"); 
  }

  return <>{children}</>;
}