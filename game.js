const MAX=200, SIGHT=6, TRAIN=3, VW=768, VH=576;
const DX=[0,1,0,-1], DY=[-1,0,1,0];

const PROGRAM=',>,>,[->+<]<<[>>>[-]<<[->>+<<]<[-]]>>>.';
const LEVELS=[
  {w:5,h:5,c:64,note:'TEACH IT TO MOVE.',program:'.>'},
  {w:5,h:5,c:64,program:''}, {w:7,h:7,c:48,program:''}, {w:10,h:8,c:40,program:''}, {w:16,h:12,c:32,program:''},
  {w:24,h:18,c:32,note:'NO MORE HAND-HOLDING.',program:PROGRAM}];

let level=0, unlocked=0, readyFrames=0, W, H, C, SCALE, OX, OY, PX=1, program=PROGRAM, jump={};

function loadInstinct(){
  program=LEVELS[level].program||PROGRAM;
  jump={};
  const open=[];
  for(let i=0;i<program.length;i++){
    if(program[i]==='[')open.push(i);
    if(program[i]===']'){const start=open.pop();jump[start]=i;jump[i]=start;}
  }
}

function brainfuck(inputs){
  const tape=[0,0,0,0,0];
  let pointer=0, input=0;
  for(let i=0, guard=0;i<program.length&&guard<9999;i++, guard++)switch(program[i]){
    case ',':tape[pointer]=((inputs[input++]%4)+4)%4;break;
    case '>':pointer=Math.min(4, pointer+1);break;
    case '<':pointer=Math.max(0, pointer-1);break;
    case '+':tape[pointer]++;break;
    case '-':tape[pointer]--;break;
    case '[':if(tape[pointer]===0)i=jump[i];break;
    case ']':if(tape[pointer]!==0)i=jump[i];break;
    case '.':return ((tape[pointer]%4)+4)%4;
  }
  return 0;
}

const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
const hud=document.getElementById('hud');
const msg=document.getElementById('msg');
const head=document.getElementById('ehead'), lvl=document.getElementById('lvl');
const prog=document.getElementById('eprog'), tag=document.getElementById('tag'), ed=document.getElementById('ed');

let cells, ax, ay, dir, food, steps, state, uiReady=false;

function isInside(x, y){return x>=0 && y>=0 && x<W && y<H;}

function snap(v){return Math.round(v*PX)/PX;}
function thick(v){return Math.max(v, 1/PX);}

function smells(heading){
  for(let distance=1;distance<=SIGHT;distance++){
    const x=ax+DX[heading]*distance, y=ay+DY[heading]*distance;
    if(!isInside(x, y))return 0;
    if(y*W+x===food)return 1;
  }
  return 0;
}

function reset(){
  const L=LEVELS[level];
  W=L.w; H=L.h; C=L.c; SCALE=C/16;
  OX=(VW-W*C)/2; OY=(VH-H*C)/2;
  cells=new Uint8Array(W*H);
  loadInstinct();
  cells.fill(0);
  ax=W>>1; ay=H>>1; dir=3;
  food=-1; steps=0; readyFrames=150;
  state='train';
  draw();
}

function step(){
  const here=ay*W+ax;
  const langtonTurn=cells[here]?3:1;
  cells[here]^=1;

  const nearby=smells(dir);
  let foodDirection=0;
  if(nearby){
    const foodX=food%W, foodY=food/W|0;
    const dx=foodX-ax, dy=foodY-ay;
    const targetDirection=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);
    foodDirection=(targetDirection-dir-langtonTurn+4)%4;
  }

  const brainTurn=brainfuck([nearby, foodDirection, Math.random()*4|0]);

  dir=(dir+langtonTurn+brainTurn)%4;

  const nextX=ax+DX[dir], nextY=ay+DY[dir];
  steps++;

  if(!isInside(nextX, nextY)){
    state='over';
  }else{
    ax=nextX;
    ay=nextY;
    if(ay*W+ax===food){state='win'; if(level<TRAIN)chime(); if(level+1>unlocked&&level<LEVELS.length-1)unlocked=level+1;}
    else if(steps>=MAX)state='over';
  }
  if(state==='over'){fail();}

  beep();
  draw();
}

function drawBoard(){
  ctx.fillStyle='#fff';
  ctx.fillRect(0,0,VW,VH);
  ctx.strokeStyle='#bbb';
  ctx.lineWidth=1/PX;
  ctx.beginPath();
  for(let x=0;x<=W;x++){const p=snap(OX+x*C); ctx.moveTo(p, snap(OY)); ctx.lineTo(p, snap(OY+H*C));}
  for(let y=0;y<=H;y++){const p=snap(OY+y*C); ctx.moveTo(snap(OX), p); ctx.lineTo(snap(OX+W*C), p);}
  ctx.stroke();
  ctx.fillStyle='#000';
  for(let i=0;i<cells.length;i++) if(cells[i])ctx.fillRect(OX+(i%W)*C, OY+(i/W|0)*C, C, C);
}

function drawFood(){
  if(food<0)return;
  const x=OX+(food%W)*C+4*SCALE, y=OY+(food/W|0)*C+4*SCALE, s=C-8*SCALE;
  ctx.fillStyle='#fff'; ctx.fillRect(x, y, s, s);
  ctx.strokeStyle='#000'; ctx.lineWidth=thick(2*SCALE); ctx.strokeRect(x, y, s, s);
}

function drawAnt(){
  ctx.save();
  ctx.translate(OX+ax*C+C/2, OY+ay*C+C/2);
  ctx.rotate((dir+1)*Math.PI/2); ctx.scale(SCALE, SCALE);
  ctx.beginPath();
  ctx.moveTo(6,0); ctx.lineTo(-4,4.5); ctx.lineTo(-4,-4.5); ctx.closePath();
  ctx.fillStyle='#000'; ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=thick(1.5); ctx.stroke();
  ctx.restore();
}

function drawStatus(){
  hud.textContent='THOUGHTS LEFT: '+String(Math.max(0, MAX-steps)).padStart(3, '0');
  lvl.textContent='INSTINCT '+(level+1)+'/'+LEVELS.length;
  head.textContent=LEVELS[level].note||'';
  msg.style.color='#000';
  prog.readOnly=state!=='train';
  if(document.activeElement!==prog)prog.value=program;
  const training=level<TRAIN;
  tag.textContent=training?'TRAINING':'LOCK IN';
  tag.style.color=training?'#8000c0':'#c00000';
  if(state==='train')msg.textContent=training?'WRITE THE BRAIN. SPACE TO RUN.':'SPACE TO START THE RUN.';
  else if(state==='ready'||state==='play')msg.textContent='';
  else if(state==='place')msg.textContent='CLICK A CELL TO PLACE THE FOOD';
  else if(state==='win')msg.textContent='YOU WIN!!!!! :3  PRESS SPACE';
  else if(state==='over')msg.textContent=steps>=MAX
    ?'YOU LOSE IT RAN OUT OF THOUGHTS :(((  PRESS R':'YOU LOSE IT ESCAPED, HUSH... :/// PRESS R';
  msg.style.visibility=(uiReady&&typeof overlayOpen==='function'&&overlayOpen())?'hidden':'';
  if(uiReady&&typeof drawCaret==='function')drawCaret();
}

function draw(){
  drawBoard();
  drawFood();
  drawAnt();
  if(state==='win'||state==='over'){
    ctx.fillStyle='rgba(255,255,255,0.72)';
    ctx.fillRect(0,0,VW,VH); drawAnt();
  }
  drawStatus();
  if(state==='ready'&&uiReady&&typeof drawReady==='function')drawReady();
  if(uiReady&&typeof overlay==='function')overlay();
}

canvas.addEventListener('click', event=>{
  if(state!=='place'||(typeof overlayOpen==='function'&&overlayOpen()))return;
  const box=canvas.getBoundingClientRect();
  const x=Math.floor(((event.clientX-box.left)*VW/box.width-OX)/C);
  const y=Math.floor(((event.clientY-box.top)*VH/box.height-OY)/C);
  if(!isInside(x, y))return;
  if(x===ax && y===ay)return;
  food=y*W+x;
  state='play';
  draw();
});

addEventListener('keydown', event=>{
  const typing=event.target.tagName==='INPUT';
  if(event.key===' '){
    event.preventDefault();
    if(typing)prog.blur();
    if(state==='train'){state=level<TRAIN?'place':'ready'; draw();}
    else if(state==='win'&&level<unlocked){level++; reset();}
  }else if(!typing&&(event.key==='r'||event.key==='R')&&state!=='play'&&state!=='ready')reset();
});

reset();
setInterval(()=>{if(state==='play')step();}, 60);
