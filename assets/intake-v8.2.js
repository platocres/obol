// Obol v8.2 Intake overlay — conservative Evidence for offline cracking workflows.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V79,M=root.OBOL_METHODOLOGY_V82;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage82(command){const c=String(command||'');if(/\bhashcat\b[^\n]*\s-m\s+(3000|1000|5500|5600|13100|19600|18200|2100|31300|19850)\b/i.test(c))return'offline-cracking';if(/\bjohn\b[^\n]*--format=(lm|nt|netntlm|netntlmv2|krb5tgs)\b/i.test(c))return'offline-cracking';if(/\bjohn\b[^\n]*--show\b/i.test(c))return'offline-cracking-review';return'';}
function inferredOwner(command){const c=String(command||'');if(/\bjohn\b/i.test(c))return'john-modes';if(/\bhashcat\b[^\n]*\s-m\s+19850\b/i.test(c))return'pxe-naa61';if(/\bhashcat\b/i.test(c))return'hashcat-modes';return'';}
function proof82(cardId,command,output){const c=String(command||''),t=String(output||''),facts=[];let result='tried',assessment='attempted',confidence='medium',why='Recognized v8.2 offline-cracking Evidence context; explicit recovered plaintext was not present.';
 const hashcatSuccess=/(?:Status\.{0,8}:?\s*Cracked|Recovered\.{0,8}:?\s*[1-9]\d*\/\d+)/i.test(t);
 const johnSuccess=/(?:\b[1-9]\d*\s+password hashes? cracked\b|\b[1-9]\d*g\s+0:00:|\([^\r\n]+\)\s*$)/im.test(t)&&!/0 password hashes? cracked/i.test(t);
 const exhausted=/(?:Status\.{0,8}:?\s*Exhausted|0 password hashes? cracked|No password hashes left to crack)/i.test(t);
 if(hashcatSuccess||johnSuccess){result='success';assessment='supported';confidence='high';facts.push('credential.candidate');why='The cracking output explicitly reports recovered plaintext or a positive cracked-hash result. This supports offline credential material only; service validation, authenticated access, execution, and privilege remain separate.';}
 else if(exhausted){result='failed';assessment='refuted';confidence='high';why='The cracking output explicitly exhausted or recovered zero candidates. This refutes only the tested wordlist/mask candidate space; it does not prove the underlying credential is universally strong or invalid.';}
 return{result,assessment,confidence,facts,why,stage:stage82(c)};
}
function repair82(a){if(!a)return a;const inferred=inferredOwner(a.command||''),id=(M.cardIds||[]).includes(a.cardId)?a.cardId:inferred;if(!(M.cardIds||[]).includes(id))return a;const p=proof82(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;a.result=p.result;a.assessment=p.assessment;a.confidence=p.confidence;a.reason=p.why;a.outcomeFacts=[...p.facts];a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair82(a));r.crackingFidelityProfiles82=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V82={version:'8.2.0',stage82,inferredOwner82:inferredOwner,proof82,repairActivity82:repair82};
})(typeof window!=='undefined'?window:globalThis);
