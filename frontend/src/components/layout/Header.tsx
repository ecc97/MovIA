"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, Search, User, X } from "lucide-react";
import { useAuthSafe } from "@/features/auth/hooks/useAuth";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Vehículos" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, isLoading, logout } = useAuthSafe();
  const { confirm } = useConfirm();

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    const accepted = await confirm({
      title: "¿Cerrar sesión?",
      description: "Necesitarás volver a ingresar para acceder al panel.",
      confirmLabel: "Cerrar sesión",
    });
    if (!accepted) return;
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-grafito/95 text-blanco backdrop-blur-md">
      <div className="container-movia">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Link
            href="/"
            onClick={closeMobile}
            className="font-sora text-xl font-bold tracking-[0.16em] text-blanco transition-colors hover:text-dorado sm:text-2xl"
          >
            MOVIA
          </Link>

          <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-btn px-3 py-2 text-sm font-medium transition-colors hover:text-dorado",
                  isActive(link.href) ? "text-dorado" : "text-white/80"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute inset-x-3 -bottom-[22px] h-0.5 rounded-full bg-dorado" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle variant="dark" className="hidden sm:flex" />

            <Link
              href="/contacto"
              className="btn-primary hidden min-h-10 px-4 text-xs lg:inline-flex"
            >
              Hablar con un asesor
            </Link>

            {!isLoading && user && (
              <div className="hidden items-center gap-1 md:flex">
                <Link
                  href="/panel"
                  className="flex min-h-11 items-center gap-2 rounded-btn px-3 text-sm font-medium text-white/80 transition-colors hover:text-dorado"
                >
                  <User size={17} aria-hidden="true" />
                  Panel
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  aria-label="Cerrar sesión"
                  className="flex size-11 items-center justify-center rounded-btn text-white/80 transition-colors hover:text-dorado disabled:opacity-60"
                >
                  <LogOut size={18} aria-hidden="true" className={loggingOut ? "animate-pulse" : ""} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              className="flex size-11 items-center justify-center rounded-btn text-blanco hover:bg-white/10 md:hidden"
            >
              {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Navegación móvil"
            className="border-t border-white/10 py-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-btn px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10",
                    isActive(link.href) ? "text-dorado" : "text-white/85"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contacto"
                onClick={closeMobile}
                className="btn-primary mt-2 w-full"
              >
                <Search size={17} aria-hidden="true" />
                Hablar con un asesor
              </Link>
              {!isLoading && user && (
                <>
                  <Link
                    href="/panel"
                    onClick={closeMobile}
                    className="rounded-btn px-3 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
                  >
                    Panel
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      void handleLogout();
                    }}
                    disabled={loggingOut}
                    className="flex items-center gap-2 rounded-btn px-3 py-3 text-left text-sm font-medium text-white/85 hover:bg-white/10"
                  >
                    <LogOut size={17} aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </>
              )}
              <div className="mt-2 flex items-center justify-between px-3 sm:hidden">
                <span className="text-xs text-white/60">Tema</span>
                <ThemeToggle variant="dark" />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
