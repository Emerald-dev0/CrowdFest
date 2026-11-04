/**
 * Browser worker (spec §6.1).
 * Each worker receives an approved browser scenario, allocates an isolated
 * browser context, executes the journey, captures events, and releases.
 */

import { chromium } from 'playwright';
import { Queue, Worker } from 'bullmq';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@crowdfest/database';
import { eq } from 'drizzle-orm';
import { generatePlaywrightScript } from '@crowdfest/scenario-compiler';
import { compileScenario } from '@crowdfest/scenario-compiler';
import { loadConfig, parseRedisUrl } from '@crowdfest/config';

export interface BrowserJobData {
  simulationId: string;
  scenario: any;
  baseUrl: string;
  sessionIndex: number;
  testAccount?: string;
}

export interface BrowserExecutionResult {
  sessionIndex: number;
  success: boolean;
  durationMs: number;
  steps: Array<{ stepId: string; action: string; success: boolean; durationMs: number; error?: string }>;
  errors: string[];
  consoleErrors: string[];
}

export async function runWorker() {
  const config = loadConfig();
  const pool = new Pool({ connectionString: config.databaseUrl });
  const db = drizzle(pool, { schema });

  const queue = new Queue('crowdfest-browser', {
    connection: parseRedisUrl(config.redisUrl),
  });

  const worker = new Worker(
    'crowdfest-browser',
    async (job) => {
      const data = job.data as BrowserJobData;
      return executeBrowserSession(data, db);
    },
    { connection: parseRedisUrl(config.redisUrl), concurrency: 5 },
  );

  console.log('[browser-worker] started');

  process.on('SIGTERM', async () => {
    await worker.close();
    await queue.close();
    await pool.end();
    process.exit(0);
  });
}

async function executeBrowserSession(data: BrowserJobData, db: any) {
  const { simulationId, scenario, baseUrl, sessionIndex, testAccount } = data;
  const startTime = Date.now();
  const steps: any[] = [];
  const errors: string[] = [];
  const consoleErrors: string[] = [];

  let browser;
  let context;
  let page;

  try {
    // Isolated browser context per simulated user (spec §6.1)
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    context = await browser.newContext();
    page = await context.newPage();

    // Capture console errors (spec §6.1 - report JS errors)
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    // Compile scenario to Playwright steps
    const compiled = compileScenario(scenario, {
      baseUrl,
      testAccounts: testAccount ? [testAccount] : undefined,
      thinkTimeMs: { min: 500, max: 2000 },
    });

    if (!compiled.browserScript) {
      throw new Error('No browser script compiled');
    }

    for (const step of compiled.browserScript.steps) {
      const stepStart = Date.now();
      let success = false;
      let error: string | undefined;

      try {
        switch (step.type) {
          case 'navigate':
            await page.goto(step.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            success = true;
            break;
          case 'click':
            await page.click(step.selector, { timeout: 15000 });
            success = true;
            break;
          case 'fill':
            await page.fill(step.selector, step.value, { timeout: 15000 });
            success = true;
            break;
          case 'wait':
            if (step.ms) {
              await page.waitForTimeout(step.ms);
            } else if (step.selector) {
              await page.waitForSelector(step.selector, { timeout: 15000 });
            }
            success = true;
            break;
          case 'assert':
            if (step.condition === 'visible') {
              await page.waitForSelector(step.selector, { state: 'visible', timeout: 15000 });
            } else if (step.condition === 'hidden') {
              await page.waitForSelector(step.selector, { state: 'hidden', timeout: 15000 });
            } else if (step.condition === 'text_contains') {
              const locator = page.locator(step.selector);
              await locator.waitFor({ timeout: 15000 });
            }
            success = true;
            break;
          case 'sleep':
            await page.waitForTimeout(step.ms);
            success = true;
            break;
        }
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
        errors.push(error);
      }

      steps.push({
        stepId: `step-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        action: step.type,
        success,
        durationMs: Date.now() - stepStart,
        error,
      });

      if (!success && step.type === 'navigate') {
        break; // critical failure - can't continue
      }
    }

    // Run assertions
    for (const assertion of compiled.browserScript.assertions) {
      const stepStart = Date.now();
      let passed = false;
      try {
        if (assertion.type === 'element_visible') {
          await page.waitForSelector(assertion.target, { state: 'visible', timeout: 10000 });
          passed = true;
        }
      } catch {
        passed = false;
        errors.push(`Assertion failed: ${assertion.type} ${assertion.target}`);
      }
      steps.push({
        stepId: `assert-${Date.now()}`,
        action: 'assert',
        success: passed,
        durationMs: Date.now() - stepStart,
        error: passed ? undefined : `Assertion failed: ${assertion.type}`,
      });
    }

    return {
      sessionIndex,
      success: errors.length === 0,
      durationMs: Date.now() - startTime,
      steps,
      errors,
      consoleErrors,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    errors.push(message);
    return {
      sessionIndex,
      success: false,
      durationMs: Date.now() - startTime,
      steps,
      errors,
      consoleErrors,
    };
  } finally {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}
