# MASTER_SOURCE — Full source of player/ helpers

Companion to MASTER_CONTEXT.md. Paste only if AI needs exact code beyond the API cheat sheet in §2.

---

## player/player.v4.js

```
export class Player {
  constructor(a, b, c) {
    let opts;
    if (typeof b !== 'undefined') opts = { ctx: a, chapters: b, ...(c || {}) };
    else opts = a;

    this.ctx = opts.ctx;
    this.chapters = opts.chapters || [];
    this.clip = opts.clip || {};
    this.scenes = opts.scenes || {};
    this.container = opts.container || document.body;

    this.languages = opts.languages || this._detectLanguages();
    this.lang = this.clip.defaultLang || opts.defaultLang || this.languages[0] || 'fa';
    this.needsLangToggle = this.languages.length > 1;

    this.currentIndex = 0;
    this.chunks = [];
    this.currentChunk = -1;

    this.audio = new Audio();
    this.audio.preload = 'auto';

    this._ensureChrome();
    this._injectClipUI();
    this._bindUI();
    this._bindAudio();
    this._renderLangButtons();
  }

  _detectLanguages() {
    if (this.clip.languages && this.clip.languages.length) return this.clip.languages;
    const s = new Set();
    for (const ch of this.chapters) {
      if (ch.audio && typeof ch.audio === 'object') {
        Object.keys(ch.audio).forEach(k => s.add(k));
      }
      if (ch.audioFa) s.add('fa');
      if (ch.audioEn) s.add('en');
      if (ch.audioAz) s.add('az');
    }
    return s.size ? [...s] : ['fa'];
  }

  _ensureChrome() {
    if (document.getElementById('sub-text') && document.getElementById('progress-track')) return;
    const backUrl = this.clip.backUrl || 'index.html';
    const backText = this.clip.backText || '← back';
    const brand = this.clip.brand || 'MASOUD<span>.</span>';
    const html = `
      <div class="top-bar">
        <a href="${backUrl}" class="brand">${brand}</a>
        <a href="${backUrl}">${backText}</a>
      </div>
      <div class="subtitle-bar" id="subtitle-bar">
        <button class="sub-nav" data-sub="prev" aria-label="Previous">‹</button>
        <div class="sub-text" id="sub-text"></div>
        <button class="sub-nav" data-sub="next" aria-label="Next">›</button>
      </div>
      <div class="controls">
        <button class="play-btn" id="play-btn" aria-label="Play">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div class="progress-section">
          <div class="chapter-labels" id="chapter-labels"></div>
          <div class="progress-track" id="progress-track">
            <div class="progress-fill" id="progress-fill"></div>
            <div class="chapter-markers" id="chapter-markers"></div>
          </div>
        </div>
        <span class="time" id="time">0:00 / 0:00</span>
      </div>`;
    this.container.insertAdjacentHTML('beforeend', html);
  }

  _injectClipUI() {
    const list = this.clip.ui || [];
    for (const item of list) {
      if (!item || !item.id) continue;
      if (document.getElementById(item.id)) continue;
      const el = document.createElement('div');
      el.id = item.id;
      el.className = 'scene-ui hidden';
      el.innerHTML = item.html || '';
      document.body.appendChild(el);
    }
  }

  _renderLangButtons() {
    if (!this.needsLangToggle) return;
    let c = document.querySelector('.lang-toggle-bottom');
    if (!c) {
      const controls = document.querySelector('.controls');
      if (!controls) return;
      c = document.createElement('div');
      c.className = 'lang-toggle-bottom';
      controls.appendChild(c);
    }
    c.innerHTML = '';
    this.languages.forEach(lang => {
      const b = document.createElement('button');
      b.dataset.lang = lang;
      b.textContent = lang.toUpperCase();
      if (lang === this.lang) b.classList.add('active');
      b.addEventListener('click', e => { e.preventDefault(); this.setLanguage(lang); });
      c.appendChild(b);
    });
  }

  _refreshLangButtons() {
    document.querySelectorAll('.lang-toggle-bottom button').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === this.lang);
    });
  }

  registerScene(i, s) { this.scenes[i] = s; }

  _getAudio(ch, lang) {
    if (!ch) return '';
    if (ch.audio && typeof ch.audio === 'object') return ch.audio[lang] || ch.audio[this.languages[0]] || '';
    const m = { fa: ch.audioFa, en: ch.audioEn, az: ch.audioAz };
    return m[lang] || ch.audioFa || ch.audioEn || '';
  }

  _getChunks(ch, lang) {
    if (!ch) return [];
    if (ch.chunks && typeof ch.chunks === 'object') return ch.chunks[lang] || ch.chunks[this.languages[0]] || [];
    const m = { fa: ch.chunksFa, en: ch.chunksEn, az: ch.chunksAz };
    return m[lang] || ch.chunksFa || ch.chunksEn || [];
  }

  _isRTL(lang) { return ['fa','ar','ur','he'].indexOf(lang) !== -1; }

  _bindUI() {
    const $ = id => document.getElementById(id);
    this.ui = {
      text: $('sub-text'),
      play: $('play-btn'),
      fill: $('progress-fill'),
      time: $('time'),
      track: $('progress-track'),
      labels: $('chapter-labels'),
      markers: $('chapter-markers'),
    };
    if (this.ui.play) this.ui.play.onclick = () => {
      if (this.audio.paused) {
        this._userPaused = false;
        this._tryPlay();
      } else {
        this._userPaused = true;
        this.audio.pause();
      }
    };
    if (this.ui.track) this.ui.track.onclick = e => {
      if (!this.audio.duration) return;
      const r = this.ui.track.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      this.audio.currentTime = p * this.audio.duration;
    };
    document.querySelectorAll('[data-sub]').forEach(b => {
      b.addEventListener('click', () => {
        if (!this.chunks.length) return;
        const d = b.dataset.sub === 'prev' ? -1 : 1;
        const t = Math.max(0, Math.min(this.chunks.length - 1, this.currentChunk + d));
        this.audio.currentTime = this.chunks[t].start;
      });
    });
  }

  _bindAudio() {
    this.audio.addEventListener('play', () => {
      if (this.ui.play) this.ui.play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
    });
    this.audio.addEventListener('pause', () => {
      if (this.ui.play) this.ui.play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    });
    this.audio.addEventListener('timeupdate', () => this._onTimeUpdate());
    this.audio.addEventListener('loadedmetadata', () => this._computeChunks());
    this.audio.addEventListener('ended', () => {
      if (this.currentIndex + 1 < this.chapters.length) {
        this.loadChapter(this.currentIndex + 1);
      } else if (this.clip.nextClip) {
        this._showNextClipButton();
      }
    });
  }


  _tryPlay() {
    if (this._userPaused) return;
    const p = this.audio.play();
    if (p && p.then) {
      p.then(() => this._hideTapHint()).catch(err => {
        const name = err && err.name;
        if (name === 'NotAllowedError' || name === 'NotSupportedError') {
          this._showTapHint();
          this._armGesture();
        }
      });
    }
  }

  _showTapHint() {
    if (this._hintEl) return;
    if (!document.getElementById('player-hint-styles')) {
      const st = document.createElement('style');
      st.id = 'player-hint-styles';
      st.textContent = '@keyframes phPulse{0%,100%{opacity:1;transform:translateX(-50%) scale(1);}50%{opacity:.75;transform:translateX(-50%) scale(1.04);}}';
      document.head.appendChild(st);
    }
    const el = document.createElement('div');
    el.className = 'player-tap-hint';
    el.textContent = '\u25b6 tap to play';
    el.style.cssText = 'position:fixed;bottom:8rem;left:50%;transform:translateX(-50%);padding:0.6rem 1.2rem;background:rgba(232,185,106,0.92);color:#05060a;font-family:monospace;font-size:0.8rem;font-weight:600;border-radius:100px;z-index:9999;animation:phPulse 1.5s ease-in-out infinite;pointer-events:none;box-shadow:0 4px 20px rgba(232,185,106,.4);';
    document.body.appendChild(el);
    this._hintEl = el;
  }

  _hideTapHint() {
    if (this._hintEl && this._hintEl.parentNode) this._hintEl.parentNode.removeChild(this._hintEl);
    this._hintEl = null;
  }

  _armGesture() {
    if (this._gestureArmed) return;
    this._gestureArmed = true;
    const handler = (e) => {
      if (e.target && e.target.closest && (e.target.closest('.controls') || e.target.closest('.lang-toggle-bottom') || e.target.closest('.top-bar'))) return;
      this._gestureArmed = false;
      document.removeEventListener('pointerdown', handler, true);
      document.removeEventListener('touchstart', handler, true);
      this._tryPlay();
    };
    document.addEventListener('pointerdown', handler, true);
    document.addEventListener('touchstart', handler, true);
  }

  _showNextClipButton() {
    if (!this.clip.nextClip || document.getElementById('next-clip-btn')) return;
    if (!document.getElementById('next-clip-style')) {
      const st = document.createElement('style');
      st.id = 'next-clip-style';
      st.textContent = '@keyframes nextFadeIn{from{opacity:0;transform:translateX(-50%) translateY(8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}';
      document.head.appendChild(st);
    }
    const btn = document.createElement('a');
    btn.id = 'next-clip-btn';
    btn.href = this.clip.nextClip;
    btn.textContent = this.clip.nextClipLabel || 'Next →';
    btn.style.cssText = 'position:fixed;bottom:8rem;left:50%;transform:translateX(-50%);padding:0.75rem 1.5rem;background:rgba(232,185,106,0.95);color:#05060a;font-family:"JetBrains Mono",monospace;font-size:0.85rem;font-weight:600;letter-spacing:0.05em;border-radius:100px;text-decoration:none;z-index:9999;box-shadow:0 4px 24px rgba(232,185,106,0.5);animation:nextFadeIn 0.5s ease-out;display:inline-flex;align-items:center;gap:0.5rem;';
    document.body.appendChild(btn);
  }

  _hideNextClipButton() {
    const b = document.getElementById('next-clip-btn');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  _computeChunks() {
    const ch = this.chapters[this.currentIndex];
    const chunks = this._getChunks(ch, this.lang);
    const dur = this.audio.duration || ch.duration || 10;
    const tot = chunks.reduce((s, c) => s + c.split(/\s+/).length, 0) || 1;
    let acc = 0;
    this.chunks = chunks.map(c => {
      const w = c.split(/\s+/).length;
      const st = (acc / tot) * dur;
      acc += w;
      return { start: st, text: c };
    });
    this.currentChunk = -1;
  }

  _onTimeUpdate() {
    const dur = this.audio.duration || 0;
    const t = this.audio.currentTime || 0;
    if (this.ui.fill) this.ui.fill.style.width = dur ? ((t / dur) * 100) + '%' : '0%';
    if (this.ui.time) this.ui.time.textContent = this._fmt(t) + ' / ' + this._fmt(dur);
    let idx = 0;
    for (let i = 0; i < this.chunks.length; i++) { if (t >= this.chunks[i].start) idx = i; else break; }
    if (idx !== this.currentChunk) {
      this.currentChunk = idx;
      if (this.chunks[idx] && this.ui.text) {
        this.ui.text.textContent = this.chunks[idx].text;
        const rtl = this._isRTL(this.lang);
        this.ui.text.classList.toggle('rtl', rtl);
        this.ui.text.classList.toggle('ltr', !rtl);
      }
    }
  }

  _fmt(s) { if (!s || !isFinite(s)) return '0:00'; return Math.floor(s/60) + ':' + Math.floor(s%60).toString().padStart(2,'0'); }

  _renderMarkers() {
    if (!this.ui.labels || !this.ui.markers) return;
    this.ui.labels.innerHTML = '';
    this.ui.markers.innerHTML = '';
    let acc = 0;
    const tot = this.chapters.reduce((s, c) => s + (c.duration || 10), 0);
    this.chapters.forEach((ch, i) => {
      const pct = (acc / tot) * 100;
      const l = document.createElement('div');
      l.className = 'ch-label';
      l.style.left = pct + '%';
      l.textContent = ch.n;
      if (i === this.currentIndex) l.classList.add('active');
      else if (!ch.built) l.classList.add('disabled');
      else if (i < this.currentIndex) l.classList.add('done');
      l.onclick = () => { if (ch.built) this.loadChapter(i); };
      this.ui.labels.appendChild(l);
      if (i > 0) {
        const m = document.createElement('div');
        m.className = 'ch-marker';
        m.style.left = pct + '%';
        if (i === this.currentIndex) m.classList.add('active');
        else if (!ch.built) m.classList.add('disabled');
        else if (i < this.currentIndex) m.classList.add('done');
        m.onclick = e => { e.stopPropagation(); if (ch.built) this.loadChapter(i); };
        this.ui.markers.appendChild(m);
      }
      acc += ch.duration || 10;
    });
  }

  async loadChapter(index) {
    const ch = this.chapters[index];
    if (!ch || !ch.built) return;
    this._hideNextClipButton();
    document.querySelectorAll('.scene-ui').forEach(el => el.classList.add('hidden'));
    if (this.scenes[this.currentIndex]) {
      try { await this.scenes[this.currentIndex].exit(); }
      catch (e) { console.warn('scene exit failed:', e); }
    }
    this.currentIndex = index;
    const src = this._getAudio(ch, this.lang);
    if (src) { this.audio.src = src; this.audio.load(); }
    this.chunks = [];
    this.currentChunk = -1;
    if (this.scenes[index]) await this.scenes[index].enter(ch, this.lang);
    this._renderMarkers();
    this._refreshLangButtons();
    this._tryPlay();
  }

  setLanguage(lang) {
    if (this.languages.indexOf(lang) === -1) return;
    this.lang = lang;
    if (this.ctx) this.ctx.lang = lang;
    this._refreshLangButtons();
    const wasPlaying = !this.audio.paused;
    const ch = this.chapters[this.currentIndex];
    if (ch) {
      const src = this._getAudio(ch, lang);
      if (src) { this.audio.src = src; this.audio.load(); if (wasPlaying || !this._userPaused) this._tryPlay(); }
    }
    if (this.scenes[this.currentIndex]) this.scenes[this.currentIndex].onLanguageChange(lang);
  }

  update(dt) {
    const s = this.scenes[this.currentIndex];
    if (s) s.update(dt, this.audio.currentTime, this.audio.duration, this.currentChunk);
  }

  start(initialLang) {
    this.lang = initialLang || this.lang;
    this.setLanguage(this.lang);
    this.loadChapter(0);
  }
}
```

---

## player/scene-base.js

```
export class SceneBase {
  constructor(ctx) {
    this.ctx = ctx;
    this.group = new ctx.THREE.Group();
    this.ctx.scene.add(this.group);
    this.group.visible = false;
  }
  async enter(chapter, lang) { this.group.visible = true; }
  async exit() { this.group.visible = false; }
  update(dt, time, duration, chunk) {}
  onLanguageChange(lang) {}
}
```

---

## player/setup.js

```
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Player } from './player.v4.js?v=20261027-064851';

export { THREE };

export function setupThree(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(opts.bg ?? 0x05060a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    opts.fov ?? 50,
    window.innerWidth / window.innerHeight,
    0.1,
    opts.far ?? 500
  );
  const cp = opts.cameraPos ?? [0, 0, 14];
  camera.position.set(cp[0], cp[1], cp[2]);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = false;
  controls.minDistance = opts.minDistance ?? 5;
  controls.maxDistance = opts.maxDistance ?? 40;
  controls.enablePan = false;
  const tg = opts.target ?? [0, 0, 0];
  controls.target.set(tg[0], tg[1], tg[2]);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { THREE, scene, camera, controls, renderer, canvas };
}

export function createStarField(scene, count = 500, opts = {}) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = (opts.minR ?? 40) + Math.random() * (opts.maxR ?? 150);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i*3]   = r * Math.sin(ph) * Math.cos(th);
    pos[i*3+1] = r * Math.cos(ph);
    pos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size: opts.size ?? 1.2,
    color: opts.color ?? 0xffffff,
    transparent: true,
    opacity: opts.opacity ?? 0.4,
    sizeAttenuation: true,
  })));
}

export function createPointGroup(scene, DATA, opts = {}) {
  const group = new THREE.Group();
  scene.add(group);
  const geo = new THREE.SphereGeometry(opts.radius ?? 0.1, 10, 10);
  const color = opts.color ?? 0xe8b96a;
  const meshes = [];
  for (const p of DATA) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0,
    }));
    m.position.set(p.x, p.y, p.z || 0);
    group.add(m);
    meshes.push(m);
  }
  return { group, meshes };
}

export function startClip({
  chapters, clip,
  SceneClasses,
  makeData,
  trueValues = {},
  cameraPos, cameraTarget, minDistance, maxDistance,
  starCount = 500,
  pointConfig = {},
  defaultLang = 'az',
}) {
  const canvas = document.getElementById('scene-canvas');
  const { scene, camera, controls, renderer } = setupThree(canvas, {
    cameraPos, target: cameraTarget,
    minDistance, maxDistance,
  });
  createStarField(scene, starCount);

  const DATA = makeData ? makeData() : [];
  const { group: pointsGroup, meshes: dotMeshes } = createPointGroup(scene, DATA, pointConfig);

  const ctx = {
    THREE, scene, camera, controls, renderer, canvas,
    lang: defaultLang,
    DATA, ...trueValues,
    pointsGroup, dotMeshes,
  };
  const shared = { ...ctx };

  const sceneInstances = {};
  chapters.forEach((_, i) => {
    const SC = SceneClasses[i];
    if (SC) sceneInstances[i] = new SC(ctx, shared);
  });

  const player = new Player({ ctx, chapters, clip, scenes: sceneInstances });

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    player.update(dt);
    controls.update();
    renderer.render(scene, camera);
  }
  tick();
  player.start();
}
```

---

## player/walkthrough.js

```
export function buildCodeUI(pre, lines) {
  if (!pre || !lines) return;
  pre.innerHTML = lines.map((line, i) =>
    '<span class="code-line" data-line="' + i + '">' + (line || ' ') + '</span>'
  ).join('');
}

export function applyCodeChunk(pre, chapter, chunk) {
  if (!pre || !chapter || !chapter.code || !chapter.code.highlights) return;
  const range = chapter.code.highlights[chunk];
  const lines = pre.querySelectorAll('.code-line');
  if (!range) {
    lines.forEach(el => el.classList.remove('highlight', 'dimmed'));
    return;
  }
  const start = range[0], end = range[1];
  lines.forEach(el => {
    const n = parseInt(el.dataset.line, 10);
    const inRange = n >= start && n <= end;
    el.classList.toggle('highlight', inRange);
    el.classList.toggle('dimmed', !inRange);
  });
  const container = pre.closest('#ml-code') || pre.parentElement;
  if (!container) return;
  const firstLine = pre.querySelector('[data-line="' + start + '"]');
  if (firstLine) {
    const targetScroll = firstLine.offsetTop - container.clientHeight / 2 + firstLine.offsetHeight / 2;
    container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
  }
}

export function clearCodeHighlight(pre) {
  if (!pre) return;
  pre.querySelectorAll('.code-line').forEach(el => {
    el.classList.remove('highlight', 'dimmed');
  });
}
```

---

## player/visuals.js

```
export function updateLine(mesh, w, b, xRange = [-4, 4], z = 0) {
  if (!mesh) return;
  const [x1, x2] = xRange;
  const y1 = w * x1 + b, y2 = w * x2 + b;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  mesh.position.set((x1+x2)/2, (y1+y2)/2, z);
  mesh.scale.set(1, len, 1);
  mesh.rotation.z = Math.atan2(dy, dx) - Math.PI/2;
}

export function updateCurvePositions(positions, w1, w2, b, xRange = [-4, 4]) {
  if (!positions) return;
  const N = positions.length / 3;
  const [xMin, xMax] = xRange;
  for (let i = 0; i < N; i++) {
    const x = xMin + (i / (N - 1)) * (xMax - xMin);
    const y = w1 * x + w2 * x * x + b;
    positions[i*3] = x;
    positions[i*3+1] = y;
    positions[i*3+2] = 0;
  }
}

export function updateDrops(drops, DATA, w, b, opts = {}) {
  if (!drops || !DATA) return;
  const THREE = opts.THREE;
  if (!THREE) return;
  for (let i = 0; i < DATA.length && i < drops.length; i++) {
    const p = DATA[i];
    const modelY = w * p.x + b;
    drops[i].geometry.setFromPoints([
      new THREE.Vector3(p.x, p.y, p.z || 0),
      new THREE.Vector3(p.x, modelY, 0)
    ]);
  }
}
```

---

## player/training.js

```
export function drawLossChart(canvas, history) {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (w === 0 || h === 0) return;
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (!history || history.length < 2) return;

  let maxV = 0;
  for (const p of history) if (p.v > maxV) maxV = p.v;
  maxV = maxV || 1;

  ctx.strokeStyle = '#7df9ff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < history.length; i++) {
    const p = history[i];
    const x = p.t * w;
    const y = h - (p.v / maxV) * (h - 6) - 2;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(232,185,106,0.9)';
  ctx.font = '9px JetBrains Mono';
  ctx.fillText('LOSS', 4, 10);
}

export function updateTrainingHUD({ ease, totalSteps, loss, lossEl, barEl, stepEl }) {
  if (lossEl && loss !== undefined) lossEl.textContent = loss.toFixed(4);
  if (barEl) barEl.style.width = (ease * 100).toFixed(0) + '%';
  if (stepEl) stepEl.textContent = 'step ' + Math.round(ease * totalSteps) + ' / ' + totalSteps;
}
```

---

## player/i18n.js

```
const MAPS = {
  lossSub: { az: 'kiçik = yaxşı', fa: 'کمتر = بهتر', en: 'smaller = better' },
};

export function langText(lang, key) {
  const m = MAPS[key];
  if (!m) return '';
  return m[lang] || m.en || '';
}
```

---

