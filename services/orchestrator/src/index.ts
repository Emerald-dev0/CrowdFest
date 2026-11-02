/**
 * Orchestrator entry point (spec §4.1).
 * Simulation coordination, state machine, worker assignment, workload enforcement.
 */

import { createOrchestrator } from './orchestrator';

const orchestrator = createOrchestrator();

orchestrator.start().catch((err: any) => {
  console.error('Orchestrator failed to start', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await orchestrator.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await orchestrator.stop();
  process.exit(0);
});
