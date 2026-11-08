// MOVIA — Rutas públicas de vehículos

import { Router, type Request, type Response, type NextFunction } from "express";
import { vehicleController } from "../controllers/vehicle.controller.js";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  void vehicleController.list(req, res).catch(next);
});

export const routerVehicles = router;
