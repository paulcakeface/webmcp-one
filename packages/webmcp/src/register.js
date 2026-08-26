const registrations = [];
export async function registerTool(tool,{readOnly=false}={}){
  const status=document.querySelector('[data-webmcp-status]');
  const log=document.querySelector('[data-agent-log]');
  if(!('modelContext' in document)){
    if(status){status.textContent='WebMCP unavailable in this browser';status.dataset.state='unsupported'}
    window.__ONE_WEBMCP__={supported:false,registered:[]};return false;
  }
  try{
    const annotations={...(tool.annotations||{})};if(readOnly)annotations.readOnlyHint=true;
    await document.modelContext.registerTool({...tool,annotations,execute:async(input,options)=>{
      if(options?.signal?.aborted)throw new DOMException('Tool execution was cancelled','AbortError');
      const result=await tool.execute(input??{},options??{});
      if(log){const when=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});log.innerHTML=`<small>Agent activity</small><strong>${esc(tool.title||tool.name)}</strong><br><span>${esc(summary(result))}</span><em>${esc(when)}</em>`;log.dataset.state='active'}
      window.dispatchEvent(new CustomEvent('one:webmcp-executed',{detail:{tool:tool.name,input:input??{},result}}));return result;
    }});
    registrations.push(tool.name);if(status){status.textContent=`Site Tools ready · ${registrations.length}`;status.dataset.state='ready'}
    window.__ONE_WEBMCP__={supported:true,registered:[...registrations]};return true;
  }catch(error){console.error('[ONE WebMCP] registration failed',error);if(status){status.textContent=`WebMCP registration failed · ${error?.name||'Error'}`;status.dataset.state='error'}window.__ONE_WEBMCP__={supported:true,registered:[...registrations],error:String(error)};return false}
}
export const registerReadOnlyTool=tool=>registerTool(tool,{readOnly:true});
function summary(v){if(typeof v==='string')return v;try{const t=JSON.stringify(v);return t.length>210?`${t.slice(0,207)}…`:t}catch{return String(v)}}
function esc(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
