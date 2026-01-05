"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Image as ImageIcon, CheckCircle, XCircle, Loader2, UploadCloud, X, LayoutTemplate } from "lucide-react";
import Link from "next/link";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "/shop", // Valeur par défaut
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

  // --- LOGIQUE D'UPLOAD LOCAL ---
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
      } else {
        alert("Erreur upload: " + json.error);
      }
    } catch (err) {
      alert("Erreur serveur lors de l'upload");
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
    if (!formData.imageUrl) return alert("Veuillez uploader une image d'abord");

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
      alert("Erreur lors de la création");
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm("Supprimer cette bannière ?")) return;
    await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
    fetchBanners();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-brand-green flex items-center gap-3">
              <ImageIcon className="w-8 h-8" /> Gestion Bannières
            </h1>
            <p className="text-gray-500">Contrôlez les visuels défilants de l'accueil</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-green-700 border border-green-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition hover:text-white shadow-lg"
          >
            {showForm ? <XCircle /> : <Plus />} {showForm ? "Annuler" : "Nouvelle Bannière"}
          </button>
        </div>

        {/* Formulaire de création */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100 mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-4">Ajouter un visuel</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* ZONE UPLOAD / DRAG & DROP */}
              <div className="md:col-span-2">
                {formData.imageUrl ? (
                  <div className="relative h-48 w-full rounded-xl overflow-hidden border-2 border-brand-green">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
                      dragActive ? "border-brand-green bg-green-50" : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-10 h-10 animate-spin text-brand-green" />
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm font-bold text-gray-700">Glissez l'image ou cliquez ici</p>
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

              <input 
                type="text" placeholder="Titre (ex: Promo Été -50%)" 
                className="p-3 border rounded-lg outline-brand-green"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <input 
                type="text" placeholder="Description courte" 
                className="p-3 border rounded-lg outline-brand-green"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              />

              {/* ✅ SÉLECTEUR DE REDIRECTION (Choix Boutique ou Librairie) */}
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Destination du lien</label>
                <div className="relative">
                   <select 
                    className="w-full p-3 border rounded-lg outline-brand-green bg-white appearance-none cursor-pointer font-medium text-gray-700 focus:ring-2 focus:ring-brand-green/20 transition-all"
                    value={formData.link} 
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                  >
                    <option value="/shop">🛒 Boutique (Produits physiques)</option>
                    <option value="/library">📚 Librairie (E-books & Formations)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <LayoutTemplate className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={uploading} className="md:col-span-2 bg-white text-green-700 border border-green-700 px-6 py-3 rounded-xl font-bold items-center hover:bg-green-700 transition hover:text-white shadow-lg disabled:opacity-50">
                {uploading ? "Upload en cours..." : "Enregistrer la bannière"}
              </button>
            </form>
          </div>
        )}

        {/* Liste des bannières */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-green w-10 h-10" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div key={banner._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border group">
                <div className="h-40 relative">
                  <img src={banner.imageUrl} className="w-full h-full object-cover" alt={banner.title} />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button 
                      onClick={() => deleteBanner(banner._id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">{banner.title}</h3>
                    <p className="text-xs font-bold text-brand-orange px-2 py-0.5 bg-orange-50 rounded inline-block">
                      Lien : {banner.link === "/shop" ? "Boutique" : "Librairie"}
                    </p>
                  </div>
                  {banner.isActive ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Actif
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">Inactif</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {banners.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
            <p className="text-gray-400 italic">Aucune bannière configurée.</p>
          </div>
        )}
      </div>
    </div>
  );
}