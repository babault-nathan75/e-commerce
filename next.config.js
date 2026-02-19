/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Injection de TOUTES les variables nécessaires au fonctionnement d'Hebron
  env: {
    // BASE DE DONNÉES
    MONGODB_URI: "mongodb+srv://hebronivoireshops_db_user:0503117454his@cluster0.utzqgy5.mongodb.net/?appName=Cluster0",
    
    // AUTHENTIFICATION
    NEXTAUTH_SECRET: "864b2b7a6db7ae7fabeea4c8d8921f7ed12d1ab30065737dc588b94d89fd2572",
    NEXTAUTH_URL: "https://hebronivoireshops.com",

    // CONFIGURATION EMAIL (C'est ici que ça se joue pour l'erreur 530)
    EMAIL_USER: "hebronivoireshops@gmail.com",
    EMAIL_PASS: "rxli ewkc igjw chwv", // Ton mot de passe d'application Gmail
    EMAIL_SERVER_HOST: "smtp.gmail.com",
    EMAIL_SERVER_PORT: "465",
    EMAIL_SERVER_USER: "hebronivoireshops@gmail.com",
    EMAIL_SERVER_PASSWORD: "rxli ewkc igjw chwv",
    EMAIL_FROM: "hebronivoireshops@gmail.com",
    ADMIN_EMAIL: "hebronivoireshops@gmail.com",
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '**' },
    ],
  },
};

export default nextConfig;