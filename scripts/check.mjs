import { readFile } from 'node:fs/promises';
const apps=['mission','broadband','movers','energy'];
let failures=0;
for(const app of apps){
  const worker=await readFile(`dist/${app}/worker.js`,'utf8');
  const html=await readFile(`dist/${app}/index.html`,'utf8');
  const checks=[
    ['worker',worker.includes("addEventListener('fetch'")],
    ['security',worker.includes('x-content-type-options')],
    ['registerTool',html.includes('registerTool')],
    ['modelContext',html.includes('modelContext')],
    ['readOnlyHint',html.includes('readOnlyHint')],
    ['agent UI',html.includes('Agent activity')]
  ];
  const bad=checks.filter(([,ok])=>!ok);
  if(bad.length){failures+=bad.length;console.error(`${app}: FAIL ${bad.map(([n])=>n).join(', ')}`)}
  else console.log(`${app}: PASS`);
}
if(failures)process.exit(1);
