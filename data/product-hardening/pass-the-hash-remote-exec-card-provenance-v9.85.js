'use strict';
(function(root){
const PTH='pass-the-hash-proof-chain';
const FOLDED=Object.freeze(['pth-remote-exec-artifacts','pth-token-filtering-check']);
const ACTIVE='source-note-cluster-pass-the-hash-and-remote-exec-artifacts';
const CLUSTER='pass-the-hash-and-remote-exec-artifacts';
const NEXT='source-note-cluster-shells-payloads-and-file-transfer-stabilization';
const PUBLIC_NOTES=Object.freeze(['note-pth-material-source-scope-v985','note-pth-auth-success-scope-v985','note-pth-process-context-v985','note-pth-smb-admin-share-proof-v985','note-pth-remote-exec-artifacts-v985','note-pth-winrm-rdp-boundaries-v985','note-pth-token-filtering-failure-v985','note-pth-failure-disposition-v985','note-pth-report-redaction-cleanup-v985','note-pth-dashboard-handoff-v985']);
const BAD=/fills an unresolved methodology gap|methodology gap|UNKNOWN|source-mining|source re-mining|release cleanup|patch panel|stabilizer/i;
const KEY_BAD=/^(source|sourceMined|latestPartialRemine|remine|provenance)/i;
const ROUTE_REGISTRIES=Object.freeze(['CARDS','OBOL_CARDS','OBOL_LANES','LANES','OBOL_LIVE_CARDS','OBOL_PATH_CARDS','OBOL_NEXT_STEP_CARDS','OBOL_RECOMMENDATION_CARDS','OBOL_ACTION_CARDS','OBOL_CARD_INDEX','OBOL_CARD_REGISTRY','OBOL_CARD_ROUTES','OBOL_ROUTE_CARDS','OBOL_PATH_RECOMMENDATIONS','OBOL_NEXT_STEP_RECOMMENDATIONS']);
function freeze(list){return Object.freeze((list||[]).slice());}
function frozen(obj){return Object.freeze(obj||{});}
function uniq(list){return Array.from(new Set((list||[]).filter(Boolean)));}
function list(base,extra){return freeze(uniq([].concat(base||[],extra||[])));}
function lanes(){return Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:Array.isArray(root.LANES)?root.LANES:[];}
function cardById(id){if(root.CARDS&&root.CARDS[id])return root.CARDS[id];for(const lane of lanes())for(const card of lane.cards||[])if(card&&card.id===id)return card;return null;}
function dirty(value){return BAD.test(JSON.stringify(value));}
function isFoldedId(value){return FOLDED.includes(String(value||''));}
function isFoldedEntry(entry){return !!(entry&&typeof entry==='object'&&(isFoldedId(entry.id)||isFoldedId(entry.cardId)||isFoldedId(entry.pathId)||isFoldedId(entry.routeId)||isFoldedId(entry.refId)));}
function cleanRouteArray(items,seen){
 if(Object.isFrozen(items))return items;
 for(let i=items.length-1;i>=0;i-=1){
  const item=items[i];
  if(isFoldedEntry(item)){items.splice(i,1);continue;}
  cleanRouteContainer(item,seen);
 }
 return items;
}
function cleanRouteObject(obj,seen){
 if(Object.isFrozen(obj))return obj;
 for(const id of FOLDED)if(Object.prototype.hasOwnProperty.call(obj,id))delete obj[id];
 for(const [key,value] of Object.entries(obj)){
  if(isFoldedId(key)){delete obj[key];continue;}
  if(isFoldedEntry(value)){delete obj[key];continue;}
  cleanRouteContainer(value,seen);
 }
 return obj;
}
function cleanRouteContainer(value,seen){
 if(!value||typeof value!=='object')return value;
 if(seen.has(value))return value;
 seen.add(value);
 if(Array.isArray(value))return cleanRouteArray(value,seen);
 return cleanRouteObject(value,seen);
}
function cleanValue(value){
 if(Array.isArray(value))return freeze(value.map(cleanValue).filter(item=>item!==undefined&&!dirty(item)));
 if(value&&typeof value==='object'){
  const out={};
  for(const [key,inner] of Object.entries(value)){
   if(KEY_BAD.test(key)||BAD.test(String(key)))continue;
   const cleaned=cleanValue(inner);
   if(cleaned===undefined||dirty(cleaned))continue;
   out[key]=cleaned;
  }
  return frozen(out);
 }
 if(typeof value==='string')return BAD.test(value)?undefined:value;
 return value;
}
function cmd(tool,run,when,evidence,note){return frozen({tool,run,when,evidence,useWhen:when,expected:evidence,note:note||evidence});}
function rows(base,extra){const map=new Map();(base||[]).concat(extra||[]).forEach(row=>{if(!row)return;const run=String(row.run||row.command||row.value||'');if(!run)return;const normalized=Object.assign({},row,{tool:row.tool||'operator',run,when:row.when||row.useWhen||'When this proof branch is selected.',evidence:row.evidence||row.expected||row.note||'Record the command result and decision boundary.',useWhen:row.useWhen||row.when||'When this proof branch is selected.',expected:row.expected||row.evidence||row.note||'Record the command result and decision boundary.',note:row.note||row.evidence||row.expected||'Record the command result and decision boundary.'});if(!dirty(normalized))map.set(run,frozen(normalized));});return freeze(Array.from(map.values()));}
function publishCard(card){
 if(!card||!card.id)return false;
 if(root.CARDS&&typeof root.CARDS==='object')root.CARDS[PTH]=card;else root.CARDS={[PTH]:card};
 let placed=false;
 for(const lane of lanes()){
  if(!Array.isArray(lane.cards)||Object.isFrozen(lane.cards))continue;
  const idx=lane.cards.findIndex(entry=>entry&&entry.id===PTH);
  if(idx>=0){lane.cards.splice(idx,1,card);placed=true;}
 }
 if(!placed){let lane=lanes().find(entry=>entry&&(entry.id==='credentials'||entry.lane==='credentials'));if(!lane){lane={id:'credentials',lane:'credentials',title:'Credentials',cards:[]};if(Array.isArray(root.OBOL_LANES)&&!Object.isFrozen(root.OBOL_LANES))root.OBOL_LANES.push(lane);else root.OBOL_LANES=[lane];}if(lane&&Array.isArray(lane.cards)&&!Object.isFrozen(lane.cards))lane.cards.push(card);}
 return true;
}
function publishPth(){
 const base=cleanValue(cardById(PTH)||{id:PTH,title:'Pass-the-Hash Proof Chain',lane:'credentials',commands:[],expected:[],produces:[],tools:[]});
 const extraCommands=[
  cmd('reg','reg query HKLM\\System\\CurrentControlSet\\Control\\Lsa /v DisableRestrictedAdmin','When RDP hash access or restricted-admin behavior is being explained.','Restricted Admin policy value or explicit absence.','RDP hash behavior depends on policy and service reachability.'),
  cmd('operator-cleanup','Separate SMB authentication, ADMIN$ write access, SCM control, shell receipt, service/task artifacts, and cleanup before report wording','When any pass-the-hash validation creates or attempts remote execution.','Channel result, artifact inventory, cleanup state, and report-safe summary.','This folds the old remote-exec helper path into the canonical PtH card.'),
  cmd('operator-cleanup','Classify failed PtH attempts as material, identity, protocol, privilege, reachability, token filtering, Restricted Admin, or lockout-risk before the next test','When hash-based authentication fails or partially succeeds.','One failure disposition with the next variable to narrow.','This folds the old token-filtering helper path into the canonical PtH card.')
 ];
 const expected=list([].concat(base.expected||[],base.expectedEvidence||[]),['NT hash material class identity and source recorded before reuse','Local account domain account and unconfirmed scope separated','SMB authentication admin share write SCM control and shell proof separated','WinRM RDP SMB WMI service and scheduled-task channels tested independently','Token filtering restricted-admin and remote-UAC policy considered before failure disposition','Remote execution artifacts and cleanup recorded','Raw hashes passwords payloads and flags redacted from report output']);
 const card=frozen(Object.assign({},base,{id:PTH,title:base.title||'Pass-the-Hash Proof Chain',lane:base.lane||'credentials',operatorGoal:base.operatorGoal||base.goal||base.hypothesis||'Validate NTLM hash material through scoped service proof while separating authentication, privilege, remote execution artifacts, token filtering, and cleanup.',hypothesis:base.hypothesis||'Treat pass-the-hash as protocol-scoped authentication material, not universal access.',commands:rows(base.commands,extraCommands),expected,expectedEvidence:expected,failureModes:list(base.failureModes,['Hash-shaped material is not NTLM-compatible or belongs to the wrong identity.','The tested account is valid but lacks remote administrative rights on the target.','SMB, WinRM, RDP, WMI, or SCM is blocked or disabled for the selected path.','Remote UAC, token filtering, or Restricted Admin policy changes the result.','The attempt created service, task, upload, process, or listener artifacts that still need cleanup.']),nextSteps:list(base.nextSteps,['If SMB auth succeeds, separately test admin share, SCM, WinRM, WMI, or RDP as appropriate.','If remote execution succeeds, inventory artifacts and complete cleanup/report notes.','If local-account PtH fails, check token filtering and service reachability before discarding the material.','After this cluster, move to shell receipt, payload, file-transfer, listener, and stabilization work.']),produces:list(base.produces,['auth.nt_hash_scope_reviewed','auth.pth_protocol_validation_reviewed','auth.remote_exec_artifact_reviewed','auth.token_filtering_reviewed','auth.restricted_admin_reviewed','auth.local_account_scope_reviewed','auth.pth_failure_disposition_reviewed','auth.pth_cleanup_reviewed','cleanup.remote_exec_recorded','evidence.pth_report_boundary_reviewed']),tools:list(base.tools,['nxc','crackmapexec','impacket-psexec','impacket-wmiexec','impacket-smbexec','impacket-atexec','evil-winrm','xfreerdp','mimikatz','reg','sc.exe']),fieldNoteIds:list(base.fieldNoteIds,PUBLIC_NOTES),foldedFrom:list(base.foldedFrom,FOLDED),passTheHashRemoteExec85:frozen({wave:'v9.85-pass-the-hash-remote-exec-cluster',integratedInto:'existing-card',clusterId:CLUSTER,foldedAliases:freeze(FOLDED)})}));
 return publishCard(card)&&!dirty(card);
}
function removeFoldedAliases(){
 if(root.CARDS&&typeof root.CARDS==='object')for(const id of FOLDED)delete root.CARDS[id];
 for(const lane of lanes())if(Array.isArray(lane.cards)&&!Object.isFrozen(lane.cards))lane.cards=lane.cards.filter(card=>!(card&&FOLDED.includes(card.id)));
 const seen=new Set();
 for(const key of ROUTE_REGISTRIES)if(root[key])cleanRouteContainer(root[key],seen);
 return FOLDED.every(id=>!(root.CARDS&&root.CARDS[id])&&!lanes().some(lane=>Array.isArray(lane.cards)&&lane.cards.some(card=>card&&card.id===id)));
}
function normalizeNotes(){
 const holder=root.OBOL_NOTE_INTEGRATION;
 if(!holder||!Array.isArray(holder.publicFieldNotes))return false;
 root.OBOL_NOTE_INTEGRATION=frozen(Object.assign({},holder,{publicFieldNotes:freeze(holder.publicFieldNotes.map(note=>{
  if(!note||!String(note.id||'').includes('-pth-'))return note;
  return frozen(Object.assign({},note,{cardIds:freeze([PTH]),pathIds:freeze([PTH])}));
 }))}));
 return true;
}
function withLocalAuthScope(analysis,text){
 const facts=list(analysis&&analysis.outcomeFacts,/(^|\s)--local-auth(\s|$)/i.test(String(text||''))?['auth.local_account_scope_observed']:[]);
 return frozen(Object.assign({},analysis||{},facts.length?{outcomeFacts:facts,matchCount:Math.max(Number((analysis&&analysis.matchCount)||0),facts.length)}:{}));
}
function patchAnalyzer(){
 const packet=root.OBOL_PTH_REMOTE_EXEC_PACKET_V985;
 if(packet&&typeof packet.analyze==='function'&&!packet.__localAuthScopeV985){
  const original=packet.analyze.bind(packet);
  root.OBOL_PTH_REMOTE_EXEC_PACKET_V985=frozen(Object.assign({},packet,{__localAuthScopeV985:true,analyze:function(text){return withLocalAuthScope(original(text),text);}}));
 }
 const analyzer=root.OBOL_PTH_REMOTE_EXEC_ANALYZER_V985;
 if(analyzer&&typeof analyzer.analyze==='function'&&!analyzer.__localAuthScopeV985){
  const original=analyzer.analyze.bind(analyzer);
  root.OBOL_PTH_REMOTE_EXEC_ANALYZER_V985=frozen(Object.assign({},analyzer,{__localAuthScopeV985:true,analyze:function(text){return withLocalAuthScope(original(text),text);}}));
 }
 if(Array.isArray(root.OBOL_EVIDENCE_ANALYZERS))root.OBOL_EVIDENCE_ANALYZERS=freeze(root.OBOL_EVIDENCE_ANALYZERS.map(item=>{
  if(!item||item.id!=='pass-the-hash-remote-exec-evidence-analyzer-v985'||typeof item.analyze!=='function'||item.__localAuthScopeV985)return item;
  const original=item.analyze.bind(item);
  return frozen(Object.assign({},item,{__localAuthScopeV985:true,analyze:function(text){return withLocalAuthScope(original(text),text);}}));
 }));
 return true;
}
function patchWave(){
 const prev=root.OBOL_PASS_THE_HASH_REMOTE_EXEC_CLUSTER_V985;
 if(!prev)return false;
 root.OBOL_PASS_THE_HASH_REMOTE_EXEC_CLUSTER_V985=frozen(Object.assign({},prev,{primaryCardId:PTH,enrichedCardIds:freeze([PTH]),ownerCardIds:freeze([PTH]),foldedAliasIds:freeze(FOLDED),remoteIntegrated:true,tokenIntegrated:true,foldedAliases:true,failures:freeze((prev.failures||[]).filter(Boolean))}));
 return true;
}
function patchClusters(){
 const clusters=root.OBOL_SOURCE_NOTE_CLUSTERS;
 if(!clusters||!clusters.status)return false;
 root.OBOL_SOURCE_NOTE_CLUSTERS=frozen(Object.assign({},clusters,{status:frozen(Object.assign({},clusters.status,{latestCompletedClusterQueue:ACTIVE,latestCompletedClusterId:CLUSTER,latestCompletedClusterOwnerCards:freeze([PTH]),nextClusterReviewQueue:NEXT}))}));
 return true;
}
function run(){
 const pthClean=publishPth();
 const aliasesRemoved=removeFoldedAliases();
 const notesNormalized=normalizeNotes();
 const analyzerPatched=patchAnalyzer();
 const wavePatched=patchWave();
 const clustersPatched=patchClusters();
 root.OBOL_PTH_REMOTE_EXEC_CARD_PROVENANCE_V985=frozen({wave:'v9.85-pass-the-hash-folded-alias-cleanup',status:pthClean&&aliasesRemoved&&notesNormalized&&wavePatched&&analyzerPatched?'live-integrated':'partial',cardIds:freeze([PTH]),foldedAliasIds:freeze(FOLDED),pthClean,aliasesRemoved,notesNormalized,analyzerPatched,wavePatched,clustersPatched});
 return root.OBOL_PTH_REMOTE_EXEC_CARD_PROVENANCE_V985;
}
const first=run();
if(typeof window!=='undefined'){
 let tries=0;
 const schedule=typeof window.setTimeout==='function'?window.setTimeout.bind(window):null;
 const attempt=function(){const result=run();tries+=1;if(result.status!=='live-integrated'&&tries<160&&schedule)schedule(attempt,50);};
 if(first.status!=='live-integrated'&&schedule)schedule(attempt,0);
 if(schedule)[0,25,75,150,300,600].forEach(delay=>schedule(run,delay));
 if(typeof window.addEventListener==='function'){window.addEventListener('hashchange',attempt);window.addEventListener('focus',attempt);}
}
if(typeof module!=='undefined'&&module.exports)module.exports={run};
})(typeof window!=='undefined'?window:globalThis);
