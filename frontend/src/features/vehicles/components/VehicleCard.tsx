"use client";

import Link from "next/link";
import VehicleImage from "./VehicleImage";
import { getPrimaryPhotoUrl } from "../utils/vehicle-image";
import { VehicleSummary } from "@/features/vehicles/types";
import { formatPriceCOP } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: VehicleSummary;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link href={`/vehiculos/${vehicle.id}`} className="block group">
      <div className="card-vehicle">
        <div className="relative h-52 w-full overflow-hidden bg-gray-200">
          <VehicleImage
            src={getPrimaryPhotoUrl(vehicle.photos)}
            alt={`${vehicle.make} ${vehicle.model}`}
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className={`absolute top-3 right-3 ${
              vehicle.condition === "NUEVO" ? "badge-nuevo" : "badge-usado"
            }`}
          >
            {vehicle.condition === "NUEVO" ? "Nuevo" : "Usado"}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-sora text-lg font-semibold text-grafito truncate">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {vehicle.year} · {vehicle.bodyType.toLowerCase()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {vehicle.mileage.toLocaleString("es-CO")} km
          </p>
          <p className="font-sora text-dorado font-bold text-xl mt-3">
            {formatPriceCOP(vehicle.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
