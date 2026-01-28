"use client";
import { useState } from "react";
import { 
  Plus, Minus, HelpCircle, Truck, 
  CreditCard, RefreshCcw, MessageCircle 
} from "lucide-react";

const faqData = [
  {
    category: "Livraison",
    icon: <Truck className="text-orange-500" size={20} />,
    questions: [
      {
        q: "Quels sont vos délais de livraison ?",
        a: "Pour Abidjan, Bassam et Assinie, nous livrons en 24h à 48h. Pour l'intérieur du pays, les délais varient entre 72h et 96h selon votre zone géographique. Nous faisons de notre mieux pour assurer une livraison rapide et efficace."
      },
      {
        q: "Comment puis-je suivre mon colis ?",
        a: "Dès validation, vous recevez un code ME-XXXX. Vous pouvez suivre l'évolution (Traitement/En cours de livraison/Livré) via votre mail de suivi ou en contactant notre support avec votre code."
      }
    ]
  },
  {
    category: "Paiements",
    icon: <CreditCard className="text-orange-500" size={20} />,
    questions: [
      {
        q: "Quels modes de paiement acceptez-vous ?",
        a: "Nous acceptons Orange Money, Wave, les cartes bancaires et le paiement en espèces à la livraison pour les zones éligibles à Abidjan, Bassam et Assinie."
      },
      {
        q: "Le paiement en ligne est-il sécurisé ?",
        a: "Absolument. Nous utilisons des protocoles SSL cryptés et des partenaires de paiement certifiés (Cinétpay/Paystack) pour garantir la sécurité de vos données bancaires."
      }
    ]
  },
  {
    category: "Retours & Échanges",
    icon: <RefreshCcw className="text-orange-500" size={20} />,
    questions: [
      {
        q: "Quelle est votre politique de retour ?",
        a: "Vous disposez de 48 heures après réception pour signaler un défaut. L'article doit être dans son emballage d'origine et non utilisé."
      },
      {
        q: "Les frais de retour sont-ils gratuits ?",
        a: "Les frais de retour sont à la charge du client, sauf si l'erreur provient de nos services (mauvais article ou article défectueux)."
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-20">
      {/* HEADER SECTION */}
      <div className="bg-gray-900 py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <HelpCircle className="mx-auto text-orange-500 mb-6" size={48} />
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            CENTRE <span className="text-orange-500 italic">D'AIDE</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Une question ? Nous avons probablement la réponse. Parcourez nos thématiques pour en savoir plus sur nos services.
          </p>
        </div>
      </div>

      {/* FAQ CONTENT */}
      <div className="max-w-3xl mx-auto px-4 -mt-10">
        <div className="space-y-12">
          {faqData.map((section, sIdx) => (
            <div key={sIdx} className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {section.category}
                </h2>
              </div>

              <div className="space-y-4">
                {section.questions.map((item, qIdx) => {
                  const currentIndex = `${sIdx}-${qIdx}`;
                  const isOpen = openIndex === currentIndex;

                  return (
                    <div 
                      key={qIdx} 
                      className={`border-b border-gray-100 dark:border-gray-800 last:border-0 transition-all ${isOpen ? 'pb-6' : 'pb-0'}`}
                    >
                      <button
                        onClick={() => toggleFAQ(currentIndex)}
                        className="w-full flex items-center justify-between py-5 text-left group"
                      >
                        <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-orange-500' : 'text-gray-800 dark:text-gray-200 group-hover:text-orange-500'}`}>
                          {item.q}
                        </span>
                        <div className={`p-1 rounded-full transition-all ${isOpen ? 'bg-orange-500 text-white rotate-180' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="text-gray-500 dark:text-gray-400 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* STILL HAVE QUESTIONS? */}
        <div className="mt-20 p-10 bg-orange-500 rounded-[3rem] text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <MessageCircle size={150} />
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">
              Pas trouvé votre bonheur ?
            </h3>
            <p className="mb-8 opacity-90 max-w-md mx-auto">
              Notre équipe support est disponible 7j/7 pour répondre à toutes vos préoccupations sur WhatsApp.
            </p>
            <a 
              href="https://wa.me/2250503117454"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              <MessageCircle size={20} />
              Nous contacter sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}