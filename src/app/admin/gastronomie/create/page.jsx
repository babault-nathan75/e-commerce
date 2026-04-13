"use client";

import { useState } from "react";
import { ArrowLeft, Save, ImagePlus, Utensils, AlignLeft, Tag, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createMenuItem } from "@/lib/actions/menuItem";

export default function CreatePlatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); 
  
  // État du formulaire propre (sans initialData)
  const [formData, setFormData] = useState({
    name: "",
    category: "Plats de résistance",
    price: "",
    description: "",
    restaurant: "hebron",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("description", formData.description);
      data.append("restaurant", formData.restaurant);
      
      if (imageFile) {
        data.append("image", imageFile);
      }

      const result = await createMenuItem(data);

      if (result.success) {
        alert("Plat créé avec succès !");
        router.push("/admin/gastronomie/en-ligne");
      } else {
        alert(result.error || "Erreur lors de la création.");
      }
      
    } catch (error) {
      console.error(error);
      alert("Une erreur inattendue est survenue lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/gastronomie/en-ligne" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
            <ArrowLeft size={20} /> Retour au catalogue
        </Link>

        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ajouter un nouveau plat</h1>
            <p className="text-slate-500 font-medium mt-1 mb-8">Enregistrez un nouveau repas pour le catalogue en ligne.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-10">
                
                {/* COLONNE GAUCHE : PHOTO */}
                <div className="w-full md:w-1/3">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <ImagePlus size={16} /> Photo du plat
                    </h2>
                    
                    <div className="relative group w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-orange-400 hover:bg-orange-50">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-6 text-slate-400 group-hover:text-orange-500 transition-colors">
                                <ImagePlus size={40} className="mx-auto mb-2 opacity-50" />
                                <span className="text-xs font-bold uppercase tracking-wide">Cliquez pour ajouter</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                {/* COLONNE DROITE : INFORMATIONS */}
                <div className="w-full md:w-2/3 space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Utensils size={16} /> Détails du plat
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Nom du plat</label>
                            <input 
                                required type="text" placeholder="Ex: Poulet braisé entier..."
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900"
                                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Catégorie</label>
                            <select 
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-700"
                                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="Entrées">Entrées</option>
                                <option value="Plats de résistance">Plats de résistance</option>
                                <option value="Accompagnements">Accompagnements</option>
                                <option value="Desserts">Desserts</option>
                                <option value="Boissons">Boissons</option>
                                <option value="Spécialités">Spécialités</option>
                                <option value="Petit dejeuner">Petit dejeuner</option>
                                <option value="Snacks et encas">Snacks et encas</option>
                                <option value="Plats rapides">Plats rapides</option>
                                <option value="Fast-food">Fast-food</option>
                                <option value="Accompagnement">Accompagnement</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                <Tag size={14} /> Prix (FCFA)
                            </label>
                            <input 
                                required type="number" min="0" placeholder="Ex: 8000"
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900"
                                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                <Store size={14} /> Restaurant
                            </label>
                            <select 
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-700"
                                value={formData.restaurant} onChange={(e) => setFormData({...formData, restaurant: e.target.value})}
                            >
                                <option value="hebron">Hebron Assinie</option>
                                <option value="teresa">Espace Teresa</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                            <AlignLeft size={14} /> Description
                        </label>
                        <textarea 
                            required rows="4" placeholder="Décrivez les ingrédients, la préparation..."
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700 resize-none"
                            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg hover:-translate-y-1 disabled:opacity-50"
                >
                    <Save size={20} /> {loading ? "Création en cours..." : "ENREGISTRER LE PLAT"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}