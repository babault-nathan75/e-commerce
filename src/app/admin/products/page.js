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
  ChevronRight
} from "lucide-react";

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const channel = params.channel || "";
  const category = params.category || "";

  await connectDB();

  const query = {};
  if (channel) query.channel = channel;
  if (category) query.category = category;

  const products = await Product.find(query)
    .sort({ stockAvailable: 1, createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link href="/admin" className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-orange-500 transition-colors shadow-sm">
                <ArrowLeft size={18} />
              </Link>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Administration <ChevronRight size={10} /> Inventaire
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-4">
              {channel === "library" ? <BookOpen className="text-blue-600" size={32} /> : <Store className="text-emerald-500" size={32} />}
              {category || "Inventaire Global"}
              <span className="text-lg font-bold text-gray-300 not-italic ml-2">[{products.length}]</span>
            </h1>
          </div>

          <Link
            href="/admin/products/new"
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Ajouter un produit
          </Link>
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
                  className="bg-white border border-gray-100 rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-6 hover:shadow-2xl hover:shadow-gray-200/50 transition-all group"
                >
                  {/* VISUEL */}
                  <div className="w-24 h-24 bg-gray-50 rounded-3xl overflow-hidden flex-shrink-0 p-2 border border-gray-50">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* IDENTITÉ */}
                  <div className="flex-1 text-center md:text-left min-w-0">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        p.channel === "library" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {p.channel === "library" ? "Digital/Livre" : "Boutique"}
                      </span>
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                        {p.category?.[0] || "Standard"}
                      </span>
                    </div>
                    <h2 className="font-black text-xl text-gray-900 truncate leading-tight mb-1 italic uppercase tracking-tighter">
                      {p.name}
                    </h2>
                    <p className="text-orange-500 font-black text-lg tracking-tighter">
                      {p.price.toLocaleString()} <span className="text-[10px] uppercase opacity-60">FCFA</span>
                    </p>
                  </div>

                  {/* STATUS DU STOCK */}
                  <div className={`flex flex-col items-center justify-center px-6 py-3 rounded-2xl border-2 min-w-[120px] ${
                    isOut ? "bg-rose-50 border-rose-100 text-rose-600" : 
                    isLowStock ? "bg-orange-50 border-orange-100 text-orange-600" : 
                    "bg-emerald-50 border-emerald-100 text-emerald-600"
                  }`}>
                    <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Stock</span>
                    <div className="flex items-center gap-2">
                      {isOut && <AlertTriangle size={14} />}
                      <span className="text-xl font-black font-mono">{p.stockAvailable}</span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <Link
                    href={`/admin/products/${p._id}/edit`}
                    className="p-4 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all"
                  >
                    <Edit3 size={22} />
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase italic">Aucun article trouvé</h3>
              <p className="text-gray-400 font-medium mt-1">L'inventaire pour cette sélection est vide.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}