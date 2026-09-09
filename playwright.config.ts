import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  use: {
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    trace:      'on-first-retry',
    baseURL:    process.env.BASE_URL || 'https://claude.ai',
  },

  projects: [
    // ── UI Tests ──────────────────────────────────────────────────────────────
    {
      name:    'chromium',
      testDir: './src/ui/tests',
      use:     { ...devices['Desktop Chrome'] },
    },
    {
      name:    'firefox',
      testDir: './src/ui/tests',
      use:     { ...devices['Desktop Firefox'] },
    },
    {
      name:    'mobile-chrome',
      testDir: './src/ui/tests',
      use:     { ...devices['Pixel 7'] },
    },

    // ── API Tests (sem browser, mais rápidos) ────────────────────────────────
    {
      name:    'api-chromium',
      testDir: './src/api/tests',
      use:     { ...devices['Desktop Chrome'] },
    },
  ],
});
