# Submission + freeze checklist

Conservative binding deadline: **Thursday 3 September 2026, 21:00 BST** (Devpost/Official Rules: 1:00 PM PDT).

## Entry materials

- [ ] Joined/registered for the WebMCP Challenge on Devpost.
- [ ] Project title: **ONE — One goal. Many websites. One agent.**
- [ ] Working live URL: canonical ONE Mission Board.
- [ ] Public GitHub repository URL.
- [x] Root open-source licence exists.
- [x] GitHub public metadata detects **MIT / SPDX MIT**.
- [x] README contains live URL, architecture, build/test instructions and tool summary.
- [x] Public production WebMCP acceptance evidence in repo.
- [x] Judge runbook in repo.
- [x] Threat model / approval boundary documented.
- [x] Devpost description draft prepared.
- [ ] Final Devpost description pasted and proofread.
- [ ] Public YouTube demo < 3 minutes with clear audio.
- [ ] YouTube URL added to submission.
- [ ] Final screenshots/thumbnail if Devpost requests/allows them.

## Final acceptance

- [ ] Run all five `/health` endpoints.
- [ ] `pnpm install --frozen-lockfile` from a fresh public clone.
- [ ] `pnpm build` + `pnpm check` PASS.
- [ ] Compare public fresh-clone artifact hashes with live accepted hashes.
- [ ] Fresh full judge mission in headed WebMCP Chrome PASS.
- [ ] ChatGPT desktop Site Tools acceptance, if access is available before freeze.
- [ ] Test canonical URL in an ordinary clean browser.
- [ ] Mobile overflow check.
- [ ] Confirm GitHub licence still detected as MIT.
- [ ] Recheck official rules/deadline and public project gallery/prior art.

## Devpost proofread against required text

The description must explicitly answer all four:

- [ ] Why this use case is a strong fit for WebMCP.
- [ ] How it creates a better UX.
- [ ] What humans + agents can do together that was difficult/impossible before.
- [ ] Briefly how WebMCP was implemented.

And make the judging case obvious:

- [ ] WebMCP Leverage — 12 tools / 4 top-level origins / structured state + recovery + approval.
- [ ] Execution — complete live product, not PoC.
- [ ] Potential Impact — concrete multi-provider life/admin problem and broader pattern.
- [ ] Creativity & Ambition — goal-level open-web composition, human intent changes + external-world changes.

## Freeze procedure

Do this **before 21:00 BST on 3 Sep**, preferably much earlier:

1. [ ] Record final public GitHub commit SHA.
2. [ ] Record all five live Worker SHA-256 hashes.
3. [ ] Create final release tag if desired.
4. [ ] Submit Devpost entry and verify the rendered public submission.
5. [ ] Open every submitted URL from the rendered submission.
6. [ ] Save a local/safe copy of final submission text and URLs.
7. [ ] **STOP MODIFYING the submitted Devpost entry.**
8. [ ] **STOP MODIFYING the submitted GitHub repo.**
9. [ ] **STOP MODIFYING the submitted live site.**
10. [ ] If we want to keep experimenting during judging, fork/copy separately and leave the judged version untouched.

Do not rely on OpenAI's later 5pm PT helper-page deadline. Official Devpost rules say 1pm PDT; use the earlier cutoff.
