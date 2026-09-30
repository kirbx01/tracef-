const stage=document.getElementById('stage');
const hb=document.getElementById('hb');
const ecar=document.getElementById('ecar');
let FS=24;

function balanced(str){
  let depth=0;
  for(const ch of str){
    if(ch==='[')depth++;
    else if(ch===']'&&--depth<0)return false;
  }
  return depth===0;
}

function applyProgram(raw){
  const str=raw.replace(/[^><+\-.,[\]]/g,'').slice(0,80);
  prog.value=str;
  if(balanced(str)){
    prog.classList.remove('bad');
    LEVELS[level].program=str;
    loadInstinct();
    draw();
  }else prog.classList.add('bad');
  drawCaret();
}

prog.addEventListener('input', ()=>applyProgram(prog.value));
prog.addEventListener('keyup', drawCaret);
prog.addEventListener('focus', drawCaret);
prog.addEventListener('blur', drawCaret);
prog.addEventListener('keydown', event=>{
  if(event.key==='Enter'){event.preventDefault(); prog.blur(); canvas.focus();}
});

function drawCaret(){
  if(document.activeElement!==prog||prog.readOnly){
    ed.classList.remove('on');
    return;
  }
  ed.classList.add('on');
  ctx.font=FS+'px ModernDOS, monospace';
  ecar.style.left=ctx.measureText(prog.value).width+'px';
}

const help=document.getElementById('help'), hclose=document.getElementById('hclose');
let helpOn=false;

function setHelp(on){
  helpOn=on;
  help.classList.toggle('on', on);
  hb.textContent=on?'CLOSE':'HELP';
  draw();
}
const overlayOpen=()=>helpOn;

hb.addEventListener('click', event=>{event.stopPropagation(); setHelp(!helpOn);});
hclose.addEventListener('click', ()=>setHelp(false));

let lastTick=-1;
function readyTick(){
  if(state!=='ready')return;
  if(readyFrames>=150)lastTick=-1;
  readyFrames--;
  const k=Math.floor((90-readyFrames)/30);
  if(k>=0&&k<3&&k!==lastTick)beep();
  lastTick=k;
  if(readyFrames<=0){state='place'; draw();}
  else drawReady();
}

setInterval(readyTick, 60);

function drawReady(){
  const n=readyFrames;
  let label, size;
  if(n>90){label='ARE YOU READY'; size=30;}
  else{const k=Math.floor((90-n)/30); label=String(3-k); size=56+((90-n)%30)*2.4;}
  ctx.fillStyle='rgba(255,255,255,0.9)';
  ctx.fillRect(0,0,VW,VH);
  ctx.font=Math.round(size)+'px ModernDOS, monospace';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='#000';
  ctx.fillText(label, VW/2, VH/2);
  ctx.textAlign='left';
  ctx.textBaseline='alphabetic';
}

function overlay(){
  drawCaret();
}

function applyScale(s){
  FS=Math.max(10, Math.round(24*s));
  document.documentElement.style.setProperty('--fs', FS+'px');
  const sw=VW*s, sh=VH*s;
  document.documentElement.style.setProperty('--sw', sw+'px');
  document.documentElement.style.setProperty('--sh', sh+'px');
  const dpr=Math.min(3, window.devicePixelRatio||1);
  const cw=Math.max(1, Math.round(sw*dpr)), ch=Math.max(1, Math.round(sh*dpr));
  if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw; canvas.height=ch;}
  canvas.style.width=sw+'px';
  canvas.style.height=sh+'px';
  PX=cw/VW;
  ctx.setTransform(PX, 0, 0, PX, 0, 0);
}
function fit(){
  document.documentElement.style.setProperty('--fs','24px');
  document.documentElement.style.setProperty('--sw',VW+'px');
  document.documentElement.style.setProperty('--sh',VH+'px');
  canvas.style.width=VW+'px';
  canvas.style.height=VH+'px';
  const natH=stage.offsetHeight||661;
  const s=Math.min(1,(innerWidth-4)/VW,(innerHeight-4)/natH);
  applyScale(s);
  draw();
}
addEventListener('resize', fit);
fit();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
uiReady=true;
canvas.focus();

