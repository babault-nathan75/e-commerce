import DashboardLayout from "@/components/layout/DashboardLayout";
import ShopClient from "./ShopClient";
import { getShopData } from "./actions";

export const metadata = {
  title: "Boutique – Hebron Ivoire Shops",
  description: "Découvrez nos produits en stock au meilleur prix."
};

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const page = Number(params.page) || 1;

  // Récupération des données via l'Action serveur
  const initialData = await getShopData({ search, category, page });

  // Gestion d'erreur
  if (initialData.error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen text-red-500 font-black uppercase tracking-widest text-sm">
          {initialData.error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ShopClient 
        initialData={initialData} 
        search={search} 
        category={category} 
        page={page} 
      />
    </DashboardLayout>
  );
}