import "./globals.css";
import Providers from "./providers";
import AuthProvider from "@/components/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { Toaster } from "sonner";

export const metadata = {
  title: "Hebron Ivoire Shops",
  description: "Terminal d'importation premium et gastronomie",
};

export default async function RootLayout({ children }) {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("AUTH_SESSION_ERROR:", error);
  }

  return (
    <html lang="fr" className="h-full">
      <body className="bg-gray-50 flex flex-col min-h-screen antialiased">
        <Providers session={session}>
          <Header />
          
          <AuthProvider>
            <main className="flex-1">
              {children}
            </main>
          </AuthProvider>
          
          <Footer />
          
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}