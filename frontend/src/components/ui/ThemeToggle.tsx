"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "light" | "dark";
}

export function ThemeToggle({ className, variant = "light" }: ThemeToggleProps) {
  const toggle = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");
    root.style.colorScheme = isDark ? "dark" : "light";
    try {
      localStorage.setItem("movia-theme", isDark ? "dark" : "light");
    } catch {
      // almacenamiento no disponible: el tema sigue aplicado en esta sesión
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar tema claro y oscuro"
      title="Alternar tema"
      className={cn(
        "flex size-11 items-center justify-center rounded-btn transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado",
        variant === "dark"
          ? "text-blanco hover:bg-white/10"
          : "text-foreground hover:bg-surface-muted",
        className
      )}
    >
      <Sun size={20} className="dark:hidden" aria-hidden="true" />
      <Moon size={20} className="hidden dark:block" aria-hidden="true" />
    </button>
  );
}

export default ThemeToggle;
