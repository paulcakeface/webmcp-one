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

The integration suite exercises origin/scoped-read enforcement, hard mission constraints, exact-resource approvals, expiry, failure recovery, all three simulated confirmations and stale/partial-recovery state.

## Deploying a fork to Cloudflare

The checked-in `wrangler.*.jsonc` files are the **production reference configuration for the submitted live deployment** and therefore contain the entrant's Cloudflare account ID and D1 database ID. They are not secrets, but a fork should replace them with its own resources.

1. Authenticate Wrangler to your Cloudflare account.
2. Create a D1 database, for example:

```bash
npx wrangler d1 create webmcp-one-demo
```

3. Put the returned account/database identifiers into your fork of `wrangler.api.jsonc`. Remove or replace the production `account_id` values in all five Wrangler configs.
4. Initialise the database from the canonical schema:

```bash
npx wrangler d1 execute webmcp-one-demo --remote --file=apps/api/schema.sql
```

5. Build and check from the lockfile:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm check
```

6. Deploy the API first, then the four browser sites:

```bash
npx wrangler deploy --config wrangler.api.jsonc
npx wrangler deploy --config wrangler.broadband.jsonc
npx wrangler deploy --config wrangler.movers.jsonc
npx wrangler deploy --config wrangler.energy.jsonc
npx wrangler deploy --config wrangler.mission.jsonc
```

A fork using different Worker hostnames must also replace the submitted production URLs in the app/API source before building, because origin scoping is intentionally explicit.

## Production principle

Production deployment must use the exact built artifacts. After deployment, compare SHA-256 of the deployed script with the local artifact where the deployment surface permits it. Do not hand-reconstruct functional source.

The API Worker requires a D1 binding named `DB`. Provider Workers require no secrets.
