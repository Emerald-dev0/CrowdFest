/**
 * Load worker (spec §6.2).
 * Compiles approved HTTP workflows into k6 scripts and executes them.
 * Lightweight virtual users - NOT real browsers.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { Queue, Worker } from 'bullmq';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@crowdfest/database';
import { eq } from 'drizzle-orm';
import { generateK6Script } from '@crowdfest/scenario-compiler';
import { compileScenario } from '@crowdfest/scenario-compiler';
import { loadConfig } from '@crowdfest/config';

export interface HttpJobData {
  simulationId: string;
  scenario: any;
  baseUrl: string;
  virtualUsers: number;
  durationSeconds: number;
}

export async function runWorker() {
  const config = loadConfig();
  const pool = new Pool({ connectionString: config.databaseUrl });
  const db = drizzle(pool, { schema });

  const queue = new Queue('crowdfest-http', {
    connection: { host: 'localhost', port: 6379 },
  });

  const worker = new Worker(
    'crowdfest-http',
    async (job) => {
      const data = job.data as HttpJobData;
      return executeHttpLoad(data, db);
    },
    { connection: { host: 'localhost', port: 6379 }, concurrency: 10 },
  );

  console.log('[load-worker] started');

  process.on('SIGTERM', async () => {
    await worker.close();
    await queue.close();
    await pool.end();
    process.exit(0);
  });
}

async function executeHttpLoad(data: HttpJobData, db: any) {
  const { simulationId, scenario, baseUrl, virtualUsers, durationSeconds } = data;
  const startTime = Date.now();

  try {
    // Compile scenario to k6 script
    const compiled = compileScenario(scenario, {
      baseUrl,
      thinkTimeMs: { min: 500, max: 2000 },
    });

    if (!compiled.httpScript) {
      throw new Error('No HTTP script compiled');
    }

    const k6Script = generateK6Script(compiled.httpScript, 'BASE_URL');

    // Write k6 script to temp file
    const dir = mkdtempSync(join(tmpdir(), 'crowdfest-k6-'));
    const scriptPath = join(dir, 'script.js');
    writeFileSync(scriptPath, k6Script);

    try {
      // Execute k6
      const result = execSync(
        `k6 run --vus ${virtualUsers} --duration ${durationSeconds}s --env BASE_URL="${baseUrl}" --json ${scriptPath}`,
        { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, timeout: (durationSeconds + 60) * 1000 },
      );

      // Parse k6 JSON output (last line is the summary)
      const lines = result.trim().split('\n').filter((l) => l.trim());
      let summary: any = {};
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === 'End') {
            summary = parsed.data;
            break;
          }
        } catch {
          // ignore non-JSON lines
        }
      }

      return {
        simulationId,
        virtualUsers,
        durationSeconds,
        success: true,
        metrics: {
          requestsPerSecond: summary.metrics?.http_reqs?.rate || 0,
          averageLatencyMs: summary.metrics?.http_req_duration?.avg || 0,
          p95LatencyMs: summary.metrics?.http_req_duration?.['p(95)'] || 0,
          p99LatencyMs: summary.metrics?.http_req_duration?.['p(99)'] || 0,
          errorRate: summary.metrics?.http_req_failed?.rate || 0,
        },
        durationMs: Date.now() - startTime,
      };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  } catch (e) {
    return {
      simulationId,
      virtualUsers,
      durationSeconds,
      success: false,
      error: e instanceof Error ? e.message : String(e),
      durationMs: Date.now() - startTime,
    };
  }
}
