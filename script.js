(function(){
  var canvas = document.getElementById('starfield');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var stars = [];
  function resize(){
    canvas.width = innerWidth; canvas.height = innerHeight;
    stars = [];
    for (var i = 0; i < 160; i++) {
      stars.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: Math.random()*1.1 + .2,
        a: Math.random(),
        da: (Math.random()*.02 + .005) * (Math.random() > .5 ? 1 : -1)
      });
    }
  }
  addEventListener('resize', resize); resize();
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(function(s){
      s.a += s.da;
      if (s.a > 1 || s.a < .1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(200,230,255,' + s.a + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

function fmtTime(s){
  if (!s || !isFinite(s)) return '0:00';
  var m = Math.floor(s/60);
  var sec = Math.floor(s%60).toString().padStart(2, '0');
  return m + ':' + sec;
}

function setupPlayer(prefix, tracks){
  var audio = document.getElementById(prefix+'-audio');
  var list = document.getElementById(prefix+'-list');
  var playBtn = document.querySelector('[data-play="'+prefix+'"]');
  var fill = document.querySelector('[data-fill="'+prefix+'"]');
  var timeEl = document.querySelector('[data-time="'+prefix+'"]');
  var bar = document.querySelector('[data-progress="'+prefix+'"]');
  if (!audio || !list) return;
  if (!tracks || !tracks.length){
    list.innerHTML = '<li style="color:#6b655c;cursor:default;justify-content:center">No tracks yet</li>';
    return;
  }
  var cur = 0;
  tracks.forEach(function(t, i){
    var li = document.createElement('li');
    li.dataset.i = i;
    var saved = parseFloat(localStorage.getItem('progress_'+t.file)||'0');
    li.innerHTML = '<span>'+t.title+'</span><span class="dur">'+(saved>0?fmtTime(saved):'')+'</span>';
    li.onclick = function(){ play(i); };
    list.appendChild(li);
  });
  list.children[0].classList.add('active');
  audio.src = tracks[0].file;
  audio.load();
  function setIcon(playing){
    playBtn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  }
  function play(i){
    cur = i;
    var t = tracks[i];
    audio.src = t.file;
    audio.load();
    var saved = parseFloat(localStorage.getItem('progress_'+t.file)||'0');
    if (saved > 0) {
      var once = function(){
        if (saved < audio.duration) audio.currentTime = saved;
        audio.removeEventListener('loadedmetadata', once);
      };
      audio.addEventListener('loadedmetadata', once);
    }
    audio.play();
    Array.from(list.children).forEach(function(li, idx){
      li.classList.toggle('active', idx === i);
    });
  }
  playBtn.onclick = function(){ audio.paused ? audio.play() : audio.pause(); };
  audio.addEventListener('play', function(){ setIcon(true); });
  audio.addEventListener('pause', function(){ setIcon(false); });
  audio.addEventListener('loadedmetadata', function(){
    timeEl.textContent = '0:00 / ' + fmtTime(audio.duration);
  });
  var lastSave = 0;
  audio.addEventListener('timeupdate', function(){
    var dur = audio.duration || 0;
    var t = audio.currentTime || 0;
    fill.style.width = dur ? ((t/dur)*100)+'%' : '0%';
    timeEl.textContent = fmtTime(t) + ' / ' + fmtTime(dur);
    var now = Date.now();
    if (now - lastSave > 1000) {
      lastSave = now;
      localStorage.setItem('progress_'+tracks[cur].file, t);
      var li = list.children[cur];
      if (li) li.querySelector('.dur').textContent = fmtTime(t);
    }
  });
  audio.addEventListener('ended', function(){
    localStorage.removeItem('progress_'+tracks[cur].file);
    var li = list.children[cur];
    if (li) li.querySelector('.dur').textContent = '';
    if (cur + 1 < tracks.length) play(cur + 1);
    else setIcon(false);
  });
  bar.onclick = function(e){
    var rect = bar.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    if (audio.duration) audio.currentTime = pct * audio.duration;
  };
}

if (typeof MUSIC_TRACKS !== 'undefined') setupPlayer('music', MUSIC_TRACKS);
if (typeof PODCAST_TRACKS !== 'undefined') setupPlayer('podcast', PODCAST_TRACKS);

var observer = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('section').forEach(function(s){ observer.observe(s); });
