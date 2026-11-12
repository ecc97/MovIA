"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, User, LogOut, Loader2 } from "lucide-react";
import { useAuthSafe } from "@/components/auth/AuthProvider";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, isLoading, logout } = useAuthSafe();

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <header className="bg-grafito text-blanco">
      <div className="container-movia mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-sora text-2xl font-bold tracking-wide">
            MOVIA
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium hover:text-dorado transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/catalogo"
              className="text-sm font-medium hover:text-dorado transition-colors"
            >
              Vehículos
            </Link>
            <Link
              href="/contacto"
              className="text-sm font-medium hover:text-dorado transition-colors"
            >
              Contacto
            </Link>
            {isLoading ? (
              <div className="w-24 h-8" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/panel"
                  className="text-sm font-medium hover:text-dorado transition-colors flex items-center gap-2"
                >
                  <User size={16} />
                  <span>Panel</span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-sm font-medium hover:text-dorado transition-colors flex items-center gap-2 px-2 py-1 rounded-btn hover:bg-gris-700"
                >
                  {loggingOut ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LogOut size={16} />
                  )}
                  <span>Cerrar sesión</span>
                </button>
              </div>
            ) : null}
          </nav>

          <div className="md:hidden flex items-center gap-2">
            {isLoading ? (
              <div className="w-24 h-8" />
            ) : user ? (
              <>
                <Link
                  href="/panel"
                  className="p-2 rounded-btn hover:bg-gris-700"
                  aria-label="Panel"
                >
                  <User size={20} />
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="p-2 rounded-btn hover:bg-gris-700"
                  aria-label="Cerrar sesión"
                >
                  {loggingOut ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <LogOut size={20} />
                  )}
                </button>
              </>
            ) : null}
            <button
              className="p-2 rounded-btn focus:outline-none focus:ring-2 focus:ring-dorado"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4 flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm font-medium hover:text-dorado transition-colors px-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/catalogo"
              className="text-sm font-medium hover:text-dorado transition-colors px-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vehículos
            </Link>
            <Link
              href="/contacto"
              className="text-sm font-medium hover:text-dorado transition-colors px-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contacto
            </Link>
            {isLoading ? (
              <div className="px-2 py-1 text-sm text-gris-500">Cargando...</div>
            ) : user ? (
              <>
                <Link
                  href="/panel"
                  className="text-sm font-medium hover:text-dorado transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Panel
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-sm font-medium hover:text-dorado transition-colors px-2 py-1 text-left w-full"
                >
                  {loggingOut ? (
                    <Loader2 size={16} className="animate-spin inline" />
                  ) : (
                    <LogOut size={16} className="inline mr-2" />
                  )}
                  Cerrar sesión
                </button>
              </>
            ) : null}
          </nav>
        )}
      </div>
    </header>
  );
}