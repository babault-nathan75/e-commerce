"use client";

import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { 
  Users, ShoppingBag, BarChart3, Image as ImageIcon, ChevronDown, 
  BookOpen, Store, TrendingUp, TrendingDown, LayoutDashboard, 
  MessageSquare, Star, Edit3, Trash2, X, Loader2, Save, PlusCircle, DollarSign,
  Calendar 
} from "lucide-react";

// --- UNITÉ ANALYTIQUE TREMOR ---
import { 
  Card, AreaChart, BarChart, Metric, Text, Flex, BadgeDelta, 
  Grid, TabGroup, TabList, Tab
} from "@tremor/react";

export default function AdminHome() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [showLibMenu, setShowLibMenu] = useState(false);

  const [catModal, setCatModal] = useState({ show: false, type: 'add', id: null, name: '', channel: '' });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [resDash, resCats] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/categories")
      ]);
      const dashJson = await resDash.json();
      const catsJson = await resCats.json();
      setData(dashJson);
      setCategories(catsJson);
    } catch (e) { 
      console.error("[SYNC ERROR] : Échec de la liaison de données", e); 
    } finally { 
      setLoading(false); 
    }
  }

  // --- ACTIONS DE GESTION DES RAYONS ---
  async function handleSaveCategory() {
    if (!catModal.name.trim()) return;
    const method = catModal.type === 'add' ? 'POST' : 'PUT';
    const body = catModal.type === 'add' 
      ? { name: catModal.name, channel: catModal.channel }
      : { id: catModal.id, name: catModal.name };

    const res = await fetch("/api/admin/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setCatModal({ ...catModal, show: false, name: '' });
      loadAll();
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm("🚨 Confirmer la suppression du rayon ?")) return;
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) loadAll();
    else {
      const err = await res.json();
      alert(err.error || "Erreur système lors de la suppression.");
    }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
      <Text className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">Hebron Data Sync en cours...</Text>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20 font-sans text-slate-900">
      
      {/* --- MODALE DE COMMANDE --- */}
      {catModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <Card className="max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border-none">
            <Flex className="mb-6">
              <Text className="font-black uppercase italic tracking-tighter text-slate-900 text-lg">
                {catModal.type === 'add' ? `Nouveau Rayon ${catModal.channel}` : 'Ajuster le Rayon'}
              </Text>
              <button onClick={() => setCatModal({ ...catModal, show: false })} className="hover:text-red-500 transition-colors"><X size={20}/></button>
            </Flex>
            <input 
              type="text" autoFocus
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold mb-6 text-slate-800"
              placeholder="Identifiant du rayon..."
              value={catModal.name}
              onChange={(e) => setCatModal({...catModal, name: e.target.value})}
            />
            <button 
              onClick={handleSaveCategory}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 transition-all shadow-xl"
            >
              Exécuter la mise à jour
            </button>
          </Card>
        </div>
      )}

      {/* --- ENTÊTE TACTIQUE --- */}
      <header className="bg-[#232f3e] text-white sticky top-0 z-[100] px-4 md:px-8 py-4 border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">Hebron <span className="text-orange-500">admin</span></h1>
              <Text className="text-[9px] opacity-50 font-bold uppercase tracking-widest leading-none text-white">Opérations Terminal v3.2</Text>
            </div>
          </div>

          <nav className="flex items-center flex-wrap justify-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {/* 1. Clients avec badge (nouveaux inscrits par ex) */}
            <AdminNav href="/admin/users" title="Clients" count={data?.notifications?.users}><Users size={18} /></AdminNav>
            
            {/* 2. Ventes avec badge (commandes boutique en attente) */}
            <AdminNav href="/admin/orders" title="Ventes" count={data?.notifications?.orders}><ShoppingBag size={18} /></AdminNav>

            <div className="relative">
              <button onClick={() => { setShowShopMenu(!showShopMenu); setShowLibMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${showShopMenu ? 'bg-orange-500 text-white shadow-lg' : 'opacity-70 hover:opacity-100'}`}>
                <Store size={18} /> Boutique <ChevronDown size={14} className={showShopMenu ? 'rotate-180' : ''} />
              </button>
              {showShopMenu && (
                <DropdownMenu 
                  items={categories.filter(c => c.channel === 'shop')} 
                  channel="shop" 
                  onAdd={() => setCatModal({ show: true, type: 'add', channel: 'shop', name: '' })}
                  onEdit={(cat) => setCatModal({ show: true, type: 'edit', id: cat._id, name: cat.name, channel: 'shop' })}
                  onDelete={(id) => handleDeleteCategory(id)}
                  close={() => setShowShopMenu(false)} 
                />
              )}
            </div>

            <div className="relative">
              <button onClick={() => { setShowLibMenu(!showLibMenu); setShowShopMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${showLibMenu ? 'bg-blue-600 text-white shadow-lg' : 'opacity-70 hover:opacity-100'}`}>
                <BookOpen size={18} /> Librairie <ChevronDown size={14} className={showLibMenu ? 'rotate-180' : ''} />
              </button>
              {showLibMenu && (
                <DropdownMenu 
                  items={categories.filter(c => c.channel === 'library')} 
                  channel="library" color="blue"
                  onAdd={() => setCatModal({ show: true, type: 'add', channel: 'library', name: '' })}
                  onEdit={(cat) => setCatModal({ show: true, type: 'edit', id: cat._id, name: cat.name, channel: 'library' })}
                  onDelete={(id) => handleDeleteCategory(id)}
                  close={() => setShowLibMenu(false)} 
                />
              )}
            </div>
            
            {/* 3. Gastronomie avec badge (repas en attente) */}
            <AdminNav href="/admin/gastronomie" title="Gastronomie" count={data?.notifications?.gastronomy}>
                <UtensilsCrossed size={18} />
            </AdminNav>

            {/* 4. Réservations avec badge (tables en attente) */}
            <AdminNav href="/admin/reservations" title="Réservations" count={data?.notifications?.bookings}>
                <Calendar size={18} />
            </AdminNav>

            <AdminNav href="/admin/banners" title="Bannières"><ImageIcon size={18} /></AdminNav>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10 space-y-10">
        
        {/* --- KPI GRID (MÉTRIQUES CRITIQUES) --- */}
        <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
          <KpiCard title="Revenu Global" metric={`${data?.revenue?.toLocaleString() || 0} FCFA`} delta="+8.2%" deltaType="moderateIncrease" icon={DollarSign} color="emerald" />
          <KpiCard title="Ventes (An)" metric={data?.orders?.year || 0} delta="+14%" deltaType="increase" icon={ShoppingBag} color="orange" />
          <KpiCard title="Nouv. Clients" metric={data?.users?.month || 0} delta="+2.4%" deltaType="moderateIncrease" icon={Users} color="blue" />
          <KpiCard title="Conversion" metric="4.2%" delta="-0.5%" deltaType="moderateDecrease" icon={TrendingDown} color="red" />
        </Grid>

        {/* --- ANALYSE DE FLUX --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
            <Flex alignItems="start" className="mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><TrendingUp size={22}/></div>
                <div>
                  <Text className="font-black uppercase tracking-widest text-[10px] text-slate-400">Rapport Financier</Text>
                  <Metric className="font-black tracking-tighter italic text-slate-900">Flux de Trésorerie (7j)</Metric>
                </div>
              </div>
            </Flex>
            <AreaChart
              className="h-80 mt-6"
              data={data?.charts?.revenue || []}
              index="label"
              categories={["value"]}
              colors={["orange"]}
              valueFormatter={(v) => `${v.toLocaleString()} FCFA`}
              showLegend={false}
              showGridLines={true}
              curveType="monotone"
            />
          </Card>

          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white flex flex-col">
            <Flex className="mb-8">
              <Text className="font-black uppercase tracking-[0.2em] flex items-center gap-2 italic text-slate-800">
                <MessageSquare size={18} className="text-blue-500" /> Retours Client
              </Text>
              <Link href="/admin/reviews" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Détails</Link>
            </Flex>
            <div className="flex-1 space-y-6 overflow-y-auto max-h-[350px] pr-2 scrollbar-hide">
              {data?.reviews?.map((rev) => (
                <div key={rev._id} className="border-l-2 border-slate-100 hover:border-blue-500 pl-4 transition-all group">
                  <Flex>
                    <Text className="font-black text-slate-900 text-xs group-hover:text-blue-600">{rev.userName}</Text>
                    <div className="flex items-center gap-0.5 text-orange-400"><Star size={10} fill="currentColor" /><Text className="text-[10px] font-bold text-orange-400">{rev.rating}</Text></div>
                  </Flex>
                  <Text className="text-xs text-slate-500 italic mt-1 leading-relaxed line-clamp-2">"{rev.comment}"</Text>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* --- HISTOGRAMMES DE PERFORMANCE --- */}
        <Grid numItemsLg={2} className="gap-8">
          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
            <Text className="font-black uppercase tracking-widest mb-8 flex items-center gap-2 italic text-slate-900">
              <Users size={18} className="text-emerald-500" /> Inscriptions (7j)
            </Text>
            <AreaChart
              className="h-64"
              data={data?.charts?.users || []}
              index="label"
              categories={["value"]}
              colors={["emerald"]}
              showLegend={false}
              showYAxis={false}
              curveType="step"
            />
          </Card>

          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
            <Text className="font-black uppercase tracking-widest mb-8 flex items-center gap-2 italic text-slate-900">
              <BarChart3 size={18} className="text-blue-500" /> Volume de Commandes
            </Text>
            <BarChart
              className="h-64"
              data={data?.charts?.orders || []}
              index="label"
              categories={["value"]}
              colors={["blue"]}
              showLegend={false}
              yAxisWidth={48} // ✅ Correction ici : yAxisWidth au lieu de showYAxisWidth
            />
          </Card>
        </Grid>

      </main>
    </div>
  );
}

// --- MODULES DE COMPOSANTS DÉDIÉS ---

function KpiCard({ title, metric, delta, deltaType, icon: Icon, color }) {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-sm p-7 group hover:shadow-xl transition-all duration-500 bg-white">
      <Flex alignItems="start">
        <div className={`p-3 rounded-2xl bg-slate-50 text-${color}-500 group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <BadgeDelta deltaType={deltaType}>{delta}</BadgeDelta>
      </Flex>
      <Text className="mt-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">{title}</Text>
      <Metric className="font-black tracking-tighter text-slate-900 italic mt-1">{metric}</Metric>
    </Card>
  );
}

function DropdownMenu({ items, channel, color = "orange", close, onAdd, onEdit, onDelete }) {
  const accentColor = color === "orange" ? "text-orange-500" : "text-blue-600";
  return (
    <Card className="absolute top-full mt-3 left-0 w-64 p-0 rounded-[2rem] shadow-2xl border-none overflow-hidden animate-in fade-in slide-in-from-top-2 bg-white ring-1 ring-slate-200">
      <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modules {channel}</Text>
        <button onClick={onAdd} className={`${accentColor} hover:scale-110 transition-transform`}><PlusCircle size={20} /></button>
      </div>
      <div className="max-h-60 overflow-y-auto scrollbar-hide">
        {items.map(cat => (
          <div key={cat._id} className="flex items-center justify-between px-5 py-3 group border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
            <Link href={`/admin/products?channel=${channel}&category=${cat.name}`} className="text-xs font-bold text-slate-700 flex-1 uppercase tracking-tight" onClick={close}>{cat.name}</Link>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => onEdit(cat)} className="p-1.5 bg-white rounded-lg text-blue-500 shadow-sm hover:text-blue-600"><Edit3 size={14} /></button>
               <button onClick={() => onDelete(cat._id)} className="p-1.5 bg-white rounded-lg text-red-500 shadow-sm hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 🛠️ MODIFICATION DE ADMINNAV POUR ACCEPTER UN COMPTEUR
function AdminNav({ href, title, children, count }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 hover:bg-white/10 transition-all text-white group">
      <div className="relative">
        {children}
        {/* Badge de notification flottant */}
        {count > 0 && (
          <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#232f3e] animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
      <span className="hidden xl:block">{title}</span>
    </Link>
  );
}