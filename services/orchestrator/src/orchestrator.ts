/**
 * Simulation orchestrator (spec §6.4).
 * Manages the simulation state machine and coordinates execution workers.
 */

import { Queue, Worker, Job } from 'bullmq';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@crowdfest/database';
import { eq } from "drizzle-orm";
const t = schema as unknown as Record<string, any>;;
import { loadConfig } from '@crowdfest/config';
import { DEFAULT_LIMITS } from '@crowdfest/config';
import { validateDestination } from '@crowdfest/security';
import { WebSocketServer, WebSocket } from 'ws';

export type SimulationStatus =
  | 'draft'
  | 'validating'
  | 'awaiting_approval'
  | 'queued'
  | 'preparing_workers'
  | 'running'
  | 'stopping'
  | 'finalizing'
  | 'completed'
  | 'failed'
  | 'cancelled';

const VALID_TRANSITIONS: Record<SimulationStatus, SimulationStatus[]> = {
  draft: ['validating'],
  validating: ['awaiting_approval', 'failed'],
  awaiting_approval: ['queued', 'draft'],
  queued: ['preparing_workers', 'cancelled'],
  preparing_workers: ['running', 'failed'],
  running: ['stopping', 'completed', 'failed', 'cancelled'],
  stopping: ['finalizing', 'cancelled'],
  finalizing: ['completed', 'failed'],
  completed: [],
  failed: [],
  cancelled: [],
};

interface OrchestratorDeps {
  db: ReturnType<typeof drizzle>;
  wss: WebSocketServer;
}

export function createOrchestrator() {
  let config: ReturnType<typeof loadConfig>;
  let db: ReturnType<typeof drizzle>;
  let wss: WebSocketServer;
  let simulationQueue: Queue;
  let browserWorker: Worker;
  let httpWorker: Worker;
  let started = false;
  const clients = new Set<WebSocket>();

  async function start() {
    config = loadConfig();
    const pool = new Pool({ connectionString: config.databaseUrl });
    // drizzle strict column typing mismatches PgTableWithColumns; cast to any
    db = drizzle(pool, { schema: (schema as unknown as Record<string, any>) as any });

    simulationQueue = new Queue('crowdfest-simulation', {
      connection: { host: 'localhost', port: 6379 },
    });

    // Worker that processes simulation jobs
    browserWorker = new Worker(
      'crowdfest-browser',
      async (job: Job) => {
        return executeBrowserJob(job);
      },
      { connection: { host: 'localhost', port: 6379 } },
    );

    httpWorker = new Worker(
      'crowdfest-http',
      async (job: Job) => {
        return executeHttpJob(job);
      },
      { connection: { host: 'localhost', port: 6379 } },
    );

    started = true;
    console.log('[orchestrator] started');
  }

  async function stop() {
    started = false;
    await simulationQueue.close();
    await browserWorker.close();
    await httpWorker.close();
    console.log('[orchestrator] stopped');
  }

  async function broadcast(simulationId: string, payload: unknown) {
    const message = JSON.stringify({ type: 'simulation.update', simulationId, payload, timestamp: new Date().toISOString() });
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  async function setStatus(simulationId: string, status: SimulationStatus) {
    await db.update(t.simulations).set({ status, updatedAt: new Date() }).where(eq(t.simulations.id, simulationId));
    broadcast(simulationId, { status });
  }

  async function createSimulationEvent(simulationId: string, eventType: string, payload: Record<string, unknown>) {
    await db.insert(t.simulationEvents).values({
      simulationId,
      eventType,
      payload,
      timestamp: new Date(),
    });
    broadcast(simulationId, { eventType, payload, timestamp: new Date().toISOString() });
  }

  async function validateTarget(baseUrl: string): Promise<boolean> {
    const result = validateDestination(baseUrl);
    return result.valid;
  }

  async function transitionToQueued(simulationId: string) {
    const sim = await (db as any).query.simulations.findFirst({ where: eq(t.simulations.id, simulationId) });
    if (!sim) return;
    await setStatus(simulationId, 'queued');
    await simulationQueue.add('simulation.start', { simulationId }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
    await createSimulationEvent(simulationId, 'simulation.queued', {});
  }

  async function executeBrowserJob(job: Job) {
    const { simulationId, sessions, baseUrl, scenario } = job.data as any;
    await setStatus(simulationId, 'running');
    await createSimulationEvent(simulationId, 'browser.started', { sessions });
    // The actual Playwright execution is delegated to the browser-worker service.
    // Here we coordinate and record lifecycle.
    return { status: 'completed', sessions };
  }

  async function executeHttpJob(job: Job) {
    const { simulationId, virtualUsers, baseUrl, scenario } = job.data as any;
    await createSimulationEvent(simulationId, 'http.started', { virtualUsers });
    return { status: 'completed', virtualUsers };
  }

  return {
    start,
    stop,
    setStatus,
    broadcast,
    createSimulationEvent,
    validateTarget,
    transitionToQueued,
  };
}
