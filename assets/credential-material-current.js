'use strict';
(function(root){
const API=()=>root.OBOL_CREDENTIAL_MATERIAL||null;
const MODES=()=>root.OBOL_CREDENTIAL_MODES||null;
const SCHEMA=()=>root.OBOL_TOOL_BUILDER_SCHEMA||null;
const e=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function currentState(){try{return typeof state!=='undefined'?state:(root.state||null);}catch(_err){return root.state||null;}}
function persist(){try{if(typeof save==='function')save();}catch(_err){}}
function routeParts(){return typeof location==='undefined'?[]:(location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean);}
function visibleLabel(row){return [API().kindLabel(row.kind),row.username||row.domain||'',row.status==='validated'?'validated':row.status==='rejected'?'rejected':'candidate'].filter(Boolean).join(' · ');}
function optionRows(rows,selectedId){return '<option value="">Choose saved material</option>'+rows.map(row=>'<option value="'+e(row.id)+'"'+(row.id===selectedId?' selected':'')+'>'+e(visibleLabel(row))+'</option>').join('');}
function kindOptions(){const api=API();return ['auto',...api.kinds].map(kind=>'<option value="'+e(kind)+'">'+e(kind==='auto'?'Auto-detect':api.kindLabel(kind))+'</option>').join('');}
function installLiveReportBoundary(){
 const api=API(),R=root.OBOL_REPORT_V2;if(!api||!R||typeof R.generate!=='function'||R.generate.__obolCredentialLiveRedaction)return false;
 const old=R.generate;const generate=function(){return api.redactText(old.apply(R,arguments),currentState());};generate.__obolCredentialLiveRedaction=true;root.OBOL_REPORT_V2={...R,generate};return true;
}
function applyValues(form,builder,values){
 if(!form)return false;let changed=false;
 for(const [field,value] of Object.entries(values||{})){
  const control=form.elements&&form.elements.namedItem(field);if(!control||value===undefined||value===null||value==='')continue;
  if(control.type==='checkbox')control.checked=!!value;else control.value=String(value);changed=true;
 }
 if(changed){form.dispatchEvent(new Event('input',{bubbles:true}));form.dispatchEvent(new Event('change',{bubbles:true}));}
 return changed;
}
function builderValues(row,builder){const modes=MODES(),api=API();if(modes&&typeof modes.prefillForBuilder==='function')return modes.prefillForBuilder(row,builder);return api&&typeof api.prefillForBuilder==='function'?api.prefillForBuilder(row,builder):{};}
function builderGuidance(row,builder){const modes=MODES();return modes&&typeof modes.guidance==='function'?modes.guidance(row,builder):[];}
function renderGuidance(box,row,builder){if(!box)return;const notes=row?builderGuidance(row,builder):[];box.innerHTML=notes.length?'<ul>'+notes.map(note=>'<li>'+e(note)+'</li>').join('')+'</ul>':'<span class="hint">Select material to see mode-specific handoff guidance.</span>';}
function renderRoutes(host,value){
 const api=API(),route=api.routeHash(value),box=host.querySelector('[data-credential-routes]');if(!box)return;
 if(!route.detections.length){box.innerHTML='<span class="hint">No confident hash shape detected yet. You can still save the value with an explicit material type.</span>';return;}
 const detected=route.detections.map(row=>row.label+' ('+row.confidence+')').join(' · ');
 const buttons=route.suggestions.map(row=>'<button type="button" class="btn" data-route-builder="'+e(row.builderId)+'" data-route-kind="'+e(row.kind)+'">'+e(row.label)+'</button>').join('');
 box.innerHTML='<span class="hint">Detected: '+e(detected)+'</span>'+(buttons?'<div class="modal-actions">'+buttons+'</div>':'');
}
function decorateBuilder(section){
 const api=API(),schema=SCHEMA(),s=currentState();if(!api||!schema||!s||!section||section.dataset.credentialMaterialReady==='1')return;
 const builderId=section.getAttribute('data-tool-builder'),builder=schema.get(builderId);if(!builder)return;
 api.ensureState(s,true);const rows=api.list(s),selected=api.selected(s),form=section.querySelector('.tool-builder-form');
 const host=document.createElement('div');host.className='card credential-material-current';host.dataset.credentialMaterialPanel=builderId;
 host.innerHTML='<div class="card-body"><div class="section-head30"><div><span class="eyebrow30">Credential Material</span><h3>Reuse candidate material</h3><p class="hint">Save a password, hash, ticket, key, certificate, cookie, or token once, then hand it to compatible builders without retyping it. Material remains candidate until independent reviewed Evidence proves access.</p></div></div>'+ 
  '<div class="param-row"><label>Saved material</label><select data-credential-select>'+optionRows(rows,selected&&selected.id)+'</select></div>'+ 
  '<div class="modal-actions"><button type="button" class="btn" data-credential-apply>Use selected in this builder</button></div><div class="hint" data-credential-guidance></div>'+ 
  '<details><summary>Add or route material</summary><div class="param-row"><label>Material type</label><select data-credential-kind>'+kindOptions()+'</select></div><div class="param-row"><label>Value / path</label><input type="password" autocomplete="off" data-credential-value placeholder="Paste candidate material or enter a file path"></div><div data-credential-routes></div><div class="modal-actions"><button type="button" class="btn" data-credential-save>Save candidate</button></div></details>'+ 
  '<p class="hint" data-credential-status>'+(selected?'Selected: '+e(visibleLabel(selected))+'. ':'')+'Generated commands and saved material are workflow activity, not proof. Validation requires independent reviewed Evidence and an explicit access fact.</p></div>';
 section.parentNode.insertBefore(host,section);section.dataset.credentialMaterialReady='1';
 const select=host.querySelector('[data-credential-select]'),value=host.querySelector('[data-credential-value]'),kind=host.querySelector('[data-credential-kind]'),status=host.querySelector('[data-credential-status]'),guide=host.querySelector('[data-credential-guidance]');
 function refresh(){const latest=api.list(s),sel=api.selected(s);select.innerHTML=optionRows(latest,sel&&sel.id);renderGuidance(guide,sel,builder);status.textContent=(sel?'Selected: '+visibleLabel(sel)+'. ':'')+'Generated commands and saved material are workflow activity, not proof. Validation requires independent reviewed Evidence and an explicit access fact.';}
 select.addEventListener('change',()=>{api.select(s,select.value);persist();refresh();});
 host.querySelector('[data-credential-apply]').addEventListener('click',()=>{const row=api.selected(s);if(!row){status.textContent='Choose saved material first.';return;}const values=builderValues(row,builder);if(!Object.keys(values).length){status.textContent='The selected material has no compatible fields on this builder.';return;}applyValues(form,builder,values);persist();renderGuidance(guide,row,builder);status.textContent='Selected material handed to compatible fields. It remains '+row.status+' and is not proof of access.';});
 value.addEventListener('input',()=>renderRoutes(host,value.value));
 host.querySelector('[data-credential-save]').addEventListener('click',()=>{const raw=value.value;if(!String(raw||'').trim()){status.textContent='Enter material before saving.';return;}const row=api.add(s,{kind:kind.value,value:raw,source:'credential-material-ui'});api.select(s,row.id);value.value='';renderRoutes(host,'');persist();refresh();});
 host.addEventListener('click',event=>{const button=event.target.closest('[data-route-builder]');if(!button)return;const raw=value.value;if(!String(raw||'').trim())return;const row=api.add(s,{kind:button.dataset.routeKind||'auto',value:raw,source:'credential-hash-route'});api.select(s,row.id);persist();const target=schema.get(button.dataset.routeBuilder);if(target)location.hash='#/tools/'+encodeURIComponent(target.tool);});
 refresh();
}
const LINUX_PATH_CARD_IDS=Object.freeze([
 'linux-sudo-list-review','linux-cron-proof-chain','linux-user-trail-secret-review','linux-process-traffic-secret-review','candidate-credential-validation','credential-pattern-wordlist-helper'
]);
const LINUX_MECHANICS=Object.freeze([
 Object.freeze({id:'sudo-list-analyzer-current',cardId:'linux-sudo-list-review',title:'Analyze sudo -l authorization',tag:'sudo',description:'Use sudo authorization output to reason about run-as target, password behavior, allowed commands, argument constraints, environment handling, and proof versus permission.'}),
 Object.freeze({id:'cron-proof-chain-analyzer-current',cardId:'linux-cron-proof-chain',title:'Prove a cron or timer privilege chain',tag:'cron',description:'Connect schedule, execution principal, script path, writable dependency, trigger cadence, elevated effect, and restoration before treating a scheduled job as a privilege path.'}),
 Object.freeze({id:'linux-user-trail-secret-analyzer-current',cardId:'linux-user-trail-secret-review',title:'Review Linux user trails for candidate secrets',tag:'trails',description:'Review history, env, dotfiles, SSH material, and config snippets for candidate secret material, source scope, redaction needs, and validation path.'}),
 Object.freeze({id:'process-traffic-secret-analyzer-current',cardId:'linux-process-traffic-secret-review',title:'Inspect process and traffic secret exposure',tag:'service',description:'Review process arguments, /proc-style context, service output, and packet captures while separating candidate material from validated access.'}),
 Object.freeze({id:'credential-validation-builder-current',cardId:'candidate-credential-validation',title:'Validate candidate credentials against a scoped service',tag:'hydra',description:'Build bounded, authorized validation templates from candidate user/password sources while preserving source context, rate controls, and proof boundaries.'}),
 Object.freeze({id:'pattern-wordlist-helper-current',cardId:'credential-pattern-wordlist-helper',title:'Generate a small pattern-derived wordlist',tag:'pattern',description:'Turn a discovered credential pattern into a small candidate list with provenance, variables, and non-exfiltration guardrails.'})
]);
function routeName(){return routeParts()[0]||'home';}
function token(value,fallback){const cleaned=String(value||'').trim().replace(/[^A-Za-z0-9._:@\/-]/g,'');return cleaned||fallback;}
function sourceFlag(value,singleFlag,listFlag,fallback){const raw=String(value||'').trim();if(!raw)return listFlag+' '+fallback;if(/[\n, ]/.test(raw)||/\.txt$|\.lst$/i.test(raw))return listFlag+' '+token(raw.split(/[\n, ]+/)[0],fallback);return singleFlag+' '+token(raw,fallback);}
function buildHydraTemplate(host){
 const get=name=>host&&host.querySelector?host.querySelector('[data-hydra-'+name+']'):null;
 const target=token(get('target')&&get('target').value,'TARGET');
 const service=token(get('service')&&get('service').value,'ssh');
 const port=token(get('port')&&get('port').value,'');
 const threads=token(get('threads')&&get('threads').value,'4');
 const users=sourceFlag(get('users')&&get('users').value,'-l','-L','users.txt');
 const passwords=sourceFlag(get('passwords')&&get('passwords').value,'-p','-P','passwords.txt');
 return 'hydra '+users+' '+passwords+(port?' -s '+port:'')+' -t '+threads+' -V '+target+' '+service;
}
function redactSnippet(value){
 return String(value||'')
  .replace(/(password|passwd|pwd|pass|token|secret|api[_-]?key)\s*[:=]\s*([^\s;&|]+)/gi,'$1=[redacted]')
  .replace(/(Authorization:\s*(?:Basic|Bearer)\s+)[A-Za-z0-9._~+\/-]+=*/gi,'$1[redacted]')
  .replace(/([A-Za-z0-9._%+-]+):([^@\s]+)@/g,'$1:[redacted]@')
  .slice(0,900);
}
function mechanic(id){return LINUX_MECHANICS.find(row=>row.id===id);}
function addFinding(findings,id,evidence){const row=mechanic(id);if(row&&!findings.some(item=>item.id===id))findings.push(Object.assign({evidence:evidence||''},row));}
function analyzeLinuxEvidence(value){
 const text=String(value||''),lower=text.toLowerCase(),findings=[];
 if(/sudo\s+-l|matching defaults entries|may run the following commands|nopasswd|setenv/.test(lower))addFinding(findings,'sudo-list-analyzer-current','sudo authorization output detected');
 if(/crontab|cron\.d|\/etc\/cron|run-parts|systemd\s+timer|anacron|\/var\/log\/cron|\/var\/log\/syslog/.test(lower))addFinding(findings,'cron-proof-chain-analyzer-current','scheduled execution evidence detected');
 if(/\.bash_history|\.zsh_history|\.bashrc|\.profile|\.ssh|id_rsa|export\s+\w+=|history|config/.test(lower))addFinding(findings,'linux-user-trail-secret-analyzer-current','user-trail or config evidence detected');
 if(/ps\s+(aux|ef)|\/proc\/\d+\/environ|tcpdump|pcap|authorization:|cookie:|mysql\s+-u|curl\s+.*@|postgres|redis-cli/.test(lower))addFinding(findings,'process-traffic-secret-analyzer-current','process or traffic evidence detected');
 if(/hydra|ssh|ftp|smb|http-post-form|login|username|userlist|password|passlist/.test(lower))addFinding(findings,'credential-validation-builder-current','credential validation context detected');
 if(/pattern|mask|season|year|company|wordlist|candidate/.test(lower))addFinding(findings,'pattern-wordlist-helper-current','candidate pattern context detected');
 return Object.freeze({findings:Object.freeze(findings),redacted:redactSnippet(text)});
}
function cardById(id){
 const lanes=Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:[];
 for(const lane of lanes)for(const card of lane.cards||[])if(card&&card.id===id)return card;
 return null;
}
function laneById(id,title,phase){
 if(!Array.isArray(root.OBOL_LANES))root.OBOL_LANES=[];
 let lane=root.OBOL_LANES.find(row=>row&&row.lane===id);
 if(!lane){lane={lane:id,phase:phase||title,title:title||id,version:0.1,cards:[]};root.OBOL_LANES.push(lane);}
 if(!Array.isArray(lane.cards))lane.cards=[];
 return lane;
}\nfunction addCard(lane,card){
 if(cardById(card.id))return false;
 lane.cards.push(card);
 return true;
}
function appendUnique(list,row,identity){
 if(!Array.isArray(list))return [row];
 if(list.some(item=>identity(item)===identity(row)))return list;
 list.push(row);
 return list;
}
function enhanceOnlineBrute(){
 const card=cardById('online-brute');
 if(!card||card.sourceMined54)return false;
 card.sourceMined54=Object.freeze({wave:'v9.54-linux-privesc-remine-batch1',note:'Credential validation mined from Linux user-trail notes attaches to the existing online-brute path item rather than living in a separate toolbox.'});
 card.hypothesis=String(card.hypothesis||'')+' Source-mined v9.54 reminder: a recovered password, token, or pattern is only a candidate until a narrowly scoped service validation proves it works.';
 card.commands=appendUnique(card.commands||[],{tool:'hydra',run:'hydra -L {{userlist}} -P {{wordlist}} -t 4 -V {{target}} {{service}}',note:'Source-mined candidate-validation template: choose the service that evidence says is reachable, keep threads low, preserve the candidate source, and treat any hit as Evidence to review before promoting it to access.'},item=>String(item.tool)+'|'+String(item.run));
 card.expected=appendUnique(card.expected||[],'[DATA] valid pair found',String);
 card.onFailure=Object.assign({},card.onFailure||{}, {'too many connections':{note:'Lower -t, slow the attempt rate, or stop if lockout policy is unknown. Validation is meant to be bounded, not a blind flood.'}});
 return true;
}
function installLinuxSourceMinedPathCards(){
 if(!Array.isArray(root.OBOL_LANES))return false;
 const lane=laneById('linux-privesc','Linux Privilege Escalation','Privilege Escalation');
 const cracking=laneById('cracking','Password Attacks & Cracking','Credential Attacks');
 let changed=false;
 changed=addCard(lane,{id:'linux-user-trail-secret-review',lane:'linux-privesc',title:'Review Linux User Trails for Candidate Secrets',hypothesis:'After a Linux foothold, shell history, dotfiles, env files, SSH material, and application configs often expose candidate passwords, keys, tokens, paths, usernames, or service hints. Treat every find as candidate material with source context and redaction needs, not as validated access.',prereq:{any:['foothold.linux']},produces:['credential.candidate','privesc.leads'],commands:[{tool:'sh',run:'grep -RniE "(pass|pwd|token|secret|key|credential)" ~/.bash_history ~/.zsh_history ~/.profile ~/.bashrc ~/.ssh 2>/dev/null',note:'Operator-run triage. Capture source path and surrounding context, redact values in reports, and validate narrowly before promoting anything to a credential fact.'},{tool:'sh',run:'find /home /opt /var/www -maxdepth 3 -type f \( -name "*.conf" -o -name "*.ini" -o -name "*.env" -o -name "config*" \) 2>/dev/null',note:'Locate likely config files first; read selectively rather than dumping everything.'}],expected:['password','token','id_rsa','export'],onFailure:{'Permission denied':{note:'Record inaccessible paths as scope boundaries. Do not call the secret absent merely because the current user cannot read a directory.'}},defender:'Mostly local file reads; sensitive-file access can still appear in EDR telemetry.',report:{finding:'Candidate Credentials or Secrets in Linux User Trails',severity:'high'},tools:['grep','find'],os:['linux'],sourceMined54:{wave:'v9.54-linux-privesc-remine-batch1',noteId:'offsec-pen-200-37660dafbcec416c',integration:'new contextual Next Steps card gated by foothold.linux'}})||changed;
 changed=addCard(lane,{id:'linux-process-traffic-secret-review',lane:'linux-privesc',title:'Inspect Linux Processes and Traffic for Secret Exposure',hypothesis:'Service arguments, process environments, local listeners, and packet captures can expose candidate secrets or credential flow. The path value is the interpretation boundary: source context and candidate material are useful, but access is not proven until validated separately.',prereq:{any:['foothold.linux','privesc.leads']},produces:['credential.candidate','privesc.leads'],commands:[{tool:'sh',run:'ps auxww | grep -Ei "(pass|pwd|token|secret|key|mysql|postgres|redis|ldap|curl)"',note:'Look for command-line leakage and service context. Redact any candidate material before reporting or sharing notes.'},{tool:'sh',run:'tr "\\0" "\\n" < /proc/{{pid}}/environ 2>/dev/null | grep -Ei "(pass|pwd|token|secret|key)"',note:'Only inspect processes you are authorized to inspect. Environment findings are candidate material and need service-scoped validation.'},{tool:'tcpdump',run:'sudo tcpdump -i {{interface}} -A host {{target}}',note:'Use only when capture is authorized. Record protocol, source, destination, and whether data is plaintext; do not paste raw secrets into reports.'}],expected:['PASS','TOKEN','Authorization:','Cookie:'],onFailure:{'Operation not permitted':{note:'Current identity lacks visibility. Record the boundary and continue with readable logs/configs instead of guessing.'}},defender:'Process inspection is usually quiet; packet capture and sudo use are visible locally and in endpoint telemetry.',report:{finding:'Secrets Exposed in Process or Network Context',severity:'high'},tools:['ps','grep','tcpdump'],os:['linux'],sourceMined54:{wave:'v9.54-linux-privesc-remine-batch1',noteId:'offsec-pen-200-7d8319c3e311e160',integration:'new contextual Next Steps card gated by Linux foothold or privesc leads'}})||changed;
 changed=addCard(lane,{id:'linux-sudo-list-review',lane:'linux-privesc',title:'Analyze sudo -l Authorization',hypothesis:'sudo -l output is constrained authorization, not instant root. Parse the run-as target, whether a password is required, the exact command path, allowed arguments, SETENV/env behavior, and whether the permitted operation can safely prove privilege.',prereq:{any:['foothold.linux','privesc.leads']},produces:['privesc.leads'],commands:[{tool:'sudo',run:'sudo -l',note:'Capture the full rule. Separate NOPASSWD, run-as user, command path, wildcard arguments, and SETENV before choosing any follow-up.'},{tool:'sh',run:'sudo -u {{runas}} {{allowed_command}} --help',note:'Benign constraint probe when allowed. The goal is to prove how the rule behaves before attempting any privileged operation.'}],expected:['may run the following commands','NOPASSWD','SETENV'],onFailure:{'a password is required':{note:'The rule may still matter, but it is not usable without the current user password or another allowed auth path.'},'not allowed to run sudo':{note:'No sudo rule for this user. Move to files, services, SUID/capabilities, cron, or credentials.'}},defender:'sudo attempts are local auth events. Failed or unusual sudo command probes may be reviewed in auth logs.',report:{finding:'Constrained sudo Rule Requires Review',severity:'high'},tools:['sudo'],os:['linux'],sourceMined54:{wave:'v9.54-linux-privesc-remine-batch1',noteId:'offsec-pen-200-dcd4a16bbbfe100e',integration:'new contextual Next Steps card gated by Linux foothold or privesc leads'}})||changed;
 changed=addCard(lane,{id:'linux-cron-proof-chain',lane:'linux-privesc',title:'Prove Cron or Timer Privilege Chain',hypothesis:'A root cron job, writable script, or timer is only a lead until the full chain is proven: schedule, execution principal, writable dependency, trigger cadence, elevated effect, and restoration. Do not jump straight from writable file to root claim.',prereq:{any:['foothold.linux','privesc.leads']},produces:['privesc.leads','access.root'],commands:[{tool:'sh',run:'cat /etc/crontab && ls -la /etc/cron.d /etc/cron.* 2>/dev/null',note:'Identify scheduled entries and the user each entry runs as. User field matters.'},{tool:'sh',run:'find /etc/cron.d /etc/cron.* /opt /usr/local/bin -writable -type f 2>/dev/null',note:'Look for writable scripts or dependencies referenced by a privileged schedule. Confirm ownership and write path before any test.'},{tool:'sh',run:'grep -R "CRON" /var/log/syslog /var/log/cron 2>/dev/null | tail -50',note:'Use logs or timestamps to prove trigger cadence and effective execution, then restore any temporary test marker.'}],expected:['root','CRON','writable'],onFailure:{'No such file':{note:'Cron logging differs by distro. Check systemd timers, journalctl, or file timestamps instead.'},'Permission denied':{note:'Record what cannot be read. A writable dependency can still be proven with ownership, timestamp, and controlled marker evidence.'}},defender:'Editing scheduled-job scripts is high signal. Prefer benign marker proof and restore exactly what you touched.',report:{finding:'Privileged Scheduled Task or Cron Chain',severity:'critical'},tools:['cat','find','grep'],os:['linux'],sourceMined54:{wave:'v9.54-linux-privesc-remine-batch1',noteId:'offsec-pen-200-ea0ee100f0506b3f',integration:'new contextual Next Steps card gated by Linux foothold or privesc leads'}})||changed;
 changed=addCard(cracking,{id:'candidate-credential-validation',wl:['passwords','default-creds'],lane:'cracking',title:'Validate Candidate Credentials Against a Scoped Service',hypothesis:'A password-like value from Linux trails, process output, traffic, config, or notes is only a candidate. Validate it against one plausible service at a time, preserve where it came from, keep the rate bounded, and promote it only after reviewed Evidence shows a valid authentication.',prereq:{all:['credential.candidate'],any:['ssh.reachable','ftp.reachable','rdp.reachable','web.reachable','smb.reachable','port:22','port:21','port:3389','port:80','port:443','port:445']},produces:['credential.available'],commands:[{tool:'hydra',run:'hydra -L {{userlist}} -P {{wordlist}} -t 4 -V {{target}} {{service}}',note:'Candidate validation template. Pick the service supported by Evidence, keep threads low, and save positive output as reviewed Evidence before moving the path forward.'},{tool:'hydra',run:'hydra -l {{user}} -p {{password}} -t 2 -V {{target}} {{service}}',note:'Single-pair validation when a specific user/password candidate exists. This proves authentication only for the tested service and account.'}],expected:['valid pair found','login:','password:'],onFailure:{'0 valid passwords':{note:'Do not erase the source clue; mark this service/account combination invalid and test only other evidence-supported scopes.'},'too many connections':{note:'Lower -t or stop. Validation is bounded proof, not blind brute force.'}},defender:'Online validation creates authentication events and can trigger lockouts. Check policy before spraying.',report:{finding:'Candidate Credential Validated Against Service',severity:'high'},tools:['hydra'],os:['linux','windows'],sourceMined54:{wave:'v9.54-linux-privesc-remine-batch1',noteId:'offsec-pen-200-37660dafbcec416c',integration:'new contextual credential-validation Next Steps card gated by candidate credentials plus a reachable service'}})||changed;
 changed=addCard(cracking,{id:'credential-pattern-wordlist-helper',wl:['passwords'],lane:'cracking',title:'Build a Small Pattern-Derived Candidate Wordlist',hypothesis:'A discovered credential hint often reveals a pattern rather than a final password. Build a small, explainable candidate list from observed words, seasons, years, separators, usernames, hostnames, or project terms, then validate narrowly instead of dumping a giant list at the service.',prereq:{any:['credential.candidate','web.reachable','ad.domain_known','loot.files']},produces:['wordlist.custom','credential.candidate'],commands:[{tool:'sh',run:'printf "%s\\n" "{{base}}" "{{base}}{{year}}" "{{base}}!" "{{base}}@{{year}}" > wordlists/pattern-candidates.txt',note:'Synthetic pattern seed. Replace placeholders with public-safe observed terms; preserve provenance and keep the list intentionally small.'},{tool:'cewl',run:'cewl http://{{target}} -d 2 -m 5 -w wordlists/site-words.txt',note:'Use target-owned vocabulary only when web content is in scope, then combine with rules rather than hand-copying private note examples.'}],expected:['pattern-candidates.txt','site-words.txt'],onFailure:{'empty input':{note:'No pattern yet. Return to user trails, config files, web vocabulary, or validated username sources before generating candidates.'}},defender:'Offline wordlist creation is invisible; only later service validation generates logs.',report:{finding:'Weak Password Pattern Suspected',severity:'medium'},tools:['sh','cewl'],os:['linux','windows'],sourceMined54:{wave:'v9.54-linux-privesc-remine-batch1',noteId:'offsec-pen-200-37660dafbcec416c',integration:'new contextual wordlist Next Steps card gated by candidate material, web vocabulary, domain context, or looted files'}})||changed;
 changed=enhanceOnlineBrute()||changed;
 root.OBOL_LINUX_SOURCE_MINED_PATH_CARDS=Object.freeze({version:'1.0.0',wave:'v9.54-linux-privesc-remine-batch1',cardIds:LINUX_PATH_CARD_IDS,mechanics:LINUX_MECHANICS});
 if(changed&&routeName()==='path'&&typeof root.route==='function'&&!root.__OBOL_LINUX_SOURCE_MINED_ROUTE_REFRESHED__){
  root.__OBOL_LINUX_SOURCE_MINED_ROUTE_REFRESHED__=true;
  setTimeout(()=>{try{root.route();}catch(_err){}},0);
 }
 return true;
}
function decoratePathCards(){
 if(typeof document==='undefined'||routeName()!=='path')return;
 for(const cardId of LINUX_PATH_CARD_IDS){
  const node=document.querySelector('[data-card-id="'+cardId+'"], [href="#/card/'+cardId+'"]');
  const host=node&&node.closest?node.closest('.card,.next-card,.path-card,article,li'):null;
  if(!host||host.querySelector('[data-source-mined-path-chip]'))continue;
  const chip=document.createElement('small');
  chip.dataset.sourceMinedPathChip='v9.54-linux-privesc-remine-batch1';
  chip.textContent='Source-mined v9.54 · contextual path item';
  host.appendChild(chip);
 }
}
function decorate(){
 installLinuxSourceMinedPathCards();
 const api=API();if(api){api.installCore();api.installReportBoundary();installLiveReportBoundary();const s=currentState();if(s)api.ensureState(s,true);}
 const page=routeName();
 if(page==='path')decoratePathCards();
 if(!api||!['card','tools'].includes(page))return;
 document.querySelectorAll('.tool-builder-current').forEach(decorateBuilder);
}
let observer=null;
function start(){decorate();for(const delay of [60,180,500,1200,2600])setTimeout(decorate,delay);if(typeof MutationObserver!=='undefined'&&!observer){observer=new MutationObserver(()=>decorate());observer.observe(document.documentElement,{childList:true,subtree:true});}}
if(typeof window!=='undefined'){window.addEventListener('hashchange',start);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();}
root.OBOL_CREDENTIAL_MATERIAL_UI=Object.freeze({version:'1.2.0',decorate,applyValues,installLiveReportBoundary,builderValues,builderGuidance,analyzeLinuxEvidence,buildHydraTemplate,installLinuxSourceMinedPathCards,linuxMechanics:LINUX_MECHANICS,linuxPathCardIds:LINUX_PATH_CARD_IDS});
})(typeof window!=='undefined'?window:globalThis);
