"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, ArrowRight, Zap, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0f172a] text-gray-400 pt-20 pb-10 overflow-hidden border-t border-white/5">
      
      {/* --- LIGNE DE STATUT SUPÉRIEURE (HÉRITAGE HEBRON) --- */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* --- GRID PRINCIPAL --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* 1. BRAND & MISSION MODULE */}
          <div className="space-y-8">
            <Link href="/" className="inline-block group">
               <div className="text-2xl font-black uppercase italic tracking-tighter leading-none">
                <span className="text-white">Hebron</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                  Ivoire Shops
                </span>
              </div>
            </Link>
            
            <p className="text-[11px] font-bold leading-relaxed uppercase tracking-widest text-gray-500 max-w-xs italic">
              Terminal d'importation premium. Passerelle entre l'excellence internationale et le savoir-faire ivoirien.
            </p>
            
            {/* RÉSEAUX SOCIAUX TACTIQUES */}
            <div className="flex items-center gap-3">
              <SocialLink href="#" icon={Facebook} label="FB" />
              <SocialLink href="#" icon={Instagram} label="IG" />
              <div className="h-10 w-px bg-white/5 mx-1" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-gray-600 uppercase">Status</span>
                <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Live Ops
                </span>
              </div>
            </div>
          </div>

          {/* 2. NAVIGATION SYSTÈME */}
          <div className="flex flex-col space-y-6">
            <SectionTitle title="Exploration" color="bg-emerald-500" />
            <ul className="space-y-4">
              <FooterLink href="/" label="Flux Accueil" />
              <FooterLink href="/shop" label="Catalogue Shop" />
              <FooterLink href="/library" label="Librairie PDF" />
              <FooterLink href="/order/track" label="Track Order" />
            </ul>
          </div>

          {/* 3. ASSISTANCE UNIT */}
          <div className="flex flex-col space-y-6">
            <SectionTitle title="Support Client" color="bg-orange-500" />
            <ul className="space-y-4">
              <FooterLink href="/terms" label="Conditions CGV" />
              <FooterLink href="/faq" label="Centre d'aide" />
              <FooterLink href="/privacy" label="Privacy Protocol" />
              <FooterLink href="/contact" label="Open Ticket" />
            </ul>
          </div>

          {/* 4. COORDONNÉES GÉO-LOCALISÉES */}
          <div className="flex flex-col space-y-6">
            <SectionTitle title="Localisation" color="bg-yellow-500" />
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group">
                <div className="p-2 bg-white/5 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <MapPin size={16} />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Base Abidjan</span>
                  <span className="text-[11px] font-black text-gray-300 uppercase italic">Cocody Angré, CI</span>
                </div>
              </li>
              
              <li className="flex items-center gap-4 group">
                <div className="p-2 bg-white/5 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Phone size={16} />
                </div>
                <a href="tel:+2250503117454" className="text-[11px] font-black text-gray-300 uppercase tracking-tighter hover:text-orange-500 transition-colors">
                  +225 05 03 11 74 54
                </a>
              </li>

              <li className="flex items-center gap-4 group">
                <div className="p-2 bg-white/5 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Mail size={16} />
                </div>
                <a href="mailto:contact@hebronivoire.ci" className="text-[11px] font-black text-gray-300 uppercase tracking-tighter hover:text-orange-500 transition-colors">
                  contact@hebronivoire.ci
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* --- COPYRIGHT & PROTOCOLE --- */}
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                <ShieldCheck size={16} className="text-orange-500" />
             </div>
             <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
               © {currentYear} Hebron Ivoire Shops / Session Sécurisée
             </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <Zap size={12} className="text-yellow-500 fill-yellow-500 animate-pulse" />
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Engineered for <span className="text-white italic">Africa</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- SOUS-COMPOSANTS POUR LE TERMINAL ---

function SectionTitle({ title, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-1 h-4 ${color} rounded-full`} />
      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{title}</h3>
    </div>
  );
}

function FooterLink({ href, label }) {
  return (
    <li>
      <Link 
        href={href} 
        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-orange-500 transition-all duration-300"
      >
        <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" />
        {label}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon: Icon, label }) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1 group"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/20 group-hover:-translate-y-1">
        <Icon size={18} />
      </div>
      <span className="text-[7px] font-black text-gray-700 uppercase group-hover:text-gray-400">{label}</span>
    </a>
  );
}