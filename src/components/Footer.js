import Link from "next/link";
import { FaWhatsapp, FaFacebook, FaInstagram, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Colonne 1 : Brand & Mission */}
        <div className="space-y-4">
          <h2 className="text-white text-xl font-bold italic">MA BOUTIQUE</h2>
          <p className="text-sm leading-relaxed">
            Votre destination de confiance pour [tes produits] à Abidjan. 
            Qualité garantie et livraison rapide partout en Côte d'Ivoire.
          </p>
          <div className="flex space-x-4 text-xl">
            <a href="#" className="hover:text-green-500 transition"><FaWhatsapp /></a>
            <a href="#" className="hover:text-blue-500 transition"><FaFacebook /></a>
            <a href="#" className="hover:text-pink-500 transition"><FaInstagram /></a>
          </div>
        </div>

        {/* Colonne 2 : Liens Rapides */}
        <div>
          <h3 className="text-white font-semibold mb-4">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Accueil</Link></li>
            <li><Link href="/products" className="hover:text-white">Nos Produits</Link></li>
            <li><Link href="/order/track" className="hover:text-white">Suivre ma commande</Link></li>
            <li><Link href="/about" className="hover:text-white">À propos de nous</Link></li>
          </ul>
        </div>

        {/* Colonne 3 : Aide & Légal */}
        <div>
          <h3 className="text-white font-semibold mb-4">Assistance</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-white">Conditions de Vente (CGV)</Link></li>
            <li><Link href="/faq" className="hover:text-white">Foire aux questions</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Confidentialité</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contactez-nous</Link></li>
          </ul>
        </div>

        {/* Colonne 4 : Contact Direct */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-1 text-green-500" />
              <span>Abidjan, Cocody Angré, Côte d'Ivoire</span>
            </li>
            <li className="flex items-center gap-3">
              <FaWhatsapp className="text-green-500" />
              <span>+225 XX XX XX XX XX</span>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-green-500" />
              <span>contact@maboutique.ci</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Barre de copyright */}
      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-xs">
        <p>© {currentYear} MA BOUTIQUE. Tous droits réservés. Développé avec passion.</p>
      </div>
    </footer>
  );
}