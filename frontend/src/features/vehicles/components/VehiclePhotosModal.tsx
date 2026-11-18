"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ImageIcon, Plus, Star, X } from "lucide-react";
import PhotoUrlPreview from "./PhotoUrlPreview";
import { useUpdateVehiclePhotos } from "../hooks/useVehicles";
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
    [...vehicle.photos].sort((a, b) => a.order - b.order).map((p) => p.url)
  );
  const [newUrl, setNewUrl] = useState("");
  const [addError, setAddError] = useState("");
  const saveMutation = useUpdateVehiclePhotos();

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
    setPhotos((current) => current.filter((_, i) => i !== index));
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
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photos-modal-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-blanco rounded-card shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="photos-modal-title" className="font-sora text-lg font-semibold text-grafito">
              Fotos del vehículo
            </h2>
            <p className="text-sm text-gris-600 mt-1">
              {vehicle.make} {vehicle.model} · {vehicle.year}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar gestión de fotos"
            className="p-1 text-gris-500 hover:bg-gris-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-grafito">Fotos ({photos.length}/{MAX_PHOTOS})</span>
          <span className="text-xs text-gris-500">La primera foto será la imagen principal</span>
        </div>

        {photos.length === 0 ? (
          <div className="border-2 border-dashed border-gris-300 rounded-card p-8 text-center text-gris-500">
            <ImageIcon size={32} className="mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm">Este vehículo no tiene fotos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Foto principal */}
            <div className="border-2 border-dorado rounded-card p-3 bg-dorado/5">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-dorado uppercase">
                  <Star size={14} fill="currentColor" /> Foto principal
                </span>
                <button
                  type="button"
                  onClick={() => remove(0)}
                  aria-label="Quitar foto principal"
                  className="p-1 text-gris-500 hover:text-error hover:bg-error/10 rounded-btn"
                >
                  <X size={16} />
                </button>
              </div>
              <PhotoUrlPreview
                url={photos[0]!}
                label="Foto principal"
                className="w-full aspect-video !rounded-btn"
              />
            </div>

            {/* Fotos secundarias */}
            {photos.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.slice(1).map((url, offset) => {
                  const index = offset + 1;
                  return (
                    <div key={`${url}-${index}`} className="border border-gris-200 rounded-btn p-2 space-y-2">
                      <PhotoUrlPreview
                        url={url}
                        label={`Foto ${index + 1}`}
                        className="w-full aspect-video !rounded-btn"
                      />
                      <p className="text-xs text-gris-500 text-center">Foto {index + 1}</p>
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => move(index, -1)}
                          aria-label={`Mover foto ${index + 1} a la izquierda`}
                          className="p-1 text-gris-500 hover:bg-gris-100 rounded-btn"
                        >
                          <ArrowLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrincipal(index)}
                          aria-label={`Establecer foto ${index + 1} como principal`}
                          className="p-1 text-dorado hover:bg-dorado/10 rounded-btn"
                        >
                          <Star size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, 1)}
                          aria-label={`Mover foto ${index + 1} a la derecha`}
                          className="p-1 text-gris-500 hover:bg-gris-100 rounded-btn"
                        >
                          <ArrowRight size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          aria-label={`Quitar foto ${index + 1}`}
                          className="p-1 text-gris-500 hover:text-error hover:bg-error/10 rounded-btn"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Añadir foto */}
        <div className="mt-4 pt-4 border-t border-gris-200 space-y-2">
          <label htmlFor="new-photo-url" className="label-field">Añadir foto por URL</label>
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-1">
              <input
                id="new-photo-url"
                type="url"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  setAddError("");
                }}
                placeholder="https://ejemplo.com/foto.jpg"
                className="input-field"
              />
              {addError && <p className="error-message">{addError}</p>}
            </div>
            <PhotoUrlPreview url={newUrl} label="Vista previa de la nueva foto" />
            <button
              type="button"
              onClick={add}
              disabled={photos.length >= MAX_PHOTOS}
              className="btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Añadir
            </button>
          </div>
        </div>

        {saveMutation.isError && (
          <div className="mt-4 bg-error/10 border border-error/30 rounded-btn p-3 text-sm text-error" role="alert">
            {saveMutation.error.message}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-5">
          <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
          <button
            type="button"
            onClick={save}
            disabled={saveMutation.isPending}
            className="btn-primary"
          >
            {saveMutation.isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
