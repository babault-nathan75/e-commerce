"use client";

import { use, useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle, Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBooking } from "@/lib/actions/booking";

export default function ReservationCheckoutPage({ params }) {
    const resolvedParams = use(params);
    const lieu = resolvedParams.lieu;
    const router = useRouter();

    const themeColor = lieu === "hebron" ? "orange" : "purple";
    const restaurantName = lieu === "hebron" ? "Hebron Ivoire" : "Espace Teresa";

    const [cartData, setCartData] = useState({ cart: [], cartTotal: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successCode, setSuccessCode] = useState(null);
    const [error, setError] = useState("");

    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    useEffect(() => {
        const savedData = localStorage.getItem('tempRestaurantCart');
        if (savedData) {
            setCartData(JSON.parse(savedData));
        } else {
            router.push(`/gastronomie/reservation/menu/${lieu}`);
        }
    }, [lieu, router]);

    const validateDateTime = (dateVal, timeVal) => {
        if (!dateVal) return "Veuillez choisir une date.";
        if (!timeVal) return "Veuillez choisir une heure.";
        
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (dateVal < todayStr) {
            return "Vous ne pouvez pas réserver à une date passée.";
        }

        if (dateVal === todayStr) {
            const [hours, minutes] = timeVal.split(':').map(Number);
            const bookingTime = new Date();
            bookingTime.setHours(hours, minutes, 0, 0);

            const minTime = new Date();
            minTime.setHours(minTime.getHours() + 4); 

            if (bookingTime < minTime) {
                return `Pour aujourd'hui, merci de réserver au moins 4h à l'avance (après ${minTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}).`;
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const dateError = validateDateTime(selectedDate, selectedTime);
        if (dateError) {
            setError(dateError);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        
        const formData = new FormData(e.target);
        // 🛠️ CRUCIAL : On s'assure que les clés correspondent à l'action serveur
        formData.append("cart", JSON.stringify(cartData.cart));
        formData.append("total", cartData.cartTotal);
        formData.append("restaurant", lieu);

        try {
            const res = await createBooking(formData);
            if (res.success) {
                setSuccessCode(res.bookingCode);
                localStorage.removeItem('tempRestaurantCart');
            } else {
                setError(res.error || "Erreur lors de l'enregistrement");
            }
        } catch (err) {
            setError("Erreur de connexion serveur.");
        }
        setIsSubmitting(false);
    };

    const todayISO = new Date().toISOString().split('T')[0];

    if (successCode) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center">
                    {/* Correction des classes dynamiques pour éviter les purges Tailwind */}
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${lieu === 'hebron' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Réservation envoyée !</h2>
                    <p className="text-slate-500 font-medium mb-8">Nous vérifions votre paiement et votre table sera bloquée.</p>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8 font-mono font-black text-xl text-slate-700">
                        {successCode}
                    </div>
                    <Link href={`/gastronomie`} className="block w-full py-4 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-colors">
                        RETOUR AU MENU
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-100 p-6 flex items-center gap-4 sticky top-0 z-10">
                <Link href={`/gastronomie/reservation/menu/${lieu}`} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-xl font-black uppercase text-slate-900">Réserver une table</h1>
                    <p className={`text-sm font-bold ${lieu === 'hebron' ? 'text-orange-600' : 'text-purple-600'}`}>{restaurantName}</p>
                </div>
            </header>

            <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 flex items-start gap-3 border border-red-100">
                        <AlertCircle className="shrink-0 mt-0.5" /> 
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* RÉSUMÉ DU MENU */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Votre sélection</h3>
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-slate-700">{cartData.cart.length} Plats choisis</span>
                            <span className={`text-xl font-black ${lieu === 'hebron' ? 'text-orange-600' : 'text-purple-600'}`}>
                                {cartData.cartTotal.toLocaleString('fr-FR')} FCFA
                            </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-2 text-sm text-slate-500">
                            {cartData.cart.map((item, i) => (
                                <div key={i} className="flex justify-between border-b border-slate-50 pb-2">
                                    <span><span className="font-bold text-slate-900">x{item.quantity}</span> {item.name}</span>
                                    <span className="font-medium text-slate-700">{(item.price * item.quantity).toLocaleString('fr-FR')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DÉTAILS TABLE */}
                    {/* ==========================================
                        BLOC DÉTAILS DE LA TABLE (DESIGN PREMIUM)
                        ========================================== */}
                    <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${lieu === 'hebron' ? 'bg-orange-500 text-white' : 'bg-purple-600 text-white'}`}>
                                1
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xl italic">Configuration de la Table</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Étape de planification temporelle</p>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12">
                            
                            {/* --- LE GRAND CALENDRIER --- */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Calendar size={14} className={lieu === 'hebron' ? 'text-orange-500' : 'text-purple-500'} /> 
                                        Date de Réception
                                    </label>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${lieu === 'hebron' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Sélectionnez un jour'}
                                    </span>
                                </div>
                                
                                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                                    {/* On garde l'input natif invisible pour la soumission du formulaire mais on utilise un calendrier stylisé */}
                                    <input 
                                        type="date" 
                                        name="date" 
                                        required 
                                        min={todayISO}
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full p-4 rounded-2xl border-2 border-white bg-white shadow-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer text-center text-lg"
                                    />
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                        {/* Raccourcis rapides style "Chips" */}
                                        {[0, 1, 2, 7].map((offset) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() + offset);
                                            const iso = d.toISOString().split('T')[0];
                                            const label = offset === 0 ? "Aujourd'hui" : offset === 1 ? "Demain" : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
                                            return (
                                                <button
                                                    key={offset}
                                                    type="button"
                                                    onClick={() => setSelectedDate(iso)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedDate === iso ? (lieu === 'hebron' ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-purple-600 text-white shadow-purple-200') + ' shadow-lg scale-105' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* --- L'HORLOGE ANALOGIQUE --- */}
                            <div className="space-y-6 flex flex-col items-center">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] self-start flex items-center gap-2">
                                    <Clock size={14} className={lieu === 'hebron' ? 'text-orange-500' : 'text-purple-500'} /> 
                                    Heure
                                </label>

                                <div className="relative group">
                                    {/* Cadran de l'horloge */}
                                    <div className="w-56 h-56 rounded-full border-[8px] border-slate-900 bg-white shadow-2xl relative flex items-center justify-center">
                                        {/* Points des heures */}
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="absolute inset-2 text-center" style={{ transform: `rotate(${i * 30}deg)` }}>
                                                <div className="w-1 h-3 bg-slate-200 mx-auto rounded-full" />
                                            </div>
                                        ))}
                                        
                                        {/* Aiguille des Heures (Dynamique) */}
                                        <div 
                                            className={`absolute w-1.5 h-16 rounded-full bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom transition-all duration-700 ease-out ${lieu === 'hebron' ? 'bg-orange-500' : 'bg-purple-600'}`}
                                            style={{ transform: `translateX(-50%) rotate(${(parseInt(selectedTime.split(':')[0]) || 0) * 30 + (parseInt(selectedTime.split(':')[1]) || 0) * 0.5}deg)` }}
                                        />
                                        
                                        {/* Aiguille des Minutes (Dynamique) */}
                                        <div 
                                            className="absolute w-1 h-20 bg-slate-800 rounded-full bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom transition-all duration-700 ease-out"
                                            style={{ transform: `translateX(-50%) rotate(${(parseInt(selectedTime.split(':')[1]) || 0) * 6}deg)` }}
                                        />
                                        
                                        {/* Point central */}
                                        <div className="w-4 h-4 bg-slate-900 rounded-full z-10 border-4 border-white shadow-sm" />
                                    </div>

                                    {/* Sélecteur de temps stylisé */}
                                    <div className="mt-8">
                                        <input 
                                            type="time" 
                                            name="timeSlot" 
                                            required 
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            className={`text-2xl p-4 rounded-2xl bg-white border-3 border-gray-400 text-black outline-none ring-offset-4 focus:ring-4 ${lieu === 'hebron' ? 'focus:ring-orange-500/20' : 'focus:ring-purple-600/20'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* --- NOMBRE DE PERSONNES (FULL WIDTH) --- */}
                            <div className="md:col-span-2 pt-6 border-t border-slate-50">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block">Nombre de convives</label>
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                    <div className={`p-4 rounded-xl ${lieu === 'hebron' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                                        <Users size={24} />
                                    </div>
                                    <input 
                                        type="number" 
                                        name="guests" 
                                        min="1" 
                                        max="50" 
                                        required 
                                        placeholder="Ex: 4 personnes" 
                                        className="flex-1 bg-transparent text-xl font-black text-slate-800 outline-none placeholder:text-slate-300" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INFOS CLIENT ET PAIEMENT */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${lieu === 'hebron' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>2</div>
                            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Vos Coordonnées & Paiement</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase">Nom & prénom(s) <span className="text-red-500">*</span></label>
                                <input type="text" name="name" required placeholder="Votre nom" className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase">Téléphone <span className="text-red-500">*</span></label>
                                <input type="tel" name="phone" required placeholder="01 02 03 04 05" className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-slate-200" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-black text-slate-500 uppercase">Email (recommandé)</label>
                                <input type="email" name="email" placeholder="votre@email.com" className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-slate-200" />
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white p-6 rounded-2xl mt-6">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-4">Envoyez {cartData.cartTotal.toLocaleString('fr-FR')} FCFA à :</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-3 rounded-xl border border-white/5"><span className="font-bold text-blue-300">Wave</span> 05 03 11 74 54</div>
                                <div className="bg-white/10 p-3 rounded-xl border border-white/5"><span className="font-bold text-yellow-300">MTN</span> 05 03 11 74 54</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase">Preuve de paiement <span className="text-red-500">*</span></label>
                            <input type="file" name="paymentProof" accept="image/*" required className="w-full p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200" />
                        </div>
                        <label className="text-slate-500">NB: Cliquez sur le carré avec les pointillés</label>

                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting} 
                        className={`w-full py-5 rounded-2xl text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 ${lieu === 'hebron' ? 'bg-gradient-to-r from-orange-600 to-orange-500' : 'bg-gradient-to-r from-purple-600 to-purple-500'}`}
                    >
                        {isSubmitting ? "ENVOI EN COURS..." : "CONFIRMER LA RÉSERVATION"}
                    </button>
                </form>
            </main>
        </div>
    );
}