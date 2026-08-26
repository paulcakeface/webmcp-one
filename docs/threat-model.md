# Trust & safety model

ONE is a WebMCP interaction demo, not a real commerce system. There are no real payments, utility switches, customer accounts or personal records.

## Trust boundaries

- Each provider is an independent top-level HTTPS origin and exposes only its own WebMCP tools.
- The state API persists mission/version, provider resources, receipts and approvals. It never searches providers, picks winners or invokes provider tools.
- State-changing API routes are origin-restricted to the matching project site. Read routes are available to the project origins for shared mission state.
- Consequential provider actions require `missionVersion`; stale human intent is rejected before state mutation.
- Confirmation additionally requires a cryptographically random application-level approval token created by an explicit human action on ONE.
- Approval is bound to a mission version. Any human mission edit makes the approval and older provider resources stale.
- A provider resource is checked for its own mission version at confirmation time; a fresh approval token cannot bless an old hold.

## Data minimisation

Search/prepare stages use only operational demo data: route/destination, move date, budgets, speed requirement, annual electricity use and preferences. Receipts record the categories used. ONE shows those categories in a Data Shared ledger.

Name, email, phone, payment data, real addresses, real energy accounts and credentials are not required or stored.

## Deterministic failure

BoxFox's first 10:30 hold loss is seeded and persisted per mission. It is not random, cannot strand the judge flow and exists to demonstrate structured recovery from changing web state.

## Non-goals

ONE does not bypass ChatGPT's own Site Tool confirmations or safety review. Application-level approval is an additional visible human-control boundary.
