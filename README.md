# ONE

**One goal. Many websites. One agent.**

ONE is an OpenAI WebMCP Challenge project exploring what happens when independent websites expose useful WebMCP tools and a browser agent composes them around one human goal.

The primary demo is **moving house** across a Mission Board plus independent broadband, removals and energy websites.

> There is no hidden cross-service orchestration backend. The browser agent is the orchestrator.

## Live foundation

| Origin | URL | Foundation tool |
| --- | --- | --- |
| Mission Board | https://webmcp-one-mission.paul-phillips1988.workers.dev | `get_mission` |
| Northstar Broadband | https://webmcp-one-broadband.paul-phillips1988.workers.dev | `get_broadband_capabilities` |
| BoxFox Removals | https://webmcp-one-movers.paul-phillips1988.workers.dev | `get_mover_capabilities` |
| Evergreen Energy | https://webmcp-one-energy.paul-phillips1988.workers.dev | `get_energy_capabilities` |

All four are separate secure origins. Each registers its own read-only WebMCP tool and visibly reflects tool execution on the page.

WebMCP is currently experimental in Chrome. Local validation uses a headed Chrome with `WebMCP,WebMCPTesting` enabled; normal headless Chrome deliberately reports the API as unavailable.

## Build

```bash
pnpm install
pnpm build
pnpm check
```

See [`docs/foundation-acceptance.md`](docs/foundation-acceptance.md) for the verified browser acceptance evidence and [`docs/prior-art.md`](docs/prior-art.md) for the project's novelty boundary.
