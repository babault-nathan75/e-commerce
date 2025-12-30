import Link from "next/link";

export default async function OrderSuccessPage({ searchParams }) {
  const { code = "", email = "" } = await searchParams; // ✅ OBLIGATOIRE en Next.js 16

  return (
    <div className="border rounded p-4">
      <h1 className="text-2xl font-bold text-brand-green">
        Commande confirmée
      </h1>

      <p className="mt-3">
        Ton code de commande :
        <span className="ml-2 font-bold text-brand-orange">
          {code}
        </span>
      </p>

      <div className="mt-4 space-y-2">
        <p className="text-gray-700">
          Garde ce code. Il te permet de suivre ta commande (surtout en mode invité).
        </p>

        <Link
          className="underline text-brand-green"
          href={`/order/track${code ? `?code=${encodeURIComponent(code)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}`}
        >
          Suivre ma commande / Voir la fiche
        </Link>

        <div>
          <Link className="underline text-brand-orange" href="/">
            Retour accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
