"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { login } from "@/features/auth/services/auth.service";
import type { LoginResponse } from "@/features/auth/types";
import { useAuthSafe } from "@/features/auth/hooks/useAuth";
import { FormField, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";

const loginSchema = z.object({
  email: z.email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuthSafe();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

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
      toast.success(`Bienvenido, ${response.data.name}`);
      router.replace("/panel");
    },
  });

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/panel");
    }
  }, [user, isAuthLoading, router]);

  const onSubmit = (values: LoginFormValues) => mutation.mutate(values);

  return (
    <main className="flex min-h-screen bg-background">
      <section className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-grafito p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-dorado/10 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <Link href="/" className="font-sora text-xl font-bold tracking-[0.16em]">
            MOVIA
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-dorado-300">Área interna</p>
        </div>

        <div className="relative max-w-md">
          <p className="section-eyebrow !text-dorado-300">Gestión MOVIA</p>
          <h1 className="mt-4 font-sora text-4xl font-bold leading-tight tracking-tight">
            Todo el inventario y las consultas, en un solo lugar.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/70">
            Administra vehículos, revisa consultas y acompaña a cada cliente desde un panel claro y seguro.
          </p>
        </div>

        <p className="relative text-xs text-white/50">
          Proyecto ficticio · datos simulados · acceso de demostración
        </p>
      </section>

      <section className="flex flex-1 flex-col">
        <div className="flex items-center justify-end px-6 pt-6">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-16 pt-6 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link href="/" className="mb-6 inline-block font-sora text-lg font-bold tracking-[0.16em] text-foreground lg:hidden">
                MOVIA
              </Link>
              <h2 className="font-sora text-3xl font-bold tracking-tight text-foreground">Acceso al panel</h2>
              <p className="mt-2 text-sm text-muted">Ingresa tus credenciales para continuar.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-5 p-6 sm:p-8">
              <FormField label="Correo electrónico" htmlFor="email" required error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  icon={Mail}
                  autoComplete="email"
                  placeholder="tu@ejemplo.com"
                  {...register("email")}
                />
              </FormField>

              <FormField label="Contraseña" htmlFor="password" required error={errors.password?.message}>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    icon={LockKeyhole}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-12"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-btn text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </FormField>

              {mutation.isError && (
                <p className="rounded-btn border border-error/30 bg-error/10 px-3 py-2.5 text-sm text-error" role="alert">
                  {mutation.error?.message || "Credenciales inválidas"}
                </p>
              )}

              <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>
                Entrar
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              ¿Necesitas volver al sitio?{" "}
              <Link href="/" className="font-semibold text-accent-text hover:underline">
                Ir al inicio
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
