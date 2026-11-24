import type { APIRequestContext } from "@playwright/test";
import { users } from "./users";

export const API_URL = "http://localhost:4000";

export function uniqueLabel(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createClosedInquiry(
  request: APIRequestContext,
  status: "VENDIDA" | "DESCARTADA" = "VENDIDA",
): Promise<{ id: string; name: string; email: string }> {
  const login = await request.post(`${API_URL}/api/auth/login`, {
    data: users.admin,
  });
  if (!login.ok())
    throw new Error("No se pudo autenticar como ADMIN para cerrar la consulta");

  const name = `E2E ${uniqueLabel("Cerrada")}`;
  const email = `${uniqueLabel("e2e-cerrada")}@ejemplo.com`;
  const created = await request.post(`${API_URL}/api/inquiries`, {
    data: {
      name,
      email,
      phone: "3001234567",
      message: "Consulta cerrada para la prueba E2E",
    },
  });
  if (!created.ok()) throw new Error("No se pudo crear la consulta E2E");

  const inquiry = (await created.json()) as { id: string };
  const closed = await request.patch(
    `${API_URL}/api/inquiries/${inquiry.id}/status`,
    {
      data: { status },
    },
  );
  if (!closed.ok()) throw new Error("No se pudo cerrar la consulta E2E");

  return { id: inquiry.id, name, email };
}
