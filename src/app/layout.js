import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-white text-gray-900">
        <Providers>
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}