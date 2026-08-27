const base=process.env.ONE_API_URL||'http://127.0.0.1:8790';
const O={mission:'https://webmcp-one-mission.paul-phillips1988.workers.dev',broadband:'https://webmcp-one-broadband.paul-phillips1988.workers.dev',movers:'https://webmcp-one-movers.paul-phillips1988.workers.dev',energy:'https://webmcp-one-energy.paul-phillips1988.workers.dev'};
async function call(path,{method='GET',origin,body}={}){const r=await fetch(base+path,{method,headers:{...(origin?{Origin:origin}:{}),...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const d=await r.json();return{status:r.status,data:d}}
function ok(v,m){if(!v)throw new Error(`ASSERT ${m}`);console.log('PASS',m)}
async function session(){const r=await call('/api/session',{method:'POST',origin:O.mission});ok(r.status===201,'session created');return r.data.mission.missionId}
async function prepare(id){const bb=await call('/api/holds/broadband',{method:'POST',origin:O.broadband,body:{missionId:id,missionVersion:1,planId:'northstar-gig',planName:'Northstar Gigabit',speedMbps:1000,monthlyPence:3400,contractMonths:24}}),mv=await call('/api/holds/movers',{method:'POST',origin:O.movers,body:{missionId:id,missionVersion:1,slotId:'boxfox-1100',startTime:'11:00',pricePence:31900,durationHours:4}}),en=await call('/api/preparations/energy',{method:'POST',origin:O.energy,body:{missionId:id,missionVersion:1,tariffId:'evergreen-eco',tariffName:'Eco Flex',annualKwh:3100,annualCostPence:95750,renewablePercent:100,greenPremiumPence:2060}});ok(bb.status===201&&mv.status===201&&en.status===201,'three-provider plan prepared');return{bb:bb.data.hold.holdId,mv:mv.data.hold.holdId}}
console.log('\nPARALLEL APPROVAL / CONFIRM RETRIES');
{
 const id=await session(),r=await prepare(id),approvals=await Promise.all(Array.from({length:8},()=>call(`/api/approval/${id}`,{method:'POST',origin:O.mission}))),good=approvals.filter(x=>x.status===201||x.status===200),tokens=[...new Set(good.map(x=>x.data.approval?.approvalToken))];
 ok(good.length===8,'all approval retries resolve safely');ok(tokens.length===1,'approval retries produce one token');
 let p=await call(`/api/progress/${id}`,{origin:O.mission});ok(p.data.receipts.filter(x=>x.service==='ONE Mission Control'&&x.action==='approve_prepared_plan'&&x.status==='approved').length===1,'approval retries create one receipt');
 const confirmations=await Promise.all(Array.from({length:10},()=>call('/api/confirm/broadband',{method:'POST',origin:O.broadband,body:{missionId:id,missionVersion:1,resourceId:r.bb,approvalToken:tokens[0]}})));
 ok(confirmations.every(x=>x.status===201||x.status===200),'confirmation retries resolve safely');p=await call(`/api/progress/${id}`,{origin:O.mission});ok(p.data.receipts.filter(x=>x.service==='Northstar Broadband'&&x.action==='confirm_broadband_order'&&x.status==='confirmed').length===1,'confirmation retries create one receipt');
}
console.log('\nPARALLEL BOXFOX LOSS');
{
 const id=await session(),calls=await Promise.all(Array.from({length:8},()=>call('/api/holds/movers',{method:'POST',origin:O.movers,body:{missionId:id,missionVersion:1,slotId:'boxfox-1030',startTime:'10:30',pricePence:28900,durationHours:4}})));
 ok(calls.every(x=>x.status===409&&x.data.code==='SLOT_NO_LONGER_AVAILABLE'),'parallel disappearing-slot retries stay structured');const p=await call(`/api/progress/${id}`,{origin:O.mission});ok(p.data.receipts.filter(x=>x.service==='BoxFox Removals'&&x.status==='unavailable').length===1,'parallel slot loss creates one receipt');
}
console.log('\nCONFIRM VS HUMAN EDIT RACE');
for(let i=0;i<5;i++){
 const id=await session(),r=await prepare(id),a=await call(`/api/approval/${id}`,{method:'POST',origin:O.mission}),token=a.data.approval.approvalToken,[c,e]=await Promise.all([call('/api/confirm/broadband',{method:'POST',origin:O.broadband,body:{missionId:id,missionVersion:1,resourceId:r.bb,approvalToken:token}}),call(`/api/mission/${id}`,{method:'PATCH',origin:O.mission,body:{broadbandMaxMonthlyGbp:30}})]);
 ok(!((c.status===201||c.status===200)&&e.status===200),`round ${i+1}: edit and confirmation cannot both win`);
}
console.log('\nAPPROVAL VS PROVIDER REPLAN RACE');
for(let i=0;i<3;i++){
 const id=await session(),r=await prepare(id),[a,n]=await Promise.all([call(`/api/approval/${id}`,{method:'POST',origin:O.mission}),call('/api/holds/movers',{method:'POST',origin:O.movers,body:{missionId:id,missionVersion:1,slotId:'boxfox-1330',startTime:'13:30',pricePence:34200,durationHours:4}})]);ok(n.status===201,`round ${i+1}: replacement succeeds`);const p=await call(`/api/progress/${id}`,{origin:O.mission});if(p.data.approval.status==='approved'){const old=await call('/api/confirm/movers',{method:'POST',origin:O.movers,body:{missionId:id,missionVersion:1,resourceId:r.mv,approvalToken:p.data.approval.approvalToken}});ok(old.status===403&&old.data.code==='APPROVAL_REQUIRED',`round ${i+1}: old resource not blessed`)}else ok(['not_approved','stale'].includes(p.data.approval.status),`round ${i+1}: replan invalidates racing approval`);ok([200,201,409].includes(a.status),`round ${i+1}: approval race stays structured`)
}
console.log('\nCONCURRENCY FLOW PASS');
