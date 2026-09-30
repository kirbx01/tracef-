const stage=document.getElementById('stage');
const hb=document.getElementById('hb');
const ecar=document.getElementById('ecar');

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
  ctx.font='24px ModernDOS, monospace';
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
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.font=Math.round(size)+'px ModernDOS, monospace';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='#000';
  ctx.fillText(label, canvas.width/2, canvas.height/2);
  ctx.textAlign='left';
  ctx.textBaseline='alphabetic';
}

function overlay(){
  drawCaret();
}

let nat=0;
function fit(){
  if(!nat)nat=stage.offsetHeight||700;
  const s=Math.min(1,(innerWidth-4)/768,(innerHeight-4)/nat);
  stage.style.transform='scale('+s+')';
  stage.style.marginBottom=-(nat*(1-s))+'px';
}
addEventListener('resize', fit);
fit();
uiReady=true;
canvas.focus();

