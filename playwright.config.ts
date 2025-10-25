import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { getEnvironment } from './config/environments';

// Load environment variables
dotenv.config();

const env = process.env.ENV || 'dev';
const environment = getEnvironment(env);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? environment.retries : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: environment.baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Default timeout for actions */
    actionTimeout: environment.timeout,

    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },

  /* Configure projects for different browsers (mainly for UI tests) */
  projects: [
    {
      name: 'API Tests',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'E2E Tests',
      testMatch: /.*\.e2e\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  /* Global timeout for each test */
  timeout: environment.timeout,

  /* Global setup/teardown */
  // globalSetup: require.resolve('./utils/global-setup'),
  // globalTeardown: require.resolve('./utils/global-teardown'),

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',
});
