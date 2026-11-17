// MOVIA — Documentación OpenAPI + Swagger UI
// El spec vive en backend/openapi.yaml (una carpeta arriba de src/ y de dist/).
// Montado en /api/docs antes del helmet (su CSP por defecto rompe la UI) y del rate limiter.

import { Router } from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";

const here = dirname(fileURLToPath(import.meta.url));
const specPath = join(here, "../../openapi.yaml");
const spec = yaml.parse(readFileSync(specPath, "utf8"));

const docsRouter = Router();

// Spec crudo (importable en Postman/Insomnia)
docsRouter.get("/openapi.yaml", (_req, res) => {
  res.type("text/yaml").send(readFileSync(specPath, "utf8"));
});

docsRouter.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(spec, { customSiteTitle: "MOVIA API Docs" })
);

export default docsRouter;
