import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./regression",
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  use: { baseURL: "http://localhost:3100", ...devices["Desktop Chrome"], channel: process.env.CI ? undefined : "chrome" },
  webServer: {
    command: "node node_modules/next/dist/bin/next dev --webpack --port 3100",
    url: "http://localhost:3100/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
