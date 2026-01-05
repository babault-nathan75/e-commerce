"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DynamicBanner({ banners }) {
  const [current, setCurrent] = useState(0);

  // Défilement automatique toutes les 7 secondes
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const nextSlide = () => setCurrent(current === banners.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? banners.length - 1 : current - 1);

  return (
    <div className="relative group mb-8 rounded-3xl overflow-hidden shadow-lg h-[250px] md:h-[350px]">
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner._id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay Texte */}
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-center px-8 md:px-16 text-white">
            <h2 className="text-3xl md:text-5xl font-black mb-2 animate-bounce">
              {banner.title}
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-4 max-w-md">
              {banner.description}
            </p>
            <Link
              href={banner.link}
              className="bg-white text-black w-fit px-6 py-3 rounded-full font-bold hover:bg-brand-green hover:text-white transition"
            >
              Découvrir
            </Link>
          </div>
        </div>
      ))}

      {/* Boutons de navigation */}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/50 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition">
        <ChevronLeft className="text-white w-6 h-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/50 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition">
        <ChevronRight className="text-white w-6 h-6" />
      </button>

      {/* Indicateurs (petits points) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              i === current ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}