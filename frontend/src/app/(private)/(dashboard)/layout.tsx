"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isError } = useAuth();
  const router = useRouter();

  const shouldRedirect = !isLoading && (isError || !user);

  // Redirección fuera del render (evita setState-in-render)
  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/login");
    }
  }, [shouldRedirect, router]);

  if (isLoading || isError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
        <div className="animate-spin w-8 h-8 border-4 border-dorado border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
