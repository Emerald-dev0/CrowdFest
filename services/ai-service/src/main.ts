import { runWorker } from './worker';

runWorker().catch((err: any) => {
  console.error('[ai-service] fatal', err);
  process.exit(1);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
