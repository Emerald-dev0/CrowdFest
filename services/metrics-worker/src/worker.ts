/**
 * Metrics worker (spec §7.4).
 * Collects raw metrics from the execution pipeline, aggregates into time
 * windows, and persists summaries to PostgreSQL.
 */

import { Queue, Worker } from 'bullmq';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@crowdfest/database';
import { eq } from 'drizzle-orm';
import { loadConfig, parseRedisUrl } from '@crowdfest/config';

interface AggregateJob {
  simulationId: string;
  metrics: Array<{ name: string; value: number; timestamp: Date }>;
  windowSeconds: number;
}

export async function runWorker() {
  const config = loadConfig();
  const pool = new Pool({ connectionString: config.databaseUrl });
  const db = drizzle(pool, { schema });

  const queue = new Queue('crowdfest-metrics', {
    connection: parseRedisUrl(config.redisUrl),
  });

  const worker = new Worker(
    'crowdfest-metrics',
    async (job) => {
      const data = job.data as AggregateJob;
      return aggregateMetrics(data, db);
    },
    { connection: parseRedisUrl(config.redisUrl), concurrency: 10 },
  );

  console.log('[metrics-worker] started');

  process.on('SIGTERM', async () => {
    await worker.close();
    await queue.close();
    await pool.end();
    process.exit(0);
  });
}

async function aggregateMetrics(data: AggregateJob, db: any) {
  const { simulationId, metrics, windowSeconds } = data;
  const rows = metrics.map((m) => ({
    simulationId,
    metricName: m.name,
    timeBucket: new Date(Math.floor(m.timestamp.getTime() / (windowSeconds * 1000)) * (windowSeconds * 1000)),
    value: m.value,
  }));

  if (rows.length > 0) {
    await db.insert(schema.metricAggregates).values(rows);
  }

  return { aggregated: rows.length };
}
