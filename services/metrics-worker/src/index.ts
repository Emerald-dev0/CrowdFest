/**
 * Metrics worker entry point (spec §7.4, §11).
 * Aggregates raw execution events into time-windowed metric summaries.
 */

import { runWorker } from './worker';

runWorker().catch((err: any) => {
  console.error('[metrics-worker] fatal', err);
  process.exit(1);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
