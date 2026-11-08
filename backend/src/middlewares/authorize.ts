// MOVIA — Middleware de autorización por rol

import type { Request, Response, NextFunction } from "express";
import type { AuthUser, AuthenticatedRequest } from "./authenticate.js";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authUser = (req as AuthenticatedRequest).authUser;
  if (!authUser) {
    res.status(401).json({ error: "no_autenticado" });
    return;
  }
  if (authUser.role !== "ADMIN") {
    res.status(403).json({ error: "no_autorizado", message: "Solo ADMIN puede realizar esta operación" });
    return;
  }
  next();
};

export const requireAdvisorOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authUser = (req as AuthenticatedRequest).authUser;
  if (!authUser) {
    res.status(401).json({ error: "no_autenticado" });
    return;
  }
  if (authUser.role !== "ADMIN" && authUser.role !== "ASESOR") {
    res.status(403).json({ error: "no_autorizado" });
    return;
  }
  next();
};