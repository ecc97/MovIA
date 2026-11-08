// MOVIA — Servidor Express principal
// Fase 4: API de vehículos (solo lectura)

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { routerVehicles } from "./modules/vehicles/routes/vehicles.routes.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors());
app.use(express.json());

// Ruta de verificación (healthcheck)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rutas de vehículos (públicas, sin auth todavía)
app.use("/api/vehicles", routerVehicles);

app.listen(PORT, () => {
  console.log(`🚗 MovIA API listening on port ${PORT}`);
});

export default app;