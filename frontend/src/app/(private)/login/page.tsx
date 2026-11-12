"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { login, LoginResponse } from "@/lib/api";
import { useAuthSafe } from "@/components/auth/AuthProvider";

const loginSchema = z.object({
  email: z.email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuthSafe();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation<LoginResponse, Error, LoginFormValues>({
    mutationFn: (data) => login(data.email, data.password),
    onSuccess: (response) => {
      queryClient.setQueryData(["authMe"], response.data);
      router.replace("/panel");
    },
  });

  // Si ya hay sesión activa, no mostrar el formulario
  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/panel");
    }
  }, [user, isAuthLoading, router]);

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-fondo-claro flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-bold text-center text-grafito">
            Acceso al panel
          </h2>
          <p className="mt-2 text-center text-sm text-gris-500">
            Ingresa tus credenciales
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-grafito">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                aria-invalid={!!errors.email}
                className="mt-1 block w-full px-3 py-2 border border-gris-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-dorado focus:border-dorado"
                placeholder="tu@ejemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-grafito">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                aria-invalid={!!errors.password}
                className="mt-1 block w-full px-3 py-2 border border-gris-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-dorado focus:border-dorado"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {mutation.isError && (
            <div className="bg-error/10 border border-error/30 rounded-btn p-3 text-sm text-error" role="alert">
              {mutation.error?.message || "Credenciales inválidas"}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-dorado py-2 px-4 text-sm font-medium text-grafito hover:bg-dorado-hover focus:outline-none focus:ring-2 focus:ring-dorado focus:ring-offset-2 disabled:opacity-50"
            >
              {mutation.isPending ? "Ingresando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
