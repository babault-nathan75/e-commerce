import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const authOptions = {
  session: { strategy: "jwt" },
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
  async jwt({ token, user }) {
    if (user) token.isAdmin = user.isAdmin;
    return token;
  },
  async session({ session, token }) {
    // token.sub = id user (NextAuth)
    session.user.id = token.sub;
    session.user.isAdmin = !!token.isAdmin;
    return session;
  }
},
  pages: {
    signIn: "/login"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };