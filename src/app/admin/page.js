"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  Package,
  MessageSquare,
  BarChart3,
  Image as ImageIcon,
  ChevronDown,
  BookOpen,
  Store
} from "lucide-react";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export default function AdminHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les menus déroulants
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [showLibMenu, setShowLibMenu] = useState(false);

  // Catégories segmentées selon ton modèle
  const shopCategories = ["Électronique", "Mode", "Maison", "Beauté", "Informatique"];
  const libCategories = ["Développement Personnel", "Business", "Scolaire", "Romans", "PDF"];

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Erreur chargement dashboard");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 italic">Analyse des données en cours...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 md:px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-brand-green tracking-tight">ADMIN PANEL</h1>
            <p className="text-gray-500 text-sm">Contrôle global : Boutique & Librairie</p>
          </div>

          {/* ✅ NAVIGATION PRINCIPALE REVISITÉE */}
          <nav className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <AdminNav href="/admin/users" title="Clients"><Users className="w-5 h-5" /></AdminNav>
            <AdminNav href="/admin/orders" title="Ventes"><ShoppingBag className="w-5 h-5" /></AdminNav>

            {/* --- DROPDOWN BOUTIQUE --- */}
            <div className="relative">
              <button 
                onClick={() => { setShowShopMenu(!showShopMenu); setShowLibMenu(false); }}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all ${showShopMenu ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <Store className="w-5 h-5" />
                <span className="text-sm font-bold hidden md:block">Boutique</span>
                <ChevronDown className={`w-4 h-4 transition ${showShopMenu ? 'rotate-180' : ''}`} />
              </button>

              {showShopMenu && (
                <div className="absolute left-0 md:right-0 mt-2 w-56 bg-white border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Rayons Boutique</div>
                  {shopCategories.map((cat) => (
                    <Link key={cat} href={`/admin/products?channel=shop&category=${cat}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-green/10 hover:text-brand-green transition" onClick={() => setShowShopMenu(false)}>
                      {cat}
                    </Link>
                  ))}
                  <Link href="/admin/products?channel=shop" className="block px-4 py-3 text-sm font-bold text-brand-orange bg-orange-50" onClick={() => setShowShopMenu(false)}>
                    Voir tout le Shop
                  </Link>
                </div>
              )}
            </div>

            {/* --- DROPDOWN LIBRAIRIE --- */}
            <div className="relative">
              <button 
                onClick={() => { setShowLibMenu(!showLibMenu); setShowShopMenu(false); }}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all ${showLibMenu ? 'bg-[#232f3e] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-bold hidden md:block">Librairie</span>
                <ChevronDown className={`w-4 h-4 transition ${showLibMenu ? 'rotate-180' : ''}`} />
              </button>

              {showLibMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Rayons Librairie</div>
                  {libCategories.map((cat) => (
                    <Link key={cat} href={`/admin/products?channel=library&category=${cat}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition" onClick={() => setShowLibMenu(false)}>
                      {cat}
                    </Link>
                  ))}
                  <Link href="/admin/products?channel=library" className="block px-4 py-3 text-sm font-bold text-blue-800 bg-blue-50" onClick={() => setShowLibMenu(false)}>
                    Voir toute la Librairie
                  </Link>
                </div>
              )}
            </div>

            <AdminNav href="/admin/banners" title="Pub"><ImageIcon className="w-5 h-5" /></AdminNav>
          </nav>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Nouveaux Clients" value={data.users.month} color="text-blue-600" />
          <StatCard title="Ventes du mois" value={data.orders.month} color="text-orange-500" />
          <StatCard title="Revenue Total" value={`${data.revenue.toLocaleString()} FCFA`} color="text-emerald-600" />
          <StatCard title="Performance" value="+12.5%" color="text-purple-600" />
        </div>

        {/* GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartBox title="Croissance Utilisateurs" icon={<Users className="w-5 h-5" />}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.charts.users}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={4} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Volume des Commandes" icon={<BarChart3 className="w-5 h-5" />}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.charts.orders}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>

        {/* QUICK LINK BANNER */}
        <div className="bg-[#232f3e] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">Marketing & Publicité</h2>
            <p className="opacity-70 mt-2 max-w-md">Mettez à jour vos bannières pour booster les ventes de la librairie ou de la boutique.</p>
          </div>
          <Link href="/admin/banners" className="relative z-10 bg-brand-orange text-white px-8 py-4 rounded-2xl font-black hover:scale-105 transition shadow-lg">
            CONFIGURER LES BANNIÈRES
          </Link>
          <ImageIcon className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 -rotate-12" />
        </div>

      </div>
    </div>
  );
}

/* --- SOUS-COMPOSANTS --- */

function AdminNav({ href, title, children }) {
  return (
    <Link href={href} className="flex items-center gap-2 p-3 rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:text-brand-green transition-all border border-transparent hover:border-gray-100">
      {children}
      <span className="text-sm font-bold hidden lg:block">{title}</span>
    </Link>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{title}</div>
      <div className={`mt-2 text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}

function ChartBox({ title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-3 italic">
        <div className="p-2 bg-gray-50 rounded-lg text-brand-green">{icon}</div> {title}
      </h3>
      {children}
    </div>
  );
}