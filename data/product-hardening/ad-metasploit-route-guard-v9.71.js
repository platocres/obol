'use strict';
(function(root){
const WAVE='v9.71-ad-msf-route-guard';
const ROUTES=Object.freeze(['ad-enumeration-bloodhound-collection','metasploit-resource-pivot-workflow','web-upload-inclusion-proof-chain']);
const DEMOTED=Object.freeze({'web-client-session-proof-chain':'web-authz-boundaries'});
function routeId(){try{return String(root.location&&root.location.hash||'').replace(/^#\/?/,'').split(/[?#]/)[0].replace(/^card\//,'');}catch(_){return '';}}
function viewText(){try{const v=document.querySelector('#view');return v&&v.innerText||'';}catch(_){return '';}}
function runInstall(){try{const p=root.OBOL_AD_MSF_REMINING_PACKET_V971||root.OBOL_AD_MSF_REMINING_V971;if(p&&typeof p.install==='function')p.install();}catch(_){};try{if(root.OBOL_AD_MSF_REMINING_V971&&root.OBOL_AD_MSF_REMINING_V971.wave)return true;}catch(_){};return false;}
function repair(){const id=routeId();const installed=runInstall();let repaired=false;if(DEMOTED[id]){try{root.location.hash='#/card/'+DEMOTED[id];repaired=true;}catch(_){}}else if(ROUTES.includes(id)){try{if(typeof root.viewCard==='function'){root.viewCard(id);repaired=true;}}catch(_){};try{if(!repaired&&typeof root.route==='function'){root.route();repaired=true;}}catch(_){}}
 const text=viewText();const waiting=ROUTES.includes(id)&&!/AD Enumeration Collection Spine|Metasploit Resource Pivot Spine|Upload|Inclusion/i.test(text);root.OBOL_AD_MSF_ROUTE_GUARD_V971=Object.freeze({wave:WAVE,installed,repaired,waiting,route:id});return {installed,repaired,waiting};}
function loop(){let tries=0;const tick=function(){const r=repair();tries+=1;if(tries<120&&r.waiting&&typeof root.setTimeout==='function')root.setTimeout(tick,100);};tick();}
loop();if(typeof root.addEventListener==='function'){root.addEventListener('hashchange',loop);root.addEventListener('DOMContentLoaded',loop);root.addEventListener('focus',loop);}if(typeof module!=='undefined'&&module.exports)module.exports={repair};
})(typeof window!=='undefined'?window:globalThis);
