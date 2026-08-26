# WebMCP tool contracts

## ONE Mission Board

- `get_mission()` — read-only. Returns the live mission ID/version, human goal, constraints, approval policy and provider URLs.
- `get_service_directory()` — read-only. Returns the independent top-level provider URLs carrying the current mission ID.
- `get_progress()` — read-only. Returns durable provider state and receipts for the mission.

## Northstar Broadband

- `search_broadband_plans(minimum_mbps, max_monthly_gbp)` — read-only. Filters Northstar's own catalogue against both hard constraints and ranks the fastest compliant plan first. The same domain function powers the normal human Search button.
- `hold_broadband_plan(mission_id, mission_version, plan_id)` — reversible state change. Creates a 15-minute D1-backed hold and receipt. If the human has changed the mission since the agent planned the action, it returns `MISSION_STALE` and performs no state change.

## State boundary

The state API stores mission/version/holds/receipts. It does not pick providers, compare providers, recommend plans or call WebMCP tools. Cross-site orchestration belongs to the browser agent.
