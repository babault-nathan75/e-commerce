export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-8 border-b pb-4">Conditions Générales de Vente</h1>
      
      <p className="mb-6 text-gray-600">
        Dernière mise à jour : 10 Janvier 2026. 
        Bienvenue sur **MA BOUTIQUE**. Les présentes conditions régissent l'ensemble des transactions effectuées sur notre site.
      </p>

      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Commandes et Disponibilité</h2>
          <p className="leading-relaxed">
            Toute commande passée génère un code unique (ex: ME-XXXX). Nos produits sont proposés dans la limite des stocks. 
            En cas de rupture après commande, nous vous proposerons un produit équivalent ou un remboursement total.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Prix et Paiement</h2>
          <p className="leading-relaxed">
            Tous nos prix sont indiqués en **FCFA**. Nous acceptons les paiements via Orange Money, Wave, 
            Cartes Bancaires et le paiement à la livraison (selon la zone géographique).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. Livraison</h2>
          <p className="leading-relaxed">
            Nous livrons sur Abidjan en 24h et à l'intérieur du pays en 48h-72h. 
            Le client est responsable de vérifier l'état du colis devant le livreur.
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <h2 className="text-xl font-semibold mb-3 text-green-800">4. Retours et Échanges</h2>
          <p className="leading-relaxed text-green-900">
            Vous avez **48 heures** après réception pour signaler un défaut. Le produit doit être rendu 
            dans son emballage d'origine avec sa facture. Les frais de retour sont à la charge du client, 
            sauf en cas d'erreur de notre part.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">5. Confidentialité</h2>
          <p className="leading-relaxed text-sm">
            Vos données (Nom, Téléphone, Adresse) sont strictement utilisées pour le traitement de vos commandes. 
            Nous ne revendons jamais vos informations à des tiers.
          </p>
        </div>
      </section>

      <div className="mt-12 p-6 border-t text-center space-y-2">
        <p className="font-semibold">Une question ?</p>
        <p className="text-gray-600">Contactez notre support WhatsApp au : +225 XX XX XX XX XX</p>
      </div>
    </div>
  );
}