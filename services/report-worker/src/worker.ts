/**
 * Report worker (spec §11.1, §11.2).
 * Generates executive summary, performance, user journeys, and failure
 * analysis sections from simulation results.
 */

import { Queue, Worker } from 'bullmq';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@crowdfest/database';
import { eq } from "drizzle-orm";
const t = schema as unknown as Record<string, any>;;
import { loadConfig } from '@crowdfest/config';

interface ReportJob {
  simulationId: string;
}

export async function runWorker() {
  const config = loadConfig();
  const pool = new Pool({ connectionString: config.databaseUrl });
  // drizzle strict column typing mismatches PgTableWithColumns; cast to any
  const db = drizzle(pool, { schema: (schema as unknown as Record<string, any>) as any });

  const queue = new Queue('crowdfest-reports', {
    connection: { host: 'localhost', port: 6379 },
  });

  const worker = new Worker(
    'crowdfest-reports',
    async (job) => {
      const data = job.data as ReportJob;
      return generateReport(data, db);
    },
    { connection: { host: 'localhost', port: 6379 }, concurrency: 5 },
  );

  console.log('[report-worker] started');

  process.on('SIGTERM', async () => {
    await worker.close();
    await queue.close();
    await pool.end();
    process.exit(0);
  });
}

async function generateReport(data: ReportJob, db: any) {
  const { simulationId } = data;

  const [simulation] = await db
    .select()
    .from(t.simulations)
    .where(eq(t.simulations.id, simulationId));

  const events = await db
    .select()
    .from(t.simulationEvents)
    .where(eq(t.simulationEvents.simulationId, simulationId));

  const metrics = await db
    .select()
    .from(t.metricAggregates)
    .where(eq(t.metricAggregates.simulationId, simulationId));

  const report = {
    simulationId,
    generatedAt: new Date().toISOString(),
    status: simulation.status,
    executiveSummary: {
      duration: simulation.startedAt && simulation.endedAt
        ? new Date(simulation.endedAt).getTime() - new Date(simulation.startedAt).getTime()
        : 0,
      testedWorkload: simulation.approvedWorkload || {},
      overallResult: simulation.status === 'completed' ? 'passed' : simulation.status === 'failed' ? 'failed' : 'unknown',
    },
    performance: computePerformance(metrics),
    userJourneys: computeJourneys(events),
    failureAnalysis: computeFailures(events),
  };

  await db.insert(t.simulationReports).values({
    simulationId,
    reportJson: report,
    storageKey: `reports/${simulationId}.json`,
  });

  return report;
}

function computePerformance(metrics: any[]) {
  const byName: Record<string, number[]> = {};
  for (const m of metrics) {
    if (!byName[m.metricName]) byName[m.metricName] = [];
    byName[m.metricName].push(m.value);
  }
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const pct = (arr: number[], p: number) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * s.length) - 1;
    return s[Math.max(0, Math.min(idx, s.length - 1))];
  };
  return {
    averageLatencyMs: avg(byName['p95_latency_ms'] || []),
    p50Ms: pct(byName['p50_latency_ms'] || [], 50),
    p90Ms: pct(byName['p90_latency_ms'] || [], 90),
    p95Ms: pct(byName['p95_latency_ms'] || [], 95),
    p99Ms: pct(byName['p99_latency_ms'] || [], 99),
    throughput: avg(byName['requests_per_second'] || []),
    errorRate: avg(byName['error_rate'] || []),
  };
}

function computeJourneys(events: any[]) {
  const completed = events.filter((e) => e.eventType?.includes('completed')).length;
  const failed = events.filter((e) => e.eventType?.includes('error')).length;
  return {
    total: completed + failed,
    successful: completed,
    failed,
    successRate: (completed + failed) ? completed / (completed + failed) * 100 : 0,
  };
}

function computeFailures(events: any[]) {
  return events
    .filter((e) => e.eventType?.includes('error'))
    .map((e) => ({
      timestamp: e.timestamp,
      category: e.payload?.error?.category || 'unknown',
      message: e.payload?.error?.message || String(e.payload),
    }));
}
