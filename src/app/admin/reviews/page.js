import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import AdminReviewList from "./ui/AdminReviewList";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  MessageSquare, 
  ArrowLeft, 
  LayoutDashboard, 
  Star, 
  ShieldCheck,
  Search
} from "lucide-react";
import Link from "next/link";

export default async function AdminReviewsPage() {
  await connectDB();
  
  // Récupération des 200 derniers avis pour une réactivité optimale
  const reviews = await Review.find({}).sort({ createdAt: -1 }).limit(200);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc] pb-20">
        
        {/* --- STICKY HEADER --- */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link 
              href="/admin" 
              className="group flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-all"
            >
              <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-gray-200 transition-colors">
                <ArrowLeft size={16} />
              </div>
              DASHBOARD TERMINAL
            </Link>
            
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 rounded-full text-white text-[10px] font-black tracking-widest uppercase shadow-xl">
              <ShieldCheck size={12} className="text-emerald-500" />
              Moderation Active
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 mt-12">
          
          {/* --- TITRE ET STATISTIQUES RAPIDES --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                    <MessageSquare size={24} />
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
                  Customer <span className="text-blue-500">Reviews</span>
                </h1>
              </div>
              <p className="text-gray-400 font-bold text-sm ml-14 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                {reviews.length} témoignages à superviser
              </p>
            </div>

            {/* Score Moyen Visuel */}
            <div className="bg-white px-6 py-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Satisfaction</span>
                    <span className="text-xl font-black text-gray-900 italic">Excellent</span>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-50 text-orange-500 px-4 py-2 rounded-2xl border border-orange-100 font-black">
                    <Star size={18} fill="currentColor" />
                    <span>4.8</span>
                </div>
            </div>
          </div>

          {/* --- FILTRES DE RECHERCHE (FACULTATIF MAIS ESTHÉTIQUE) --- */}
          <div className="mb-8 flex justify-end">
             <div className="relative group w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher par client ou produit..." 
                  className="w-full pl-12 pr-6 py-4 bg-white border border-transparent rounded-[1.5rem] text-xs font-bold shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 outline-none transition-all"
                />
             </div>
          </div>

          {/* --- LISTE INTERACTIVE --- */}
          <div className="animate-in fade-in duration-700">
            <AdminReviewList initialReviews={JSON.parse(JSON.stringify(reviews))} />
          </div>

        </main>
      </div>
    </DashboardLayout>
  );
}