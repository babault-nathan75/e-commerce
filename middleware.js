import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Configuration du Rate Limit (en mémoire)
const rateLimitMap = new Map();

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const ip = req.ip ?? "127.0.0.1";

  // 1. PROTECTION CONTRE LA FORCE BRUTE (Login & Admin)
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/admin")) {
    const now = Date.now();
    const userLimit = rateLimitMap.get(ip) || { count: 0, lastRequest: now };

    if (now - userLimit.lastRequest > 60000) {
      userLimit.count = 0;
    }

    userLimit.count++;
    userLimit.lastRequest = now;
    rateLimitMap.set(ip, userLimit);

    if (userLimit.count > 20) {
      return new NextResponse("Trop de tentatives. Veuillez attendre 1 minute.", { 
        status: 429,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  }

  // 2. PROTECTION DES ROUTES ADMIN
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req });
  
    // Si pas de session OU isAdmin n'est pas true -> Redirection
    if (!token || token.isAdmin !== true) {
      return NextResponse.redirect(new URL("/", req.url));
    };

    // A. Si pas de jeton -> Redirection Login
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // B. Si jeton présent mais PAS Admin -> Bloquage immédiat
    // On redirige vers l'accueil pour éviter qu'un curieux sache que la route existe
    if (token.isAdmin !== true) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // C. Protection contre le vol de session (User Agent)
    // Note: Assure-toi d'avoir stocké 'ua' dans le token lors du login (authOptions)
    const userAgent = req.headers.get("user-agent") || "";
    if (token.ua && token.ua !== userAgent) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // On protège tout le répertoire /admin et les points sensibles de l'API
  matcher: [
    "/admin/:path*", 
    "/api/admin/:path*",
    "/api/auth/:path*"]
};