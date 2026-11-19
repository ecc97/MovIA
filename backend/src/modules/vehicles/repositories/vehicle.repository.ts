// MOVIA — Repositorio de vehículos (acceso a datos, sin lógica de negocio)

import prisma from "../../../config/database.js";
import type { VehicleSummary, VehicleDetail } from "../types/vehicle.types.js";
import type {
  VehicleQuery,
  InventoryQuery,
  CreateVehicle,
  UpdateVehicle,
  UpdateVehicleStatus,
} from "../validators/vehicle.validators.js";

export class VehicleRepository {
  async findPublished(query: VehicleQuery): Promise<{ items: VehicleSummary[]; total: number }> {
    const where = { ...this.buildWhere(query), status: "PUBLICADO" as const };
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: this.buildOrderBy(query.sortBy),
        include: {
          photos: { select: { url: true, order: true }, orderBy: { order: "asc" } },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    const formatted = items.map((v) => this.toSummary(v));

    return { items: formatted, total };
  }

  async findAll(query: InventoryQuery): Promise<{ items: VehicleSummary[]; total: number }> {
    const where = query.status ? { status: query.status } : {};
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

    return { items: items.map((v) => this.toSummary(v)), total };
  }

  async findFacets(): Promise<{ years: number[]; makes: string[] }> {
    const where = { status: "PUBLICADO" as const };

    const [yearRows, makeRows] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        distinct: ["year"],
        select: { year: true },
        orderBy: { year: "desc" },
      }),
      prisma.vehicle.findMany({
        where,
        distinct: ["make"],
        select: { make: true },
        orderBy: { make: "asc" },
      }),
    ]);

    return {
      years: yearRows.map((r) => r.year),
      makes: makeRows.map((r) => r.make),
    };
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
    // Las fotos (opcionales) se crean anidadas en la misma operación (atómico).
    // El orden del array define el orden; la primera es la foto principal.
    const { photos, ...vehicleFields } = data;

    const v = await prisma.vehicle.create({
      data: {
        make: vehicleFields.make,
        model: vehicleFields.model,
        year: vehicleFields.year,
        price: vehicleFields.price,
        mileage: vehicleFields.mileage,
        condition: vehicleFields.condition,
        bodyType: vehicleFields.bodyType,
        fuel: vehicleFields.fuel,
        transmission: vehicleFields.transmission,
        color: vehicleFields.color,
        description: vehicleFields.description,
        status: vehicleFields.status,
        createdBy,
        photos:
          photos && photos.length > 0
            ? { create: photos.map((url, index) => ({ url, order: index + 1 })) }
            : undefined,
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

  async replacePhotos(id: string, photos: string[]): Promise<VehicleDetail | null> {
    // Reemplazo atómico: el array define el orden (1 = principal).
    await prisma.$transaction([
      prisma.photo.deleteMany({ where: { vehicleId: id } }),
      prisma.photo.createMany({
        data: photos.map((url, index) => ({ url, order: index + 1, vehicleId: id })),
      }),
    ]);
    return this.findById(id);
  }

  private toSummary(v: {
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
    status: string;
    photos: Array<{ url: string; order: number }>;
  }): VehicleSummary {
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
      status: v.status,
      photos: v.photos.map(({ url, order }) => ({ url, order })),
    };
  }

  private buildWhere(q: VehicleQuery) {
    const conditions: Record<string, unknown> = {};
    if (q.bodyType) conditions.bodyType = q.bodyType;
    if (q.condition) conditions.condition = q.condition;
    if (q.make) conditions.make = { contains: q.make, mode: "insensitive" as const };

    const priceFilter: Record<string, number> = {};
    if (q.minPrice !== undefined) priceFilter.gte = q.minPrice;
    if (q.maxPrice !== undefined) priceFilter.lte = q.maxPrice;
    if (Object.keys(priceFilter).length > 0) {
      conditions.price = priceFilter;
    }

    const yearFilter: Record<string, number> = {};
    if (q.yearMin !== undefined) yearFilter.gte = q.yearMin;
    if (q.yearMax !== undefined) yearFilter.lte = q.yearMax;
    if (Object.keys(yearFilter).length > 0) {
      conditions.year = yearFilter;
    }

    const mileageFilter: Record<string, number> = {};
    if (q.mileageMin !== undefined) mileageFilter.gte = q.mileageMin;
    if (q.mileageMax !== undefined) mileageFilter.lte = q.mileageMax;
    if (Object.keys(mileageFilter).length > 0) {
      conditions.mileage = mileageFilter;
    }

    return conditions;
  }

  private buildOrderBy(sortBy: VehicleQuery["sortBy"]) {
    const sortMap: Record<string, Record<string, "asc" | "desc">> = {
      createdAt_desc: { createdAt: "desc" },
      price_asc: { price: "asc" },
      price_desc: { price: "desc" },
      year_desc: { year: "desc" },
    };
    return sortMap[sortBy ?? "createdAt_desc"];
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