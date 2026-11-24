"use client";

import { useCallback, useMemo, useState, type FocusEvent, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { RotateCcw, SearchX, SlidersHorizontal } from "lucide-react";
import { useVehicleFacets, useVehiclePage } from "@/features/vehicles/hooks/useVehicles";
import type { VehicleQueryParams } from "@/features/vehicles/types";
import VehicleCard from "@/features/vehicles/components/VehicleCard";
import { Button } from "@/components/ui/Button";
import { FilterChip } from "@/components/ui/FilterChip";
import { FormField, Input, Select } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { VehicleCardSkeleton } from "@/components/ui/Skeleton";
import { cn, formatPriceCOP } from "@/lib/utils";

type SortValue = NonNullable<VehicleQueryParams["sortBy"]>;
type NumberFilterKey = "minPrice" | "maxPrice" | "mileageMin" | "mileageMax";

interface CatalogFilters {
  bodyType: string;
  condition: string;
  make: string;
  minPrice: string;
  maxPrice: string;
  yearMin: string;
  yearMax: string;
  mileageMin: string;
  mileageMax: string;
  sortBy: SortValue;
  page: number;
}

const PAGE_SIZE = 12;

const DEFAULTS: CatalogFilters = {
  bodyType: "",
  condition: "",
  make: "",
  minPrice: "",
  maxPrice: "",
  yearMin: "",
  yearMax: "",
  mileageMin: "",
  mileageMax: "",
  sortBy: "createdAt_desc",
  page: 1,
};

const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: "createdAt_desc", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "year_desc", label: "Año: más nuevo" },
];

const BODY_TYPES = [
  { value: "AUTO", label: "Auto" },
  { value: "SUV", label: "SUV" },
  { value: "CAMIONETA", label: "Camioneta" },
];

const CONDITIONS = [
  { value: "NUEVO", label: "Nuevo" },
  { value: "USADO", label: "Usado" },
];

function parseFilters(params: ReadonlyURLSearchParams): CatalogFilters {
  const rawSort = params.get("sortBy") as SortValue | null;
  const sortBy = SORT_OPTIONS.some((option) => option.value === rawSort)
    ? (rawSort as SortValue)
    : DEFAULTS.sortBy;

  return {
    bodyType: params.get("bodyType") ?? "",
    condition: params.get("condition") ?? "",
    make: params.get("make") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    yearMin: params.get("yearMin") ?? "",
    yearMax: params.get("yearMax") ?? "",
    mileageMin: params.get("mileageMin") ?? "",
    mileageMax: params.get("mileageMax") ?? "",
    sortBy,
    page: Math.max(1, Number(params.get("page")) || 1),
  };
}

function toApiParams(filters: CatalogFilters): VehicleQueryParams {
  const params: VehicleQueryParams = { limit: String(PAGE_SIZE), sortBy: filters.sortBy };
  if (filters.bodyType) params.bodyType = filters.bodyType;
  if (filters.condition) params.condition = filters.condition;
  if (filters.make) params.make = filters.make;
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters.yearMin) params.yearMin = filters.yearMin;
  if (filters.yearMax) params.yearMax = filters.yearMax;
  if (filters.mileageMin) params.mileageMin = filters.mileageMin;
  if (filters.mileageMax) params.mileageMax = filters.mileageMax;
  if (filters.page > 1) params.page = String(filters.page);
  return params;
}

interface OptionGroupProps {
  legend: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}

function OptionGroup({ legend, options, value, onChange }: OptionGroupProps) {
  return (
    <fieldset>
      <legend className="label-field">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={value === ""}
          onClick={() => onChange("")}
          className={cn(
            "min-h-9 rounded-btn border px-3 text-xs font-semibold transition-colors",
            value === ""
              ? "border-dorado bg-accent-soft text-accent-text"
              : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
          )}
        >
          Todos
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-9 rounded-btn border px-3 text-xs font-semibold transition-colors",
              value === option.value
                ? "border-dorado bg-accent-soft text-accent-text"
                : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

interface FilterControlsProps {
  filters: CatalogFilters;
  years: number[];
  makes: string[];
  idPrefix: string;
  showClear?: boolean;
  onChange: (patch: Partial<CatalogFilters>) => void;
  onCommitNumber: (field: NumberFilterKey, value: string) => void;
  onClear: () => void;
}

function FilterControls({
  filters,
  years,
  makes,
  idPrefix,
  showClear = true,
  onChange,
  onCommitNumber,
  onClear,
}: FilterControlsProps) {
  const numberProps = (field: NumberFilterKey, placeholder: string) => ({
    id: `${idPrefix}-${field}`,
    type: "number" as const,
    min: 0,
    inputMode: "numeric" as const,
    defaultValue: filters[field],
    placeholder,
    onBlur: (event: FocusEvent<HTMLInputElement>) => onCommitNumber(field, event.target.value),
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") event.currentTarget.blur();
    },
  });

  const numberKey = (field: NumberFilterKey) => `${idPrefix}-${field}-${filters[field]}`;

  return (
    <div className="space-y-6">
      <OptionGroup
        legend="Condición"
        options={CONDITIONS}
        value={filters.condition}
        onChange={(value) => onChange({ condition: value })}
      />
      <OptionGroup
        legend="Carrocería"
        options={BODY_TYPES}
        value={filters.bodyType}
        onChange={(value) => onChange({ bodyType: value })}
      />

      <FormField label="Marca" htmlFor={`${idPrefix}-make`}>
        <Select
          id={`${idPrefix}-make`}
          value={filters.make}
          onChange={(event) => onChange({ make: event.target.value })}
        >
          <option value="">Todas las marcas</option>
          {makes.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Año desde" htmlFor={`${idPrefix}-year-min`}>
          <Select
            id={`${idPrefix}-year-min`}
            value={filters.yearMin}
            onChange={(event) => {
              const value = event.target.value;
              const patch: Partial<CatalogFilters> = { yearMin: value };
              if (value && filters.yearMax && Number(filters.yearMax) < Number(value)) patch.yearMax = "";
              onChange(patch);
            }}
          >
            <option value="">Desde</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Año hasta" htmlFor={`${idPrefix}-year-max`}>
          <Select
            id={`${idPrefix}-year-max`}
            value={filters.yearMax}
            onChange={(event) => {
              const value = event.target.value;
              const patch: Partial<CatalogFilters> = { yearMax: value };
              if (value && filters.yearMin && Number(filters.yearMin) > Number(value)) patch.yearMin = "";
              onChange(patch);
            }}
          >
            <option value="">Hasta</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Precio mín. (COP)" htmlFor={`${idPrefix}-minPrice`}>
          <Input key={numberKey("minPrice")} {...numberProps("minPrice", "0")} />
        </FormField>
        <FormField label="Precio máx. (COP)" htmlFor={`${idPrefix}-maxPrice`}>
          <Input key={numberKey("maxPrice")} {...numberProps("maxPrice", "Sin límite")} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Km mín." htmlFor={`${idPrefix}-mileageMin`}>
          <Input key={numberKey("mileageMin")} {...numberProps("mileageMin", "0")} />
        </FormField>
        <FormField label="Km máx." htmlFor={`${idPrefix}-mileageMax`}>
          <Input key={numberKey("mileageMax")} {...numberProps("mileageMax", "Sin límite")} />
        </FormField>
      </div>

      {showClear && (
        <Button variant="outline" fullWidth onClick={onClear} leftIcon={<RotateCcw size={16} aria-hidden="true" />}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}

export default function CatalogView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const facetsQuery = useVehicleFacets();
  const years = facetsQuery.data?.years ?? [];
  const makes = facetsQuery.data?.makes ?? [];
  const { data, isLoading, isError, isFetching, refetch } = useVehiclePage(toApiParams(filters));

  const vehicles = data?.data ?? [];
  const pagination = data?.pagination ?? {
    page: filters.page,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  const setFilters = useCallback(
    (patch: Partial<CatalogFilters>) => {
      const params = new URLSearchParams(searchParams.toString());
      (Object.entries(patch) as Array<[keyof CatalogFilters, string | number]>).forEach(([key, value]) => {
        const text = String(value);
        const fallback = String(DEFAULTS[key]);
        if (!text || text === fallback) params.delete(key);
        else params.set(key, text);
      });
      if (!("page" in patch)) params.delete("page");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const commitNumber = useCallback(
    (field: NumberFilterKey, value: string) => {
      setFilters({ [field]: value } as Partial<CatalogFilters>);
    },
    [setFilters]
  );

  const chips = useMemo(() => {
    const result: Array<{ key: keyof CatalogFilters; label: string }> = [];
    if (filters.condition)
      result.push({ key: "condition", label: filters.condition === "NUEVO" ? "Nuevo" : "Usado" });
    if (filters.bodyType)
      result.push({
        key: "bodyType",
        label: BODY_TYPES.find((option) => option.value === filters.bodyType)?.label ?? filters.bodyType,
      });
    if (filters.make) result.push({ key: "make", label: filters.make });
    if (filters.minPrice) result.push({ key: "minPrice", label: `Desde ${formatPriceCOP(Number(filters.minPrice))}` });
    if (filters.maxPrice) result.push({ key: "maxPrice", label: `Hasta ${formatPriceCOP(Number(filters.maxPrice))}` });
    if (filters.yearMin) result.push({ key: "yearMin", label: `Año desde ${filters.yearMin}` });
    if (filters.yearMax) result.push({ key: "yearMax", label: `Año hasta ${filters.yearMax}` });
    if (filters.mileageMin)
      result.push({ key: "mileageMin", label: `Desde ${Number(filters.mileageMin).toLocaleString("es-CO")} km` });
    if (filters.mileageMax)
      result.push({ key: "mileageMax", label: `Hasta ${Number(filters.mileageMax).toLocaleString("es-CO")} km` });
    return result;
  }, [filters]);

  const firstVisible = pagination.total > 0 ? (pagination.page - 1) * PAGE_SIZE + 1 : 0;
  const lastVisible = Math.min(pagination.page * PAGE_SIZE, pagination.total);

  const controlsProps: FilterControlsProps = {
    filters,
    years,
    makes,
    idPrefix: "desktop",
    onChange: setFilters,
    onCommitNumber: commitNumber,
    onClear: clearFilters,
  };

  return (
    <div className="container-movia py-10 md:py-14">
      <header className="mb-8">
        <p className="section-eyebrow">Explora MOVIA</p>
        <h1 className="mt-2 font-sora text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Catálogo de vehículos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Filtra por carrocería, condición, marca, año, precio y kilometraje. Los filtros se conservan en la URL.
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="card sticky top-24 p-5">
            <h2 className="mb-5 font-sora text-base font-semibold text-foreground">Filtros</h2>
            <FilterControls {...controlsProps} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <Button
            variant="outline"
            fullWidth
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
            leftIcon={<SlidersHorizontal size={17} aria-hidden="true" />}
          >
            Filtros{chips.length > 0 ? ` (${chips.length})` : ""}
          </Button>

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Filtros activos">
              {chips.map((chip) => (
                <FilterChip
                  key={chip.key}
                  label={chip.label}
                  onRemove={() => setFilters({ [chip.key]: "" } as Partial<CatalogFilters>)}
                />
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-9 px-2 text-xs font-semibold text-muted underline-offset-4 hover:text-foreground hover:underline"
              >
                Limpiar todo
              </button>
            </div>
          )}

          <div className="mb-5 mt-5 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm text-muted">
              {isFetching
                ? "Actualizando resultados…"
                : pagination.total > 0
                  ? `Mostrando ${firstVisible}–${lastVisible} de ${pagination.total} vehículos`
                  : "Sin resultados"}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="catalog-sort" className="sr-only">
                Ordenar por
              </label>
              <Select
                id="catalog-sort"
                value={filters.sortBy}
                onChange={(event) => setFilters({ sortBy: event.target.value as SortValue })}
                className="w-full sm:w-56"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Cargando vehículos">
              {Array.from({ length: 6 }).map((_, index) => (
                <VehicleCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={<SearchX size={24} aria-hidden="true" />}
              title="No pudimos cargar el catálogo"
              description="Revisa tu conexión e inténtalo de nuevo."
              action={<Button onClick={() => void refetch()}>Reintentar</Button>}
            />
          ) : vehicles.length === 0 ? (
            <EmptyState
              icon={<SearchX size={24} aria-hidden="true" />}
              title="No encontramos vehículos"
              description="Prueba con otros filtros o limpia la búsqueda para ver todo el inventario."
              action={<Button onClick={clearFilters}>Limpiar filtros</Button>}
            />
          ) : (
            <>
              <div
                className={cn(
                  "grid gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3",
                  isFetching && "opacity-60"
                )}
              >
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <Pagination
                  className="mt-10"
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onChange={(page) => setFilters({ page })}
                />
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filtros"
        description="Ajusta tu búsqueda y luego mira los resultados."
        variant="sheet"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar todo
            </Button>
            <Button onClick={() => setMobileFiltersOpen(false)}>Ver resultados</Button>
          </>
        }
      >
        <FilterControls
          {...controlsProps}
          idPrefix="mobile"
          showClear={false}
        />
      </Modal>
    </div>
  );
}
