# Full production WebMCP acceptance — 27 Aug 2026

**PASS.**

The complete judge choreography passed against the public production deployment in a disposable **headed Chrome 151.0.7922.108** instance with `WebMCP,WebMCPTesting` enabled. The browser used a fresh temporary profile and did not touch the persistent personal browser.

## What was exercised through WebMCP

All provider actions below were invoked with `document.modelContext.getTools()` / `document.modelContext.executeTool()` on the provider's own top-level page. The two human actions were performed through the ordinary ONE UI.

1. ONE `get_mission()` read v1 with a £35 broadband budget and all three provider URLs.
2. Northstar `search_broadband_plans` recommended 1 Gbps at £34; `hold_broadband_plan` created the v1 reversible hold.
3. Human moved the ONE broadband slider to £30 and pressed **Update mission**. Mission became v2.
4. An old v1 Northstar stateful call returned `MISSION_STALE` and made no state change.
5. Northstar refreshed its visible live requirements to v2 **in the same tab without reload**.
6. v2 Northstar search returned only the compliant 500 Mbps £27 plan; the v2 hold succeeded.
7. BoxFox `quote_move` recommended 10:30 at £289.
8. First hold of that slot returned deterministic `SLOT_NO_LONGER_AVAILABLE`.
9. Re-quote omitted the lost slot and recommended 11:00 at £319; fallback hold succeeded.
10. Evergreen `compare_energy_tariffs` at 3,100 kWh/year recommended 100% renewable **Eco Flex** within the £100/year green-premium rule.
11. `prepare_energy_switch` created a reversible preparation only.
12. A provider confirmation attempted before approval returned `APPROVAL_REQUIRED`.
13. ONE `get_progress()` showed Broadband held, Movers held and Energy prepared.
14. Human pressed **Approve prepared plan** in ONE; approval was bound to mission v2.
15. Northstar, BoxFox and Evergreen `confirm_*` tools each completed their simulated commitment using the approval token.
16. ONE reported all three services **Complete ✓**.
17. The visible data-sharing ledger listed all three providers and only task data used.
18. The mission ledger preserved both the BoxFox failure and successful recovery.

## Tool annotations observed

- ONE read tools: `readOnlyHint:true`.
- Northstar search: `readOnlyHint:true`.
- Northstar hold/confirm: state-changing (`readOnlyHint` not true).
- Equivalent read/write separation is implemented for BoxFox and Evergreen.

## Accepted artefact hashes

Production release before the in-place Northstar stale-refresh hardening:

- Mission: `3a1101c9334c195dc5470c8dd2d33a8857aee9316558521131e0cd2a288e28d2`
- Movers: `734df2103b24e8732989ff8a48841174cdc4d1088968e896c04d1d86221f019a`
- Energy: `f5d9becfdbc7e2fb8e5bd5e0bf1a291e6da6ed1cc8d05d0d604007d82c7c8084`
- API: `b7a8540d242e573d776114ab7d892f83164c3e45380ff0e5a9b076b06d92f67b`

Northstar was then hardened based on the real-browser acceptance finding and re-deployed from an exact hash-gated artefact:

- Broadband: `a9adc1fd0a45bbd2a369d307dc511b66d2fa2f5783459187c6988709989c6603`

The full headed judge flow above passed **after** that Northstar deployment.

## Browser quirk found and handled

Chrome's experimental WebMCP testing surface can take longer than 20 seconds to appear on newly created automation tabs, and a reload of a previously executed provider tab did not reliably re-register the experimental surface. This is a browser-testing limitation, not an application-state failure.

The product was improved rather than working around it in the judge script: on `MISSION_STALE`, Northstar now re-reads the live mission and redraws its visible v2 requirements in the same page while preserving its already-registered Site Tools. That is also a better human+agent experience.

## Outcome

The production product now proves the full thesis: one human goal is composed across independent WebMCP-native websites, the human can change intent mid-flight, provider reality can change, stale actions are refused, the agent can recover, commitments remain behind explicit human approval, and the Mission Board keeps the whole journey inspectable.
