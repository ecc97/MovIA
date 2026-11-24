"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
