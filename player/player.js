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
      if (this.currentIndex + 1 < this.chapters.length) this.loadChapter(this.currentIndex + 1);
    });
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
