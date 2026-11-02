# Contributing

## Development setup

```bash
# Clone the repo
git clone https://github.com/Emerald-dev0/CrowdFest.git
cd CrowdFest

# Install dependencies
npm install

# Start datastore
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Push the database schema
npm run db:push  # (add script) or run drizzle-kit push per package

# Run API
cd apps/api && DATABASE_URL=... REDIS_URL=... npm run dev

# Run web
cd apps/web && npm run dev
```

## Project structure

- `apps/` — deployable applications (web dashboard, API, CLI)
- `services/` — long-running workers (orchestrator, browser, load, AI, metrics, report)
- `packages/` — shared libraries (contracts, database, scenario-dsl, compiler, SDK, metrics, config, security)
- `infrastructure/` — Docker, docker-compose, monitoring
- `docs/` — architecture and product documentation

## Type checking

```bash
# From repo root
npx tsc --noEmit -p packages/database/tsconfig.json
npx tsc --noEmit -p packages/contracts/tsconfig.json
npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
```

## Submitting changes

1. Create a feature branch from `main`.
2. Make your changes with tests.
3. Ensure TypeScript passes.
4. Open a pull request against `main`.

## License

MIT
