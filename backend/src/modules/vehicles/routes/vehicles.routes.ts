// MOVIA — Rutas de vehículos (públicas + CRUD protegido)

import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate.js";
import { requireAdmin } from "../../../middlewares/authorize.js";
import { vehicleController } from "../controllers/vehicle.controller.js";

const router = Router();

// --- Lectura pública (sin auth) ---
router.get("/", (req, res, next) => void vehicleController.list(req, res, next));
router.get("/meta", (req, res, next) => void vehicleController.facets(req, res, next));
router.get("/:id", (req, res, next) => void vehicleController.detail(req, res, next));

// --- CRUD protegido (solo ADMIN) ---
router.post("/", authenticate, requireAdmin, (req, res, next) => void vehicleController.create(req, res, next));
router.patch("/:id", authenticate, requireAdmin, (req, res, next) => void vehicleController.update(req, res, next));
router.patch("/:id/status", authenticate, requireAdmin, (req, res, next) => void vehicleController.updateStatus(req, res, next));

export const routerVehicles = router;