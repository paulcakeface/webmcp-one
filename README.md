# ONE

## One goal. Many websites. One agent.

ONE is an OpenAI WebMCP Challenge project exploring a web where independent sites expose useful tools and the browser agent composes them around a human goal — while the human keeps control of intent, data sharing and commitment.

> **There is no hidden cross-service orchestration backend. The browser agent is the orchestrator.**

## Canonical demo

Start at the ONE Mission Board:

**https://webmcp-one-mission.paul-phillips1988.workers.dev**

**Production acceptance:** the complete four-tab headed Chrome 151 WebMCP judge flow passed on 27 Aug 2026, including human override, stale-intent recovery, provider failure recovery, approval gating and all three simulated confirmations. See [`docs/full-production-webmcp-acceptance.md`](docs/full-production-webmcp-acceptance.md).

The demo mission is moving house. ONE creates an isolated mission and connects it to three independent top-level sites:

- **Northstar Broadband** — search, reversible hold, simulated confirmation.
- **BoxFox Removals** — quote, deterministic disappearing-slot recovery, reversible hold, simulated confirmation.
- **Evergreen Energy** — annual-cost comparison, renewable-premium reasoning, reversible switch preparation, simulated confirmation.

Every provider page works normally for a human and exposes WebMCP Site Tools backed by the same domain functions/state.

## The two key collaboration moments

### 1. The human changes intent while the agent works

The agent may plan against mission v1. If the human changes a constraint in ONE, `missionVersion` increments. Old stateful actions return `MISSION_STALE`; old resources and approvals become stale; the agent must re-read ONE and re-plan.

### 2. The world changes under the agent

BoxFox initially offers 10:30 at £289. The first hold attempt deterministically loses that slot for the mission and returns `SLOT_NO_LONGER_AVAILABLE`. Later quotes omit it. The agent should recover by selecting the £319 fallback without asking the human to restart.

## Human approval is enforced

Search, holds and preparation are reversible. Provider `confirm_*` tools cannot cross the commitment boundary until the human presses **Approve prepared plan** in ONE.

That creates a random approval token bound to the exact current mission version. Confirmations check:

1. current mission version;
2. provider resource version;
3. human approval version/token.

Before approval they return `APPROVAL_REQUIRED`. Any later human edit invalidates the approval automatically. All commitments are simulated — no real purchase, booking or energy switch occurs.

## WebMCP tools

| Site | Tools |
|---|---|
| ONE | `get_mission`, `get_service_directory`, `get_progress` |
| Northstar | `search_broadband_plans`, `hold_broadband_plan`, `confirm_broadband_order` |
| BoxFox | `quote_move`, `hold_moving_slot`, `confirm_moving_booking` |
| Evergreen | `compare_energy_tariffs`, `prepare_energy_switch`, `confirm_energy_switch` |

See [`docs/webmcp-tool-contracts.md`](docs/webmcp-tool-contracts.md).

## Build

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm check
```

Build output is emitted under `dist/` and is intentionally not committed.

The canonical D1 schema lives at `apps/api/schema.sql`.

## Integration acceptance

The state API can be run locally in Wrangler with a local D1 binding. Then:

```bash
ONE_API_URL=http://127.0.0.1:8790 pnpm test:api
```

The integration test covers session isolation, broadband hold, BoxFox slot loss + recovery, energy preparation, denial before approval, human approval, all three confirmations, mission edit, stale resources/approval and refusal to re-approve old resources.

## Architecture

```text
Human
  ↕
ONE Mission Board ←→ state-only D1 API
  ↕
Browser Agent
  ↕
Northstar    BoxFox    Evergreen
WebMCP       WebMCP    WebMCP
```

The D1 API stores state and receipts. It never searches a provider, picks a provider result or invokes a WebMCP tool.

## Judge/reviewer docs

- [`docs/judge-runbook.md`](docs/judge-runbook.md)
- [`docs/webmcp-tool-contracts.md`](docs/webmcp-tool-contracts.md)
- [`docs/threat-model.md`](docs/threat-model.md)
- [`docs/demo-script.md`](docs/demo-script.md)
- [`docs/deployment.md`](docs/deployment.md)
- [`docs/prior-art.md`](docs/prior-art.md)

MIT licensed.
