"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/panel/Sidebar";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isError } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect to login if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo-claro">
        <div className="animate-spin w-8 h-8 border-4 border-dorado border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-fondo-claro flex">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-grafito text-blanco">
        <h1 className="font-sora text-lg font-bold">MOVIA Panel</h1>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-btn hover:bg-gris-700 focus:outline-none focus:ring-2 focus:ring-dorado"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-grafito shadow-xl p-4">
            <Sidebar role={user.role} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <Sidebar role={user.role} />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}