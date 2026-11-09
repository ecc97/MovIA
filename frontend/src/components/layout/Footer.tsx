import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-grafito text-gray-300 py-12">
      <div className="container-movia mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="font-sora text-xl font-bold text-blanco">
              MOVIA
            </Link>
            <p className="mt-2 text-sm">
              Encuentra tu próximo vehículo con confianza. Autos, SUV y camionetas
              nuevos y usados en pesos colombianos.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-blanco mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-dorado transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo"
                  className="hover:text-dorado transition-colors"
                >
                  Vehículos
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="hover:text-dorado transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blanco mb-4">Aviso legal</h4>
            <p className="text-sm">
              Este es un proyecto ficticio con datos simulados. Los vehículos,
              precios e imágenes son de demostración y no representan ofertas
              reales. MovIA no es una concesionaria real.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MOVIA — Proyecto ficticio, datos simulados
        </div>
      </div>
    </footer>
  );
}