import { ArrowLeft, Plus, Store, ToggleRight, Edit, Search, Trash2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { MenuItem } from "@/models/MenuItem";
import { toggleMenuItemStatus, deleteMenuItem } from "@/lib/actions/menuItem";

export const dynamic = "force-dynamic";

export default async function GastronomieEnLignePage({ searchParams }) {
  await connectDB();
  
  // 1. Gestion de la recherche
  const params = await searchParams;
  const query = params?.search || "";

  let dbFilter = {};
  if (query) {
    dbFilter = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { restaurant: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }, // 👈 Ajout de la recherche par catégorie
      ],
    };
  }

  // 2. Récupération des VRAIS plats depuis MongoDB
  const menuItems = await MenuItem.find(dbFilter).sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <Link href="/admin/gastronomie" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors">
                <ArrowLeft size={20} /> Retour aux commandes
            </Link>
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Store className="text-orange-500" size={32} />
                        Catalogue en Ligne
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Gérez les plats affichés sur l'application client.</p>
                </div>

                <div className="flex gap-3">
                    <Link href="/admin/gastronomie/create" className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:-translate-y-1">
                        <Plus size={18} /> Ajouter un plat
                    </Link>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Barre de recherche */}
            <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
                <div className="flex gap-2">
                    <span className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer">Tous ({menuItems.length})</span>
                </div>
                <form method="GET" action="/admin/gastronomie/en-ligne" className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        name="search"
                        defaultValue={query}
                        placeholder="Plat, Restaurant, Catégorie..." 
                        className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-medium w-full md:w-64" 
                    />
                </form>
            </div>

            {/* Tableau du catalogue */}
            {menuItems.length === 0 ? (
                <div className="p-20 text-center">
                    <p className="text-slate-500 font-medium mb-4">Aucun plat trouvé dans le catalogue.</p>
                    <Link href="/admin/gastronomie/create" className="text-orange-600 font-bold hover:underline">
                        Créer votre premier plat
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-5 w-16">Photo</th>
                                <th className="p-5">Plat & Info</th>
                                <th className="p-5">Catégorie</th>
                                <th className="p-5 text-right">Prix</th>
                                <th className="p-5 text-center">Disponibilité</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {menuItems.map((item) => (
                                <tr key={item._id.toString()} className="hover:bg-slate-50 transition-colors group">
                                    {/* PHOTO */}
                                    <td className="p-5">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={20} className="text-slate-300" />
                                            )}
                                        </div>
                                    </td>

                                    {/* INFOS */}
                                    <td className="p-5">
                                        <div className="font-bold text-slate-900">{item.name}</div>
                                        <div className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${item.restaurant === 'hebron' ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'}`}>
                                            {item.restaurant}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xs" title={item.description}>
                                            {item.description}
                                        </p>
                                    </td>

                                    {/* CATÉGORIE 👈 NOUVELLE CELLULE */}
                                    <td className="p-5">
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                                            {item.category || "Non classé"}
                                        </span>
                                    </td>

                                    {/* PRIX */}
                                    <td className="p-5 text-right font-black text-slate-900">
                                        {item.price.toLocaleString()} FCFA
                                    </td>

                                    {/* DISPONIBILITÉ */}
                                    <td className="p-5 text-center">
                                        {item.isAvailable ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> En ligne
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-xs font-bold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Épuisé
                                            </span>
                                        )}
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="p-5">
                                        <div className="flex justify-end items-center gap-2">
                                            
                                            {/* Bouton Toggle */}
                                            <form action={async () => { "use server"; await toggleMenuItemStatus(item._id.toString()); }}>
                                                <button type="submit" className={`p-2 rounded-lg transition-colors ${item.isAvailable ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-200'}`} title={item.isAvailable ? "Marquer comme épuisé" : "Remettre en ligne"}>
                                                    <ToggleRight size={20} className={!item.isAvailable ? "rotate-180" : ""} />
                                                </button>
                                            </form>

                                            {/* Bouton Modification */}
                                            <Link href={`/admin/gastronomie/edit/${item._id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit size={18} />
                                            </Link>

                                            {/* Bouton Supprimer */}
                                            <form action={async () => { "use server"; await deleteMenuItem(item._id.toString()); }}>
                                                <button type="submit" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer ce plat">
                                                    <Trash2 size={18} />
                                                </button>
                                            </form>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}