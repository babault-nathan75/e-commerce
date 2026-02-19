/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimise le déploiement pour Hostinger/VPS
  
  // 1. Injection des variables (C'est ce qui règle ton erreur MONGODB_URI)
  env: {
    MONGODB_URI: "mongodb+srv://hebronivoireshops_db_user:0503117454his@cluster0.utzqgy5.mongodb.net/?appName=Cluster0",
    NEXTAUTH_SECRET: "864b2b7a6db7ae7fabeea4c8d8921f7ed12d1ab30065737dc588b94d89fd2572",
    NEXTAUTH_URL: "https://hebronivoireshops.com",
    RESEND_API_KEY: "re_cyG5gXA9_GYeZ2c9mzZbReAk5BnALMwEM",
    EMAIL_SERVER_PASSWORD: "rxli ewkc igjw chwv",
    EMAIL_SERVER_HOST:smtp.gmail.com,
    EMAIL_SERVER_PORT:465,
    EMAIL_SERVER_USER:"hebronivoireshops@gmail.com",
    EMAIL_FROM:"hebronivoireshops@gmail.com",
    ADMIN_EMAIL:"hebronivoireshops@gmail.com"
  },

  // 2. Gestion moderne des images (Remplace images.domains qui est déprécié)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
    ],
  },

  // Désactive Turbopack si tu as des erreurs de compilation en prod, 
  // sinon tu peux laisser par défaut.
};

export default nextConfig;