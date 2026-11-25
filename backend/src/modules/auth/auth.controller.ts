// MOVIA — Controlador de Auth

import type { Request, Response } from "express";
import { verifyPassword } from "../../services/password.service.js";
import prisma from "../../config/database.js";
import { signToken } from "../../config/jwt.js";

function isSessionCookieSecure(): boolean {
  const value = process.env.SESSION_COOKIE_SECURE;
  if (value !== undefined) {
    return value === "true";
  }
  return process.env.NODE_ENV === "production";
}

export class AuthController {
  /** Login: email + password → cookie httpOnly con JWT */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: "email_y_password_obligatorios" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "credenciales_invalidas" });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "credenciales_invalidas" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "usuario_inactivo" });
      return;
    }

    const token = signToken({ sub: user.id, role: user.role });
    const cookieName = process.env.SESSION_COOKIE_NAME ?? "movia_session";

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isSessionCookieSecure(),
      sameSite: "lax",
      maxAge: Number(process.env.SESSION_MAX_AGE_MS ?? 86400000),
    });

    res.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  /** Logout: elimina la cookie */
  async logout(req: Request, res: Response): Promise<void> {
    const cookieName = process.env.SESSION_COOKIE_NAME ?? "movia_session";
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: isSessionCookieSecure(),
      sameSite: "lax",
    });
    res.json({ message: "Sesión cerrada correctamente" });
  }

  /** Me: devuelve el usuario desde el token (usado por frontend para bootstrap) */
  async me(req: Request, res: Response): Promise<void> {
    const authUser = (req as any).authUser;
    if (!authUser) {
      res.status(401).json({ error: "no_autenticado" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) {
      res.status(401).json({ error: "usuario_no_encontrado" });
      return;
    }

    res.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }
}

export const authController = new AuthController();