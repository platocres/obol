'use strict';

/*
 * Equivalence proof for the v9.44 Evidence-parsing ownership-area retirement.
 *
 * The Evidence owner assets/obol-evidence-current.js stays an exact ordered
 * concatenation: nothing in the surviving chain is rewritten, so conservative
 * interpretation, proof boundaries, and report lineage cannot move. What v9.44
 * changes is which fragments are in that chain at all.
 *
 * The Intake overlays form a decorator chain. Each overlay reads the analyzeTerminal
 * already published on an earlier OBOL_INTAKE_* global, wraps it, and writes the
 * wrapper back onto OBOL_INTAKE_V21. The four retired overlays share a latent break:
 *
 *   intake-v7.6.js  reads OBOL_INTAKE_V21, decorates it, and publishes OBOL_INTAKE_V76
 *                   with helpers only — it never puts analyzeTerminal on V76.
 *   intake-v7.7.js  hooks T=OBOL_INTAKE_V76 and guards `if(!T.analyzeTerminal)return`,
 *                   so it returns immediately and never publishes OBOL_INTAKE_V77.
 *   intake-v7.8.js  hooks T=OBOL_INTAKE_V77 (undefined) -> returns.
 *   intake-v7.9.js  hooks T=OBOL_INTAKE_V78 (undefined) -> returns.
 *   intake-v8.2.js  hooks T=OBOL_INTAKE_V79 (undefined) -> returns.
 *
 * So in every load order the runtime actually produces, these four overlays run their
 * guard, publish nothing, and mutate nothing. Retiring them from the live runtime is
 * therefore observably inert. This validator proves that two independent ways:
 *
 *   1. reachability: it executes the whole frozen Intake chain fragment by fragment and
 *      confirms the four retired overlays never publish their OBOL_INTAKE_* global and
 *      never change OBOL_INTAKE_V21.analyzeTerminal, while every surviving overlay does
 *      publish its global;
 *   2. differential: it builds the Evidence runtime twice — once from the full frozen
 *      fragment set and once from the surviving set the owner ships — and requires the
 *      exported OBOL_* globals and the analyzeTerminal output over a fixed operator
 *      corpus to be byte-for-byte identical.
 *
 * The behavior the four overlays were written to add (no-credentials poisoning/coercion
 * Evidence beyond v7.6, relay-SOCKS, WebDAV coercion, Windows local-exploit, and
 * offline-cracking Evidence) never reached production because of the break. That is a
 * real latent defect, tracked separately as cc-evidence-chain-restore; this release
 * does not silently bless the loss, it removes the dead files and files the gap.
 */

const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const bundles=require('./sync-runtime-bundles');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');

/* A representative operator transcript corpus spanning the families the retired
   overlays claimed plus the families their live predecessors own, so a behavior
   change in either the retired or the surviving chain would move a result. */
const EVIDENCE_CORPUS=Object.freeze([
 "└─$ sudo mitm6 -i eth0 -d corp.local\nReplying to DHCPv6 request from fe80::1\nDNS reply sent",
 "└─$ sudo bettercap -iface eth0 -eval 'arp.spoof on'\narp.spoof started",
 "└─$ sudo Pcredz -i eth0 -v\nUsername: CORP\\alice Password: Secret!",
 "└─$ python3 PetitPotam.py -d corp.local 10.0.0.5 10.0.0.10\nAttack worked! EfsRpcOpenFileRaw success",
 "└─$ ntlmrelayx.py -t smb://10.0.0.9 -socks\nServer bound to 127.0.0.1:1080\nSOCKS proxy started",
 "└─$ python3 dementor.py 10.0.0.5 10.0.0.10 -pipe efsr\nCoercing the target",
 "└─$ .\\GodPotato.exe -cmd 'cmd /c whoami'\nnt authority\\system",
 "└─$ hashcat -m 13100 tgs.hash rockyou.txt\nStatus...........: Cracked\nRecovered........: 1/1 (100.00%)",
 "└─$ john --format=netntlmv2 hashes.txt\n1 password hash cracked",
 "└─$ john --show hashes.txt\nalice:Password1",
 "└─$ nxc smb 10.0.0.5 -u '' -p ''\nSMB 10.0.0.5 445 DC01 [*] Windows Server 2019",
 "└─$ sudo -l\nUser bob may run the following commands:\n(ALL) NOPASSWD: /usr/bin/find"
]);

/* Executes domain + core + the given Evidence fragment list in a fresh isolated VM
   context and returns the observable surface: the sorted OBOL_* global names and the
   analyzeTerminal output over the corpus. Pure with respect to its inputs — no shared
   module state — so tests can call it with mutated fragment lists. */
function loadEvidenceRuntime(fragmentList){
 const sandbox={console};
 sandbox.window=sandbox;
 sandbox.globalThis=sandbox;
 sandbox.DOMParser=function(){};
 vm.createContext(sandbox);
 const exec=rel=>vm.runInContext(read(rel),sandbox,{filename:rel});
 for(const rel of manifest.node.data)exec(rel);
 for(const rel of manifest.node.core)exec(rel);
 for(const rel of fragmentList)exec(rel);
 const globals=Object.keys(sandbox).filter(k=>/^OBOL_/.test(k)).sort();
 const C=sandbox.OBOL_CORE_V2,lanes=sandbox.OBOL_LANES,T=sandbox.OBOL_INTAKE_V21;
 assert(C&&lanes&&T&&typeof T.analyzeTerminal==='function','Evidence runtime failed to initialize analyzeTerminal');
 const results=EVIDENCE_CORPUS.map(text=>{
  const state=C.newState();
  const ctx=C.normalizeContext?C.normalizeContext(state,state.activeContext):state.activeContext;
  return T.analyzeTerminal(text,lanes,state,ctx);
 });
 return {globals,results:JSON.parse(JSON.stringify(results))};
}

/* Executes domain + core, then the full frozen Intake chain fragment by fragment,
   recording for each fragment whether it published its own OBOL_INTAKE_* global and
   whether it changed OBOL_INTAKE_V21.analyzeTerminal. This is the reachability model
   the retirement depends on, derived from real execution rather than assertion. */
function chainReachability(){
 const sandbox={console};
 sandbox.window=sandbox;
 sandbox.globalThis=sandbox;
 sandbox.DOMParser=function(){};
 vm.createContext(sandbox);
 const exec=rel=>vm.runInContext(read(rel),sandbox,{filename:rel});
 for(const rel of manifest.node.data)exec(rel);
 for(const rel of manifest.node.core)exec(rel);
 const intake=manifest.groups.intake;
 const record={};
 let prevAnalyze=sandbox.OBOL_INTAKE_V21&&sandbox.OBOL_INTAKE_V21.analyzeTerminal;
 for(const rel of intake){
  const suffix=(rel.match(/intake-v(\d)\.(\d+)\.js$/)||[]).slice(1).join('');
  const globalName='OBOL_INTAKE_V'+suffix;
  const hadGlobal=Object.prototype.hasOwnProperty.call(sandbox,globalName);
  exec(rel);
  const nowAnalyze=sandbox.OBOL_INTAKE_V21&&sandbox.OBOL_INTAKE_V21.analyzeTerminal;
  record[rel]={
   publishes:!hadGlobal&&Object.prototype.hasOwnProperty.call(sandbox,globalName),
   mutatesAnalyze:nowAnalyze!==prevAnalyze
  };
  prevAnalyze=nowAnalyze;
 }
 return record;
}

function main(){
 /* ---- manifest metadata ---------------------------------------------------- */
 const area=(manifest.bundles&&manifest.bundles.areas||[]).find(candidate=>candidate.id==='evidenceParsing');
 assert(area,'runtime manifest declares the Evidence parsing ownership area');
 assert.strictEqual(area.scope,'lazy','the Evidence area is a route-lazy owner');
 assert.strictEqual(area.strategy,'ordered-fragment-concatenation','the surviving Evidence chain stays exact-owned so no behavior is rewritten');

 const ev=manifest.evidenceCurrent;
 assert(ev,'runtime manifest declares evidenceCurrent metadata');
 assert.strictEqual(ev.owner,area.owner,'evidenceCurrent points at the Evidence owner');
 assert.strictEqual(ev.owner,'assets/obol-evidence-current.js','the Evidence owner stays stable and non-versioned');
 assert.strictEqual(ev.generator,'tools/sync-runtime-bundles.js','evidenceCurrent declares its generator');
 assert.strictEqual(ev.equivalenceValidator,'tools/validate-evidence-current-equivalence.js','evidenceCurrent declares this validator');
 assert.strictEqual(ev.retirementGate,'analyzeTerminal','evidenceCurrent names the reachability gate the retirement depends on');
 assert.deepStrictEqual(Array.from(ev.historicalFragments),Array.from(area.fragments),'evidenceCurrent records the surviving Evidence chain');

 const retired=Array.from(ev.retiredFragments);
 assert.strictEqual(retired.length,4,'v9.44 retires the four unreachable Evidence overlays');
 assert.strictEqual(new Set(retired).size,retired.length,'the retired Evidence ledger contains no duplicates');
 assert.deepStrictEqual(retired.slice().sort(),['assets/intake-v7.7.js','assets/intake-v7.8.js','assets/intake-v7.9.js','assets/intake-v8.2.js'],'the retired overlays are exactly the broken subchain');
 assert(area.fragments.includes(ev.lastReachableOverlay),'the last reachable overlay stays in the Evidence owner');

 /* Retirement removes fragments from the live runtime only. Nothing is deleted. */
 for(const rel of retired){
  assert(fs.existsSync(path.join(root,rel)),'retired Evidence overlay stays on disk as the regression ledger: '+rel);
  assert(manifest.scripts.includes(rel),'retired Evidence overlay stays in the frozen historical ledger: '+rel);
  assert(manifest.retiredScripts.includes(rel),'retired Evidence overlay is declared in the retired ledger: '+rel);
  assert(!manifest.startupScripts.includes(rel),'retired Evidence overlay must not be in operator startup: '+rel);
  assert(!area.fragments.includes(rel),'retired Evidence overlay leaked back into the Evidence owner: '+rel);
  for(const group of manifest.deferredScriptGroups||[])assert(!(manifest.lazy[group]||[]).includes(rel),'a retired overlay must not reappear as a route-lazy group member: '+rel);
 }

 /* ---- reachability --------------------------------------------------------- */
 const reach=chainReachability();
 const retiredSet=new Set(retired);
 for(const [rel,info] of Object.entries(reach)){
  if(retiredSet.has(rel)){
   assert(!info.publishes,'a retired overlay must never publish its OBOL_INTAKE_* global in the real chain: '+rel);
   assert(!info.mutatesAnalyze,'a retired overlay must never change OBOL_INTAKE_V21.analyzeTerminal: '+rel);
  }else{
   assert(info.publishes,'a surviving Evidence overlay must publish its OBOL_INTAKE_* global so the chain stays intact: '+rel);
  }
 }
 /* v7.6 is the last link that still publishes; every retired overlay comes after it. */
 assert(reach[ev.lastReachableOverlay]&&reach[ev.lastReachableOverlay].publishes,ev.lastReachableOverlay+' must be the last reachable overlay and still publish');

 /* ---- differential --------------------------------------------------------- */
 const frozenGroup=[...manifest.groups.vendor,'assets/bh-v2-patch.js',...manifest.groups.intake];
 const frozen=loadEvidenceRuntime(frozenGroup);
 const live=loadEvidenceRuntime(area.fragments);
 assert.deepStrictEqual(live.globals,frozen.globals,'the surviving Evidence chain publishes exactly the same OBOL_* globals as the full frozen chain');
 assert.strictEqual(sha(JSON.stringify(live.results)),sha(JSON.stringify(frozen.results)),'the surviving Evidence chain produces byte-identical analyzeTerminal output over the operator corpus');
 /* None of the retired globals were ever real, so they must be absent from both. */
 for(const missing of ['OBOL_INTAKE_V77','OBOL_INTAKE_V78','OBOL_INTAKE_V79','OBOL_INTAKE_V82'])assert(!frozen.globals.includes(missing),'a retired overlay global was never actually published in the frozen runtime: '+missing);

 /* ---- surviving owner ------------------------------------------------------ */
 const owner=read(area.owner);
 assert.strictEqual(owner,bundles.expected(area),area.owner+' is out of sync with its surviving fragments — run node tools/sync-runtime-bundles.js --write');
 for(const rel of retired)assert(!owner.includes('obol-runtime-fragment: '+rel+' '),'retired overlay is still concatenated into '+area.owner+': '+rel);
 for(const rel of area.fragments)assert(owner.includes('obol-runtime-fragment: '+rel+' '),'surviving fragment is missing from '+area.owner+': '+rel);
 new vm.Script(owner,{filename:area.owner});

 console.log('Evidence current owner valid: '+area.fragments.length+' fragments still reach the decorator chain and '+retired.length+' unreachable overlays are provably inert against the '+ev.retirementGate+' gate; surviving analyzeTerminal corpus sha256 '+sha(JSON.stringify(live.results)).slice(0,16)+'.');
}

if(require.main===module)main();

module.exports={main,EVIDENCE_CORPUS,loadEvidenceRuntime,chainReachability};
