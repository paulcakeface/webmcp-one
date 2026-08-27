# Paranoid pre-submission audit — 27 Aug 2026

**PASS — production hardening accepted.**

This third audit targeted retry/concurrency behaviour and hostile API inputs after the earlier state/privacy audit had already passed.

## Defects / hardening found

1. **Provider assertion forgery** — state writes previously accepted duplicated provider metadata (for example a real plan ID paired with a forged cheaper price). The API now resolves immutable demo offer facts by resource ID and refuses mismatches with `PROVIDER_ASSERTION_MISMATCH` / unknown IDs with `PROVIDER_RESOURCE_NOT_FOUND`. The API still does not search, rank or select provider results.
2. **Approval retry churn** — repeated approval of the exact same current bundle could mint a fresh token/receipt. Exact-plan approval is now idempotent and preserves one token/receipt.
3. **Concurrent state races** — mission edits, approval writes and confirmation transitions now use write-time compare-and-set conditions so human edits/provider replans cannot race old intent across the commitment boundary.
4. **Confirmation replay** — a partial unique D1 index plus conditional transition guarantees one confirmation receipt per exact resource; concurrent retries return an idempotent success.
5. **BoxFox loss replay** — concurrent first-hold attempts use `ON CONFLICT DO NOTHING`, preserving one deterministic unavailable receipt.
6. **Expiry boundary race** — approval and confirmation SQL now use SQLite's own clock and confirmation atomically re-checks the entire approved bundle at transition time. A hold cannot cross expiry between a JavaScript pre-check and the database commitment.
7. **Malformed JSON shape** — valid JSON values such as `null`/arrays are now rejected as `INVALID_JSON_OBJECT` instead of reaching object-shaped state handlers. Explicit human mission values are type-strict when supplied.
8. **Evergreen calculation integrity** — Evergreen sends annual kWh with preparation; the API independently recalculates annual cost, renewable percentage and green premium from the canonical tariff before accepting the write.

## Validation

- deterministic build/check: PASS — 11 checks for each browser app, 26 API contract checks and the D1 schema invariant;
- dependency audit: no known vulnerabilities;
- fresh isolated D1 complete API flow: PASS;
- hostile input/CORS fuzz: PASS, including forged/XSS-like provider fields, unknown resources, wrong provider origins, malformed JSON and oversized mission IDs;
- local concurrency stress: PASS — 16 simultaneous approval attempts → one token/receipt, 20 simultaneous confirmation attempts → one confirmation receipt, 20 BoxFox loss attempts → one unavailable receipt, 25 confirmation-vs-human-edit races → no double-win, 15 approval-vs-replan races → no stale approval crossing;
- production complete API flow: PASS;
- bounded production concurrency stress: PASS — parallel approval/confirmation/BoxFox loss plus 5 confirm-vs-edit and 3 approve-vs-replan rounds;
- production D1 confirmation history: 24 confirmation receipts / 24 unique resource keys before deployment, zero duplicates; unique confirmation index present;
- live Evergreen shared `prepare()` path: request contained `annualKwh:3100`, canonical £957.50 Eco Flex preparation succeeded, no browser console warnings/errors/issues;
- exact deployed SHA-256: Energy `a15dba208a827e7c0f85fed4463af8d4796d6b920831b1de345f4aba8dec6a44`; API module `880901e0a36db78acdcd8db75dc528387269151a182116e25bb2fff25ecdacf8`.

The externally visible WebMCP tool schema did not change. `prepare_energy_switch` still receives `annual_kwh`; the shared page function now carries that already-supplied value into the state API for independent verification. The earlier full headed Chrome 151 WebMCP acceptance therefore exercises the same Site Tool contract, while this audit separately proves the changed shared implementation and production API path.
