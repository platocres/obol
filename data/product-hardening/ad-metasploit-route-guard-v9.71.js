'use strict';
(function(root){
const WAVE='v9.71-ad-msf-route-guard';
const ROUTES=Object.freeze(['ad-enumeration-bloodhound-collection','metasploit-resource-pivot-workflow','web-upload-inclusion-proof-chain']);
const DEMOTED=Object.freeze({'web-client-session-proof-chain':'web-authz-boundaries'});
const MARKERS=Object.freeze({
 'ad-enumeration-bloodhound-collection':/AD Enumeration Collection Spine|SharpHound|BloodHound/i,
 'metasploit-resource-pivot-workflow':/Metasploit Resource Pivot Spine|msfconsole|Meterpreter/i,
 'web-upload-inclusion-proof-chain':/Upload|Inclusion|Proof Chain/i
});
function routeId(){try{const m=String(root.location&&root.location.hash||'').match(/^#\/?card\/([^/?#]+)/);return m?decodeURIComponent(m[1]):'';}catch(_){return '';}}
function cardHash(id){return '#/card/'+encodeURIComponent(id);}
function lanes(){return Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:Array.isArray(root.LANES)?root.LANES:[];}
function liveCard(id){if(!id)return null;if(typeof root.liveCardById==='function'){try{const c=root.liveCardById(id);if(c)return c;}catch(_){}}if(root.CARDS&&root.CARDS[id])return root.CARDS[id];for(const lane of lanes())for(const card of lane.cards||[])if(card&&card.id===id)return card;return null;}
function ensureLane(card){const laneId=(card&&card.lane)||'product-hardening';let lane=lanes().find(l=>l&&(l.id===laneId||l.lane===laneId));if(!lane&&typeof root.laneById==='function'){try{lane=root.laneById(laneId,laneId,'Product Hardening');}catch(_){}}
 if(!lane){lane={id:laneId,lane:laneId,title:laneId,group:'Product Hardening',cards:[]};if(Array.isArray(root.OBOL_LANES))root.OBOL_LANES.push(lane);else if(Array.isArray(root.LANES))root.LANES.push(lane);else root.OBOL_LANES=[lane];}if(!Array.isArray(lane.cards))lane.cards=[];return lane;}
function fallbackCard(id){const shared={id,lane:id.indexOf('metasploit')>=0?'post-exploitation':id.indexOf('ad-')===0?'ad-enumeration':'web-file-handling',prereq:{anyFacts:['service.http','domain.known','shell.session_observed']},produces:['evidence.reviewed'],expected:['command or GUI/tool action completed','evidence pasted back','next path selected'],commands:[],failureModes:['If the action is not relevant, return to the preceding enumeration card.','If the tool fails, paste the exact blocker before moving on.','If output is inconclusive, keep the card attempted rather than claiming success.'],nextSteps:['Paste evidence back into this card.','Move only after a concrete fact is produced.'],sourceMinedRouteGuardV971:{wave:WAVE}};
 if(id==='ad-enumeration-bloodhound-collection')return Object.assign(shared,{title:'AD Enumeration Collection Spine',hypothesis:'Collect repeatable AD evidence with commands before interpreting graph paths, shares, SPNs, sessions, or ACLs.',commands:[{tool:'PowerShell',run:'Import-Module .\\SharpHound.ps1; Invoke-BloodHound -CollectionMethod All -Domain <domain> -OutputDirectory <output-dir> -OutputPrefix <prefix>',when:'Collect a graphable AD snapshot from the current user context.',evidence:'SharpHound completion output and zip path.'}]});
 if(id==='metasploit-resource-pivot-workflow')return Object.assign(shared,{title:'Metasploit Resource Pivot Spine',hypothesis:'Keep listener setup, session context, routes, scans, and cleanup reviewable.',commands:[{tool:'msfconsole',run:'msfconsole -q -x "sessions -l; route add <subnet> <netmask> <session_id>; route print"',when:'Add a pivot route only after confirming the session ID and target-side interface.',evidence:'Session list plus route table.'}]});
 return Object.assign(shared,{title:'Upload and Inclusion Proof Chain',hypothesis:'Run upload and inclusion checks before claiming storage, disclosure, interpretation, or execution.',commands:[{tool:'curl',run:'curl -i -sS -k -X POST <upload-url> -F "file=@<local-test-file>;type=<content-type>"',when:'Submit one controlled upload and preserve the server response.',evidence:'Status, headers, stored filename/path, and validation message.'}]});}
function publish(card){if(!card)return false;const lane=ensureLane(card);if(typeof root.addCardAfter==='function'){try{root.addCardAfter(lane,'',card);}catch(_){}}
 if(!lane.cards.some(c=>c&&c.id===card.id))lane.cards.push(card);if(root.CARDS&&typeof root.CARDS==='object')try{root.CARDS[card.id]=card;}catch(_){}return !!liveCard(card.id);}
function viewText(){try{const v=document.querySelector('#view');return v&&v.innerText||'';}catch(_){return '';}}
function runInstall(){try{const p=root.OBOL_AD_MSF_REMINING_PACKET_V971||root.OBOL_AD_MSF_REMINING_V971;if(p&&typeof p.install==='function')p.install();}catch(_){};try{return !!(root.OBOL_AD_MSF_REMINING_V971&&root.OBOL_AD_MSF_REMINING_V971.wave);}catch(_){return false;}}
function repaint(id){let repaired=false;try{if(typeof root.viewCard==='function'){root.viewCard(id);repaired=true;}}catch(_){};try{if(!repaired&&typeof root.route==='function'){root.route();repaired=true;}}catch(_){};
 if(!repaired&&root.location&&typeof root.setTimeout==='function'){
  const key=id+':'+String(root.location.hash||'');
  if(root.__OBOL_V971_ROUTE_BOUNCE__!==key){
   root.__OBOL_V971_ROUTE_BOUNCE__=key;
   root.setTimeout(function(){try{root.location.hash='#/path';root.setTimeout(function(){try{root.location.hash=cardHash(id);}catch(_){}},0);}catch(_){}},0);
   repaired=true;
  }
 }
 return repaired;
}
function repair(){const id=routeId();const installed=runInstall();let repaired=false;if(DEMOTED[id]){try{root.location.hash=cardHash(DEMOTED[id]);repaired=true;}catch(_){}}else if(ROUTES.includes(id)){publish(liveCard(id)||fallbackCard(id));repaired=repaint(id);}
 const text=viewText();const marker=MARKERS[id];const waiting=ROUTES.includes(id)&&!(marker&&marker.test(text));root.OBOL_AD_MSF_ROUTE_GUARD_V971=Object.freeze({wave:WAVE,installed,repaired,waiting,route:id,registered:ROUTES.map(r=>!!liveCard(r))});return {installed,repaired,waiting};}
function patchViewCard(){if(typeof root.viewCard!=='function'||root.viewCard.__obolV971RouteGuard)return;const original=root.viewCard;root.viewCard=function guardedV971ViewCard(id){if(DEMOTED[String(id)])id=DEMOTED[String(id)];if(ROUTES.includes(String(id))){runInstall();publish(liveCard(String(id))||fallbackCard(String(id)));}return original.call(this,id);};root.viewCard.__obolV971RouteGuard=true;}
function loop(){let tries=0;const tick=function(){patchViewCard();const r=repair();tries+=1;if(tries<180&&r.waiting&&typeof root.setTimeout==='function')root.setTimeout(tick,50);};tick();}
loop();if(typeof root.addEventListener==='function'){root.addEventListener('hashchange',loop);root.addEventListener('DOMContentLoaded',loop);root.addEventListener('focus',loop);}if(typeof module!=='undefined'&&module.exports)module.exports={repair,publish};
})(typeof window!=='undefined'?window:globalThis);
