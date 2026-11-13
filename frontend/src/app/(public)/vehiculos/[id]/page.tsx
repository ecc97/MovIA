import { getVehicle } from "@/features/vehicles/services/vehicle.service";
import type { VehicleDetail } from "@/features/vehicles/types";
import Link from "next/link";
import Image from "next/image";
import { formatPriceCOP, getWhatsAppLink, formatDate } from "@/lib/utils";
import {
  Gauge,
  Fuel,
  Settings,
  Palette,
  Calendar,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import InquiryForm from "@/features/inquiries/components/InquiryForm";

export default async function VehiculoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let vehicle: VehicleDetail | null = null;
  let error: string | null = null;

  try {
    vehicle = await getVehicle(id);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar el vehículo";
  }

  if (error || !vehicle) {
    return (
      <div className="container-movia mx-auto px-4 py-12">
        <div className="bg-error/10 border border-error/30 rounded-card p-6 text-center">
          <p className="text-error font-semibold">Vehículo no encontrado</p>
          <p className="text-gray-600 mt-2">{error ?? ""}</p>
          <Link href="/catalogo" className="btn-secondary inline-block mt-4">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const specs = [
    { icon: Gauge, label: "Kilometraje", value: `${vehicle.mileage.toLocaleString("es-CO")} km` },
    { icon: Fuel, label: "Combustible", value: vehicle.fuel ?? "—" },
    { icon: Settings, label: "Transmisión", value: vehicle.transmission ?? "—" },
    { icon: Palette, label: "Color", value: vehicle.color ?? "—" },
    { icon: Calendar, label: "Año", value: vehicle.year?.toString() ?? "—" },
    { icon: Calendar, label: "Publicado", value: vehicle.createdAt ? formatDate(vehicle.createdAt) : "—" },
  ];

  const whatsappMsg = encodeURIComponent(
    `Hola, estoy interesado en el ${vehicle.make} ${vehicle.model} ${vehicle.year}. ¿Podrían darme más información?`
  );

  return (
    <div className="container-movia mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-dorado transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-dorado transition-colors">
          Catálogo
        </Link>
        <span>/</span>
        <span className="text-grafito font-medium truncate max-w-[200px]">
          {vehicle.make} {vehicle.model}
        </span>
      </nav>

      {/* Back button */}
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-dorado transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - photos + specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo gallery */}
          <div className="space-y-4">
            {vehicle.photos.length > 0 ? (
              <>
                <div className="relative h-72 md:h-96 rounded-card overflow-hidden bg-gray-200">
                  <Image
                    src={
                      vehicle.photos[0]?.url ??
                      `https://picsum.photos/seed/${vehicle.id.slice(0, 8)}/1200/800`
                    }
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    sizes="(min-width: 1024px) 67vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
                {vehicle.photos.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {vehicle.photos.slice(1, 5).map((photo, idx) => (
                      <div
                        key={`${photo.id ?? idx}-${idx}`}
                        className="relative h-24 rounded-btn overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <Image
                          src={photo.url}
                          alt={`${vehicle.make} ${vehicle.model} foto ${idx + 2}`}
                          fill
                          sizes="(min-width: 1024px) calc((100vw - 32px) / 4), 25%"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="relative h-72 md:h-96 rounded-card overflow-hidden bg-gray-200">
                <Image
                  src={`https://picsum.photos/seed/${vehicle.id.slice(0, 8)}/1200/800`}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Vehicle info */}
          <div className="bg-blanco rounded-card p-6 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <span
                  className={`badge-${vehicle.condition.toLowerCase() === "nuevo" ? "nuevo" : "usado"}`}
                >
                  {vehicle.condition === "NUEVO" ? "Nuevo" : "Usado"}
                </span>
                <h1 className="font-sora text-2xl font-bold text-grafito mt-3">
                  {vehicle.make} {vehicle.model}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {vehicle.year} · {vehicle.bodyType}
                </p>
              </div>
              <p className="font-sora text-3xl font-bold text-dorado whitespace-nowrap">
                {formatPriceCOP(vehicle.price)}
              </p>
            </div>

            {vehicle.description && (
              <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
            )}
          </div>

          {/* Specs grid */}
          <div className="bg-blanco rounded-card p-6 shadow-sm">
            <h2 className="font-sora text-xl font-semibold mb-4">Especificaciones técnicas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-dorado/10 rounded-full flex items-center justify-center shrink-0">
                    <spec.icon size={18} className="text-dorado" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{spec.label}</p>
                    <p className="font-medium text-grafito">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - WhatsApp + Inquiry */}
        <div className="space-y-6">
          {/* WhatsApp card */}
          <div className="bg-blanco rounded-card p-6 shadow-sm">
            <h2 className="font-sora text-lg font-semibold mb-4">¿Te interesa este vehículo?</h2>

            <div className="space-y-3">
              <a
                href={getWhatsAppLink("", whatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Contactar por WhatsApp
              </a>
              <p className="text-xs text-gray-500 text-center">
                Serás redirigido a WhatsApp para hablar directamente con un asesor.
              </p>
            </div>
          </div>

          {/* Inquiry form */}
          <div className="bg-blanco rounded-card p-6 shadow-sm">
            <h2 className="font-sora text-lg font-semibold mb-4">Enviar consulta</h2>
            <p className="text-sm text-gray-500 mb-4">
              Déjanos tus datos y te contactaremos sobre este vehículo.
            </p>
            <InquiryForm
              prefillMake={vehicle.make}
              prefillModel={vehicle.model}
              prefillYear={vehicle.year}
              vehicleId={vehicle.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}