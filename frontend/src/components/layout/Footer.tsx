import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { WHATSAPP_NUMBER, getWhatsAppLink } from "@/lib/utils";

const whatsappHref = getWhatsAppLink(
  WHATSAPP_NUMBER,
  "Hola, estoy interesado en un vehículo y necesito asesoría."
);

export default function Footer() {
  return (
    <footer className="bg-grafito text-white/70">
      <div className="container-movia py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="font-sora text-xl font-bold tracking-[0.16em] text-blanco">
              MOVIA
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Autos, SUV y camionetas nuevos y usados en pesos colombianos. Explora, compara y habla con un
              asesor sin registrarte.
            </p>
          </div>

          <div>
            <h2 className="font-sora text-sm font-semibold uppercase tracking-wider text-blanco">
              Navegación
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-dorado">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="transition-colors hover:text-dorado">
                  Vehículos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="transition-colors hover:text-dorado">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-sora text-sm font-semibold uppercase tracking-wider text-blanco">
              Hablemos
            </h2>
            <p className="mt-4 text-sm leading-relaxed">
              ¿Tienes dudas sobre un vehículo? Escríbenos y un asesor te acompaña en tu decisión.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar a MOVIA por WhatsApp"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-dorado transition-colors hover:text-dorado-300"
            >
              <WhatsAppIcon size={18} />
              WhatsApp
            </a>
          </div>

          <div>
            <h2 className="font-sora text-sm font-semibold uppercase tracking-wider text-blanco">
              Aviso legal
            </h2>
            <p className="mt-4 text-sm leading-relaxed">
              Proyecto ficticio con datos simulados. Los vehículos, precios e imágenes son de demostración y
              no representan ofertas reales. MOVIA no es una concesionaria real.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MOVIA — Proyecto ficticio, datos simulados</p>
          <p>Hecho para demostración · Colombia</p>
        </div>
      </div>
    </footer>
  );
}
