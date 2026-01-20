"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

export default function BannerCarousel({ banners = [] }) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);

  // AUTO-PLAY : 6 secondes
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // LOGIQUE DE SCROLL FLUIDE
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
    <div className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-gray-200 border border-white mb-8 group">
      
      {/* BADGE SYSTÈME "LIVE" */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#232f3e]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
        <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Hebron Promo v2.5</span>
      </div>

      {/* CONTENEUR DES SLIDES */}
      <div
        ref={containerRef}
        className="flex w-full overflow-hidden no-scrollbar"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {banners.map((banner, i) => (
          <Link
            key={i}
            href={banner.link}
            className="flex-shrink-0 w-full relative bg-[#232f3e] group"
            style={{ height: "320px", scrollSnapAlign: "start" }} 
          >
            {/* IMAGE AVEC EFFET ZOOM */}
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-70"
              loading="lazy"
            />

            {/* OVERLAY DÉGRADÉ */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#232f3e] via-[#232f3e]/40 to-transparent" />

            {/* CONTENU TEXTE */}
            <div className="relative h-full flex flex-col justify-end p-6 md:p-12 pb-10 md:pb-16 text-white max-w-4xl">
              <div className="space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h2 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                  {banner.title.split(' ').map((word, index) => (
                    <span key={index} className={index % 2 !== 0 ? "text-orange-500" : ""}>{word} </span>
                  ))}
                </h2>
                
                {banner.description && (
                  <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-gray-300 max-w-xl line-clamp-2 md:line-clamp-none opacity-80">
                    {banner.description}
                  </p>
                )}

                <div className="pt-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform">
                    <ArrowUpRight size={20} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] border-b-2 border-orange-500 pb-1">Découvrir l'offre</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* INDICATEURS DE PROGRESSION (DOTS) */}
      <div className="absolute bottom-6 left-6 md:left-12 flex gap-2 z-20">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 transition-all duration-500 rounded-full ${
              current === i 
              ? "w-12 bg-orange-500 shadow-lg shadow-orange-500/40" 
              : "w-4 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* NAVIGATION FLÈCHES (CORRIGÉES) */}
      <div className="hidden md:flex absolute right-12 bottom-6 gap-3 z-20">
        <button
          onClick={(e) => { e.preventDefault(); setCurrent(current === 0 ? banners.length - 1 : current - 1); }}
          className="p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl border border-white/10 hover:bg-orange-500 hover:border-orange-500 transition-all active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={(e) => { e.preventDefault(); setCurrent((current + 1) % banners.length); }}
          className="p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl border border-white/10 hover:bg-orange-500 hover:border-orange-500 transition-all active:scale-90"
        >
          <ChevronRight size={24} />
        </button>
      </div>

    </div>
  );
}