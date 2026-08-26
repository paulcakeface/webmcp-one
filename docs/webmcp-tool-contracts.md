# WebMCP tool contracts

ONE deliberately keeps tools page-scoped. The browser agent moves between independent top-level origins; no backend calls another provider on the agent's behalf.

## ONE Mission Board

### `get_mission()` — read-only
Returns the current mission ID/version, route/date, human constraints, approval policy and service directory. Re-read after a human changes the mission.

### `get_service_directory()` — read-only
Returns mission-scoped top-level URLs for Northstar Broadband, BoxFox Removals and Evergreen Energy.

### `get_progress()` — read-only
Returns provider states, receipts, unavailable inventory and current approval state/token when the human has approved the exact current mission version.

## Northstar Broadband

### `search_broadband_plans(minimum_mbps, max_monthly_gbp)` — read-only
Filters Northstar's own catalogue. Hard constraints are never silently exceeded. Ranking is fastest compliant plan first, then price/contract tie-breaks.

### `hold_broadband_plan(mission_id, mission_version, plan_id)` — reversible state change
Creates a 15-minute hold plus receipt. A stale mission version returns `MISSION_STALE` with no state change.

### `confirm_broadband_order(mission_id, mission_version, hold_id, approval_token)` — simulated commitment
Only succeeds when the hold and ONE human approval both belong to the current mission version. Otherwise returns `APPROVAL_REQUIRED`, `MISSION_STALE` or `RESOURCE_STALE`.

## BoxFox Removals

### `quote_move(earliest_time, max_price_gbp)` — read-only
Returns currently available slots satisfying hard time/price constraints.

### `hold_moving_slot(mission_id, mission_version, slot_id)` — reversible state change
The seeded judge mission makes the 10:30 / £289 slot disappear on its first hold attempt. Returns `SLOT_NO_LONGER_AVAILABLE`; the loss is persisted per mission and later quotes omit that slot. Agent should choose another quote without human rescue.

### `confirm_moving_booking(mission_id, mission_version, hold_id, approval_token)` — simulated commitment
Approval- and mission-version-gated confirmation of the held fallback slot.

## Evergreen Energy

### `compare_energy_tariffs(annual_kwh, prefer_renewable, max_green_premium_gbp)` — read-only
Calculates annual electricity cost from each tariff's unit/standing charges. When renewable is preferred, selects the cheapest 100% renewable tariff only if its annual premium over the cheapest tariff is within the human's rule; otherwise chooses lowest annual cost. Returns the reason.

### `prepare_energy_switch(mission_id, mission_version, tariff_id, annual_kwh)` — reversible state change
Persists the chosen tariff as prepared and emits a receipt. It does not activate a supply contract.

### `confirm_energy_switch(mission_id, mission_version, preparation_id, approval_token)` — simulated commitment
Only succeeds after current-version human approval.

## Shared recovery codes

- `MISSION_STALE` — human intent changed after planning; re-read ONE.
- `RESOURCE_STALE` — provider resource belongs to an older mission version; re-plan that provider.
- `APPROVAL_REQUIRED` — human has not approved the exact current prepared plan.
- `PLAN_NOT_READY` — ONE refuses approval until all three providers are prepared against the current version.
- `SLOT_NO_LONGER_AVAILABLE` — BoxFox inventory changed; choose another quoted slot.

All read-only tools use `readOnlyHint: true`. State-changing tools do not claim to be read-only. Tool execution visibly updates the same page the human can use normally.
