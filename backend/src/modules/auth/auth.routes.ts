// MOVIA — Rutas de Auth

import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

/** POST /api/auth/login — email + password → cookie httpOnly */
router.post("/login", (req, res) => void authController.login(req, res));

/** POST /api/auth/logout — elimina cookie */
router.post("/logout", authenticate, (req, res) => void authController.logout(req, res));

/** GET /api/auth/me — devuelve usuario actual */
router.get("/me", authenticate, (req, res) => void authController.me(req, res));

export default router;