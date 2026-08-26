# Judge runbook

## Start

Open the canonical Mission Board:

`https://webmcp-one-mission.paul-phillips1988.workers.dev`

Opening ONE creates an isolated moving-house mission. Provider links and `get_service_directory()` carry that mission ID across the independent origins.

Suggested instruction to the browser agent:

> Complete this move using the websites in ONE. Stay inside my rules. Prepare everything first and do not confirm any commitment until I explicitly approve it in ONE. If something changes, recover without asking me to restart.

## Expected journey

1. `get_mission()` reads v1 and service URLs.
2. Northstar search recommends Gigabit at £34 inside the original £35/month rule; hold it.
3. Human lowers broadband max £35 → £30 in ONE. Mission becomes v2. The v1 broadband resource shows `Needs re-plan`; an old v1 stateful call returns `MISSION_STALE`. Northstar refreshes its visible requirements to v2 in-place — no page reload is needed.
4. Agent re-reads ONE, re-searches Northstar in the same tab and holds 500 Mbps at £27 against v2.
5. BoxFox quotes £289 / £319 / £342 against v2. First attempt to hold £289 returns `SLOT_NO_LONGER_AVAILABLE`; choose £319.
6. Evergreen compares annual cost at v2 and recommends a 100% renewable tariff when its premium fits the £100/year rule; prepare it.
7. ONE shows all three current-version prepared resources, receipts and data categories.
8. Before approval, any `confirm_*` tool returns `APPROVAL_REQUIRED`.
9. Human presses **Approve prepared plan** on ONE.
10. Agent confirms all three simulated commitments with the approval token from `get_progress()`.
11. ONE shows all three Complete.

## Human-override variant

The primary judge journey already demonstrates this safely before Movers/Energy are prepared. If the human edits again later, every provider resource and approval from the previous mission version becomes stale and must be re-planned.

## Important

All commitments are simulated. No real purchase, booking or energy switch occurs.
