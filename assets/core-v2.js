function applicable(card, factSet){
  factSet=factSet||new Set(); const p=card.prereq||{};
  const all=p.all||[], any=p.any||[], none=(p.none||[]).concat(card.blocks||[]);
  if (!all.every(f=>factSet.has(f))) return false;
  if (any.length && !any.some(f=>factSet.has(f))) return false;
  if (none.some(f=>factSet.has(f))) return false;
  return true;
}
function grounded(card, factSet){
  const p=card.prereq||{}; const need=(p.all||[]).concat(p.any||[]);
  return need.some(f=>f!=='scope.defined' && factSet.has(f));
}
function latestActivity(state,cardId,ctx){
  const key=contextKey(normalizeContext(state,ctx));
  for (let i=state.activities.length-1;i>=0;i--){ const a=state.activities[i]; if (a.cardId===cardId && a.contextKey===key) return a; }
  return null;
}
function statusFor(state,cardId,ctx){ const a=latestActivity(state,cardId,ctx); return a ? (a.result==='success'?'done':a.result==='tried'?'tried':'new') : 'new'; }
function phaseLevel(facts){
  if (facts.has('access.root')||facts.has('access.system')||facts.has('access.admin')) return 5;
  if (facts.has('foothold.linux')||facts.has('foothold.windows')||facts.has('foothold.webshell')) return 4;
  if (facts.has('credential.available')||facts.has('credential.ntlm_hash')) return 3;
  if (facts.has('ad.user_list')||facts.has('ad.domain_known')) return 2;
  if (facts.has('scan.initial')) return 1;
  return 0;
}
function cardPhaseWeight(card){
  const lane=(card.lane||'').toLowerCase();
  if (/recon/.test(lane)) return 1;
  if (/web|poison|credential|crack/.test(lane)) return 2;
  if (/ad|active/.test(lane)) return 3;
  if (/privesc/.test(lane)) return 4;
  if (/pivot|lateral/.test(lane)) return 5;
  return 3;
}
function whyNow(card,facts,meta){
  const p=card.prereq||{}; const matched=(p.all||[]).concat((p.any||[]).filter(f=>facts.has(f))).filter(f=>f!=='scope.defined'&&facts.has(f));
  const bits=[];
  if (meta&&meta.newly) bits.push('newly unlocked by your latest evidence');
  if (matched.length) bits.push('matches ' + matched.slice(0,3).map(labelFact).join(', '));
  if (!(p.all||[]).some(f=>f.startsWith('credential.')) && !(p.any||[]).some(f=>f.startsWith('credential.'))) bits.push('does not require a credential prerequisite');
  return bits.length ? bits.join('; ') : 'applicable from the current evidence state';
}
function rankCard(state,card,ctx,meta){
  const facts=effectiveFacts(state,ctx); const p=card.prereq||{}; let score=0;
  if (meta&&meta.newly) score += 120;
  const matchedAll=(p.all||[]).filter(f=>facts.has(f)&&f!=='scope.defined').length;
  const matchedAny=(p.any||[]).filter(f=>facts.has(f)&&f!=='scope.defined').length;
  score += matchedAll*20 + matchedAny*14;
  const serviceMatch=(p.all||[]).concat(p.any||[]).some(f=>/^(port:|smb\.|ldap\.|kerberos\.|web\.|ssh\.|winrm\.|ftp\.|mssql\.|mysql\.|postgresql\.|rdp\.|nfs\.)/.test(f)&&facts.has(f));
  if (serviceMatch) score += 20;
  const level=phaseLevel(facts), cp=cardPhaseWeight(card); score += Math.max(0,18-Math.abs(level-cp)*6);
  const st=statusFor(state,card.id,ctx); if (st==='tried') score -= 25; if (st==='done') score -= 200;
  const sev=((card.report||{}).severity||'').toLowerCase(); score += ({critical:5,high:4,medium:3,low:2,informational:1,info:1}[sev]||0);
  return score;
}
function rankedApplicable(state,lanes,ctx,opts){
  opts=opts||{}; const facts=effectiveFacts(state,ctx); const newest=new Set(((state.ui.lastEvidenceUpdate||{}).newly)||[]);
  let cards=lanes.flatMap(l=>l.cards).filter(c=>applicable(c,facts)&&statusFor(state,c.id,ctx)!=='done');
  if (!opts.showAll && effectiveFactRecords(state,ctx).some(r=>r.id!=='scope.defined')) cards=cards.filter(c=>grounded(c,facts));
  return cards.map(c=>({card:c,score:rankCard(state,c,ctx,{newly:newest.has(c.id)}),why:whyNow(c,facts,{newly:newest.has(c.id)}),newly:newest.has(c.id)})).sort((a,b)=>b.score-a.score||a.card.title.localeCompare(b.card.title));
}
function snapshotApplicable(state,lanes,ctx){ return new Set(rankedApplicable(state,lanes,ctx,{showAll:true}).map(x=>x.card.id)); }

function normalizeArtifact(kind,v){ return clean(v); }
function addArtifact(state,kind,v){
  if (!state.artifacts[kind]) state.artifacts[kind]=[]; v=normalizeArtifact(kind,v); if (!v) return false;
  if (!state.artifacts[kind].includes(v)){ state.artifacts[kind].push(v); return true; }
  return false;
}
function ensureIdentity(state,name,opts){
  opts=opts||{}; name=clean(name).replace(/^.*\\/,''); if (!name) return null;
  const domain=clean(opts.domain).toLowerCase(); let i=state.identities.find(x=>x.name.toLowerCase()===name.toLowerCase() && (x.domain||'')===domain);
  if (!i){ i={id:uid('identity'),name,domain,source:opts.source||'intake',firstSeen:now()}; state.identities.push(i); }
  return i;
}
function detectSecretType(secret){ secret=clean(secret); if (/^[0-9a-f]{32}$/i.test(secret)) return 'ntlm'; if (/\$krb5/i.test(secret)) return 'kerberos'; if (/^[A-Za-z0-9+/=]{40,}$/.test(secret)) return 'token'; return 'password'; }
function addCredential(state,cred,opts){
  opts=opts||{}; const username=clean(cred.username||cred.user); const secret=clean(cred.secret); if (!username||!secret) return null;
  const domain=clean(cred.domain||opts.domain).toLowerCase(); const type=cred.secretType||detectSecretType(secret);
  let c=state.credentials.find(x=>x.username.toLowerCase()===username.toLowerCase()&&(x.domain||'')===domain&&x.secret===secret&&x.secretType===type);
  if (!c){
    c={ id:uid('cred'), username, domain, secretType:type, secret, source:cred.source||opts.source||'intake', sourceContext:opts.context?contextKey(opts.context):'global:global', obtainedFrom:clean(cred.obtainedFrom), validatedAgainst:Array.isArray(cred.validatedAgainst)?cred.validatedAgainst:[], privilege:clean(cred.privilege), firstSeen:now(), confidence:cred.confidence||'medium' };
    state.credentials.push(c); ensureIdentity(state,username,{domain,source:c.source});
  }
  return c;
}

function applyEvidenceUpdate(state,lanes,update){
  update=update||{}; const ctx=normalizeContext(state,update.context||state.activeContext); const before=snapshotApplicable(state,lanes,ctx);
  const gained=[], addedHosts=[], addedArtifacts={users:0,hashes:0,creds:0};
  for (const h of update.hosts||[]){ const mh=mergeHost(state,h); addedHosts.push(mh.id); }
  if (update.domain){ const d=ensureDomain(state,update.domain,{base_dn:update.base_dn,netbios:update.netbios}); if (d && ctx.type==='host'){ const h=hostForContext(state,ctx); if (h&&!h.domain) h.domain=d.name; } }
  for (const [k,v] of Object.entries(update.params||{})) if (v && !state.params[k]) state.params[k]=v;
  for (const f of update.facts||[]){
    const spec=typeof f==='string'?{id:f}:f; const r=addFact(state,spec.id,{context:spec.context||ctx,scope:spec.scope,subject:spec.subject,source:spec.source||update.source||'intake',evidence:spec.evidence||update.evidence||'',confidence:spec.confidence||update.confidence||'high'}); if (r.added) gained.push(r.record.id);
  }
  const arts=update.artifacts||{};
  for (const k of ['users','hashes','creds']) for (const v of arts[k]||[]) if (addArtifact(state,k,v)) addedArtifacts[k]++;
  const dom=(domainForContext(state,ctx)||{}).name||state.params.domain||'';
  for (const u of arts.users||[]) ensureIdentity(state,u,{domain:dom,source:update.source});
  for (const raw of arts.creds||[]){
    let m=String(raw).match(/^([^:\s]+):(.+)$/); if (m) addCredential(state,{username:m[1],secret:m[2],source:update.source},{domain:dom,context:ctx});
    else { m=String(raw).match(/^([^\s]+)\s+\((?:NT:\s*)?([0-9a-f]{32})\)$/i); if (m) addCredential(state,{username:m[1],secret:m[2],secretType:'ntlm',source:update.source},{domain:dom,context:ctx}); }
  }
  const after=snapshotApplicable(state,lanes,ctx); const newly=[...after].filter(id=>!before.has(id));
  state.ui.lastEvidenceUpdate={ at:now(), source:update.source||'intake', contextKey:contextKey(ctx), facts:[...new Set(gained)], newly, artifactCounts:addedArtifacts, hosts:addedHosts };
  state.updatedAt=now(); return state.ui.lastEvidenceUpdate;
}

function recordActivity(state,activity){
  const ctx=normalizeContext(state,activity.context||state.activeContext); const a={
    id:uid('activity'), cardId:activity.cardId, contextKey:contextKey(ctx), context:{...ctx}, contextLabel:contextLabel(state,ctx),
    result:activity.result||'tried', outcomeFacts:Array.isArray(activity.outcomeFacts)?activity.outcomeFacts:[], command:clean(activity.command), evidence:clean(activity.evidence), at:activity.at||now(), source:activity.source||'manual'
  };
  state.activities.push(a);
  if (a.result==='success') for (const f of a.outcomeFacts) addFact(state,f,{context:ctx,source:'card:'+a.cardId,evidence:a.evidence,confidence:'high',observedAt:a.at});
  state.updatedAt=now(); return a;
}
function resetCard(state,cardId,ctx){ const key=contextKey(normalizeContext(state,ctx)); state.activities=state.activities.filter(a=>!(a.cardId===cardId&&a.contextKey===key)); }

function migrateV1(v1){
  const s=newState(); if (!v1||typeof v1!=='object') return s;
  s.params={...(v1.params||{})};
  for (const b of v1.boxes||[]) mergeHost(s,b);
  if (s.hosts.length) s.activeContext={type:'host',id:s.hosts[0].id};
  const ctx=s.activeContext;
  for (const f of v1.facts||[]) addFact(s,f,{context:ctx,source:'migration:v1',evidence:'Imported from obol-state-v1',confidence:'medium'});
  s.artifacts={users:[...((v1.artifacts||{}).users||[])],hashes:[...((v1.artifacts||{}).hashes||[])],creds:[...((v1.artifacts||{}).creds||[])]};
  const dom=s.params.domain||((s.hosts.find(h=>h.domain)||{}).domain)||''; if (dom) ensureDomain(s,dom,{base_dn:s.params.base_dn,netbios:s.params.dc_netbios});
  for (const u of s.artifacts.users) ensureIdentity(s,u,{domain:dom,source:'migration:v1'});
  for (const c of s.artifacts.creds){ const m=String(c).match(/^([^:\s]+):(.+)$/); if (m) addCredential(s,{username:m[1],secret:m[2],source:'migration:v1'},{domain:dom,context:ctx}); }
  for (const [cardId,p] of Object.entries(v1.progress||{})){
    if (!p||(!p.status&&!p.evidence)) continue;
    recordActivity(s,{cardId,context:ctx,result:p.status==='done'?'success':'tried',outcomeFacts:[],evidence:p.evidence||'',at:p.at||now(),source:'migration:v1'});
  }
  s.ui={...s.ui,...(v1.ui||{}),variants:{...((v1.ui||{}).variants||{})},opts:{},lastEvidenceUpdate:(v1.ui||{}).lastIntake||null};
  s.bh=v1.bh||null; s.timerEnd=v1.timerEnd||null; s.timerStart=v1.timerStart||null;
  s.migratedFrom='obol-state-v1'; return s;
}
function coerceState(raw){
  if (!raw||typeof raw!=='object') return newState();
  if (raw.schemaVersion===SCHEMA_VERSION && Array.isArray(raw.hosts) && Array.isArray(raw.facts)){
    const s={...newState(),...raw}; s.ui={...newState().ui,...(raw.ui||{})}; s.artifacts={...newState().artifacts,...(raw.artifacts||{})};
    s.hosts=(raw.hosts||[]).map(normalizeHost); s.domains=(raw.domains||[]).map(normalizeDomain); s.activeContext=normalizeContext(s,raw.activeContext); return s;
  }
  if (raw.boxes||Array.isArray(raw.facts)) return migrateV1(raw);
  throw new Error('Unsupported Obol workspace schema');
}
function sanitizedCopy(state){
  const s=JSON.parse(JSON.stringify(state));
  s.credentials=(s.credentials||[]).map(c=>({...c,secret:'[REDACTED]'}));
  s.artifacts.creds=(s.artifacts.creds||[]).map(()=> '[REDACTED]');
  s.artifacts.hashes=(s.artifacts.hashes||[]).map(()=> '[REDACTED HASH]');
  for (const h of s.hosts||[]) h.creds=(h.creds||[]).map(c=>({...c,secret:'[REDACTED]'}));
  return s;
}

root.OBOL_CORE_V2={ VERSION,SCHEMA_VERSION,newState,migrateV1,coerceState,sanitizedCopy,uid,slug,simpleHash,commandId,optionId,labelFact,contextKey,contextLabel,normalizeContext,hostForContext,domainForContext,ensureDomain,mergeHost,factScope,effectiveFactRecords,effectiveFacts,hasFact,addFact,removeFact,factReasons,applicable,grounded,statusFor,latestActivity,whyNow,rankCard,rankedApplicable,snapshotApplicable,addArtifact,ensureIdentity,addCredential,applyEvidenceUpdate,recordActivity,resetCard,now };
