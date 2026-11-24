"use client";

import Image from "next/image";
import { useState } from "react";
import { FALLBACK_VEHICLE_IMAGE_URL } from "../utils/vehicle-image";

interface VehicleImageProps {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  // Skeleton de carga; el detalle lo desactiva (solo fallback)
  skeleton?: boolean;
}

export default function VehicleImage({
  src,
  alt,
  sizes,
  className = "",
  priority,
  skeleton = true,
}: VehicleImageProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const source = src ?? FALLBACK_VEHICLE_IMAGE_URL;
  const current = failedUrl === source ? FALLBACK_VEHICLE_IMAGE_URL : source;

  return (
    <>
      {skeleton && !loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-surface-muted"
          aria-hidden="true"
        />
      )}
      <Image
        src={current}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          // Si la URL falla, cambia al fallback (sin bucle si el fallback también falla)
          if (current !== FALLBACK_VEHICLE_IMAGE_URL) setFailedUrl(source);
        }}
      />
    </>
  );
}
