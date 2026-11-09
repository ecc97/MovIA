// MOVIA — Controlador de Inquiries

import type { Request, Response, NextFunction } from "express";
import { inquiryService } from "../services/inquiry.service.js";
import {
  createInquirySchema,
  inquiryQuerySchema,
  inquiryIdParamSchema,
  updateInquiryStatusSchema,
  updateInquiryNotesSchema,
} from "../validators/inquiry.validators.js";
import type { AuthenticatedRequest } from "../../../middlewares/authenticate.js";

export class InquiryController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createInquirySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "validation_error", details: parsed.error.issues });
        return;
      }
      const record = await inquiryService.create(parsed.data);
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = inquiryQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({ error: "validation_error", details: parsed.error.issues });
        return;
      }
      const result = await inquiryService.list(parsed.data);
      res.json({
        items: result.items,
        total: result.total,
        page: parsed.data.page,
        limit: parsed.data.limit,
      });
    } catch (err) {
      next(err);
    }
  }

  async detail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = inquiryIdParamSchema.safeParse({ id: req.params.id });
      if (!parsed.success) {
        res.status(400).json({ error: "validation_error", details: parsed.error.issues });
        return;
      }
      const record = await inquiryService.detail(parsed.data);
      res.json(record);
    } catch (err) {
      if (err instanceof Error && (err as unknown as { code: string }).code === "INQUIRY_NOT_FOUND") {
        res.status(404).json({ error: "consulta_no_encontrada" });
        return;
      }
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = inquiryIdParamSchema.safeParse({ id: req.params.id });
      if (!parsed.success) {
        res.status(400).json({ error: "validation_error", details: parsed.error.issues });
        return;
      }
      const body = updateInquiryStatusSchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: "validation_error", details: body.error.issues });
        return;
      }
      const authReq = req as AuthenticatedRequest;
      const record = await inquiryService.updateStatus(parsed.data, body.data, authReq.authUser.role);
      res.json(record);
    } catch (err) {
      if (err instanceof Error && (err as unknown as { code: string }).code === "INQUIRY_NOT_FOUND") {
        res.status(404).json({ error: "consulta_no_encontrada" });
        return;
      }
      if (err instanceof Error && (err as unknown as { code: string }).code === "FORBIDDEN") {
        res.status(403).json({ error: "no_autorizado", message: err.message });
        return;
      }
      next(err);
    }
  }

  async updateNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = inquiryIdParamSchema.safeParse({ id: req.params.id });
      if (!parsed.success) {
        res.status(400).json({ error: "validation_error", details: parsed.error.issues });
        return;
      }
      const body = updateInquiryNotesSchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: "validation_error", details: body.error.issues });
        return;
      }
      const authReq = req as AuthenticatedRequest;
      const record = await inquiryService.updateNotes(parsed.data, body.data, authReq.authUser.name);
      res.json(record);
    } catch (err) {
      if (err instanceof Error && (err as unknown as { code: string }).code === "INQUIRY_NOT_FOUND") {
        res.status(404).json({ error: "consulta_no_encontrada" });
        return;
      }
      next(err);
    }
  }
}

export const inquiryController = new InquiryController();