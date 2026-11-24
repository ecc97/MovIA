import { randomInt } from "node:crypto";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, MessageCircle, Search, ShieldCheck } from "lucide-react";
import { getVehicleFacets, getVehiclePage } from "@/features/vehicles/services/vehicle.service";
import VehicleCard from "@/features/vehicles/components/VehicleCard";
import { Button, buttonStyles } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { WHATSAPP_NUMBER, getWhatsAppLink } from "@/lib/utils";
import { HERO_IMAGES } from "@/lib/hero-images";
import type { VehicleSummary } from "@/features/vehicles/types";

export const dynamic = "force-dynamic";

const benefits = [
  {
    icon: Car,
    title: "Variedad para cada necesidad",
    description: "Autos, SUV y camionetas nuevos y usados, de distintas marcas y presupuestos.",
  },
  {
    icon: ShieldCheck,
    title: "Información clara",
    description: "Precios en COP, fichas técnicas completas y fotografías de cada vehículo.",
  },
  {
    icon: MessageCircle,
    title: "Asesoría cercana",
    description: "Consulta sin registro y habla directamente con una persona por WhatsApp.",
  },
];

const steps = [
  {
    title: "Explora el catálogo",
    description: "Filtra por tipo, condición, marca, año y precio para encontrar lo que buscas.",
  },
  {
    title: "Revisa los detalles",
    description: "Mira las fotos, la ficha técnica y el precio de cada vehículo.",
  },
  {
    title: "Habla con un asesor",
    description: "Envía una consulta o abre WhatsApp con un mensaje listo para tu vehículo.",
  },
];

export default async function HomePage() {
  const heroImage = HERO_IMAGES[randomInt(HERO_IMAGES.length)];
  let featured: VehicleSummary[] = [];
  let totalVehicles = 0;
  let makesCount = 0;

  try {
    const [page, facets] = await Promise.all([
      getVehiclePage({ limit: "4" }),
      getVehicleFacets(),
    ]);
    featured = page.data;
    totalVehicles = page.pagination.total;
    makesCount = facets.makes.length;
  } catch {
    // El hero y el resto de la página siguen disponibles aunque falle el catálogo.
  }

  const whatsappHref = getWhatsAppLink(
    WHATSAPP_NUMBER,
    "Hola, estoy interesado en un vehículo y necesito asesoría."
  );

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-grafito text-blanco">
        <Image
          src={heroImage}
          alt="Vehículo disponible en el catálogo de MOVIA"
          fill
          priority
          unoptimized
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-grafito via-grafito/90 to-grafito/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-grafito/80 via-transparent to-transparent" />

        <div className="container-movia relative z-10 pb-32 pt-20 md:pb-36 md:pt-28">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-dorado-300">
            Concesionario multimarca · Colombia
          </p>
          <h1 className="mt-5 max-w-3xl font-sora text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Encuentra el <span className="text-dorado">vehículo</span> que va contigo
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Explora autos, SUV y camionetas nuevos y usados. Precios en pesos colombianos, sin registro y con
            un asesor que te acompaña hasta decidir.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalogo" className={buttonStyles({ size: "lg" })}>
              <Search size={18} aria-hidden="true" />
              Ver catálogo
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hablar con un asesor por WhatsApp"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-btn border border-white/60 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <WhatsAppIcon size={19} />
              Hablar por WhatsApp
            </a>
          </div>

          {totalVehicles > 0 && (
            <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/20 pt-6 sm:gap-8">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                  Disponibles
                </dt>
                <dd className="mt-1 font-sora text-2xl font-bold sm:text-3xl">{totalVehicles}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                  Marcas
                </dt>
                <dd className="mt-1 font-sora text-2xl font-bold sm:text-3xl">{makesCount}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                  Registro
                </dt>
                <dd className="mt-1 font-sora text-2xl font-bold sm:text-3xl">No</dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      <div className="container-movia relative z-20 -mt-20 md:-mt-24">
        <form action="/catalogo" method="get" className="card p-5 shadow-xl md:p-6">
          <p className="section-eyebrow mb-4">Búsqueda rápida</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
            <div>
              <label htmlFor="hero-body" className="label-field">
                Tipo
              </label>
              <select id="hero-body" name="bodyType" className="input-field">
                <option value="">Todos los tipos</option>
                <option value="AUTO">Auto</option>
                <option value="SUV">SUV</option>
                <option value="CAMIONETA">Camioneta</option>
              </select>
            </div>
            <div>
              <label htmlFor="hero-condition" className="label-field">
                Condición
              </label>
              <select id="hero-condition" name="condition" className="input-field">
                <option value="">Nuevos y usados</option>
                <option value="NUEVO">Nuevo</option>
                <option value="USADO">Usado</option>
              </select>
            </div>
            <div>
              <label htmlFor="hero-price" className="label-field">
                Presupuesto máximo (COP)
              </label>
              <input
                id="hero-price"
                name="maxPrice"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Ej. 120000000"
                className="input-field"
              />
            </div>
            <Button type="submit" size="lg" className="w-full lg:w-auto" leftIcon={<Search size={18} aria-hidden="true" />}>
              Buscar vehículos
            </Button>
          </div>
        </form>
      </div>

      <section className="py-20">
        <div className="container-movia">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow">Selección destacada</p>
              <h2 className="mt-2 font-sora text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Vehículos recientes
              </h2>
              <p className="mt-2 text-sm text-muted">Una muestra de lo que puedes encontrar en MOVIA.</p>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text transition-colors hover:text-dorado"
            >
              Ver todo el catálogo
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-8"
              icon={<Car size={24} aria-hidden="true" />}
              title="No pudimos cargar los destacados"
              description="Puedes explorar el catálogo completo o volver a intentarlo en unos minutos."
              action={
                <Link href="/catalogo" className="btn-primary">
                  Ir al catálogo
                </Link>
              }
            />
          )}
        </div>
      </section>

      <section className="border-y border-border bg-surface py-16">
        <div className="container-movia grid gap-8 md:grid-cols-3 md:divide-x md:divide-border">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="md:px-8 first:md:pl-0 last:md:pr-0">
              <span className="flex size-12 items-center justify-center rounded-card bg-accent-soft text-accent-text">
                <benefit.icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-sora text-lg font-semibold text-foreground">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="container-movia">
          <p className="section-eyebrow">Cómo funciona</p>
          <h2 className="mt-2 font-sora text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            De la búsqueda a la conversación
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="card border-t-2 border-t-dorado p-6">
                <span className="font-sora text-sm font-bold text-accent-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-sora text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-superficie-oscura py-16 text-blanco">
        <div className="container-movia flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-sora text-2xl font-bold tracking-tight sm:text-3xl">
              ¿Listo para encontrar tu próximo vehículo?
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              Explora el catálogo completo o habla con un asesor sobre el vehículo que te interesa.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/catalogo" className={buttonStyles({ size: "lg" })}>
              Ver catálogo
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hablar con un asesor por WhatsApp"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-btn border border-white/50 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <WhatsAppIcon size={19} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
