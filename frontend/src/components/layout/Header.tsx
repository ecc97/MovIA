"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          </nav>

          <button
            className="md:hidden p-2 rounded-btn focus:outline-none focus:ring-2 focus:ring-dorado"
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

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4 flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm font-medium hover:text-dorado transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/catalogo"
              className="text-sm font-medium hover:text-dorado transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vehículos
            </Link>
            <Link
              href="/contacto"
              className="text-sm font-medium hover:text-dorado transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contacto
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}