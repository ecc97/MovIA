// MOVIA — Cliente HTTP base de la API (única capa de acceso al backend)

function getApiUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:4000"
    );
  }

  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: response.statusText,
      message: response.statusText,
    }));
    const err = error as { error: string; message?: string };
    throw new Error(err.message || err.error || `HTTP ${response.status}`);
  }

  return response.json();
}
