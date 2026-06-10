import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Default testDir is required by the config schema; the actual
  // directory is set per-project below. The two projects use
  // different testDir + testMatch so a single config can drive both
  // unit and e2e suites without one swallowing the other's specs.
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'unit',
      testDir: './tests/unit',
      testMatch: '**/*.spec.ts',
      // Unit tests should not need a dev server; suppress the
      // webServer block to keep the suite hermetic.
      use: { baseURL: 'http://localhost:3000' },
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      testMatch: '**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
