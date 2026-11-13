"use client";

import { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, logout as logoutApi } from "../services/auth.service";
import type { User } from "../types";
import { AuthContext } from "../context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

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
    await logoutApi();
    await queryClient.setQueryData(["authMe"], null);
    // Clear all queries
    await queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, isError, refetch, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
