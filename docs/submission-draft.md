# Devpost submission draft — ONE

## Project title

**ONE — One goal. Many websites. One agent.**

## Short pitch

Moving house means repeating one human goal across unrelated websites while prices, availability and even the human's own constraints can change mid-task. ONE demonstrates a different web: independent sites expose WebMCP tools, the browser agent composes them around one mission, and the human remains in control of intent, data sharing and commitment.

## What it does

ONE is a moving-house mission board connected to three independent fictional services:

- **Northstar Broadband** — searches plans, creates reversible holds and simulates confirmation.
- **BoxFox Removals** — quotes moving slots, handles a slot disappearing mid-task, creates a fallback hold and simulates confirmation.
- **Evergreen Energy** — compares annual cost and renewable mix, prepares a switch and simulates confirmation.

The browser agent is the orchestrator. There is no hidden backend selecting providers or calling their tools for it.

The human can change the mission while the agent is working. Every state-changing provider action carries a `missionVersion`. If the human changes a constraint, old intent is rejected with `MISSION_STALE`; the agent must re-read ONE and re-plan.

Provider reality can also change. The first attempt to hold BoxFox's cheapest 10:30 slot deterministically returns `SLOT_NO_LONGER_AVAILABLE`. A new quote omits it and the agent recovers to the next valid option without asking the human to restart.

Searches, holds and preparation remain reversible. Final simulated commitments are blocked by `APPROVAL_REQUIRED` until the human presses **Approve prepared plan** in ONE. Approval is bound to the exact mission version, so a later human edit invalidates it.

ONE keeps the whole journey visible: current state, receipts, recovery events and a data-sharing ledger showing what task data each provider received.

## Why this is a strong fit for WebMCP

This experience only becomes compelling when independent websites expose structured page-scoped capabilities to the same browser agent.

Ordinary UI automation would force an agent to infer controls and state separately on every site. A single central MCP server would erase the open-web part of the idea by moving provider capabilities behind one integration. With WebMCP, Northstar, BoxFox and Evergreen remain independent websites with their own human interfaces and their own tools, while the browser agent composes them around a human goal.

The tools are not decorative wrappers. They carry live page and mission state, structured failure contracts, read/write semantics and consequential-action boundaries. The same underlying domain functions power both the human controls and WebMCP actions, and every agent action is reflected visibly in the normal webpage.

## How it creates a better user experience

A human states the goal and constraints once instead of repeatedly translating them into each provider's UI. The agent can do the repetitive comparison and preparation work, but the human can interrupt, change their mind and approve the final plan.

That produces three UX properties that are difficult to get from conventional browser automation:

1. **Intent stays authoritative.** If the human changes the budget, stale provider actions refuse to continue instead of silently completing the old plan.
2. **Recovery is structured.** When inventory changes, the provider returns a machine-readable failure and the agent can recover inside the task rather than restarting the journey.
3. **Commitment stays human.** Reversible research/preparation can proceed autonomously, while final simulated orders remain behind explicit approval tied to the exact current prepared choices and mission version.

## What humans and agents can do together that was difficult before

The human and agent can literally co-drive one cross-site task.

During the demo, the agent plans a £34 Gigabit broadband hold against mission v1. While it works, the human lowers the budget from £35 to £30 in ONE. The old stateful action is rejected; Northstar refreshes its visible requirements in-place; the agent re-reads the mission and chooses 500 Mbps at £27 instead.

Then the environment changes rather than the human: BoxFox's £289 slot disappears during the hold attempt. WebMCP returns `SLOT_NO_LONGER_AVAILABLE`, the agent re-quotes and recovers to £319. Evergreen then selects a 100% renewable tariff only because the extra annual cost fits the human's stated green-premium rule.

The agent prepares all three services, but cannot confirm them. The human reviews ONE's receipts and data-sharing summary, explicitly approves the prepared plan, and only then can the agent complete all three simulated commitments.

This is not a chatbot filling forms. It is a human maintaining intent while an agent coordinates independent websites that each retain their own state, UI and rules.

## How WebMCP is implemented

Each top-level site registers page-scoped tools with `document.modelContext.registerTool(...)`.

**ONE Mission Board**
- `get_mission`
- `get_service_directory`
- `get_progress`

**Northstar Broadband**
- `search_broadband_plans`
- `hold_broadband_plan`
- `confirm_broadband_order`

**BoxFox Removals**
- `quote_move`
- `hold_moving_slot`
- `confirm_moving_booking`

**Evergreen Energy**
- `compare_energy_tariffs`
- `prepare_energy_switch`
- `confirm_energy_switch`

Read-only tools set `readOnlyHint:true`; holds, preparations and confirmations are state-changing tools. Tool execution honours the WebMCP `AbortSignal`.

A small Cloudflare Worker + D1 service stores mission versions, provider resources, approvals and receipts. It deliberately does **not** search provider catalogues, choose recommendations or invoke provider tools. Cross-site orchestration remains in the browser agent.

Every mission is isolated with its own ID. Provider URLs carry that mission ID, allowing multiple judge sessions without sharing state.

## Production proof

The complete public production journey has passed in headed Chrome 151 with `WebMCP,WebMCPTesting` enabled using real `document.modelContext.getTools()` / `executeTool()` calls across all four top-level origins.

The accepted run proved:

- v1 Gigabit selection and hold;
- human £35 → £30 mission override;
- `MISSION_STALE` refusal;
- v2 broadband re-plan;
- `SLOT_NO_LONGER_AVAILABLE` mover recovery;
- renewable energy reasoning and preparation;
- `APPROVAL_REQUIRED` before human approval;
- explicit human approval in ONE;
- all three simulated confirmations;
- final `Complete ✓` state on all provider cards;
- visible data-sharing and recovery receipts.

Public GitHub source was fresh-cloned and rebuilt to the exact SHA-256 artefacts deployed in production.

## Judging-criteria case

### WebMCP Leverage

Twelve real tools across four independent origins, with read/write annotations, live state, visible page effects, structured failure recovery, versioned intent and explicit approval. WebMCP is the product architecture rather than an add-on.

### Execution

ONE is a complete live product experience: ordinary human UI, independent provider sites, durable state, failure/recovery, responsive layout, privacy ledger, approval UX, production deployment and reproducible public source.

### Potential Impact

Moving house is an intentionally concrete example of a broader problem: humans routinely coordinate one goal across independent organisations that do not share a workflow. The same pattern applies to travel disruption, onboarding, procurement, claims, event planning and other multi-provider life/admin tasks.

### Creativity & Ambition

ONE explores **goal-level composition of the open web** rather than a single WebMCP-enabled application. It combines two kinds of change that real agents must survive: the human changes their mind, and the external world changes underneath the plan. The browser agent must reconcile both while preserving human control over consequential actions.

## Suggested judge prompt

> Complete this move using the websites in ONE. Stay inside my rules. Prepare everything first and do not confirm any commitment until I explicitly approve it in ONE. If something changes, recover without asking me to restart.

## Important

All provider brands and inventory are fictional. All commitments are simulated. No real purchase, booking, energy switch, payment or personal account is created.
