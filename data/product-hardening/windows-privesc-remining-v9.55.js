'use strict';
(function(root){
const SOURCE_PACKETS=Object.freeze([
 'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-01.json',
 'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-02.json',
 'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-03.json',
 'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-04.json',
 'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-05.json',
 'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-06.json'
]);
const CARD_IDS=Object.freeze([
 'windows-identity-privilege-review',
 'windows-service-permission-review',
 'windows-unquoted-service-path-review',
 'windows-scheduled-task-chain-review',
 'windows-alwaysinstall-elevated-review',
 'windows-credential-trail-review',
 'windows-token-privilege-review'
]);
const FINDINGS=Object.freeze([
 Object.freeze({id:'windows-identity-privilege-model',title:'Start Windows local escalation from identity, groups, privileges, architecture, and host context.',cardId:'windows-identity-privilege-review'}),
 Object.freeze({id:'windows-service-control-model',title:'A service issue is only exploitable when the service identity, binary path, writable control point, restart path, and resulting privilege are proven separately.',cardId:'windows-service-permission-review'}),
 Object.freeze({id:'windows-unquoted-path-model',title:'Unquoted paths are leads until the exact service path, writeable directory boundary, executable name resolution, and restart trigger are proven.',cardId:'windows-unquoted-service-path-review'}),
 Object.freeze({id:'windows-scheduled-task-model',title:'Scheduled-task escalation requires a full chain: trigger, run-as principal, action path, writable action or dependency, and observed elevated effect.',cardId:'windows-scheduled-task-chain-review'}),
 Object.freeze({id:'windows-installer-policy-model',title:'AlwaysInstallElevated only matters when both policy hives are enabled and the installer execution context is verified.',cardId:'windows-alwaysinstall-elevated-review'}),
 Object.freeze({id:'windows-credential-trail-model',title:'Stored credentials, config secrets, and user-history clues are candidate material until scoped validation proves where they work.',cardId:'windows-credential-trail-review'}),
 Object.freeze({id:'windows-token-privilege-model',title:'Windows token privileges are capability leads; the exploitability depends on token state, service context, mitigation state, and a verified elevated action.',cardId:'windows-token-privilege-review'})
]);
root.OBOL_WINDOWS_PRIVESC_REMINING_V955=Object.freeze({
 schemaVersion:'1.0.0',
 reviewWave:'v9.55-windows-privesc-full-pass',
 source:'complete sequential packets',
 sourcePackets:SOURCE_PACKETS,
 sourceConfidence:Object.freeze({offsecPen200:Object.freeze({reviewTextPolicy:'complete_cleaned_text',truncationPolicy:'none',manifestNoteCount:204,manifestReviewTextChars:4776136,truncatedNoteCount:0,windowMarkerCount:0})}),
 cardIds:CARD_IDS,
 findings:FINDINGS,
 pathRule:'Windows-only cards must require Windows foothold evidence; Linux-only cards must require Linux foothold evidence; credential cards remain service/evidence gated.'
});
})(typeof window!=='undefined'?window:globalThis);
