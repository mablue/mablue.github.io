// ===== ON-SCREEN DEBUG (mobile-friendly) =====
function _debugSetup() {
  if (window._debugEl) return;
  const el = document.createElement('div');
  el.id = 'debug-panel';
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;max-height:40vh;overflow-y:auto;background:rgba(0,0,0,0.85);color:#0f0;font-family:monospace;font-size:10px;padding:4px;z-index:999999;white-space:pre-wrap;pointer-events:auto;border-bottom:2px solid #0f0;';
  el.textContent = 'DEBUG PANEL\n';
  el.onclick = () => { el.style.display = 'none'; };
  document.body.appendChild(el);
  window._debugEl = el;
}
function _debugLog(...args) {
  _debugSetup();
  const msg = args.map(a => {
    if (typeof a === 'object') return JSON.stringify(a);
    return String(a);
  }).join(' ');
  const time = new Date().toLocaleTimeString();
  const el = window._debugEl;
  if (el) {
    el.textContent += `[${time}] ${msg}\n`;
    el.scrollTop = el.scrollHeight;
  }
  console.log(...args);
}
window._debugLog = _debugLog;
_debugSetup();
_debugLog('Player loaded, waiting for audio...');
// ============================================

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

    // v7 queue-mode state
    this._queueMode = false;
    this.audioQueue = [];
    this.audioQueueIndex = 0;
    this._chunkDurations = null;

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
      const r = this.ui.track.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      if (this._queueMode) {
        const durs = this._chunkDurations;
        if (!durs || !durs.length) return;
        const total = durs.reduce((a,b)=>a+b, 0);
        const gt = p * total;
        let acc = 0, idx = 0;
        for (let i = 0; i < durs.length; i++) {
          if (gt >= acc && gt < acc + durs[i]) { idx = i; break; }
          acc += durs[i];
        }
        this.audioQueueIndex = idx;
        this.currentChunk = idx;
        const local = Math.max(0, gt - acc);
        this.audio.src = this.audioQueue[idx];
        this.audio.load();
        this.audio.addEventListener('loadedmetadata', () => {
          try { this.audio.currentTime = Math.min(local, this.audio.duration); } catch(e){}
          this._tryPlay();
        }, { once: true });
        return;
      }
      if (!this.audio.duration) return;
      this.audio.currentTime = p * this.audio.duration;
    };
    document.querySelectorAll('[data-sub]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this._queueMode) {
          const dir0 = b.dataset.sub;
          const wasP0 = !this.audio.paused;
          const d0 = dir0 === 'prev' ? -1 : 1;
          let tgt = this.audioQueueIndex + d0;
          if (tgt < 0) tgt = 0;
          if (tgt >= this.audioQueue.length) tgt = this.audioQueue.length - 1;
          if (tgt === this.audioQueueIndex) {
            b.style.transform = 'scale(0.9)';
            setTimeout(() => { b.style.transform = ''; }, 100);
            return;
          }
          this.audioQueueIndex = tgt;
          this.currentChunk = tgt;
          this.audio.src = this.audioQueue[tgt];
          this.audio.load();
          const texts0 = this._getChunks(this.chapters[this.currentIndex], this.lang);
          if (texts0[tgt] && this.ui.text) {
            this.ui.text.textContent = texts0[tgt];
            const rtl0 = this._isRTL(this.lang);
            this.ui.text.classList.toggle('rtl', rtl0);
            this.ui.text.classList.toggle('ltr', !rtl0);
          }
          if (wasP0) this._tryPlay();
          b.style.transform = 'scale(0.85)';
          setTimeout(() => { b.style.transform = ''; }, 120);
          return;
        }
        if (!this.chunks || this.chunks.length === 0) return;
        if (!this.audio.duration || this.audio.readyState < 1) return;
        const t = this.audio.currentTime || 0;
        let current = this.currentChunk;
        if (current < 0 || current >= this.chunks.length) {
          current = 0;
          for (let i = 0; i < this.chunks.length; i++) {
            if (t >= this.chunks[i].start) current = i;
            else break;
          }
        }
        const dir = b.dataset.sub;
        const d = dir === 'prev' ? -1 : 1;
        let target = Math.max(0, Math.min(this.chunks.length - 1, current + d));
        if (target === current) {
          b.style.transform = 'scale(0.9)';
          setTimeout(() => { b.style.transform = ''; }, 100);
          return;
        }
        const exactStart = this.chunks[target].start;
        const seekTo = Math.max(0, exactStart - 0.4);
        const wasPlaying = !this.audio.paused;
        this._lockedSub = target;
        this._lockedUntil = exactStart;
        if (this._lockTimer) clearTimeout(this._lockTimer);
        this._lockTimer = setTimeout(() => { this._lockedSub = null; }, 1500);
        if (wasPlaying) this.audio.pause();
        this.audio.currentTime = seekTo;
        this.currentChunk = target;
        if (this.ui.text) this.ui.text.textContent = this.chunks[target].text;
        if (wasPlaying) {
          this.audio.addEventListener('seeked', () => this.audio.play().catch(() => {}), { once: true });
        }
        b.style.transform = 'scale(0.85)';
        setTimeout(() => { b.style.transform = ''; }, 120);
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
      if (this._queueMode && this.audioQueueIndex + 1 < this.audioQueue.length) {
        this.audioQueueIndex++;
        this.currentChunk = this.audioQueueIndex;
        const texts = this._getChunks(this.chapters[this.currentIndex], this.lang);
        if (texts[this.audioQueueIndex] && this.ui.text) {
          this.ui.text.textContent = texts[this.audioQueueIndex];
          const rtl = this._isRTL(this.lang);
          this.ui.text.classList.toggle('rtl', rtl);
          this.ui.text.classList.toggle('ltr', !rtl);
        }
        this.audio.src = this.audioQueue[this.audioQueueIndex];
        this.audio.load();
        this._tryPlay();
        return;
      }
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
    btn.style.cssText = 'position:fixed;bottom:14rem;left:50%;transform:translateX(-50%);padding:0.75rem 1.5rem;background:rgba(232,185,106,0.95);color:#05060a;font-family:"JetBrains Mono",monospace;font-size:0.85rem;font-weight:600;letter-spacing:0.05em;border-radius:100px;text-decoration:none;z-index:9999;box-shadow:0 4px 24px rgba(232,185,106,0.5);animation:nextFadeIn 0.5s ease-out;display:inline-flex;align-items:center;gap:0.5rem;';
    document.body.appendChild(btn);
  }

  _hideNextClipButton() {
    const b = document.getElementById('next-clip-btn');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  _computeChunks() {
    if (this._queueMode) {
      const qch = this.chapters[this.currentIndex];
      const texts = this._getChunks(qch, this.lang);
      this.chunks = texts.map((t, i) => ({ start: i, text: t }));
      this.currentChunk = this.audioQueueIndex;
      if (texts[this.audioQueueIndex] && this.ui.text) {
        this.ui.text.textContent = texts[this.audioQueueIndex];
        const rtl = this._isRTL(this.lang);
        this.ui.text.classList.toggle('rtl', rtl);
        this.ui.text.classList.toggle('ltr', !rtl);
      }
      return;
    }
    const ch = this.chapters[this.currentIndex];
    if (!ch) return;
    const chunks = this._getChunks(ch, this.lang);
    if (!chunks || !chunks.length) return;
    const dur = this.audio.duration || ch.duration || 10;

    if (this.clip && this.clip.timings && this.clip.timings[this.lang] && this.clip.timings[this.lang][this.currentIndex]) {
      const t = this.clip.timings[this.lang][this.currentIndex];
      if (t.length === chunks.length) {
        this.chunks = chunks.map((c, i) => ({ start: t[i] || 0, text: c }));
        this.currentChunk = -1;
        if (window._debugLog) window._debugLog('[computeChunks] EXACT ' + this.lang + ' ch' + this.currentIndex + ': ' + t.map(x => x.toFixed(1)).join(','));
        return;
      }
    }

    const tot = chunks.reduce((s, c) => s + c.split(/\s+/).length, 0) || 1;
    let acc = 0;
    this.chunks = chunks.map(c => {
      const w = c.split(/\s+/).length;
      const st = (acc / tot) * dur;
      acc += w;
      return { start: st, text: c };
    });
    this.currentChunk = -1;
    if (window._debugLog) window._debugLog('[computeChunks] FALLBACK ' + this.lang);
  }

  _onTimeUpdate() {
    if (this._queueMode) { this._onTimeUpdateQueue(); return; }
    const dur = this.audio.duration || 0;
    const t = this.audio.currentTime || 0;
    if (this.ui.fill) this.ui.fill.style.width = dur ? ((t / dur) * 100) + '%' : '0%';
    if (this.ui.time) this.ui.time.textContent = this._fmt(t) + ' / ' + this._fmt(dur);

    if (this._lockedSub !== null && this._lockedSub !== undefined) {
      if (t >= this._lockedUntil) {
        this._lockedSub = null;
        if (this._lockTimer) clearTimeout(this._lockTimer);
      } else {
        return;
      }
    }

    let idx = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      if (t >= this.chunks[i].start) idx = i;
      else break;
    }
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

  _onTimeUpdateQueue() {
    const durs = this._chunkDurations;
    const total = durs && durs.length ? durs.reduce((a,b)=>a+b, 0) : (this.audioQueue.length || 1);
    const before = durs && durs.length ? durs.slice(0, this.audioQueueIndex).reduce((a,b)=>a+b, 0) : this.audioQueueIndex;
    const local = this.audio.currentTime || 0;
    const globalT = before + local;
    if (this.ui.fill) this.ui.fill.style.width = total ? ((globalT / total) * 100) + '%' : '0%';
    if (this.ui.time) this.ui.time.textContent = this._fmt(globalT) + ' / ' + this._fmt(total);
    const idx = this.audioQueueIndex;
    if (idx !== this.currentChunk) {
      this.currentChunk = idx;
      const texts = this._getChunks(this.chapters[this.currentIndex], this.lang);
      if (texts[idx] && this.ui.text) {
        this.ui.text.textContent = texts[idx];
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
    const _dur = (c) => {
      if (c.chunkDurations && c.chunkDurations[this.lang] && c.chunkDurations[this.lang].length)
        return c.chunkDurations[this.lang].reduce((a,b)=>a+b, 0);
      return c.duration || 10;
    };
    let acc = 0;
    const tot = this.chapters.reduce((s, c) => s + _dur(c), 0);
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
      acc += _dur(ch);
    });
  }

  async loadChapter(index) {
    const ch = this.chapters[index];
    if (!ch || !ch.built) return;
    this._hideNextClipButton();
    document.querySelectorAll('.scene-ui').forEach(el => el.classList.add('hidden'));
    if (this.scenes[this.currentIndex]) {
      try { await this.scenes[this.currentIndex].exit(); }
      catch (e) { _debugLog('scene exit failed:', e); }
    }
    this.currentIndex = index;
    this.chunks = [];
    this.currentChunk = -1;
    const src = this._getAudio(ch, this.lang);
    if (Array.isArray(src)) {
      this._queueMode = true;
      this.audioQueue = src.slice();
      this.audioQueueIndex = 0;
      this._chunkDurations = (ch.chunkDurations && ch.chunkDurations[this.lang]) || null;
      if (src[0]) { this.audio.src = src[0]; this.audio.load(); }
    } else {
      this._queueMode = false;
      this.audioQueue = [];
      this.audioQueueIndex = 0;
      this._chunkDurations = null;
      if (src) { this.audio.src = src; this.audio.load(); }
    }
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
      if (Array.isArray(src)) {
        this._queueMode = true;
        this.audioQueue = src.slice();
        this.audioQueueIndex = 0;
        this._chunkDurations = (ch.chunkDurations && ch.chunkDurations[lang]) || null;
        this.chunks = [];
        this.currentChunk = -1;
        if (src[0]) { this.audio.src = src[0]; this.audio.load(); }
        if (wasPlaying || !this._userPaused) this._tryPlay();
      } else {
        this._queueMode = false;
        this.audioQueue = [];
        this.audioQueueIndex = 0;
        this._chunkDurations = null;
        if (src) { this.audio.src = src; this.audio.load(); if (wasPlaying || !this._userPaused) this._tryPlay(); }
      }
    }
    if (this.scenes[this.currentIndex]) this.scenes[this.currentIndex].onLanguageChange(lang);
  }

  update(dt) {
    const scene = this.scenes[this.currentIndex];
    if (!scene) return;
    const localT = this.audio.currentTime || 0;
    let audioTime = localT;
    let dur = this.audio.duration || (this.chapters[this.currentIndex]?.duration || 30);
    if (this._queueMode && this._chunkDurations && this._chunkDurations.length) {
      let before = 0;
      for (let i = 0; i < this.audioQueueIndex; i++) before += this._chunkDurations[i] || 0;
      audioTime = before + localT;
      let tot = 0;
      for (let i = 0; i < this._chunkDurations.length; i++) tot += this._chunkDurations[i] || 0;
      dur = tot;
    }
    const isPlaying = !this.audio.paused && localT > 0.05;
    if (isPlaying) {
      this._fallbackStart = 0;
      scene.update(dt, audioTime, dur, this.currentChunk);
      return;
    }
    if (this._userPaused) {
      scene.update(dt, audioTime, dur, this.currentChunk);
      return;
    }
    if (!this._fallbackStart) this._fallbackStart = performance.now();
    const elapsed = (performance.now() - this._fallbackStart) / 1000;
    if (elapsed < 0.3) {
      scene.update(dt, audioTime, dur, this.currentChunk);
      return;
    }
    const fakeTime = Math.min(elapsed, dur);
    scene.update(dt, fakeTime, dur, this.currentChunk);
  }

  start(initialLang) {
    this.lang = initialLang || this.lang;
    this.setLanguage(this.lang);
    this.loadChapter(0);
  }

  _subtitleNav(dir) {
    if (this._queueMode) {
      const wasP = !this.audio.paused;
      const d = dir === 'prev' ? -1 : 1;
      let tgt = this.audioQueueIndex + d;
      if (tgt < 0) tgt = 0;
      if (tgt >= this.audioQueue.length) tgt = this.audioQueue.length - 1;
      if (tgt === this.audioQueueIndex) { this._flashSubNav(dir); return; }
      this.audioQueueIndex = tgt;
      this.currentChunk = tgt;
      this.audio.src = this.audioQueue[tgt];
      this.audio.load();
      const texts = this._getChunks(this.chapters[this.currentIndex], this.lang);
      if (texts[tgt] && this.ui.text) {
        this.ui.text.textContent = texts[tgt];
        const rtl = this._isRTL(this.lang);
        this.ui.text.classList.toggle('rtl', rtl);
        this.ui.text.classList.toggle('ltr', !rtl);
      }
      if (wasP) this._tryPlay();
      return;
    }
    if (!this.chunks || this.chunks.length === 0) {
      _debugLog('[sub-nav] chunks not ready. readyState=' + this.audio.readyState);
      return;
    }
    if (!this.audio.duration || this.audio.readyState < 1) {
      _debugLog('[sub-nav] audio not ready');
      return;
    }

    let current = this.currentChunk;
    if (current < 0 || current >= this.chunks.length) {
      const t = this.audio.currentTime || 0;
      current = 0;
      for (let i = 0; i < this.chunks.length; i++) {
        if (t >= this.chunks[i].start) current = i;
        else break;
      }
    }

    const d = dir === 'prev' ? -1 : 1;
    let target = current + d;
    if (target < 0) target = 0;
    if (target >= this.chunks.length) target = this.chunks.length - 1;

    if (target === current) {
      this._flashSubNav(dir);
      return;
    }

    this._pendingSeekTo = this.chunks[target].start;
    clearTimeout(this._pendingSeekTimeout);
    this._pendingSeekTimeout = setTimeout(() => { this._pendingSeekTo = null; }, 1500);

    this.audio.currentTime = this.chunks[target].start;
    this.currentChunk = target;

    if (this.ui.text) {
      this.ui.text.textContent = this.chunks[target].text;
      const rtl = this._isRTL(this.lang);
      this.ui.text.classList.toggle('rtl', rtl);
      this.ui.text.classList.toggle('ltr', !rtl);
    }

    if (this.audio.paused) this._tryPlay();
  }

  _flashSubNav(dir) {
    const btns = document.querySelectorAll('[data-sub]');
    for (const b of btns) {
      if (b.dataset.sub === dir) {
        const orig = b.style.background;
        b.style.background = 'rgba(232,185,106,0.5)';
        setTimeout(() => { b.style.background = orig; }, 180);
      }
    }
  }
}
