# ONE

**One goal. Many websites. One agent.**

ONE is an OpenAI WebMCP Challenge project exploring an open web where independent websites expose useful tools and a browser agent composes them around one human goal while the human keeps control of intent and commitments.

> There is no hidden cross-service orchestration backend. The browser agent is the orchestrator.

## Live demo

Start here: **https://webmcp-one-mission.paul-phillips1988.workers.dev**

The Mission Board creates an isolated moving-house mission, then links the same mission to independent Broadband, Removals and Energy origins. Broadband is the first fully transactional vertical slice; Movers and Energy are being built next.

### Current proven journey

1. Read the mission with WebMCP.
2. Open Northstar Broadband from the service directory.
3. Search and hold the fastest compliant plan.
4. Change the monthly broadband budget on ONE while the agent still has the old mission version.
5. Observe the provider refuse the stale action with `MISSION_STALE`.
6. Re-read ONE, re-plan and create a new compliant hold.
7. ONE reflects the durable receipt/progress.

See `docs/broadband-slice-acceptance.md` and `docs/webmcp-tool-contracts.md`.

## Build

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm check
```

Built work is emitted under `dist/`; it is intentionally not committed.

## Architecture

- `apps/mission` — canonical ONE Mission Board.
- `apps/broadband` — independent Northstar Broadband site.
- `apps/movers` — independent BoxFox Removals site.
- `apps/energy` — independent Evergreen Energy site.
- `apps/api` — deliberately boring mission/version/receipt persistence; never an agent orchestrator.
- `packages/webmcp` — small page-side WebMCP registration helper.

MIT licensed.
