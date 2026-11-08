// MOVIA — Repositorio de vehículos (acceso a datos, sin lógica de negocio)

import prisma from "../../../config/database.js";
import type { VehicleSummary, VehicleDetail } from "../types/vehicle.types.js";
import type {
  VehicleQuery,
  CreateVehicle,
  UpdateVehicle,
  UpdateVehicleStatus,
} from "../validators/vehicle.validators.js";

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

  async findById(id: string): Promise<VehicleDetail | null> {
    const v = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        photos: { select: { url: true, order: true }, orderBy: { order: "asc" } },
      },
    });

    if (!v) return null;

    return {
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
      description: v.description,
      status: v.status,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      photos: v.photos.map(({ url, order }) => ({ url, order })),
    };
  }

  async create(data: CreateVehicle, createdBy: string): Promise<VehicleDetail> {
    const v = await prisma.vehicle.create({
      data: {
        make: data.make,
        model: data.model,
        year: data.year,
        price: data.price,
        mileage: data.mileage,
        condition: data.condition,
        bodyType: data.bodyType,
        fuel: data.fuel,
        transmission: data.transmission,
        color: data.color,
        description: data.description,
        status: data.status,
        createdBy,
      },
      include: { photos: { select: { url: true, order: true }, orderBy: { order: "asc" } } },
    });

    return this.toDetail(v);
  }

  async update(id: string, data: UpdateVehicle): Promise<VehicleDetail> {
    const v = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(data.make !== undefined && { make: data.make }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.mileage !== undefined && { mileage: data.mileage }),
        ...(data.condition !== undefined && { condition: data.condition }),
        ...(data.bodyType !== undefined && { bodyType: data.bodyType }),
        ...(data.fuel !== undefined && { fuel: data.fuel }),
        ...(data.transmission !== undefined && { transmission: data.transmission }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: { photos: { select: { url: true, order: true }, orderBy: { order: "asc" } } },
    });

    return this.toDetail(v);
  }

  async updateStatus(id: string, status: string): Promise<VehicleDetail> {
    const v = await prisma.vehicle.update({
      where: { id },
      data: { status: status as "BORRADOR" | "PUBLICADO" | "ARCHIVADO" },
      include: { photos: { select: { url: true, order: true }, orderBy: { order: "asc" } } },
    });

    return this.toDetail(v);
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

  private toDetail(v: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    condition: string;
    bodyType: string;
    fuel: string;
    transmission: string;
    color: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    photos: Array<{ url: string; order: number }>;
  }): VehicleDetail {
    return {
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
      description: v.description,
      status: v.status,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      photos: v.photos,
    };
  }
}

export const vehicleRepo = new VehicleRepository();