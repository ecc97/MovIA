// MOVIA — Hooks de consumo del contexto de autenticación

"use client";

import { useContext } from "react";
import { AuthContext } from "../context";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthSafe() {
  const context = useContext(AuthContext);
  return context ?? {
    user: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
    logout: async () => {},
  };
}
