"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logout } from "@/lib/api";

interface LogoutButtonProps {
  variant?: "header" | "sidebar";
}

export default function LogoutButton({ variant = "sidebar" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setLoading(false);
    }
  };

  if (variant === "header") {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium text-blanco hover:bg-superficie-oscura transition-colors"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <LogOut size={16} />
        )}
        <span>Cerrar sesión</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center w-full gap-2 px-3 py-2 rounded-card text-sm font-medium text-gris-700 hover:bg-error/10 hover:text-error transition-colors text-left"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <LogOut size={16} />
      )}
      <span>Cerrar sesión</span>
    </button>
  );
}