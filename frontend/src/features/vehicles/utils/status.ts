import type { VehicleStatus } from "@/features/vehicles/types";
import type { BadgeTone } from "@/components/ui/Badge";

export const VEHICLE_STATUS_CONFIG: Record<VehicleStatus, { label: string; tone: BadgeTone }> = {
  PUBLICADO: { label: "Publicado", tone: "success" },
  BORRADOR: { label: "Borrador", tone: "neutral" },
  ARCHIVADO: { label: "Archivado", tone: "neutral" },
};

export const VEHICLE_STATUSES = Object.keys(VEHICLE_STATUS_CONFIG) as VehicleStatus[];

export const BODY_TYPE_LABELS: Record<string, string> = {
  AUTO: "Auto",
  SUV: "SUV",
  CAMIONETA: "Camioneta",
};

export const CONDITION_LABELS: Record<string, string> = {
  NUEVO: "Nuevo",
  USADO: "Usado",
};
