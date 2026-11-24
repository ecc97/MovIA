"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import VehicleImage from "./VehicleImage";
import { getPrimaryPhotoUrl } from "../utils/vehicle-image";
import type { VehicleSummary } from "@/features/vehicles/types";
import { Badge } from "@/components/ui/Badge";
import { formatPriceCOP } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: VehicleSummary;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link href={`/vehiculos/${vehicle.id}`} className="group block focus-visible:rounded-card">
      <article className="card-vehicle h-full">
        <div className="relative h-52 w-full overflow-hidden bg-surface-muted">
          <VehicleImage
            src={getPrimaryPhotoUrl(vehicle.photos)}
            alt={`${vehicle.make} ${vehicle.model}`}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-300 motion-safe:group-hover:scale-[1.04]"
          />
          <div className="absolute left-3 top-3">
            <Badge tone={vehicle.condition === "NUEVO" ? "success" : "warning"}>
              {vehicle.condition === "NUEVO" ? "Nuevo" : "Usado"}
            </Badge>
          </div>
          <span className="absolute bottom-3 right-3 flex size-9 translate-y-2 items-center justify-center rounded-full bg-dorado text-grafito opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </div>

        <div className="flex h-[calc(100%-13rem)] flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-sora text-lg font-semibold leading-tight text-foreground">
              {vehicle.make} {vehicle.model}
            </h3>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            {vehicle.year} · {vehicle.bodyType.toLowerCase()}
          </p>
          <p className="mt-1 text-xs text-muted">
            {vehicle.mileage.toLocaleString("es-CO")} km
          </p>
          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Precio COP</p>
              <p className="font-sora text-lg font-bold text-accent-text sm:text-xl">
                {formatPriceCOP(vehicle.price)}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
