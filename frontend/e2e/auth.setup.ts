import { mkdirSync } from "node:fs";
import { expect, test as setup } from "@playwright/test";
import { API_URL } from "./helpers/api";
import { storageStates, users } from "./helpers/users";

mkdirSync("e2e/.auth", { recursive: true });

for (const role of ["admin", "advisor"] as const) {
  setup(`autenticar ${role}`, async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/login`, { data: users[role] });

    expect(response.ok()).toBeTruthy();
    await request.storageState({ path: storageStates[role] });
  });
}
