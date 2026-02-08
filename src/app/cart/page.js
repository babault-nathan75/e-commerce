"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  Truck,
  PackageOpen,
  AlertCircle 
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  
  // Zustand Store
  const items = useCartStore((state) => state.items);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculs
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0; 
  const total = subtotal + shipping;

  // --- LOGIQUE DE LIMITE SÉCURISÉE ---
  const handleIncrement = (item) => {
    // 1. On récupère la limite (avec une sécurité si l'info manque : 99)
    const stockLimit = item.stockAvailable !== undefined ? Number(item.stockAvailable) : 99;
    
    // 2. On n'incrémente que si on est EN DESSOUS de la limite
    if (item.quantity < stockLimit) {
      increment(item.productId);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
        
        {/* --- Header --- */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <ShoppingBag className="text-orange-500" />
              Mon Panier
              <span className="text-sm font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {items.length}
              </span>
            </h1>
            
            {items.length > 0 && (
              <button 
                onClick={clear}
                className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 size={14} /> Tout vider
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {items.length === 0 ? (
            // === EMPTY STATE ===
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"></div>
                <div className="relative bg-white dark:bg-gray-900 p-8 rounded-full shadow-xl border border-gray-100 dark:border-gray-800">
                  <PackageOpen size={64} className="text-gray-300 dark:text-gray-600" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Votre panier est vide</h2>
              <div className="flex gap-4 mt-8">
                <Link
                  href="/shop"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                      Boutique <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                  </span>
                </Link>
              </div>
            </div>

          ) : (
            // === GRID LAYOUT ===
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* --- LISTE DES ARTICLES --- */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  // ✅ LOGIQUE VISUELLE DE LIMITE
                  const stockLimit = item.stockAvailable !== undefined ? Number(item.stockAvailable) : 99;
                  const isMaxReached = item.quantity >= stockLimit;

                  return (
                  <div 
                    key={item.productId}
                    className="group flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image */}
                    <Link href={`/product/${item.productId}`} className="shrink-0 relative w-full sm:w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                       <img 
                         src={item.imageUrl} 
                         alt={item.name} 
                         className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
                       />
                    </Link>

                    {/* Infos & Contrôles */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Link href={`/product/${item.productId}`} className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1 hover:text-orange-500 transition-colors">
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Prix : {item.price.toLocaleString()} FCFA
                          </p>

                          {/* ⚠️ ALERTE VISUELLE (S'affiche si max atteint) */}
                          {isMaxReached && (
                             <p className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded mt-2 w-fit animate-pulse">
                               <AlertCircle size={12} /> Stock Max Atteint ({stockLimit})
                             </p>
                          )}
                        </div>
                        
                        {removeItem && (
                          <button 
                            onClick={() => removeItem(item.productId)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="flex justify-between items-end mt-4 sm:mt-0">
                        {/* Compteur Quantité */}
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 w-fit">
                          <button 
                            onClick={() => decrement(item.productId)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-sm text-gray-600 hover:bg-gray-100"
                          >
                            <Minus size={14} />
                          </button>
                          
                          <span className={`font-bold w-4 text-center ${isMaxReached ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>
                            {item.quantity}
                          </span>
                          
                          {/* ✅ BOUTON "+" : Désactivé si max atteint */}
                          <button 
                            onClick={() => handleIncrement(item)} 
                            disabled={isMaxReached} 
                            className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm transition-colors ${
                              isMaxReached 
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Total Ligne */}
                        <div className="text-right">
                          <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Total</span>
                          <span className="text-xl font-black text-gray-900 dark:text-white">
                            {(item.price * item.quantity).toLocaleString()} <span className="text-xs font-medium text-gray-500">FCFA</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>

              {/* --- RÉSUMÉ --- */}
              <div className="lg:col-span-1 lg:sticky lg:top-24">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Récapitulatif</h2>
                  <div className="space-y-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Sous-total</span>
                      <span className="font-bold text-gray-900 dark:text-white">{subtotal.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                  <div className="py-6 flex justify-between items-end">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <div className="text-right">
                      <span className="block text-3xl font-black text-orange-500 tracking-tighter">
                        {total.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 font-bold uppercase">FCFA</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest shadow-lg hover:bg-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Payement <CreditCard size={20} />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}