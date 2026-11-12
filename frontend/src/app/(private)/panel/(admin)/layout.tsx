"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Guard para rutas exclusivas de ADMIN (inventario).
 * El backend sigue siendo la autoridad real (requireAdmin en la API):
 * este guard es de navegación/UX, no de seguridad.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/panel");
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
        <div className="animate-spin w-8 h-8 border-4 border-dorado border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
