# Trust & safety model

ONE is a WebMCP interaction demo, not a real commerce system. There are no real payments, utility switches, customer accounts or personal records.

## Trust boundaries

- Each provider is an independent top-level HTTPS origin and exposes only its own WebMCP tools.
- The state API persists mission/version, provider resources, receipts and approvals. It never searches providers, picks winners or invokes provider tools.
- State-changing API routes require the matching project `Origin`. Read routes are also origin-scoped: ONE receives the full mission/progress view, while each provider receives only the mission constraints and provider state it needs.
- `Origin` enforcement is a browser-facing isolation control, **not authentication against an arbitrary HTTP client that can forge headers**. Mission IDs are high-entropy UUIDs and the demo stores no secrets or real personal/account data. A production commerce system would add authenticated, mission-scoped capabilities or user sessions rather than treating `Origin` as identity.
- Consequential provider actions require `missionVersion`; stale human intent is rejected before state mutation.
- Server-side provider writes independently enforce the current hard mission constraints. A caller cannot bypass the human's budget/speed/time/green-premium rules by skipping a provider search UI/tool.
- Timed broadband and mover holds are actually expiry-checked. Expired holds cannot be approved or confirmed.
- Human approval is created only by an explicit action on ONE and stores a cryptographically random approval token **plus the exact current Northstar hold ID, BoxFox hold ID and Evergreen preparation ID**.
- Confirmation checks current mission version, exact approved resource ID, resource version/status/expiry, approval token, and that the rest of the approved bundle is still current. A provider re-plan or timed-hold expiry invalidates the old approval boundary.
- Once any provider is confirmed, mission constraints lock. An already-confirmed service cannot create a second current-version commitment.

## Data minimisation

Search/prepare stages use only operational demo data: route/destination, move date, budgets, speed requirement, annual electricity use and preferences. Receipts record the categories used. ONE shows those categories in a Data Shared ledger.

Provider read views are minimised too:

- Northstar receives destination + broadband constraints + Northstar state.
- BoxFox receives route/date + mover constraints + BoxFox state.
- Evergreen receives destination + energy constraints + Evergreen state.
- Only ONE receives the complete cross-provider ledger.

Name, email, phone, payment data, real addresses, real energy accounts and credentials are not required or stored.

## Deterministic failure

BoxFox's first 10:30 hold loss is seeded and persisted per mission. It is not random, cannot strand the judge flow and exists to demonstrate structured recovery from changing web state.

## Non-goals

ONE does not bypass ChatGPT's own Site Tool confirmations or safety review. Application-level approval is an additional visible human-control boundary.
