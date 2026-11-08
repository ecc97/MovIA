// MOVIA — Controlador de vehículos (recepción HTTP, invoca servicio, responde)

import type { Request, Response } from "express";
import { vehicleService } from "../services/vehicle.service.js";
import { vehicleQuerySchema } from "../validators/vehicle.validators.js";

export class VehicleController {
  async list(req: Request, res: Response): Promise<void> {
    const parse = vehicleQuerySchema.safeParse(req.query);

    if (!parse.success) {
      res.status(400).json({ error: "validacion_error", details: parse.error.errors });
      return;
    }

    const result = await vehicleService.listPublished(parse.data);

    const COPFormatter = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    res.json({
      data: result.items.map((item) => ({
        ...item,
        priceFormatted: COPFormatter.format(item.price),
      })),
      pagination: {
        page: parse.data.page,
        limit: parse.data.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / parse.data.limit),
      },
    });
  }
}

export const vehicleController = new VehicleController();
