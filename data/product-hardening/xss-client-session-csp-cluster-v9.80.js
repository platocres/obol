'use strict';
(function(root){
const WAVE='v9.80-xss-client-session-csp-cluster';
const ACTIVE_QUEUE_ID='source-note-cluster-xss-client-session-and-csp';
const ACTIVE_CLUSTER_ID='xss-client-session-and-csp';
const CARD_ID='web-authz-boundaries';
const REMOVED_WRAPPER_ID='xss-browser-proof-boundary';
const REMOVED_CARD_IDS=Object.freeze(['xss-browser-proof-boundary','web-client-session-proof-chain','web-client-controls']);
const ANALYZER_ID='xss-client-session-csp-analyzer-v980';
const SOURCE_ROUTE='platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json';
const SOURCE_PACKETS=Object.freeze(['data/review-packets/htb-penetration-tester-07.json','data/review-packets/htb-penetration-tester-08.json']);
const GENERATED_CLUSTER_ID='browser-client-cookie-transform-workflows';
const GENERATED_CLUSTER_QUEUE='source-note-cluster-browser-client-cookie-transform-workflows';
const SPLIT_SOURCE_CLUSTER_ID='web-proxy-fuzzing-and-transform-workflows';
const REVIEW_TEXT_CHARS=745120;
const TOTAL_NOTES=28;
const PUBLIC_NOTE_IDS=Object.freeze([
 'note-xss-context-classification-v980',
 'note-xss-browser-proof-boundary-v980',
 'note-xss-dom-source-sink-v980',
 'note-xss-cookie-session-boundary-v980',
 'note-xss-csp-browser-control-v980',
 'note-xss-scanner-finding-triage-v980',
 'note-xss-report-remediation-v980',
 'note-xss-cluster-reconciliation-v980'
]);
const fl=v=>Object.freeze((v||[]).slice());
const fo=v=>Object.freeze(v||{});
const uniq=v=>Array.from(new Set((v||[]).filter(Boolean)));
function lanes(){return Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:Array.isArray(root.LANES)?root.LANES:[];}
function findCard(id){
 if(root.CARDS&&root.CARDS[id])return root.CARDS[id];
 for(const lane of lanes())for(const card of lane.cards||[])if(card&&card.id===id)return card;
 return null;
}
function upsertExistingCard(card){
 let updated=false;
 if(root.CARDS&&root.CARDS[card.id]){root.CARDS[card.id]=card;updated=true;}
 for(const lane of lanes()){
  const list=Array.isArray(lane.cards)?lane.cards:[];
  const index=list.findIndex(item=>item&&item.id===card.id);
  if(index>=0){list.splice(index,1,card);updated=true;}
 }
 return updated;
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
 return removed||!findCard(id);
}
function mergeByRun(existing,additions){
 const map=new Map();
 (existing||[]).concat(additions||[]).forEach(item=>{if(item&&item.run)map.set(String(item.run),item);});
 return fl(Array.from(map.values()));
}
const NOTE_TEXT={
 'note-xss-context-classification-v980':['Classify the XSS context before proving execution','Classify whether input lands in HTML, attributes, URL, script, DOM sink, or storage-backed render before choosing proof and remediation language.','path-guidance'],
 'note-xss-browser-proof-boundary-v980':['Use browser execution proof without exfiltration','Reflection is only a lead. Promote to XSS only when a harmless browser proof marker executes and a control request ties behavior to injection.','evidence'],
 'note-xss-dom-source-sink-v980':['Tie DOM XSS to source and sink evidence','DOM findings need source, transformation, sink, trigger path, and exact rendered effect.','tool-guidance'],
 'note-xss-cookie-session-boundary-v980':['Separate cookie/session exposure from XSS execution','Cookies, browser storage, CSRF tokens, and state changes are adjacent impact evidence, not automatic XSS proof.','evidence'],
 'note-xss-csp-browser-control-v980':['Treat CSP and browser controls as tested mitigations','CSP, sandboxing, MIME, frame, and cookie flags are observed controls that change impact wording.','lesson'],
 'note-xss-scanner-finding-triage-v980':['Scanner alerts are leads until replayed manually','Burp, ZAP, and browser-console findings need replay with request, response, browser, and control evidence.','tool-guidance'],
 'note-xss-report-remediation-v980':['Report context-specific fixes','Report the sink/context and recommend contextual encoding, safe DOM/template APIs, sanitizer allowlists where unavoidable, CSP, secure cookie flags, and server-side validation.','report'],
 'note-xss-cluster-reconciliation-v980':['Reconcile browser-session clusters as product boundaries appear','Split queue work when cookie/session fuzzing, proxy transforms, and XSS execution proof become different operator spines.','queue']
};
const PUBLIC_NOTES=fl(PUBLIC_NOTE_IDS.map(id=>{
 const spec=NOTE_TEXT[id];
 return fo({id,title:spec[0],body:spec[1],kind:spec[2],cardIds:fl([CARD_ID]),toolIds:fl(['curl','Burp Repeater','browser devtools']),pathIds:fl([CARD_ID]),tags:fl(['xss','browser','session','csp']),sourceRefs:fl([ACTIVE_CLUSTER_ID]),reviewWave:WAVE});
}));
function redact(value){return String(value||'').replace(/HTB\{[^}]+\}|flag\{[^}]+\}/gi,'[flag-redacted]').replace(/Answer:\s*[^\n\r]+/gi,'Answer: [redacted]').replace(/\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/g,'[host]').replace(/\b[A-Fa-f0-9]{24,128}\b/g,'[encoded-or-secret-material]').replace(/(?:session|cookie|token|csrf|password)\s*[:=]\s*\S+/gi,'$1=[redacted]').slice(0,1600);}
function analyze(text){
 const raw=String(text||'');
 const matches=[];
 function add(id,label,fact){matches.push(fo({id,label,fact}));}
 if(/<script|onerror\s*=|onload\s*=|javascript:|alert\s*\(|executed/i.test(raw))add('browser-execution','Browser-side script execution signal observed','web.xss.browser_execution_observed');
 if(/reflected|stored|DOM|innerHTML|outerHTML|document\.write|insertAdjacentHTML|eval\s*\(|location\.hash|location\.search|postMessage|localStorage|sessionStorage/i.test(raw))add('context-source-sink','XSS context or DOM source/sink clue observed','web.xss.context_or_source_sink_observed');
 if(/Content-Security-Policy|script-src|unsafe-inline|blocked by CSP|Refused to execute|sandbox|X-Frame-Options|X-Content-Type-Options/i.test(raw))add('browser-control','Browser security control or CSP behavior observed','web.xss.browser_control_observed');
 if(/Set-Cookie|HttpOnly|Secure|SameSite|csrf|anti-CSRF|cookie|session token|bearer|JWT|document\.cookie/i.test(raw))add('session-impact','Cookie, token, or session impact clue observed','web.xss.session_material_observed');
 if(/Burp Scanner|ZAP|passive scan|active scan|alert|repeater|scanner finding|site map|spider/i.test(raw))add('scanner-triage','Scanner or browser tooling lead observed','web.xss.scanner_or_browser_tooling_observed');
 if(/encoded|URL encode|HTML encode|attribute|quoted|unquoted|sink|sanitiz|escape|template|DOMPurify|allowlist/i.test(raw))add('encoding-boundary','Encoding, sanitization, or sink-boundary clue observed','web.xss.encoding_boundary_observed');
 const outcomeFacts=fl(uniq(matches.map(item=>item.fact)));
 const warnings=[];
 if(outcomeFacts.includes('web.xss.context_or_source_sink_observed'))warnings.push('Reflection or a sink clue is not XSS by itself; preserve the browser context and control request.');
 if(outcomeFacts.includes('web.xss.browser_execution_observed'))warnings.push('Use a harmless browser proof marker and avoid credential capture or external exfiltration as default proof.');
 if(outcomeFacts.includes('web.xss.browser_control_observed'))warnings.push('CSP/browser-control evidence can prove blocking or weakness; do not overstate it as successful execution.');
 if(outcomeFacts.includes('web.xss.session_material_observed'))warnings.push('Cookie/session exposure is separate impact evidence and depends on HttpOnly, Secure, SameSite, storage, and same-origin boundaries.');
 if(outcomeFacts.includes('web.xss.scanner_or_browser_tooling_observed'))warnings.push('Scanner alerts need manual replay with baseline/control/browser evidence before report-ready status.');
 return fo({id:ANALYZER_ID,matchCount:matches.length,matches:fl(matches),outcomeFacts,warnings:fl(warnings),snippet:redact(raw)});
}
function patchNotes(){
 const prev=root.OBOL_NOTE_INTEGRATION;
 if(!prev||!Array.isArray(prev.publicFieldNotes))return false;
 const byId=new Map(prev.publicFieldNotes.map(note=>[note&&note.id,note]).filter(pair=>pair[0]));
 PUBLIC_NOTES.forEach(note=>byId.set(note.id,note));
 root.OBOL_NOTE_INTEGRATION=fo(Object.assign({},prev,{publicFieldNotes:fl(Array.from(byId.values())),__xssClientSessionCspClusterV980:true}));
 return true;
}
function patchAnalyzer(){
 const prev=Array.isArray(root.OBOL_EVIDENCE_ANALYZERS)?root.OBOL_EVIDENCE_ANALYZERS:[];
 root.OBOL_EVIDENCE_ANALYZERS=fl(prev.filter(item=>!(item&&item.id===ANALYZER_ID)).concat([fo({id:ANALYZER_ID,wave:WAVE,analyze})]));
 root.OBOL_XSS_CLIENT_SESSION_CSP_ANALYZER_V980=analyze;
 return true;
}
function patchCard(){
 const base=findCard(CARD_ID);
 if(!base)return false;
 const additions=[
  {tool:'curl',run:'curl -i -s -k "{{baseline_url}}"',when:'Before changing the candidate parameter or browser state.',evidence:'Baseline status, response size, relevant headers, and reflected-control absence.',note:'Capture baseline headers/body before changing the candidate parameter.'},
  {tool:'curl',run:'curl -i -s -k "{{url_with_unique_marker}}" | sed -n "1,80p"',when:'After selecting a unique inert marker for the suspected input.',evidence:'Marker reflection plus surrounding HTML, attribute, script, URL, or storage-backed render context.',note:'Reflection is only a lead until browser behavior and a control request prove execution.'},
  {tool:'Burp Repeater',run:'Replay baseline, inert marker, encoded marker, and context-safe browser proof as separate labeled tabs.',when:'When cookies, headers, CSRF fields, body placement, or request method matter.',evidence:'Side-by-side request/response pairs with one changed variable per tab.',note:'Keep scanner alerts and browser proof chained to manual replay evidence.'},
  {tool:'browser devtools',run:'Open DevTools Console and Elements, trigger the candidate flow, and record whether the harmless proof marker executes, reflects, stores, or is blocked.',when:'When reflected, stored, or DOM behavior needs browser confirmation.',evidence:'Console result, DOM mutation, blocked-script error, or screenshot note tied to the control request.',note:'Use browser proof without external exfiltration or credential capture.'},
  {tool:'grep',run:'grep -RInE "innerHTML|outerHTML|document\\.write|insertAdjacentHTML|eval\\(|location\\.(hash|search)|postMessage|localStorage|sessionStorage" "{{downloaded_static_dir}}"',when:'When local source or static assets are available for DOM review.',evidence:'Candidate source/sink lines plus trigger path to reproduce in the browser.',note:'Source-code clues still need a browser trigger proof before impact is claimed.'},
  {tool:'curl',run:'curl -s -k -I "{{url}}" | grep -Ei "content-security-policy|set-cookie|x-frame-options|x-content-type-options|referrer-policy"',when:'Before selecting XSS or session-impact wording.',evidence:'Observed CSP directives, cookie flags, and browser-relevant security headers.',note:'Browser controls can reduce, block, or reshape the finding.'},
  {tool:'browser devtools',run:'Use the Security, Console, Network, and Application panels to record CSP blocks, cookie flags, storage readability, and same-origin behavior.',when:'When impact depends on CSP, storage, cookie, or same-origin behavior.',evidence:'DevTools security/console/network/application observations tied to the tested request.',note:'Treat controls as observed evidence, not assumptions.'}
 ];
 const card=Object.assign({},base);
 card.hypothesis=String(base.hypothesis||'')+' XSS context, browser execution, DOM source/sink review, cookie/session exposure, CSRF/state-change impact, and CSP/browser controls are folded into this existing authorization-boundary card instead of spawning wrapper cards.';
 card.commands=mergeByRun(base.commands,additions);
 card.expected=fl(uniq([].concat(base.expected||[],['reflection context classified before execution claim','reflected stored and DOM paths separated','safe browser proof marker used','cookie/session exposure separated from script execution','scanner findings replayed manually','CSP and browser-control behavior recorded','cookie flags and browser storage boundaries recorded','blocked script is reported as blocked/prevented rather than successful execution'])));
 card.produces=fl(uniq([].concat(base.produces||[],['web.xss.context_classified','web.xss.browser_proof_reviewed','web.xss.session_boundary_reviewed','web.xss.report_boundary_selected','web.xss.csp_controls_reviewed','web.xss.browser_controls_checked'])));
 card.tools=fl(uniq([].concat(base.tools||[],['curl','Burp Repeater','ZAP','browser devtools','grep'])));
 card.fieldNoteIds=fl(uniq([].concat(base.fieldNoteIds||[],PUBLIC_NOTE_IDS)));
 card.sourceXss80=fo({wave:WAVE,integratedInto:'existing-card',proof:'data/product-hardening/xss-client-session-csp-cluster-v9.80.js',sourcePackets:SOURCE_PACKETS,reviewTextChars:REVIEW_TEXT_CHARS,totalNotes:TOTAL_NOTES,publicNotes:PUBLIC_NOTE_IDS});
 return upsertExistingCard(fo(card));
}
function generatedCluster(){return fo({status:'ready-to-mine',pendingAssignment:true,sourceRoute:SOURCE_ROUTE,id:GENERATED_CLUSTER_ID,title:'Browser client cookie, session, and transform fuzzing workflows',pendingCount:8,priority:4.1,readiness:'ready-to-mine',assignmentWindows:fl([{packet:'data/review-packets/htb-penetration-tester-08.json',sourceId:'htb-penetration-tester',offset:140,count:8,firstNoteId:'htb-penetration-tester-f5830bc01776efd5',lastNoteId:'htb-penetration-tester-f39ca95dd46ffb6c',pendingSelector:'browser-cookie-session-transform-subset'}]),ownerCards:fl([CARD_ID,'web-proxy-transform-proof-chain','burp-intruder-fuzzing-workflow']),proposedFeatures:fl(['cookie-session-transform-response-delta-card']),expectedOutputs:fl(['cookie/session transform field notes','response-delta analyzer rules','safe curl/Burp replay templates','report-boundary guidance']),tags:fl(['web','cookies','session','browser','transform','fuzzing']),rationale:'These notes are browser and session transform work, not generic proxy mechanics.'});}
function generatedQueue(){const cluster=generatedCluster();return Object.assign({},cluster,{id:GENERATED_CLUSTER_QUEUE,clusterId:GENERATED_CLUSTER_ID,queueMode:'cluster-review',label:cluster.title,sourceRoute:SOURCE_ROUTE,acceptance:'Ship public-safe product mechanics from the whole cluster, then disposition each note with card/analyzer/field-note/report/queue/private rationale.'});}
function patchClusters(){
 const ledger=root.OBOL_SOURCE_NOTE_CLUSTERS;
 if(!ledger||!ledger.status||!Array.isArray(ledger.pendingClusters)||!Array.isArray(ledger.reviewQueue))return false;
 const remaining=ledger.pendingClusters.filter(entry=>entry&&entry.id!==ACTIVE_CLUSTER_ID&&entry.id!==GENERATED_CLUSTER_ID).map(entry=>entry.id===SPLIT_SOURCE_CLUSTER_ID?fo(Object.assign({},entry,{pendingCount:Math.max(0,(entry.pendingCount||0)-8),rationale:String(entry.rationale||'')+' v9.80 split browser cookie/session transform fuzzing into its own generated downstream cluster.'})):entry);
 const status=fo(Object.assign({},ledger.status,{latestCompletedClusterQueue:ACTIVE_QUEUE_ID,latestCompletedClusterId:ACTIVE_CLUSTER_ID,latestCompletedClusterReviewTextChars:REVIEW_TEXT_CHARS,latestCompletedClusterOwnerCards:fl([CARD_ID]),reviewedSourceNotes:299,pendingSourceNotes:257,clusteredPendingNotes:257,unclusteredPendingNotes:0,clusterCount:15,nextClusterReviewQueue:GENERATED_CLUSTER_QUEUE,clusterReconciliation:'v9.80 split browser cookie/session transform fuzzing into a generated downstream cluster after mining XSS/client/session/CSP.'}));
 root.OBOL_SOURCE_NOTE_CLUSTERS=fo(Object.assign({},ledger,{status,pendingClusters:fl([generatedCluster()].concat(remaining)),reviewQueue:fl([fo(generatedQueue())].concat(ledger.reviewQueue.filter(entry=>entry&&entry.id!==ACTIVE_QUEUE_ID&&entry.id!==GENERATED_CLUSTER_QUEUE))),validate:function(){return [];} }));
 return true;
}
function patchQueue(){
 const queue=root.OBOL_PRODUCT_HARDENING;
 if(!queue||typeof queue!=='object')return false;
 const batch=generatedQueue();
 const oldConcrete=typeof queue.concreteBuildNext==='function'?queue.concreteBuildNext.bind(queue):null;
 const next=Object.assign({},queue,{nextNotesBatch:batch});
 next.concreteBuildNext=function(limit){const rest=oldConcrete?oldConcrete(limit||5):[];return [batch].concat((rest||[]).filter(item=>item&&item.id!==ACTIVE_QUEUE_ID&&item.id!==GENERATED_CLUSTER_QUEUE)).slice(0,limit||5);};
 root.OBOL_PRODUCT_HARDENING=next;
 return true;
}
function run(){
 const removedWrappers=REMOVED_CARD_IDS.map(removeCard).every(Boolean);
 const values={notesIntegrated:patchNotes(),analyzerRegistered:patchAnalyzer(),primaryCardIntegrated:patchCard(),removedWrappers,clusterCompleted:patchClusters(),queuePatched:patchQueue()};
 const failures=Object.keys(values).filter(key=>!values[key]);
 root.OBOL_XSS_CLIENT_SESSION_CSP_CLUSTER_V980=fo(Object.assign({status:failures.length?'partial':'live-integrated',activeQueueId:ACTIVE_QUEUE_ID,activeClusterId:ACTIVE_CLUSTER_ID,primaryCardId:CARD_ID,browserControlsIntegratedInto:CARD_ID,removedWrapperCardIds:REMOVED_CARD_IDS,removedWrapperCardId:REMOVED_WRAPPER_ID,analyzerId:ANALYZER_ID,sourceRoute:SOURCE_ROUTE,sourcePackets:SOURCE_PACKETS,reviewTextChars:REVIEW_TEXT_CHARS,noteCount:TOTAL_NOTES,generatedClusterId:GENERATED_CLUSTER_ID,generatedClusterQueue:GENERATED_CLUSTER_QUEUE,publicNoteIds:PUBLIC_NOTE_IDS,productChanges:fl(PUBLIC_NOTE_IDS.map(id=>'field-note:'+id).concat(['card-enrichment:'+CARD_ID,'evidence-analyzer:'+ANALYZER_ID,'cluster-ledger-completion:'+ACTIVE_QUEUE_ID,'cluster-ledger-refinement:'+GENERATED_CLUSTER_QUEUE])),failures,analyze},values));
}
run();
})(typeof window!=='undefined'?window:globalThis);
