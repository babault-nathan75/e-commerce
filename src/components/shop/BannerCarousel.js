"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BannerCarousel({ banners = [] }) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;

    containerRef.current.scrollTo({
      left: current * width,
      behavior: "smooth",
    });
  }, [current]);

  if (!banners.length) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl md:rounded-2xl mb-4">
      
      {/* SLIDES */}
      <div
        ref={containerRef}
        className="flex w-full transition-transform"
        style={{ scrollBehavior: "smooth" }}
      >
        {banners.map((banner, i) => (
          <Link
            key={i}
            href={banner.link}
            className="flex-shrink-0 w-full relative bg-gray-100"
            style={{ height: "190px" }}   // 🔥 HAUTEUR MOBILE FIXE
          >
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-black/25" />

            <div className="relative h-full flex flex-col justify-center px-4 text-white">
              <h2 className="text-lg font-bold leading-tight max-w-[80%]">
                {banner.title}
              </h2>

              {/* TEXTE DESKTOP SEULEMENT */}
              {banner.description && (
                <p className="hidden md:block mt-2 text-sm opacity-90 max-w-lg">
                  {banner.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* DOTS */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              current === i ? "w-4 bg-brand-orange" : "w-1.5 bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* FLÈCHES DESKTOP */}
      <button
        onClick={() =>
          setCurrent(current === 0 ? banners.length - 1 : current - 1)
        }
        className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => setCurrent((current + 1) % banners.length)}
        className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
