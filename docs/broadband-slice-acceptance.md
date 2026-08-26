# Broadband vertical-slice acceptance — 26 Aug 2026

PASS.

Validated in a disposable headed Chrome 151 instance with `WebMCP,WebMCPTesting` enabled against the public HTTPS deployment.

Journey:
1. ONE registered `get_mission`, `get_service_directory`, `get_progress`, all with `readOnlyHint:true`.
2. `get_mission` returned a fresh isolated v1 moving mission with broadband max £35/month.
3. Northstar registered `search_broadband_plans` (`readOnlyHint:true`) and `hold_broadband_plan` (state-changing).
4. WebMCP search returned Gigabit £34, 900 Mbps £32, 500 Mbps £27 and recommended Gigabit as the fastest compliant plan.
5. WebMCP hold created a reversible v1 Gigabit hold and durable receipt.
6. ONE `get_progress` observed the hold.
7. The human changed the Mission Board broadband budget from £35 to £30, incrementing missionVersion 1 -> 2.
8. A stateful Broadband tool call planned against v1 returned HTTP/application `MISSION_STALE` with currentVersion=2 and made no change.
9. The agent re-read ONE, reloaded Northstar for v2, searched at £30 and received only Northstar 500 £27 as compliant.
10. WebMCP hold created the v2 Northstar 500 hold; D1 active hold moved from Gigabit to 500 Mbps and ONE progress reflected it.

This proves the first complete cross-origin human+agent loop: shared intent -> independent provider -> durable receipt -> human override -> stale refusal -> agent re-plan.
