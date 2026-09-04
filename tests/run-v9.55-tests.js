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

has('assets/app-v2-views.js','installCardScopedEvidenceFlow');
has('assets/app-v2-views.js','storeCardEvidenceIntent');
has('assets/app-v2-views.js','obol-card-evidence-source');
has('assets/app-v2-views.js','Apply evidence from ');
has('assets/app-v2-views.js','cardScopedSource(src,r.mode)');
has('assets/app-v2-views.js',"'card:'+src.cardId+':intake:'+mode");
has('assets/app-v2-views.js','osAllowed(card,fs)');
has('assets/app-v2-views.js','osFilterRanked');
has('assets/app-v2-views.js','installWindowsPrivescCards');
has('assets/app-v2-views.js',"os:['windows']");
has('assets/app-v2-views.js',"prereq:{all:['foothold.windows']");
has('assets/app-v2-views.js','windows-identity-privilege-review');
has('assets/app-v2-views.js','windows-service-permission-review');
has('assets/app-v2-views.js','windows-unquoted-service-path-review');
has('assets/app-v2-views.js','windows-scheduled-task-chain-review');
has('assets/app-v2-views.js','windows-alwaysinstall-elevated-review');
has('assets/app-v2-views.js','windows-credential-trail-review');
has('assets/app-v2-views.js','windows-token-privilege-review');
has('assets/app-v2-views.js','generic `privesc.leads`');

has('data/product-hardening/windows-privesc-remining-v9.55.js','v9.55-windows-privesc-full-pass');
has('data/product-hardening/windows-privesc-remining-v9.55.js','complete sequential packets');
has('data/product-hardening/windows-privesc-remining-v9.55.js','complete_cleaned_text');
has('data/product-hardening/windows-privesc-remining-v9.55.js','truncationPolicy:\'none\'');
has('data/product-hardening/windows-privesc-remining-v9.55.js','truncatedNoteCount:0');
has('data/product-hardening/windows-privesc-remining-v9.55.js','windowMarkerCount:0');
has('data/product-hardening/windows-privesc-remining-v9.55.js','windows-service-control-model');
has('data/product-hardening/windows-privesc-remining-v9.55.js','windows-token-privilege-model');

has('assets/runtime-current.js','assets/ad-pivoting-current.js');
has('assets/ad-pivoting-current.js','v9.55-ad-pivoting-remine');
has('assets/ad-pivoting-current.js','complete sequential packets');
has('assets/ad-pivoting-current.js','truncationPolicy');
has('assets/ad-pivoting-current.js','ad-sharphound-collection-review');
has('assets/ad-pivoting-current.js','ad-bloodhound-edge-proof-review');
has('assets/ad-pivoting-current.js','ad-domain-share-secret-triage');
has('assets/ad-pivoting-current.js','ad-kerberoast-proof-boundary');
has('assets/ad-pivoting-current.js','pivot-reachability-map-review');
has('assets/ad-pivoting-current.js','pivot-socks-proof-chain');
has('assets/ad-pivoting-current.js','pivot-traffic-confirmation');
has('assets/ad-pivoting-current.js','winrm-lateral-validation');
has('assets/ad-pivoting-current.js','OBOL_AD_PIVOTING_SOURCE_MINED_CARDS');
has('assets/ad-pivoting-current.js','SharpHound/BloodHound collection is a graph snapshot');
has('assets/ad-pivoting-current.js','A BloodHound path is a hypothesis queue');
has('assets/ad-pivoting-current.js','Kerberoasting has four proof states');
has('assets/ad-pivoting-current.js','Tunnel-up, scan-through, and authenticated-service-use as separate Evidence');
lacks('assets/ad-pivoting-current.js','Why this route exists');
lacks('assets/ad-pivoting-current.js','Tool action stack');
lacks('assets/ad-pivoting-current.js','Raw legacy commands');
lacks('assets/ad-pivoting-current.js','Current builders stay up front');

has('data/product-hardening/ad-pivoting-remining-v9.55.js','v9.55-ad-pivoting-remine');
has('data/product-hardening/ad-pivoting-remining-v9.55.js','complete_cleaned_text');
has('data/product-hardening/ad-pivoting-remining-v9.55.js','manifestTruncatedNoteCount:0');
has('data/product-hardening/ad-pivoting-remining-v9.55.js','manifestWindowMarkerCount:0');
has('data/product-hardening/ad-pivoting-remining-v9.55.js','offsec-pen-200-e372e6ab2fa0515f');
has('data/product-hardening/ad-pivoting-remining-v9.55.js','offsec-pen-200-9b4c21141656f090');
has('data/product-hardening/ad-pivoting-remining-v9.55.js','htb-penetration-tester-3562488b01c1e772');
has('data/product-hardening/ad-pivoting-remining-v9.55.js','htb-penetration-tester-5810b0b19e3167fd');
has('data/product-hardening/ad-pivoting-remining-v9.55.js','OBOL_AD_PIVOTING_REMINING_V955');

has('docs/CARD-UI-STANDARD.md','Evidence flow rule');
has('docs/CARD-UI-STANDARD.md','OS routing rule');
has('docs/CARD-UI-STANDARD.md','card → paste command output → `Analyze pasted evidence`');
has('docs/CARD-UI-STANDARD.md','card:<card-id>:intake:<mode>');
has('docs/CARD-UI-STANDARD.md','must not appear merely because a generic `privesc.leads` fact exists on the wrong operating system');
has('docs/V9.55-CARD-EVIDENCE-OS-WINDOWS.md','OffSec PEN-200 packet completeness check');
has('docs/V9.55-CARD-EVIDENCE-OS-WINDOWS.md','Windows privilege-escalation source-mining pass');
has('docs/V9.55-CARD-EVIDENCE-OS-WINDOWS.md','windows-token-privilege-review');
has('docs/v9.55.md','# Obol v9.55');
has('docs/v9.55.md','AD and pivoting source re-mining');
has('docs/v9.55.md','ad-sharphound-collection-review');
has('docs/v9.55.md','pivot-socks-proof-chain');
has('docs/v9.55.md','complete_cleaned_text');
has('docs/v9.55.md','zero truncated notes');

lacks('docs/CARD-UI-STANDARD.md','source-mined cards can use a fake fallback');
console.log('v9.55 card evidence, OS routing, Windows privilege, and AD/pivoting re-mining regression passed.');
