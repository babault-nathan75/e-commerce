"use client";

import { use, useState } from "react"; // Next 15+ use() pour params
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createTableBooking } from "@/lib/actions/restaurant"; // Action à créer plus bas

export default function ReservationPage({ params }) {
  // Dans Next.js 15, params est une Promise, on utilise `use`
  const resolvedParams = use(params);
  const lieu = resolvedParams.lieu;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const restaurantName = lieu === "hebron" ? "Hebron Ivoire (Assinie)" : "Espace Teresa (Bassam)";
  const themeColor = lieu === "hebron" ? "orange" : "purple";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    formData.append("restaurant", lieu);

    const res = await createTableBooking(formData);
    if (res.success) {
        setSuccess(res.code);
    } else {
        alert("Erreur: " + res.error);
    }
    setLoading(false);
  }

  if (success) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md w-full">
                  <div className={`w-20 h-20 mx-auto bg-${themeColor}-100 text-${themeColor}-600 rounded-full flex items-center justify-center mb-6`}>
                      <CheckCircle2 size={40} />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase">Table Réservée !</h1>
                  <p className="text-slate-500 mt-2">Votre code unique :</p>
                  <div className="my-6 text-4xl font-mono font-bold text-slate-800 bg-slate-100 py-4 rounded-xl">
                      {success}
                  </div>
                  <Link href="/gastronomie" className={`block w-full py-4 bg-${themeColor}-600 text-white font-bold rounded-xl`}>
                      Retour
                  </Link>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden grid lg:grid-cols-5 min-h-[600px]">
        
        {/* COLONNE GAUCHE (Image & Info) */}
        <div className={`lg:col-span-2 bg-${themeColor}-600 text-white p-10 flex flex-col justify-between relative overflow-hidden`}>
           <div className="relative z-10">
               <Link href="/gastronomie" className="text-white/60 hover:text-white text-sm font-bold mb-8 block">← RETOUR</Link>
               <h1 className="text-4xl font-black uppercase leading-none mb-4">{restaurantName}</h1>
               <p className="text-white/80">Remplissez le formulaire pour garantir votre table. Une confirmation vous sera envoyée par SMS/Email.</p>
           </div>
           
           {/* Formes décoratives */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        </div>

        {/* COLONNE DROITE (Formulaire) */}
        <div className="lg:col-span-3 p-8 md:p-12 bg-white">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Calendar className={`text-${themeColor}-600`} /> Détails de réservation
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Date</label>
                        <input type="date" name="date" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Plage Horaire</label>
                        <select name="timeSlot" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900">
                            <option>12:00 - 14:00 (Déjeuner)</option>
                            <option>19:00 - 21:00 (Dîner)</option>
                            <option>21:00 - 23:00 (Soirée)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Nombre de Personnes</label>
                    <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input type="number" name="guests" min="1" max="20" placeholder="Ex: 2" className="w-full pl-12 bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Vos Coordonnées</label>
                    <input type="text" name="name" placeholder="Nom Complet" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900 mb-3" />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="tel" name="phone" placeholder="Téléphone" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900" />
                        <input type="email" name="email" placeholder="Email (Optionnel)" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                </div>

                <button 
                    disabled={loading}
                    type="submit" 
                    className={`w-full py-5 rounded-2xl text-white font-black text-lg shadow-xl hover:opacity-90 transition-all ${lieu === 'hebron' ? 'bg-orange-600 shadow-orange-200' : 'bg-purple-600 shadow-purple-200'}`}
                >
                    {loading ? "Traitement..." : "CONFIRMER LA TABLE"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}