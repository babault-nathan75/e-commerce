"use client";

export default function FiltersBox({ filters, setFilters }) {
  return (
    <div className="bg-white border rounded-xl p-4 space-y-4 shadow-sm">
      <h3 className="font-semibold">Filtres</h3>

      <div>
        <label className="text-sm">Prix minimum</label>
        <input
          type="number"
          value={filters.min}
          onChange={(e) =>
            setFilters({ ...filters, min: e.target.value })
          }
          className="mt-1 w-full border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="text-sm">Prix maximum</label>
        <input
          type="number"
          value={filters.max}
          onChange={(e) =>
            setFilters({ ...filters, max: e.target.value })
          }
          className="mt-1 w-full border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="text-sm">Canal</label>
        <select
          value={filters.channel}
          onChange={(e) =>
            setFilters({ ...filters, channel: e.target.value })
          }
          className="mt-1 w-full border rounded px-2 py-1"
        >
          <option value="">Tous</option>
          <option value="shop">Boutique</option>
          <option value="library">Librairie</option>
        </select>
      </div>
    </div>
  );
}
