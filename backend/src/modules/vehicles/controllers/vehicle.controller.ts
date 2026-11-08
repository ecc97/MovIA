// MOVIA — Controlador de vehículos (recepción HTTP, invoca servicio, responde)

import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/authenticate.js";
import { vehicleService } from "../services/vehicle.service.js";
import { vehicleQuerySchema, createVehicleSchema, updateVehicleSchema, vehicleIdParamSchema, updateVehicleStatusSchema } from "../validators/vehicle.validators.js";

export class VehicleController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parse = vehicleQuerySchema.safeParse(req.query);
      if (!parse.success) {
        res.status(400).json({ error: "validacion_error", details: parse.error.errors });
        return;
      }

      const result = await vehicleService.listPublished(parse.data);
      const formatter = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

      res.json({
        data: result.items.map((item) => ({ ...item, priceFormatted: formatter.format(item.price) })),
        pagination: {
          page: parse.data.page,
          limit: parse.data.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / parse.data.limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async detail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parse = vehicleIdParamSchema.safeParse({ id: req.params.id });
      if (!parse.success) {
        res.status(400).json({ error: "validacion_error", details: parse.error.errors });
        return;
      }

      const vehicle = await vehicleService.getDetail(parse.data.id);
      res.json({ data: vehicle });
    } catch (err) {
      if (err instanceof Error && err.message === "VEHICLE_NOT_FOUND") {
        res.status(404).json({ error: "vehiculo_no_encontrado" });
        return;
      }
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parse = createVehicleSchema.safeParse(req.body);
      if (!parse.success) {
        res.status(400).json({ error: "validacion_error", details: parse.error.errors });
        return;
      }

      const authUser = (req as AuthenticatedRequest).authUser;
      const vehicle = await vehicleService.create(parse.data, authUser.id);
      res.status(201).json({ data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParse = vehicleIdParamSchema.safeParse({ id: req.params.id });
      if (!idParse.success) {
        res.status(400).json({ error: "validacion_error", details: idParse.error.errors });
        return;
      }

      const bodyParse = updateVehicleSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({ error: "validacion_error", details: bodyParse.error.errors });
        return;
      }

      const vehicle = await vehicleService.update(idParse.data.id, bodyParse.data);
      res.json({ data: vehicle });
    } catch (err) {
      if (err instanceof Error && err.message === "VEHICLE_NOT_FOUND") {
        res.status(404).json({ error: "vehiculo_no_encontrado" });
        return;
      }
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParse = vehicleIdParamSchema.safeParse({ id: req.params.id });
      if (!idParse.success) {
        res.status(400).json({ error: "validacion_error", details: idParse.error.errors });
        return;
      }

      const statusParse = updateVehicleStatusSchema.safeParse(req.body);
      if (!statusParse.success) {
        res.status(400).json({ error: "validacion_error", details: statusParse.error.errors });
        return;
      }

      const vehicle = await vehicleService.updateStatus(idParse.data.id, statusParse.data);
      res.json({ data: vehicle });
    } catch (err) {
      if (err instanceof Error && err.message === "VEHICLE_NOT_FOUND") {
        res.status(404).json({ error: "vehiculo_no_encontrado" });
        return;
      }
      next(err);
    }
  }
}

export const vehicleController = new VehicleController();