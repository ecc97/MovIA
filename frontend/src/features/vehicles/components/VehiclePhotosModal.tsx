"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ImageIcon, Plus, Star, X } from "lucide-react";
import PhotoUrlPreview from "./PhotoUrlPreview";
import { useUpdateVehiclePhotos } from "../hooks/useVehicles";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { VehicleSummary } from "@/features/vehicles/types";

const MAX_PHOTOS = 6;
const isValidUrl = (value: string) =>
  /^https?:\/\//i.test(value.trim()) && URL.canParse(value.trim());

interface VehiclePhotosModalProps {
  vehicle: VehicleSummary;
  onClose: () => void;
}

export default function VehiclePhotosModal({ vehicle, onClose }: VehiclePhotosModalProps) {
  const [photos, setPhotos] = useState<string[]>(() =>
    [...vehicle.photos].sort((a, b) => a.order - b.order).map((photo) => photo.url)
  );
  const [newUrl, setNewUrl] = useState("");
  const [addError, setAddError] = useState("");
  const saveMutation = useUpdateVehiclePhotos();
  const toast = useToast();

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    setPhotos((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  };

  const setPrincipal = (index: number) => {
    if (index === 0) return;
    setPhotos((current) => {
      const next = [...current];
      const [url] = next.splice(index, 1);
      next.unshift(url!);
      return next;
    });
  };

  const remove = (index: number) => {
    setPhotos((current) => current.filter((_, item) => item !== index));
  };

  const add = () => {
    const url = newUrl.trim();
    if (!isValidUrl(url)) {
      setAddError("Introduce una URL válida (http o https)");
      return;
    }
    if (photos.includes(url)) {
      setAddError("Esa foto ya está añadida");
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      setAddError(`Máximo ${MAX_PHOTOS} fotos`);
      return;
    }
    setPhotos((current) => [...current, url]);
    setNewUrl("");
    setAddError("");
  };

  const save = () => {
    saveMutation.mutate(
      { id: vehicle.id, photos },
      {
        onSuccess: () => {
          toast.success("Fotos actualizadas");
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Fotos del vehículo"
      description={`${vehicle.make} ${vehicle.model} · ${vehicle.year}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} loading={saveMutation.isPending}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">
            Fotos ({photos.length}/{MAX_PHOTOS})
          </span>
          <span className="text-xs text-muted">La primera foto será la imagen principal</span>
        </div>

        {photos.length === 0 ? (
          <div className="rounded-card border-2 border-dashed border-border p-8 text-center text-muted">
            <ImageIcon size={32} className="mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm">Este vehículo no tiene fotos</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-card border-2 border-dorado bg-accent-soft/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent-text">
                  <Star size={14} fill="currentColor" aria-hidden="true" />
                  Foto principal
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(0)}
                  aria-label="Quitar foto principal"
                  className="!min-h-9 !px-2 text-muted hover:text-error"
                >
                  <X size={16} aria-hidden="true" />
                </Button>
              </div>
              <PhotoUrlPreview url={photos[0]!} label="Foto principal" className="aspect-video w-full !rounded-btn" />
            </div>

            {photos.length > 1 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {photos.slice(1).map((url, offset) => {
                  const index = offset + 1;
                  return (
                    <div key={`${url}-${index}`} className="space-y-2 rounded-btn border border-border p-2">
                      <PhotoUrlPreview
                        url={url}
                        label={`Foto ${index + 1}`}
                        className="aspect-video w-full !rounded-btn"
                      />
                      <p className="text-center text-xs text-muted">Foto {index + 1}</p>
                      <div className="flex justify-center gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => move(index, -1)} aria-label={`Mover foto ${index + 1} a la izquierda`} className="!min-h-9 !px-2">
                          <ArrowLeft size={16} aria-hidden="true" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setPrincipal(index)} aria-label={`Establecer foto ${index + 1} como principal`} className="!min-h-9 !px-2 text-accent-text">
                          <Star size={16} aria-hidden="true" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => move(index, 1)} aria-label={`Mover foto ${index + 1} a la derecha`} className="!min-h-9 !px-2">
                          <ArrowRight size={16} aria-hidden="true" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} aria-label={`Quitar foto ${index + 1}`} className="!min-h-9 !px-2 text-muted hover:text-error">
                          <X size={16} aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 border-t border-border pt-4">
          <FormField label="Añadir foto por URL" htmlFor="new-photo-url" error={addError}>
            <div className="flex items-start gap-2">
              <Input
                id="new-photo-url"
                type="url"
                value={newUrl}
                onChange={(event) => {
                  setNewUrl(event.target.value);
                  setAddError("");
                }}
                placeholder="https://ejemplo.com/foto.jpg"
              />
              <PhotoUrlPreview url={newUrl} label="Vista previa de la nueva foto" />
              <Button
                type="button"
                variant="outline"
                onClick={add}
                disabled={photos.length >= MAX_PHOTOS}
                leftIcon={<Plus size={16} aria-hidden="true" />}
              >
                Añadir
              </Button>
            </div>
          </FormField>
        </div>

        {saveMutation.isError && (
          <p className="rounded-btn border border-error/30 bg-error/10 p-3 text-sm text-error" role="alert">
            {saveMutation.error.message}
          </p>
        )}
      </div>
    </Modal>
  );
}
