import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const apps = ['mission', 'broadband', 'movers', 'energy'];
const css = await readFile('scripts/styles.css', 'utf8');
const e = (v) => String(v)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

for (const app of apps) {
  const c = JSON.parse(await readFile(`apps/${app}/app.json`, 'utf8'));
  const r = await build({
    entryPoints: [`apps/${app}/src/main.js`],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    write: false,
    minify: true,
    target: ['es2022'],
  });
  const html = page(c, r.outputFiles[0].text, app);
  const worker = `const H=${JSON.stringify(html)};addEventListener('fetch',e=>e.respondWith(f(e.request)));async function f(r){const u=new URL(r.url);if(u.pathname==='/health')return Response.json({ok:true,app:${JSON.stringify(app)}});return new Response(H,{headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','permissions-policy':'camera=(), microphone=(), geolocation=()'}})}`;
  await mkdir(`dist/${app}`, { recursive: true });
  await writeFile(`dist/${app}/index.html`, html);
  await writeFile(`dist/${app}/worker.js`, worker);
  console.log(`built ${app} ${worker.length}b`);
}

const api = await build({
  entryPoints: ['apps/api/src/worker.js'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  write: false,
  minify: true,
  target: ['es2022'],
});
await mkdir('dist/api', { recursive: true });
await writeFile('dist/api/worker.mjs', api.outputFiles[0].text);
console.log(`built api ${api.outputFiles[0].text.length}b`);

function page(c, js, app) {
  const accent = c.accent || '#7557ff';
  const mission = app === 'mission';
  const symbol = app === 'broadband' ? '⌁' : app === 'movers' ? '▣' : 'ϟ';
  const providerHero = mission ? '' : `<section class="provider-hero surface"><div><div class="ey">${e(c.eyebrow)}</div><h1>${e(c.headline)}</h1><p class="lede">${e(c.sub)}</p></div><div class="provider-mark" aria-hidden="true">${symbol}</div></section>`;
  const subtitle = mission
    ? '<b>One goal.</b> Many websites. <b>One agent.</b>'
    : `<b>${e(c.title)}</b> · independent WebMCP website`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${e(c.title)} · ONE</title><style>:root{--a:${e(accent)}}${css}</style></head><body class="app-${app}"><div class="w"><header class="topbar"><a class="brand" href="${mission ? '#' : 'https://webmcp-one-mission.paul-phillips1988.workers.dev'}">ONE</a><p class="tagline">${subtitle}</p><span class="top-spacer"></span><details class="site-tools"><summary aria-label="Site Tools status">Site Tools</summary><aside class="toolbox"><div class="ey">SITE TOOLS</div><div class="status" data-webmcp-status data-state="loading" role="status" aria-live="polite">Registering WebMCP…</div><p class="hint">The human interface and Site Tools share the same live state.</p><div class="agent" data-agent-log role="status" aria-live="polite"><small>Agent activity</small><strong>No tool call yet</strong><span>When an agent uses this page, the result appears here too.</span></div></aside></details></header>${providerHero}<main data-app-content><div class="surface loading-card">Loading…</div></main></div><script>${js}</script></body></html>`;
}
