import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const authOptions = {
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true, // Empêche l'accès via JavaScript (XSS)
        sameSite: 'lax', // Protège contre le CSRF
        path: '/',
        secure: true // Uniquement via HTTPS
      },
    },
  },
  session: { strategy: "jwt" },
  maxAge: 1 * 24 * 60 * 60, // 1 jour au lieu de 30
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();

        const email = (credentials?.email || "").toLowerCase().trim();
        const password = credentials?.password || "";

        const user = await User.findOne({ email });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin
        };
      }
    })
  ],
  callbacks: {
  async jwt({ token, user, trigger, session }) {
    // Lors de la connexion initiale
    if (user) {
      token.isAdmin = !!user.isAdmin;
      token.id = user.id || user._id; // On s'assure d'avoir l'ID
      
      // OPTIONNEL : Si tu veux stocker l'User-Agent pour le middleware
      // Note: Dans certaines versions de NextAuth, req n'est pas direct, 
      // on peut passer par un hack ou simplement se fier à la rotation des tokens.
    }
    return token;
  },
  
  async session({ session, token }) {
    // On injecte les données du token dans la session client
    if (token) {
      session.user.id = token.id || token.sub;
      session.user.isAdmin = !!token.isAdmin;
    }
    return session;
  }
},
  pages: {
    signIn: "/login"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };