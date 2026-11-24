"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateVehicle, useUpdateVehicle, useVehicleDetail } from "../hooks/useVehicles";
import PhotoUrlPreview from "./PhotoUrlPreview";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { LoadingBlock } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import type { VehicleDetail } from "@/features/vehicles/types";

const MAX_PHOTOS = 6;

const httpUrl = (value: string) =>
  value.trim() !== "" && /^https?:\/\//i.test(value.trim()) && URL.canParse(value.trim());

const vehicleSchema = z.object({
  make: z.string().min(1, "La marca es obligatoria").max(60, "Máximo 60 caracteres"),
  model: z.string().min(1, "El modelo es obligatorio").max(60, "Máximo 60 caracteres"),
  year: z.coerce
    .number()
    .int()
    .min(1900, "El año debe ser mayor a 1900")
    .max(new Date().getFullYear() + 1, "El año no puede ser futuro"),
  price: z.coerce.number().int("El precio debe ser un entero").min(0, "El precio no puede ser negativo"),
  mileage: z.coerce.number().int("El kilometraje debe ser un entero").min(0, "No puede ser negativo"),
  condition: z.enum(["NUEVO", "USADO"]),
  bodyType: z.enum(["AUTO", "SUV", "CAMIONETA"]),
  fuel: z.string().min(1, "El combustible es obligatorio").max(40),
  transmission: z.string().min(1, "La transmisión es obligatoria").max(40),
  color: z.string().min(1, "El color es obligatorio").max(40),
  description: z.string().max(2000, "Máximo 2000 caracteres").optional(),
  photos: z
    .array(z.object({ url: z.string() }))
    .max(MAX_PHOTOS, `Máximo ${MAX_PHOTOS} fotos`)
    .refine((photos) => photos.every((photo) => httpUrl(photo.url)), {
      message: "Hay URLs inválidas",
      path: ["photos"],
    }),
});

type VehicleFormInput = z.input<typeof vehicleSchema>;
type VehicleFormOutput = z.output<typeof vehicleSchema>;

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  vehicleId?: string;
  onCreated?: (status: "BORRADOR" | "PUBLICADO") => void;
  onUpdated?: () => void;
}

function toFormValues(vehicle: VehicleDetail): VehicleFormInput {
  return {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    mileage: vehicle.mileage,
    condition: vehicle.condition as "NUEVO" | "USADO",
    bodyType: vehicle.bodyType as "AUTO" | "SUV" | "CAMIONETA",
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    color: vehicle.color,
    description: vehicle.description ?? "",
    photos: [],
  };
}

export default function VehicleFormModal({
  open,
  onClose,
  vehicleId,
  onCreated,
  onUpdated,
}: VehicleFormModalProps) {
  const isEdit = Boolean(vehicleId);
  const detailQuery = useVehicleDetail(vehicleId, open && isEdit);
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const toast = useToast();
  const [photosOpen, setPhotosOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormInput, unknown, VehicleFormOutput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      mileage: 0,
      description: "",
      photos: [{ url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "photos" });
  const photoUrls = useWatch({ control, name: "photos" }) ?? [];

  useEffect(() => {
    if (detailQuery.data) reset(toFormValues(detailQuery.data));
  }, [detailQuery.data, reset]);

  const onCreate = (values: VehicleFormOutput, status: "BORRADOR" | "PUBLICADO") => {
    const photos = values.photos.map((photo) => photo.url.trim()).filter(Boolean);
    createMutation.mutate(
      {
        ...values,
        description: values.description || undefined,
        photos: photos.length > 0 ? photos : undefined,
        status,
      },
      {
        onSuccess: () => {
          toast.success(status === "BORRADOR" ? "Borrador guardado" : "Vehículo creado");
          onCreated?.(status);
          onClose();
        },
      }
    );
  };

  const onEdit = (values: VehicleFormOutput) => {
    if (!vehicleId) return;
    updateMutation.mutate(
      {
        id: vehicleId,
        data: {
          make: values.make,
          model: values.model,
          year: values.year,
          price: values.price,
          mileage: values.mileage,
          condition: values.condition,
          bodyType: values.bodyType,
          fuel: values.fuel,
          transmission: values.transmission,
          color: values.color,
          description: values.description || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Cambios guardados");
          onUpdated?.();
          onClose();
        },
      }
    );
  };

  const submitCreate = (status: "BORRADOR" | "PUBLICADO") =>
    handleSubmit((values) => onCreate(values, status))();

  const mutationError = isEdit ? updateMutation.error : createMutation.error;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar vehículo" : "Crear vehículo"}
      description={
        isEdit
          ? "Actualiza la ficha del vehículo. El estado y las fotos se gestionan por separado."
          : "Completa la ficha. Puedes publicarlo de inmediato o guardarlo como borrador."
      }
      size="lg"
    >
      {isEdit && detailQuery.isLoading ? (
        <LoadingBlock label="Cargando vehículo…" />
      ) : (
        <form
          onSubmit={isEdit ? handleSubmit(onEdit) : handleSubmit((values) => onCreate(values, "PUBLICADO"))}
          className="space-y-5"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Marca" htmlFor="vehicle-make" required error={errors.make?.message}>
              <Input id="vehicle-make" {...register("make")} placeholder="Toyota" />
            </FormField>
            <FormField label="Modelo" htmlFor="vehicle-model" required error={errors.model?.message}>
              <Input id="vehicle-model" {...register("model")} placeholder="Corolla" />
            </FormField>
            <FormField label="Año" htmlFor="vehicle-year" required error={errors.year?.message}>
              <Input id="vehicle-year" type="number" {...register("year")} />
            </FormField>
            <FormField label="Precio (COP)" htmlFor="vehicle-price" required error={errors.price?.message}>
              <Input id="vehicle-price" type="number" {...register("price")} />
            </FormField>
            <FormField label="Kilometraje" htmlFor="vehicle-mileage" error={errors.mileage?.message}>
              <Input id="vehicle-mileage" type="number" {...register("mileage")} />
            </FormField>
            <FormField label="Condición" htmlFor="vehicle-condition" required error={errors.condition?.message}>
              <Select id="vehicle-condition" {...register("condition")}>
                <option value="USADO">Usado</option>
                <option value="NUEVO">Nuevo</option>
              </Select>
            </FormField>
            <FormField label="Carrocería" htmlFor="vehicle-body" required error={errors.bodyType?.message}>
              <Select id="vehicle-body" {...register("bodyType")}>
                <option value="AUTO">Auto</option>
                <option value="SUV">SUV</option>
                <option value="CAMIONETA">Camioneta</option>
              </Select>
            </FormField>
            <FormField label="Combustible" htmlFor="vehicle-fuel" required error={errors.fuel?.message}>
              <Input id="vehicle-fuel" {...register("fuel")} placeholder="Gasolina" />
            </FormField>
            <FormField label="Transmisión" htmlFor="vehicle-transmission" required error={errors.transmission?.message}>
              <Input id="vehicle-transmission" {...register("transmission")} placeholder="Automática" />
            </FormField>
            <FormField label="Color" htmlFor="vehicle-color" required error={errors.color?.message}>
              <Input id="vehicle-color" {...register("color")} placeholder="Blanco" />
            </FormField>
          </div>

          <FormField label="Descripción" htmlFor="vehicle-description" error={errors.description?.message}>
            <Textarea
              id="vehicle-description"
              rows={3}
              {...register("description")}
              placeholder="Detalles adicionales del vehículo (opcional)"
            />
          </FormField>

          {!isEdit && (
            <div className="overflow-hidden rounded-btn border border-border">
              <button
                type="button"
                onClick={() => setPhotosOpen((open) => !open)}
                aria-expanded={photosOpen}
                aria-controls="vehicle-photos-section"
                className="flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                <span className="flex items-center gap-2">
                  Fotos (opcional)
                  <span className="font-normal text-muted">— la primera será la principal</span>
                </span>
                {photosOpen ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
              </button>

              {photosOpen && (
                <div id="vehicle-photos-section" className="space-y-3 border-t border-border p-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <label htmlFor={`photo-${index}`} className="label-field">
                        Foto {index + 1}
                      </label>
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <Input
                            id={`photo-${index}`}
                            type="url"
                            {...register(`photos.${index}.url`)}
                            placeholder="https://ejemplo.com/foto.jpg"
                          />
                          {errors.photos?.[index]?.url && (
                            <p className="error-message">{errors.photos[index]?.url?.message}</p>
                          )}
                        </div>
                        <PhotoUrlPreview url={photoUrls[index]?.url ?? ""} label={`Vista previa de la foto ${index + 1}`} />
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            aria-label={`Quitar foto ${index + 1}`}
                            className="!min-h-10 !px-2 text-muted hover:text-error"
                          >
                            <X size={18} aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {errors.photos && !Array.isArray(errors.photos) && errors.photos.message && (
                    <p className="error-message">{errors.photos.message}</p>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ url: "" })}
                      disabled={fields.length >= MAX_PHOTOS}
                      leftIcon={<Plus size={16} aria-hidden="true" />}
                    >
                      Añadir foto
                    </Button>
                    <span className="text-xs text-muted">
                      {fields.length}/{MAX_PHOTOS}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isEdit && (
            <p className="text-xs leading-relaxed text-muted">
              <strong>Crear vehículo</strong> lo publica de inmediato;{" "}
              <strong>Guardar como borrador</strong> lo deja fuera del catálogo hasta que lo publiques desde el
              inventario.
            </p>
          )}

          {mutationError && (
            <p className="rounded-btn border border-error/30 bg-error/10 p-3 text-sm text-error" role="alert">
              {mutationError.message}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {!isEdit && (
              <Button
                variant="outline"
                type="button"
                onClick={() => submitCreate("BORRADOR")}
                disabled={createMutation.isPending}
              >
                Guardar como borrador
              </Button>
            )}
            {isEdit ? (
              <Button type="submit" loading={updateMutation.isPending}>
                Guardar cambios
              </Button>
            ) : (
              <Button type="button" onClick={() => submitCreate("PUBLICADO")} loading={createMutation.isPending}>
                Crear vehículo
              </Button>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}
