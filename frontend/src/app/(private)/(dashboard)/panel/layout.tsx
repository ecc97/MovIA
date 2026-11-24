"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Spinner } from "@/components/ui/Spinner";
import type { Role } from "@/types";

function roleLabel(role: Role): string {
  return role === "ADMIN" ? "Administrador" : "Asesor";
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // El guard de sesión vive en (dashboard)/layout.tsx; aquí solo se renderiza el panel.
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
          <Sidebar role={user.role} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú del panel"
                className="flex size-11 items-center justify-center rounded-btn text-foreground transition-colors hover:bg-surface-muted lg:hidden"
              >
                <Menu size={22} aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="font-sora text-sm font-bold text-foreground">Panel MOVIA</p>
                <p className="truncate text-xs text-muted">Gestión interna · {roleLabel(user.role)}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge tone="accent" className="hidden sm:inline-flex">
                {user.role}
              </Badge>
              <span className="hidden max-w-40 truncate text-sm text-muted md:inline">{user.name}</span>
              <ThemeToggle />
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      <Modal
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        variant="drawer"
        ariaLabel="Menú del panel"
        bodyClassName="p-0"
        hideClose
      >
        <Sidebar role={user.role} onNavigate={() => setMobileOpen(false)} />
      </Modal>
    </div>
  );
}
