// MOVIA — Servicios HTTP del feature auth

import { apiFetch } from "@/lib/api";
import type { LoginResponse, User } from "../types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<User> {
  const response = await apiFetch<{ data: User }>("/api/auth/me");
  return response.data;
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/api/auth/logout", { method: "POST" });
}
