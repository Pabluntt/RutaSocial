import { defineConfig, devices } from '@playwright/test';

const apiUrl = process.env.E2E_API_URL || process.env.VITE_URL_BACKEND || 'http://localhost:8080';
const basePath = process.env.E2E_BASE_PATH || process.env.VITE_BASE_URL || '';
const port = Number(process.env.E2E_WEB_PORT || 5173);

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${port}${basePath}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}${basePath || '/'}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      VITE_URL_BACKEND: apiUrl,
      VITE_BASE_URL: basePath,
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
