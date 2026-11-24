// MOVIA — Aplicación Express (wiring de middlewares y rutas)
// Separada de server.ts para poder importarla desde tests con supertest.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { routerVehicles } from "./modules/vehicles/routes/vehicles.routes.js";
import routerInquiries from "./modules/inquiries/routes/inquiry.routes.js";
import routerAuth from "./modules/auth/auth.routes.js";
import docsRouter from "./docs/swagger.js";

const app = express();

// Documentación (antes de helmet y del limiter: su CSP por defecto rompe Swagger UI
// y los assets de la UI no deben contar contra el rate limit)
app.use("/api/docs", docsRouter);

// Rate limiting global (desactivado en tests para no contaminar la suite con 429)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: () => process.env.NODE_ENV === "test",
});

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(limiter);

// Ruta de verificación (healthcheck)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rutas de vehículos (públicas)
app.use("/api/vehicles", routerVehicles);

// Rutas de consultas (requiere auth a partir de fase 7)
app.use("/api/inquiries", routerInquiries);

// Rutas de autenticación
app.use("/api/auth", routerAuth);

export default app;
