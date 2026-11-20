"use client";

import { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, logout as logoutApi } from "../services/auth.service";
import type { User } from "../types";
import { AuthContext } from "../context";
import { useToast } from "@/components/ui/Toast";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: user, isLoading, isError, refetch } = useQuery<User | null>({
    queryKey: ["authMe"],
    queryFn: async () => {
      try {
        return await getMe();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const handleLogout = async () => {
    try {
      await logoutApi();
      toast.success("Sesión cerrada");
      await queryClient.setQueryData(["authMe"], null);
      await queryClient.clear();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cerrar la sesión");
    }
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, isError, refetch, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
