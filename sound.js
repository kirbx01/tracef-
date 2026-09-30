let actx=null;

function wake(){
  if(!actx)actx=new (window.AudioContext||window.webkitAudioContext)();
  else if(actx.state==='suspended')actx.resume();
}

function tone(f, dur, gain, delay){
  wake();
  const o=actx.createOscillator(), g=actx.createGain();
  o.type='square';
  o.frequency.value=f;
  g.gain.value=gain;
  o.connect(g);
  g.connect(actx.destination);
  const at=actx.currentTime+(delay||0);
  o.start(at);
  o.stop(at+dur);
}

function beep(){ tone(150+(steps%8)*26, 0.05, 0.06); }

function fail(){
  tone(392, 0.12, 0.07, 0);
  tone(311, 0.12, 0.07, 0.14);
  tone(233, 0.42, 0.07, 0.28);
}

function chime(){
  tone(523, 0.1, 0.07, 0);
  tone(659, 0.1, 0.07, 0.1);
  tone(784, 0.26, 0.07, 0.2);
}

addEventListener('pointerdown', wake);
