# Three-provider clean-room acceptance — 26 Aug 2026

**PASS.**

The full three-provider source was pushed to public GitHub and then tested from a fresh clone rather than the working tree.

Accepted public source head: `e095d62c02e360fa228db38064ebe3c88949e105`.

## Fresh-clone build

`pnpm install --frozen-lockfile`, `pnpm build` and `pnpm check` all passed.

The public-clone build produced exactly the same SHA-256 artifacts as the tested local working tree:

- Mission: `3a1101c9334c195dc5470c8dd2d33a8857aee9316558521131e0cd2a288e28d2`
- Broadband: `7ff8673739ad865d73bb4864bea065995fb446ad726ad5529a763ca7c7494fd5`
- Movers: `734df2103b24e8732989ff8a48841174cdc4d1088968e896c04d1d86221f019a`
- Energy: `f5d9becfdbc7e2fb8e5bd5e0bf1a291e6da6ed1cc8d05d0d604007d82c7c8084`
- API: `b7a8540d242e573d776114ab7d892f83164c3e45380ff0e5a9b076b06d92f67b`

## Fresh-D1 integration

A brand-new local D1 database was initialised solely from `apps/api/schema.sql`. The public-clone built API was then run in Wrangler against that fresh database.

The integration suite passed every asserted state transition:

1. isolated mission created;
2. broadband held;
3. cheapest mover slot disappeared;
4. structured mover recovery returned;
5. fallback mover held;
6. energy prepared;
7. confirmation denied before approval;
8. `APPROVAL_REQUIRED` boundary verified;
9. human approval created;
10. broadband confirmed;
11. movers confirmed;
12. energy confirmed;
13. broadband final state confirmed;
14. movers final state confirmed;
15. energy final state confirmed;
16. approval visible;
17. human edit incremented mission version;
18. old broadband resource became stale;
19. old mover resource became stale;
20. old energy resource became stale;
21. old approval became stale;
22. re-approval of stale resources refused;
23. `PLAN_NOT_READY` recovery contract verified.

This is application/state acceptance. Full production acceptance still requires deploying these exact artifacts and repeating the cross-tab flow through a real WebMCP-capable headed browser / ChatGPT Site Tools.
