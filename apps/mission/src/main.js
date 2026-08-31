import { registerReadOnlyTool } from '../../../packages/webmcp/src/register.js';

const API = 'https://webmcp-one-api.paul-phillips1988.workers.dev';
const PROVIDERS = {
  broadband: 'https://webmcp-one-broadband.paul-phillips1988.workers.dev',
  movers: 'https://webmcp-one-movers.paul-phillips1988.workers.dev',
  energy: 'https://webmcp-one-energy.paul-phillips1988.workers.dev',
};
const SERVICES = {
  broadband: { name: 'Northstar Broadband', icon: 'wifi' },
  movers: { name: 'BoxFox Removals', icon: 'truck' },
  energy: { name: 'Evergreen Energy', icon: 'leaf' },
};

let mission;
let missionId;
let currentProgress;
let reviewOpen = false;
const content = document.querySelector('[data-app-content]');
boot().catch(fatal);

async function boot() {
  missionId = new URL(location.href).searchParams.get('mission');
  if (!missionId) {
    const created = await api('/api/session', { method: 'POST' });
    missionId = created.mission.missionId;
    const url = new URL(location.href);
    url.searchParams.set('mission', missionId);
    history.replaceState({}, '', url);
  }
  mission = await api(`/api/mission/${encodeURIComponent(missionId)}`);
  render();
  await Promise.all([
    registerReadOnlyTool({
      name: 'get_mission',
      title: 'Get moving mission',
      description: 'Read the current moving-house mission, version, human constraints and approval policy. Re-read this after the human changes the mission.',
      inputSchema: empty(),
      execute: async () => {
        mission = await api(`/api/mission/${encodeURIComponent(missionId)}`);
        reviewOpen = false;
        render();
        await refresh();
        return withDirectory(mission);
      },
    }),
    registerReadOnlyTool({
      name: 'get_service_directory',
      title: 'Get service directory',
      description: 'Get the independent top-level provider URLs for this mission. Open each provider website before using that provider’s Site Tools.',
      inputSchema: empty(),
      execute: async () => directory(),
    }),
    registerReadOnlyTool({
      name: 'get_progress',
      title: 'Get mission progress',
      description: 'Read current cross-site progress and receipts for this mission. Use this to understand what providers have prepared or held.',
      inputSchema: empty(),
      execute: async () => {
        const p = await api(`/api/progress/${encodeURIComponent(missionId)}`);
        mission = p.mission;
        progress(p);
        return p;
      },
    }),
  ]);
  await refresh();
  setInterval(refresh, 2500);
}

function render() {
  const title = `Move to ${mission.move.to}`;
  content.innerHTML = `<section class="mission-dashboard">
    <article class="surface mission-summary">
      <div class="mission-identity">
        <div class="mission-icon" aria-hidden="true">${icon('home')}</div>
        <div><h1>${esc(title)}</h1><div class="mission-meta"><span>Moving date <strong>${esc(date(mission.move.date))}</strong></span><span>${esc(mission.move.from)} → ${esc(mission.move.to)}</span><span>Mission v${mission.missionVersion}</span></div></div>
      </div>
      <div class="service-dots"><span>3 independent services connected</span><div class="dot-row"><div class="mini-service broadband" title="Northstar Broadband">⌁</div><div class="mini-service movers" title="BoxFox Removals">▣</div><div class="mini-service energy" title="Evergreen Energy">ϟ</div></div></div>
      <div class="mission-overall"><div class="overall-copy"><small>Overall status</small><span class="status-pill" data-overall-text>In progress</span></div><div class="progress-ring" data-overall-ring style="--p:0"><b data-overall-percent>0%</b></div></div>
    </article>

    <section class="surface how" aria-labelledby="how-title"><div class="section-line"><h2 id="how-title">How it works</h2><span class="muted">Your goal stays in control</span></div><div class="flow">
      ${flowStep('person', 'Human', 'You set the goal and preferences', '')}<span class="flow-arrow">→</span>
      ${flowStep('one', 'ONE', 'Plans and exposes shared mission state', '')}<span class="flow-arrow">→</span>
      ${flowStep('agent', 'Agent', 'Browses, compares and negotiates', 'agent')}<span class="flow-arrow">→</span>
      ${flowStep('globe', 'Independent websites', 'Interact through their own Site Tools', 'web')}
    </div></section>

    <section class="service-grid" data-services aria-label="Mission services">${initialCards()}</section>

    <section class="surface activity" aria-labelledby="activity-title"><div class="section-line"><h2 id="activity-title">What ONE is doing</h2><button class="secondary-link" type="button" id="view-activity">View all activity →</button></div><div class="activity-list" data-activity><article class="activity-item"><span class="activity-dot">•</span><div><time>Now</time><p>Waiting for your agent to start with the first provider.</p></div></article></div></section>

    <section class="surface approval" data-approval><div class="approval-intro"><div class="approval-icon" aria-hidden="true">${icon('shield')}</div><div><span class="kicker">HUMAN APPROVAL</span><h2>Preparing your plan</h2><p>ONE will ask you before the agent can cross the simulated commitment boundary.</p></div></div></section>

    <details class="surface edit-panel"><summary>Change mission preferences</summary><div class="edit-body"><div class="edit-grid"><div><span class="kicker">HUMAN OVERRIDE</span><h3>Change the mission while your agent works.</h3><p class="hint">A change increments missionVersion, making old provider intent and approvals stale instead of silently continuing.</p></div><div><label>Broadband max / month <strong id="budget-label">£${mission.constraints.broadband.maxMonthlyGbp}</strong></label><input id="budget" type="range" min="20" max="50" step="1" value="${mission.constraints.broadband.maxMonthlyGbp}"><button class="primary" id="save-budget">Update mission</button></div></div></div></details>

    <section class="disclosures">
      <details class="surface disclosure"><summary>WHAT YOUR AGENT SHARED</summary><div class="disclosure-body" data-privacy><p class="muted">No provider data has been shared yet.</p></div></details>
      <details class="surface disclosure" id="full-ledger"><summary>Full mission activity</summary><div class="disclosure-body" data-progress><p class="muted">No provider actions yet.</p></div></details>
    </section>
  </section>`;

  const range = document.querySelector('#budget');
  const label = document.querySelector('#budget-label');
  range.addEventListener('input', () => { label.textContent = `£${range.value}`; });
  document.querySelector('#save-budget').addEventListener('click', saveBudget);
  document.querySelector('#view-activity').addEventListener('click', () => {
    const ledger = document.querySelector('#full-ledger');
    ledger.open = true;
    ledger.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

async function saveBudget() {
  const button = document.querySelector('#save-budget');
  button.disabled = true;
  button.textContent = 'Updating…';
  try {
    const result = await api(`/api/mission/${encodeURIComponent(missionId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ broadbandMaxMonthlyGbp: Number(document.querySelector('#budget').value) }),
    });
    mission = result.mission;
    reviewOpen = false;
    render();
    await refresh();
    flash(result.changed === false ? `Mission unchanged · still v${mission.missionVersion}` : `Mission updated to v${mission.missionVersion}`);
  } catch (error) {
    flash(error.message, true);
    button.disabled = false;
    button.textContent = 'Update mission';
  }
}

async function refresh() {
  try {
    const p = await api(`/api/progress/${encodeURIComponent(missionId)}`);
    const changed = mission && p.mission.missionVersion !== mission.missionVersion;
    mission = p.mission;
    if (changed) {
      reviewOpen = false;
      render();
    }
    progress(p);
  } catch (error) {
    console.warn(error);
  }
}

function progress(p) {
  currentProgress = p;
  const views = ['broadband', 'movers', 'energy'].map((key) => serviceView(p, key));
  const services = document.querySelector('[data-services]');
  if (services) services.innerHTML = views.map(serviceCard).join('');

  const percent = overallPercent(p);
  const ring = document.querySelector('[data-overall-ring]');
  const percentText = document.querySelector('[data-overall-percent]');
  const overallText = document.querySelector('[data-overall-text]');
  if (ring) ring.style.setProperty('--p', String(percent));
  if (percentText) percentText.textContent = `${percent}%`;
  if (overallText) overallText.textContent = overallLabel(p);

  const committed = [p.broadband.status, p.movers.status, p.energy.status].includes('confirmed');
  const budget = document.querySelector('#budget');
  const save = document.querySelector('#save-budget');
  if (committed) {
    if (budget) budget.disabled = true;
    if (save) { save.disabled = true; save.textContent = 'Mission locked after confirmation'; }
  }

  renderActivity(p);
  renderApproval(p, views);
  renderPrivacy(p);
  renderLedger(p);
}

function serviceView(p, key) {
  const config = SERVICES[key];
  const state = p[key].status;
  const resource = key === 'energy' ? p.energy.preparation : p[key].hold;
  const resourceId = resource?.id;
  const receipts = p.receipts.filter((r) => r.service === config.name);
  const baseReceipt = receipts.find((r) => r.resourceId === resourceId && ['held', 'prepared'].includes(r.status)) || receipts.find((r) => r.resourceId === resourceId) || receipts[0];
  const recovered = key === 'movers' && state === 'held' && receipts.some((r) => r.status === 'unavailable');
  const status = statusView(state, recovered);
  return {
    key,
    name: config.name,
    icon: config.icon,
    url: directory()[key],
    status,
    summary: baseReceipt?.shortSummary || requirementCopy(key),
    note: serviceNote(key, state, recovered),
    price: priceCopy(key, baseReceipt),
  };
}

function statusView(state, recovered) {
  if (state === 'confirmed') return { label: 'Complete', tone: 'complete' };
  if (state === 'held') return { label: recovered ? 'Replanned' : 'Held', tone: recovered ? 'warning' : 'active' };
  if (state === 'prepared') return { label: 'Prepared', tone: 'active' };
  if (state === 'stale' || state === 'needs_recovery' || state === 'expired') return { label: state === 'expired' ? 'Expired' : 'Needs re-plan', tone: 'warning' };
  return { label: 'Ready', tone: 'active' };
}

function requirementCopy(key) {
  if (key === 'broadband') return `At least ${mission.constraints.broadband.minimumMbps} Mbps · max £${mission.constraints.broadband.maxMonthlyGbp}/month`;
  if (key === 'movers') return `After ${mission.constraints.movers.earliestTime} · prefer £${mission.constraints.movers.preferredMaxGbp} or less`;
  return `${mission.constraints.energy.preferRenewable ? 'Renewable preferred' : 'Best value'} · green premium max £${mission.constraints.energy.maxGreenPremiumAnnualGbp}/year`;
}

function serviceNote(key, state, recovered) {
  if (state === 'confirmed') return 'Simulated confirmation complete.';
  if (key === 'movers' && recovered) return 'The first slot disappeared; the fallback is safely held.';
  if (state === 'held') return 'Reversible hold. Nothing has been confirmed.';
  if (state === 'prepared') return 'Prepared only. Human approval is still required.';
  if (state === 'stale') return 'Your mission changed. The provider must re-plan.';
  if (state === 'expired') return 'The timed hold expired and needs refreshing.';
  if (state === 'needs_recovery') return 'Availability changed. Choose the next valid option.';
  if (key === 'broadband') return 'Find the fastest plan inside your hard budget.';
  if (key === 'movers') return 'Quote live availability and recover if a slot disappears.';
  return 'Compare annual costs within your renewable preference.';
}

function priceCopy(key, receipt) {
  if (!receipt) return { value: 'Not selected', detail: 'Agent can compare options' };
  if (key === 'movers' && Number.isFinite(Number(receipt.oneOffCostPence))) return { value: `£${(Number(receipt.oneOffCostPence) / 100).toFixed(2)}`, detail: 'one-off' };
  if (key === 'energy') {
    const annual = String(receipt.shortSummary || '').match(/£([0-9,.]+)\/year/i);
    if (annual) return { value: `£${annual[1]}`, detail: '/year' };
    if (Number.isFinite(Number(receipt.recurringCostPence))) return { value: `£${(Number(receipt.recurringCostPence) / 100).toFixed(2)}`, detail: '/month equivalent' };
  }
  if (Number.isFinite(Number(receipt.recurringCostPence))) return { value: `£${(Number(receipt.recurringCostPence) / 100).toFixed(2)}`, detail: '/month' };
  return { value: 'Selected', detail: 'See provider details' };
}

function serviceCard(view) {
  return `<a class="service-card" data-service="${view.key}" href="${esc(view.url)}" target="_blank" rel="noopener"><div class="service-icon" aria-hidden="true">${icon(view.icon)}</div><div class="service-copy"><small>Independent website</small><h3>${esc(view.name)}</h3><p class="service-recommendation">${esc(view.summary)}</p><p class="service-note">${esc(view.note)}</p></div><span class="service-state" data-state="${view.status.tone}">${esc(view.status.label)}</span><div class="service-footer"><div class="service-price"><strong>${esc(view.price.value)}</strong><small>${esc(view.price.detail)}</small></div><span class="open">View provider →</span></div></a>`;
}

function initialCards() {
  return ['broadband', 'movers', 'energy'].map((key) => serviceCard({
    key,
    name: SERVICES[key].name,
    icon: SERVICES[key].icon,
    url: directory()[key],
    status: { label: 'Ready', tone: 'active' },
    summary: requirementCopy(key),
    note: serviceNote(key, 'not_started', false),
    price: { value: 'Not selected', detail: 'Agent can compare options' },
  })).join('');
}

function renderActivity(p) {
  const el = document.querySelector('[data-activity]');
  if (!el) return;
  if (!p.receipts.length) {
    el.innerHTML = '<article class="activity-item"><span class="activity-dot">•</span><div><time>Now</time><p>Waiting for your agent to start with the first provider.</p></div></article>';
    return;
  }
  const moverRecovered = p.receipts.some((r) => r.service === 'BoxFox Removals' && r.status === 'unavailable') && p.movers.status === 'held';
  el.innerHTML = p.receipts.slice(0, 3).map((r) => {
    const tone = r.status === 'unavailable' || r.status === 'failed' ? 'warning' : r.status === 'confirmed' || r.status === 'approved' ? 'success' : '';
    let text = r.shortSummary;
    if (r.service === 'BoxFox Removals' && r.status === 'unavailable') text = 'A removals slot disappeared before it could be held.';
    if (r.service === 'BoxFox Removals' && r.status === 'held' && moverRecovered) text = 'Fallback removals slot held after the earlier option disappeared.';
    if (r.service === 'ONE Mission Control' && r.status === 'approved') text = 'You approved this exact prepared plan and mission version.';
    return `<article class="activity-item ${tone}"><span class="activity-dot">${tone === 'warning' ? '!' : '✓'}</span><div><time>${esc(time(r.timestamp))}</time><p>${esc(text)}</p></div></article>`;
  }).join('');
}

function renderApproval(p, views) {
  const el = document.querySelector('[data-approval]');
  if (!el) return;
  const allConfirmed = p.broadband.status === 'confirmed' && p.movers.status === 'confirmed' && p.energy.status === 'confirmed';
  const ready = ['held', 'confirmed'].includes(p.broadband.status) && ['held', 'confirmed'].includes(p.movers.status) && ['prepared', 'confirmed'].includes(p.energy.status);
  const summaries = `<div class="approval-summaries">${views.map((v) => `<div class="approval-summary"><strong>${esc(v.name)}</strong><span>${esc(v.price.value)} ${esc(v.price.detail)}</span></div>`).join('')}</div>`;
  if (allConfirmed) {
    reviewOpen = false;
    el.innerHTML = `${approvalIntro('Mission complete', 'All three simulated commitments were confirmed after human approval.')}${summaries}<div class="approval-actions"><span class="status-pill">Complete</span><span class="hint">No real purchase, booking or switch occurred.</span></div>`;
    return;
  }
  if (p.approval?.status === 'approved') {
    reviewOpen = false;
    el.innerHTML = `${approvalIntro('Plan approved', `Approved for mission v${p.approval.missionVersion}. The agent may now complete the simulated confirmations.`)}${summaries}<div class="approval-actions"><span class="status-pill">Approved</span><span class="hint">Any re-plan invalidates this approval.</span></div>`;
    return;
  }
  if (!ready) {
    reviewOpen = false;
    const prepared = [p.broadband.status, p.movers.status, p.energy.status].filter((s) => ['held', 'prepared', 'confirmed'].includes(s)).length;
    el.innerHTML = `${approvalIntro('Preparing your plan', `${prepared} of 3 services are prepared. Approval stays locked until every choice is ready.`)}${summaries}<div class="approval-actions"><button class="primary" type="button" disabled>Review & approve</button><span class="hint">You stay in control.</span></div>`;
    return;
  }
  el.innerHTML = `${approvalIntro('Ready for your approval', 'Review the exact prepared choices before allowing any simulated commitment.')}${summaries}<div class="approval-actions"><button class="primary" type="button" id="review-plan">Review & approve →</button><span class="hint">You’re in control. We act after you approve.</span></div><div class="approval-review" data-review-box ${reviewOpen ? '' : 'hidden'}><div class="review-grid"><div><strong>Everything is prepared.</strong><p>Approval is bound to this exact mission version and these exact provider resources. No real purchase, booking or energy switch occurs.</p></div><button class="primary" type="button" id="approve-plan">Approve prepared plan</button></div></div>`;
  document.querySelector('#review-plan')?.addEventListener('click', () => { reviewOpen = true; renderApproval(currentProgress, views); });
  document.querySelector('#approve-plan')?.addEventListener('click', approvePlan);
}

function approvalIntro(title, text) {
  return `<div class="approval-intro"><div class="approval-icon" aria-hidden="true">${icon('shield')}</div><div><span class="kicker">HUMAN APPROVAL</span><h2>${esc(title)}</h2><p>${esc(text)}</p></div></div>`;
}

async function approvePlan() {
  const button = document.querySelector('#approve-plan');
  if (button) { button.disabled = true; button.textContent = 'Approving…'; }
  try {
    await api(`/api/approval/${encodeURIComponent(missionId)}`, { method: 'POST' });
    reviewOpen = false;
    await refresh();
    flash('Prepared plan approved for this mission version');
  } catch (error) {
    flash(error.message, true);
    if (button) { button.disabled = false; button.textContent = 'Approve prepared plan'; }
  }
}

function renderPrivacy(p) {
  const el = document.querySelector('[data-privacy]');
  if (!el) return;
  const names = ['Northstar Broadband', 'BoxFox Removals', 'Evergreen Energy'];
  const rows = names.map((service) => {
    const receipts = p.receipts.filter((r) => r.service === service);
    const categories = [...new Set(receipts.flatMap((r) => r.dataCategoriesUsed || []))];
    return { service, categories };
  }).filter((x) => x.categories.length);
  if (!rows.length) {
    el.innerHTML = '<p class="muted">No provider data has been shared yet.</p>';
    return;
  }
  el.innerHTML = rows.map((x) => `<article class="receipt"><div><b>${esc(x.service)}</b><span>Only task data it needed</span></div><strong>${esc(x.categories.join(' · '))}</strong><small>Name, email, payment details and real account data not shared</small></article>`).join('');
}

function renderLedger(p) {
  const el = document.querySelector('[data-progress]');
  if (!el) return;
  if (!p.receipts.length) {
    el.innerHTML = '<p class="muted">No provider actions yet. Ask your agent to start with broadband.</p>';
    return;
  }
  el.innerHTML = p.receipts.map((r) => `<article class="receipt"><div><b>${esc(r.service)}</b><span>${esc(r.action.replaceAll('_', ' '))}</span></div><strong>${esc(r.shortSummary)}</strong><small>${esc(r.status)} · mission v${r.missionVersion} · ${esc(time(r.timestamp))}</small></article>`).join('');
}

function overallPercent(p) {
  const weight = (state) => state === 'confirmed' ? 1 : ['held', 'prepared'].includes(state) ? .66 : 0;
  return Math.round(((weight(p.broadband.status) + weight(p.movers.status) + weight(p.energy.status)) / 3) * 100);
}

function overallLabel(p) {
  if (p.broadband.status === 'confirmed' && p.movers.status === 'confirmed' && p.energy.status === 'confirmed') return 'Complete';
  if (p.approval?.status === 'approved') return 'Approved';
  if (['stale', 'needs_recovery', 'expired'].some((state) => [p.broadband.status, p.movers.status, p.energy.status].includes(state))) return 'Needs attention';
  const ready = ['held', 'confirmed'].includes(p.broadband.status) && ['held', 'confirmed'].includes(p.movers.status) && ['prepared', 'confirmed'].includes(p.energy.status);
  return ready ? 'Ready for approval' : 'In progress';
}

function flowStep(iconName, title, copy, extraClass) {
  return `<div class="flow-step ${extraClass}"><div class="flow-icon" aria-hidden="true">${icon(iconName)}</div><div><strong>${esc(title)}</strong><small>${esc(copy)}</small></div></div>`;
}

function icon(name) {
  const icons = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5h5v5"/></svg>',
    person: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6"/></svg>',
    one: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M8 12h8"/></svg>',
    agent: '<svg viewBox="0 0 24 24"><rect x="5" y="7" width="14" height="11" rx="3"/><path d="M12 4v3M9 12h.01M15 12h.01M9 15h6"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.4 3.7 5.4 3.7 9s-1.2 6.6-3.7 9M12 3C9.5 5.4 8.3 8.4 8.3 12s1.2 6.6 3.7 9"/></svg>',
    wifi: '<svg viewBox="0 0 24 24"><path d="M4 9a12 12 0 0 1 16 0M7 12a8 8 0 0 1 10 0M10 15a4 4 0 0 1 4 0"/><circle cx="12" cy="18" r="1"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    leaf: '<svg viewBox="0 0 24 24"><path d="M19 5C11 5 6 8.5 6 14c0 3 2 5 5 5 6 0 8-7 8-14Z"/><path d="M5 20c2-5 6-8 11-10"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3 19 6v6c0 4.5-2.7 7.4-7 9-4.3-1.6-7-4.5-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  };
  return icons[name] || icons.one;
}

function directory() {
  return {
    missionId,
    missionVersion: mission?.missionVersion,
    broadband: link(PROVIDERS.broadband),
    movers: link(PROVIDERS.movers),
    energy: link(PROVIDERS.energy),
  };
}
function withDirectory(m) { return { ...m, serviceDirectory: directory() }; }
function link(base) { const url = new URL(base); url.searchParams.set('mission', missionId); return url.toString(); }
function empty() { return { type: 'object', properties: {}, additionalProperties: false }; }
async function api(path, opt = {}) { const response = await fetch(API + path, { headers: { 'content-type': 'application/json', ...(opt.headers || {}) }, ...opt }); const data = await response.json(); if (!response.ok) throw new Error(data.message || data.code || `HTTP ${response.status}`); return data; }
function date(value) { return new Date(`${value}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }
function time(value) { return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function flash(text, error = false) { let node = document.querySelector('.flash'); if (!node) { node = document.createElement('div'); node.className = 'flash'; document.body.append(node); } node.textContent = text; node.dataset.error = error ? '1' : '0'; node.setAttribute('role', error ? 'alert' : 'status'); node.setAttribute('aria-live', error ? 'assertive' : 'polite'); node.classList.add('show'); setTimeout(() => node.classList.remove('show'), 2500); }
function fatal(error) { content.innerHTML = `<div class="surface loading-card"><h2>Mission could not start</h2><p>${esc(error.message)}</p><button class="primary" id="fresh">Start fresh mission</button></div>`; document.querySelector('#fresh')?.addEventListener('click', () => { location.href = location.pathname; }); }
function esc(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
