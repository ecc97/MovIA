// MOVIA — Repositorio de Inquiries (acceso a datos)

import prisma from "../../../config/database.js";
import type { InquirySummary, InquiryDetail } from "../types/inquiry.types.js";
import type {
  CreateInquiry,
  InquiryQuery,
  InquiryIdParam,
  UpdateInquiryStatus,
} from "../validators/inquiry.validators.js";

export class InquiryRepository {
  async findById(id: string): Promise<InquiryDetail | null> {
    const record = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        vehicle: { select: { make: true, model: true } },
        assignedTo: { select: { name: true } },
      },
    });
    if (!record) return null;
    return this.toSummary(record);
  }

  async findAll(query: InquiryQuery): Promise<{ items: InquirySummary[]; total: number }> {
    const skip = (query.page - 1) * query.limit;
    const where = this.buildWhere(query);

    const [records, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: { select: { make: true, model: true } },
          assignedTo: { select: { name: true } },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return {
      items: records.map((r) => this.toSummary(r)),
      total,
    };
  }

  async create(data: CreateInquiry): Promise<InquiryDetail> {
    const record = await prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        ...(data.vehicleId ? { vehicleId: data.vehicleId } : {}),
      },
      include: {
        vehicle: { select: { make: true, model: true } },
        assignedTo: { select: { name: true } },
      },
    });
    return this.toSummary(record);
  }

  async updateStatus(id: string, newStatus: string): Promise<InquiryDetail> {
    const record = await prisma.inquiry.update({
      where: { id },
      data: { status: newStatus as Parameters<typeof prisma.inquiry.update>[0]["data"]["status"] },
      include: {
        vehicle: { select: { make: true, model: true } },
        assignedTo: { select: { name: true } },
      },
    });
    return this.toSummary(record);
  }

  async updateNotes(id: string, notes: string): Promise<InquiryDetail> {
    const record = await prisma.inquiry.update({
      where: { id },
      data: { notes },
      include: {
        vehicle: { select: { make: true, model: true } },
        assignedTo: { select: { name: true } },
      },
    });
    return this.toSummary(record);
  }

  private buildWhere(q: InquiryQuery) {
    const conditions: Record<string, unknown> = {};
    if (q.status) conditions.status = q.status;
    if (q.assignedToId) conditions.assignedToId = q.assignedToId;
    return conditions;
  }

  private toSummary(record: {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    vehicleId: string | null;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    vehicle?: { make: string | null; model: string | null } | null;
    assignedTo?: { name: string | null } | null;
  }): InquiryDetail {
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      message: record.message,
      vehicleId: record.vehicleId,
      vehicleMake: record.vehicle?.make ?? undefined,
      vehicleModel: record.vehicle?.model ?? undefined,
      status: record.status,
      notes: record.notes,
      assignedToName: record.assignedTo?.name ?? null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}

export const inquiryRepo = new InquiryRepository();
