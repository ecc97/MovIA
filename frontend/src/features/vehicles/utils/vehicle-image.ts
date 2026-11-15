// MOVIA — Utilidades de imagen del feature vehicles

import type { VehiclePhoto } from "../types";

// Imagen genérica si el vehículo no tiene fotos o su URL está rota
export const FALLBACK_VEHICLE_IMAGE_URL =
  "https://res.cloudinary.com/dtcdhb93h/image/upload/v1794764002/2151955577_evufww.webp";

// Foto principal = la de menor "order" (la API devuelve photos ordenado asc)
export function getPrimaryPhotoUrl(photos?: VehiclePhoto[]): string | undefined {
  if (!photos || photos.length === 0) return undefined;
  return [...photos].sort((a, b) => a.order - b.order)[0]?.url;
}
