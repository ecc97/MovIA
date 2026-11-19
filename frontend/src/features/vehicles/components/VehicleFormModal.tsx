"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { useCreateVehicle } from "../hooks/useVehicles";
import PhotoUrlPreview from "./PhotoUrlPreview";

const MAX_PHOTOS = 6;

const httpUrl = (v: string) =>
  v.trim() !== "" && /^https?:\/\//i.test(v) && URL.canParse(v.trim());

// Espejo de createVehicleSchema del backend; status: PUBLICADO por defecto o BORRADOR
const vehicleSchema = z.object({
  make: z.string().min(1, "La marca es obligatoria").max(60, "Máximo 60 caracteres"),
  model: z.string().min(1, "El modelo es obligatorio").max(60, "Máximo 60 caracteres"),
  year: z.coerce
    .number()
    .int()
    .min(1900, "El año debe ser mayor a 1900")
    .max(new Date().getFullYear() + 1, "El año no puede ser futuro"),
  price: z.coerce
    .number()
    .int("El precio debe ser un entero")
    .min(0, "El precio no puede ser negativo"),
  mileage: z.coerce
    .number()
    .int("El kilometraje debe ser un entero")
    .min(0, "El kilometraje no puede ser negativo"),
  condition: z.enum(["NUEVO", "USADO"]),
  bodyType: z.enum(["AUTO", "SUV", "CAMIONETA"]),
  fuel: z.string().min(1, "El combustible es obligatorio").max(40, "Máximo 40 caracteres"),
  transmission: z.string().min(1, "La transmisión es obligatoria").max(40, "Máximo 40 caracteres"),
  color: z.string().min(1, "El color es obligatorio").max(40, "Máximo 40 caracteres"),
  description: z.string().max(2000, "Máximo 2000 caracteres").optional(),
  // URLs opcionales: solo se validan cuando tienen texto (los vacíos se ignoran)
  photos: z
    .array(z.object({ url: z.string() }))
    .max(MAX_PHOTOS, `Máximo ${MAX_PHOTOS} fotos`)
    .refine(
      (photos) => photos.every((p) => httpUrl(p.url)),
      { message: "Hay URLs inválidas", path: ["photos"] }
    ),
});

// Input = valores crudos del formulario (coerce recibe unknown); Output = ya convertidos
type VehicleFormInput = z.input<typeof vehicleSchema>;
type VehicleFormOutput = z.output<typeof vehicleSchema>;

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (status: "BORRADOR" | "PUBLICADO") => void;
}

export default function VehicleFormModal({ open, onClose, onCreated }: VehicleFormModalProps) {
  const createMutation = useCreateVehicle();
  const [photosOpen, setPhotosOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormInput, unknown, VehicleFormOutput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      mileage: "0",
      description: "",
      photos: [{ url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "photos" });
  const photoUrls = useWatch({ control, name: "photos" }) ?? [];

  if (!open) return null;

  const onSubmit = (values: VehicleFormOutput, status: "BORRADOR" | "PUBLICADO") => {
    const photos = values.photos
      .map((p) => p.url.trim())
      .filter(Boolean);

    createMutation.mutate(
      {
        ...values,
        description: values.description || undefined,
        photos: photos.length > 0 ? photos : undefined,
        status,
      },
      {
        onSuccess: () => {
          onCreated?.(status);
          onClose();
        },
      }
    );
  };

  const submitWith = (status: "BORRADOR" | "PUBLICADO") =>
    handleSubmit((values) => onSubmit(values, status))();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Crear vehículo"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-blanco rounded-card shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sora text-lg font-semibold text-grafito">Crear vehículo</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="p-1 text-gris-500 hover:bg-gris-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((values) => onSubmit(values, "PUBLICADO"))}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="make" className="label-field">
                Marca <span className="text-error">*</span>
              </label>
              <input id="make" {...register("make")} className="input-field" />
              {errors.make && <p className="error-message">{errors.make.message}</p>}
            </div>

            <div>
              <label htmlFor="model" className="label-field">
                Modelo <span className="text-error">*</span>
              </label>
              <input id="model" {...register("model")} className="input-field" />
              {errors.model && <p className="error-message">{errors.model.message}</p>}
            </div>

            <div>
              <label htmlFor="year" className="label-field">
                Año <span className="text-error">*</span>
              </label>
              <input id="year" type="number" {...register("year")} className="input-field" />
              {errors.year && <p className="error-message">{errors.year.message}</p>}
            </div>

            <div>
              <label htmlFor="price" className="label-field">
                Precio (COP) <span className="text-error">*</span>
              </label>
              <input id="price" type="number" {...register("price")} className="input-field" />
              {errors.price && <p className="error-message">{errors.price.message}</p>}
            </div>

            <div>
              <label htmlFor="mileage" className="label-field">
                Kilometraje
              </label>
              <input id="mileage" type="number" {...register("mileage")} className="input-field" />
              {errors.mileage && <p className="error-message">{errors.mileage.message}</p>}
            </div>

            <div>
              <label htmlFor="condition" className="label-field">
                Condición <span className="text-error">*</span>
              </label>
              <select id="condition" {...register("condition")} className="input-field">
                <option value="USADO">Usado</option>
                <option value="NUEVO">Nuevo</option>
              </select>
              {errors.condition && <p className="error-message">{errors.condition.message}</p>}
            </div>

            <div>
              <label htmlFor="bodyType" className="label-field">
                Tipo <span className="text-error">*</span>
              </label>
              <select id="bodyType" {...register("bodyType")} className="input-field">
                <option value="AUTO">Sedán (Auto)</option>
                <option value="SUV">SUV</option>
                <option value="CAMIONETA">Camioneta</option>
              </select>
              {errors.bodyType && <p className="error-message">{errors.bodyType.message}</p>}
            </div>

            <div>
              <label htmlFor="fuel" className="label-field">
                Combustible <span className="text-error">*</span>
              </label>
              <input id="fuel" {...register("fuel")} className="input-field" placeholder="Gasolina" />
              {errors.fuel && <p className="error-message">{errors.fuel.message}</p>}
            </div>

            <div>
              <label htmlFor="transmission" className="label-field">
                Transmisión <span className="text-error">*</span>
              </label>
              <input
                id="transmission"
                {...register("transmission")}
                className="input-field"
                placeholder="Automática"
              />
              {errors.transmission && <p className="error-message">{errors.transmission.message}</p>}
            </div>

            <div>
              <label htmlFor="color" className="label-field">
                Color <span className="text-error">*</span>
              </label>
              <input id="color" {...register("color")} className="input-field" placeholder="Blanco" />
              {errors.color && <p className="error-message">{errors.color.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="label-field">
              Descripción
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              className="input-field resize-none"
              placeholder="Detalles adicionales del vehículo (opcional)"
            />
            {errors.description && <p className="error-message">{errors.description.message}</p>}
          </div>

          {/* Sección opcional y plegable de fotos */}
          <div className="border border-gris-200 rounded-btn overflow-hidden">
            <button
              type="button"
              onClick={() => setPhotosOpen((v) => !v)}
              aria-expanded={photosOpen}
              aria-controls="vehicle-photos-section"
              className="w-full flex items-center justify-between gap-2 p-3 text-left text-sm font-medium text-grafito hover:bg-gris-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                Fotos (opcional) <span className="text-gris-500 font-normal">— la primera será la principal</span>
              </span>
              {photosOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {photosOpen && (
              <div id="vehicle-photos-section" className="p-3 pt-0 space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-1">
                    <label htmlFor={`photo-${index}`} className="label-field">
                      Foto {index + 1}
                    </label>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <input
                          id={`photo-${index}`}
                          type="url"
                          {...register(`photos.${index}.url`)}
                          className="input-field"
                          placeholder="https://ejemplo.com/foto.jpg"
                          aria-invalid={!!errors.photos?.[index]}
                        />
                        {errors.photos?.[index]?.url && (
                          <p className="error-message">{errors.photos[index]?.url?.message}</p>
                        )}
                      </div>
                      <PhotoUrlPreview
                        url={photoUrls[index]?.url ?? ""}
                        label={`Vista previa de la foto ${index + 1}`}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          aria-label={`Quitar foto ${index + 1}`}
                          className="p-2 mt-0.5 text-gris-500 hover:text-error hover:bg-error/10 rounded-btn"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {errors.photos && !Array.isArray(errors.photos) && errors.photos.message && (
                  <p className="error-message">{errors.photos.message}</p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => append({ url: "" })}
                    disabled={fields.length >= MAX_PHOTOS}
                    className="btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} /> Añadir foto
                  </button>
                  <span className="text-xs text-gris-500">{fields.length}/{MAX_PHOTOS}</span>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-gris-500">
            <strong>Crear vehículo</strong> lo publica de inmediato;{" "}
            <strong>Guardar como borrador</strong> lo deja fuera del catálogo hasta que lo publiques
            con el icono de ojo en la tabla. Las fotos son opcionales: si no se agregan, se mostrará
            una imagen genérica.
          </p>

          {createMutation.isError && (
            <div
              className="bg-error/10 border border-error/30 rounded-btn p-3 text-sm text-error"
              role="alert"
            >
              {createMutation.error.message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => submitWith("BORRADOR")}
              disabled={createMutation.isPending}
              className="btn-outline"
            >
              Guardar como borrador
            </button>
            <button
              type="button"
              onClick={() => submitWith("PUBLICADO")}
              disabled={createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? "Guardando..." : "Crear vehículo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
