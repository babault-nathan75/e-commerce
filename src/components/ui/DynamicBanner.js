"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DynamicBanner({ banners = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gray-200 mb-4">

      {/* SLIDES */}
      {banners.map((banner, index) => (
        <Link
          key={banner._id}
          href={banner.link}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          style={{ height: "180px" }}   // 🔥 HAUTEUR MOBILE APP
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/30" />

          {/* TEXTE MOBILE-FIRST */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-lg font-bold leading-tight line-clamp-2">
              {banner.title}
            </h2>

            {/* Description desktop uniquement */}
            {banner.description && (
              <p className="hidden md:block mt-2 text-sm opacity-90 max-w-lg">
                {banner.description}
              </p>
            )}
          </div>
        </Link>
      ))}

      {/* DOTS (MOBILE UX) */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                current === i ? "w-4 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* FLÈCHES DESKTOP UNIQUEMENT */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrent(current === 0 ? banners.length - 1 : current - 1)
            }
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 rounded-full shadow"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => setCurrent((current + 1) % banners.length)}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 rounded-full shadow"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
