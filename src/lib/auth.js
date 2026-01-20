import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  // --- PROTOCOLE DE SESSION TACTIQUE ---
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 Heures : Délai de sécurité avant expiration
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-hebron.session-token" // Branding du token
        : "hebron.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: "Hebron Terminal Access",
      credentials: {
        email: { label: "Email ID", type: "email" },
        password: { label: "Access Code", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        console.log(`[AUTH PROTOCOL] : Tentative d'accès pour ${credentials.email.toLowerCase()}`);

        try {
          await connectDB();

          const user = await User.findOne({
            email: credentials.email.toLowerCase().trim(),
          });

          if (!user) {
            console.warn(`[AUTH WARNING] : Échec d'identification - Utilisateur inconnu.`);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            console.warn(`[AUTH WARNING] : Échec d'identification - Code d'accès invalide.`);
            return null;
          }

          // ✅ TRANSMISSION DES DONNÉES SÉCURISÉES
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          };
        } catch (error) {
          console.error(`[CRITICAL ERROR] : Panne du nœud d'authentification.`, error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // Étape 1 : Enregistrement des données dans le Web Token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        console.log(`[AUTH SYSTEM] : Token généré pour l'opérateur ${user.email}`);
      }
      return token;
    },

    // Étape 2 : Transmission vers la session client (useSession)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // Redirige les erreurs vers la page de garde
  },

  secret: process.env.NEXTAUTH_SECRET,
};