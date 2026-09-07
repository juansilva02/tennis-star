import path from "node:path";
import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const workspace = path.resolve(__dirname, "../..");
const localEnvironment = path.join(workspace, ".env");

if (existsSync(localEnvironment)) process.loadEnvFile(localEnvironment);

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    channel: process.env.CI ? undefined : "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
      testMatch: /responsive\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: "pnpm --filter api start",
      cwd: workspace,
      url: "http://127.0.0.1:4000/api/v1/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter web start",
      cwd: workspace,
      url: "http://127.0.0.1:3000/login",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
