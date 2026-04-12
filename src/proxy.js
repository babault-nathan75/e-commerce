import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  console.log(`🔒 [MIDDLEWARE] Accès à : ${path}`);

  // 1. Correction majeure pour la production (Hostinger/HTTPS)
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    // NextAuth change le nom du cookie en prod (__Secure-next-auth...)
    // Cette option force le middleware à chercher les deux types.
    secureCookie: process.env.NODE_ENV === "production"
  });

  console.log(`👤 [MIDDLEWARE] Token trouvé : ${!!token ? "OUI" : "NON"}`);

  // 2. Vérification de l'Admin
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    if (!token || !token.isAdmin) {
      console.log("⛔ [MIDDLEWARE] Accès refusé : Session invalide ou non-admin");
      
      // Si c'est une requête API, on renvoie du JSON au lieu d'une redirection
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }

      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", 
    "/api/admin/:path*",
    "/api/products/:path*" // ✅ Ajoute ceci si tu veux protéger tes routes produits !
  ]
};