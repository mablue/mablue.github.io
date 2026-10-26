export class Player {
  constructor(ctx, chapters, options = {}) {
    this.ctx = ctx;
    this.chapters = chapters;
    this.scenes = {};
    this.currentIndex = 0;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.chunks = [];
    this.currentChunk = -1;
    this.ui = {};
    this.languages = options.languages || this._detectLanguages();
    this.lang = options.defaultLang || this.languages[0] || 'fa';
    this._bindUI();
    this._bindAudio();
    this._renderLangButtons();
  }

  _detectLanguages() {
    if (!this.chapters || !this.chapters.length) return ['fa'];
    const ch = this.chapters[0];
    if (ch.audio && typeof ch.audio === 'object' && !Array.isArray(ch.audio)) {
      return Object.keys(ch.audio);
    }
    const langs = [];
    if (ch.audioFa) langs.push('fa');
    if (ch.audioEn) langs.push('en');
    if (ch.audioAz) langs.push('az');
    return langs.length ? langs : ['fa'];
  }

  _getAudio(ch, lang) {
    if (!ch) return '';
    if (ch.audio && typeof ch.audio === 'object' && !Array.isArray(ch.audio)) {
      return ch.audio[lang] || ch.audio[this.languages[0]] || '';
    }
    const map = { fa: ch.audioFa, en: ch.audioEn, az: ch.audioAz };
    return map[lang] || ch.audioFa || ch.audioEn || '';
  }

  _getChunks(ch, lang) {
    if (!ch) return [];
    if (ch.chunks && typeof ch.chunks === 'object' && !Array.isArray(ch.chunks)) {
      return ch.chunks[lang] || ch.chunks[this.languages[0]] || [];
    }
    const map = { fa: ch.chunksFa, en: ch.chunksEn, az: ch.chunksAz };
    return map[lang] || ch.chunksFa || ch.chunksEn || [];
  }

  _isRTL(lang) {
    return ['fa', 'ar', 'ur', 'he'].indexOf(lang) !== -1;
  }

  _renderLangButtons() {
    const c = document.querySelector('.lang-toggle-bottom');
    if (!c) return;
    c.innerHTML = '';
    this.languages.forEach(lang => {
      const b = document.createElement('button');
      b.dataset.lang = lang;
      b.textContent = lang.toUpperCase();
      b.classList.toggle('active', lang === this.lang);
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

  _bindUI() {
    const $ = id => document.getElementById(id);
    this.ui.text = $('sub-text');
    this.ui.play = $('play-btn');
    this.ui.fill = $('progress-fill');
    this.ui.time = $('time');
    this.ui.track = $('progress-track');
    this.ui.labels = $('chapter-labels');
    this.ui.markers = $('chapter-markers');

    if (this.ui.play) this.ui.play.onclick = () => {
      if (this.audio.paused) this.audio.play().catch(() => {});
      else this.audio.pause();
    };

    if (this.ui.track) this.ui.track.onclick = e => {
      if (!this.audio.duration) return;
      const r = this.ui.track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      this.audio.currentTime = pct * this.audio.duration;
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

  _fmt(s) {
    if (!s || !isFinite(s)) return '0:00';
    return Math.floor(s / 60) + ':' + Math.floor(s % 60).toString().padStart(2, '0');
  }

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
    this.audio.play().catch(() => {});
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
      if (src) {
        this.audio.src = src;
        this.audio.load();
        if (wasPlaying) this.audio.play().catch(() => {});
      }
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
