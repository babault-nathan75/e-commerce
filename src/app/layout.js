import "./globals.css";
import Providers from "./providers";
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
    <html lang="fr" className="h-full overflow-x-hidden">
      <body className="bg-gray-50 flex flex-col min-h-screen antialiased overflow-x-hidden w-full max-w-[100vw]">
        <Providers session={session}>
          <Header />
          
          <main className="flex-1 w-full">
            {children}
          </main>
          
          <Footer />
          
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}