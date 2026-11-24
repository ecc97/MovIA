import { defineConfig, devices } from "@playwright/test";

const apiUrl = "http://localhost:4000";
const webUrl = "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: webUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],
  webServer: [
    {
      command: "npm run test:server",
      cwd: "../backend",
      url: `${apiUrl}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NODE_ENV: "test",
        PORT: "4000",
        DATABASE_URL:
          process.env.DATABASE_URL ??
          "postgresql://movia:cambiar_en_produccion@localhost:5432/movia_test?schema=public",
        SESSION_SECRET: process.env.SESSION_SECRET ?? "test_session_secret_no_usar_en_produccion",
        SESSION_COOKIE_NAME: "movia_session",
        SESSION_MAX_AGE_MS: "86400000",
      },
    },
    {
      command: process.env.CI ? "npm run start -- --port 3000" : "npm run dev -- --port 3000",
      url: webUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { NEXT_PUBLIC_API_URL: apiUrl },
    },
  ],
});
