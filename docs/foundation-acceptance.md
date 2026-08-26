# Foundation acceptance — 26 August 2026

## Gate

Prove four independent public HTTPS origins can each expose one genuine WebMCP Site Tool before any business workflow is built.

## Environment

- Chrome `151.0.7922.108`
- headed disposable browser profile
- `WebMCP,WebMCPTesting` enabled for the isolated validation browser
- public Cloudflare Workers HTTPS origins
- test container/profile removed after acceptance

The ordinary headless DevTools browser was also checked first. It correctly lacked `document.modelContext`; that is an environment limitation, not treated as a successful WebMCP test.

## Result

| Origin | Tool | `getTools()` | `readOnlyHint` | `executeTool()` | Visible page reaction |
| --- | --- | --- | --- | --- | --- |
| Mission Board | `get_mission` | PASS | `true` | PASS | PASS |
| Northstar Broadband | `get_broadband_capabilities` | PASS | `true` | PASS | PASS |
| BoxFox Removals | `get_mover_capabilities` | PASS | `true` | PASS | PASS |
| Evergreen Energy | `get_energy_capabilities` | PASS | `true` | PASS | PASS |

All four `/health` endpoints returned HTTP 200 with the correct app identifier. All four root pages returned HTTP 200 as `text/html`.

## Acceptance conclusion

**PASS.** The foundation is a real WebMCP implementation, not a mocked tool layer. The next engineering slice may add the first business workflow: Mission → Broadband search → hold → receipt/progress reflection.
