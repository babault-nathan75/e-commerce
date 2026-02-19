"use client";

import { useState } from "react";
import Link from "next/link";
import { Utensils, CalendarDays, MapPin, ChevronRight, ArrowLeft } from "lucide-react";

export default function GastronomieHub() {
  const [action, setAction] = useState(null); // 'order' ou 'book'

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Background Image Floue */}
      <div className="absolute inset-0 z-0 opacity-30">
        <img 
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80" 
          className="w-full h-full object-cover" 
          alt="Background"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10 h-full flex flex-col justify-center min-h-screen">
        
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft /> Retour Accueil
        </Link>

        <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
              <span className="text-orange-500">Hebron</span> Gastronomie
            </h1>
            <p className="text-xl text-slate-300">Choisissez votre expérience culinaire</p>
        </div>

        {/* ÉTAPE 1 : CHOIX DE L'ACTION */}
        {!action ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
            <button 
              onClick={() => setAction('order')}
              className="group relative h-80 bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-[2.5rem] hover:bg-orange-600 hover:border-orange-500 transition-all duration-500 flex flex-col items-center justify-center gap-6"
            >
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Utensils size={48} />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase italic">Commander</h2>
                <p className="text-white/60 group-hover:text-white/90 mt-2">Livraison & À emporter</p>
              </div>
            </button>

            <button 
              onClick={() => setAction('book')}
              className="group relative h-80 bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-[2.5rem] hover:bg-purple-600 hover:border-purple-500 transition-all duration-500 flex flex-col items-center justify-center gap-6"
            >
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarDays size={48} />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase italic">Réserver</h2>
                <p className="text-white/60 group-hover:text-white/90 mt-2">Votre table vous attend</p>
              </div>
            </button>
          </div>
        ) : (
          /* ÉTAPE 2 : CHOIX DU LIEU */
          <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
            <button onClick={() => setAction(null)} className="mb-6 text-sm text-white/50 hover:text-white">
              ← Changer d'action
            </button>
            <h2 className="text-3xl font-bold mb-8 text-center">
              {action === 'order' ? "D'où souhaitez-vous commander ?" : "Dans quel restaurant ?"}
            </h2>

            <div className="space-y-4">
              {/* LIEN HEBRON */}
              <Link 
                /* 👇 MODIFICATION ICI : Si réservation -> go menu */
                href={action === 'order' ? "/gastronomie/commande/hebron" : "/gastronomie/reservation/menu/hebron"}
                className="flex items-center justify-between p-6 bg-white text-slate-900 rounded-3xl hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                        <MapPin />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase">Hebron Ivoire</h3>
                        <p className="text-slate-500">Assinie-Mafia</p>
                    </div>
                </div>
                <ChevronRight className="text-slate-300" />
              </Link>

              {/* LIEN TERESA */}
              <Link 
                /* 👇 MODIFICATION ICI : Si réservation -> go menu */
                href={action === 'order' ? "/gastronomie/commande/teresa" : "/gastronomie/reservation/menu/teresa"}
                className="flex items-center justify-between p-6 bg-white text-slate-900 rounded-3xl hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                        <MapPin />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase">Espace Teresa</h3>
                        <p className="text-slate-500">Grand-Bassam</p>
                    </div>
                </div>
                <ChevronRight className="text-slate-300" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}