import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:8000',
  },
  webServer: {
    command: 'npm run dev',
    port: 8000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
