import { SceneBase } from '../../../player/scene-base.js';

export class MondScene extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this.canvas = null;
    this.chartCtx = null;
    this.lastChunk = -1;
    this._build();
  }

  _build() {
    const THREE = this.THREE;
    const G = this.shared;
    this.haloGroup = new THREE.Group();
    this.smallGalaxy = new THREE.Points(G.galaxyGeom, G.galaxyMat);
    this.smallGalaxy.scale.set(0.3, 0.3, 0.3);
    this.haloGroup.add(this.smallGalaxy);
    this.haloPoints = new THREE.Points(G.haloGeom, G.galaxyMat);
    this.haloGroup.add(this.haloPoints);
    this.group.add(this.haloGroup);
  }

  async enter(chapter, lang) {
    await super.enter(chapter, lang);

    // Show this scene's UIs
    this.ui = document.getElementById('scene-6-ui');
    if (this.ui) this.ui.classList.remove('hidden');
    const chart = document.getElementById('chart-6');
    if (chart) chart.classList.remove('hidden');

    // Reset
    ['mond-card-newton', 'mond-card-mond'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('show');
    });
    ['mond-step-1', 'mond-step-2', 'mond-step-3', 'mond-step-4'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('show');
    });
    const cap = document.getElementById('mond-caption');
    if (cap) cap.textContent = '';
    this.lastChunk = -1;

    if (chart) {
      this.canvas = chart.querySelector('canvas');
      this.chartCtx = this.canvas.getContext('2d');
      setTimeout(() => this._draw(), 100);
    }
  }

  async exit() {
    await super.exit();
    if (this.ui) this.ui.classList.add('hidden');
    const chart = document.getElementById('chart-6');
    if (chart) chart.classList.add('hidden');
  }

  _resize() {
    if (!this.canvas) return;
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = r.width * dpr;
    this.canvas.height = r.height * dpr;
    this.chartCtx.setTransform(1,0,0,1,0,0);
    this.chartCtx.scale(dpr, dpr);
  }

  _draw() {
    if (!this.chartCtx) return;
    this._resize();
    const r = this.canvas.getBoundingClientRect();
    const W = r.width, H = r.height;
    const ctx = this.chartCtx;
    ctx.clearRect(0, 0, W, H);
    const pl=25, pr=10, pt=10, pb=20, pw=W-pl-pr, ph=H-pt-pb;

    ctx.strokeStyle = 'rgba(240,236,228,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pl,pt); ctx.lineTo(pl,pt+ph); ctx.lineTo(pl+pw,pt+ph);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(232,185,106,0.8)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,4]);
    ctx.beginPath();
    for (let rr=0.5; rr<=20; rr+=0.5) {
      const v = rr < 2.5 ? (rr/2.5) : Math.sqrt(2.5/rr);
      const px = pl+(rr/20)*pw, py = pt+ph-(v/1.2)*ph;
      if (rr===0.5) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#7df9ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let rr=0.5; rr<=20; rr+=0.5) {
      const v = rr < 2.5 ? (rr/2.5) : 1.0;
      const px = pl+(rr/20)*pw, py = pt+ph-(v/1.2)*ph;
      if (rr===0.5) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(125,249,255,.9)';
    ctx.font = 'italic 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('flat — no dark matter', pl + pw * 0.65, pt + ph * 0.6);
  }

  _show(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
  }

  _setVisible(ids) {
    const all = [
      'mond-card-newton', 'mond-card-mond',
      'mond-step-1', 'mond-step-2', 'mond-step-3', 'mond-step-4'
    ];
    for (const id of all) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.toggle('show', ids.includes(id));
    }
  }

  _applyChunk(chunk, lang) {
    if (chunk === this.lastChunk) return;
    this.lastChunk = chunk;

    const cap = document.getElementById('mond-caption');
    if (!cap) return;

    if (chunk <= 1) {
      this._setVisible([]);
      cap.textContent = lang === 'fa'
        ? 'ماده تاریک تنها توضیح نیست...'
        : 'Dark matter is not the only explanation...';
    } else if (chunk === 2) {
      this._setVisible(['mond-card-newton']);
      cap.textContent = lang === 'fa'
        ? 'منحنی چرخش: ماده تاریک آن را صاف نگه می‌دارد'
        : 'Rotation curve: dark matter keeps it flat';
    } else if (chunk === 3) {
      this._setVisible(['mond-card-newton', 'mond-card-mond', 'mond-step-1']);
      cap.textContent = lang === 'fa'
        ? 'اما ماند با تغییر گرانش، دقیقاً همان منحنی صاف را می‌دهد'
        : 'But MOND tweaks gravity to get the exact same flat curve';
    } else if (chunk === 4) {
      this._setVisible([
        'mond-card-newton', 'mond-card-mond',
        'mond-step-1', 'mond-step-2'
      ]);
      cap.textContent = lang === 'fa'
        ? 'در شتاب‌های خیلی کم، گرانش قوی‌تر از پیش‌بینی نیوتن می‌شود'
        : 'At very low accelerations, gravity gets stronger than Newton predicted';
    } else if (chunk === 5) {
      this._setVisible([
        'mond-card-newton', 'mond-card-mond',
        'mond-step-1', 'mond-step-2', 'mond-step-3', 'mond-step-4'
      ]);
      cap.textContent = lang === 'fa'
        ? 'نتیجه: سرعت مداری ثابت می‌ماند — بدون نیاز به جرم گمشده'
        : 'Result: orbital speed stays constant — no missing mass needed';
    } else {
      this._setVisible([
        'mond-card-newton', 'mond-card-mond',
        'mond-step-1', 'mond-step-2', 'mond-step-3', 'mond-step-4'
      ]);
      cap.textContent = lang === 'fa'
        ? 'دهه‌هاست که ماده تاریک برنده شده، اما بحث تمام نشده...'
        : 'For decades, dark matter has won — but the debate is not over...';
    }
  }

  update(dt, time, duration, currentChunk) {
    if (!this.group.visible) return;
    this.haloGroup.rotation.y += dt * 0.1;
    this.smallGalaxy.rotation.y += dt * 0.5;
    this._applyChunk(currentChunk, this.ctx.lang);
    this._draw();
  }

  onLanguageChange(lang) {
    this.lastChunk = -1;
  }
}
