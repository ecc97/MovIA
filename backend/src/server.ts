// MOVIA — Servidor Express principal
// Fase 7: Autenticación real con JWT en cookies httpOnly

import "dotenv/config";
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
const PORT = Number(process.env.PORT ?? 4000);

// Documentación (antes de helmet y del limiter: su CSP por defecto rompe Swagger UI
// y los assets de la UI no deben contar contra el rate limit)
app.use("/api/docs", docsRouter);

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

app.listen(PORT, () => {
  console.log(`🚗 MovIA API listening on port ${PORT}`);
});

export default app;