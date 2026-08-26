# Build and deployment

## Deterministic build

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm check
```

Outputs:
- `dist/mission/worker.js`
- `dist/broadband/worker.js`
- `dist/movers/worker.js`
- `dist/energy/worker.js`
- `dist/api/worker.mjs`

The API's canonical D1 schema is `apps/api/schema.sql`.

## Local API integration test

Create a Wrangler config with a `DB` D1 binding, initialise a local D1 database from `apps/api/schema.sql`, run `dist/api/worker.mjs` locally and then:

```bash
ONE_API_URL=http://127.0.0.1:8790 pnpm test:api
```

This exercises failure recovery, approval gating, all three simulated confirmations and stale-state invalidation.

## Production principle

Production deployment must use the exact built artifacts. After deployment, compare SHA-256 of the deployed script with the local artifact where the deployment surface permits it. Do not hand-reconstruct functional source.

The API Worker requires a D1 binding named `DB`. Provider Workers are service-worker syntax and require no secrets.
