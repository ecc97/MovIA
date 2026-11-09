// MOVIA — Rutas del módulo Inquiries

import { Router } from "express";
import { inquiryController } from "../controllers/inquiry.controller.js";
import { authenticate } from "../../../middlewares/authenticate.js";
import { requireAdvisorOrAdmin } from "../../../middlewares/authorize.js";

const router = Router();

// Pública: crear consulta
router.post("/", (req, res, next) => void inquiryController.create(req, res, next));

// Requiere auth: ADMIN o ASESOR
router.get("/", authenticate, requireAdvisorOrAdmin, (req, res, next) => void inquiryController.list(req, res, next));
router.get("/:id", authenticate, requireAdvisorOrAdmin, (req, res, next) => void inquiryController.detail(req, res, next));
router.patch(
  "/:id/status",
  authenticate,
  requireAdvisorOrAdmin,
  (req, res, next) => void inquiryController.updateStatus(req, res, next)
);
router.patch(
  "/:id/notes",
  authenticate,
  requireAdvisorOrAdmin,
  (req, res, next) => void inquiryController.updateNotes(req, res, next)
);

export default router;