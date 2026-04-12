"use client";

import { use, useState, useEffect } from "react";
import { ShoppingBag, Plus, X, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { getPublicMenu } from "@/lib/actions/menuItem"; // 👈 On importe la nouvelle action

export default function CommandePage({ params }) {
  const resolvedParams = use(params);
  const lieu = resolvedParams.lieu;
  
  const themeColor = lieu === "hebron" ? "orange" : "purple";
  const restaurantName = lieu === "hebron" ? "Hebron Ivoire" : "Espace Teresa";

  // ==========================================
  // ÉTATS DE LA PAGE
  // ==========================================
  const [menuItems, setMenuItems] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState("cart"); 
  const [orderCode, setOrderCode] = useState("");

  // ==========================================
  // CHARGEMENT DES PLATS DEPUIS MONGODB
  // ==========================================
  useEffect(() => {
    const fetchMenu = async () => {
        setIsLoadingMenu(true);
        const data = await getPublicMenu(lieu);
        setMenuItems(data);
        setIsLoadingMenu(false);
    };
    fetchMenu();
  }, [lieu]);

  // Fonction d'ajout au panier
  const addToCart = (item) => {
    setCart(prev => {
        const existing = prev.find(i => i._id === item._id); // Utilisation de l'ID au lieu du nom
        if (existing) {
            return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
        }
        return [...prev, { ...item, qty: 1 }];
    });
    setIsCartOpen(true);
    setCartStep("cart");
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i._id !== itemId));
  };

  // Calculs
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);
  
  // Regroupement par catégorie (par défaut "Au Menu" si le champ catégorie n'existe pas encore)
  const categories = [...new Set(menuItems.map(i => i.category || "Au Menu"))];

  // ==========================================
  // AFFICHAGE DU CHARGEMENT
  // ==========================================
  if (isLoadingMenu) {
      return (
          <div className="flex flex-col h-screen items-center justify-center bg-slate-50 text-slate-400">
              <Loader2 size={48} className={`animate-spin text-${themeColor}-500 mb-4`} />
              <p className="font-bold uppercase tracking-widest text-sm">Chargement du menu...</p>
          </div>
      );
  }

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
            {menuItems.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-3xl border border-slate-100">
                    <p className="text-slate-500 font-bold">Aucun plat n'est actuellement disponible.</p>
                </div>
            ) : (
                categories.map(cat => (
                    <div key={cat} id={cat} className="mb-12 scroll-mt-24">
                        <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-wider border-b pb-2">{cat}</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {menuItems.filter(i => (i.category || "Au Menu") === cat).map((item) => (
                                <div key={item._id} className="bg-white p-5 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all flex gap-4 items-center group">
                                    
                                    {/* Image du plat (si elle existe) */}
                                    {item.imageUrl && (
                                        <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 text-lg leading-tight">{item.name}</h4>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.description}</p>
                                        <p className={`text-${themeColor}-600 font-black mt-2`}>{item.price.toLocaleString()} FCFA</p>
                                    </div>

                                    <button 
                                        onClick={() => addToCart(item)}
                                        className={`shrink-0 w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-${themeColor}-600 group-hover:text-white transition-colors shadow-sm`}
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
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
                                              <button onClick={() => removeFromCart(item._id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><X size={18}/></button>
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
                                    localStorage.setItem('tempRestaurantCart', JSON.stringify({ cart, cartTotal, lieu }));
                                    window.location.href = `/gastronomie/checkout/${lieu}`;
                                }}
                                >
                                  {cart.length === 0 ? "PANIER VIDE" : "PASSER À LA CAISSE"}
                              </button>
                          </div>
                      </>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}