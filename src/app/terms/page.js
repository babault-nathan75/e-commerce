import { 
  FileText, ShieldCheck, Truck, CreditCard, 
  RefreshCcw, Mail, MessageCircle, Clock 
} from "lucide-react";

export default function TermsPage() {
  const lastUpdate = "10 Janvier 2026";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500">
      {/* HEADER SECTION */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-widest mb-6">
            <Clock size={14} /> Mise à jour : {lastUpdate}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 italic">
            CONDITIONS GÉNÉRALES <span className="text-orange-500 text-stroke">DE VENTE</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Bienvenue sur <span className="font-bold text-gray-900 dark:text-white">Hebron Ivoire Shops</span>. 
            Ces conditions définissent le cadre légal de vos achats pour garantir une expérience transparente et sécurisée.
          </p>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-16">
          
          {/* Section 1 */}
          <section className="group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl group-hover:bg-orange-500 transition-colors">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">
                  01. Commandes et Disponibilité
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Toute commande passée génère un code unique (ex: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded font-mono text-orange-500">ME-XXXX</code>). 
                  Nos produits sont proposés dans la limite des stocks. En cas de rupture après commande, nous vous proposerons un produit équivalent ou un remboursement total immédiat.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl group-hover:bg-orange-500 transition-colors">
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">
                  02. Prix et Paiement
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Tous nos prix sont indiqués en <span className="font-bold text-gray-900 dark:text-white underline decoration-orange-500">FCFA</span>. 
                  Nous acceptons les paiements via <span className="font-medium italic">Orange Money, Wave, Cartes Bancaires</span> et le paiement à la livraison (selon éligibilité géographique).
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl group-hover:bg-orange-500 transition-colors">
                <Truck size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">
                  03. Livraison
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Expédition express sur <span className="font-bold">Abidjan, Assinie et Bassam</span> (24h-48h). 
                  Livraison nationale en 72h-96h. Le client est tenu de vérifier l'intégrité du colis en présence du livreur avant signature.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 - Mise en avant (Vert) */}
          <section className="relative p-8 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
            <RefreshCcw className="absolute -top-4 -right-4 text-emerald-200/50 dark:text-emerald-900/20" size={120} />
            <div className="relative flex items-start gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none">
                <RefreshCcw size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tight mb-3">
                  04. Retours et Échanges
                </h2>
                <p className="text-emerald-800/80 dark:text-emerald-500/80 leading-relaxed">
                  Vous disposez de <span className="font-black text-emerald-600 underline">48 heures</span> après réception pour signaler un défaut. 
                  Le produit doit être rendu dans son emballage d'origine avec sa facture. 
                  Les frais de retour incombent au client, sauf erreur logistique de notre part.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="group border-l-2 border-gray-100 dark:border-gray-800 pl-8 ml-6">
            <div className="flex items-start gap-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-orange-500" /> 05. Confidentialité
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed italic">
                  Vos données (Nom, Téléphone, Adresse) sont strictement sanctifiées pour le traitement de vos commandes. 
                  Hebron Ivoire Shops s'engage à ne jamais céder vos informations à des tiers.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* SUPPORT / FOOTER CTA */}
        <div className="mt-24 pt-12 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-center font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8">
            Besoin d'assistance ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="https://wa.me/2250503117454" className="flex items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-orange-500 hover:text-white transition-all group">
              <MessageCircle size={20} className="text-orange-500 group-hover:text-white" />
              <span className="font-bold text-sm">WhatsApp Support</span>
            </a>
            <a href="mailto:hebronivoireshops@gmail.com" className="flex items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-orange-500 hover:text-white transition-all group">
              <Mail size={20} className="text-orange-500 group-hover:text-white" />
              <span className="font-bold text-sm">hebronivoireshops@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}