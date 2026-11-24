import type { Metadata } from "next";
import { Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import InquiryForm from "@/features/inquiries/components/InquiryForm";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { WHATSAPP_NUMBER, getWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contacto | MOVIA",
  description: "Envíanos una consulta general o habla con un asesor por WhatsApp. Sin registro.",
};

const whatsappHref = getWhatsAppLink(
  WHATSAPP_NUMBER,
  "Hola, estoy interesado en un vehículo y necesito asesoría."
);

const points = [
  {
    icon: MessageCircle,
    title: "Consulta general",
    description: "Cuéntanos qué vehículo buscas y te ayudamos a encontrarlo.",
  },
  {
    icon: ShieldCheck,
    title: "Sin compromiso",
    description: "No necesitas crear una cuenta ni dejar tus datos para explorar.",
  },
  {
    icon: Clock3,
    title: "Respuesta directa",
    description: "Tu mensaje llega al panel del equipo para que un asesor lo atienda.",
  },
];

export default function ContactoPage() {
  return (
    <div className="container-movia py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="section-eyebrow">Estamos para ayudarte</p>
          <h1 className="mt-2 font-sora text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Hablemos de tu próximo vehículo
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
            Envía una consulta general o habla por WhatsApp. Un asesor de MOVIA te acompaña en la decisión.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
          <section className="flex flex-col justify-between rounded-card bg-grafito p-7 text-blanco md:p-9">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-dorado-300">Atención personalizada</p>
              <h2 className="mt-4 font-sora text-2xl font-bold leading-snug">
                Tu próximo auto empieza con una conversación
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Cuéntanos qué necesitas: tipo de vehículo, presupuesto o dudas sobre un modelo en particular.
              </p>

              <div className="mt-8 space-y-5">
                {points.map((point) => (
                  <div key={point.title} className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-dorado-300">
                      <point.icon size={19} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-blanco">{point.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-white/60">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 border-t border-white/15 pt-6">
              <p className="mb-3 text-sm text-white/70">¿Prefieres escribirnos directamente?</p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar a MOVIA por WhatsApp"
                className="inline-flex min-h-11 items-center gap-2 rounded-btn bg-dorado px-5 text-sm font-semibold text-grafito transition-colors hover:bg-dorado-hover"
              >
                <WhatsAppIcon size={19} />
                Abrir WhatsApp
              </a>
              <p className="mt-3 text-[11px] leading-relaxed text-white/50">
                El clic no se guarda como consulta ni cuenta como una en este MVP.
              </p>
            </div>
          </section>

          <section className="card p-6 md:p-8">
            <h2 className="font-sora text-xl font-semibold text-foreground">Envíanos tu consulta</h2>
            <p className="mt-1 text-sm text-muted">Completamos los datos y te contactamos a la brevedad.</p>
            <div className="mt-6">
              <InquiryForm />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
