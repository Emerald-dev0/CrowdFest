import test from 'node:test';
import assert from 'node:assert/strict';
import { CreateProjectSchema, SimulationConfigSchema } from '../packages/contracts/dist/index.js';

test('CreateProjectSchema validates', () => {
  const r = CreateProjectSchema.safeParse({ name: 'Demo' });
  assert.equal(r.success, true);
  const bad = CreateProjectSchema.safeParse({ name: '' });
  assert.equal(bad.success, false);
});

test('SimulationConfigSchema validates', () => {
  const cfg = {
    name: 't',
    target: 'https://example.com',
    engines: { browser: { enabled: true, sessions: 2 }, http: { enabled: true, virtualUsers: 10 } },
    workload: { model: 'closed', durationSeconds: 60 },
    thresholds: { p95LatencyMs: 500, errorRatePercent: 5 },
  };
  const r = SimulationConfigSchema.safeParse(cfg);
  assert.equal(r.success, true);
});
