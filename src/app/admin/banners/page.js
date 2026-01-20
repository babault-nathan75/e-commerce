"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle, 
  Loader2, 
  UploadCloud, 
  X, 
  LayoutTemplate, 
  ExternalLink,
  Eye,
  Settings2,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "/shop",
    isActive: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (res.ok) {
        setFormData((prev) => ({ ...prev, imageUrl: json.url }));
      }
    } catch (err) {
      console.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) return;

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ title: "", description: "", imageUrl: "", link: "/shop", isActive: true });
        fetchBanners();
      }
    } catch (error) {
      console.error("Submit failed");
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm("Supprimer cette bannière ?")) return;
    await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
    fetchBanners();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 p-4 md:p-10 transition-colors duration-300">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-600 rounded-xl text-white shadow-lg shadow-green-600/20">
                    <ImageIcon size={24} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase">
                    Banner <span className="text-green-600">Studio</span>
                </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">Optimisez l'impact visuel de votre page d'accueil</p>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`
              px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all duration-300 shadow-xl
              ${showForm 
                ? "bg-white dark:bg-gray-900 text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-50" 
                : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-green-600 dark:hover:bg-gray-200 hover:text-white"
              }
            `}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />} 
            {showForm ? "Annuler" : "Créer un visuel"}
          </button>
        </header>

        {/* --- FORMULAIRE D'AJOUT --- */}
        {showForm && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white dark:border-gray-800 mb-12 animate-in fade-in slide-in-from-top-8 duration-500">
            <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-orange-500" size={20} />
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Nouveau Chef-d'œuvre</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Zone Upload High-End */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fichier Visuel (1920x600 recommandé)</label>
                {formData.imageUrl ? (
                  <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl group">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        className="bg-white text-red-600 p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform"
                        >
                        <Trash2 className="w-6 h-6" />
                        </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative aspect-video rounded-[2rem] border-4 border-dashed flex flex-col items-center justify-center transition-all duration-500 group ${
                      dragActive ? "border-green-500 bg-green-500/5" : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:border-green-400"
                    }`}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
                        <span className="text-xs font-black text-green-600 uppercase tracking-widest">Traitement...</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl mb-4 text-gray-400 group-hover:text-green-500 transition-colors">
                            <UploadCloud className="w-10 h-10" />
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Glissez votre visuel ici</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-tighter">ou cliquez pour explorer</p>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                          accept="image/*"
                        />
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Champs texte */}
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Accroche Principale</label>
                        <input 
                            type="text" placeholder="Ex: Collection d'Hiver 2026" 
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-green-500 transition-all font-bold text-gray-900 dark:text-white"
                            value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Légende</label>
                        <input 
                            type="text" placeholder="Ex: Jusqu'à -40% sur les nouveautés" 
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-green-500 transition-all text-sm font-medium"
                            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Canal de Destination</label>
                        <div className="relative group">
                            <select 
                                className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-green-500 transition-all font-bold text-gray-700 dark:text-gray-300 appearance-none cursor-pointer"
                                value={formData.link} 
                                onChange={(e) => setFormData({...formData, link: e.target.value})}
                            >
                                <option value="/shop">🛒 Boutique Physique</option>
                                <option value="/library">📚 Librairie Numérique</option>
                            </select>
                            <LayoutTemplate className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={uploading || !formData.imageUrl} 
                    className="w-full py-5 rounded-2xl bg-green-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-600/20 hover:bg-green-700 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                >
                  {uploading ? "Patientez..." : "Publier la bannière"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- GALERIE DES BANNIÈRES --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-green-600 w-12 h-12" />
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Chargement du studio...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
            {banners.map((banner) => (
              <div key={banner._id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-800 group transition-all duration-500">
                <div className="aspect-video relative overflow-hidden">
                  <img src={banner.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={banner.title} />
                  
                  {/* Overlay Intelligente au Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
                     <div className="flex justify-between items-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex gap-2">
                           <button 
                             onClick={() => deleteBanner(banner._id)}
                             className="p-3 bg-red-600 text-white rounded-2xl shadow-xl hover:bg-red-700 transition-colors"
                             title="Supprimer"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                           <Link href={banner.link} target="_blank" className="p-3 bg-white text-gray-900 rounded-2xl shadow-xl hover:bg-gray-100 transition-colors">
                             <ExternalLink className="w-5 h-5" />
                           </Link>
                        </div>
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white text-xs font-black uppercase tracking-widest">
                            {banner.link.replace('/', '')}
                        </div>
                     </div>
                  </div>

                  {/* Statut Badge */}
                  <div className="absolute top-6 left-6">
                    {banner.isActive ? (
                        <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-green-600 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full shadow-xl">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Actif
                        </span>
                    ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-white/80 px-3 py-1.5 rounded-full backdrop-blur-md">Inactif</span>
                    )}
                  </div>
                </div>

                <div className="p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg mb-1">{banner.title}</h3>
                    <p className="text-xs text-gray-500 font-medium line-clamp-1 italic">{banner.description || "Aucune description fournie"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 group-hover:text-orange-500 transition-colors">
                    <Settings2 size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {banners.length === 0 && !loading && (
          <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 mb-6">
                <LayoutTemplate size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Aucune bannière active</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">Votre vitrine est actuellement vide. Cliquez sur le bouton "Créer un visuel" pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  );
}