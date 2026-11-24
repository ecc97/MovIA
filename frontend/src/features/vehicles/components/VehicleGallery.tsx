"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageOff } from "lucide-react";
import VehicleImage from "./VehicleImage";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { VehiclePhoto } from "@/features/vehicles/types";

interface VehicleGalleryProps {
  photos: VehiclePhoto[];
  make: string;
  model: string;
  priority?: boolean;
}

export function VehicleGallery({ photos, make, model, priority = false }: VehicleGalleryProps) {
  const ordered = [...photos].sort((a, b) => a.order - b.order);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = ordered.length;
  const current = ordered[active];

  useEffect(() => {
    if (!lightboxOpen || count < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setActive((index) => (index + 1) % count);
      if (event.key === "ArrowLeft") setActive((index) => (index - 1 + count) % count);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, count]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface text-muted">
        <ImageOff size={32} aria-hidden="true" />
        <p className="mt-3 text-sm">Este vehículo todavía no tiene fotografías.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-card bg-surface-muted">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Ampliar fotografía ${active + 1} de ${count}`}
          className="absolute inset-0 z-10 h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dorado"
        >
          <span className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Expand size={14} aria-hidden="true" />
            Ampliar
          </span>
        </button>
        <VehicleImage
          src={current?.url}
          alt={`${make} ${model} — fotografía ${active + 1} de ${count}`}
          sizes="(min-width: 1024px) 65vw, 100vw"
          priority={priority}
          skeleton={false}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((index) => (index - 1 + count) % count)}
              aria-label="Fotografía anterior"
              className="absolute left-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setActive((index) => (index + 1) % count)}
              aria-label="Fotografía siguiente"
              className="absolute right-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 left-3 z-20 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas de fotografías">
          {ordered.map((photo, index) => (
            <button
              key={`${photo.id ?? photo.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver fotografía ${index + 1} de ${count}`}
              aria-pressed={index === active}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-btn border-2 bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado",
                index === active ? "border-dorado" : "border-transparent hover:border-border-strong"
              )}
            >
              <VehicleImage
                src={photo.url}
                alt=""
                sizes="80px"
                skeleton={false}
              />
            </button>
          ))}
        </div>
      )}

      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={`${make} ${model}`}
        description={`Fotografía ${active + 1} de ${count}. Usa las flechas del teclado para recorrer.`}
        size="full"
        variant="center"
      >
        <div className="space-y-4">
          <div className="relative h-[55vh] min-h-64 overflow-hidden rounded-card bg-black">
            <VehicleImage
              src={current?.url}
              alt={`${make} ${model} — fotografía ${active + 1} de ${count}`}
              sizes="100vw"
              skeleton={false}
              className="object-contain"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActive((index) => (index - 1 + count) % count)}
                  aria-label="Fotografía anterior"
                  className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <ChevronLeft size={22} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setActive((index) => (index + 1) % count)}
                  aria-label="Fotografía siguiente"
                  className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <ChevronRight size={22} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
          {count > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto">
              {ordered.map((photo, index) => (
                <button
                  key={`lightbox-${photo.id ?? photo.url}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Ver fotografía ${index + 1} de ${count}`}
                  aria-pressed={index === active}
                  className={cn(
                    "relative size-16 shrink-0 overflow-hidden rounded-btn border-2",
                    index === active ? "border-dorado" : "border-transparent"
                  )}
                >
                  <VehicleImage src={photo.url} alt="" sizes="64px" skeleton={false} />
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default VehicleGallery;
