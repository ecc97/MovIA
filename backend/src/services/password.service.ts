// MOVIA — Servicio de verificación de contraseña (argon2)

import { verify } from "argon2";

/** Verifica una contraseña contra el hash almacenado. */
export async function verifyPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  return verify(hash, plainPassword);
}