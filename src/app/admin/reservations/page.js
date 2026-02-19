import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { updateBookingStatus } from "@/lib/actions/booking";
import { CheckCircle, XCircle, Clock, Calendar, Users, Phone, ArrowLeft, Eye, Mail, Receipt, Search, X, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage({ searchParams }) {
    await connectDB();

    // 1. Récupération des paramètres de l'URL
    const params = await searchParams;
    const selectedId = params?.id;
    const query = params?.search || ""; // Terme de recherche

    // 2. Logique de filtrage MongoDB (Côté Serveur)
    let filter = {};
    if (query) {
        filter = {
            $or: [
                { bookingCode: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } },
                { phone: { $regex: query, $options: "i" } },
            ],
        };
    }

    // Récupération des données filtrées
    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).lean();

    const getStatusStyle = (status) => {
        switch (status) {
            case "EN_ATTENTE": return "bg-orange-100 text-orange-700 border-orange-200";
            case "CONFIRMEE": return "bg-green-100 text-green-700 border-green-200";
            case "TERMINEE": return "bg-slate-100 text-slate-600 border-slate-200";
            case "ANNULEE": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    // --- VUE DÉTAILLÉE (Affichée si un ID est présent dans l'URL) ---
    if (selectedId) {
        const booking = await Booking.findById(selectedId).lean();

        if (!booking) {
            return (
                <div className="p-10 text-center">
                    <h2 className="text-xl font-bold text-red-500">Réservation introuvable</h2>
                    <Link href="/admin/reservations" className="text-blue-600 underline mt-4 block">Retour à la liste</Link>
                </div>
            );
        }

        const isHebron = booking.restaurant === 'hebron';
        const imageUpdateAttr = booking.updatedAt ? new Date(booking.updatedAt).getTime() : Date.now();
        const imageUrl = booking.paymentProofUrl ? `${booking.paymentProofUrl}?t=${imageUpdateAttr}` : null;
        const totalPaye = Number(booking.totalAmount || 0);

        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <div className="max-w-6xl mx-auto">
                    <Link href="/admin/reservations" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6 transition-colors">
                        <ArrowLeft size={20} /> Retour à la liste
                    </Link>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* COLONNE GAUCHE : Paiement & Actions */}
                        <div className="w-full lg:w-1/3 space-y-6">
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 text-center">
                                <div className={`inline-block px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border mb-6 ${getStatusStyle(booking.status)}`}>
                                    {(booking.status || "EN ATTENTE").replace(/_/g, " ")}
                                </div>
                                <p className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center justify-center gap-2"><Receipt size={16}/> Preuve de Paiement</p>
                                {imageUrl ? (
                                    <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="relative block rounded-2xl overflow-hidden border-4 border-slate-100 group cursor-zoom-in">
                                        <img src={imageUrl} alt="Preuve" className="w-full h-auto object-cover min-h-[200px] bg-slate-50" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold gap-2">
                                            <ExternalLink size={20} /> Voir en grand
                                        </div>
                                    </a>
                                ) : (
                                    <div className="bg-slate-100 p-8 rounded-2xl text-slate-400 italic text-center text-sm">Aucune preuve trouvée</div>
                                )}
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Montant Total Payé</p>
                                    <p className={`text-3xl font-black ${isHebron ? 'text-orange-600' : 'text-purple-600'}`}>
                                        {totalPaye.toLocaleString('fr-FR')} FCFA
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-3">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Actions</h3>
                                {booking.status === "EN_ATTENTE" && (
                                    <form action={async () => { "use server"; await updateBookingStatus(booking._id.toString(), "CONFIRMEE"); }}>
                                        <button className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1">
                                            <CheckCircle size={20} /> CONFIRMER
                                        </button>
                                    </form>
                                )}
                                {booking.status !== "ANNULEE" && booking.status !== "TERMINEE" && (
                                    <form action={async () => { "use server"; await updateBookingStatus(booking._id.toString(), "ANNULEE"); }}>
                                        <button className="w-full flex justify-center items-center gap-2 bg-white border-2 border-slate-200 text-red-500 hover:bg-red-50 px-6 py-4 rounded-xl font-bold transition-colors">
                                            <XCircle size={20} /> ANNULER
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* COLONNE DROITE : Détails client & Menu */}
                        <div className="flex-1 space-y-6">
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                <div className={`p-8 text-white flex justify-between items-start ${isHebron ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-purple-600 to-purple-700'}`}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">{booking.bookingCode}</span>
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">{isHebron ? 'Hebron' : 'Teresa'}</span>
                                        </div>
                                        <h1 className="text-3xl font-black">{booking.name}</h1>
                                    </div>
                                    <div className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-center shadow-lg">
                                        <div className="text-[10px] text-slate-400 uppercase">Couverts</div>
                                        <div className="text-xl flex items-center justify-center gap-1"><Users size={18} /> {booking.guests}</div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Calendar size={14} /> Créneau</h3>
                                            <p className="text-lg font-black text-slate-900 capitalize mb-1">
                                                {new Date(booking.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            <p className="text-md font-bold text-slate-500 flex items-center gap-2"><Clock size={16} className="text-blue-500" /> {booking.timeSlot}</p>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Phone size={14} /> Contact</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 font-bold text-slate-700 bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-sm"><Phone size={14} /> {booking.phone}</div>
                                                {booking.email && <div className="flex items-center gap-3 font-bold text-slate-700 bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-sm"><Mail size={14} /> {booking.email}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-100 pt-8">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Receipt size={18} /> Menu Pré-commandé</h3>
                                        <div className="bg-slate-50 rounded-2xl p-1 overflow-hidden border border-slate-100">
                                            <table className="w-full text-left">
                                                <thead className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 border-b border-slate-200">
                                                    <tr>
                                                        <th className="p-4">Plat</th>
                                                        <th className="p-4 text-center">Qté</th>
                                                        <th className="p-4 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 bg-white">
                                                    {booking.items?.length > 0 ? booking.items.map((item, idx) => (
                                                        <tr key={idx} className="text-sm font-medium text-slate-700 hover:bg-slate-50">
                                                            <td className="p-4">{item.name}</td>
                                                            <td className="p-4 text-center text-slate-900 font-bold">x{item.quantity || item.qty}</td>
                                                            <td className="p-4 text-right font-bold text-slate-900">{((item.price || 0) * (item.quantity || item.qty)).toLocaleString('fr-FR')}</td>
                                                        </tr>
                                                    )) : <tr><td colSpan="3" className="p-10 text-center text-slate-400 italic">Aucun plat</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VUE LISTE PAR DÉFAUT ---
    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors">
                        <ArrowLeft size={20} /> Retour au menu principal
                    </Link>
                    
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Réservations de Tables</h1>
                            <p className="text-slate-500 font-medium mt-1">Gérez les demandes de réservation.</p>
                        </div>

                        {/* 🔍 BARRE DE RECHERCHE SERVEUR (NON DYNAMIQUE) */}
                        <form method="GET" action="/admin/reservations" className="flex w-full md:w-96 gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    name="search" 
                                    defaultValue={query}
                                    placeholder="Nom, Code ou Téléphone..."
                                    className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 font-bold text-slate-700 shadow-sm"
                                />
                                {query && (
                                    <Link href="/admin/reservations" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500">
                                        <X size={18} />
                                    </Link>
                                )}
                            </div>
                            <button type="submit" className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                                Rechercher
                            </button>
                        </form>

                        <div className="bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm font-bold text-slate-700 flex items-center gap-2 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {bookings.length} Réservation(s)
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Lieu</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4 text-right">Montant</th>
                                    <th className="p-4 text-center">Statut</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {bookings.length > 0 ? (
                                    bookings.map((b) => (
                                        <tr key={b._id.toString()} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-sm">
                                                <div className="font-black text-slate-900">{new Date(b.date).toLocaleDateString('fr-FR')}</div>
                                                <div className="text-xs font-bold text-blue-600">{b.timeSlot}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase ${b.restaurant === 'hebron' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                    {b.restaurant === 'hebron' ? 'Hebron' : 'Teresa'}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm">
                                                <div className="font-bold text-slate-700">{b.name}</div>
                                                <div className="text-[10px] text-slate-400">{b.phone} <span className="text-slate-200 ml-2">| {b.bookingCode}</span></div>
                                            </td>
                                            <td className="p-4 text-right font-black text-slate-900 text-sm">
                                                {Number(b.totalAmount || 0).toLocaleString('fr-FR')} FCFA
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(b.status)}`}>
                                                    {b.status.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link href={`/admin/reservations?id=${b._id.toString()}`} className="inline-flex items-center gap-1 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">
                                                    <Eye size={14} /> Voir
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center text-slate-400 italic">
                                            Aucune réservation trouvée pour "{query}".
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}