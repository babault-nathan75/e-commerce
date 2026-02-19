// src/app/layout.js
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth";
// ⚠️ Assure-toi que ce chemin est EXACTEMENT là où se trouve ton authOptions
import { authOptions } from "@/lib/auth"; 
import { Toaster } from "sonner";

export const metadata = {
  title: "Hebron Ivoire Shops",
  description: "Terminal d'importation premium et gastronomie",
};

export default async function RootLayout({ children }) {
  let session = null;

  try {
    // On tente de récupérer la session, mais on ne laisse pas un échec casser le site
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("AUTH_SESSION_ERROR:", error);
  }

  return (
    <html lang="fr" className="h-full">
      <body className="bg-gray-50 flex flex-col min-h-screen antialiased">
        <Providers session={session}>
          <Header />
          
          {/* Le "flex-1" permet au footer de rester en bas si la page est courte */}
          <main className="flex-1">
            {children}
          </main>
          
          <Footer />
          
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}