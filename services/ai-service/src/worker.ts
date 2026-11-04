/**
 * AI service worker entry point.
 * Processes AI jobs: scenario generation, journey validation, result analysis.
 */

import { Queue, Worker } from 'bullmq';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@crowdfest/database';
import { eq } from 'drizzle-orm';
import { loadConfig, parseRedisUrl } from '@crowdfest/config';
import { scenarioPlanner } from './planner';
import { journeyBuilder } from './journey-builder';
import { validationAgent } from './validation-agent';
import { analysisAgent } from './analysis-agent';

interface GenerateJob {
  scenarioId: string;
  description: string;
}

interface ValidateJob {
  scenarioVersionId: string;
  definition: any;
}

interface AnalyzeJob {
  simulationId: string;
  result: any;
}

export async function runWorker() {
  const config = loadConfig();
  const pool = new Pool({ connectionString: config.databaseUrl });
  const db = drizzle(pool, { schema });

  const queue = new Queue('crowdfest-ai', {
    connection: parseRedisUrl(config.redisUrl),
  });

  const worker = new Worker(
    'crowdfest-ai',
    async (job) => {
      switch (job.name) {
        case 'ai.generate':
          return handleGenerate(job.data as GenerateJob, db);
        case 'ai.validate':
          return handleValidate(job.data as ValidateJob, db);
        case 'ai.analyze':
          return handleAnalyze(job.data as AnalyzeJob, db);
        default:
          throw new Error(`Unknown AI job: ${job.name}`);
      }
    },
    { connection: parseRedisUrl(config.redisUrl), concurrency: 5 },
  );

  console.log('[ai-service] started');

  process.on('SIGTERM', async () => {
    await worker.close();
    await queue.close();
    await pool.end();
    process.exit(0);
  });
}

async function handleGenerate(data: GenerateJob, db: any) {
  const plan = await scenarioPlanner.plan(data.description);
  // Store generated scenario version
  await db.insert(schema.scenarioVersions).values({
    scenarioId: data.scenarioId,
    version: 1,
    definitionJson: plan,
    aiGenerated: 'true',
    approved: 'false',
    createdAt: new Date(),
  });
  return { plan };
}

async function handleValidate(data: ValidateJob, db: any) {
  const result = await validationAgent.validate(data.definition);
  return result;
}

async function handleAnalyze(data: AnalyzeJob, db: any) {
  const analysis = analysisAgent.analyze(data.result);
  return analysis;
}
