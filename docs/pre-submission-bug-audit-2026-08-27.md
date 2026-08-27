# Pre-submission bug audit — 27 Aug 2026

**PASS — audit-hardened production release accepted.**

A pre-submission adversarial audit was performed after the original full production acceptance. The audit deliberately tested state-machine, privacy, approval, expiry, browser-reset and invalid-input behaviour outside the happy path. Real defects were fixed before submission hardening continued.

## Defects found and fixed

1. **Fresh judge reset** — bare Mission root previously reused a stored mission. Bare `/` now always creates a fresh v1 mission; only an explicit `?mission=` resumes one.
2. **Origin enforcement** — API writes and mission/progress reads now require an allowed origin; missing origins are refused.
3. **Provider privacy isolation** — providers previously had technical access to the full mission/progress object. Responses are now origin-scoped: Northstar receives only destination+broadband data, BoxFox only route/date/removals data, Evergreen only destination+energy data, and only ONE receives the cross-provider ledger.
4. **Server-side hard constraints** — direct state-changing calls can no longer bypass the human rules. Broadband speed/monthly budget, mover earliest-time/max-price and Evergreen green-premium constraints are independently enforced by the API.
5. **Timed hold expiry** — 15-minute broadband/mover holds now become `expired`, cannot be approved and cannot be confirmed. An expired member also invalidates the remaining approved bundle.
6. **No-op mission updates** — submitting an unchanged budget no longer increments `missionVersion` or stales valid work.
7. **Exact-resource approval** — approval now stores the exact Northstar hold ID, BoxFox hold ID and Evergreen preparation ID. An approval token cannot confirm a replacement resource in the same mission version.
8. **Provider re-plan invalidation** — any new current provider choice invalidates prior approval.
9. **Bundle integrity** — every remaining confirmation verifies that the complete exact approved plan is still current and ready.
10. **Duplicate commitment prevention** — a service already confirmed for the current mission cannot create a second commitment.
11. **Post-confirmation mission lock** — after any provider is confirmed, mission constraints can no longer be changed underneath an irreversible commitment.
12. **Partial-confirmation recovery** — already-confirmed services count as satisfied when a remaining mutable provider must be re-planned and freshly approved.
13. **Stale provider UX** — BoxFox and Evergreen now refresh current mission state in-place on `MISSION_STALE`, matching Northstar.
14. **Human input/error handling** — invalid human inputs produce visible notices instead of unhandled promise rejections.
15. **Accessibility basics** — visible focus treatment and live-region semantics were added to Site Tool status, agent activity and dynamic notices.
16. **Evergreen human parity** — human UI cannot prepare a renewable tariff that violates the same green-premium rule enforced for the agent/API.

## Production verification

The complete expanded API suite passed against the live production API after deployment. It includes provider data isolation, hard-rule rejection, no-op updates, exact-resource approval, provider re-plan invalidation, duplicate commitment prevention, mission locking, partial-confirmation recovery and the original judge choreography.

A dedicated live production fixture was then forced past its hold expiry directly in D1. Verified results:

- Broadband: `expired`
- Movers: `expired`
- Approval: `stale` with `resource_changed_or_expired`
- Reapproval: `409 PLAN_NOT_READY`
- Expired broadband confirmation: `409 RESOURCE_EXPIRED`
- Evergreen confirmation with the old broken bundle token: `403 APPROVAL_REQUIRED`

## Browser QA

Against the audit release:

- bare Mission root opened twice in the same browser and produced two different fresh v1 mission IDs;
- unchanged human budget update remained v1 and displayed `Mission unchanged · still v1`;
- Mission console had no errors/warnings/issues;
- Mission network requests all completed successfully;
- Mission, Northstar, BoxFox and Evergreen had no horizontal overflow at 390×844;
- new `aria-live` / status semantics were present on provider pages.

## Final headed WebMCP acceptance

Disposable headed **Chrome 151.0.7922.108** with `WebMCP,WebMCPTesting` enabled completed the audit-hardened production choreography through real `document.modelContext` tools.

Acceptance mission:

`move-7f95a4ae-fb25-4abe-ae9b-3131eea27d75`

The uninterrupted final run passed all assertions including:

- fresh v1 Mission and 3 read-only ONE Site Tools;
- Northstar provider privacy isolation;
- v1 Gigabit search/hold;
- human £35→£30 override to v2;
- no-op v2 update protection;
- old v1 action refused with `MISSION_STALE` and in-place refresh;
- v2 Northstar 500 £27 re-plan/hold;
- BoxFox £289 slot loss and £319 fallback recovery;
- Evergreen Eco Flex recommendation/preparation;
- pre-approval confirmation refused;
- exact three-provider prepared plan visible in ONE;
- human approval visible/tokenised;
- exact approved resources confirmed for all three providers;
- final ONE state Complete across all services;
- mission editing visibly locked after confirmation;
- privacy ledger visibly reports all three scoped provider data sets;
- Human Approval panel visibly reports Mission complete.

Final harness marker:

`FULL HEADED WEBMCP AUDIT PASS`

## Audit release SHA-256

- Mission: `5f2169588ae6aa68404fbc2ead6314a7a3ac639e81910fb0a67a75e1a26fa213`
- Broadband: `72d3c9ac07520d4ddc40a22328ca3b296489a89089a06dfbd65f64563d4a166b`
- Movers: `c233935464cc9b8edd5a51876b476672151341c48e1803cc1f826feae80427c9`
- Energy: `bde32758ef48e55a70302024b1d59d54b00dd4eb33b2fe1f00c5e607b6ba3432`
- API: `15d91bfeca5a647ba35cf0050844f63fd73e28bfa9d77082e8db3423f297d7e2`

The release transport itself was hash-gated. All five exact local artefacts were accepted only after SHA-256 verification, promoted from temporary Cloudflare KV, and the temporary staging Worker/KV were deleted after production acceptance. The disposable WebMCP browser, SSH tunnel and temporary browser profile were also removed.

## Remaining environment gap

The audit release has been accepted in real headed Chrome's WebMCP testing surface. Testing inside the actual ChatGPT desktop in-app browser/Site Tools remains a separate platform-specific acceptance step because that desktop client is not available to the automated environment.
