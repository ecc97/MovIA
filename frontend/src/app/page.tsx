import Link from "next/link";
import { getVehicles } from "@/lib/api";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { Search, Car, ShieldCheck, MessageCircle } from "lucide-react";

export default async function HomePage() {
  const featuredVehicles = await getVehicles({ limit: "8" });

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-grafito text-blanco py-20 md:py-32">
        <div className="container-movia mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="font-sora text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Encuentra el vehículo que va contigo
              </h1>
              <p className="text-lg text-gray-300 max-w-lg">
                Explora nuestra selección de autos, SUV y camionetas nuevos y usados.
                Precios en pesos colombianos, sin registro necesario.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/catalogo"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Search size={20} />
                  Ver catálogo
                </Link>
                <Link
                  href="/contacto"
                  className="btn-outline text-blanco border-blanco hover:bg-blanco hover:text-grafito"
                >
                  Contactar asesor
                </Link>
              </div>
            </div>
            <div className="relative h-64 md:h-96 rounded-card overflow-hidden">
              <img
                src="https://picsum.photos/seed/movia-hero/800/600"
                alt="Vehículo destacado MOVIA"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 bg-fondo-claro">
        <div className="container-movia mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-sora text-3xl font-bold text-grafito">
                Vehículos destacados
              </h2>
              <p className="text-gray-600 mt-2">
                Nuestra selección más reciente disponible para ti
              </p>
            </div>
            <Link
              href="/catalogo"
              className="text-dorado font-medium hover:text-dorado-hover transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVehicles.slice(0, 8).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-blanco">
        <div className="container-movia mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-dorado/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="text-dorado" size={24} />
              </div>
              <h3 className="font-sora text-xl font-semibold mb-2">
                Variedad garantizada
              </h3>
              <p className="text-gray-600">
                Autos, SUV y camionetas de las mejores marcas, nuevos y usados.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-dorado/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-dorado" size={24} />
              </div>
              <h3 className="font-sora text-xl font-semibold mb-2">
                Información clara
              </h3>
              <p className="text-gray-600">
                Precios en COP, características técnicas completas y fotografías reales.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-dorado/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-dorado" size={24} />
              </div>
              <h3 className="font-sora text-xl font-semibold mb-2">
                Atención personalizada
              </h3>
              <p className="text-gray-600">
                Consulta sin registro y habla directamente con un asesor por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-superficie-oscura">
        <div className="container-movia mx-auto px-4 text-center">
          <h2 className="font-sora text-3xl md:text-4xl font-bold text-blanco mb-4">
            ¿Listo para encontrar tu vehículo ideal?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Explora nuestro catálogo completo o contáctanos para recibir asesoría personalizada.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/catalogo"
              className="btn-primary inline-flex items-center gap-2"
            >
              Ver catálogo completo
            </Link>
            <Link
              href="/contacto"
              className="btn-secondary inline-flex items-center gap-2"
            >
              Hacer una consulta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}