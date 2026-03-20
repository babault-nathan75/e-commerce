import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { 
  Package, 
  BookOpen, 
  Store, 
  ArrowLeft, 
  Plus, 
  Edit3, 
  AlertTriangle,
  ChevronRight,
  Search,
  Hash
} from "lucide-react";
import { redirect } from "next/navigation";

// 🔴 TRÈS IMPORTANT : Force Next.js à recalculer la page à chaque fois (Désactive le cache)
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const channel = params.channel || "";
  
  // On laisse Next.js décoder l'URL naturellement, mais on nettoie les espaces avant/après
  const category = params.category ? params.category.trim() : "";
  const searchTerm = params.q || "";

  await connectDB();

  const query = {};
  if (channel) query.channel = channel;
  
  if (category) {
    // 🔴 LA CORRECTION EST ICI : On enlève le ^ et le $ pour une recherche plus souple
    // Cela permet de trouver "Article de piété" même si dans la DB c'est écrit "Article de piété " (avec un espace)
    query.category = { $regex: category, $options: "i" };
  }
  
  if (searchTerm) {
    query.name = { $regex: searchTerm, $options: "i" };
  }

  // 🐛 DÉBOGAGE : Affiche la requête exacte dans ton terminal (serveur)
  console.log("--- RECHERCHE MONGODB ---");
  console.log("Catégorie recherchée :", category);
  console.log("Requête complète :", query);
  
  const products = await Product.find(query)
    .sort({ stockAvailable: 1, createdAt: -1 })
    .lean();

  console.log("Nombre d'articles trouvés :", products.length);
  console.log("-------------------------");

  async function handleSearch(formData) {
    "use server";
    const q = formData.get("q");
    const urlParams = new URLSearchParams();
    if (channel) urlParams.set("channel", channel);
    if (category) urlParams.set("category", category);
    if (q) urlParams.set("q", q);
    redirect(`/admin/products?${urlParams.toString()}`);
  }

  // 🔴 LOGIQUE POUR LE TITRE PRINCIPAL
  const pageTitle = channel === "library" ? "LIBRAIRIE" : "BOUTIQUE";

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 selection:bg-orange-100">
      <div className="max-w-7xl mx-auto p-4 md:p-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Link href="/admin" className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm">
                  <ArrowLeft size={20} />
                </Link>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Admin <ChevronRight size={10} /> <span className="text-gray-900">Inventaire</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic flex items-baseline gap-3">
                {channel === "library" ? <BookOpen className="text-blue-600 shrink-0" size={32} /> : <Store className="text-emerald-500 shrink-0" size={32} />}
                
                {/* Affichage dynamique: Librairie ou Boutique + Catégorie si elle existe */}
                <span className="truncate max-w-[250px] md:max-w-none">
                  {pageTitle} {category && <span className="text-gray-400 font-medium">/ {category}</span>}
                </span>
                
                <span className="text-xl font-bold text-orange-500 not-italic">({products.length})</span>
              </h1>
            </div>

            <Link
              href="/admin/products/new"
              className="group bg-gray-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
              Nouveau Produit
            </Link>
          </div>

          {/* --- BARRE DE RECHERCHE --- */}
          <form action={handleSearch} className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              name="q"
              type="text"
              defaultValue={searchTerm}
              placeholder={`Rechercher par nom ou référence dans ${pageTitle}...`}
              className="w-full pl-14 pr-4 py-5 bg-white border border-gray-200 rounded-3xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 shadow-sm transition-all placeholder:text-gray-300"
            />
          </form>
        </div>

        {/* --- LISTE D'INVENTAIRE --- */}
        <div className="grid grid-cols-1 gap-4">
          {products.length > 0 ? (
            products.map((p) => {
              const isLowStock = p.stockAvailable < 10 && p.stockAvailable > 0;
              const isOut = p.stockAvailable === 0;

              return (
                <div
                  key={p._id.toString()}
                  className="bg-white border border-gray-100 rounded-[2.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-2xl hover:shadow-gray-200/60 transition-all group relative overflow-hidden"
                >
                  {/* Badge d'ID ou Type au survol */}
                  <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center gap-1 text-[8px] font-bold text-gray-300 uppercase">
                    <Hash size={10} /> {p._id.toString().slice(-6)}
                  </div>

                  {/* Image Container */}
                  <div className="w-full md:w-32 h-40 md:h-32 bg-gray-50 rounded-[1.8rem] overflow-hidden flex-shrink-0 p-4 border border-gray-100 group-hover:border-orange-100 transition-colors">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 text-center md:text-left w-full min-w-0">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                        p.channel === "library" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                      }`}>
                        {/* 🔴 Ajustement du badge sur chaque ligne de produit */}
                        {p.channel === "library" ? "LIBRAIRIE" : "BOUTIQUE"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                        {p.category || "Sans catégorie"}
                      </span>
                    </div>
                    
                    <h2 className="font-black text-xl md:text-2xl text-gray-900 truncate leading-none mb-2 italic uppercase tracking-tighter">
                      {p.name}
                    </h2>
                    <p className="text-orange-500 font-black text-xl tracking-tighter">
                      {p.price.toLocaleString()} <span className="text-[10px] uppercase opacity-60 ml-0.5">FCFA</span>
                    </p>
                  </div>

                  {/* Stock Statut */}
                  <div className={`flex items-center gap-4 w-full md:w-auto justify-between md:justify-end px-6 py-4 md:py-2 rounded-[1.5rem] border ${
                    isOut ? "bg-rose-50 border-rose-100 text-rose-600" : 
                    isLowStock ? "bg-orange-50 border-orange-100 text-orange-600" : 
                    "bg-emerald-50 border-emerald-100 text-emerald-600"
                  }`}>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Quantité</span>
                      <div className="flex items-center gap-2">
                        {isOut && <AlertTriangle size={14} className="animate-pulse" />}
                        <span className="text-2xl font-black font-mono leading-none">{p.stockAvailable}</span>
                      </div>
                    </div>
                    
                    {/* Bouton Edit Mobile-Friendly intégré dans la ligne de stock sur mobile */}
                    <Link
                      href={`/admin/products/${p._id}/edit`}
                      className="md:hidden p-3 bg-white/50 rounded-xl text-gray-600 active:scale-90 transition-transform"
                    >
                      <Edit3 size={20} />
                    </Link>
                  </div>

                  {/* Bouton Edit Desktop */}
                  <Link
                    href={`/admin/products/${p._id}/edit`}
                    className="hidden md:flex p-4 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all active:scale-90"
                  >
                    <Edit3 size={24} />
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <h3 className="text-xl font-black text-gray-900 uppercase italic">Inventaire vide</h3>
              <p className="text-gray-400 font-medium mt-1">Aucune référence ne correspond à votre recherche.</p>
              <Link href="/admin/products" className="inline-block mt-6 px-6 py-2 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500 hover:bg-orange-500 hover:text-white transition-all">
                Tout afficher
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}