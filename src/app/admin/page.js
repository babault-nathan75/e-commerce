"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  Package,
  MessageSquare,
  BarChart3
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function AdminHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement du dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER + NAV BUTTONS */}
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-green">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Vue globale de l’activité (données réelles)
            </p>
          </div>

          {/* ✅ Navbar horizontale à droite */}
          <nav className="flex items-center gap-3">
            <AdminNav href="/admin/users" title="Utilisateurs">
              <Users className="w-5 h-5" />
            </AdminNav>

            <AdminNav href="/admin/orders" title="Commandes">
              <ShoppingBag className="w-5 h-5" />
            </AdminNav>

            <AdminNav href="/admin/products" title="Produits">
              <Package className="w-5 h-5" />
            </AdminNav>

            <AdminNav href="/admin/reviews" title="Avis">
              <MessageSquare className="w-5 h-5" />
            </AdminNav>
          </nav>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Inscriptions (semaine)" value={data.users.week} />
          <StatCard title="Inscriptions (mois)" value={data.users.month} />
          <StatCard title="Commandes (mois)" value={data.orders.month} />
          <StatCard
            title="Chiffre d’affaires (livrées)"
            value={`${data.revenue.toLocaleString()} FCFA`}
          />
        </div>

        {/* GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartBox title="Inscriptions (7 derniers jours)" icon={<Users className="w-5 h-5" />}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.charts.users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line
                  dataKey="value"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Commandes (année)" icon={<BarChart3 className="w-5 h-5" />}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.charts.orders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>

        {/* EXTRA KPIs (si tu veux afficher aussi jour/semaine/année) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MiniCard
            title="Commandes (jour / semaine / année)"
            lines={[
              { k: "Aujourd’hui", v: data.orders.day },
              { k: "Semaine", v: data.orders.week },
              { k: "Année", v: data.orders.year }
            ]}
          />
          <MiniCard
            title="Inscriptions (semaine / mois / année)"
            lines={[
              { k: "Semaine", v: data.users.week },
              { k: "Mois", v: data.users.month },
              { k: "Année", v: data.users.year }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function AdminNav({ href, title, children }) {
  return (
    <Link
      href={href}
      title={title}
      className="
        group relative
        p-3 rounded-xl
        bg-white border border-gray-100
        text-gray-700
        hover:border-brand-orange hover:text-brand-orange
        hover:shadow-md hover:-translate-y-0.5
        transition-all duration-300
      "
    >
      {children}
    </Link>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-brand-green">
        {value}
      </div>
    </div>
  );
}

function ChartBox({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-brand-green">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function MiniCard({ title, lines }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {lines.map((l, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{l.k}</span>
            <span className="font-bold text-brand-orange">{l.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
