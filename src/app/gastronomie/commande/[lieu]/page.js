"use client";

import { use, useState } from "react";
import { MENUS } from "@/lib/menus"; // Nos données hardcodées
import { ShoppingBag, Plus, Minus, X } from "lucide-react";
import Link from "next/link";

export default function CommandePage({ params }) {
  const resolvedParams = use(params);
  const lieu = resolvedParams.lieu;
  
  const menuItems = MENUS[lieu] || [];
  const themeColor = lieu === "hebron" ? "orange" : "purple";
  const restaurantName = lieu === "hebron" ? "Hebron Ivoire" : "Espace Teresa";

  // Gestion du Panier Local (Simple State)
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item) => {
    setCart(prev => {
        const existing = prev.find(i => i.name === item.name);
        if (existing) {
            return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
        }
        return [...prev, { ...item, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemName) => {
    setCart(prev => prev.filter(i => i.name !== itemName));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // Groupement par catégories
  const categories = [...new Set(menuItems.map(i => i.category))];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* 1. SIDEBAR CATÉGORIES (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col p-6 overflow-y-auto z-10">
        <Link href="/gastronomie" className="font-bold text-slate-400 hover:text-slate-900 mb-8 block">← RETOUR</Link>
        <h2 className={`font-black text-2xl mb-8 uppercase text-${themeColor}-600`}>{restaurantName}</h2>
        
        <nav className="space-y-2">
            {categories.map(cat => (
                <a key={cat} href={`#${cat}`} className={`block px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-${themeColor}-50 hover:text-${themeColor}-600 transition-colors`}>
                    {cat}
                </a>
            ))}
        </nav>
      </aside>

      {/* 2. MAIN CONTENT (Liste des Plats) */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        
        {/* Header Mobile */}
        <div className="md:hidden p-4 bg-white shadow-sm sticky top-0 z-20 flex justify-between items-center">
             <h2 className={`font-black text-lg text-${themeColor}-600`}>{restaurantName}</h2>
             <button onClick={() => setIsCartOpen(true)} className="relative p-2">
                <ShoppingBag />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>
             </button>
        </div>

        <div className="p-4 md:p-10 pb-32 max-w-5xl mx-auto">
            {/* Bannière */}
            <div className={`rounded-[2rem] bg-${themeColor}-600 text-white p-8 md:p-12 mb-10 shadow-lg shadow-${themeColor}-200`}>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Commander un repas</h1>
                <p className="opacity-80 font-medium text-lg">Livraison rapide ou à emporter.</p>
            </div>

            {categories.map(cat => (
                <div key={cat} id={cat} className="mb-12 scroll-mt-10">
                    <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-wider border-b pb-2">{cat}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {menuItems.filter(i => i.category === cat).map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex justify-between items-center group">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{item.name}</h4>
                                    <p className={`text-${themeColor}-600 font-bold mt-1`}>{item.price.toLocaleString()} FCFA</p>
                                </div>
                                <button 
                                    onClick={() => addToCart(item)}
                                    className={`w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-${themeColor}-600 group-hover:text-white transition-colors`}
                                >
                                    <Plus size={20} />
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
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
              <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                  
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h2 className="text-xl font-black uppercase">Votre Panier</h2>
                      <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full"><X /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {cart.length === 0 ? (
                          <div className="text-center py-20 text-slate-400">
                              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                              <p>Votre panier est vide</p>
                          </div>
                      ) : (
                          cart.map((item, index) => (
                              <div key={index} className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                      <div className="bg-slate-100 text-xs font-bold px-2 py-1 rounded-md">x{item.qty}</div>
                                      <p className="font-bold text-sm text-slate-700 max-w-[150px] truncate">{item.name}</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <span className="font-bold text-sm">{(item.price * item.qty).toLocaleString()}</span>
                                      <button onClick={() => removeFromCart(item.name)} className="text-red-400 hover:text-red-600"><X size={16}/></button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-6 text-xl">
                          <span className="font-bold text-slate-500">Total</span>
                          <span className="font-black text-slate-900">{cartTotal.toLocaleString()} FCFA</span>
                      </div>
                      <button 
                        className={`w-full py-4 rounded-xl text-white font-black text-lg hover:brightness-110 transition-all ${lieu === 'hebron' ? 'bg-orange-600' : 'bg-purple-600'}`}
                        onClick={() => alert("Ici, on redirigerait vers le Checkout existant avec les items du panier !")}
                      >
                          VALIDER LA COMMANDE
                      </button>
                  </div>

              </div>
          </div>
      )}
    </div>
  );
}