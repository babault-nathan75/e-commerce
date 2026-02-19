"use client";

import { use, useState } from "react";
import { MENUS } from "@/lib/menus"; 
import { ShoppingBag, Plus, X, ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";
// 1. IMPORT DE TON ACTION SERVEUR
import { createFoodOrder } from "@/lib/actions/foodOrder";

export default function CommandePage({ params }) {
  const resolvedParams = use(params);
  const lieu = resolvedParams.lieu;
  
  const menuItems = MENUS[lieu] || [];
  const themeColor = lieu === "hebron" ? "orange" : "purple";
  const restaurantName = lieu === "hebron" ? "Hebron Ivoire" : "Espace Teresa";

  // Gestion du Panier Local & Étapes
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState("cart"); // "cart" | "checkout" | "success"
  const [orderCode, setOrderCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fonction d'ajout au panier
  const addToCart = (item) => {
    setCart(prev => {
        const existing = prev.find(i => i.name === item.name);
        if (existing) {
            return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
        }
        return [...prev, { ...item, qty: 1 }];
    });
    setIsCartOpen(true);
    setCartStep("cart"); // Si on ajoute un article, on s'assure de revenir sur la vue panier
  };

  const removeFromCart = (itemName) => {
    setCart(prev => prev.filter(i => i.name !== itemName));
  };

  // Calculs
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const categories = [...new Set(menuItems.map(i => i.category))];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* 1. SIDEBAR CATÉGORIES (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col p-6 overflow-y-auto z-10">
        <Link href="/gastronomie" className="font-bold text-slate-400 hover:text-slate-900 mb-8 flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} /> RETOUR
        </Link>
        <h2 className={`font-black text-2xl mb-8 uppercase text-${themeColor}-600`}>{restaurantName}</h2>
        
        <nav className="space-y-2">
            {categories.map(cat => (
                <a key={cat} href={`#${cat}`} className={`block px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-${themeColor}-50 hover:text-${themeColor}-600 transition-colors`}>
                    {cat}
                </a>
            ))}
        </nav>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto scroll-smooth relative">
        
        {/* HEADER UNIFIÉ (Mobile + Desktop) */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 md:px-8 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
                <Link href="/gastronomie" className="md:hidden p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h2 className={`font-black text-lg md:text-xl text-${themeColor}-600 md:text-slate-800`}>
                    <span className="md:hidden">{restaurantName}</span>
                    <span className="hidden md:inline">Menu & Commande</span>
                </h2>
            </div>

            <button 
                onClick={() => setIsCartOpen(true)} 
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-${themeColor}-50 text-${themeColor}-600 hover:bg-${themeColor}-600 hover:text-white transition-all font-bold shadow-sm`}
            >
                <ShoppingBag size={20} />
                <span className="hidden sm:inline">Mon Panier</span>
                
                {totalItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white font-black animate-in zoom-in">
                        {totalItemsCount}
                    </span>
                )}
            </button>
        </header>

        <div className="p-4 md:p-10 pb-32 max-w-5xl mx-auto">
            {/* Bannière */}
            <div className={`rounded-[2rem] bg-${themeColor}-600 text-white p-8 md:p-12 mb-10 shadow-lg shadow-${themeColor}-200 relative overflow-hidden`}>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Commander un repas</h1>
                    <p className="opacity-90 font-medium text-lg">Paiement en ligne, livraison rapide.</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            </div>

            {/* Plats */}
            {categories.map(cat => (
                <div key={cat} id={cat} className="mb-12 scroll-mt-24">
                    <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-wider border-b pb-2">{cat}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {menuItems.filter(i => i.category === cat).map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all flex justify-between items-center group">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{item.name}</h4>
                                    <p className={`text-${themeColor}-600 font-bold mt-1`}>{item.price.toLocaleString()} FCFA</p>
                                </div>
                                <button 
                                    onClick={() => addToCart(item)}
                                    className={`w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-${themeColor}-600 group-hover:text-white transition-colors shadow-sm`}
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </main>

      {/* 3. PANIER LATÉRAL (Drawer) */}
      {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
              <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                  
                  {/* HEADER DU PANIER */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div className="flex items-center gap-3">
                          {cartStep === "checkout" && (
                              <button onClick={() => setCartStep("cart")} className="p-2 -ml-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                  <ArrowLeft size={20} />
                              </button>
                          )}
                          <ShoppingBag className={`text-${themeColor}-600`} />
                          <h2 className="text-xl font-black uppercase">
                              {cartStep === "cart" ? "Votre Panier" : cartStep === "checkout" ? "Paiement" : "Succès"}
                          </h2>
                      </div>
                      <button onClick={() => {setIsCartOpen(false); if(cartStep === "success") setCartStep("cart");}} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X /></button>
                  </div>

                  {/* ÉTAPE 1 : PANIER */}
                  {cartStep === "cart" && (
                      <>
                          <div className="flex-1 overflow-y-auto p-6 space-y-4">
                              {cart.length === 0 ? (
                                  <div className="text-center py-20 text-slate-400">
                                      <ShoppingBag size={64} className="mx-auto mb-4 opacity-20" />
                                      <p className="font-bold">Votre panier est vide</p>
                                      <p className="text-sm mt-2 opacity-70">Ajoutez de délicieux plats pour commencer !</p>
                                  </div>
                              ) : (
                                  cart.map((item, index) => (
                                      <div key={index} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                          <div className="flex items-center gap-3">
                                              <div className={`bg-${themeColor}-100 text-${themeColor}-700 text-xs font-black px-2.5 py-1.5 rounded-lg`}>x{item.qty}</div>
                                              <p className="font-bold text-sm text-slate-700 max-w-[150px] truncate">{item.name}</p>
                                          </div>
                                          <div className="flex items-center gap-4">
                                              <span className="font-black text-sm text-slate-900">{(item.price * item.qty).toLocaleString()}</span>
                                              <button onClick={() => removeFromCart(item.name)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><X size={18}/></button>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                          <div className="p-6 bg-slate-50 border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                              <div className="flex justify-between items-center mb-6 text-xl">
                                  <span className="font-bold text-slate-500">Total</span>
                                  <span className="font-black text-slate-900">{cartTotal.toLocaleString()} FCFA</span>
                              </div>
                              <button 
                                disabled={cart.length === 0}
                                className={`w-full py-4 rounded-xl text-white font-black text-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${lieu === 'hebron' ? 'bg-orange-600 shadow-orange-200 shadow-lg' : 'bg-purple-600 shadow-purple-200 shadow-lg'}`}
                                onClick={() => {
                                    // 1. Sauvegarder le panier localement temporairement
                                    localStorage.setItem('tempRestaurantCart', JSON.stringify({ cart, cartTotal, lieu }));
                                    // 2. Rediriger vers la vraie page de paiement
                                    window.location.href = `/gastronomie/checkout/${lieu}`;
                                }}
                                >
                                    {cart.length === 0 ? "PANIER VIDE" : "PASSER À LA CAISSE"}
                              </button>
                          </div>
                      </>
                  )}

                  {/* ÉTAPE 2 : PAIEMENT & LIVRAISON (Design Premium) */}
                  

                  {/* ÉTAPE 3 : SUCCÈS */}
                  {cartStep === "success" && (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                          <div className={`w-24 h-24 bg-${themeColor}-100 text-${themeColor}-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500`}>
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Preuve reçue !</h2>
                          <p className="text-slate-500 font-medium mb-8 leading-relaxed">Notre équipe vérifie votre paiement. Dès validation, la cuisine lance la préparation !</p>
                          
                          <div className="bg-slate-50 p-6 rounded-3xl w-full border border-slate-100 mb-8 shadow-inner">
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Code de suivi</p>
                              <p className={`text-3xl font-black text-${themeColor}-600 font-mono tracking-widest`}>{orderCode}</p>
                          </div>

                          <button 
                            onClick={() => {setIsCartOpen(false); setCartStep("cart");}}
                            className="w-full py-4 rounded-xl bg-slate-900 text-white font-black text-lg hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200"
                          >
                              FERMER
                          </button>
                      </div>
                  )}

              </div>
          </div>
      )}
    </div>
  );
}