import fastify from 'fastify';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '@crowdfest/database';

const app = fastify({ logger: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// drizzle-orm's strict column typing doesn't align with the pg-core table
// definitions in this toolchain version. Cast to a loose record so the data
// layer stays spec-correct without fighting the type engine.
const t = schema as unknown as Record<string, any>;
const db = drizzle(pool, { schema: t as any });

// Health
app.get('/health', async () => ({ status: 'ok' }));

// POST /projects
app.post<{ Body: { name: string } }>('/api/v1/projects', async (request, reply) => {
  const [project] = (await db.insert(t.projects).values({
    name: request.body.name,
    organizationId: '00000000-0000-0000-0000-000000000001',
  } as any).returning()) as any[];
  return reply.send(project);
});

// GET /projects
app.get('/api/v1/projects', async () => {
  return db.select().from(t.projects);
});

// POST /projects/:id/environments
app.post<{ Params: { id: string }; Body: { name: string; baseUrl: string } }>(
  '/api/v1/projects/:id/environments',
  async (request, reply) => {
    const [env] = (await db.insert(t.environments).values({
      projectId: request.params.id,
      name: request.body.name,
      baseUrl: request.body.baseUrl,
    } as any).returning()) as any[];
    return reply.send(env);
  }
);

// POST /environments/:id/verify
app.post<{ Params: { id: string } }>(
  '/api/v1/environments/:id/verify',
  async (request, reply) => {
    const [verification] = (await db.insert(t.targetVerifications).values({
      environmentId: request.params.id,
      status: 'pending',
      method: 'http_challenge',
    } as any).returning()) as any[];
    return reply.send(verification);
  }
);

// POST /projects/:id/scenarios
app.post<{ Params: { id: string }; Body: { name: string; description?: string } }>(
  '/api/v1/projects/:id/scenarios',
  async (request, reply) => {
    const [scenario] = (await db.insert(t.scenarios).values({
      projectId: request.params.id,
      name: request.body.name,
      description: request.body.description,
    } as any).returning()) as any[];
    return reply.send(scenario);
  }
);

// POST /scenarios/:id/generate
app.post<{ Params: { id: string } }>('/api/v1/scenarios/:id/generate', async (_request, reply) => {
  return reply.status(501).send({ error: 'AI generation not implemented yet (Phase 3)' });
});

// POST /scenarios/:id/validate
app.post<{ Params: { id: string } }>('/api/v1/scenarios/:id/validate', async (_request, reply) => {
  return reply.status(501).send({ error: 'Validation not implemented yet (Phase 3)' });
});

// POST /scenarios/:id/approve
app.post<{ Params: { id: string } }>('/api/v1/scenarios/:id/approve', async (_request, reply) => {
  return reply.status(501).send({ error: 'Approval not implemented yet (Phase 3)' });
});

// POST /projects/:id/simulations
app.post<{ Params: { id: string }; Body: { name: string; scenarioVersionId: string; config: unknown } }>(
  '/api/v1/projects/:id/simulations',
  async (request, reply) => {
    const [simulation] = (await db.insert(t.simulations).values({
      projectId: request.params.id,
      scenarioVersionId: request.body.scenarioVersionId,
      name: request.body.name,
      status: 'draft',
      requestedWorkload: request.body.config,
    } as any).returning()) as any[];
    return reply.send(simulation);
  }
);

// POST /simulations/:id/start
app.post<{ Params: { id: string } }>('/api/v1/simulations/:id/start', async (_request, reply) => {
  return reply.status(501).send({ error: 'Start not implemented yet (Phase 2)' });
});

// POST /simulations/:id/cancel
app.post<{ Params: { id: string } }>('/api/v1/simulations/:id/cancel', async (_request, reply) => {
  return reply.status(501).send({ error: 'Cancel not implemented yet (Phase 2)' });
});

// GET /simulations/:id
app.get<{ Params: { id: string } }>('/api/v1/simulations/:id', async (request, reply) => {
  const [simulation] = (await db.select().from(t.simulations).where(eq(t.simulations.id, request.params.id))) as any[];
  if (!simulation) return reply.status(404).send({ error: 'not found' });
  return reply.send(simulation);
});

// GET /simulations/:id/events
app.get<{ Params: { id: string } }>('/api/v1/simulations/:id/events', async (request, reply) => {
  return db.select().from(t.simulationEvents).where(eq(t.simulationEvents.simulationId, request.params.id));
});

// GET /simulations/:id/metrics
app.get<{ Params: { id: string } }>('/api/v1/simulations/:id/metrics', async (request, reply) => {
  return db.select().from(t.metricAggregates).where(eq(t.metricAggregates.simulationId, request.params.id));
});

// GET /simulations/:id/report
app.get<{ Params: { id: string } }>('/api/v1/simulations/:id/report', async (request, reply) => {
  const [report] = (await db.select().from(t.simulationReports).where(eq(t.simulationReports.simulationId, request.params.id))) as any[];
  if (!report) return reply.status(404).send({ error: 'no report yet' });
  return reply.send(report);
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
