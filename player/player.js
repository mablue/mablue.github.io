export class Player {
  constructor(ctx, chapters) {
    this.ctx = ctx;
    this.chapters = chapters;
    this.scenes = {};
    this.currentIndex = 0;
    this.lang = 'fa';
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.chunks = [];
    this.currentChunk = -1;
    this.ui = {};
    this._lastDot = 0;
    this._bindUI();
    this._bindAudio();
  }

  registerScene(index, scene) { this.scenes[index] = scene; }

  _bindUI() {
    const $ = id => document.getElementById(id);
    this.ui.text = $('sub-text');
    this.ui.play = $('play-btn');
    this.ui.fill = $('progress-fill');
    this.ui.time = $('time');
    this.ui.track = $('progress-track');
    this.ui.labels = $('chapter-labels');
    this.ui.markers = $('chapter-markers');

    this.ui.play.onclick = () => {
      if (this.audio.paused) this.audio.play().catch(() => {});
      else this.audio.pause();
    };

    this.ui.track.onclick = (e) => {
      if (!this.audio.duration) return;
      const rect = this.ui.track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.audio.currentTime = pct * this.audio.duration;
    };

    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setLanguage(btn.dataset.lang);
      });
    });

    document.querySelectorAll('[data-sub]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.chunks.length) return;
        const dir = btn.dataset.sub === 'prev' ? -1 : 1;
        const target = Math.max(0, Math.min(this.chunks.length - 1, this.currentChunk + dir));
        this.audio.currentTime = this.chunks[target].start;
      });
    });
  }

  _bindAudio() {
    this.audio.addEventListener('play', () => {
      this.ui.play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
    });
    this.audio.addEventListener('pause', () => {
      this.ui.play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    });
    this.audio.addEventListener('timeupdate', () => this._onTimeUpdate());
    this.audio.addEventListener('loadedmetadata', () => this._computeChunks());
    this.audio.addEventListener('ended', () => {
      if (this.currentIndex + 1 < this.chapters.length) {
        this.loadChapter(this.currentIndex + 1);
      }
    });
  }

  _computeChunks() {
    const ch = this.chapters[this.currentIndex];
    const chunks = ch[this.lang === 'fa' ? 'chunksFa' : 'chunksEn'];
    const dur = this.audio.duration || ch.duration;
    const totalWords = chunks.reduce((s, c) => s + c.split(/\s+/).length, 0);
    let acc = 0;
    this.chunks = chunks.map(c => {
      const w = c.split(/\s+/).length;
      const st = (acc / totalWords) * dur;
      acc += w;
      return { start: st, text: c };
    });
    this.currentChunk = -1;
  }

  _onTimeUpdate() {
    const dur = this.audio.duration || 0;
    const t = this.audio.currentTime || 0;
    this.ui.fill.style.width = dur ? ((t / dur) * 100) + '%' : '0%';
    this.ui.time.textContent = this._fmt(t) + ' / ' + this._fmt(dur);

    let idx = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      if (t >= this.chunks[i].start) idx = i;
      else break;
    }
    if (idx !== this.currentChunk) {
      this.currentChunk = idx;
      if (this.chunks[idx]) {
        this.ui.text.textContent = this.chunks[idx].text;
        this.ui.text.classList.toggle('rtl', this.lang === 'fa');
        this.ui.text.classList.toggle('ltr', this.lang === 'en');
      }
    }
  }

  _fmt(s) {
    if (!s || !isFinite(s)) return '0:00';
    return Math.floor(s / 60) + ':' + Math.floor(s % 60).toString().padStart(2, '0');
  }

  _renderMarkers() {
    const lbls = this.ui.labels, mkrs = this.ui.markers;
    lbls.innerHTML = '';
    mkrs.innerHTML = '';
    let acc = 0;
    const total = this.chapters.reduce((s, c) => s + c.duration, 0);
    this.chapters.forEach((ch, i) => {
      const pct = (acc / total) * 100;
      const l = document.createElement('div');
      l.className = 'ch-label';
      l.style.left = pct + '%';
      l.textContent = ch.n;
      if (i === this.currentIndex) l.classList.add('active');
      else if (!ch.built) l.classList.add('disabled');
      else if (i < this.currentIndex) l.classList.add('done');
      l.onclick = () => { if (ch.built) this.loadChapter(i); };
      lbls.appendChild(l);

      if (i > 0) {
        const m = document.createElement('div');
        m.className = 'ch-marker';
        m.style.left = pct + '%';
        if (i === this.currentIndex) m.classList.add('active');
        else if (!ch.built) m.classList.add('disabled');
        else if (i < this.currentIndex) m.classList.add('done');
        m.onclick = (e) => { e.stopPropagation(); if (ch.built) this.loadChapter(i); };
        mkrs.appendChild(m);
      }
      acc += ch.duration;
    });
  }

  async loadChapter(index) {
    const ch = this.chapters[index];
    if (!ch || !ch.built) return;

    // 🛡️ Bulletproof: hide ALL scene UIs before showing the new one.
    // This prevents cross-scene leakage regardless of exit() behavior.
    document.querySelectorAll('.scene-ui').forEach(el => el.classList.add('hidden'));

    if (this.scenes[this.currentIndex]) {
      try { await this.scenes[this.currentIndex].exit(); }
      catch (e) { console.warn('scene exit failed:', e); }
    }

    this.currentIndex = index;
    this.audio.src = ch[this.lang === 'fa' ? 'audioFa' : 'audioEn'];
    this.audio.load();
    this.chunks = [];
    this.currentChunk = -1;  // ← stale chunk from previous scene would fire chunk-gated triggers early

    if (this.scenes[index]) await this.scenes[index].enter(ch, this.lang);

    this._renderMarkers();
    this.audio.play().catch(() => {});
  }

  setLanguage(lang) {
    this.lang = lang;
    if (this.ctx) this.ctx.lang = lang;
    document.querySelectorAll('[data-lang]').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    const wasPlaying = !this.audio.paused;
    const ch = this.chapters[this.currentIndex];
    if (ch) {
      this.audio.src = ch[lang === 'fa' ? 'audioFa' : 'audioEn'];
      this.audio.load();
      if (wasPlaying) this.audio.play().catch(() => {});
    }
    if (this.scenes[this.currentIndex]) this.scenes[this.currentIndex].onLanguageChange(lang);
  }

  update(dt) {
    const scene = this.scenes[this.currentIndex];
    if (scene) {
      scene.update(dt, this.audio.currentTime, this.audio.duration, this.currentChunk);
    }
  }

  start(initialLang = 'fa') {
    this.setLanguage(initialLang);
    this.loadChapter(0);
  }
}
