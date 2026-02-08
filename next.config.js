/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // <--- C'EST LA LIGNE IMPORTANTE
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'], // Tes images
  },
  // ... le reste de ta config
};

export default nextConfig;