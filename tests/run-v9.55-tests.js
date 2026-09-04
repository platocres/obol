'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function has(rel,needle){assert(read(rel).includes(needle),`${rel} must include ${needle}`);}
function lacks(rel,needle){assert(!read(rel).includes(needle),`${rel} must not include ${needle}`);}

cp.execFileSync(process.execPath,[path.join(root,'tools','validate-release-pr.js'),'--repo-only','--release-version=9.55'],{cwd:root,stdio:'inherit'});

for(const rel of [
 'assets/app-v2-views.js',
 'assets/runtime-current.js',
 'assets/ad-pivoting-current.js',
 'assets/card-evidence-current.js',
 'data/current-release.js',
 'data/product-hardening/windows-privesc-remining-v9.55.js',
 'data/product-hardening/ad-pivoting-remining-v9.55.js',
 'docs/CARD-UI-STANDARD.md',
 'docs/V9.55-CARD-EVIDENCE-OS-WINDOWS.md',
 'docs/v9.55.md',
 'README.md',
 'index.html',
 'CHANGELOG.md'
]) assert(fs.existsSync(path.join(root,rel)),`${rel} must exist`);

for(const expected of ["version:'9.55.0'","label:'v9.55'"]) has('data/current-release.js',expected);
has('README.md','Current release: **v9.55**');
has('index.html','<title>Obol v9.55 — Product Hardening</title>');
has('index.html','Offensive Box Operations Ledger · v9.55');
has('CHANGELOG.md','## v9.55 — Product-hardening release for the Notes Impact and Source Re-mining package');

// Preserve the v9.55 evidence-flow and OS-routing contracts from the prior hotfix.
for(const expected of [
 'installCardScopedEvidenceFlow',
 'storeCardEvidenceIntent',
 'obol-card-evidence-source',
 'Apply evidence from ',
 'cardScopedSource(src,r.mode)',
 "'card:'+src.cardId+':intake:'+mode",
 'osAllowed(card,fs)',
 'osFilterRanked',
 'installWindowsPrivescCards',
 "os:['windows']",
 "prereq:{all:['foothold.windows']",
 'windows-identity-privilege-review',
 'windows-service-permission-review',
 'windows-unquoted-service-path-review',
 'windows-scheduled-task-chain-review',
 'windows-alwaysinstall-elevated-review',
 'windows-credential-trail-review',
 'windows-token-privilege-review'
]) has('assets/app-v2-views.js',expected);

// Collapsed cards in Path/Lanes must visibly expose evidence entry, not hide it behind tribal knowledge.
for(const expected of [
 'assets/card-evidence-current.js',
 'runCardEvidenceUI',
 'OBOL_CARD_EVIDENCE_UI'
]) has('assets/runtime-current.js',expected);
for(const expected of [
 'card-preview-actions',
 'data-card-evidence-current',
 'data-card-evidence-open',
 'data-card-evidence-intake',
 'Open card',
 'Add evidence',
 'obol-card-evidence-source',
 "location.hash='#/intake'",
 'MutationObserver',
 'textarea.evidence'
]) has('assets/card-evidence-current.js',expected);
for(const forbidden of ['Why this route exists','Tool action stack','Raw legacy commands','Current builders stay up front','startup card index']) lacks('assets/card-evidence-current.js',forbidden);

for(const expected of [
 'v9.55-windows-privesc-full-pass',
 'complete sequential packets',
 'complete_cleaned_text',
 "truncationPolicy:'none'",
 'truncatedNoteCount:0',
 'windowMarkerCount:0',
 'windows-service-control-model',
 'windows-token-privilege-model'
]) has('data/product-hardening/windows-privesc-remining-v9.55.js',expected);

// New AD/pivoting source-mined cards must be first-class cards loaded by the runtime.
has('assets/runtime-current.js','assets/ad-pivoting-current.js');
for(const expected of [
 'v9.55-ad-pivoting-remine',
 'complete sequential packets',
 'truncationPolicy',
 'reviewTextPolicy',
 'OBOL_AD_PIVOTING_SOURCE_MINED_CARDS',
 'ad-sharphound-collection-review',
 'ad-bloodhound-edge-proof-review',
 'ad-domain-share-secret-triage',
 'ad-kerberoast-proof-boundary',
 'pivot-reachability-map-review',
 'pivot-socks-proof-chain',
 'pivot-traffic-confirmation',
 'winrm-lateral-validation',
 'SharpHound/BloodHound collection is a graph snapshot',
 'A BloodHound path is a hypothesis queue',
 'Kerberoasting has four proof states',
 'tunnel-up, scan-through, and authenticated-service-use as separate Evidence'
]) has('assets/ad-pivoting-current.js',expected);
for(const forbidden of ['Why this route exists','Tool action stack','Raw legacy commands','Current builders stay up front','startup card index']) lacks('assets/ad-pivoting-current.js',forbidden);

for(const expected of [
 'v9.55-ad-pivoting-remine',
 'complete_cleaned_text',
 'manifestTruncatedNoteCount:0',
 'manifestWindowMarkerCount:0',
 'offsec-pen-200-e372e6ab2fa0515f',
 'offsec-pen-200-9b4c21141656f090',
 'htb-penetration-tester-3562488b01c1e772',
 'htb-penetration-tester-5810b0b19e3167fd',
 'OBOL_AD_PIVOTING_REMINING_V955'
]) has('data/product-hardening/ad-pivoting-remining-v9.55.js',expected);

for(const expected of [
 'Evidence flow rule',
 'OS routing rule',
 'card → paste command output → `Analyze pasted evidence`',
 'card:<card-id>:intake:<mode>',
 'Card previews in Path and Lanes must not hide evidence entry',
 'Open card',
 'Add evidence',
 'must not appear merely because a generic `privesc.leads` fact exists on the wrong operating system'
]) has('docs/CARD-UI-STANDARD.md',expected);
lacks('docs/CARD-UI-STANDARD.md','source-mined cards can use a fake fallback');

for(const expected of [
 'OffSec PEN-200 packet completeness check',
 'Windows privilege-escalation source-mining pass',
 'windows-token-privilege-review'
]) has('docs/V9.55-CARD-EVIDENCE-OS-WINDOWS.md',expected);

for(const expected of [
 '# Obol v9.55',
 'AD and pivoting source re-mining',
 'Card preview evidence actions',
 'Add evidence',
 'ad-sharphound-collection-review',
 'ad-bloodhound-edge-proof-review',
 'ad-domain-share-secret-triage',
 'ad-kerberoast-proof-boundary',
 'pivot-reachability-map-review',
 'pivot-socks-proof-chain',
 'pivot-traffic-confirmation',
 'winrm-lateral-validation',
 'complete_cleaned_text',
 'zero truncated notes'
]) has('docs/v9.55.md',expected);

console.log('v9.55 evidence flow, preview evidence actions, OS routing, Windows privesc, AD/pivoting re-mining, and release identity regression passed.');
