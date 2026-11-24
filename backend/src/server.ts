// MOVIA — Servidor Express principal
// Fase 7: Autenticación real con JWT en cookies httpOnly

import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  console.log(`🚗 MovIA API listening on port ${PORT}`);
});
