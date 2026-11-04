import fastify from 'fastify';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '@crowdfest/database';
import { z } from 'zod';
import { Queue } from 'bullmq';
import { parseRedisUrl } from '@crowdfest/config';
import { validateDestination } from '@crowdfest/security';
import { scenarioPlanner, journeyBuilder, validationAgent, analysisAgent } from '@crowdfest/ai-service';
import {
  CreateProjectSchema,
  CreateEnvironmentSchema,
  CreateScenarioSchema,
  GenerateJourneySchema,
  ApproveScenarioSchema,
  CreateSimulationSchema,
  SimulationConfigSchema,
} from '@crowdfest/contracts';

const t = schema as unknown as Record<string, any>;

const app = fastify({ logger: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://crowdfest:crowdfest@localhost:5432/crowdfest',
});

const db = drizzle(pool, { schema: t as any });

const redis = parseRedisUrl(process.env.REDIS_URL || 'redis://localhost:6379');
const simulationQueue = new Queue('crowdfest-simulation', { connection: redis });

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function ensureDefaultOrg() {
  const rows = await db.select().from(t.organizations).where(eq(t.organizations.id, DEFAULT_ORG_ID));
  if (rows.length === 0) {
    await db.insert(t.organizations).values({ id: DEFAULT_ORG_ID, name: 'Default Organization', plan: 'free' } as any);
  }
}

app.addHook('onReady', async () => {
  await ensureDefaultOrg();
});

// Health
app.get('/health', async () => ({ status: 'ok', service: 'crowdfest-api' }));

// Projects
app.post<{ Body: { name: string } }>('/api/v1/projects', async (request, reply) => {
  const body = CreateProjectSchema.parse(request.body);
  const [project] = (await db.insert(t.projects).values({
    name: body.name,
    organizationId: DEFAULT_ORG_ID,
  } as any).returning()) as any[];
  return reply.send(project);
});

app.get('/api/v1/projects', async () => {
  return db.select().from(t.projects);
});

app.get<{ Params: { id: string } }>('/api/v1/projects/:id', async (request, reply) => {
  const [project] = (await db.select().from(t.projects).where(eq(t.projects.id, request.params.id))) as any[];
  if (!project) return reply.status(404).send({ error: 'not found' });
  return reply.send(project);
});

// Environments
app.post<{ Params: { id: string }; Body: { name: string; baseUrl: string } }>(
  '/api/v1/projects/:id/environments',
  async (request, reply) => {
    const body = CreateEnvironmentSchema.parse(request.body);
    const [env] = (await db.insert(t.environments).values({
      projectId: request.params.id,
      name: body.name,
      baseUrl: body.baseUrl,
    } as any).returning()) as any[];
    return reply.send(env);
  }
);

app.get<{ Params: { id: string } }>('/api/v1/projects/:id/environments', async (request) => {
  return db.select().from(t.environments).where(eq(t.environments.projectId, request.params.id));
});

// Target verification
app.post<{ Params: { id: string } }>(
  '/api/v1/environments/:id/verify',
  async (request, reply) => {
    const [env] = (await db.select().from(t.environments).where(eq(t.environments.id, request.params.id))) as any[];
    if (!env) return reply.status(404).send({ error: 'environment not found' });
    const check = validateDestination(env.baseUrl);
    const status = check.valid ? 'verified' : 'failed';
    const [verification] = (await db.insert(t.targetVerifications).values({
      environmentId: request.params.id,
      status,
      method: 'http_challenge',
      token: Math.random().toString(36).slice(2),
      verifiedAt: check.valid ? new Date() : null,
    } as any).returning()) as any[];
    if (check.valid) {
      await db.update(t.environments).set({ isVerified: 'true', updatedAt: new Date() }).where(eq(t.environments.id, request.params.id));
    }
    return reply.send({ ...verification, reason: check.reason });
  }
);

// Scenarios
app.post<{ Params: { id: string }; Body: { name: string; description?: string } }>(
  '/api/v1/projects/:id/scenarios',
  async (request, reply) => {
    const body = CreateScenarioSchema.parse({ projectId: request.params.id, ...request.body });
    const [scenario] = (await db.insert(t.scenarios).values({
      projectId: body.projectId,
      name: body.name,
      description: body.description,
    } as any).returning()) as any[];
    return reply.send(scenario);
  }
);

app.get<{ Params: { id: string } }>('/api/v1/projects/:id/scenarios', async (request) => {
  return db.select().from(t.scenarios).where(eq(t.scenarios.projectId, request.params.id));
});

// Generate journey (AI)
app.post<{ Params: { id: string }; Body: { description?: string } }>(
  '/api/v1/scenarios/:id/generate',
  async (request, reply) => {
    const [scenario] = (await db.select().from(t.scenarios).where(eq(t.scenarios.id, request.params.id))) as any[];
    if (!scenario) return reply.status(404).send({ error: 'scenario not found' });
    const description = request.body?.description || scenario.description || scenario.name;

    const plan = await scenarioPlanner.plan(description);
    const journey = plan.journeys[0];
    const definition = await journeyBuilder.build({
      name: journey?.name || scenario.name,
      description: journey?.description || description,
      executionType: journey?.executionType || 'browser+http',
      steps: journey?.steps || [],
      assertions: journey?.assertions || [],
    });
    const validation = await validationAgent.validate(definition);

    const [version] = (await db.insert(t.scenarioVersions).values({
      scenarioId: scenario.id,
      version: await nextVersion(scenario.id),
      definitionJson: { ...definition, personas: plan.personas },
      aiGenerated: 'true',
      approved: validation.approvedForExecution ? 'true' : 'false',
      approvedAt: validation.approvedForExecution ? new Date() : null,
    } as any).returning()) as any[];

    return reply.send({ scenario, version, plan, validation });
  }
);

async function nextVersion(scenarioId: string): Promise<number> {
  const rows = await db.select().from(t.scenarioVersions).where(eq(t.scenarioVersions.scenarioId, scenarioId));
  return rows.length + 1;
}

// Validate
app.post<{ Params: { id: string }; Body: { scenarioVersionId?: string; definition?: any } }>(
  '/api/v1/scenarios/:id/validate',
  async (request, reply) => {
    let definition = request.body?.definition;
    if (!definition && request.body?.scenarioVersionId) {
      const [v] = (await db.select().from(t.scenarioVersions).where(eq(t.scenarioVersions.id, request.body.scenarioVersionId))) as any[];
      definition = v?.definitionJson;
    }
    if (!definition) return reply.status(400).send({ error: 'definition or scenarioVersionId required' });
    const result = await validationAgent.validate(definition);
    return reply.send(result);
  }
);

// Approve
app.post<{ Params: { id: string }; Body: { scenarioVersionId: string } }>(
  '/api/v1/scenarios/:id/approve',
  async (request, reply) => {
    const body = ApproveScenarioSchema.parse({ scenarioVersionId: request.body.scenarioVersionId });
    await db.update(t.scenarioVersions).set({ approved: 'true', approvedAt: new Date() }).where(eq(t.scenarioVersions.id, body.scenarioVersionId));
    const [version] = (await db.select().from(t.scenarioVersions).where(eq(t.scenarioVersions.id, body.scenarioVersionId))) as any[];
    return reply.send(version);
  }
);

// Simulations list
app.get('/api/v1/simulations', async () => {
  return db.select().from(t.simulations);
});

// Create simulation
app.post<{ Params: { id: string }; Body: any }>(
  '/api/v1/projects/:id/simulations',
  async (request, reply) => {
    const body = CreateSimulationSchema.parse({ projectId: request.params.id, ...(request.body as any) });
    const [simulation] = (await db.insert(t.simulations).values({
      projectId: body.projectId,
      scenarioVersionId: body.scenarioVersionId,
      name: body.name,
      status: 'draft',
      requestedWorkload: body.config,
      environmentId: (request.body as any)?.environmentId || null,
      thresholdConfig: body.config?.thresholds || null,
    } as any).returning()) as any[];
    return reply.send(simulation);
  }
);

// Quick launch (all-in-one)
app.post('/api/v1/simulations/quick', async (request, reply) => {
  const body = (request.body as any) || {};
  const name = body.name || 'Quick simulation';
  const target = body.target;
  const description = body.description || name;
  const browserSessions = Number(body.browserSessions ?? 0);
  const virtualUsers = Number(body.virtualUsers ?? 0);
  const durationSeconds = Number(body.durationSeconds ?? 120);

  if (!target) return reply.status(400).send({ error: 'target required' });
  const check = validateDestination(target);
  if (!check.valid) return reply.status(400).send({ error: check.reason });

  await ensureDefaultOrg();
  const [project] = (await db.insert(t.projects).values({ name, organizationId: DEFAULT_ORG_ID } as any).returning()) as any[];
  const [env] = (await db.insert(t.environments).values({ projectId: project.id, name: 'default', baseUrl: target, isVerified: 'true' } as any).returning()) as any[];
  const [scenario] = (await db.insert(t.scenarios).values({ projectId: project.id, name, description } as any).returning()) as any[];

  const plan = await scenarioPlanner.plan(description);
  const journey = plan.journeys[0];
  const definition = await journeyBuilder.build({
    name: journey?.name || name,
    description: journey?.description || description,
    executionType: journey?.executionType || 'browser+http',
    steps: journey?.steps || [],
    assertions: journey?.assertions || [],
  });
  const validation = await validationAgent.validate(definition);

  const [version] = (await db.insert(t.scenarioVersions).values({
    scenarioId: scenario.id,
    version: 1,
    definitionJson: { ...definition, personas: plan.personas },
    aiGenerated: 'true',
    approved: 'true',
    approvedAt: new Date(),
  } as any).returning()) as any[];

  const config = {
    name,
    target,
    engines: {
      browser: { enabled: browserSessions > 0, sessions: browserSessions },
      http: { enabled: virtualUsers > 0, virtualUsers },
    },
    workload: { model: 'closed', durationSeconds, rampUpSeconds: 10 },
    thresholds: { p95LatencyMs: 500, errorRatePercent: 5 },
  };

  const [simulation] = (await db.insert(t.simulations).values({
    projectId: project.id,
    scenarioVersionId: version.id,
    name,
    status: 'queued',
    requestedWorkload: config,
    approvedWorkload: config,
    environmentId: env.id,
    thresholdConfig: config.thresholds,
  } as any).returning()) as any[];

  await simulationQueue.add('simulation.run', { simulationId: simulation.id }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

  return reply.send({ simulation, project, environment: env, scenario, version, validation });
});

// Start
app.post<{ Params: { id: string } }>('/api/v1/simulations/:id/start', async (request, reply) => {
  const [sim] = (await db.select().from(t.simulations).where(eq(t.simulations.id, request.params.id))) as any[];
  if (!sim) return reply.status(404).send({ error: 'not found' });
  await db.update(t.simulations).set({ status: 'queued', updatedAt: new Date() }).where(eq(t.simulations.id, request.params.id));
  await simulationQueue.add('simulation.run', { simulationId: request.params.id }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
  return reply.send({ status: 'queued' });
});

// Cancel
app.post<{ Params: { id: string } }>('/api/v1/simulations/:id/cancel', async (request, reply) => {
  await db.update(t.simulations).set({ status: 'cancelled', updatedAt: new Date(), endedAt: new Date() }).where(eq(t.simulations.id, request.params.id));
  return reply.send({ status: 'cancelled' });
});

// Get simulation
app.get<{ Params: { id: string } }>('/api/v1/simulations/:id', async (request, reply) => {
  const [simulation] = (await db.select().from(t.simulations).where(eq(t.simulations.id, request.params.id))) as any[];
  if (!simulation) return reply.status(404).send({ error: 'not found' });
  return reply.send(simulation);
});

// Events
app.get<{ Params: { id: string } }>('/api/v1/simulations/:id/events', async (request) => {
  return db.select().from(t.simulationEvents).where(eq(t.simulationEvents.simulationId, request.params.id));
});

// Metrics
app.get<{ Params: { id: string } }>('/api/v1/simulations/:id/metrics', async (request) => {
  return db.select().from(t.metricAggregates).where(eq(t.metricAggregates.simulationId, request.params.id));
});

// Report
app.get<{ Params: { id: string } }>('/api/v1/simulations/:id/report', async (request, reply) => {
  const [report] = (await db.select().from(t.simulationReports).where(eq(t.simulationReports.simulationId, request.params.id))) as any[];
  if (!report) return reply.status(404).send({ error: 'no report yet' });
  return reply.send(report);
});

// Analyze (AI) - optional endpoint
app.post<{ Body: { result: any } }>('/api/v1/analyze', async (request) => {
  return analysisAgent.analyze(request.body.result);
});

const port = Number(process.env.PORT) || 3001;
const host = '0.0.0.0';

app.listen({ port, host }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`CrowdFest API listening on http://${host}:${port}`);
});

process.on('SIGTERM', async () => {
  await simulationQueue.close();
  await pool.end();
  process.exit(0);
});
