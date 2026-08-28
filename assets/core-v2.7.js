// Obol v2.7 core overlay — artifact lineage, direct command bindings, internal-network model, filtered search, and release state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v2.7.js');
const VERSION='2.7.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldAdd=C.addTypedArtifact,oldHandoff=C.applyArtifactHandoff,oldSanitize=C.sanitizedCopy;
function ensure27(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  s.ui.searchFilters27=s.ui.searchFilters27&&typeof s.ui.searchFilters27==='object'?s.ui.searchFilters27:{kind:'all',artifactKind:'all',source:'',result:'all',time:'all'};
  s.ui.intakeSource27=s.ui.intakeSource27&&typeof s.ui.intakeSource27==='object'?s.ui.intakeSource27:null;
  s.networkModel=s.networkModel&&typeof s.networkModel==='object'?s.networkModel:{};
  s.networkModel.observations=Array.isArray(s.networkModel.observations)?s.networkModel.observations:[];
  for(const k of C.TYPED_ARTIFACT_KINDS||[])for(const a of (s.typedArtifacts&&s.typedArtifacts[k])||[]){a.producedBy=Array.isArray(a.producedBy)?a.producedBy:[];a.consumedBy=Array.isArray(a.consumedBy)?a.consumedBy:[];a.tags=Array.isArray(a.tags)?a.tags:[];}
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure27(oldNew());};
C.coerceState=function(raw){return ensure27(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure27(oldMigrate(raw));};
function tinyHash(s){return C.simpleHash?C.simpleHash(String(s||'')):String(s||'').slice(0,32);}
function producerSpec(state,opts){
  opts=opts||{};const src=opts.producer||((opts.source||'').startsWith('intake')?(state.ui||{}).intakeSource27:null)||{};
  return {id:src.id||('producer-'+tinyHash([src.activityId,src.cardId,src.command,opts.source,src.at].join('|'))),activityId:src.activityId||'',cardId:src.cardId||'',command:String(src.command||'').slice(0,500),source:src.source||opts.source||'intake',contextKey:src.contextKey||C.contextKey(C.normalizeContext(state,opts.context||state.activeContext)),at:src.at||opts.observedAt||C.now()};
}
function addUniqueLineage(list,item){const key=[item.activityId,item.cardId,item.command,item.source,item.contextKey].join('|');if(!list.some(x=>[x.activityId,x.cardId,x.command,x.source,x.contextKey].join('|')===key))list.push(item);}
C.addTypedArtifact=function(state,kind,value,opts){ensure27(state);const row=oldAdd(state,kind,value,opts||{});if(!row)return row;row.producedBy=Array.isArray(row.producedBy)?row.producedBy:[];row.consumedBy=Array.isArray(row.consumedBy)?row.consumedBy:[];row.tags=Array.isArray(row.tags)?row.tags:[];addUniqueLineage(row.producedBy,producerSpec(state,opts));return row;};
function recordArtifactConsumption(state,row,consumer){ensure27(state);if(!row)return null;row.consumedBy=Array.isArray(row.consumedBy)?row.consumedBy:[];consumer=consumer||{};const c={id:consumer.id||C.uid('consume'),cardId:consumer.cardId||'',commandId:consumer.commandId||'',field:consumer.field||'',param:consumer.param||'',source:consumer.source||'operator-handoff',contextKey:consumer.contextKey||C.contextKey(C.normalizeContext(state,consumer.context||state.activeContext)),at:consumer.at||C.now()};addUniqueLineage(row.consumedBy,c);state.updatedAt=C.now();return c;}
C.applyArtifactHandoff=function(state,row){const h=oldHandoff(state,row);if(h)recordArtifactConsumption(state,row,{field:'shared parameter',param:h.param,source:'artifact-handoff'});return h;};
function roleForArtifact(row){if(!row)return[];if(row.kind==='hosts')return['target','host','rhost','destination','server'];if(row.kind==='urls')return['url','uri','endpoint'];if(row.kind==='shares')return['share','unc'];if(row.kind==='subnets')return['subnet','network','cidr','route'];if(row.kind==='tickets')return['ticket','ccache','kirbi','file','path'];if(row.kind==='certificates')return['certificate','cert','pfx','pem','file','path'];if(row.kind==='files')return['file','path','wordlist','userlist','hashfile'];if(row.kind==='secrets')return[/^[0-9a-f]{32}$/i.test(row.value)?'hash':'password','secret','token','credential'];return[];}
function fieldText(o){return [o.id,o.arg,o.label,o.semantic,o.placeholder,o.tip].filter(Boolean).join(' ').toLowerCase();}
function artifactBindingsForCard(state,card,ctx){
  ensure27(state);if(!card||!C.typedArtifactsFor)return[];const arts=C.typedArtifactsFor(state,null,ctx||state.activeContext),out=[];
  for(const [index,cmd] of (card.commands||[]).entries()){
    const cid=C.commandId(cmd,index),refs=[];String(cmd.run||'').replace(/{{(\w+)}}/g,(m,k)=>{if(!refs.includes(k))refs.push(k);return m;});
    for(const row of arts){const roles=roleForArtifact(row);for(const p of refs)if(roles.some(r=>p.toLowerCase().includes(r)||r.includes(p.toLowerCase())))out.push({row,cardId:card.id,commandId:cid,index,tool:cmd.tool||'',fieldType:'param',field:p,label:p});
      for(const [oi,o] of (cmd.opts||[]).entries()){if(!o.arg)continue;const txt=fieldText(o),role=roles.find(r=>txt.includes(r));if(role)out.push({row,cardId:card.id,commandId:cid,index,tool:cmd.tool||'',fieldType:'option',field:C.optionId(o,oi),label:o.semantic||o.label||o.arg});}
    }
  }
  const seen=new Set();return out.filter(x=>{const k=[x.row.id,x.commandId,x.fieldType,x.field].join('|');if(seen.has(k))return false;seen.add(k);return true;});
}
function bindArtifactToCommand(state,card,row,binding){
  ensure27(state);if(!card||!row||!binding)return null;const cmd=(card.commands||[])[binding.index];if(!cmd)return null;const cid=C.commandId(cmd,binding.index);if(binding.fieldType==='param'){state.params=state.params||{};state.params[binding.field]=row.value;recordArtifactConsumption(state,row,{cardId:card.id,commandId:cid,field:binding.label||binding.field,param:binding.field,source:'command-binding'});return{type:'param',field:binding.field,value:row.value};}
  state.ui.opts=state.ui.opts||{};const key=card.id+':'+cid;state.ui.opts[key]=state.ui.opts[key]||{selected:{},args:{},radio:{}};state.ui.opts[key].args=state.ui.opts[key].args||{};state.ui.opts[key].args[binding.field]=row.value;recordArtifactConsumption(state,row,{cardId:card.id,commandId:cid,field:binding.label||binding.field,source:'command-binding'});return{type:'option',field:binding.field,value:row.value};
}
function observationKey(o){return [o.type,o.interface||'',o.address||'',o.network||'',o.gateway||'',o.destination||'',o.contextKey||''].join('|').toLowerCase();}
function recordNetworkObservations(state,rows,opts){ensure27(state);opts=opts||{};const ctx=C.normalizeContext(state,opts.context||state.activeContext),key=C.contextKey(ctx),added=[];for(const raw of rows||[]){if(!raw||!raw.type)continue;const o={id:raw.id||C.uid('netobs'),type:String(raw.type),interface:String(raw.interface||''),address:String(raw.address||''),network:String(raw.network||''),gateway:String(raw.gateway||''),destination:String(raw.destination||''),metric:String(raw.metric||''),source:raw.source||opts.source||'intake',contextKey:raw.contextKey||key,contextLabel:raw.contextLabel||C.contextLabel(state,ctx),observedAt:raw.observedAt||C.now()};const k=observationKey(o);if(!state.networkModel.observations.some(x=>observationKey(x)===k)){state.networkModel.observations.push(o);added.push(o);}}
  state.updatedAt=C.now();return added;
}
function networkSummary(state,ctx){ensure27(state);const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext)),rows=state.networkModel.observations.filter(x=>x.contextKey===key||x.contextKey==='global:global');return{observations:rows,interfaces:rows.filter(x=>x.type==='interface'),routes:rows.filter(x=>x.type==='route'),hosts:(state.typedArtifacts&&state.typedArtifacts.hosts||[]).filter(x=>x.contextKey===key||x.contextKey==='global:global'),subnets:(state.typedArtifacts&&state.typedArtifacts.subnets||[]).filter(x=>x.contextKey===key||x.contextKey==='global:global')};}
function withinTime(at,time){if(time==='all'||!time)return true;const ts=Date.parse(at||'');if(!ts)return false;const age=Date.now()-ts,day=86400000;if(time==='24h')return age<=day;if(time==='7d')return age<=7*day;if(time==='30d')return age<=30*day;return true;}
function searchWorkspace27(state,lanes,query,ctx,filters){
  ensure27(state);filters={...state.ui.searchFilters27,...(filters||{})};const q=String(query||'').trim().toLowerCase(),key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext)),out=[];
  const hit=(kind,title,detail,href,hay,meta)=>{meta=meta||{};if(q&&!String(hay||'').toLowerCase().includes(q))return;if(filters.kind!=='all'&&filters.kind!==kind)return;if(filters.artifactKind!=='all'&&kind==='artifact'&&filters.artifactKind!==meta.artifactKind)return;if(filters.source&& !String(meta.source||'').toLowerCase().includes(String(filters.source).toLowerCase()))return;if(filters.result!=='all'&&kind==='activity'&&filters.result!==meta.result)return;if(filters.result!=='all'&&kind!=='activity')return;if(!withinTime(meta.at,filters.time))return;out.push({kind,title,detail,href,...meta});};
  for(const f of C.effectiveFactRecords(state,ctx))hit('fact',f.id,C.labelFact(f.id),'#/path',[f.id,f.evidence,f.source].join(' '),{source:f.source||'',at:f.observedAt||''});
  for(const k of C.TYPED_ARTIFACT_KINDS||[])for(const a of (state.typedArtifacts&&state.typedArtifacts[k])||[])if(a.contextKey===key||a.contextKey==='global:global')hit('artifact',k+' · '+(k==='secrets'?'••••••••':a.value),a.contextLabel,'#/intake',[k,a.value,a.source,(a.tags||[]).join(' ')].join(' '),{artifactKind:k,source:a.source||'',at:a.observedAt||''});
  for(const a of state.activities||[])if(a.contextKey===key)hit('activity',a.cardId,a.result+' · '+(a.failureClass||a.assessment||''),'#/card/'+encodeURIComponent(a.cardId),[a.cardId,a.command,a.evidence,a.reason,a.failureClass,a.assessment].join(' '),{source:a.source||'',result:a.result||'',at:a.at||''});
  for(const w of state.workQueue||[])if(w.contextKey===key)hit('queue',w.cardId,w.priority+' · '+w.status,'#/queue',[w.cardId,w.note,w.priority,w.status].join(' '),{source:'queue',at:w.updatedAt||w.createdAt||''});
  for(const l of lanes||[])for(const c of l.cards||[]){hit('card',c.title,c.lane||l.title,'#/card/'+encodeURIComponent(c.id),[c.id,c.title,c.hypothesis,c.lane,l.title].join(' '),{source:'methodology'});for(const cmd of c.commands||[])hit('command',c.title+' · '+cmd.tool,cmd.run,'#/card/'+encodeURIComponent(c.id),[cmd.tool,cmd.run,cmd.note].join(' '),{source:'methodology'});}
  const seen=new Set();return out.filter(x=>{const k=[x.kind,x.title,x.detail,x.href].join('|');if(seen.has(k))return false;seen.add(k);return true;}).slice(0,200);
}
C.ensure27=ensure27;C.recordArtifactConsumption=recordArtifactConsumption;C.artifactBindingsForCard=artifactBindingsForCard;C.bindArtifactToCommand=bindArtifactToCommand;C.recordNetworkObservations=recordNetworkObservations;C.networkSummary=networkSummary;C.searchWorkspace27=searchWorkspace27;
C.sanitizedCopy=function(state){const s=ensure27(oldSanitize(state));return s;};
root.OBOL_CORE_V27={VERSION,ensure27};
})(typeof window!=='undefined'?window:globalThis);
