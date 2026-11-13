(function(){
  const C=location.pathname.includes('darkmatter')?'dm':'solar';
  function send(s){try{fetch('/log',{method:'POST',body:C+'|'+s}).catch(()=>{})}catch(e){}}
  window.addEventListener('error',e=>send('ERR:'+e.message));
  const _p=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){
    const src=(this.src||'').split('/').slice(-2).join('/');
    send('play('+src+')');
    return _p.call(this).then(()=>send('  →OK'),e=>{send('  →'+e.name);throw e});
  };
  const _A=window.Audio;
  window.Audio=function(s){const a=new _A(s);window.__a=a;return a};
  window.Audio.prototype=_A.prototype;
  setTimeout(()=>{
    send('T-4s: audio='+(!!window.__a)+' src='+(window.__a?.src?'Y':'N'));
  },4000);
  setTimeout(()=>{
    send('=== CLICK PLAY ===');
    const b=document.querySelector('#play-btn')||document.querySelector('.play-btn');
    if(b)b.click(); else send('no play btn');
  },5000);
  setTimeout(()=>{
    const a=window.__a;
    send('=== T-8s FINAL ===');
    send('audio exists: '+!!a);
    if(a){
      send('paused: '+a.paused);
      send('time: '+a.currentTime.toFixed(2));
      send('ready: '+a.readyState);
      send('src ends: '+(a.src||'').split('/').pop());
      send('error: '+(a.error?'code '+a.error.code:'none'));
    }
    const st=document.querySelector('#sub-text');
    send('subtitle: "'+(st?st.textContent.slice(0,40):'(null)')+'"');
  },8000);
  send('READY');
})();
