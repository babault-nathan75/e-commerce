import Link from "next/link";
import { CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default async function OrderSuccessPage({ searchParams }) {
  const { code = "", email = "" } = await searchParams; // ✅ Next 16

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* ===== CARD CONFIRMATION ===== */}
          <div className="bg-white rounded-3xl shadow-xl border p-8 text-center">
            {/* ICON */}
            <div className="flex justify-center">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>

            {/* TITLE */}
            <h1 className="mt-4 text-3xl font-extrabold text-brand-green">
              Commande confirmée 🎉
            </h1>

            <p className="mt-2 text-gray-600">
              Merci pour ta commande. Elle a bien été enregistrée.
            </p>

            {/* CODE */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Code de commande
              </p>
              <div className="inline-block mt-1 px-6 py-3 rounded-xl bg-gray-100 text-brand-orange font-extrabold text-lg tracking-wide">
                {code || "—"}
              </div>
            </div>

            {/* INFO */}
            <p className="mt-4 text-sm text-gray-600 max-w-md mx-auto">
              Garde ce code précieusement. Il te permet de suivre ta commande,
              notamment si tu as commandé en mode invité.
            </p>

            {/* ACTIONS */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href={`/order/track${code ? `?code=${encodeURIComponent(code)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}`}
                className="
                  px-6 py-3 rounded-xl
                  bg-white border font-semibold
                  hover:bg-green-500 transition
                  hover:text-white transition
                "
              >
                Suivre ma commande
              </Link>

              <Link
                href="/shop"
                className="
                  px-6 py-3 rounded-xl
                  bg-white border font-semibold
                  hover:bg-gray-700 transition
                  hover:text-white transition
                "
              >
                Continuer mes achats
              </Link>

              <Link
                href="/"
                className="
                  px-6 py-3 rounded-xl
                  bg-white border font-semibold
                  hover:bg-gray-700 transition
                  hover:text-white transition
                "
              >
                Accueil
              </Link>
            </div>
          </div>

          {/* ===== FOOT NOTE ===== */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Un email récapitulatif avec la facture a été envoyé (si disponible).
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
