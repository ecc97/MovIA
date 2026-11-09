// MOVIA — Middleware de autenticación (verifica cookie httpOnly con JWT)
// En fase 7 se reemplazó el mock auth por autenticación real con JWT.

import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt.js";
import prisma from "../config/database.js";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ASESOR";
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  authUser: AuthUser;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookieName = process.env.SESSION_COOKIE_NAME ?? "movia_session";
    const token = (req as any).cookies?.[cookieName];

    if (!token) {
      res.status(401).json({ error: "no_autenticado", message: "No hay sesión activa" });
      return;
    }

    let payload: { sub: string; role: string };
    try {
      payload = verifyToken(token);
    } catch {
      res.status(401).json({ error: "no_autenticado", message: "Sesión inválida o expirada" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user?.isActive) {
      res.status(401).json({ error: "no_autenticado", message: "Usuario inactivo" });
      return;
    }

    (req as AuthenticatedRequest).authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "ADMIN" | "ASESOR",
      isActive: user.isActive,
    };

    next();
  } catch (err) {
    next(err);
  }
};