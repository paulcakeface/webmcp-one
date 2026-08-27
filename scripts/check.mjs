import { readFile } from 'node:fs/promises';
const expected={
  mission:['get_mission','get_service_directory','get_progress','HUMAN APPROVAL','WHAT YOUR AGENT SHARED'],
  broadband:['search_broadband_plans','hold_broadband_plan','confirm_broadband_order','MISSION_STALE','APPROVAL_REQUIRED'],
  movers:['quote_move','hold_moving_slot','confirm_moving_booking','SLOT_NO_LONGER_AVAILABLE','APPROVAL_REQUIRED'],
  energy:['compare_energy_tariffs','prepare_energy_switch','confirm_energy_switch','renewable','APPROVAL_REQUIRED']
};
let failures=0;
for(const [app,markers] of Object.entries(expected)){
  const worker=await readFile(`dist/${app}/worker.js`,'utf8');
  const html=await readFile(`dist/${app}/index.html`,'utf8');
  const checks=[
    ['service worker',worker.includes("addEventListener('fetch'")],
    ['security header',worker.includes('x-content-type-options')],
    ['registerTool',html.includes('registerTool')],
    ['document.modelContext',html.includes('modelContext')],
    ['shared agent UI',html.includes('Agent activity')],
    ['no iframe federation',!html.includes('<iframe')],
    ...markers.map(m=>[`marker ${m}`,html.includes(m)])
  ];
  const bad=checks.filter(([,ok])=>!ok).map(([name])=>name);
  if(bad.length){failures+=bad.length;console.error(`${app}: FAIL ${bad.join(', ')}`)}else console.log(`${app}: PASS (${checks.length} checks)`);
}
const api=await readFile('dist/api/worker.mjs','utf8');
const apiMarkers=['/api/session','/api/holds/broadband','/api/holds/movers','/api/preparations/energy','/api/confirm/broadband','/api/confirm/movers','/api/confirm/energy','MISSION_STALE','RESOURCE_STALE','APPROVAL_REQUIRED','PLAN_NOT_READY','SLOT_NO_LONGER_AVAILABLE','mission_approvals','energy_preparations','Access-Control-Allow-Origin','PLAN_OUTSIDE_MISSION_RULES','SLOT_OUTSIDE_MISSION_RULES','RESOURCE_EXPIRED','expires_at>?','TARIFF_OUTSIDE_MISSION_RULES','SERVICE_ALREADY_CONFIRMED','MISSION_COMMITMENT_STARTED'];
const apiBad=apiMarkers.filter(m=>!api.includes(m));
if(apiBad.length){failures+=apiBad.length;console.error(`api: FAIL ${apiBad.join(', ')}`)}else console.log(`api: PASS (${apiMarkers.length} contract checks)`);
if(failures)process.exit(1);
