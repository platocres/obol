'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function has(rel,needle){assert(read(rel).includes(needle),`${rel} must include ${needle}`);}
function lacks(rel,needle){assert(!read(rel).includes(needle),`${rel} must not include ${needle}`);}

has('assets/app-v2-views.js','installCardScopedEvidenceFlow');
has('assets/app-v2-views.js','storeCardEvidenceIntent');
has('assets/app-v2-views.js','obol-card-evidence-source');
has('assets/app-v2-views.js','Apply evidence from ');
has('assets/app-v2-views.js','cardScopedSource(src,r.mode)');
has('assets/app-v2-views.js','card:<card-id>:intake:<mode>');
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

has('docs/CARD-UI-STANDARD.md','Evidence flow rule');
has('docs/CARD-UI-STANDARD.md','OS routing rule');
has('docs/CARD-UI-STANDARD.md','card → paste command output → `Analyze pasted evidence`');
has('docs/CARD-UI-STANDARD.md','card:<card-id>:intake:<mode>');
has('docs/CARD-UI-STANDARD.md','must not appear merely because a generic `privesc.leads` fact exists on the wrong operating system');
has('docs/V9.55-CARD-EVIDENCE-OS-WINDOWS.md','OffSec PEN-200 packet completeness check');
has('docs/V9.55-CARD-EVIDENCE-OS-WINDOWS.md','Windows privilege-escalation source-mining pass');
has('docs/V9.55-CARD-EVIDENCE-OS-WINDOWS.md','windows-token-privilege-review');

lacks('docs/CARD-UI-STANDARD.md','source-mined cards can use a fake fallback');
console.log('v9.55 card evidence, OS routing, and Windows privilege pass regression passed.');
