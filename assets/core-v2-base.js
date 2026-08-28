// Obol v2 core — shared classic-script lexical scope.
const root = typeof window!=='undefined'?window:globalThis;
'use strict';

const VERSION = '2.0.0';
const SCHEMA_VERSION = 2;

const FACT_LABELS = {
  'scope.defined':'Scope defined','host.alive':'Host alive','scan.initial':'Initial scan complete','scan.full':'Full scan complete',
  'ad.domain_known':'Domain known','ad.dc_candidate':'Domain controller candidate','ad.user_list':'Validated user list','ad.graph.collected':'BloodHound graph collected','ad.attack_paths':'AD attack paths available',
  'credential.available':'Validated credential available','credential.candidate':'Credential candidate available','credential.ntlm_hash':'NTLM hash available',
  'foothold.linux':'Linux foothold','foothold.windows':'Windows foothold','foothold.webshell':'Web shell foothold',
  'access.admin':'Local administrator access','access.root':'Root access','access.system':'SYSTEM access',
  'smb.signing_required':'SMB signing required','smb.signing_disabled':'SMB signing not required','kerberos.clock_skew':'Kerberos clock skew detected',
  'os.windows':'Windows target','os.linux':'Linux target','nfs.reachable':'NFS reachable','nfs.exports':'NFS exports confirmed'
};

const HOST_PREFIXES = ['port:','svc.','smb.','ldap.','kerberos.','web.','ssh.','winrm.','ftp.','mssql.','mysql.','postgresql.','rdp.','nfs.','ike.','finger.','k8s.','docker.','redis.','elastic.','oracle.','vnc.','smtp.','os.','foothold.','access.','shell.','exploit.'];
const DOMAIN_PREFIXES = ['ad.','dns.','hash.asrep','hash.tgs'];
const GLOBAL_FACTS = new Set(['scope.defined']);

function now(){ return new Date().toISOString(); }
function uid(prefix){ return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8); }
function clean(s){ return String(s == null ? '' : s).trim(); }
function slug(s){ return clean(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72) || 'item'; }
function simpleHash(s){
  s = String(s || ''); let h = 2166136261;
  for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
function commandId(cmd, index){ return cmd.id || ('cmd-' + slug(cmd.tool || 'tool') + '-' + simpleHash(cmd.run || index)); }
function optionId(opt, index){
  if (opt.id) return opt.id;
  if (opt.flag) return 'flag:' + opt.flag;
  if (opt.script) return 'script:' + opt.script;
  if (opt.radio) return 'radio:' + opt.radio + ':' + opt.value;
  if (opt.arg) return 'arg:' + opt.arg;
  return 'opt:' + index;
}
function labelFact(f){
  if (FACT_LABELS[f]) return FACT_LABELS[f];
  if (f.startsWith('port:')) return 'Port ' + f.slice(5) + ' reachable';
  return f.replace(/[._:]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
}

function newState(){
  return {
    schemaVersion: SCHEMA_VERSION,
    obolVersion: VERSION,
    createdAt: now(), updatedAt: now(),
    params: {}, hosts: [], domains: [],
    activeContext: { type:'global', id:'global' },
    facts: [{ id:'scope.defined', scope:'global', subject:'global', source:'system', evidence:'Workspace initialized', confidence:'high', observedAt:now() }],
    artifacts: { users:[], hashes:[], creds:[] },
    identities: [], credentials: [], activities: [], drafts: {},
    ui: { variants:{}, opts:{}, bannerDismissed:false, reportMode:'standard', pathShowAll:false, lastEvidenceUpdate:null, lastCopied:{} },
    bh: null, timerEnd:null, timerStart:null
  };
}

function normalizeHost(h){
  const ip = clean(h.ip); const id = h.id || (ip ? 'host:' + ip : uid('host'));
  return { id, name:clean(h.name), ip, hostname:clean(h.hostname), domain:clean(h.domain).toLowerCase(), os:clean(h.os), notes:clean(h.notes), pwned:clean(h.pwned), ports:Array.isArray(h.ports)?h.ports:[], flags:Array.isArray(h.flags)?h.flags:[], creds:Array.isArray(h.creds)?h.creds:[] };
}
function normalizeDomain(d){
  const name = clean(d.name || d.domain).toLowerCase();
  return { id:d.id || ('domain:' + (name || uid('domain'))), name, base_dn:clean(d.base_dn), netbios:clean(d.netbios) };
}
function normalizeContext(state, ctx){
  if (!ctx) ctx = state.activeContext;
  if (!ctx || !ctx.type) return {type:'global',id:'global'};
  if (ctx.type === 'host' && state.hosts.some(h=>h.id===ctx.id)) return {type:'host',id:ctx.id};
  if (ctx.type === 'domain' && state.domains.some(d=>d.id===ctx.id)) return {type:'domain',id:ctx.id};
  return {type:'global',id:'global'};
}
function contextKey(ctx){ ctx = ctx || {type:'global',id:'global'}; return ctx.type + ':' + ctx.id; }
function contextLabel(state, ctx){
  ctx = normalizeContext(state, ctx);
  if (ctx.type === 'host'){
    const h = state.hosts.find(x=>x.id===ctx.id); return h ? (h.name || h.hostname || h.ip || h.id) : ctx.id;
  }
  if (ctx.type === 'domain'){
    const d = state.domains.find(x=>x.id===ctx.id); return d ? d.name : ctx.id;
  }
  return 'Engagement';
}
function hostForContext(state, ctx){ ctx=normalizeContext(state,ctx); return ctx.type==='host' ? state.hosts.find(h=>h.id===ctx.id) || null : null; }
function domainForContext(state, ctx){
  ctx=normalizeContext(state,ctx);
  if (ctx.type==='domain') return state.domains.find(d=>d.id===ctx.id) || null;
  if (ctx.type==='host'){
    const h=hostForContext(state,ctx); if (!h || !h.domain) return null;
    return state.domains.find(d=>d.name===h.domain) || null;
  }
  return null;
}
function ensureDomain(state, name, extras){
  name = clean(name).toLowerCase(); if (!name) return null;
  let d = state.domains.find(x=>x.name===name);
  if (!d){ d = normalizeDomain({name}); state.domains.push(d); }
  if (extras){ if (extras.base_dn && !d.base_dn) d.base_dn=extras.base_dn; if (extras.netbios && !d.netbios) d.netbios=extras.netbios; }
  return d;
}
function mergeHost(state, incoming){
  const n=normalizeHost(incoming); let h = state.hosts.find(x => (n.ip && x.ip===n.ip) || x.id===n.id);
  if (!h){ state.hosts.push(n); h=n; }
  else {
    for (const k of ['name','hostname','domain','os','notes','pwned']) if (n[k]) h[k]=n[k];
    if (n.ports && n.ports.length) h.ports=n.ports;
    if (n.flags && n.flags.length) h.flags=n.flags;
    if (n.creds && n.creds.length) h.creds=n.creds;
  }
  if (h.domain) ensureDomain(state,h.domain);
  return h;
}

function factScope(state, factId, ctx){
  ctx = normalizeContext(state,ctx);
  if (GLOBAL_FACTS.has(factId)) return {scope:'global',subject:'global'};
  if (HOST_PREFIXES.some(p=>factId.startsWith(p)) || /^port:\d+$/.test(factId)){
    if (ctx.type==='host') return {scope:'host',subject:ctx.id};
    return {scope:'global',subject:'global'};
  }
  if (DOMAIN_PREFIXES.some(p=>factId.startsWith(p))){
    const d = domainForContext(state,ctx);
    if (d) return {scope:'domain',subject:d.id};
    if (ctx.type==='domain') return {scope:'domain',subject:ctx.id};
    return {scope:'global',subject:'global'};
  }
  if (factId.startsWith('credential.')){
    const d = domainForContext(state,ctx);
    return d ? {scope:'domain',subject:d.id} : {scope:'global',subject:'global'};
  }
  return ctx.type==='host' ? {scope:'host',subject:ctx.id} : ctx.type==='domain' ? {scope:'domain',subject:ctx.id} : {scope:'global',subject:'global'};
}
function factVisibleInContext(state, rec, ctx){
  ctx=normalizeContext(state,ctx);
  if (rec.scope==='global' || rec.subject==='global') return true;
  if (ctx.type==='host'){
    if (rec.scope==='host' && rec.subject===ctx.id) return true;
    const d=domainForContext(state,ctx); if (d && rec.scope==='domain' && rec.subject===d.id) return true;
  }
  if (ctx.type==='domain' && rec.scope==='domain' && rec.subject===ctx.id) return true;
  return false;
}
function effectiveFactRecords(state, ctx){ return state.facts.filter(r=>factVisibleInContext(state,r,ctx)); }
function effectiveFacts(state, ctx){ return new Set(effectiveFactRecords(state,ctx).map(r=>r.id)); }
function hasFact(state,id,ctx){ return effectiveFacts(state,ctx).has(id); }
function addFact(state, id, opts){
  opts=opts||{}; id=clean(id); if (!id) return {added:false,record:null};
  const ctx=normalizeContext(state,opts.context);
  const sc=opts.scope && opts.subject ? {scope:opts.scope,subject:opts.subject} : factScope(state,id,ctx);
  const existing=state.facts.find(r=>r.id===id && r.scope===sc.scope && r.subject===sc.subject);
  if (existing){
    if (opts.evidence && !existing.evidence) existing.evidence=clean(opts.evidence).slice(0,500);
    if (opts.confidence) existing.confidence=opts.confidence;
    return {added:false,record:existing};
  }
  const rec={ id, scope:sc.scope, subject:sc.subject, source:opts.source||'manual', evidence:clean(opts.evidence).slice(0,500), confidence:opts.confidence||'high', observedAt:opts.observedAt||now() };
  state.facts.push(rec); return {added:true,record:rec};
}
function removeFact(state,id,ctx){
  ctx=normalizeContext(state,ctx);
  const before=state.facts.length;
  state.facts=state.facts.filter(r=>!(r.id===id && factVisibleInContext(state,r,ctx) && r.id!=='scope.defined'));
  return state.facts.length!==before;
}
function factReasons(state,id,ctx){ return effectiveFactRecords(state,ctx).filter(r=>r.id===id); }
