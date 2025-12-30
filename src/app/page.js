import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-yellow-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center space-y-6">
          <span className="inline-block px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
            🇨🇮 Commerce local & digital
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold">
            <span className="text-brand-green">Bienvenue sur</span>{" "}
            <span className="text-brand-orange">my-ecommerce</span>
          </h1>

          <p className="max-w-2xl mx-auto text-gray-600 text-lg">
            Découvrez, commandez et suivez vos produits préférés en toute
            simplicité. Une expérience moderne, rapide et sécurisée.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            href="/shop"
            className="
              group inline-flex items-center justify-center
              px-8 py-4 rounded-xl
              bg-gradient-to-r from-orange-500 to-yellow-400
              text-white font-semibold text-lg
              shadow-lg shadow-orange-200
              transition-all duration-300
              hover:scale-105 hover:shadow-xl
              focus:outline-none focus:ring-4 focus:ring-orange-300
            "
          >
            🛒 Accéder à la boutique
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            href="/library"
            className="
              group inline-flex items-center justify-center
              px-8 py-4 rounded-xl
              bg-white
              text-brand-green font-semibold text-lg
              border-2 border-brand-green
              shadow-md
              transition-all duration-300
              hover:bg-brand-green hover:text-white
              hover:scale-105
              focus:outline-none focus:ring-4 focus:ring-green-200
            "
          >
            📚 Explorer la librairie
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Paiement sécurisé",
              text: "Transactions fiables et protégées à chaque commande.",
              color: "text-brand-green"
            },
            {
              title: "Livraison rapide",
              text: "Un suivi clair de vos commandes, du panier à la réception.",
              color: "text-brand-orange"
            },
            {
              title: "Support réactif",
              text: "Une équipe à votre écoute pour vous accompagner.",
              color: "text-yellow-600"
            }
          ].map((f, i) => (
            <div
              key={i}
              className="
                rounded-2xl bg-white p-6
                shadow-sm hover:shadow-lg
                transition-all duration-300
                border
              "
            >
              <h3 className={`font-bold text-xl ${f.color}`}>
                {f.title}
              </h3>
              <p className="mt-2 text-gray-600">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
