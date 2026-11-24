import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("healthcheck", () => {
  it("responde 200 con status ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
