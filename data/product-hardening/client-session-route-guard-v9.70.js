'use strict';
(function(root){
const CARD_ID='web-client-session-proof-chain';
const WAVE='v9.70-client-session-route-guard';
function onRoute(){return root.location&&String(root.location.hash||'').replace(/^#\/?/,'').split(/[?#]/)[0]==='card/'+CARD_ID;}
function viewText(){try{const view=document.querySelector('#view');return view&&view.innerText||'';}catch(_){return '';}}
function repair(){
 let installed=false,repaired=false;
 try{const packet=root.OBOL_CLIENT_SESSION_REMINING_PACKET_V970;if(packet&&typeof packet.install==='function'){packet.install();installed=true;}}catch(_){ }
 if(!onRoute())return {installed,repaired:false,waiting:false};
 try{if(typeof root.viewCard==='function'){root.viewCard(CARD_ID);repaired=true;}}catch(_){ }
 if(!repaired){try{if(typeof root.route==='function'){root.route();repaired=true;}}catch(_){ }}
 const text=viewText();
 return {installed,repaired,waiting:!/Web Client Session Proof Chain|Client-side findings need a session-impact proof chain/i.test(text)};
}
function loop(){let tries=0;const tick=function(){const result=repair();root.OBOL_CLIENT_SESSION_ROUTE_GUARD_V970=Object.freeze({wave:WAVE,cardId:CARD_ID,installed:!!result.installed,repaired:!!result.repaired,waiting:!!result.waiting,tries});tries+=1;if(tries<160&&result.waiting&&typeof root.setTimeout==='function')root.setTimeout(tick,100);};tick();}
loop();
if(typeof root.addEventListener==='function'){root.addEventListener('hashchange',loop);root.addEventListener('DOMContentLoaded',loop);root.addEventListener('focus',loop);}
if(typeof module!=='undefined'&&module.exports)module.exports={repair};
})(typeof window!=='undefined'?window:globalThis);
