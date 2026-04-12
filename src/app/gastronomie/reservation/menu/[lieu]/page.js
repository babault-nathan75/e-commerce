"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, ArrowLeft, Plus, Minus, Loader2 } from "lucide-react";
import Link from "next/link";
import { getPublicMenu } from "@/lib/actions/menuItem"; // Ton action serveur

export default function MenuSelectionPage({ params }) {
  const resolvedParams = use(params);
  const lieu = resolvedParams.lieu;
  const router = useRouter();

  const themeColor = lieu === "hebron" ? "orange" : "purple";
  const restaurantName = lieu === "hebron" ? "Hebron Ivoire" : "Espace Teresa";

  // États pour les données de la BDD
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");

  // État du panier : { "ID_DU_PLAT": { ...item, quantity: 1 } }
  const [cart, setCart] = useState({});

  // 1. Charger les plats depuis MongoDB au montage
  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      const data = await getPublicMenu(lieu);
      setMenuItems(data);
      
      // Définir la première catégorie par défaut
      const cats = [...new Set(data.map(i => i.category || "Au Menu"))];
      if (cats.length > 0) setActiveCategory(cats[0]);
      
      setIsLoading(false);
    };
    fetchMenu();
  }, [lieu]);

  // Regroupement des plats par catégories pour l'affichage
  const categoriesList = [...new Set(menuItems.map(i => i.category || "Au Menu"))];

  // Gestion de l'ajout/retrait
  const updateQuantity = (item, delta) => {
    setCart(prev => {
      const newCart = { ...prev };
      const currentQty = newCart[item._id]?.quantity || 0;
      const newQty = currentQty + delta;

      if (newQty <= 0) {
        delete newCart[item._id];
      } else {
        newCart[item._id] = { ...item, quantity: newQty };
      }
      return newCart;
    });
  };

  // Calcul du total
  const cartItems = Object.values(cart);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleValidate = () => {
    const finalCart = {
      cart: cartItems,
      cartTotal: totalAmount,
      lieu: lieu
    };
    localStorage.setItem('tempRestaurantCart', JSON.stringify(finalCart));
    router.push(`/gastronomie/reservation/checkout/${lieu}`);
  };

  if (isLoading) return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-50 text-slate-400">
      <Loader2 size={48} className={`animate-spin text-${themeColor}-500 mb-4`} />
      <p className="font-bold uppercase tracking-widest text-sm">Chargement du menu...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/gastronomie`} className="p-2 -ml-2 hover:bg-slate-50 rounded-full">
            <ArrowLeft className="text-slate-600" />
          </Link>
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Réserver chez</p>
            <h1 className={`text-lg font-black text-${themeColor}-600`}>{restaurantName}</h1>
          </div>
          <div className="w-10"></div>
        </div>
        
        {/* BARRE DE CATÉGORIES */}
        <div className="flex overflow-x-auto px-4 pb-0 hide-scrollbar gap-6 max-w-3xl mx-auto">
            {categoriesList.map((cat) => (
                <button 
                    key={cat}
                    onClick={() => {
                        setActiveCategory(cat);
                        document.getElementById(cat)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`pb-3 whitespace-nowrap text-sm font-bold transition-colors border-b-2 ${
                        activeCategory === cat 
                        ? `text-${themeColor}-600 border-${themeColor}-600` 
                        : "text-slate-400 border-transparent hover:text-slate-600"
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </header>

      {/* LISTE DES PLATS */}
      <main className="max-w-3xl mx-auto p-4 space-y-8 mt-6">
        {categoriesList.map((cat) => (
            <div key={cat} id={cat} className="scroll-mt-36">
                <h2 className="font-black text-xl text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tight">
                    {cat}
                </h2>
                <div className="grid gap-4">
                    {menuItems.filter(i => (i.category || "Au Menu") === cat).map((item) => {
                        const qty = cart[item._id]?.quantity || 0;
                        return (
                            <div key={item._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-slate-200 transition-all">
                                <div className="flex gap-4 items-center">
                                    {item.imageUrl && (
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                                        <p className="text-slate-500 font-mono text-sm">{item.price.toLocaleString()} FCFA</p>
                                    </div>
                                </div>
                                
                                {qty === 0 ? (
                                    <button 
                                        onClick={() => updateQuantity(item, 1)}
                                        className={`w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-${themeColor}-100 hover:text-${themeColor}-600 transition-colors shadow-sm`}
                                    >
                                        <Plus size={20} />
                                    </button>
                                ) : (
                                    <div className={`flex items-center gap-3 bg-${themeColor}-50 px-2 py-1 rounded-full border border-${themeColor}-100`}>
                                        <button onClick={() => updateQuantity(item, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-600 shadow-sm">
                                            <Minus size={16} />
                                        </button>
                                        <span className={`font-black text-${themeColor}-700 w-4 text-center`}>{qty}</span>
                                        <button onClick={() => updateQuantity(item, 1)} className={`w-8 h-8 flex items-center justify-center bg-${themeColor}-600 rounded-full text-white shadow-sm`}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
      </main>

      {/* BARRE FLOTTANTE DU BAS */}
      {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30">
              <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{totalItems} article(s) sélectionné(s)</p>
                      <p className="text-2xl font-black text-slate-900">{totalAmount.toLocaleString()} <span className="text-sm font-normal text-slate-500">FCFA</span></p>
                  </div>
                  <button 
                    onClick={handleValidate}
                    className={`px-8 py-4 rounded-xl font-black text-white shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all ${lieu === 'hebron' ? 'bg-orange-600 shadow-orange-200' : 'bg-purple-600 shadow-purple-200'}`}
                  >
                      SUIVANT <ArrowRight size={20} />
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}