// MOVIA — Configuración de JWT (firma y verificación)

import jwt from "jsonwebtoken";

const SECRET = process.env.SESSION_SECRET!;

const MAX_AGE_MS = Number(process.env.SESSION_MAX_AGE_MS ?? 86400000);

export interface TokenPayload {
  sub: string;
  role: "ADMIN" | "ASESOR";
}

/** Firma un JWT con la duración de la variable SESSION_MAX_AGE_MS. */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: Math.floor(MAX_AGE_MS / 1000),
  });
}

/** Verifica y decodifica un JWT. Lanza si es inválido o expirado. */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, SECRET) as { sub: string; role: string };
  return {
    sub: decoded.sub,
    role: decoded.role as "ADMIN" | "ASESOR",
  };
}

/** Devuelve la edad máxima de la cookie en segundos. */
export function maxAgeSeconds(): number {
  return Math.floor(MAX_AGE_MS / 1000);
}