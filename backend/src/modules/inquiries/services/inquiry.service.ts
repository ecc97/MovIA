// MOVIA — Servicio de Inquiries (reglas de negocio)

import { inquiryRepo } from "../repositories/inquiry.repository.js";
import type {
  InquiryDetail,
  InquirySummary,
  ClosedStatus,
} from "../types/inquiry.types.js";
import type {
  CreateInquiry,
  InquiryQuery,
  InquiryIdParam,
  UpdateInquiryStatus,
  UpdateInquiryNotes,
} from "../validators/inquiry.validators.js";

export class InquiryService {
  async create(data: CreateInquiry): Promise<InquiryDetail> {
    return inquiryRepo.create(data);
  }

  async list(query: InquiryQuery): Promise<{ items: InquirySummary[]; total: number }> {
    return inquiryRepo.findAll(query);
  }

  async detail(param: InquiryIdParam): Promise<InquiryDetail> {
    const record = await inquiryRepo.findById(param.id);
    if (!record) {
      const err = new Error("Consulta no encontrada");
      (err as unknown as { code: string }).code = "INQUIRY_NOT_FOUND";
      throw err;
    }
    return record;
  }

  async updateStatus(
    param: InquiryIdParam,
    body: UpdateInquiryStatus,
    actorRole: string
  ): Promise<InquiryDetail> {
    const current = await inquiryRepo.findById(param.id);
    if (!current) {
      const err = new Error("Consulta no encontrada");
      (err as unknown as { code: string }).code = "INQUIRY_NOT_FOUND";
      throw err;
    }

    const closed: ClosedStatus[] = ["VENDIDA", "DESCARTADA"];
    const isReopening = closed.includes(current.status as ClosedStatus) &&
      !closed.includes(body.status as ClosedStatus);

    if (isReopening && actorRole !== "ADMIN") {
      const err = new Error("Solo un ADMIN puede reabrir una consulta cerrada");
      (err as unknown as { code: string }).code = "FORBIDDEN";
      throw err;
    }

    return inquiryRepo.updateStatus(param.id, body.status);
  }

  async updateNotes(
    param: InquiryIdParam,
    body: UpdateInquiryNotes,
    actorName: string
  ): Promise<InquiryDetail> {
    const current = await inquiryRepo.findById(param.id);
    if (!current) {
      const err = new Error("Consulta no encontrada");
      (err as unknown as { code: string }).code = "INQUIRY_NOT_FOUND";
      throw err;
    }

    const stamp = new Date().toISOString();
    const existing = current.notes ? current.notes : "";
    const nextNotes = existing
      ? `${existing}\n[${stamp}] ${actorName}: ${body.notes}`
      : `[${stamp}] ${actorName}: ${body.notes}`;

    return inquiryRepo.updateNotes(param.id, nextNotes);
  }
}

export const inquiryService = new InquiryService();