import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

export async function middleware(req) {
  console.log(`🔒 [MIDDLEWARE] Tentative d'accès à : ${req.nextUrl.pathname}`);

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token"
  });

  console.log(`👤 [MIDDLEWARE] Token trouvé : ${token ? "OUI" : "NON"}`);
  if (token) console.log(`🛡️ [MIDDLEWARE] Rôle Admin : ${token.isAdmin}`);

  if (!token) {
    console.log("⛔ [MIDDLEWARE] Bloqué : Pas de session");
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (token.isAdmin !== true) {
    console.log("⛔ [MIDDLEWARE] Bloqué : Utilisateur non-admin");
    return NextResponse.redirect(new URL("/", req.url));
  }

  console.log("✅ [MIDDLEWARE] Accès autorisé");
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"]
};