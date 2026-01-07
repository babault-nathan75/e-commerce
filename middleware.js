import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Configuration simple du Rate Limit (en mémoire pour Edge Runtime)
const rateLimitMap = new Map();

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const ip = req.ip ?? "127.0.0.1"; // Récupère l'IP du client

  // 1. PROTECTION CONTRE LA FORCE BRUTE (Sur Login et Admin)
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/admin")) {
    const now = Date.now();
    const userLimit = rateLimitMap.get(ip) || { count: 0, lastRequest: now };

    // Reset du compteur après 1 minute
    if (now - userLimit.lastRequest > 60000) {
      userLimit.count = 0;
    }

    userLimit.count++;
    userLimit.lastRequest = now;
    rateLimitMap.set(ip, userLimit);

    // Si plus de 20 requêtes par minute sur ces routes, on bloque
    if (userLimit.count > 20) {
      return new NextResponse("Trop de tentatives. Veuillez attendre 1 minute.", { 
        status: 429,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  }

  // 2. PROTECTION DES ROUTES ADMIN & PIRATAGE DE SESSION
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production" // Force le cookie sécurisé en prod
    });

    // Si pas de jeton -> Redirection Login
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname); // Pour revenir ici après login
      return NextResponse.redirect(url);
    }

    // Si jeton présent mais pas Admin -> Redirection Accueil
    if (!token.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Optionnel : Protection contre le vol de session 
    // On vérifie si l'User Agent a changé (basique mais efficace)
    const userAgent = req.headers.get("user-agent") || "";
    if (token.ua && token.ua !== userAgent) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// On étend le matcher pour protéger aussi les tentatives sur l'API d'authentification
export const config = {
  matcher: ["/admin/:path*", "/api/auth/callback/credentials"]
};