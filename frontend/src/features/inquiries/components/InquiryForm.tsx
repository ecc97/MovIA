'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInquiry } from '../services/inquiry.service';
import { Mail, User, Phone, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const inquirySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un correo válido'),
  phone: z.string().min(7, 'Ingresa un número de teléfono válido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
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
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      reset();
      toast.success('Tu consulta ha sido enviada. Te contactaremos pronto.');
    },
  });

  const onSubmit = (data: InquiryFormData) => {
    mutation.mutate({
      ...data,
      vehicleId: vehicleId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {prefillMake && prefillModel && (
        <div className="bg-fondo-claro rounded-btn p-3 text-sm">
          <span className="font-medium">Vehículo de interés:</span>{' '}
          {prefillMake} {prefillModel} {prefillYear ?? ''}
        </div>
      )}

      <div>
        <label htmlFor="name" className="label-field">
          Nombre completo <span className="text-error">*</span>
        </label>
        <div className="relative">
          <User size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            id="name"
            {...register('name')}
            className="input-field pl-10"
            placeholder="Tu nombre completo"
          />
        </div>
        {errors.name && <p className="error-message">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="label-field">
          Correo electrónico <span className="text-error">*</span>
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            id="email"
            type="email"
            {...register('email')}
            className="input-field pl-10"
            placeholder="tu@correo.com"
          />
        </div>
        {errors.email && <p className="error-message">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="label-field">
          Teléfono <span className="text-error">*</span>
        </label>
        <div className="relative">
          <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            id="phone"
            {...register('phone')}
            className="input-field pl-10"
            placeholder="+57 300 123 4567"
          />
        </div>
        {errors.phone && <p className="error-message">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="message" className="label-field">
          Mensaje <span className="text-error">*</span>
        </label>
        <div className="relative">
          <MessageSquare size={18} className="absolute left-3 top-3 text-gray-400" />
          <textarea
            id="message"
            rows={4}
            {...register('message')}
            className="input-field pl-10 resize-none"
            placeholder="Cuéntanos qué necesitas..."
          />
        </div>
        {errors.message && <p className="error-message">{errors.message.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  );
}