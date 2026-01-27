import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-b from-white via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      
      {/* Background decoration (Glow effect) visible mainly in dark mode */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-green-500/10 dark:bg-green-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
        
        {/* --- HERO SECTION --- */}
        <div className="text-center space-y-8">
          
          {/* Badge */}
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold 
            bg-yellow-100 text-yellow-800 border border-yellow-200
            dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50
            transition-colors duration-300">
            🇨🇮 Commerce local & digital
          </span>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <span className="block mb-2">Bienvenue sur</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-emerald-300">
              Hebron
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 dark:from-orange-400 dark:to-yellow-300">
              Ivoire Shops
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Découvrez, commandez et suivez vos produits préférés en toute simplicité. 
            Une expérience <span className="text-gray-900 dark:text-white font-medium">moderne</span>, <span className="text-gray-900 dark:text-white font-medium">rapide</span> et <span className="text-gray-900 dark:text-white font-medium">sécurisée</span>.
          </p>
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/shop"
            className="
              group relative inline-flex items-center justify-center px-8 py-4 rounded-xl
              bg-gradient-to-r from-orange-500 to-yellow-500
              text-white font-bold text-lg
              shadow-lg shadow-orange-500/30 dark:shadow-orange-900/20
              transition-all duration-300
              hover:scale-105 hover:shadow-orange-500/50
              focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-900
            "
          >
            🛒 Accéder à l'espace boutique
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>

          <Link
            href="/library"
            className="
              group inline-flex items-center justify-center px-8 py-4 rounded-xl
              bg-white dark:bg-gray-800
              text-green-700 dark:text-green-400 font-bold text-lg
              border-2 border-green-600/20 dark:border-green-500/20
              shadow-sm dark:shadow-none
              transition-all duration-300
              hover:border-green-600 dark:hover:border-green-400
              hover:text-green-800 dark:hover:text-green-300
              hover:scale-105 hover:bg-green-50 dark:hover:bg-gray-700
            "
          >
            📚 Explorer la librairie chrétienne
          </Link>
        </div>

        {/* --- FEATURES GRID --- */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Paiement sécurisé",
              text: "Transactions fiables et protégées à chaque commande.",
              icon: "🔒",
              colorLight: "text-green-600",
              colorDark: "dark:text-green-400",
              border: "group-hover:border-green-200 dark:group-hover:border-green-800"
            },
            {
              title: "Livraison rapide",
              text: "Un suivi clair de vos commandes, du panier à la réception.",
              icon: "🚀",
              colorLight: "text-orange-500",
              colorDark: "dark:text-orange-400",
              border: "group-hover:border-orange-200 dark:group-hover:border-orange-800"
            },
            {
              title: "Support réactif",
              text: "Une équipe à votre écoute pour vous accompagner.",
              icon: "💬",
              colorLight: "text-yellow-600",
              colorDark: "dark:text-yellow-400",
              border: "group-hover:border-yellow-200 dark:group-hover:border-yellow-800"
            }
          ].map((f, i) => (
            <div
              key={i}
              className={`
                group p-8 rounded-2xl
                bg-white dark:bg-gray-800/50
                border border-gray-100 dark:border-gray-700
                shadow-sm hover:shadow-xl dark:shadow-black/30
                transition-all duration-300
                hover:-translate-y-1
                ${f.border}
              `}
            >
              <div className="text-4xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                {f.icon}
              </div>
              <h3 className={`font-bold text-xl mb-3 ${f.colorLight} ${f.colorDark}`}>
                {f.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {f.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}