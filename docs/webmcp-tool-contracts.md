# WebMCP tool contracts

ONE deliberately keeps tools page-scoped. The browser agent moves between independent top-level origins; no backend calls another provider on the agent's behalf.

## ONE Mission Board

### `get_mission()` — read-only
Returns the current mission ID/version, route/date, human constraints, approval policy and service directory. Re-read after a human changes the mission.

### `get_service_directory()` — read-only
Returns mission-scoped top-level URLs for Northstar Broadband, BoxFox Removals and Evergreen Energy.

### `get_progress()` — read-only
Returns the complete cross-provider states, receipts, unavailable inventory and current approval state/token. This full view is available only to ONE; provider origins receive provider-scoped progress views from the state API.

## Northstar Broadband

### `search_broadband_plans(minimum_mbps, max_monthly_gbp)` — read-only
Filters Northstar's own catalogue. Hard constraints are never silently exceeded. Ranking is fastest compliant plan first, then price/contract tie-breaks.

### `hold_broadband_plan(mission_id, mission_version, plan_id)` — reversible state change
Creates a real 15-minute demo hold plus receipt. A stale mission version returns `MISSION_STALE` with no state change. The API independently enforces current mission speed/budget rules and rejects out-of-policy direct calls with `PLAN_OUTSIDE_MISSION_RULES`.

### `confirm_broadband_order(mission_id, mission_version, hold_id, approval_token)` — simulated commitment
Only succeeds for the **exact unexpired hold ID the human approved** in the current bundle. Mission/resource drift, expiry, changed bundle state or missing approval are refused.

## BoxFox Removals

### `quote_move(earliest_time, max_price_gbp)` — read-only
Returns currently available slots satisfying hard time/price constraints.

### `hold_moving_slot(mission_id, mission_version, slot_id)` — reversible state change
The seeded judge mission makes the 10:30 / £289 slot disappear on its first hold attempt. Returns `SLOT_NO_LONGER_AVAILABLE`; the loss is persisted per mission and later quotes omit that slot. Agent should choose another quote without human rescue. The API independently rejects direct holds outside current mission time/price rules with `SLOT_OUTSIDE_MISSION_RULES`.

### `confirm_moving_booking(mission_id, mission_version, hold_id, approval_token)` — simulated commitment
Only succeeds for the **exact unexpired mover hold ID** present in the approved bundle.

## Evergreen Energy

### `compare_energy_tariffs(annual_kwh, prefer_renewable, max_green_premium_gbp)` — read-only
Calculates annual electricity cost from each tariff's unit/standing charges. When renewable is preferred, selects the cheapest 100% renewable tariff only if its annual premium over the cheapest tariff is within the human's rule; otherwise chooses lowest annual cost. Returns the reason.

### `prepare_energy_switch(mission_id, mission_version, tariff_id, annual_kwh)` — reversible state change
Persists the chosen tariff as prepared and emits a receipt. It does not activate a supply contract. The API independently enforces the current renewable green-premium ceiling and rejects an out-of-policy preparation with `TARIFF_OUTSIDE_MISSION_RULES`.

### `confirm_energy_switch(mission_id, mission_version, preparation_id, approval_token)` — simulated commitment
Only succeeds for the **exact preparation ID the human approved** in the still-current approved bundle.

## Shared recovery / policy codes

- `MISSION_STALE` — human intent changed after planning; re-read ONE.
- `RESOURCE_STALE` — provider resource belongs to an older mission version; re-plan that provider.
- `RESOURCE_EXPIRED` — a timed hold has expired; create a fresh hold and obtain fresh approval.
- `APPROVAL_REQUIRED` — no valid human approval exists for this exact current prepared bundle.
- `PLAN_NOT_READY` — ONE refuses approval until all three services are current/prepared (already-confirmed services count as satisfied during partial recovery).
- `PLAN_OUTSIDE_MISSION_RULES` — broadband hold violates current hard speed/budget constraints.
- `SLOT_OUTSIDE_MISSION_RULES` — mover hold violates current hard time/price constraints.
- `TARIFF_OUTSIDE_MISSION_RULES` — renewable preparation exceeds the human's green-premium ceiling.
- `SERVICE_ALREADY_CONFIRMED` — prevents a second commitment for an already-confirmed service.
- `PROVIDER_ASSERTION_MISMATCH` — provider write metadata does not match the immutable demo resource identified by its ID; refresh provider state.
- `PROVIDER_RESOURCE_NOT_FOUND` — state write referenced an unknown provider resource ID.
- `PLAN_CHANGED_DURING_APPROVAL` — a provider resource changed while the human approval write was racing; refresh and review again.
- `MISSION_UPDATE_CONFLICT` — a concurrent mission update won the compare-and-set race; refresh before editing again.
- `MISSION_COMMITMENT_STARTED` — mission constraints are locked once any confirmation has crossed the commitment boundary.
- `SLOT_NO_LONGER_AVAILABLE` — BoxFox inventory changed; choose another quoted slot.

All read-only tools use `readOnlyHint: true`. State-changing tools do not claim to be read-only. Tool execution visibly updates the same page the human can use normally.
