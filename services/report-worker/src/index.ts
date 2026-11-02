/**
 * Report worker entry point (spec §11).
 * Generates performance reports from simulation results.
 */

import { runWorker } from './worker';

runWorker().catch((err: any) => {
  console.error('[report-worker] fatal', err);
  process.exit(1);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
