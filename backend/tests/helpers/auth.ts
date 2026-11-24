import request from "supertest";
import app from "../../src/app.js";

export type TestAgent = ReturnType<typeof request.agent>;

export async function loginAs(email: string, password = "demo123"): Promise<TestAgent> {
  const agent = request.agent(app);
  const response = await agent.post("/api/auth/login").send({ email, password });

  if (response.status !== 200) {
    throw new Error(`No se pudo autenticar ${email}: ${response.status} ${response.text}`);
  }
  return agent;
}
