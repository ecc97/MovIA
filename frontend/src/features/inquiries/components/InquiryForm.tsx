"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, MessageSquare, Phone, User } from "lucide-react";
import { createInquiry } from "../services/inquiry.service";
import { FormField, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const inquirySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo válido"),
  phone: z.string().min(7, "Ingresa un número de teléfono válido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  prefillMake?: string;
  prefillModel?: string;
  prefillYear?: number;
  vehicleId?: string;
}

export default function InquiryForm({
  prefillMake,
  prefillModel,
  prefillYear,
  vehicleId,
}: InquiryFormProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
  });

  const mutation = useMutation({
    mutationFn: createInquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      reset();
      toast.success("Tu consulta ha sido enviada. Te contactaremos pronto.");
    },
  });

  const onSubmit = (data: InquiryFormData) => {
    mutation.mutate({
      ...data,
      vehicleId: vehicleId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {prefillMake && prefillModel && (
        <div className="rounded-btn border border-accent-border bg-accent-soft px-3 py-2.5 text-sm text-accent-text">
          <span className="font-semibold">Vehículo de interés:</span>{" "}
          {prefillMake} {prefillModel} {prefillYear ?? ""}
        </div>
      )}

      <FormField label="Nombre completo" htmlFor="name" required error={errors.name?.message}>
        <Input id="name" icon={User} placeholder="Tu nombre completo" {...register("name")} />
      </FormField>

      <FormField label="Correo electrónico" htmlFor="email" required error={errors.email?.message}>
        <Input id="email" type="email" icon={Mail} placeholder="tu@correo.com" {...register("email")} />
      </FormField>

      <FormField label="Teléfono" htmlFor="phone" required error={errors.phone?.message}>
        <Input id="phone" type="tel" icon={Phone} placeholder="+57 300 123 4567" {...register("phone")} />
      </FormField>

      <FormField label="Mensaje" htmlFor="message" required error={errors.message?.message}>
        <Textarea
          id="message"
          icon={MessageSquare}
          rows={4}
          placeholder="Cuéntanos qué necesitas..."
          {...register("message")}
        />
      </FormField>

      {mutation.isError && (
        <p className="error-message" role="alert">
          {mutation.error?.message ?? "No pudimos enviar tu consulta. Inténtalo de nuevo."}
        </p>
      )}

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar consulta"}
      </Button>
    </form>
  );
}
