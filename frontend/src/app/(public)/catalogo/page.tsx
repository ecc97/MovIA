import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogView from "@/features/vehicles/components/CatalogView";
import { VehicleCardSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Catálogo de vehículos | MOVIA",
  description: "Explora autos, SUV y camionetas nuevos y usados con filtros y precios en COP.",
};

function CatalogFallback() {
  return (
    <div className="container-movia py-10 md:py-14">
      <div className="mb-8 space-y-3">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton h-9 w-72 max-w-full" />
        <div className="skeleton h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <VehicleCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogView />
    </Suspense>
  );
}
