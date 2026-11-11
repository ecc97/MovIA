"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { LoginResponse } from "@/lib/api";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<string[]>([]);

  const mutation = useMutation<void, Error, LoginForm>({
    mutationFn: async (data) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Error de autenticación" }));
        throw new Error(error.message || "Credenciales inválidas");
      }
    },
    onSuccess: () => {
      router.push("/panel");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    mutation.mutate(form);
  };

  const handleChange = (field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-grafito">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gris-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-dorado focus:border-dorado"
                placeholder="tú@ejemplo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-grafito">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gris-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-dorado focus:border-dorado"
                placeholder="••••••••"
              />
            </div>
          </div>

          {mutation.isError && (
            <div className="bg-error/10 border border-error/30 rounded-btn p-3 text-sm text-error">
              {mutation.error?.message || "Credenciales inválidas"}
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-error/10 border border-error/30 rounded-btn p-3">
              <ul className="text-sm text-error list-disc list-inside">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
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