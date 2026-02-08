import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  ShoppingBag, 
  Home, 
  MailCheck, 
  Truck,
  Store,  // Nouvelle icône
  Clock   // Nouvelle icône
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default async function OrderSuccessPage({ searchParams }) {
  const params = await searchParams; // Next 15+
  const code = params.code || "";

  // --- 1. RÉCUPÉRATION DES DONNÉES RÉELLES ---
  await connectDB();
  const order = await Order.findOne({ orderCode: code }).lean();

  // Si l'utilisateur arrive ici sans code valide, on gère proprement
  if (!order) {
     return (
        <DashboardLayout>
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold">Commande introuvable</h1>
                <Link href="/shop" className="text-green-600 underline mt-4">Retour à la boutique</Link>
            </div>
        </DashboardLayout>
     );
  }

  // --- 2. LOGIQUE D'AFFICHAGE (Retrait vs Livraison) ---
  const isPickup = order.deliveryMethod === "RETRAIT";
  const email = order.guest?.email || params.email || "votre email";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 py-12 px-4 relative overflow-hidden">
        
        {/* --- ÉLÉMENTS DÉCORATIFS (Confettis/Lueurs) --- */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 dark:bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          
          {/* ===== CARTE PRINCIPALE ===== */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 md:p-12 text-center animate-in fade-in zoom-in duration-700">
            
            {/* ICON ANIMÉE */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-green-500 text-white p-4 rounded-full shadow-lg">
                  <CheckCircle2 size={56} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* TITRE & SOUS-TITRE */}
            <div className="space-y-3 mb-10">
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                {isPickup ? "Preuve Reçue ! 🎉" : "C'est en route ! 🎉"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">
                {isPickup 
                    ? "Votre preuve de paiement a bien été transmise. Nos équipes procèdent à la vérification."
                    : "Merci pour votre confiance. Votre commande a été enregistrée et nos équipes s'en occupent déjà."
                }
              </p>
            </div>

            {/* CODE DE COMMANDE (Le "Ticket") */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 md:p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 mb-10 relative overflow-hidden">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800"></div>
              
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">
                Référence de commande
              </p>
              <div className="text-3xl md:text-4xl font-mono font-black text-orange-500 tracking-tighter select-all">
                {order.orderCode}
              </div>
            </div>

            {/* NEXT STEPS / INFO (DYNAMIQUE) */}
            <div className="grid md:grid-cols-2 gap-4 mb-10 text-left">
              
              {/* Bloc 1 : Email */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                  <MailCheck size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Confirmation envoyée</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Un reçu détaillé a été envoyé à <strong>{email}</strong>.
                    </p>
                </div>
              </div>

              {/* Bloc 2 : Logistique (Change selon le mode) */}
              <div className={`flex items-start gap-4 p-4 rounded-2xl border ${isPickup ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30' : 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700'}`}>
                <div className={`p-2 rounded-lg shrink-0 ${isPickup ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                  {isPickup ? <Store size={20} /> : <Truck size={20} />}
                </div>
                <div>
                    <h4 className={`font-bold text-sm mb-1 ${isPickup ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                        {isPickup ? "Retrait en Boutique" : "Livraison Standard"}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {isPickup 
                        ? "Attendez la validation de votre paiement (SMS/Mail) avant de passer récupérer le colis."
                        : "Notre livreur vous contactera au numéro fourni dès que le colis est prêt."
                    }
                    </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link
                href={`/order/track?code=${encodeURIComponent(order.orderCode)}`}
                className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold flex items-center justify-center gap-2 hover:bg-orange-600 dark:hover:bg-gray-200 hover:text-white transition-all transform hover:scale-[1.02] shadow-xl"
              >
                <Search size={18} />
                Suivre mon colis
              </Link>

              <Link
                href="/shop"
                className="w-full md:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <ShoppingBag size={18} />
                Continuer mes achats
              </Link>
            </div>

          </div>

          {/* BACK TO HOME */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors group"
            >
              <Home size={16} />
              Retour à l'accueil
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}