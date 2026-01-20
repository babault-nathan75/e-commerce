import React from 'react';
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-yellow-50 text-gray-800 font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="relative pt-20 pb-16 px-6 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-xs md:text-sm font-bold tracking-wide uppercase">
            🚀 Une aventure humaine & locale
          </span>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Notre Histoire & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">Nos Engagements</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Plus qu’une boutique, <span className="font-bold text-gray-900">Hebron Ivoire Shops</span> est un pont entre l'autonomisation de la jeunesse et l'excellence du service.
          </p>
        </div>

        {/* Decorative blur element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl opacity-30 -z-0"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24 space-y-24">

        {/* --- 1. QUI SOMMES NOUS (Carte Design) --- */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              <span className="text-brand-green border-b-4 border-yellow-300">Qui sommes-nous ?</span>
            </h2>
            <div className="prose prose-lg text-gray-600">
              <p>
                Bienvenue chez <strong>Hebron Ivoire Shops</strong>. Nous sommes une équipe de passionnés basés à <span className="text-orange-600 font-semibold">Abidjan, Bassam et Assinie</span>, dédiés à dénicher pour vous le meilleur des produits importés et locaux.
              </p>
              <p>
                Notre aventure a commencé en <strong>2026</strong> avec un constat simple : il manquait une plateforme alliant qualité supérieure, rapidité et écoute réelle. Nous avons créé ce que nous voulions utiliser.
              </p>
            </div>
          </div>
          
          {/* Bloc "Impact Social" mise en valeur */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-3xl rotate-2 opacity-20 group-hover:rotate-1 transition-transform duration-500"></div>
            <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🌱 Un projet à impact
              </h3>
              <p className="text-gray-600 italic leading-relaxed">
                "Cette boutique regroupe les projets du <strong>Centre de Projets d’Autonomisation des Jeunes</strong>, en partenariat avec la Cité Hébron Ivoire, la Fondation FeedMe et le Centre d’Accueil Mon Refuge."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-1 w-12 bg-orange-500 rounded-full"></div>
                <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest">Autonomisation</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. NOTRE MISSION (Bandeau Full width style) --- */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
           {/* Abstract pattern */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
           
           <h2 className="text-2xl md:text-3xl font-bold mb-6">Notre Mission 🎯</h2>
           <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto leading-normal opacity-90">
             "Rendre nos produits accessibles à tous, sans compromis sur la fiabilité. L'achat en ligne doit être une expérience <span className="text-yellow-400 font-medium">fluide, sécurisée et sans stress</span>."
           </p>
        </div>

        {/* --- 3. CONFIANCE (Grid inspirée de votre Home) --- */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Pourquoi nous faire confiance ?</h2>
            <p className="text-gray-500 mt-2">Quatre piliers fondamentaux</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Qualité Certifiée",
                desc: "Produits rigoureusement testés. Si on ne l'utilise pas, on ne le vend pas.",
                icon: "✅",
                color: "bg-green-50 text-green-700 border-green-200"
              },
              {
                title: "Livraison Rapide",
                desc: "Logistique locale : chez vous en 24h à 48h sur Abidjan, Bassam et Assinie.",
                icon: "🚀",
                color: "bg-orange-50 text-orange-700 border-orange-200"
              },
              {
                title: "Service Humain",
                desc: "Pas de robots. Une équipe dispo sur WhatsApp et mail pour vous.",
                icon: "🤝",
                color: "bg-blue-50 text-blue-700 border-blue-200"
              },
              {
                title: "Transparence",
                desc: "Prix net, pas de frais cachés. Facture officielle dès validation.",
                icon: "💎",
                color: "bg-purple-50 text-purple-700 border-purple-200"
              }
            ].map((item, index) => (
              <div key={index} className={`p-6 rounded-2xl border ${item.color} bg-opacity-50 hover:bg-opacity-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- 4. VALEURS & CTA FINAL --- */}
        <div className="grid md:grid-cols-5 gap-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <div className="md:col-span-3 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Nos Valeurs ❤️</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous sommes fiers de nos racines et nous engageons à soutenir l'économie numérique locale. L'intégrité et la satisfaction client sont au cœur de chaque décision. Chaque commande est un vote de confiance que nous honorons.
            </p>
          </div>
          
          <div className="md:col-span-2 flex flex-col justify-center items-center bg-yellow-50 rounded-2xl p-6 text-center space-y-4">
            <h3 className="font-bold text-gray-900">Restons connectés !</h3>
            <p className="text-sm text-gray-500">
              Découvrez les coulisses et nos offres exclusives.
            </p>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="
                group inline-flex items-center justify-center w-full
                px-6 py-3 rounded-xl
                bg-blue-600 text-white font-semibold
                shadow-lg shadow-blue-200
                transition-all duration-300
                hover:bg-blue-700 hover:shadow-xl hover:scale-105
              "
            >
              Suivre sur Facebook
              <span className="ml-2 group-hover:rotate-12 transition-transform">👍</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}