"use client";

import { use, useState, useEffect } from "react";
import { ArrowLeft, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createFoodOrder } from "@/lib/actions/foodOrder";

export default function RestaurantCheckoutPage({ params }) {
    const resolvedParams = use(params);
    const lieu = resolvedParams.lieu;
    const router = useRouter();

    const themeColor = lieu === "hebron" ? "orange" : "purple";
    const restaurantName = lieu === "hebron" ? "Hebron Ivoire" : "Espace Teresa";

    const [cartData, setCartData] = useState({ cart: [], cartTotal: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null); // Contient le orderCode si succès
    const [error, setError] = useState("");

    // Récupérer le panier depuis le localStorage au chargement
    useEffect(() => {
        const savedData = localStorage.getItem('tempRestaurantCart');
        if (savedData) {
            setCartData(JSON.parse(savedData));
        } else {
            // Si pas de panier, on renvoie au menu
            router.push(`/gastronomie/commande/${lieu}`);
        }
    }, [lieu, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        
        const formData = new FormData(e.target);
        formData.append("cart", JSON.stringify(cartData.cart));
        formData.append("total", cartData.cartTotal);
        formData.append("restaurant", lieu);

        try {
            const res = await createFoodOrder(formData);
            if (res.success) {
                setOrderSuccess(res.orderCode);
                localStorage.removeItem('tempRestaurantCart'); // Nettoyer
            } else {
                setError(res.error || "Erreur inconnue");
            }
        } catch (err) {
            setError("Impossible de contacter le serveur.");
        }
        setIsSubmitting(false);
    };

    // ÉCRAN DE SUCCÈS
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center">
                    <div className={`w-24 h-24 bg-${themeColor}-100 text-${themeColor}-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in`}>
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Preuve reçue !</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">Dès validation de votre paiement, la cuisine lance la préparation !</p>
                    
                    <div className="bg-slate-50 p-6 rounded-2xl w-full border border-slate-100 mb-8 shadow-inner">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Votre Code de suivi</p>
                        <p className={`text-3xl font-black text-${themeColor}-600 font-mono tracking-widest`}>{orderSuccess}</p>
                    </div>

                    <Link href={`/gastronomie/commande/${lieu}`} className="block w-full py-4 rounded-xl bg-slate-900 text-white font-black text-lg hover:bg-slate-800 transition-colors">
                        RETOURNER AU MENU
                    </Link>
                </div>
            </div>
        );
    }

    // ÉCRAN DE PAIEMENT
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header minimaliste */}
            <header className="bg-white border-b border-slate-100 p-6 flex items-center gap-4 sticky top-0 z-10">
                <Link href={`/gastronomie/commande/${lieu}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase">Finaliser la commande</h1>
                    <p className={`text-sm font-bold text-${themeColor}-600`}>{restaurantName}</p>
                </div>
            </header>

            <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold flex items-center gap-3 mb-6">
                        <AlertCircle /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* BLOC 1: PAIEMENT */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-700">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-${themeColor}-500 to-${themeColor}-400 flex items-center justify-center text-sm font-black shadow-inner`}>1</div>
                                <h3 className="font-bold text-slate-300 uppercase tracking-widest text-sm">Montant à régler</h3>
                            </div>
                            <p className="text-5xl font-black text-white mb-10 tracking-tight">{cartData.cartTotal.toLocaleString()} FCFA</p>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-sm font-black shadow-lg shadow-blue-500/30">W</div>
                                        <span className="font-bold text-blue-50">Wave</span>
                                    </div>
                                    <span className="font-mono font-bold text-lg tracking-widest text-white">05 03 11 74 54</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-black shadow-lg shadow-orange-500/30">M</div>
                                        <span className="font-bold text-orange-50">MTN</span>
                                    </div>
                                    <span className="font-mono font-bold text-lg tracking-widest text-white">05 03 11 74 54</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BLOC 2: PREUVE ET INFOS */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-full bg-${themeColor}-100 text-${themeColor}-600 flex items-center justify-center text-sm font-black`}>2</div>
                            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Informations & Preuve</h3>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-500 uppercase tracking-wider flex justify-between">
                                Capture de paiement <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="file" 
                                name="paymentProof" 
                                accept="image/*" 
                                required 
                                className={`block w-full text-sm text-slate-500 
                                  file:mr-5 file:py-3 file:px-6 file:rounded-xl file:border-0 
                                  file:text-xs file:font-black file:uppercase file:tracking-wider
                                  file:bg-${themeColor}-50 file:text-${themeColor}-700 
                                  hover:file:bg-${themeColor}-100 transition-all cursor-pointer 
                                  border-2 border-dashed border-slate-200 hover:border-${themeColor}-300 
                                  p-6 rounded-2xl bg-slate-50 hover:bg-white`} 
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Nom complet <span className="text-red-500">*</span></label>
                                <input type="text" name="name" required placeholder="Ex: Jean D." className={`w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-${themeColor}-500/50 focus:border-${themeColor}-500 focus:bg-white transition-all`} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Téléphone <span className="text-red-500">*</span></label>
                                <input type="tel" name="phone" required placeholder="0102030405" className={`w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-${themeColor}-500/50 focus:border-${themeColor}-500 focus:bg-white transition-all`} />
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">e-mail <span className="text-red-500">*</span></label>
                            <input type="email" name="email" required placeholder="jean.d@example.com" className={`w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-${themeColor}-500/50 focus:border-${themeColor}-500 focus:bg-white transition-all`} />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Adresse de livraison <span className="text-red-500">*</span></label>
                            <textarea name="address" required placeholder="Quartier, repère exact, instructions pour le livreur..." rows="4" className={`w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-${themeColor}-500/50 focus:border-${themeColor}-500 focus:bg-white transition-all resize-none leading-relaxed`}></textarea>
                        </div>
                    </div>

                    {/* BOUTON CONFIRMER */}
                    <button 
                        type="submit"
                        disabled={isSubmitting || cartData.cartTotal === 0}
                        className={`w-full py-6 rounded-2xl text-white font-black text-xl hover:translate-y-[-2px] transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-3 shadow-xl ${lieu === 'hebron' ? 'bg-gradient-to-r from-orange-600 to-orange-500 shadow-orange-500/25' : 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-purple-500/25'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>TRAITEMENT...</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud size={28} />
                                <span>ENVOYER LA PREUVE DE PAIEMENT</span>
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}