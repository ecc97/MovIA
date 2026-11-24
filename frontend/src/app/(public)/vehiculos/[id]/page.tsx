import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Car, Fuel, Gauge, Palette, Settings } from "lucide-react";
import { getVehicle } from "@/features/vehicles/services/vehicle.service";
import { FALLBACK_VEHICLE_IMAGE_URL, getPrimaryPhotoUrl } from "@/features/vehicles/utils/vehicle-image";
import type { VehicleDetail } from "@/features/vehicles/types";
import VehicleGallery from "@/features/vehicles/components/VehicleGallery";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonStyles } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import InquiryForm from "@/features/inquiries/components/InquiryForm";
import { WHATSAPP_NUMBER, formatDate, formatPriceCOP, getWhatsAppLink } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const vehicle = await getVehicle(id);
    return {
      title: `${vehicle.make} ${vehicle.model} ${vehicle.year} | MOVIA`,
      description: `${vehicle.make} ${vehicle.model} ${vehicle.year} · ${formatPriceCOP(vehicle.price)}. Ficha técnica y contacto sin registro.`,
      openGraph: {
        title: `${vehicle.make} ${vehicle.model} ${vehicle.year} | MOVIA`,
        images: [getPrimaryPhotoUrl(vehicle.photos) ?? FALLBACK_VEHICLE_IMAGE_URL],
      },
    };
  } catch {
    return { title: "Vehículo no encontrado | MOVIA" };
  }
}

export default async function VehiculoDetallePage({ params }: PageProps) {
  const { id } = await params;

  let vehicle: VehicleDetail | null = null;
  let error: string | null = null;

  try {
    vehicle = await getVehicle(id);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Error al cargar el vehículo";
  }

  if (error || !vehicle) {
    return (
      <div className="container-movia py-12">
        <EmptyState
          icon={<Car size={24} aria-hidden="true" />}
          title="Vehículo no encontrado"
          description={error ?? "Es posible que el vehículo ya no esté disponible."}
          action={
            <Link href="/catalogo" className="btn-primary">
              Volver al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  const specs = [
    { icon: Gauge, label: "Kilometraje", value: `${vehicle.mileage.toLocaleString("es-CO")} km` },
    { icon: Fuel, label: "Combustible", value: vehicle.fuel || "—" },
    { icon: Settings, label: "Transmisión", value: vehicle.transmission || "—" },
    { icon: Palette, label: "Color", value: vehicle.color || "—" },
    { icon: CalendarDays, label: "Año", value: String(vehicle.year) },
    { icon: Car, label: "Carrocería", value: vehicle.bodyType },
  ];

  const whatsappHref = getWhatsAppLink(
    WHATSAPP_NUMBER,
    `Hola, estoy interesado en el ${vehicle.make} ${vehicle.model} ${vehicle.year}. ¿Podrían darme más información?`
  );

  return (
    <div className="container-movia py-8 md:py-10">
      <nav aria-label="Ruta de navegación" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-accent-text">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/catalogo" className="transition-colors hover:text-accent-text">
          Catálogo
        </Link>
        <span aria-hidden="true">/</span>
        <span className="max-w-[220px] truncate font-medium text-foreground">
          {vehicle.make} {vehicle.model}
        </span>
      </nav>

      <Link
        href="/catalogo"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent-text"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <VehicleGallery
            photos={vehicle.photos}
            make={vehicle.make}
            model={vehicle.model}
            priority
          />

          <section className="card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={vehicle.condition === "NUEVO" ? "success" : "warning"}>
                {vehicle.condition === "NUEVO" ? "Nuevo" : "Usado"}
              </Badge>
              <Badge tone="neutral">{vehicle.bodyType}</Badge>
            </div>
            <h1 className="mt-4 font-sora text-3xl font-bold tracking-tight text-foreground">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {vehicle.year} · Publicado el {formatDate(vehicle.createdAt)}
            </p>
            {vehicle.description && (
              <p className="mt-5 text-sm leading-relaxed text-foreground/80">{vehicle.description}</p>
            )}
          </section>

          <section className="card p-6">
            <h2 className="font-sora text-lg font-semibold text-foreground">Especificaciones técnicas</h2>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                    <spec.icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted">{spec.label}</p>
                    <p className="truncate text-sm font-semibold text-foreground">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="lg:sticky lg:top-24 lg:space-y-6">
            <section className="card p-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Precio COP</p>
              <p className="mt-2 font-sora text-3xl font-bold tracking-tight text-accent-text">
                {formatPriceCOP(vehicle.price)}
              </p>
              <p className="mt-2 text-xs text-muted">Precio de demostración · dato simulado.</p>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Consultar por ${vehicle.make} ${vehicle.model} en WhatsApp`}
                className={`${buttonStyles({ size: "lg", fullWidth: true })} mt-6`}
              >
                <WhatsAppIcon size={19} />
                Consultar por WhatsApp
              </a>
              <p className="mt-3 text-center text-xs text-muted">
                Te redirigimos a WhatsApp con el mensaje listo. El clic no se guarda como consulta.
              </p>
            </section>

            <section className="card p-6">
              <h2 className="font-sora text-lg font-semibold text-foreground">Enviar consulta</h2>
              <p className="mt-1 text-sm text-muted">
                Déjanos tus datos y un asesor te contactará sobre este vehículo.
              </p>
              <div className="mt-5">
                <InquiryForm
                  prefillMake={vehicle.make}
                  prefillModel={vehicle.model}
                  prefillYear={vehicle.year}
                  vehicleId={vehicle.id}
                />
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
