// MOVIA — Repositorio de vehículos (acceso a datos, sin lógica de negocio)

import prisma from "../../../config/database.js";
import type { VehicleSummary } from "../types/vehicle.types.js";
import type { VehicleQuery } from "../validators/vehicle.validators.js";

export class VehicleRepository {
  async findPublished(query: VehicleQuery): Promise<{ items: VehicleSummary[]; total: number }> {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          photos: { select: { url: true, order: true }, orderBy: { order: "asc" } },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    const formatted = items.map((v) => ({
      id: v.id,
      make: v.make,
      model: v.model,
      year: v.year,
      price: v.price,
      mileage: v.mileage,
      condition: v.condition,
      bodyType: v.bodyType,
      fuel: v.fuel,
      transmission: v.transmission,
      color: v.color,
      status: v.status,
      photos: v.photos.map(({ url, order }) => ({ url, order })),
    }));

    return { items: formatted, total };
  }

  private buildWhere(q: VehicleQuery) {
    const conditions: Record<string, unknown> = {};
    if (q.bodyType) conditions.bodyType = q.bodyType;
    if (q.condition) conditions.condition = q.condition;
    if (q.make) conditions.make = { contains: q.make, mode: "insensitive" as const };
    if (q.year) conditions.year = q.year;

    const priceFilter: Record<string, number> = {};
    if (q.minPrice !== undefined) priceFilter.gte = q.minPrice;
    if (q.maxPrice !== undefined) priceFilter.lte = q.maxPrice;
    if (Object.keys(priceFilter).length > 0) {
      conditions.price = priceFilter;
    }

    return conditions;
  }
}

export const vehicleRepo = new VehicleRepository();
