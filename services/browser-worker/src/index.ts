/**
 * Browser worker entry point (spec §6.1).
 * Playwright real-browser execution with isolated contexts.
 */

import { runWorker } from './worker';

runWorker().catch((err: any) => {
  console.error('[browser-worker] fatal', err);
  process.exit(1);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
