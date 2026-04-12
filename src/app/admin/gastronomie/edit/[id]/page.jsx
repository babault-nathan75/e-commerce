import { getMenuItemById } from "@/lib/actions/menuItem";
import { notFound } from "next/navigation";
import EditPlatForm from "./EditPlatForm";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }) {
  // Récupération de l'ID depuis l'URL
  const resolvedParams = await params; 
  const platId = resolvedParams.id;

  // Récupération des données du plat depuis MongoDB
  const platData = await getMenuItemById(platId);

  // Si le plat n'existe pas ou a été supprimé, on affiche une page 404
  if (!platData) {
    return notFound();
  }

  // On passe les données au composant Formulaire
  return <EditPlatForm initialData={platData} />;
}