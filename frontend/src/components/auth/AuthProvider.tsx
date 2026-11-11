"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/lib/api";
import { logout as logoutApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError, refetch } = useQuery<User | null>({
    queryKey: ["authMe"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data ?? null;
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