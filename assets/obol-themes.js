'use strict';
/* ============================================================
   Obol Themes — skin engine (owner, loaded last from index.html).
   - Re-tints obol via [data-skin] token overrides (obol-themes.css)
   - Injects a header skin picker + FX opt-out toggle
   - Owns the matrix-rain canvas, gated on FX AND prefers-reduced-motion
   Everything is wrapped so a failure here can never block obol boot.
   ============================================================ */
(function(root){
var doc=root.document;
if(!doc)return;

var SKINS=[
 {id:'obol',   label:'Obol Classic',  pv:['#161b22','#58d68d','#e8b54a']},
 {id:'matrix', label:'Ghostwire',     pv:['#000502','#00ff66','#ff2d2d']},
 {id:'crt',    label:'Amber Phosphor',pv:['#160f02','#ffb000','#ffe6b0']},
 {id:'neon',   label:'Neon Noir',     pv:['#160c2a','#ff2fb9','#21e6ff']},
 {id:'recon',  label:'Recon Daylight',pv:['#ffffff','#0f7a52','#b3630b']}
];
var LS_SKIN='obol-skin', LS_FX='obol-fx';
var reduceMq=root.matchMedia?root.matchMedia('(prefers-reduced-motion:reduce)'):{matches:false,addEventListener:function(){}};
var el=doc.documentElement;
var state={skin:'obol', fx:true};

function lsGet(k){try{return root.localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{root.localStorage.setItem(k,v);}catch(e){}}
function skinById(id){for(var i=0;i<SKINS.length;i++)if(SKINS[i].id===id)return SKINS[i];return SKINS[0];}
function idxOf(id){for(var i=0;i<SKINS.length;i++)if(SKINS[i].id===id)return i;return 0;}
function fxActive(){return state.fx && !reduceMq.matches;}

/* ---- apply state to <html> as early as possible (before first paint) ---- */
(function bootstrap(){
 var savedSkin=lsGet(LS_SKIN); if(savedSkin&&idxOf(savedSkin)>=0)state.skin=savedSkin;
 if(lsGet(LS_FX)==='0')state.fx=false;
 el.setAttribute('data-skin',state.skin);
 el.classList.toggle('obol-fx',fxActive());
})();

/* ---- decorative layers ---- */
var rain=(function(){
 var cv=null,cx=null,on=false,raf=null,cols=0,drops=[],
     glyphs='アカサタナハマヤラワｱｲｳｴｵｶｷｸ0123456789<>/#$%'.split('');
 function ensure(){
  if(cv)return;
  cv=doc.getElementById('obol-rain');
  if(!cv)return;
  cx=cv.getContext('2d');
 }
 function size(){
  if(!cv)return;
  cv.width=root.innerWidth; cv.height=root.innerHeight;
  cols=Math.max(1,Math.floor(cv.width/16)); drops=[];
  for(var i=0;i<cols;i++)drops[i]=Math.random()*cv.height/16;
 }
 function frame(){
  if(!on||!cx)return;
  cx.fillStyle='rgba(0,5,2,0.09)'; cx.fillRect(0,0,cv.width,cv.height);
  cx.font='15px monospace';
  for(var i=0;i<cols;i++){
   var g=glyphs[(Math.random()*glyphs.length)|0], x=i*16, y=drops[i]*16;
   cx.fillStyle=Math.random()>0.975?'#ffffff':'#00ff66';
   cx.fillText(g,x,y);
   if(y>cv.height&&Math.random()>0.975)drops[i]=0;
   drops[i]++;
  }
  raf=root.requestAnimationFrame(frame);
 }
 return {
  toggle:function(want){
   ensure();
   if(want&&!on){ if(!cv)return; on=true; size(); frame(); }
   else if(!want&&on){ on=false; if(raf)root.cancelAnimationFrame(raf); raf=null; if(cx)cx.clearRect(0,0,cv.width,cv.height); }
  },
  resize:function(){ if(on)size(); },
  running:function(){ return on; }
 };
})();

function syncRain(){ rain.toggle(state.skin==='matrix' && fxActive()); }

function fireSweep(){
 if(!fxActive())return;
 var s=doc.getElementById('obol-sweep'); if(!s)return;
 s.classList.remove('go'); void s.offsetWidth; s.classList.add('go');
}

/* ---- picker UI ---- */
var menuOpen=false, btnSwatch=null, menuEl=null, fxBtn=null;
function swatchStyle(pv){return 'background:linear-gradient(90deg,'+pv[0]+' 0 40%,'+pv[1]+' 40% 70%,'+pv[2]+' 70% 100%)';}

function buildPicker(){
 var header=doc.querySelector('header'); if(!header||doc.getElementById('obol-skin'))return;
 var cur=skinById(state.skin);
 var wrap=doc.createElement('div'); wrap.id='obol-skin';

 var btn=doc.createElement('button');
 btn.id='obol-skin-btn'; btn.type='button';
 btn.setAttribute('aria-haspopup','true'); btn.setAttribute('aria-expanded','false');
 btn.setAttribute('title','Change skin');
 btn.innerHTML='<span class="sw"></span><span class="lbl">Skin</span><span class="caret">▼</span>';
 btnSwatch=btn.querySelector('.sw');
 btn.style.setProperty('--pv1',cur.pv[0]); btn.style.setProperty('--pv2',cur.pv[1]); btn.style.setProperty('--pv3',cur.pv[2]);

 var menu=doc.createElement('div'); menu.id='obol-skin-menu'; menu.setAttribute('role','menu'); menu.hidden=true;
 SKINS.forEach(function(s){
  var o=doc.createElement('button');
  o.type='button'; o.className='obol-skin-opt'; o.setAttribute('role','menuitemradio');
  o.dataset.skin=s.id; o.setAttribute('aria-checked', s.id===state.skin?'true':'false');
  o.innerHTML='<span class="sw" style="'+swatchStyle(s.pv)+'"></span>'+s.label;
  o.addEventListener('click',function(){ setSkin(s.id); closeMenu(); btn.focus(); });
  menu.appendChild(o);
 });
 var sep=doc.createElement('div'); sep.className='obol-skin-sep'; menu.appendChild(sep);
 var fxRow=doc.createElement('div'); fxRow.className='obol-fx-row';
 fxRow.innerHTML='<span>Motion FX</span>';
 fxBtn=doc.createElement('button');
 fxBtn.id='obol-fx-toggle'; fxBtn.type='button';
 fxBtn.setAttribute('aria-pressed', state.fx?'true':'false');
 fxBtn.innerHTML='<span class="led"></span><span class="fxlbl">'+(state.fx?'On':'Off')+'</span>';
 fxBtn.addEventListener('click',function(){ setFx(!state.fx); });
 fxRow.appendChild(fxBtn); menu.appendChild(fxRow);

 menuEl=menu;
 btn.addEventListener('click',function(e){ e.stopPropagation(); menuOpen?closeMenu():openMenu(); });
 wrap.appendChild(btn); wrap.appendChild(menu); header.appendChild(wrap);

 doc.addEventListener('click',function(e){ if(menuOpen&&!wrap.contains(e.target))closeMenu(); });
}
function openMenu(){ if(!menuEl)return; menuEl.hidden=false; menuOpen=true;
 var b=doc.getElementById('obol-skin-btn'); if(b)b.setAttribute('aria-expanded','true'); }
function closeMenu(){ if(!menuEl)return; menuEl.hidden=true; menuOpen=false;
 var b=doc.getElementById('obol-skin-btn'); if(b)b.setAttribute('aria-expanded','false'); }

function refreshUI(){
 var cur=skinById(state.skin);
 var b=doc.getElementById('obol-skin-btn');
 if(b){ b.style.setProperty('--pv1',cur.pv[0]); b.style.setProperty('--pv2',cur.pv[1]); b.style.setProperty('--pv3',cur.pv[2]); }
 if(menuEl)menuEl.querySelectorAll('.obol-skin-opt').forEach(function(o){
  o.setAttribute('aria-checked', o.dataset.skin===state.skin?'true':'false');
 });
 if(fxBtn){ fxBtn.setAttribute('aria-pressed', state.fx?'true':'false');
  var l=fxBtn.querySelector('.fxlbl'); if(l)l.textContent=state.fx?'On':'Off'; }
}

/* ---- state setters ---- */
function setSkin(id){
 if(idxOf(id)<0)id='obol';
 state.skin=id; el.setAttribute('data-skin',id); lsSet(LS_SKIN,id);
 el.classList.toggle('obol-fx',fxActive());
 syncRain(); fireSweep(); refreshUI();
}
function setFx(v){
 state.fx=!!v; lsSet(LS_FX, state.fx?'1':'0');
 el.classList.toggle('obol-fx',fxActive());
 syncRain(); refreshUI();
}
function cycle(delta){ setSkin(SKINS[(idxOf(state.skin)+delta+SKINS.length)%SKINS.length].id); }

/* ---- keyboard: 1-5 pick, [ ] cycle, 0 toggle FX ---- */
doc.addEventListener('keydown',function(e){
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 var t=e.target, tag=(t&&t.tagName||'').toLowerCase();
 if(tag==='input'||tag==='textarea'||tag==='select'||(t&&t.isContentEditable))return;
 if(e.key>='1'&&e.key<='5')setSkin(SKINS[+e.key-1].id);
 else if(e.key===']')cycle(1);
 else if(e.key==='[')cycle(-1);
 else if(e.key==='0')setFx(!state.fx);
 else if(e.key==='Escape'&&menuOpen)closeMenu();
});

/* ---- react to system reduced-motion changes ---- */
if(reduceMq.addEventListener)reduceMq.addEventListener('change',function(){
 el.classList.toggle('obol-fx',fxActive()); syncRain();
});
root.addEventListener('resize',rain.resize);
doc.addEventListener('visibilitychange',function(){
 if(doc.hidden)rain.toggle(false); else syncRain();
});

/* ---- decorative layer elements (created once, kept behind content) ---- */
function injectLayers(){
 if(!doc.body||doc.getElementById('obol-rain'))return;
 var ids=['obol-gridwash','obol-scanlines','obol-rain','obol-sweep'];
 var frag=doc.createDocumentFragment();
 ids.forEach(function(id){
  var node=doc.createElement(id==='obol-rain'?'canvas':'div');
  node.id=id; node.setAttribute('aria-hidden','true');
  frag.appendChild(node);
 });
 doc.body.insertBefore(frag,doc.body.firstChild);
}

/* ---- install ---- */
function install(){ try{ injectLayers(); buildPicker(); refreshUI(); syncRain(); }catch(e){} }
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',install,{once:true});
else install();

/* small API for later builds / tests */
root.OBOL_THEMES=Object.freeze({
 skins:SKINS.map(function(s){return s.id;}),
 get:function(){return {skin:state.skin,fx:state.fx};},
 set:setSkin, setFx:setFx
});
})(window);
