import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const apps = ['mission', 'broadband', 'movers', 'energy'];
const e=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for (const app of apps) {
  const cfg = JSON.parse(await readFile(`apps/${app}/app.json`, 'utf8'));
  const result = await build({ entryPoints:[`apps/${app}/src/main.js`], bundle:true, format:'iife', platform:'browser', write:false, minify:true, target:['es2022'] });
  const html = page(cfg, result.outputFiles[0].text);
  const worker = `const H=${JSON.stringify(html)};addEventListener('fetch',e=>e.respondWith(f(e.request)));async function f(r){const u=new URL(r.url);if(u.pathname==='/health')return Response.json({ok:true,app:${JSON.stringify(app)}});return new Response(H,{headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'}})}`;
  await mkdir(`dist/${app}`, {recursive:true});
  await writeFile(`dist/${app}/index.html`, html);
  await writeFile(`dist/${app}/worker.js`, worker);
  console.log(`built ${app} ${worker.length}b`);
}

function page(c,js){return `<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${e(c.title)} · ONE</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f1e9;color:#121722;font:16px system-ui}.w{max-width:1050px;margin:auto;padding:32px 22px}nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:46px}.logo{font-size:28px;font-weight:900;letter-spacing:-2px}.tag,.status{border:1px solid #d8d5ce;border-radius:999px;padding:9px 13px;font-size:12px;font-weight:700}main{display:grid;grid-template-columns:2fr 1fr;gap:24px}.card{background:#fff;border:1px solid #dedbd3;border-radius:26px;padding:38px;box-shadow:0 22px 60px #1111}.ey{font-size:11px;font-weight:800;letter-spacing:2px;opacity:.55}h1{font-size:clamp(42px,7vw,78px);line-height:.94;letter-spacing:-4px;margin:16px 0 24px}p{line-height:1.55;opacity:.7}.status{border-radius:14px;background:#eafaf0;border-color:#c4ead2;margin:14px 0 24px}.status[data-state=unsupported],.status[data-state=error]{background:#fff0e8;border-color:#f1c8ae}.agent{background:#121722;color:white;border-radius:18px;padding:18px;margin-top:28px;min-height:116px}.agent small{display:block;opacity:.5;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}.agent span{opacity:.65}@media(max-width:720px){main{grid-template-columns:1fr}.card{padding:28px}h1{letter-spacing:-3px}}</style><body><div class=w><nav><div class=logo>ONE</div><div class=tag>${e(c.eyebrow)}</div></nav><main><section class=card><div class=ey>${e(c.eyebrow)}</div><h1>${e(c.headline)}</h1><p>${e(c.sub)}</p></section><aside class=card><b>Site Tool</b><div class=status data-webmcp-status data-state=loading>Registering WebMCP…</div><strong>${e(c.tooltitle)}</strong><p>${e(c.desc)}</p><div class=agent data-agent-log><small>Agent activity</small><b>No tool call yet</b><br><span>The live page will react when its tool runs.</span></div></aside></main></div><script>${js}</script></body></html>`}
