"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateVehicle } from "../hooks/useVehicles";
import { X } from "lucide-react";

// Espejo de createVehicleSchema del backend; se crea siempre como PUBLICADO
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
});

// Input = valores crudos del formulario (coerce recibe unknown); Output = ya convertidos
type VehicleFormInput = z.input<typeof vehicleSchema>;
type VehicleFormOutput = z.output<typeof vehicleSchema>;

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function VehicleFormModal({ open, onClose }: VehicleFormModalProps) {
  const createMutation = useCreateVehicle();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormInput, unknown, VehicleFormOutput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      mileage: "0",
      description: "",
    },
  });

  if (!open) return null;

  const onSubmit = (values: VehicleFormOutput) => {
    createMutation.mutate(
      {
        ...values,
        description: values.description || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

          <p className="text-xs text-gris-500">
            El vehículo se crea con estado <strong>PUBLICADO</strong>; puedes cambiarlo desde la
            tabla. La gestión de fotos estará disponible más adelante.
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
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? "Creando..." : "Crear vehículo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
