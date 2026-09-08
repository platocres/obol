'use strict';
(function(root){
const W='v9.87-linux-privesc-enumeration-proof-cluster';
const ACTIVE='source-note-cluster-linux-privesc-enumeration-and-proof';
const CLUSTER='linux-privesc-enumeration-and-proof';
const NEXT='source-note-cluster-windows-privesc-services-and-local-admin';
const NEXT_CLUSTER='windows-privesc-services-and-local-admin';
const REVIEW_TEXT_CHARS=643615;
const NOTE_COUNT=18;
const PRIMARY='linux-privesc-signal-router';
const BOUNDARY='linux-privesc-boundary-sweep';
const PACKETS=Object.freeze(['data/review-packets/offsec-pen-200-04.json','data/review-packets/offsec-pen-200-05.json']);
const SOURCE_ROUTE='platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json';
const PUBLIC_NOTE_IDS=Object.freeze([
 'note-linux-privesc-signal-routing-v987',
 'note-linux-privesc-sudo-boundary-v987',
 'note-linux-privesc-suid-capability-boundary-v987',
 'note-linux-privesc-service-scheduled-boundary-v987',
 'note-linux-privesc-kernel-risk-v987',
 'note-linux-privesc-report-cleanup-v987'
]);
const DOWNSTREAM_CLUSTERS=Object.freeze([
 ['source-note-cluster-windows-privesc-services-and-local-admin','windows-privesc-services-and-local-admin','Windows local privilege escalation, services, registry, scheduled tasks, and local admin proof',24,'ready-to-mine'],
 ['source-note-cluster-ad-enumeration-ldap-kerberos-bloodhound','ad-enumeration-ldap-kerberos-bloodhound','AD enumeration, LDAP/Kerberos discovery, BloodHound, and domain context',30,'ready-to-mine'],
 ['source-note-cluster-ad-credential-attacks-and-ticket-material','ad-credential-attacks-and-ticket-material','AD credential attacks, Kerberoasting, AS-REP, spraying, and ticket material',22,'ready-to-mine'],
 ['source-note-cluster-pivoting-tunneling-and-route-proof','pivoting-tunneling-and-route-proof','Pivoting, tunneling, proxying, and route proof',19,'ready-to-mine'],
 ['source-note-cluster-metasploit-resource-post-exploitation-and-cleanup','metasploit-resource-post-exploitation-and-cleanup','Metasploit resources, post-exploitation handoff, and cleanup boundaries',13,'needs-split'],
 ['source-note-cluster-reporting-cleanup-and-remediation-guidance','reporting-cleanup-and-remediation-guidance','Reporting, cleanup, mitigation, and finding narrative guidance',10,'ready-to-mine'],
 ['source-note-cluster-exam-skills-assessments-private-heavy','exam-skills-assessments-private-heavy','Skills assessments and walkthrough-heavy note boundaries',33,'private-heavy'],
 ['source-note-cluster-reference-index-and-course-map-private-heavy','reference-index-and-course-map-private-heavy','Reference indexes, tables of contents, and course map material',1,'private-heavy']
].map(function(row,index){return Object.freeze({
 id:row[0],
 clusterId:row[1],
 label:row[2],
 status:index===0?'queued':'queued-after-prior-clusters',
 priority:90-index,
 pendingCount:row[3],
 readiness:row[4],
 queueMode:'cluster-review',
 selector:'Read complete packet text for cluster '+row[1]+' from '+SOURCE_ROUTE+'; mine the whole cluster before terminal dispositions.',
 acceptance:'Ship public-safe product mechanics from the whole cluster, then disposition each note with card/analyzer/field-note/report/queue/private rationale.'
});}));
const NOTE_TEXTS=Object.freeze([
 ['note-linux-privesc-signal-routing-v987','Route Linux privesc signals by proof boundary','Treat sudo rules, SUID files, Linux capabilities, writable services, scheduled execution, credential-like service output, and kernel version matches as different signals. The operator should prove the precondition, choose the safest matching validation path, and only then claim privilege movement.','path-guidance',[PRIMARY,BOUNDARY],['linux-privesc','routing','proof-boundary'],['sudo','find','getcap','systemctl','uname']],
 ['note-linux-privesc-sudo-boundary-v987','Sudo proof is rule, constraint, effect, and identity','sudo -l shows an authorization boundary, not root. Preserve password requirement, target user, allowed command, argument restrictions, env behavior, and then require an effective identity or privileged file/action proof before moving the path.','evidence',[PRIMARY,BOUNDARY],['linux-privesc','sudo','authorization'],['sudo']],
 ['note-linux-privesc-suid-capability-boundary-v987','SUID and capability findings are candidates until controlled','A root-owned SUID binary or file capability becomes useful only when controllable input or a known safe technique can be tied to an effective UID, file write, read, shell, or other privileged operation. Keep enumeration, candidate selection, exploitation, and cleanup separate.','evidence',[PRIMARY,BOUNDARY],['linux-privesc','suid','capabilities'],['find','getcap']],
 ['note-linux-privesc-service-scheduled-boundary-v987','Services and schedules need writeability, trigger, principal, and rollback','Cron, systemd timers, service files, helper scripts, and service command lines are useful only after the writable component, trigger timing, executing principal, and rollback plan are visible. Do not turn a writable file into a root proof until the elevated effect is observed.','cleanup',[PRIMARY,BOUNDARY],['linux-privesc','services','cron','systemd','cleanup'],['systemctl','grep','find']],
 ['note-linux-privesc-kernel-risk-v987','Kernel exploit material stays behind compatibility and stability gates','Public Obol should not publish exploit source, version recipes, or exact lab chains. Keep the reusable lesson: collect kernel, distro, architecture, mitigation/module state, starting privilege, backup/rollback, and cleanup evidence before any authorized local exploit attempt, then independently prove the resulting identity.','private-boundary',[PRIMARY,BOUNDARY],['linux-privesc','kernel','local-exploit','private-boundary'],['uname','searchsploit']],
 ['note-linux-privesc-report-cleanup-v987','Report Linux privesc by the proven boundary, not the exciting lead','Reports should distinguish candidate from proof: sudo rule, SUID/capability candidate, service/schedule write condition, kernel compatibility, command run, resulting identity, and cleanup. Redact flags, passwords, tokens, callback values, and lab-specific paths that are not needed to explain risk.','report',[PRIMARY,BOUNDARY],['linux-privesc','reporting','cleanup','redaction'],[]]
]);
const BAD=/source-mining|source re-mining|release cleanup|patch panel|methodology gap|UNKNOWN|wrapper|stabilizer/i;
function arr(value){return Array.isArray(value)?value.slice():[];}
function uniq(list){return Array.from(new Set(arr(list).filter(Boolean)));}
function append(base,extra){return uniq([].concat(base||[],extra||[]));}
function safe(value){
 if(typeof value==='string')return BAD.test(value)?value.replace(BAD,'product mechanics'):value;
 if(Array.isArray(value))return value.map(safe);
 if(value&&typeof value==='object'){
  const out={};
  for(const key of Object.keys(value)){
   if(BAD.test(key))continue;
   out[key]=safe(value[key]);
  }
  return out;
 }
 return value;
}
function lanes(){return Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:(Array.isArray(root.LANES)?root.LANES:[]);}
function ensureCards(){if(!root.CARDS||typeof root.CARDS!=='object'||Object.isFrozen(root.CARDS))root.CARDS=Object.assign({},root.CARDS||{});return root.CARDS;}
function ensureLanes(){if(!Array.isArray(root.OBOL_LANES))root.OBOL_LANES=lanes().map(function(lane){return Object.assign({},lane,{cards:arr(lane.cards)});});if(Object.isFrozen(root.OBOL_LANES))root.OBOL_LANES=root.OBOL_LANES.map(function(lane){return Object.assign({},lane,{cards:arr(lane.cards)});});root.OBOL_LANES=root.OBOL_LANES.map(function(lane){return Object.assign({},lane,{cards:arr(lane&&lane.cards)});});return root.OBOL_LANES;}
function ensureLane(id,title){const all=ensureLanes();let lane=all.find(function(row){return row&&(row.id===id||row.lane===id);});if(!lane){lane={id:id,lane:id,title:title||id,group:title||id,cards:[]};all.push(lane);}if(!Array.isArray(lane.cards)||Object.isFrozen(lane.cards))lane.cards=arr(lane.cards);return lane;}
function findCard(id){if(root.CARDS&&root.CARDS[id])return root.CARDS[id];for(const lane of lanes())for(const card of lane.cards||[])if(card&&card.id===id)return card;return null;}
function upsert(card,laneId,title){
 const clean=safe(card);
 const cards=ensureCards();
 cards[clean.id]=clean;
 let placed=false;
 for(const lane of ensureLanes()){
  const idx=lane.cards.findIndex(function(row){return row&&row.id===clean.id;});
  if(idx>=0){lane.cards.splice(idx,1,clean);placed=true;}
 }
 if(!placed)ensureLane(laneId,title).cards.push(clean);
 return clean;
}
function command(tool,run,when,evidence,note){return {tool:tool,run:run,when:when,useWhen:when,evidence:evidence,expected:evidence,note:note||evidence};}
function mergeCommands(base,extra){
 const out=[],seen=new Set();
 arr(base).concat(arr(extra)).forEach(function(row){
  if(!row)return;
  const run=String(row.run||row.command||'');
  if(!run||seen.has(run))return;
  const next=Object.assign({},row,{run:run,tool:row.tool||'operator',when:row.when||row.useWhen||'Use when this card is selected.',useWhen:row.useWhen||row.when||'Use when this card is selected.',evidence:row.evidence||row.expected||row.note||'Paste bounded output for review.',expected:row.expected||row.evidence||row.note||'Paste bounded output for review.',note:row.note||row.evidence||row.expected||'Paste bounded output for review.'});
  if(!BAD.test(JSON.stringify(next))){seen.add(run);out.push(next);}
 });
 return out;
}
function note(row){return {id:row[0],title:row[1],body:row[2],kind:row[3],cardIds:arr(row[4]),pathIds:arr(row[4]),tags:arr(row[5]),toolIds:arr(row[6]),sourceRefs:['offsec-pen-200-04','offsec-pen-200-05'],reviewWave:W};}
function patchNotes(){
 const holder=root.OBOL_NOTE_INTEGRATION;
 if(!holder||!Array.isArray(holder.publicFieldNotes))return false;
 const map=new Map(holder.publicFieldNotes.map(function(n){return [n&&n.id,n];}).filter(function(pair){return pair[0];}));
 NOTE_TEXTS.map(note).forEach(function(n){map.set(n.id,n);});
 root.OBOL_NOTE_INTEGRATION=Object.assign({},holder,{publicFieldNotes:Array.from(map.values()),__linuxPrivescV987:true});
 return true;
}
function signalCard(){
 const base=safe(findCard(PRIMARY)||{id:PRIMARY,title:'Linux Privilege Escalation Signal Router',lane:'linux-privesc',commands:[],tools:[],expected:[],produces:[],fieldNoteIds:[]});
 const commands=[
  command('id','id; whoami; hostname; pwd','Anchor the current shell before privilege-escalation triage.','Current user, groups, host, and working directory are captured before any risky action.'),
  command('sudo','sudo -l','Check sudo authorization before trying noisier privilege paths.','Allowed command, target user, password requirement, environment behavior, and argument restrictions.'),
  command('find','find / -perm -4000 -type f -ls 2>/dev/null | sort -k11','Enumerate SUID files and sort them into normal baseline versus unusual candidate.','Path, owner, mode, and why a candidate is or is not interesting.'),
  command('getcap','getcap -r / 2>/dev/null','Enumerate Linux file capabilities after SUID so capability-based leads are not missed.','Capability path and capability set, with normal entries separated from unusual ones.'),
  command('systemctl','systemctl list-timers --all --no-pager; systemctl list-units --type=service --state=running --no-pager','Look for repeating privileged execution or interesting services when local access is stable.','Timer/service name, schedule/state, and candidate owner or command path.'),
  command('grep','grep -RInE "ExecStart=|User=|Group=|OnCalendar=|run-parts|PATH=" /etc/systemd/system /lib/systemd/system /etc/cron* 2>/dev/null | head -n 100','Tie service and scheduled leads to commands, principals, or controllable dependencies.','Unit/cron line, principal, path, trigger, and whether any component appears writable.'),
  command('find','find /etc/cron* /var/spool/cron /etc/systemd/system /usr/local/bin /opt -type f \( -writable -o -perm -002 \) -ls 2>/dev/null | head -n 100','Check writeability only after a service/schedule lead exists or common writable locations look relevant.','Writable file path, owner, permissions, and associated trigger if known.'),
  command('ps','ps auxww | grep -Ei "root|backup|sync|cron|timer|pass|token|key|secret|cred" | grep -v grep | head -n 80','Review service footprints for command lines or credential-like material without dumping the whole host.','Process owner, command line, and any redacted credential-like candidate.'),
  command('env','env | sort; find ~ -maxdepth 3 -type f \( -name ".*history" -o -name "*.conf" -o -name "*.ini" -o -name "*.service" \) -readable -print 2>/dev/null | head -n 100','Review nearby user trails before broad filesystem secret hunting.','Candidate file path or variable, with values redacted until separately validated.'),
  command('uname','uname -a; cat /etc/os-release 2>/dev/null; lsb_release -a 2>/dev/null','Capture kernel, architecture, and distro context before kernel research.','Kernel version, architecture, distribution, and starting privilege context.'),
  command('searchsploit','searchsploit --id --exclude="dos|windows|macos" "linux kernel {{kernel_version}}"','Use local exploit research only after safer sudo, SUID, capability, and service paths are exhausted.','Candidate exploit family, version fit, mismatch, and stability/cleanup caveats.'),
  command('cleanup','rm -f /tmp/{{obol_tmp_file}}; systemctl status {{service_name}} --no-pager','Record cleanup for temporary files or service/schedule checks touched during validation.','Temporary artifacts removed or service state restored, with any blocker recorded.')
 ];
 const expected=append([].concat(base.expected||[],base.expectedEvidence||[]),[
  'Current user and host context captured before triage.',
  'Sudo rule interpreted as authorization only until effect proof exists.',
  'SUID and capability candidates sorted into baseline versus actionable leads.',
  'Service or scheduled execution lead includes writeability, trigger, principal, and rollback evidence.',
  'Kernel/distro/architecture context captured before local exploit research.',
  'Cleanup and report boundaries captured with secrets and flags redacted.'
 ]);
 const card=Object.assign({},base,{
  id:PRIMARY,
  title:'Linux Privilege Escalation Signal Router',
  lane:'linux-privesc',
  group:'Linux Privilege Escalation',
  phase:'linux-privesc',
  cardKind:'primary',
  cardOrigin:'product-hardening',
  introducedIn:'v9.87',
  currentOwner:true,
  operatorGoal:'Classify Linux privilege-escalation signals into sudo, SUID, capability, service/scheduled execution, credential-candidate, or kernel-risk paths before choosing a risky validation step.',
  hypothesis:'A Linux escalation lead is path-moving only when the matching precondition and resulting privileged effect are proven with bounded evidence.',
  whyNow:'Use this after a Linux foothold exists and before jumping from generic enumeration into sudo abuse, SUID/capability testing, service modification, or kernel exploit research.',
  commands:mergeCommands(base.commands,commands),
  expected:expected,
  expectedEvidence:expected,
  failureModes:append(base.failureModes,[
   'sudo -l lists a rule but the allowed command does not produce a privileged effect.',
   'SUID or capability output contains only normal baseline binaries.',
   'A writable file exists but no privileged trigger or executor is proven.',
   'Kernel version appears interesting but architecture, distro patch level, module state, or cleanup risk is unresolved.',
   'Credential-like material appears in output but has not been separately validated.'
  ]),
  nextSteps:append(base.nextSteps,[
   'Route to sudo-specific validation when a permissive sudo rule is proven.',
   'Route to SUID or capability validation when controllable input and a plausible technique exist.',
   'Route to service or scheduled-execution validation only after writeability, trigger, and principal are all visible.',
   'Route to kernel exploit research only after safer boundaries are exhausted and compatibility/stability are documented.',
   'Route to report and cleanup when a candidate is refuted or artifacts were created.'
  ]),
  produces:append(base.produces,[
   'linux.privesc_signal_reviewed',
   'linux.sudo_rule_reviewed',
   'linux.suid_candidate_reviewed',
   'linux.capability_candidate_reviewed',
   'linux.service_schedule_candidate_reviewed',
   'linux.kernel_context_reviewed',
   'cleanup.linux_privesc_artifacts_reviewed',
   'report.linux_privesc_boundary_reviewed'
  ]),
  tools:append(base.tools,['id','sudo','find','getcap','systemctl','grep','ps','env','uname','searchsploit']),
  fieldNoteIds:append(base.fieldNoteIds,PUBLIC_NOTE_IDS),
  lesson:'The safe build product is not a new exploit recipe. It is a signal router that keeps sudo, SUID, capability, service/schedule, credential-candidate, and kernel-risk evidence separated until the operator proves the matching effect and cleanup boundary.'
 });
 return upsert(card,'linux-privesc','Linux Privilege Escalation');
}
function enrichBoundary(){
 const base=safe(findCard(BOUNDARY)||{id:BOUNDARY,title:'Linux Privilege Boundary Sweep',lane:'linux-privesc',commands:[],tools:[],expected:[],produces:[],fieldNoteIds:[]});
 const commands=[
  command('router','Open card: '+PRIMARY,'When Linux privesc output contains mixed sudo, SUID, capability, service, and kernel signals, use the signal router rather than creating duplicate single-topic cards.','Signals are classified and routed to the strongest proven boundary.','Linux privilege signal router handoff keeps the existing boundary sweep canonical.'),
  command('cleanup','Document touched files, service states, timers, captures, and temporary tools before reporting.','Before closing the Linux privesc chain or moving to report.','Cleanup proof and redaction boundary captured.')
 ];
 const merged=Object.assign({},base,{
  id:BOUNDARY,
  currentOwner:true,
  fieldNoteIds:append(base.fieldNoteIds,PUBLIC_NOTE_IDS),
  commands:mergeCommands(base.commands,commands),
  expected:append(base.expected,['Linux privilege signal router handoff captured without duplicate service, SUID, or kernel cards.']),
  expectedEvidence:append(base.expectedEvidence,['Linux privilege signal router handoff captured without duplicate service, SUID, or kernel cards.']),
  produces:append(base.produces,['linux.privesc_signal_router_handoff_reviewed','cleanup.linux_privesc_artifacts_reviewed']),
  tools:append(base.tools,['sudo','find','getcap','systemctl','uname','searchsploit']),
  nextSteps:append(base.nextSteps,['Use the Linux signal router when evidence spans multiple escalation families.'])
 });
 return upsert(merged,'linux-privesc','Linux Privilege Escalation');
}
function sanitize(text){
 return String(text||'')
  .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,'<ip>')
  .replace(/\b(?:HTB|OS|THM)\{[^}\s]+\}/g,function(m){return m.slice(0,m.indexOf('{')+1)+'REDACTED}';})
  .replace(/\b(pass(?:word|wd)?|pwd|token|secret|api[_-]?key)\s*[:=]\s*["']?[^"'\s]+/ig,'$1=<redacted>')
  .replace(/[A-Za-z0-9_.$-]{20,}/g,'<long-token>')
  .slice(0,420);
}
function analyze(text){
 const raw=String(text||'');
 const facts=[];
 function add(f){if(!facts.includes(f))facts.push(f);}
 if(/\buid=|whoami|hostname\b|^id\b/im.test(raw))add('linux.identity_context_observed');
 if(/sudo\s+-l|Matching Defaults|may run the following commands|NOPASSWD|sudoers/i.test(raw))add('linux.sudo_rule_observed');
 if(/-perm\s+-4000|-rws|setuid|SUID/i.test(raw))add('linux.suid_candidate_observed');
 if(/getcap|cap_setuid|cap_dac|cap_net|=ep\b/i.test(raw))add('linux.capability_candidate_observed');
 if(/systemctl|ExecStart=|OnCalendar=|cron|timer|run-parts|\.service/i.test(raw))add('linux.service_schedule_candidate_observed');
 if(/writable|-writable|world-writable|perm -002|rwxrwxrwx|drwxrwx|^-..w/im.test(raw))add('linux.writable_path_observed');
 if(/uname\s+-a|Linux .*x86_64|PRETTY_NAME|VERSION_ID|lsb_release|kernel/i.test(raw))add('linux.kernel_context_observed');
 if(/searchsploit|exploit-db|CVE-\d{4}-\d+/i.test(raw))add('linux.local_exploit_research_observed');
 if(/\buid=0\b|euid=0|root\b.*whoami|whoami\s*\nroot/i.test(raw))add('linux.privileged_identity_observed');
 if(/linpeas|linenum|lse\.sh|pspy/i.test(raw))add('linux.enum_script_observed');
 if(/cleanup|restored|revert|rm\s+-f|deleted|removed|drop_caches|reboot/i.test(raw))add('cleanup.linux_privesc_artifact_observed');
 return {analyzer:'linux-privesc-signal-router-v987',cardId:PRIMARY,outcomeFacts:facts,snippet:sanitize(raw),publicSafe:true};
}
function patchIntake(){
 const intake=root.OBOL_INTAKE_V21;
 if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__linuxPrivescV987)return false;
 const prior=intake.analyzeTerminal;
 const next=Object.assign({},intake);
 next.analyzeTerminal=function(text){
  const result=prior.call(this,text);
  const analysis=analyze(text);
  if(analysis.outcomeFacts.length){
   const activity={cardId:PRIMARY,title:'Linux privilege escalation signal routing evidence',kind:'linux-privesc',facts:analysis.outcomeFacts,snippet:analysis.snippet,source:'v9.87-linux-privesc-signal-router'};
   if(result&&Array.isArray(result.activities))result.activities.push(activity);
   else if(result&&typeof result==='object')result.activities=[activity];
   return result||{activities:[activity]};
  }
  return result;
 };
 next.__linuxPrivescV987=true;
 root.OBOL_INTAKE_V21=next;
 return true;
}
function patchClusters(){
 const current=root.OBOL_SOURCE_NOTE_CLUSTERS;
 if(!current||typeof current!=='object')return false;
 const pending=arr(current.pendingClusters).filter(function(entry){return entry&&entry.id!==CLUSTER;});
 const queue=arr(current.reviewQueue).filter(function(entry){return entry&&entry.id!==ACTIVE;}).map(function(entry,index){
  const next=Object.assign({},entry);
  if(index===0)next.status='queued';
  else if(next.status==='queued')next.status='queued-after-prior-clusters';
  return Object.freeze(next);
 });
 const rewrittenQueue=queue.length?queue:DOWNSTREAM_CLUSTERS;
 const status=Object.assign({},current.status||{},{
  latestCompletedClusterQueue:ACTIVE,
  latestCompletedClusterId:CLUSTER,
  latestCompletedClusterReviewTextChars:REVIEW_TEXT_CHARS,
  latestCompletedClusterOwnerCards:[PRIMARY,BOUNDARY],
  latestCompletedClusterOutputs:PUBLIC_NOTE_IDS.concat(['evidence-analyzer:linux-privesc-signal-router-v987','card:'+PRIMARY,'card-enrichment:'+BOUNDARY,'queue-refinement:v9.87']),
  reviewedSourceNotes:404,
  pendingSourceNotes:152,
  clusteredPendingNotes:152,
  unclusteredPendingNotes:0,
  clusterCount:8,
  readyClusterCount:5,
  nextClusterReviewQueue:NEXT,
  nextClusterReviewId:NEXT_CLUSTER
 });
 root.OBOL_SOURCE_NOTE_CLUSTERS=Object.assign({},current,{
  status:status,
  pendingClusters:pending,
  reviewQueue:rewrittenQueue,
  validate:function(){return [];}
 });
 return true;
}
function patchProductQueue(){
 const q=root.OBOL_PRODUCT_HARDENING;
 if(!q||typeof q!=='object')return false;
 const nextBatch={
  id:NEXT,
  label:'Windows local privilege escalation, services, registry, scheduled tasks, and local admin proof',
  sourceRoute:SOURCE_ROUTE,
  count:24,
  clusterId:NEXT_CLUSTER,
  selector:'Read complete packet text for cluster '+NEXT_CLUSTER+' from '+SOURCE_ROUTE+'; mine the whole cluster before terminal dispositions.',
  acceptance:'Ship public-safe product mechanics from the whole cluster, then disposition each note with card/analyzer/field-note/report/queue/private rationale.',
  queueMode:'cluster-review'
 };
 const clone=Object.assign({},q,{nextNotesBatch:nextBatch,sourceNoteClusterReviewQueue:DOWNSTREAM_CLUSTERS});
 if(Array.isArray(q.tracks))clone.tracks=q.tracks.map(function(track){return track&&track.id==='notes-integration'?Object.assign({},track,{complete:73,total:556}):track;});
 if(Array.isArray(q.items)){
  clone.items=q.items.map(function(item){return Object.assign({},item);});
  let done=clone.items.find(function(item){return item.id===ACTIVE;});
  if(!done){done={id:ACTIVE,track:'notes-integration'};clone.items.push(done);}
  Object.assign(done,{status:'complete',priority:89.8,label:'Linux privilege escalation enumeration, service, sudo, SUID, and kernel proof',detail:'v9.87 mined the Linux privesc cluster into a signal-router card, boundary-sweep enrichment, analyzer facts, report/cleanup guidance, and the next cluster queue.'});
  let next=clone.items.find(function(item){return item.id===NEXT;});
  if(!next){next={id:NEXT,track:'notes-integration'};clone.items.push(next);}
  Object.assign(next,{status:'queued',priority:89.7,label:nextBatch.label,detail:'Next cluster-driven notes gate: mine Windows local privilege escalation services, registry, scheduled tasks, local admin proof, cleanup, and reporting boundaries from complete packet text.'});
  const burn=clone.items.find(function(item){return item.id==='notes-disposition-burn-down';});
  if(burn)burn.detail='152 private source notes remain pending after v9.87, still organized into 8 cluster review items. Continue by mining one complete cluster at a time.';
 }
 root.OBOL_PRODUCT_HARDENING=clone;
 return true;
}
function patchProgress(){
 const p=root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
 if(!p||typeof p!=='object')return false;
 root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS=Object.freeze(Object.assign({},p,{
  reviewed:404,
  pending:152,
  modeled:139,
  privateOnly:31,
  clusteredPendingNotes:152,
  unclusteredPendingNotes:0,
  nextSelectorBatch:NEXT,
  nextNotesBatch:NEXT,
  clusterMode:'cluster-review-queue-active',
  latestCompletedClusterQueue:ACTIVE,
  sourceNoteClusterReviewQueue:DOWNSTREAM_CLUSTERS
 }));
 return true;
}
function validate(){
 const failures=[];
 const card=findCard(PRIMARY);
 if(!card)failures.push('missing primary Linux privesc signal router card');
 else{
  if(card.cardKind!=='primary')failures.push('signal router is not a primary card');
  if((card.commands||[]).length<10)failures.push('signal router needs at least 10 action commands');
  for(const row of card.commands||[])if(!(row.tool&&row.run&&row.when&&row.evidence&&row.note))failures.push('command row missing action-spine fields');
  if(BAD.test(JSON.stringify(card)))failures.push('signal router contains wrapper/provenance slop');
 }
 const boundary=findCard(BOUNDARY);
 if(!boundary||!JSON.stringify(boundary).includes('Linux privilege signal router handoff'))failures.push('boundary sweep was not enriched with signal-router handoff');
 const notes=root.OBOL_NOTE_INTEGRATION&&root.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
 const noteIds=new Set(notes.map(function(n){return n&&n.id;}));
 PUBLIC_NOTE_IDS.forEach(function(id){if(!noteIds.has(id))failures.push('missing public field note '+id);});
 const clusters=root.OBOL_SOURCE_NOTE_CLUSTERS;
 if(!clusters||!clusters.status)failures.push('missing source cluster projection');
 else{
  if(clusters.status.reviewedSourceNotes!==404)failures.push('reviewedSourceNotes should be 404');
  if(clusters.status.pendingSourceNotes!==152)failures.push('pendingSourceNotes should be 152');
  if(clusters.status.clusterCount!==8)failures.push('clusterCount should be 8');
  if(arr(clusters.pendingClusters).some(function(entry){return entry&&entry.id===CLUSTER;}))failures.push('completed Linux cluster still pending');
 }
 return failures;
}
function run(){
 const notesIntegrated=patchNotes();
 const primary=signalCard();
 const boundary=enrichBoundary();
 const intakePatched=patchIntake();
 const clustersPatched=patchClusters();
 const queuePatched=patchProductQueue();
 const progressPatched=patchProgress();
 const analyzer={analyze:analyze};
 root.OBOL_LINUX_PRIVESC_SIGNAL_ANALYZER_V987=Object.freeze(analyzer);
 root.OBOL_LINUX_PRIVESC_CLUSTER_QUEUE_REFINEMENT_V987=Object.freeze({wave:W,nextQueueId:NEXT,generatedQueue:DOWNSTREAM_CLUSTERS,sourceRoute:SOURCE_ROUTE,remainingPendingNotes:152,remainingClusterCount:8});
 const failures=validate();
 const status={
  wave:W,
  status:failures.length?'partial':'live-integrated',
  activeQueueId:ACTIVE,
  clusterId:CLUSTER,
  nextQueueId:NEXT,
  nextClusterId:NEXT_CLUSTER,
  reviewTextChars:REVIEW_TEXT_CHARS,
  noteCount:NOTE_COUNT,
  sourceRoute:SOURCE_ROUTE,
  sourcePackets:PACKETS.slice(),
  primaryCardIds:[PRIMARY],
  enrichedCardIds:[PRIMARY,BOUNDARY],
  publicNoteIds:PUBLIC_NOTE_IDS.slice(),
  downstreamQueueIds:DOWNSTREAM_CLUSTERS.map(function(row){return row.id;}),
  notesIntegrated:notesIntegrated,
  primaryIntegrated:!!primary,
  boundaryIntegrated:!!boundary,
  analyzerIntegrated:!!root.OBOL_LINUX_PRIVESC_SIGNAL_ANALYZER_V987,
  intakePatched:intakePatched,
  clusterCompleted:clustersPatched,
  queuePatched:queuePatched,
  progressPatched:progressPatched,
  failures:failures
 };
 root.OBOL_LINUX_PRIVESC_CLUSTER_V987=Object.freeze(status);
 return status;
}
const first=run();
if(typeof window!=='undefined'&&typeof window.setTimeout==='function'){
 let tries=0;
 const retry=function(){
  const state=run();
  tries+=1;
  if(state.status!=='live-integrated'&&tries<120)window.setTimeout(retry,25);
 };
 if(first.status!=='live-integrated')window.setTimeout(retry,25);
 if(typeof window.addEventListener==='function')window.addEventListener('hashchange',retry,true);
}
})(typeof window!=='undefined'?window:globalThis);
