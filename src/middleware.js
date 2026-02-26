import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  // 1. LOG DE DÉBOGAGE (Regardez votre terminal !)
  console.log(`🔒 [MIDDLEWARE] Tentative d'accès à : ${req.nextUrl.pathname}`);

  // 2. Récupération du token
  // Si le secret est mauvais, cela renverra null
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  console.log(`👤 [MIDDLEWARE] Token trouvé : ${!!token ? "OUI" : "NON"}`);
  if(token) console.log(`🛡️ [MIDDLEWARE] Rôle Admin : ${token.isAdmin}`);

  // 3. LA SÉCURITÉ (Logique inversée : on bloque par défaut)
  
  // CAS A : Pas de token (Non connecté)
  if (!token) {
    console.log("⛔ [MIDDLEWARE] Bloqué : Pas de session");
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // CAS B : Token existe mais pas Admin
  if (token.isAdmin !== true) {
    console.log("⛔ [MIDDLEWARE] Bloqué : Utilisateur non-admin");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // CAS C : C'est un Admin -> On laisse passer
  console.log("✅ [MIDDLEWARE] Accès autorisé");
  return NextResponse.next();
}

export const config = {
  // C'est ICI que tout se joue. On liste précisément les routes à protéger.
  matcher: [
    "/admin",           // Protège exactement /admin
    "/admin/:path*",    // Protège /admin/dashboard, /admin/users...
    "/api/admin/:path*" // Protège l'API
  ]
};