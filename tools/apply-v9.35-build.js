'use strict';
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const write=(rel,text)=>fs.writeFileSync(path.join(root,rel),text.replace(/\r\n/g,'\n').replace(/\s*$/,'\n'));
function replace(rel,from,to){const src=read(rel);if(!src.includes(from))throw new Error(rel+' missing expected patch anchor: '+from.slice(0,120));write(rel,src.replace(from,to));}
function insertBefore(rel,marker,text){const src=read(rel);if(src.includes(text.trim().split('\n')[0]))return;if(!src.includes(marker))throw new Error(rel+' missing insertion marker');write(rel,src.replace(marker,text+'\n'+marker));}
function run(args){const r=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});if(r.status!==0)throw new Error((r.stderr||r.stdout||args.join(' ')+' failed').trim());process.stdout.write(r.stdout||'');}

const packet='data/note-integration-packets.js';
const windowsBlock=`const WINDOWS_WAVE='v9.35-windows-privesc';
const WINDOWS_CANDIDATES=freezeList([
 'htb-penetration-tester-bfe04186f42f682f','htb-penetration-tester-dfe77c4225e11a1c','htb-penetration-tester-af816cdbafaa48dc','htb-penetration-tester-009df2affeb1d2ba','htb-penetration-tester-8edb6dd57307be15','offsec-pen-200-0cc4526b3d509ced','offsec-pen-200-a30f08718703e1b1','offsec-pen-200-536584bb9cf4c991','offsec-pen-200-b241825ed0ce40cc','offsec-pen-200-e4d3e43e7a606a74','offsec-pen-200-8d9c1610c3f9a5c2','offsec-pen-200-ce579dd1e01f9b89','offsec-pen-200-c02d4e35eb7ff26d','offsec-pen-200-40fbc4493b15f316','offsec-pen-200-035e996900a69250','offsec-pen-200-1f8d41f1fdea891b'
]);
const WINDOWS_ROWS=freezeRows([
 {noteId:'htb-penetration-tester-dfe77c4225e11a1c',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'Windows Credential Manager material contributes a durable local-escalation boundary: discovered protected secrets are credential material whose account, storage source, and later validation must remain separate from privilege proof.',outputIds:['note-windows-secret-hunting-boundary'],guidanceOnlyReason:'Credential Material and Evidence already separate recovered secrets from validated access; this source adds Windows-local discovery context rather than a missing automatic credential or escalation mechanic.'},
 {noteId:'htb-penetration-tester-af816cdbafaa48dc',disposition:'private-reference-only',reviewWave:WINDOWS_WAVE,rationale:'This source is primarily a payload-generation and framework operating reference. Keep payload recipes private because the durable Windows privilege lesson is exploit precondition, execution-context, and proof reasoning represented elsewhere in the packet.',outputIds:[]},
 {noteId:'htb-penetration-tester-009df2affeb1d2ba',disposition:'private-reference-only',reviewWave:WINDOWS_WAVE,rationale:'This source is mainly a Meterpreter feature and post-exploitation command catalog. Public Obol should preserve proof boundaries and decision guidance rather than freeze a framework-specific command recipe sheet.',outputIds:[]},
 {noteId:'htb-penetration-tester-8edb6dd57307be15',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'The cross-platform privilege-escalation overview reinforces a durable local workflow: establish current identity and host context, enumerate likely privilege boundaries, validate one concrete precondition, and keep elevated execution separate from discovery.',outputIds:['note-windows-privesc-enumeration-leads'],guidanceOnlyReason:'Existing Windows command cards and Evidence review already support the required discovery actions; the reusable improvement is how to interpret and sequence those leads rather than a new automatic escalation path.'},
 {noteId:'offsec-pen-200-0cc4526b3d509ced',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'Automated Windows enumeration contributes a durable triage rule: enumeration helpers produce leads that must be reduced to concrete writable objects, token rights, configuration weaknesses, or version-specific hypotheses before exploitation is claimed.',outputIds:['note-windows-privesc-enumeration-leads'],guidanceOnlyReason:'winPEAS and related helpers are already represented in the tool inventory and existing workflow; this source changes lead interpretation rather than requiring Obol to execute or automatically trust an enumeration finding.'},
 {noteId:'offsec-pen-200-a30f08718703e1b1',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'DLL hijacking contributes a reusable privileged-execution model: attacker-controlled search-path location, writable placement, a privileged loader, a reproducible trigger, and observed elevated effect are separate preconditions and Evidence states.',outputIds:['note-windows-privileged-execution-preconditions'],guidanceOnlyReason:'The current Path and Evidence model can represent writable paths, triggers, and execution results; no copied DLL recipe or automatic hijack mechanic is needed to preserve the durable lesson.'},
 {noteId:'offsec-pen-200-536584bb9cf4c991',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'Plaintext secret hunting contributes a durable proof rule: a password, token, configuration secret, or encoded value found on disk is candidate material and does not establish elevated access until its intended account and service context are independently validated.',outputIds:['note-windows-secret-hunting-boundary'],guidanceOnlyReason:'Credential Material already owns secret typing, redaction, and later validation. Windows file discovery adds contextual Evidence guidance rather than a missing product mechanic.'},
 {noteId:'offsec-pen-200-b241825ed0ce40cc',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'PowerShell-based information discovery reinforces that configuration, history, scripts, and user-accessible files can expose escalation leads, but matches must be reviewed for scope, sensitivity, ownership, and actual privilege relevance before promotion.',outputIds:['note-windows-privesc-enumeration-leads','note-windows-secret-hunting-boundary'],guidanceOnlyReason:'The existing PowerShell-oriented command surfaces can perform human-run discovery. The product value is lead triage and proof sequencing rather than a new broad file-search automation layer.'},
 {noteId:'offsec-pen-200-e4d3e43e7a606a74',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'UAC and post-exploitation material adds a durable Windows token boundary: local Administrators membership, a filtered medium-integrity token, a high-integrity token, and SYSTEM context are distinct states that must not be collapsed into one privilege label.',outputIds:['note-windows-token-integrity-boundary'],guidanceOnlyReason:'Obol already records identity and returned command Evidence; the missing value is explicit interpretation of token integrity and UAC state rather than an automatic bypass or privilege promotion.'},
 {noteId:'offsec-pen-200-8d9c1610c3f9a5c2',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'Scheduled Tasks contribute the reusable requirement to prove a writable action or dependency, the task execution principal, a trigger the operator can safely reason about, and a separate elevated result before calling the path exploitable.',outputIds:['note-windows-privileged-execution-preconditions'],guidanceOnlyReason:'Existing task and filesystem command cards can capture the necessary observations. Contextual precondition and cleanup guidance is sufficient without a task-modification automation feature.'},
 {noteId:'offsec-pen-200-ce579dd1e01f9b89',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'Service binary hijacking contributes a durable execution chain: writable service binary or dependency, service execution identity, restart or trigger capability, and observed elevated execution must each be established independently.',outputIds:['note-windows-privileged-execution-preconditions'],guidanceOnlyReason:'Service inspection and permission checks already exist in the historical methodology surface; the packet adds proof sequencing and reversible-change guidance rather than a new service-abuse executor.'},
 {noteId:'offsec-pen-200-c02d4e35eb7ff26d',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'Windows situational awareness contributes the durable baseline that local privilege decisions depend on current identity, integrity level, group and privilege state, OS and architecture, installed software, services, tasks, network context, and writable locations.',outputIds:['note-windows-privesc-enumeration-leads'],guidanceOnlyReason:'The current product already has Windows enumeration actions and Evidence capture. This source improves ordering and interpretation instead of justifying another versioned runtime or automatic scanner.'},
 {noteId:'offsec-pen-200-40fbc4493b15f316',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'Windows access-control theory contributes the durable distinction among identity, group membership, enabled privileges, object ACLs, integrity level, and the effective access token used by the current process.',outputIds:['note-windows-token-integrity-boundary'],guidanceOnlyReason:'These are Evidence interpretation rules. Existing command surfaces can return token and ACL state, so no new mechanic is needed merely to restate Windows access-control semantics.'},
 {noteId:'offsec-pen-200-035e996900a69250',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'Unquoted service paths reinforce that a vulnerable-looking service path is only a lead until a specific candidate search-path location is writable, the service runs with greater privilege, and an authorized trigger plus observed elevated effect confirm the chain.',outputIds:['note-windows-privileged-execution-preconditions'],guidanceOnlyReason:'The existing service and permission workflow can represent these facts. The durable product improvement is preventing configuration appearance from being treated as proven exploitation.'},
 {noteId:'offsec-pen-200-1f8d41f1fdea891b',disposition:'modeled',reviewWave:WINDOWS_WAVE,rationale:'Local exploit material contributes a durable risk and proof model: match OS, build, architecture, application state, and required privileges before use; prefer reversible lab conditions; and verify the resulting token or execution context independently after the attempt.',outputIds:['note-windows-local-exploit-risk-proof'],guidanceOnlyReason:'Exploit references and human-run commands already exist. The source adds precondition, stability, and post-exploitation proof guidance without adding automatic exploit execution.'}
]);
const WINDOWS_NOTES=freezeList([
 Object.freeze({id:'note-windows-privesc-enumeration-leads',title:'Treat Windows privilege enumeration as leads, not findings',body:'Start local privilege review from the actual process identity and host context, then reduce automated or manual enumeration into concrete hypotheses: an enabled privilege, writable object, weak service or task dependency, sensitive material, or version-specific condition. A scanner or helper match is not proof that the path is exploitable; validate the exact precondition before changing state.',kind:'path-guidance',cardIds:freezeList([]),toolIds:freezeList(['winpeas','powershell','systeminfo']),pathIds:freezeList(['path']),tags:freezeList(['windows-privesc','enumeration','permissions','proof-boundary']),sourceRefs:freezeList(['htb-penetration-tester-8edb6dd57307be15','offsec-pen-200-0cc4526b3d509ced','offsec-pen-200-b241825ed0ce40cc','offsec-pen-200-c02d4e35eb7ff26d'])}),
 Object.freeze({id:'note-windows-token-integrity-boundary',title:'Separate Windows membership, token integrity, privileges, and SYSTEM',body:'Record the effective access token used by the current process. Local Administrators membership does not by itself prove a high-integrity process, an enabled privilege does not prove it is usable in the current path, and high integrity is still distinct from SYSTEM. Treat UAC changes, token impersonation, and later elevated execution as separate Evidence transitions.',kind:'evidence',cardIds:freezeList([]),toolIds:freezeList(['whoami']),pathIds:freezeList(['path']),tags:freezeList(['windows-privesc','uac','access-token','integrity','privileges','evidence']),sourceRefs:freezeList(['offsec-pen-200-e4d3e43e7a606a74','offsec-pen-200-40fbc4493b15f316'])}),
 Object.freeze({id:'note-windows-privileged-execution-preconditions',title:'Prove every precondition in privileged Windows execution chains',body:'For service binaries, unquoted paths, scheduled tasks, DLL search order, and similar local paths, keep the chain explicit: identify the privileged execution owner, prove the exact file or directory is writable, understand the trigger, capture the resulting execution context, and restore temporary changes. A weak-looking configuration or writable parent alone is not elevated execution proof.',kind:'path-guidance',cardIds:freezeList([]),toolIds:freezeList(['powershell','icacls']),pathIds:freezeList(['path']),tags:freezeList(['windows-privesc','windows-service','scheduled-task','dll-hijack','permissions','cleanup']),sourceRefs:freezeList(['offsec-pen-200-a30f08718703e1b1','offsec-pen-200-8d9c1610c3f9a5c2','offsec-pen-200-ce579dd1e01f9b89','offsec-pen-200-035e996900a69250'])}),
 Object.freeze({id:'note-windows-secret-hunting-boundary',title:'A discovered Windows secret is material, not elevation',body:'Plaintext passwords, protected vault entries, configuration secrets, encoded values, and other user-accessible material are candidate secrets. Record where the material came from and what identity or service it appears to belong to, keep it redacted in reports, and validate it separately. Finding a secret never proves administrator or SYSTEM context by itself.',kind:'evidence',cardIds:freezeList([]),toolIds:freezeList(['powershell']),pathIds:freezeList(['path']),tags:freezeList(['windows-privesc','secret-hunting','credential-material','proof-boundary']),sourceRefs:freezeList(['htb-penetration-tester-dfe77c4225e11a1c','offsec-pen-200-536584bb9cf4c991','offsec-pen-200-b241825ed0ce40cc'])}),
 Object.freeze({id:'note-windows-local-exploit-risk-proof',title:'Match local exploit preconditions before accepting the risk',body:'Before using a local exploit in an authorized lab, confirm the affected component, OS build, architecture, required starting privileges, and other documented preconditions. Prefer a revertible test state when the exploit can destabilize the host. After the attempt, independently verify the resulting process identity, integrity level, or SYSTEM context instead of treating exploit completion as proof.',kind:'troubleshooting',cardIds:freezeList([]),toolIds:freezeList(['searchsploit','metasploit']),pathIds:freezeList(['path']),tags:freezeList(['windows-privesc','local-exploit','kernel','token-impersonation','safety','evidence']),sourceRefs:freezeList(['offsec-pen-200-1f8d41f1fdea891b'])})
]);`;
insertBefore(packet,"const priorCredentials=new Set(afterXssRows.map(row=>row.noteId));",windowsBlock);
replace(packet,
"const priorCredentials=new Set(afterXssRows.map(row=>row.noteId));\nconst credentialsNew=new Set(CREDENTIALS_ROWS.map(row=>row.noteId));\nconst reviewed=freezeList(Array.from(afterXssRows).concat(Array.from(CREDENTIALS_ROWS)));\nconst publicFieldNotes=freezeList(Array.from(afterXssNotes).concat(Array.from(CREDENTIALS_NOTES)));",
"const priorCredentials=new Set(afterXssRows.map(row=>row.noteId));\nconst credentialsNew=new Set(CREDENTIALS_ROWS.map(row=>row.noteId));\nconst afterCredentialsRows=freezeList(Array.from(afterXssRows).concat(Array.from(CREDENTIALS_ROWS)));\nconst afterCredentialsNotes=freezeList(Array.from(afterXssNotes).concat(Array.from(CREDENTIALS_NOTES)));\nconst priorWindows=new Set(afterCredentialsRows.map(row=>row.noteId));\nconst windowsNew=new Set(WINDOWS_ROWS.map(row=>row.noteId));\nconst reviewed=freezeList(Array.from(afterCredentialsRows).concat(Array.from(WINDOWS_ROWS)));\nconst publicFieldNotes=freezeList(Array.from(afterCredentialsNotes).concat(Array.from(WINDOWS_NOTES)));");
replace(packet,
"const credentialsMilestone=Object.freeze({reviewedCount:reviewed.length,dispositionCounts:frozenCounts,publicFieldNoteIds:freezeList(publicFieldNotes.map(note=>note.id))});\nconst milestones=Object.freeze({...base.milestones,[WEB_WAVE]:webMilestone,[XSS_WAVE]:xssMilestone,[CREDENTIALS_WAVE]:credentialsMilestone});\nconst ledger=Object.freeze({...base.ledger,schemaVersion:'1.7.0',reviewedCount:reviewed.length,dispositionCounts:frozenCounts,modeledSourceRefs:freezeList(reviewed.filter(row=>row.disposition==='modeled').map(row=>row.noteId)),privateReferenceSourceRefs:freezeList(reviewed.filter(row=>row.disposition==='private-reference-only').map(row=>row.noteId))});",
"const credentialsMilestone=Object.freeze({reviewedCount:afterCredentialsRows.length,dispositionCounts:Object.freeze({modeled:82,'private-reference-only':25,superseded:5,rejected:0,'pending-review':444}),publicFieldNoteIds:freezeList(afterCredentialsNotes.map(note=>note.id))});\nconst windowsMilestone=Object.freeze({reviewedCount:reviewed.length,dispositionCounts:frozenCounts,publicFieldNoteIds:freezeList(publicFieldNotes.map(note=>note.id))});\nconst milestones=Object.freeze({...base.milestones,[WEB_WAVE]:webMilestone,[XSS_WAVE]:xssMilestone,[CREDENTIALS_WAVE]:credentialsMilestone,[WINDOWS_WAVE]:windowsMilestone});\nconst ledger=Object.freeze({...base.ledger,schemaVersion:'1.8.0',reviewedCount:reviewed.length,dispositionCounts:frozenCounts,modeledSourceRefs:freezeList(reviewed.filter(row=>row.disposition==='modeled').map(row=>row.noteId)),privateReferenceSourceRefs:freezeList(reviewed.filter(row=>row.disposition==='private-reference-only').map(row=>row.noteId))});");
const credentialsPacketLine="const credentialsPacket=Object.freeze({id:'credentials-auth',reviewWave:CREDENTIALS_WAVE,status:'complete',candidateCount:CREDENTIALS_CANDIDATES.length,candidateRefs:CREDENTIALS_CANDIDATES,priorTerminalCount:CREDENTIALS_CANDIDATES.filter(ref=>priorCredentials.has(ref)).length,newlyTerminalCount:CREDENTIALS_CANDIDATES.filter(ref=>credentialsNew.has(ref)).length,deferredRefs:freezeList([]),openProductGaps:Object.freeze([]),closedProductChanges:Object.freeze([]),deferredTo:Object.freeze({}),discovery:Object.freeze({metadataPacketCandidates:93,fullTextSweepCandidates:385,curatedSubjectCandidates:CREDENTIALS_CANDIDATES.length,selection:'Private title/tag and full-text packets were substantively reviewed. The curated packet owns reusable credential material, cracking, authentication, protected-secret, and validation lessons; incidental privilege-escalation and AD/pivoting lexical matches remain with their primary packets.'})});";
replace(packet,credentialsPacketLine,credentialsPacketLine+"\nconst windowsPacket=Object.freeze({id:'windows-privesc',reviewWave:WINDOWS_WAVE,status:'complete',candidateCount:WINDOWS_CANDIDATES.length,candidateRefs:WINDOWS_CANDIDATES,priorTerminalCount:WINDOWS_CANDIDATES.filter(ref=>priorWindows.has(ref)).length,newlyTerminalCount:WINDOWS_CANDIDATES.filter(ref=>windowsNew.has(ref)).length,deferredRefs:freezeList([]),openProductGaps:Object.freeze([]),closedProductChanges:Object.freeze([]),deferredTo:Object.freeze({}),discovery:Object.freeze({metadataPacketCandidates:32,fullTextSweepCandidates:95,curatedSubjectCandidates:WINDOWS_CANDIDATES.length,selection:'Private title/tag and full-text packets were substantively reviewed. The curated packet owns reusable Windows local privilege discovery, access-token, privileged execution precondition, secret-hunting, and local-exploit proof lessons; Linux and AD/lateral matches remain with their primary packets.'})});");
replace(packet,"const packetReviews=Object.freeze({...base.packetReviews,'web-upload-inclusion':webPacket,'xss-session':xssPacket,'credentials-auth':credentialsPacket});","const packetReviews=Object.freeze({...base.packetReviews,'web-upload-inclusion':webPacket,'xss-session':xssPacket,'credentials-auth':credentialsPacket,'windows-privesc':windowsPacket});");
replace(packet," if(reviewed.length!==112)failures.push('v9.33 credentials/auth packet reviewed count must be 112');\n if(frozenCounts.modeled!==82||frozenCounts['private-reference-only']!==25||frozenCounts.superseded!==5||frozenCounts.rejected!==0||frozenCounts['pending-review']!==444)failures.push('v9.33 credentials/auth disposition counts are inconsistent');",
" if(afterCredentialsRows.length!==112)failures.push('v9.33 credentials/auth packet reviewed count must remain 112');\n const credentialCounts=credentialsMilestone.dispositionCounts;\n if(credentialCounts.modeled!==82||credentialCounts['private-reference-only']!==25||credentialCounts.superseded!==5||credentialCounts.rejected!==0||credentialCounts['pending-review']!==444)failures.push('v9.33 credentials/auth disposition milestone is inconsistent');");
replace(packet," const credentialsCovered=new Set([...CREDENTIALS_CANDIDATES.filter(ref=>priorCredentials.has(ref)),...CREDENTIALS_CANDIDATES.filter(ref=>credentialsNew.has(ref))]);\n if(credentialsCovered.size!==CREDENTIALS_CANDIDATES.length)failures.push('credentials/auth packet has unaccounted candidate refs');",
" const credentialsCovered=new Set([...CREDENTIALS_CANDIDATES.filter(ref=>priorCredentials.has(ref)),...CREDENTIALS_CANDIDATES.filter(ref=>credentialsNew.has(ref))]);\n if(credentialsCovered.size!==CREDENTIALS_CANDIDATES.length)failures.push('credentials/auth packet has unaccounted candidate refs');\n if(reviewed.length!==127)failures.push('v9.35 Windows privilege-escalation packet reviewed count must be 127');\n if(frozenCounts.modeled!==95||frozenCounts['private-reference-only']!==27||frozenCounts.superseded!==5||frozenCounts.rejected!==0||frozenCounts['pending-review']!==429)failures.push('v9.35 Windows privilege-escalation disposition counts are inconsistent');\n if(windowsPacket.candidateCount!==16||windowsPacket.priorTerminalCount!==1||windowsPacket.newlyTerminalCount!==15||windowsPacket.deferredRefs.length!==0)failures.push('Windows privilege-escalation packet closeout accounting is inconsistent');\n const windowsCovered=new Set([...WINDOWS_CANDIDATES.filter(ref=>priorWindows.has(ref)),...WINDOWS_CANDIDATES.filter(ref=>windowsNew.has(ref))]);\n if(windowsCovered.size!==WINDOWS_CANDIDATES.length)failures.push('Windows privilege-escalation packet has unaccounted candidate refs');");
replace(packet," for(const row of [...WEB_ROWS,...XSS_ROWS,...CREDENTIALS_ROWS]){"," for(const row of [...WEB_ROWS,...XSS_ROWS,...CREDENTIALS_ROWS,...WINDOWS_ROWS]){");
replace(packet," for(const note of [...WEB_NOTES,...XSS_NOTES,...CREDENTIALS_NOTES])for(const ref of note.sourceRefs)"," for(const note of [...WEB_NOTES,...XSS_NOTES,...CREDENTIALS_NOTES,...WINDOWS_NOTES])for(const ref of note.sourceRefs)");
replace(packet," if(webPacket.openProductGaps.length||xssPacket.openProductGaps.length||credentialsPacket.openProductGaps.length)failures.push('completed notes packets cannot retain unresolved product gaps');"," if(webPacket.openProductGaps.length||xssPacket.openProductGaps.length||credentialsPacket.openProductGaps.length||windowsPacket.openProductGaps.length)failures.push('completed notes packets cannot retain unresolved product gaps');");
replace(packet,"root.OBOL_NOTE_INTEGRATION=Object.freeze({...base,schemaVersion:'1.7.0'","root.OBOL_NOTE_INTEGRATION=Object.freeze({...base,schemaVersion:'1.8.0'");

const progress='data/product-hardening/note-progress-current.js';
let p=read(progress);
p=p.replace("const packetItemMap={'web-upload-inclusion':'notes-packet-web-upload-inclusion','xss-session':'notes-packet-xss-session','credentials-auth':'notes-packet-credentials-auth'};","const packetItemMap={'web-upload-inclusion':'notes-packet-web-upload-inclusion','xss-session':'notes-packet-xss-session','credentials-auth':'notes-packet-credentials-auth','windows-privesc':'notes-packet-windows-privesc'};");
p=p.replace("schemaVersion:'1.2.0'","schemaVersion:'1.3.0'");write(progress,p);

const impact='data/product-hardening/notes-impact-current.js';
let i=read(impact);
if(!i.includes("'Windows local privilege escalation'"))i=i.replace("const themeRules=[\n", "const themeRules=[\n ['Windows local privilege escalation',['windows-privesc','windows-service','scheduled-task','dll-hijack','uac','access-token','local-exploit']],\n");
i=i.replace("schemaVersion:'1.3.0'","schemaVersion:'1.4.0'");write(impact,i);

const validator='tools/validate-note-integration.js';
let v=read(validator);
v=v.replace("assert.strictEqual(notes.schemaVersion,'1.7.0');","assert.strictEqual(notes.schemaVersion,'1.8.0');")
 .replace("assert.strictEqual(notes.ledger.reviewedCount,112);","assert.strictEqual(notes.ledger.reviewedCount,127);")
 .replace("assert.strictEqual(notes.ledger.dispositionCounts.modeled,82);","assert.strictEqual(notes.ledger.dispositionCounts.modeled,95);")
 .replace("assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],25);","assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],27);")
 .replace("assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],444);","assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],429);")
 .replace("assert.strictEqual(notes.reviewedDispositions.length,112);","assert.strictEqual(notes.reviewedDispositions.length,127);")
 .replace("['v9.33-credentials-auth',112,82,25,5,444]","['v9.33-credentials-auth',112,82,25,5,444],['v9.35-windows-privesc',127,95,27,5,429]")
 .replace("assert.strictEqual(field.entries.length,43,'forty-three normalized public field notes are exposed');","assert.strictEqual(field.entries.length,48,'forty-eight normalized public field notes are exposed');")
 .replace("for(const id of ['note-auth-material-protocol-scope','note-hash-classify-before-cracking','note-auth-rate-policy-safety','note-protected-credential-container','note-basic-auth-transport-boundary','note-windows-credential-source-boundary','note-credential-reuse-validation','note-challenge-response-not-pth'])assert(field.entries.some(entry=>entry.id===id),'credentials/auth public-safe field note exists: '+id);","for(const id of ['note-auth-material-protocol-scope','note-hash-classify-before-cracking','note-auth-rate-policy-safety','note-protected-credential-container','note-basic-auth-transport-boundary','note-windows-credential-source-boundary','note-credential-reuse-validation','note-challenge-response-not-pth'])assert(field.entries.some(entry=>entry.id===id),'credentials/auth public-safe field note exists: '+id);\nfor(const id of ['note-windows-privesc-enumeration-leads','note-windows-token-integrity-boundary','note-windows-privileged-execution-preconditions','note-windows-secret-hunting-boundary','note-windows-local-exploit-risk-proof'])assert(field.entries.some(entry=>entry.id===id),'Windows privilege-escalation public-safe field note exists: '+id);")
 .replace("assert.strictEqual(credentials.discovery.fullTextSweepCandidates,385);","assert.strictEqual(credentials.discovery.fullTextSweepCandidates,385);\nconst windows=notes.packetReviews['windows-privesc'];assert(windows&&windows.status==='complete');assert.strictEqual(windows.candidateCount,16);assert.strictEqual(windows.priorTerminalCount,1);assert.strictEqual(windows.newlyTerminalCount,15);assert.strictEqual(windows.deferredRefs.length,0);assert.strictEqual(windows.openProductGaps.length,0);assert.strictEqual(windows.closedProductChanges.length,0);assert.strictEqual(windows.discovery.metadataPacketCandidates,32);assert.strictEqual(windows.discovery.fullTextSweepCandidates,95);")
 .replace("console.log('Notes integration valid: explicit 112/556 disposition ledger, 43 public-safe notes, completed credentials/auth packet, preserved milestones, and raw-source boundary are intact.');","console.log('Notes integration valid: explicit 127/556 disposition ledger, 48 public-safe notes, completed Windows privilege-escalation packet, preserved milestones, and raw-source boundary are intact.');");
write(validator,v);

const impactValidator='tools/validate-notes-impact.js';
let iv=read(impactValidator);
if(!iv.includes('Windows local privilege escalation'))iv=iv.replace("if(!impact.themes.some(theme=>theme.name==='File upload'&&theme.pathImpact&&theme.evidenceImpact&&theme.reportImpact))failures.push('file-upload theme must preserve Path, Evidence, and report impact');","if(!impact.themes.some(theme=>theme.name==='File upload'&&theme.pathImpact&&theme.evidenceImpact&&theme.reportImpact))failures.push('file-upload theme must preserve Path, Evidence, and report impact');\nif(impact.review.reviewed>=127&&!impact.themes.some(theme=>theme.name==='Windows local privilege escalation'&&theme.pathImpact&&theme.evidenceImpact))failures.push('Windows local privilege-escalation theme must preserve Path and Evidence impact after the v9.35 packet');");
write(impactValidator,iv);

const notesDoc='docs/NOTES-INTEGRATION.md';
let nd=read(notesDoc);
if(!nd.includes('## Current themed packet state')){
 const section=`## Current themed packet state

The current public-safe ledger has **127/556** notes reviewed: **95 modeled**, **27 private-reference-only**, **5 superseded**, **0 rejected**, and **429 pending**. Completed subject packets are web upload/file inclusion, XSS/session behavior, credentials/authentication, and Windows privilege escalation. Linux privilege escalation and AD/pivoting remain the next named subject packets beneath the 556-note umbrella.

The Windows privilege-escalation packet was selected after substantive review of the private title/tag shortlist (**32 candidates**) and private full-text sweep (**95 candidates**), then curated to **16** reusable subject sources. One source was already terminal from the credentials work and fifteen reached new terminal dispositions. Public guidance now covers Windows privilege-enumeration triage, access-token/integrity proof, privileged service/task/DLL execution preconditions, secret-hunting boundaries, and local-exploit risk/proof without publishing private course recipes.

`;
 nd=nd.replace('## Dispositions',section+'## Dispositions');
}
write(notesDoc,nd);

const readme='README.md';
let rm=read(readme);
const historyStart='Historical runtime layers are explicit product debt, not permanent architecture.';
const historyEnd='The completed Orange methodology/source queue is historical, regression-protected baseline material. Do not reopen it unless a real defect is found or the pinned upstream source is deliberately repinned. Detailed Orange accounting belongs in the North Star/source-depth docs above, not in this README.';
const hs=rm.indexOf(historyStart),he=rm.indexOf(historyEnd);
if(hs<0||he<hs)throw new Error('README current-state/history segment anchors missing');
const currentState=`Historical runtime layers are explicit product debt, not permanent architecture. The current Dashboard owns its route and paint, proven historical Dashboard data/presentation owners are out of live startup, and remaining runtime areas should follow the same current-owner, equivalence, fixture, live-layer removal, and obsolete-test-retirement lifecycle.

Path, Card, and Tools use a stable current operator-route owner. Path presents a compact decision screen, while Card/Tools keep guided builders first and fold raw historical command blocks behind supporting detail.

Notes Integration uses themed packets under the 556-note umbrella. Completed packets cover web upload/file inclusion, XSS/session behavior, credentials/authentication, and Windows privilege escalation; Linux privilege escalation and AD/pivoting remain live. The dashboard and generated Product Build Next block project the same current ledger and note-to-product impact state.

`;
rm=rm.slice(0,hs)+currentState+rm.slice(he);
rm=rm.replace('node tests/run-v9.34-tests.js','node tests/run-v9.35-tests.js');
write(readme,rm);

const changelog='CHANGELOG.md';
let ch=read(changelog);
ch=ch.replace('The README is intentionally reserved for current project purpose, architecture, permanent requirements, a compact summary of only the latest three releases, and forward priorities.','The README is intentionally reserved for current product purpose, permanent operating and build requirements, current architecture/state, and forward priorities. Release narratives and historical implementation summaries belong here, not in README.');
if(!ch.includes('## v9.35 — Windows privilege-escalation notes and README history ownership')){
 const marker='## v9.31 — operator route ownership and tool declutter';
 const recent=`## v9.35 — Windows privilege-escalation notes and README history ownership

- Completed the Windows privilege-escalation notes packet after substantive review of 32 private metadata candidates and 95 private full-text candidates, curating 16 reusable subject sources.
- Advanced the public-safe ledger to 127/556 reviewed: 95 modeled, 27 private-reference-only, 5 superseded, 0 rejected, and 429 pending.
- Added normalized guidance for Windows privilege-enumeration triage, access-token and integrity proof, privileged service/task/DLL execution preconditions, secret-hunting boundaries, and local-exploit risk/proof.
- Kept the packet guidance-only at the mechanics layer because the reviewed sources did not expose a missing command-builder, Path, Evidence parser, report-generator, or workflow primitive that justified new code-level behavior.
- Restored README to current-state handoff ownership, moved recent release narratives into CHANGELOG, and added a permanent README-history ownership validator to preflight and the historical contract runner.

## v9.34 — Dashboard freshness and self-update hardening

- Made Dashboard activation freshness-aware across current release, queue, work-package, notes-impact, renderer, and stylesheet owners.
- Added cache-busted current-owner reloads, generation isolation, standalone/embedded convergence, stale-global browser regression coverage, and a permanent Dashboard freshness validator.
- Preserved the stable current Dashboard owner instead of adding another versioned runtime layer.

## v9.33 — credentials and authentication notes packet

- Completed the credentials/authentication subject packet with 24 curated candidates: 2 previously terminal and 22 newly terminal.
- Advanced the cumulative notes ledger to 112 reviewed, 82 modeled, 25 private-reference-only, 5 superseded, and 444 pending.
- Added normalized guidance for credential material/protocol scope, hash classification, lockout-aware testing, protected secret containers, Basic-auth transport, Windows credential-source proof, reuse validation, and the NetNTLM/pass-the-hash distinction.
- Confirmed existing Credential Material and credential-mode mechanics covered the reviewed operational needs, so the packet added no redundant runtime or builder layer.

## v9.32 — XSS and session notes packet

- Completed the XSS/session subject packet with explicit browser-execution, delivery/trigger, session-impact, and remediation proof boundaries.
- Advanced the cumulative ledger to 90 reviewed, 63 modeled, 23 private-reference-only, 4 superseded, and 466 pending.
- Preserved raw private payload and walkthrough material outside the public repository while binding rewritten guidance to current Tool, Path, Evidence, and Report surfaces.

`;
 if(!ch.includes(marker))throw new Error('CHANGELOG v9.31 anchor missing');
 ch=ch.replace(marker,recent+marker);
 const v30=`## v9.30 — themed notes packet burn-down

- Replaced anonymous note-review waves with explicit subject packets under the 556-note disposition umbrella.
- Completed the web upload/file-inclusion packet, advancing the ledger to 76 reviewed and adding normalized proof, troubleshooting, cleanup, and remediation guidance.
- Added the first declared note-driven code-level product change: curl path preservation for traversal hypotheses where client normalization would otherwise alter the request.

`;
 const v76='## v7.6 — admin source-depth completion';
 if(ch.includes(v76)&&!ch.includes('## v9.30 — themed notes packet burn-down'))ch=ch.replace(v76,v30+v76);
}
write(changelog,ch);

write('tools/validate-readme-history-ownership.js',`'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\\r\\n/g,'\\n');
const readme=read('README.md'),changelog=read('CHANGELOG.md');
const failures=[];
if(!readme.includes('[\\`CHANGELOG.md\\`](CHANGELOG.md)'))failures.push('README must point release history to CHANGELOG.md');
if(/^##+\\s+v\\d+\\.\\d+/mi.test(readme))failures.push('README contains a release-version heading; release narratives belong in CHANGELOG.md');
const withoutGenerated=readme.replace(/<!-- OBOL-PRODUCT-BUILD-NEXT:START -->[\\s\\S]*?<!-- OBOL-PRODUCT-BUILD-NEXT:END -->/,'').replace(/Current release:\\s*\\*\\*v\\d+(?:\\.\\d+){1,2}\\*\\*/i,'');
if(/^v\\d+\\.\\d+(?:\\.\\d+)?\\s+/mi.test(withoutGenerated))failures.push('README contains a line-start release narrative; move it to CHANGELOG.md');
if(/\\bv\\d+\\.\\d+(?:\\.\\d+)?\\s+(?:completes?|completed|starts?|hardens?|adds?|moves?|introduces?|advances?|establishes?|established)\\b/i.test(withoutGenerated))failures.push('README contains version-story prose; current-state wording belongs in README and version history in CHANGELOG.md');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);vm.runInContext(read('data/current-release.js'),sandbox,{filename:'data/current-release.js'});const release=sandbox.window.OBOL_CURRENT_RELEASE;
if(!release||!changelog.includes('## '+release.label+' '))failures.push('CHANGELOG.md must contain the current release heading '+String(release&&release.label||''));
for(const label of ['v9.34','v9.33','v9.32','v9.31','v9.30'])if(!changelog.includes('## '+label+' '))failures.push('CHANGELOG.md is missing recent release history '+label);
if(!/Release narratives and historical implementation summaries belong here/i.test(changelog))failures.push('CHANGELOG.md does not declare release-history ownership');
if(failures.length){console.error('README/changelog ownership validation failed:');for(const failure of failures)console.error('- '+failure);process.exit(1);}console.log('README remains current-state only; release history is owned by CHANGELOG.md.');
`);

const preflight='tools/release-preflight.js';
let pf=read(preflight);
if(!pf.includes("'tools/validate-readme-history-ownership.js'"))pf=pf.replace("'tools/validate-open-pr-uniqueness.js'","'tools/validate-open-pr-uniqueness.js','tools/validate-readme-history-ownership.js'");
if(!pf.includes("run('README/changelog ownership'"))pf=pf.replace("run('current release README synchronization',['tools/sync-current-release.js','--check']);","run('current release README synchronization',['tools/sync-current-release.js','--check']);\n  run('README/changelog ownership',['tools/validate-readme-history-ownership.js']);");
write(preflight,pf);

const historical='tools/run-historical-contracts.js';
let hr=read(historical);
if(!hr.includes("run(['tools/validate-readme-history-ownership.js']);"))hr=hr.replace("run(['tools/validate-release-quality.js']);","run(['tools/validate-release-quality.js']);\nrun(['tools/validate-readme-history-ownership.js']);");
write(historical,hr);

write('data/product-hardening/item-test-contracts-v9.35.js',`'use strict';
(function(root){
const base=root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;if(!base||!base.contracts)throw new Error('Base Product Hardening item-test contracts must load before v9.35 contract extensions');
base.contracts['notes-packet-windows-privesc']={acceptance:['The Windows privilege-escalation packet is complete only after substantive private metadata and full-text review, full accounting of the curated sixteen-source subject set, public-safe guidance for enumeration triage, access-token/integrity proof, privileged execution preconditions, secret-hunting boundaries, and local-exploit risk/proof, explicit guidance-only decisions for every newly modeled source without a justified mechanics change, no raw private course material, synchronized current queue/notes impact, and item-specific regression proof.'],validationCommands:['node tools/validate-note-integration.js','node tools/validate-notes-impact.js','node tools/validate-readme-history-ownership.js','node tools/sync-product-build-next.js --check','node tests/run-v9.35-tests.js'],proofFiles:['data/note-integration-packets.js','data/product-hardening/note-progress-current.js','data/product-hardening/notes-impact-current.js','tools/validate-note-integration.js','tools/validate-readme-history-ownership.js','tests/run-v9.35-tests.js','docs/NOTES-INTEGRATION.md','docs/v9.35.md','CHANGELOG.md']};
base.version='9.35.0';
})(typeof window!=='undefined'?window:globalThis);
`);

write('tests/run-v9.35-tests.js',`'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');const root=path.join(__dirname,'..');const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');const run=args=>cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8',env:process.env});
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/product-hardening/item-test-contracts-tunnels.js','data/product-hardening/item-test-contracts-v9.29.js','data/product-hardening/item-test-contracts-v9.30.js','data/product-hardening/item-test-contracts-v9.31.js','data/product-hardening/item-test-contracts-v9.32.js','data/product-hardening/item-test-contracts-v9.33.js','data/product-hardening/item-test-contracts-v9.35.js','data/note-integration.js','data/note-integration-reviews.js','data/note-integration-packets.js','data/product-hardening/note-progress-current.js','data/product-hardening/notes-impact-current.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,notes=w.OBOL_NOTE_INTEGRATION,q=w.OBOL_PRODUCT_HARDENING,impact=w.OBOL_PRODUCT_HARDENING_NOTES_IMPACT,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,field=w.OBOL_FIELD_NOTES;
assert(release&&notes&&q&&impact&&contracts&&field,'v9.35 current owners load');assert.strictEqual(release.version,'9.35.0');assert.strictEqual(notes.schemaVersion,'1.8.0');assert.deepStrictEqual(Array.from(notes.validate()),[]);
assert.strictEqual(notes.ledger.reviewedCount,127);assert.strictEqual(notes.ledger.dispositionCounts.modeled,95);assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],27);assert.strictEqual(notes.ledger.dispositionCounts.superseded,5);assert.strictEqual(notes.ledger.dispositionCounts.rejected,0);assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],429);
const packet=notes.packetReviews['windows-privesc'];assert(packet&&packet.status==='complete');assert.strictEqual(packet.candidateCount,16);assert.strictEqual(packet.priorTerminalCount,1);assert.strictEqual(packet.newlyTerminalCount,15);assert.strictEqual(packet.deferredRefs.length,0);assert.strictEqual(packet.openProductGaps.length,0);assert.strictEqual(packet.closedProductChanges.length,0);assert.strictEqual(packet.discovery.metadataPacketCandidates,32);assert.strictEqual(packet.discovery.fullTextSweepCandidates,95);
const rows=notes.reviewedDispositions.filter(row=>row.reviewWave==='v9.35-windows-privesc');assert.strictEqual(rows.length,15);assert.strictEqual(rows.filter(row=>row.disposition==='modeled').length,13);assert.strictEqual(rows.filter(row=>row.disposition==='private-reference-only').length,2);for(const row of rows.filter(row=>row.disposition==='modeled'))assert(row.guidanceOnlyReason&&row.guidanceOnlyReason.length>=24,row.noteId+' requires an explicit guidance-only decision');
for(const id of ['note-windows-privesc-enumeration-leads','note-windows-token-integrity-boundary','note-windows-privileged-execution-preconditions','note-windows-secret-hunting-boundary','note-windows-local-exploit-risk-proof'])assert(field.entries.some(entry=>entry.id===id),'missing Windows privilege-escalation guidance '+id);
assert.strictEqual(impact.review.reviewed,127);assert.strictEqual(impact.review.pending,429);assert.strictEqual(impact.outputCounts.fieldNotes,48);assert.strictEqual(impact.outputCounts.toolContextBound,43);assert.strictEqual(impact.outputCounts.pathGuidanceBound,45);assert.strictEqual(impact.outputCounts.evidenceGuidance,14);assert.strictEqual(impact.outputCounts.reportGuidance,5);assert.strictEqual(impact.outputCounts.declaredProductChanges,1);assert.strictEqual(impact.latestWave.id,'v9.35-windows-privesc');assert.strictEqual(impact.latestWave.reviewed,15);assert.strictEqual(impact.latestWave.modeled,13);assert.strictEqual(impact.latestWave.privateOnly,2);assert(impact.latestWave.themes.includes('Windows local privilege escalation'));
const item=q.items.find(item=>item.id==='notes-packet-windows-privesc');assert(item&&item.status==='complete');assert.strictEqual(q.items.find(item=>item.id==='notes-packet-linux-privesc').status,'queued');assert.strictEqual(q.items.find(item=>item.id==='notes-packet-ad-pivoting').status,'queued');assert.strictEqual(q.items.find(item=>item.id==='notes-disposition-burn-down').status,'queued');assert(contracts.contracts['notes-packet-windows-privesc']);assert.strictEqual(contracts.version,'9.35.0');
const readme=read('README.md'),changelog=read('CHANGELOG.md');assert(readme.includes('Current release: **v9.35**'));assert(!/^v9\\.\\d+\\s+(?:completes|starts|hardens|adds|moves)/mi.test(readme));for(const label of ['v9.35','v9.34','v9.33','v9.32','v9.31','v9.30'])assert(changelog.includes('## '+label+' '),'CHANGELOG missing '+label);
const publicSource=read('data/note-integration-packets.js');for(const forbidden of ['review_text','sources/raw/','HTB - Penetration Tester.enex','OffSec PEN-200.enex','94.237.'])assert(!publicSource.includes(forbidden),'public packet excludes raw/private material marker '+forbidden);
for(const command of [['tools/validate-note-integration.js'],['tools/validate-notes-impact.js'],['tools/validate-readme-history-ownership.js'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check'],['tools/validate-release-pr.js']]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}
console.log('v9.35 Windows privilege-escalation packet, current-state README ownership, changelog handoff, and queue projection tests passed.');
`);

write('docs/v9.35.md',`# Obol v9.35 — Windows privilege-escalation notes and README history ownership

v9.35 continues the Notes Impact and Themed Burn-down work package with the Windows privilege-escalation subject packet and fixes documentation ownership drift that was slowly turning README back into a release log.

## Windows privilege-escalation packet

The private review pipeline produced 32 title/tag candidates and 95 full-text candidates. Those private artifacts were substantively reviewed and curated to 16 reusable Windows-local privilege sources. One source was already terminal from earlier credential work and fifteen received new terminal dispositions in this release.

The public-safe ledger advances to **127/556 reviewed**: **95 modeled**, **27 private-reference-only**, **5 superseded**, **0 rejected**, and **429 pending**. The packet publishes five normalized Field Notes covering enumeration lead triage, Windows token/integrity proof, privileged service/task/DLL execution preconditions, local secret-hunting boundaries, and local-exploit risk/proof. The reviewed sources did not expose a missing Tool Builder, Path logic, Evidence parser, report generator, or workflow primitive that justified another product mechanic, so all thirteen newly modeled decisions explicitly record why contextual guidance is sufficient.

Raw private review text, payload catalogs, lab outcomes, targets, credentials, flags, screenshots, and copied course prose remain outside public Obol.

## README and changelog ownership

README now returns to its intended role as the current product and future-agent handoff. Release-by-release narratives are removed from README and recent v9.30-v9.35 history is owned by CHANGELOG.md.

`tools/validate-readme-history-ownership.js` permanently rejects release-version headings and common version-story prose in README while requiring the current and recent release history in CHANGELOG. Product Hardening preflight and the complete historical contract runner both execute this validator so the separation remains enforced in future builds.

## Queue effect

The Windows privilege-escalation packet becomes complete while the 556-note umbrella stays live. Linux privilege escalation and AD/pivoting are the next named subject packets in the same work package. No unrelated offline/performance work is pulled into this release.

## Validation

- \\`node tools/validate-note-integration.js\\`
- \\`node tools/validate-notes-impact.js\\`
- \\`node tools/validate-readme-history-ownership.js\\`
- \\`node tools/sync-product-build-next.js --check\\`
- \\`node tests/run-v9.35-tests.js\\`
- exact-head Product Hardening preflight, complete historical regression, and browser smoke before merge readiness
`);

run(['tools/sync-current-release.js','--write']);
run(['tools/sync-product-build-next.js','--write']);
run(['tools/validate-readme-history-ownership.js']);
run(['tools/validate-note-integration.js']);
run(['tools/validate-notes-impact.js']);
run(['tests/run-v9.35-tests.js']);
fs.unlinkSync(__filename);
console.log('v9.35 build transformation complete.');
