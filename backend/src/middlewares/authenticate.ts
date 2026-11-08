// MOVIA — Middleware de autenticación (MOCK temporal para fases 5-6)
// En fase 7 se reemplazará por verificación real de cookie httpOnly / JWT.
// Hoy adjunta un usuario ADMIN de demostración a la request para probar CRUD.

import type { Request, Response, NextFunction } from "express";
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
    const user = await prisma.user.findFirst({
      where: { email: "maria@movia.demo", isActive: true },
    });

    if (!user) {
      res.status(500).json({ error: "mock_auth_user_missing" });
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