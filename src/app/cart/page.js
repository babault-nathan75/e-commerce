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
  PackageOpen
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  
  // Zustand Store
  const items = useCartStore((state) => state.items);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeItem = useCartStore((state) => state.removeItem); // Assurez-vous d'avoir ajouté removeItem dans votre store
  const clear = useCartStore((state) => state.clear);

  // Hydration fix (pour éviter les erreurs de rendu serveur/client avec Zustand)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculs
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0; // Ou logique complexe
  const total = subtotal + shipping;

  if (!mounted) return null; // Évite le flash de contenu non hydraté

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
            // === EMPTY STATE (PANIER VIDE) ===
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"></div>
                <div className="relative bg-white dark:bg-gray-900 p-8 rounded-full shadow-xl border border-gray-100 dark:border-gray-800">
                  <PackageOpen size={64} className="text-gray-300 dark:text-gray-600" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Votre panier est vide</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md text-center mb-8 text-lg">
                On dirait que vous n'avez pas encore trouvé votre bonheur. Explorez nos collections dès maintenant !
              </p>
              <div className="flex gap-4">
                <Link
                  href="/shop"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                     Boutique <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                  </span>
                </Link>
                <Link
                  href="/library"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-black uppercase tracking-widest rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                   Librairie
                </Link>
              </div>
            </div>

          ) : (
            // === GRID LAYOUT (LISTE + RÉSUMÉ) ===
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* --- COLONNE GAUCHE : LISTE DES ARTICLES --- */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.productId}
                    className="group flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image */}
                    <Link href={`/product/${item.productId}`} className="shrink-0 relative w-full sm:w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                       <img 
                         src={item.imageUrl} 
                         alt={item.name} 
                         className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500" 
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
                            Prix unitaire : {item.price.toLocaleString()} FCFA
                          </p>
                        </div>
                        
                        {/* Bouton Supprimer (Optionnel si removeItem existe dans le store, sinon utiliser decrement jusqu'à 0) */}
                        {removeItem && (
                          <button 
                            onClick={() => removeItem(item.productId)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                            title="Supprimer"
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
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-gray-900 dark:text-white w-4 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => increment(item.productId)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
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
                ))}
              </div>

              {/* --- COLONNE DROITE : RÉSUMÉ (STICKY) --- */}
              <div className="lg:col-span-1 lg:sticky lg:top-24">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/20">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Récapitulatif</h2>

                  <div className="space-y-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Sous-total</span>
                      <span className="font-bold text-gray-900 dark:text-white">{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Livraison</span>
                      <span className="text-green-600 dark:text-green-400 text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded font-bold uppercase">Calculée après</span>
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
                    className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest shadow-lg hover:bg-black dark:hover:bg-gray-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mb-6"
                  >
                    Commander <CreditCard size={20} />
                  </button>

                  {/* Réassurance */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      <ShieldCheck className="text-green-500" size={18} />
                      <span>Paiement 100% Sécurisé</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      <Truck className="text-orange-500" size={18} />
                      <span>Livraison Rapide partout à Abidjan</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}