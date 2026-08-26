# Judge runbook

## Start

Open the canonical Mission Board:

`https://webmcp-one-mission.paul-phillips1988.workers.dev`

Opening ONE creates an isolated moving-house mission. Provider links and `get_service_directory()` carry that mission ID across the independent origins.

Suggested instruction to the browser agent:

> Complete this move using the websites in ONE. Stay inside my rules. Prepare everything first and do not confirm any commitment until I explicitly approve it in ONE. If something changes, recover without asking me to restart.

## Expected journey

1. `get_mission()` reads v1 and service URLs.
2. Northstar search recommends the fastest broadband inside £35/month; hold it.
3. BoxFox quotes £289 / £319 / £342. First attempt to hold £289 returns `SLOT_NO_LONGER_AVAILABLE`; choose £319.
4. Evergreen compares annual cost and recommends a 100% renewable tariff when its premium fits the £100/year rule; prepare it.
5. ONE shows all three prepared resources, receipts and data categories.
6. Before approval, any `confirm_*` tool returns `APPROVAL_REQUIRED`.
7. Human presses **Approve prepared plan** on ONE.
8. Agent confirms all three simulated commitments with the approval token from `get_progress()`.
9. ONE shows all three Complete.

## Human-override variant

After the agent searches/holds broadband at v1, lower broadband max from £35 to £30 on ONE. Mission becomes v2. An old stateful action returns `MISSION_STALE`; existing v1 provider resources show `Needs re-plan`; previous approval would become stale. Re-read ONE and re-plan current-version resources.

## Important

All commitments are simulated. No real purchase, booking or energy switch occurs.
