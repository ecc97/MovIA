"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
