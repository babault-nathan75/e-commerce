import { 
  ShieldCheck, Eye, Lock, Database, 
  UserCheck, Bell, Smartphone, Globe 
} from "lucide-react";

export default function PrivacyPage() {
  const lastUpdate = "27 Janvier 2026";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* HERO SECTION */}
      <div className="bg-orange-500 py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <Lock size={300} className="absolute -bottom-10 -left-10 text-white" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            PROTECTION DES <span className="text-gray-900 italic underline decoration-white">DONNÉES</span>
          </h1>
          <p className="text-orange-100 text-lg max-w-xl mx-auto font-medium">
            Chez Hebron Ivoire Shops, la protection de votre vie privée n'est pas une option, c'est un engagement de fer.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* TOP BADGE */}
        <div className="flex justify-center mb-16">
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-orange-500 rounded-full text-orange-600 font-black text-xs uppercase tracking-widest">
                <ShieldCheck size={16} /> Certifié Sécurisé
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-16">
          
          {/* 1. COLLECTE */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-orange-500" size={28} />
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                01. Données Collectées
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Pour assurer la livraison de vos colis et la qualité de notre service, nous collectons uniquement les informations strictement nécessaires :
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Identité (Nom, Prénom)", "Contact (Email, Téléphone)", "Logistique (Adresse de livraison)", "Paiement (Via partenaires sécurisés)"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> {item}
                    </li>
                ))}
            </ul>
          </section>

          {/* 2. UTILISATION */}
          <section className="bg-gray-900 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="text-orange-500" size={28} />
              <h2 className="text-2xl font-black uppercase tracking-tight">
                02. Utilisation des Données
              </h2>
            </div>
            <div className="space-y-6 opacity-90">
                <div className="flex gap-4">
                    <Smartphone className="shrink-0 text-orange-500" />
                    <p><span className="font-bold text-orange-500">Notifications :</span> Envoi de vos codes ME-XXXX et suivi de commande par Email.</p>
                </div>
                <div className="flex gap-4">
                    <Globe className="shrink-0 text-orange-500" />
                    <p><span className="font-bold text-orange-500">Logistique :</span> Transmission de votre adresse uniquement à nos coursiers partenaires.</p>
                </div>
                <div className="flex gap-4">
                    <Bell className="shrink-0 text-orange-500" />
                    <p><span className="font-bold text-orange-500">Amélioration :</span> Analyse anonyme de vos préférences pour vous proposer de meilleurs produits.</p>
                </div>
            </div>
          </section>

          {/* 3. SÉCURITÉ */}
          <section className="border-l-4 border-emerald-500 pl-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-emerald-500" size={28} />
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                03. Sécurité Totale
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Vos informations sont stockées sur des serveurs cryptés. <span className="text-emerald-600 font-bold underline">Nous ne revendons jamais vos données</span> à des sociétés tierces ou à des régies publicitaires. L'accès est restreint aux seuls employés habilités de Hebron Ivoire Shops.
            </p>
          </section>

          {/* 4. VOS DROITS */}
          <section className="bg-orange-50 dark:bg-orange-950/20 p-8 rounded-[2rem] border border-orange-100 dark:border-orange-900/30">
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="text-orange-600" size={28} />
              <h2 className="text-2xl font-black text-orange-900 dark:text-orange-400 uppercase tracking-tight">
                04. Vos Droits
              </h2>
            </div>
            <p className="text-orange-800/80 dark:text-orange-500/80 mb-6 leading-relaxed">
              Conformément à la législation en vigueur, vous gardez le contrôle total sur vos informations :
            </p>
            <div className="flex flex-wrap gap-3">
                {["Droit d'accès", "Droit de rectification", "Droit à l'oubli (Suppression)"].map((btn, i) => (
                    <span key={i} className="px-4 py-2 bg-white dark:bg-orange-900/40 rounded-full text-xs font-black uppercase text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                        {btn}
                    </span>
                ))}
            </div>
            <p className="mt-6 text-sm text-orange-700/60 italic">
              Pour exercer vos droits, envoyez simplement un mail à hebronivoireshops@gmail.com.
            </p>
          </section>
        </div>

        {/* FOOTER DATE */}
        <div className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-400 text-sm italic">Dernière révision : {lastUpdate}</p>
        </div>
      </div>
    </div>
  );
}