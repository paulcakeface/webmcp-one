# Demo video script — target 2:35–2:45

**0:00–0:12 — Problem**
Moving house means carrying the same intent through unrelated websites. Show ONE plus the three provider tabs.

**0:12–0:28 — One mission**
Open ONE. Say: “Complete this move. Stay inside my rules and prepare everything, but don't confirm until I approve.” Show Site Tools and mission v1.

**0:28–0:52 — Broadband**
Agent opens Northstar via the service directory, searches and holds the fastest compliant plan. The real Northstar UI changes; ONE receives the receipt.

**0:52–1:16 — The web changes**
Agent opens BoxFox. £289 at 10:30 is best. Hold attempt returns `SLOT_NO_LONGER_AVAILABLE`; the slot disappears visibly. Agent immediately chooses £319 at 11:00. ONE records both failure and recovery.

**1:16–1:38 — Human changes intent**
Human lowers broadband budget £35 → £30 in ONE. Mission v1 → v2. An old stateful action is rejected `MISSION_STALE`; agent re-reads ONE and re-plans to Northstar 500 / £27.

**1:38–1:58 — Energy decision**
Evergreen calculates annual cost and chooses the 100% renewable tariff only because its green premium fits the human's £100/year rule. Prepare it.

**1:58–2:18 — Trust boundary**
ONE shows Data Shared and the three prepared resources. Demonstrate a confirmation attempt before approval returning `APPROVAL_REQUIRED`. Human presses **Approve prepared plan**.

**2:18–2:34 — Complete**
Agent confirms all three simulated commitments. ONE cards turn Complete and the ledger shows approval + confirmations.

**2:34–2:44 — Thesis**
Show simple architecture: Human ↔ Browser Agent ↔ Independent WebMCP Sites. End: “WebMCP doesn't just make websites agent-readable. It makes the open web composable around human goals.”
