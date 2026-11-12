"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVehicles, VehicleSummary } from "@/lib/api";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { Search, X, ChevronDown } from "lucide-react";

interface FilterValues {
  bodyType: string;
  condition: string;
  make: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  mileageMin: string;
  mileageMax: string;
  sortBy: string;
  page: string;
}

const DEFAULT_FILTERS: FilterValues = {
  bodyType: "",
  condition: "",
  make: "",
  priceMin: "",
  priceMax: "",
  yearMin: "",
  yearMax: "",
  mileageMin: "",
  mileageMax: "",
  sortBy: "createdAt_desc",
  page: "1",
};

// Mapeo de valores del UI a valores de la API
const bodyTypeMap: Record<string, string> = {
  "Sedán": "AUTO",
  "SUV": "SUV",
  "Camioneta": "CAMIONETA",
};

function filtersToQueryParams(filters: FilterValues) {
  const params: { [key: string]: string } = {};

  if (filters.bodyType) {
    params.bodyType = bodyTypeMap[filters.bodyType] || filters.bodyType;
  }
  if (filters.condition) params.condition = filters.condition;
  if (filters.make) params.make = filters.make;
  if (filters.priceMin) params.priceMin = filters.priceMin;
  if (filters.priceMax) params.priceMax = filters.priceMax;
  if (filters.yearMin) params.yearMin = filters.yearMin;
  if (filters.yearMax) params.yearMax = filters.yearMax;
  if (filters.mileageMin) params.mileageMin = filters.mileageMin;
  if (filters.mileageMax) params.mileageMax = filters.mileageMax;
  if (filters.sortBy && filters.sortBy !== "createdAt_desc") {
    params.sortBy = filters.sortBy;
  }
  if (filters.page && filters.page !== "1") params.page = filters.page;

  return params;
}

export default function CatalogoPage() {
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const queryParams = filtersToQueryParams(filters);
  const queryKey = ["vehicles", JSON.stringify(queryParams)];

  const { data: vehicles, isLoading, isError } = useQuery<VehicleSummary[]>({
    queryKey,
    queryFn: () => getVehicles(queryParams),
    staleTime: 60_000,
    retry: 1,
    retryDelay: 1000,
    refetchOnMount: true,
  });

  const handleChange = (field: keyof FilterValues, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== "" && v !== "createdAt_desc"
  );

  const popularMakes = ["Toyota", "Chevrolet", "Kia", "Hyundai", "Nissan"];
  const bodyTypes = ["Sedán", "SUV", "Camioneta"];
  const conditions = ["NUEVO", "USADO"];

  return (
    <div className="container-movia mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-sora text-3xl font-bold text-grafito mb-2">
          Catálogo de vehículos
        </h1>
        <p className="text-gray-600">
          Explora nuestra selección completa. Usa los filtros para afinar tu búsqueda.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="bg-blanco rounded-card p-5 shadow-sm">
            <h2 className="font-sora text-lg font-semibold mb-4">Filtros</h2>

            <div className="space-y-4">
              {/* Condition */}
              <div>
                <label className="label-field">Condición</label>
                <select
                  className="input-field"
                  value={filters.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                >
                  <option value="">Todas</option>
                  {conditions.map((c) => (
                    <option key={c} value={c}>
                      {c === "NUEVO" ? "Nuevo" : "Usado"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Body type */}
              <div>
                <label className="label-field">Tipo de carrocería</label>
                <select
                  className="input-field"
                  value={filters.bodyType}
                  onChange={(e) => handleChange("bodyType", e.target.value)}
                >
                  <option value="">Todos</option>
                  {bodyTypes.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Make */}
              <div>
                <label className="label-field">Marca</label>
                <select
                  className="input-field"
                  value={filters.make}
                  onChange={(e) => handleChange("make", e.target.value)}
                >
                  <option value="">Todas</option>
                  {popularMakes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="label-field">Rango de precio (COP)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    className="input-field !py-2 text-sm"
                    value={filters.priceMin}
                    onChange={(e) => handleChange("priceMin", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Máximo"
                    className="input-field !py-2 text-sm"
                    value={filters.priceMax}
                    onChange={(e) => handleChange("priceMax", e.target.value)}
                  />
                </div>
              </div>

              {/* Year range */}
              <div>
                <label className="label-field">Año</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Desde"
                    className="input-field !py-2 text-sm"
                    value={filters.yearMin}
                    onChange={(e) => handleChange("yearMin", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Hasta"
                    className="input-field !py-2 text-sm"
                    value={filters.yearMax}
                    onChange={(e) => handleChange("yearMax", e.target.value)}
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="label-field">Ordenar por</label>
                <select
                  className="input-field"
                  value={filters.sortBy}
                  onChange={(e) => handleChange("sortBy", e.target.value)}
                >
                  <option value="createdAt_desc">Más recientes primero</option>
                  <option value="price_asc">Precio: menor a mayor</option>
                  <option value="price_desc">Precio: mayor a menor</option>
                  <option value="year_desc">Año: más nuevo primero</option>
                </select>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  className="btn-outline w-full text-sm"
                  onClick={handleClear}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            className={`btn-primary w-full flex items-center justify-center gap-2 ${showFilters ? "!bg-gray-700" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Search size={18} />
            Filtros{hasActiveFilters ? ` (${Object.values(filters).filter((v) => v !== "" && v !== "createdAt_desc").length})` : ""}
            <ChevronDown
              size={18}
              className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Mobile filter panel */}
        {showFilters && (
          <div className="lg:hidden bg-blanco rounded-card p-5 shadow-sm mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sora text-lg font-semibold">Filtros</h2>
              <button onClick={() => setShowFilters(false)} aria-label="Cerrar filtros">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">Condición</label>
                <select
                  className="input-field !py-2 text-sm"
                  value={filters.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                >
                  <option value="">Ambos</option>
                  {conditions.map((c) => (
                    <option key={c} value={c}>
                      {c === "NUEVO" ? "Nuevo" : "Usado"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Tipo</label>
                <select
                  className="input-field !py-2 text-sm"
                  value={filters.bodyType}
                  onChange={(e) => handleChange("bodyType", e.target.value)}
                >
                  <option value="">Todos</option>
                  {bodyTypes.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">Marca</label>
                <select
                  className="input-field !py-2 text-sm"
                  value={filters.make}
                  onChange={(e) => handleChange("make", e.target.value)}
                >
                  <option value="">Todas</option>
                  {popularMakes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Precio mín.</label>
                <input
                  type="number"
                  className="input-field !py-2 text-sm"
                  placeholder="$0"
                  value={filters.priceMin}
                  onChange={(e) => handleChange("priceMin", e.target.value)}
                />
              </div>
              <div>
                <label className="label-field">Precio máx.</label>
                <input
                  type="number"
                  className="input-field !py-2 text-sm"
                  placeholder="$∞"
                  value={filters.priceMax}
                  onChange={(e) => handleChange("priceMax", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="label-field">Ordenar por</label>
                <select
                  className="input-field !py-2 text-sm"
                  value={filters.sortBy}
                  onChange={(e) => handleChange("sortBy", e.target.value)}
                >
                  <option value="createdAt_desc">Más recientes</option>
                  <option value="price_asc">Precio ↑</option>
                  <option value="price_desc">Precio ↓</option>
                  <option value="year_desc">Año nuevo ↑</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button className="btn-outline w-full text-sm" onClick={handleClear}>
                Limpiar todo
              </button>
            )}
          </div>
        )}

        {/* Results grid */}
        <div className="flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-dorado border-t-transparent rounded-full" />
            </div>
          )}

          {isError && (
            <div className="bg-error/10 border border-error/30 rounded-btn p-4 text-error">
              Error al cargar los vehículos. Intenta recargar la página.
            </div>
          )}

          {!isLoading && !isError && vehicles && vehicles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No se encontraron vehículos con esos filtros.</p>
              <button className="btn-primary mt-4" onClick={handleClear}>
                Limpiar filtros
              </button>
            </div>
          )}

          {!isLoading && !isError && vehicles && vehicles.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Mostrando {vehicles.length} vehículo{vehicles.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}