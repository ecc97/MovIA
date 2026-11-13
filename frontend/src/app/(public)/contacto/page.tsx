import InquiryForm from '@/features/inquiries/components/InquiryForm';

export default function ContactoPage() {
  return (
    <div className="container-movia mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-sora text-3xl md:text-4xl font-bold text-grafito mb-3">
            Contáctanos
          </h1>
          <p className="text-gray-600 text-lg">
            Déjanos tus datos y un asesor MOVIA te contactará a la brevedad.
          </p>
        </div>

        <div className="bg-blanco rounded-card p-6 md:p-8 shadow-sm">
          <InquiryForm />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>¿prefieres hablar por WhatsApp?</p>
          <a
            href="https://wa.me/573001234567?text=Hola%2C%20estoy%20interesado%20en%20un%20veh%C3%ADculo%20y%20necesito%20asesor%C3%ADa."
            target="_blank"
            rel="noopener noreferrer"
            className="text-dorado font-medium hover:text-dorado-hover transition-colors inline-flex items-center gap-1"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}