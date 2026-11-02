/**
 * Load worker entry point (spec §6.2).
 * k6 HTTP load generation.
 */

import { runWorker } from './worker';

runWorker().catch((err: any) => {
  console.error('[load-worker] fatal', err);
  process.exit(1);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
