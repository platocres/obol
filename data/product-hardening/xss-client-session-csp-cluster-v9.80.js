'use strict';
(function(root){
const WAVE='v9.80-xss-client-session-csp-cluster';
const ACTIVE_QUEUE_ID='source-note-cluster-xss-client-session-and-csp';
const ACTIVE_CLUSTER_ID='xss-client-session-and-csp';
const PRIMARY_CARD_ID='web-client-session-proof-chain';
const CONTROLS_CARD_ID='web-client-controls';
const REMOVED_WRAPPER_CARD_ID='xss-browser-proof-boundary';
const ANALYZER_ID='xss-client-session-csp-analyzer-v980';
const SOURCE_ROUTE='platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json';
const SOURCE_PACKETS=Object.freeze(['data/review-packets/htb-penetration-tester-07.json','data/review-packets/htb-penetration-tester-08.json']);
const REVIEW_TEXT_CHARS=745120;
const TOTAL_NOTES=28;
const GENERATED_CLUSTER_ID='browser-client-cookie-transform-workflows';
const GENERATED_CLUSTER_QUEUE='source-note-cluster-browser-client-cookie-transform-workflows';
const SPLIT_SOURCE_CLUSTER_ID='web-proxy-fuzzing-and-transform-workflows';
const PUBLIC_NOTE_IDS=Object.freeze(['note-xss-context-classification-v980','note-xss-browser-proof-boundary-v980','note-xss-dom-source-sink-v980','note-xss-cookie-session-boundary-v980','note-xss-csp-browser-control-v980','note-xss-scanner-finding-triage-v980','note-xss-report-remediation-v980','note-xss-cluster-reconciliation-v980']);
function fl(v){return Object.freeze((v||[]).slice());}
function fo(v){return Object.freeze(v||{});}
function uniq(v){return Array.from(new Set((v||[]).filter(Boolean)));}
function lanes(){return Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:Array.isArray(root.LANES)?root.LANES:[];}
function liveCard(id){
 if(!id)return null;
 if(root.CARDS&&root.CARDS[id])return root.CARDS[id];
 for(const lane of lanes())for(const card of lane.cards||[])if(card&&card.id===id)return card;
 return null;
}
function replaceExistingCard(card){
 let changed=false;
 if(root.CARDS&&root.CARDS[card.id]){root.CARDS[card.id]=card;changed=true;}
 for(const lane of lanes()){
  const list=Array.isArray(lane.cards)?lane.cards:[];
  const i=list.findIndex(c=>c&&c.id===card.id);
  if(i>=0){list.splice(i,1,card);changed=true;}
 }
 return changed;
}
function removeCard(id){
 let removed=false;
 if(root.CARDS&&root.CARDS[id]){delete root.CARDS[id];removed=true;}
 for(const lane of lanes()){
  if(!Array.isArray(lane.cards))continue;
  const before=lane.cards.length;
  lane.cards=lane.cards.filter(card=>!(card&&card.id===id));
  if(lane.cards.length!==before)removed=true;
 }
 return removed || !liveCard(id);
}
function cmd(tool,run,note){return fo({tool,run,note});}
function mergeCommands(existing,additions){
 const byRun=new Map();
 (existing||[]).concat(additions||[]).forEach(item=>{if(item&&item.run)byRun.set(String(item.run),item);});
 return fl(Array.from(byRun.values()));
}
function note(id,title,body,kind,tags,tools,cardIds){return fo({id,title,body,kind,cardIds:fl(cardIds||[PRIMARY_CARD_ID]),toolIds:fl(tools||['curl','Burp Repeater','browser devtools']),pathIds:fl(cardIds||[PRIMARY_CARD_ID]),tags:fl(tags),sourceRefs:fl([ACTIVE_CLUSTER_ID]),reviewWave:WAVE});}
const PUBLIC_NOTES=fl([
 note('note-xss-context-classification-v980','Classify the XSS context before proving execution','Start with where the value lands: HTML body, quoted attribute, unquoted attribute, URL, JavaScript string, template literal, DOM sink, markdown or HTML renderer, or storage-backed render. The context decides the safe marker, encoding check, browser proof, and remediation language.','path-guidance',['xss','context','browser-proof','web'],['Burp Repeater','browser devtools']),
 note('note-xss-browser-proof-boundary-v980','Use browser execution proof without exfiltration','A reflected marker proves reflection, not script execution. Promote to XSS only when the browser executes a harmless proof marker in the intended account/session and a control request shows the behavior is injection-driven. Do not use external exfiltration or credential capture as the default proof.','evidence',['xss','execution-proof','safe-proof','browser'],['browser devtools','Burp Repeater']),
 note('note-xss-dom-source-sink-v980','Tie DOM XSS to source and sink evidence','DOM findings need the source, transformation, sink, and trigger path. Record the source value, the client-side code or DOM mutation that consumes it, the browser event that reaches the sink, and the exact rendered effect.','tool-guidance',['xss','dom','source-sink','javascript'],['browser devtools','grep']),
 note('note-xss-cookie-session-boundary-v980','Separate cookie/session exposure from XSS execution','Cookie, localStorage, sessionStorage, CSRF token, and authenticated state-change observations are adjacent impact evidence, not automatic XSS proof. Record which browser-side material is readable, which is protected by HttpOnly/Secure/SameSite/CSP, and what the finding actually demonstrates.','evidence',['session','cookies','storage','impact-boundary'],['curl','browser devtools'],[PRIMARY_CARD_ID,CONTROLS_CARD_ID]),
 note('note-xss-csp-browser-control-v980','Treat CSP and browser controls as tested mitigations','CSP, sandboxing, frame restrictions, MIME sniffing, and cookie flags must be checked as observed controls. A blocked script is still useful evidence, but report it as prevented execution or defense-in-depth weakness instead of full browser execution.','lesson',['csp','browser-controls','mitigation','xss'],['curl','browser devtools'],[CONTROLS_CARD_ID,PRIMARY_CARD_ID]),
 note('note-xss-scanner-finding-triage-v980','Scanner alerts are leads until replayed manually','Burp, ZAP, and browser-console findings should feed a replayable proof chain. Keep the request, payload location, response context, browser result, and control request together before marking a finding report-ready.','tool-guidance',['burp','zap','scanner','xss'],['Burp Repeater','ZAP','browser devtools']),
 note('note-xss-report-remediation-v980','Report context-specific fixes','XSS remediation should name the sink/context and recommend output encoding for that context, safe template APIs, DOM sink replacement, sanitizer allowlists where unavoidable, CSP as defense-in-depth, secure cookie flags, and server-side validation for state-changing requests.','report',['xss','reporting','remediation','encoding']),
 note('note-xss-cluster-reconciliation-v980','Reconcile browser-session clusters as product boundaries appear','While mining browser-side material, split queue work when cookie/session fuzzing, proxy transform handling, and XSS execution proof turn out to be different operator spines. Generated cluster refinements must keep counts and public-safe windows explicit instead of becoming vague backlog prose.','queue',['cluster-reconciliation','notes','queue','browser'])
]);
const PRODUCT_CHANGES=fl(PUBLIC_NOTE_IDS.map(id=>'field-note:'+id).concat(['card-enrichment:'+PRIMARY_CARD_ID,'card-enrichment:'+CONTROLS_CARD_ID,'evidence-analyzer:'+ANALYZER_ID,'cluster-ledger-completion:'+ACTIVE_QUEUE_ID,'cluster-ledger-refinement:'+GENERATED_CLUSTER_QUEUE]));
function redact(v){return String(v||'').replace(/HTB\{[^}]+\}|flag\{[^}]+\}/gi,'[flag-redacted]').replace(/Answer:\s*[^\n\r]+/gi,'Answer: [redacted]').replace(/\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/g,'[host]').replace(/\b[A-Fa-f0-9]{24,128}\b/g,'[encoded-or-secret-material]').replace(/(?:session|cookie|token|csrf|password)\s*[:=]\s*\S+/gi,'$1=[redacted]').slice(0,1600);}
function hash(v){let h=0,s=String(v||'');for(let i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return String(Math.abs(h));}
function analyze(text){
 const raw=String(text||''),matches=[];
 function add(id,label,fact){matches.push(fo({id,label,fact}));}
 if(/\b(<script|onerror\s*=|onload\s*=|javascript:|alert\s*\(|confirm\s*\(|prompt\s*\(|svg\/onload|img\s+src|payload rendered|executed)\b/i.test(raw))add('browser-execution','Browser-side script execution signal observed','web.xss.browser_execution_observed');
 if(/\b(reflected|stored|persistent|DOM[- ]?based|innerHTML|outerHTML|document\.write|insertAdjacentHTML|eval\s*\(|location\.hash|location\.search|postMessage|localStorage|sessionStorage)\b/i.test(raw))add('context-source-sink','XSS context or DOM source/sink clue observed','web.xss.context_or_source_sink_observed');
 if(/\b(Content-Security-Policy|script-src|default-src|unsafe-inline|nonce-|strict-dynamic|blocked by CSP|Refused to execute|sandbox|X-Frame-Options|X-Content-Type-Options)\b/i.test(raw))add('browser-control','Browser security control or CSP behavior observed','web.xss.browser_control_observed');
 if(/\b(Set-Cookie|HttpOnly|Secure|SameSite|csrf|anti-CSRF|cookie|session token|bearer|JWT|document\.cookie)\b/i.test(raw))add('session-impact','Cookie, token, or session impact clue observed','web.xss.session_material_observed');
 if(/\b(Burp Scanner|ZAP|passive scan|active scan|alert|issue detail|request editor|repeater|scanner finding|site map|spider|ajax spider)\b/i.test(raw))add('scanner-triage','Scanner or browser tooling lead observed','web.xss.scanner_or_browser_tooling_observed');
 if(/\b(encoded|URL encode|HTML encode|attribute|quoted|unquoted|sink|sanitiz|escape|template|DOMPurify|allowlist)\b/i.test(raw))add('encoding-boundary','Encoding, sanitization, or sink-boundary clue observed','web.xss.encoding_boundary_observed');
 const outcomeFacts=fl(uniq(matches.map(m=>m.fact))),warnings=[];
 if(outcomeFacts.includes('web.xss.context_or_source_sink_observed'))warnings.push('Reflection or a sink clue is not XSS by itself; preserve the browser context and control request.');
 if(outcomeFacts.includes('web.xss.browser_execution_observed'))warnings.push('Use a harmless browser proof marker and avoid credential capture or external exfiltration as default proof.');
 if(outcomeFacts.includes('web.xss.browser_control_observed'))warnings.push('CSP/browser-control evidence can prove blocking or weakness; do not overstate it as successful execution.');
 if(outcomeFacts.includes('web.xss.session_material_observed'))warnings.push('Cookie/session exposure is separate impact evidence and depends on HttpOnly, Secure, SameSite, storage, and same-origin boundaries.');
 if(outcomeFacts.includes('web.xss.scanner_or_browser_tooling_observed'))warnings.push('Scanner alerts need manual replay with baseline/control/browser evidence before report-ready status.');
 return fo({id:ANALYZER_ID,matchCount:matches.length,matches:fl(matches),outcomeFacts,warnings:fl(warnings),snippetHash:hash(redact(raw)),snippet:redact(raw)});
}
function upsertNotes(){
 const prev=root.OBOL_NOTE_INTEGRATION;
 if(!prev||!Array.isArray(prev.publicFieldNotes))return false;
 const byId=new Map(prev.publicFieldNotes.map(n=>[n&&n.id,n]).filter(p=>p[0]));
 for(const n of PUBLIC_NOTES)byId.set(n.id,n);
 root.OBOL_NOTE_INTEGRATION=fo(Object.assign({},prev,{publicFieldNotes:fl(Array.from(byId.values())),__xssClientSessionCspClusterV980:true}));
 return true;
}
function registerAnalyzer(){
 const existing=Array.isArray(root.OBOL_EVIDENCE_ANALYZERS)?root.OBOL_EVIDENCE_ANALYZERS:[];
 const next=existing.filter(item=>!(item&&item.id===ANALYZER_ID));
 next.push(fo({id:ANALYZER_ID,wave:WAVE,analyze}));
 root.OBOL_EVIDENCE_ANALYZERS=fl(next);
 root.OBOL_XSS_CLIENT_SESSION_CSP_ANALYZER_V980=analyze;
 return true;
}
function enrichPrimaryCard(){
 const prev=liveCard(PRIMARY_CARD_ID);
 if(!prev)return false;
 const additions=[
  cmd('curl','curl -i -s -k "{{baseline_url}}"','Capture baseline headers/body before changing the candidate parameter. Preserve status, response size, CSP, Set-Cookie, and cache/control headers.'),
  cmd('curl','curl -i -s -k "{{url_with_unique_marker}}" | sed -n "1,80p"','Check whether a unique inert marker reflects and where it lands. Reflection is a lead, not execution proof.'),
  cmd('Burp Repeater','Replay baseline, inert marker, encoded marker, and context-safe browser proof as separate labeled tabs.','Keep one changed variable per tab so the proof chain is reviewable.'),
  cmd('browser devtools','Open DevTools Console and Elements; trigger the candidate flow; record whether the harmless proof marker executes, reflects, stores, or is blocked.','Use browser proof without external exfiltration or credential capture.'),
  cmd('grep','grep -RInE "innerHTML|outerHTML|document\\.write|insertAdjacentHTML|eval\\(|location\\.(hash|search)|postMessage|localStorage|sessionStorage" "{{downloaded_static_dir}}"','When local static assets are available, review DOM sources and sinks before claiming DOM XSS.')
 ];
 const next=fo(Object.assign({},prev,{
  hypothesis:String(prev.hypothesis||'')+' XSS context, browser execution, DOM source/sink review, cookie/session exposure, and CSRF/state-change impact stay inside this existing proof-chain card rather than spawning a separate wrapper card.',
  commands:mergeCommands(prev.commands,additions),
  expected:fl(uniq([].concat(prev.expected||[],['reflection context classified before execution claim','reflected stored and DOM paths separated','safe browser proof marker used','cookie/session exposure separated from script execution','scanner findings replayed manually']))),
  produces:fl(uniq([].concat(prev.produces||[],['web.xss.context_classified','web.xss.browser_proof_reviewed','web.xss.session_boundary_reviewed','web.xss.report_boundary_selected']))),
  tools:fl(uniq([].concat(prev.tools||[],['curl','Burp Repeater','ZAP','browser devtools','grep']))),
  fieldNoteIds:fl(uniq([].concat(prev.fieldNoteIds||[],PUBLIC_NOTE_IDS))),
  sourceXss80:fo({wave:WAVE,integratedInto:'existing-card',proof:'data/product-hardening/xss-client-session-csp-cluster-v9.80.js',sourcePackets:SOURCE_PACKETS,reviewTextChars:REVIEW_TEXT_CHARS,totalNotes:TOTAL_NOTES,publicNotes:PUBLIC_NOTE_IDS})
 }));
 return replaceExistingCard(next);
}
function enrichControlsCard(){
 const prev=liveCard(CONTROLS_CARD_ID);
 if(!prev)return false;
 const additions=[
  cmd('curl','curl -s -k -I "{{url}}" | grep -Ei "content-security-policy|set-cookie|x-frame-options|x-content-type-options|referrer-policy"','Review browser-side defensive controls before selecting impact wording.'),
  cmd('browser devtools','Use the Security, Console, Network, and Application panels to record CSP blocks, cookie flags, storage readability, and same-origin behavior.','Treat controls as observed evidence, not assumptions.')
 ];
 const next=fo(Object.assign({},prev,{
  commands:mergeCommands(prev.commands,additions),
  expected:fl(uniq([].concat(prev.expected||[],['CSP and browser-control behavior recorded','cookie flags and browser storage boundaries recorded','blocked script is reported as blocked/prevented rather than successful execution']))),
  produces:fl(uniq([].concat(prev.produces||[],['web.xss.csp_controls_reviewed','web.xss.browser_controls_checked']))),
  tools:fl(uniq([].concat(prev.tools||[],['curl','browser devtools']))),
  fieldNoteIds:fl(uniq([].concat(prev.fieldNoteIds||[],['note-xss-csp-browser-control-v980','note-xss-cookie-session-boundary-v980']))),
  sourceXss80:fo({wave:WAVE,integratedInto:'existing-card',primaryCard:PRIMARY_CARD_ID})
 }));
 return replaceExistingCard(next);
}
function generatedCluster(){return fo({status:'ready-to-mine',pendingAssignment:true,sourceRoute:SOURCE_ROUTE,assignmentBasis:'v9.80 cluster reconciliation split browser cookie/session transform fuzzing out of the broader proxy/fuzzing queue after complete-packet review',publicSafety:'public-safe generalized cluster metadata only',outputIds:fl([]),id:GENERATED_CLUSTER_ID,title:'Browser client cookie, session, and transform fuzzing workflows',pendingCount:8,priority:4.1,readiness:'ready-to-mine',assignmentWindows:fl([{packet:'data/review-packets/htb-penetration-tester-08.json',sourceId:'htb-penetration-tester',offset:140,count:8,firstNoteId:'htb-penetration-tester-f5830bc01776efd5',lastNoteId:'htb-penetration-tester-f39ca95dd46ffb6c',pendingSelector:'browser-cookie-session-transform-subset'}]),ownerCards:fl([PRIMARY_CARD_ID,CONTROLS_CARD_ID,'web-proxy-transform-proof-chain','burp-intruder-fuzzing-workflow']),proposedFeatures:fl(['cookie-session-transform-response-delta-card']),expectedOutputs:fl(['cookie/session transform field notes','response-delta analyzer rules','safe curl/Burp replay templates','report-boundary guidance']),tags:fl(['web','cookies','session','browser','transform','fuzzing']),rationale:'These notes are browser and session transform work, not generic proxy mechanics. Keep them as the next cluster so cookie/token/header mutation, response deltas, and browser storage evidence get one coherent operator spine.'});}
function generatedQueue(){const cluster=generatedCluster();return fo(Object.assign({},cluster,{id:GENERATED_CLUSTER_QUEUE,clusterId:GENERATED_CLUSTER_ID,queueMode:'cluster-review',label:cluster.title,sourceRoute:SOURCE_ROUTE,acceptance:'Ship public-safe product mechanics from the whole cluster, then disposition each note with card/analyzer/field-note/report/queue/private rationale.'}));}
function patchClusters(){
 const ledger=root.OBOL_SOURCE_NOTE_CLUSTERS;
 if(!ledger||!ledger.status||!Array.isArray(ledger.pendingClusters)||!Array.isArray(ledger.reviewQueue))return false;
 const remaining=ledger.pendingClusters.filter(entry=>entry&&entry.id!==ACTIVE_CLUSTER_ID&&entry.id!==GENERATED_CLUSTER_ID);
 const generated=generatedCluster();
 const pending=fl([generated].concat(remaining));
 const remainingQueue=ledger.reviewQueue.filter(entry=>entry&&entry.id!==ACTIVE_QUEUE_ID&&entry.id!==GENERATED_CLUSTER_QUEUE);
 const queue=fl([generatedQueue()].concat(remainingQueue));
 const oldValidate=typeof ledger.validate==='function'?ledger.validate:null;
 const status=fo(Object.assign({},ledger.status,{latestCompletedClusterQueue:ACTIVE_QUEUE_ID,latestCompletedClusterId:ACTIVE_CLUSTER_ID,latestCompletedClusterReviewTextChars:REVIEW_TEXT_CHARS,latestCompletedClusterOwnerCards:fl([PRIMARY_CARD_ID,CONTROLS_CARD_ID]),reviewedSourceNotes:299,pendingSourceNotes:257,clusteredPendingNotes:257,unclusteredPendingNotes:0,clusterCount:15,readyClusterCount:Math.max(1,ledger.status.readyClusterCount||0),nextClusterReviewQueue:GENERATED_CLUSTER_QUEUE,clusterReconciliation:'v9.80 split browser cookie/session transform fuzzing into a generated downstream cluster after mining XSS/client/session/CSP.'}));
 root.OBOL_SOURCE_NOTE_CLUSTERS=fo(Object.assign({},ledger,{status,pendingClusters:pending,reviewQueue:queue,validate:function(){const result=oldValidate?oldValidate.call(root.OBOL_SOURCE_NOTE_CLUSTERS):[];return Array.isArray(result)?result.filter(Boolean):[];}}));
 return true;
}
function patchQueue(){
 const q=root.OBOL_PRODUCT_HARDENING;
 if(!q||typeof q!=='object')return false;
 const batch=fo({id:GENERATED_CLUSTER_QUEUE,label:'Browser client cookie, session, and transform fuzzing workflows',queueMode:'cluster-review',clusterId:GENERATED_CLUSTER_ID,pendingCount:8,sourceRoute:SOURCE_ROUTE,selector:'Select cluster '+GENERATED_CLUSTER_ID+' from data/product-hardening/source-note-clusters-current.js, re-read every assigned source-window note from complete packet text, and mine the whole cluster before terminal dispositions.',acceptance:'Ship public-safe product mechanics from the whole cluster, then disposition each note with card/analyzer/field-note/report/queue/private rationale.',clusterReconciliation:'v9.80 completed the XSS/client/session/CSP cluster and split browser cookie/session transform fuzzing into this generated downstream cluster instead of blindly advancing the old broad proxy/fuzzing item.'});
 const oldConcrete=typeof q.concreteBuildNext==='function'?q.concreteBuildNext.bind(q):null;
 const next=Object.assign({},q,{nextNotesBatch:batch});
 next.concreteBuildNext=function(limit){
  const rest=oldConcrete?oldConcrete(limit||5):[];
  const filtered=(rest||[]).filter(item=>item&&item.id!==ACTIVE_QUEUE_ID&&item.id!==GENERATED_CLUSTER_QUEUE);
  return [batch].concat(filtered).slice(0,limit||5);
 };
 root.OBOL_PRODUCT_HARDENING=fo(next);
 return true;
}
function run(){
 const failures=[];
 const wrapperCardRemoved=removeCard(REMOVED_WRAPPER_CARD_ID);
 const notesIntegrated=upsertNotes();
 const analyzerRegistered=registerAnalyzer();
 const primaryCardIntegrated=enrichPrimaryCard();
 const controlsCardIntegrated=enrichControlsCard();
 const clusterCompleted=patchClusters();
 const queuePatched=patchQueue();
 for(const pair of [['notesIntegrated',notesIntegrated],['analyzerRegistered',analyzerRegistered],['primaryCardIntegrated',primaryCardIntegrated],['controlsCardIntegrated',controlsCardIntegrated],['wrapperCardRemoved',wrapperCardRemoved],['clusterCompleted',clusterCompleted],['queuePatched',queuePatched]])if(!pair[1])failures.push(pair[0]);
 const status=fo({status:failures.length?'partial':'live-integrated',activeQueueId:ACTIVE_QUEUE_ID,activeClusterId:ACTIVE_CLUSTER_ID,primaryCardId:PRIMARY_CARD_ID,controlsCardId:CONTROLS_CARD_ID,removedWrapperCardId:REMOVED_WRAPPER_CARD_ID,analyzerId:ANALYZER_ID,sourceRoute:SOURCE_ROUTE,sourcePackets:SOURCE_PACKETS,reviewTextChars:REVIEW_TEXT_CHARS,noteCount:TOTAL_NOTES,generatedClusterId:GENERATED_CLUSTER_ID,generatedClusterQueue:GENERATED_CLUSTER_QUEUE,publicNoteIds:PUBLIC_NOTE_IDS,productChanges:PRODUCT_CHANGES,notesIntegrated,analyzerRegistered,primaryCardIntegrated,controlsCardIntegrated,wrapperCardRemoved,clusterCompleted,queuePatched,failures,analyze});
 root.OBOL_XSS_CLIENT_SESSION_CSP_CLUSTER_V980=status;
 return status;
}
run();
})(typeof window!=='undefined'?window:globalThis);
