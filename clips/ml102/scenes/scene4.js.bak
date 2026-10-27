import { SceneBase } from '../../../player/scene-base.js';
export class Scene4Training extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this._lossHistory = [];
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    const N = 80;
    this.N = N;
    this.positions = new Float32Array(N * 3);
    this.lineMat = new THREE.LineBasicMaterial({ color: 0x7df9ff });
    this.geom = new THREE.BufferGeometry();
    this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.lineMesh = new THREE.Line(this.geom, this.lineMat);
    this.group.add(this.lineMesh);
    this._w1 = 0; this._w2 = 0; this._b = 0;
    this._updateCurve();
  }
  _updateCurve() {
    for (let i = 0; i < this.N; i++) {
      const x = -4 + (i / (this.N - 1)) * 8;
      const y = this._w1 * x + this._w2 * x * x + this._b;
      this.positions[i*3] = x;
      this.positions[i*3+1] = y;
      this.positions[i*3+2] = 0;
    }
    this.geom.attributes.position.needsUpdate = true;
  }
  _loss() {
    let s = 0;
    for (const p of this.shared.DATA) {
      const d = p.y - (this._w1 * p.x + this._w2 * p.x * p.x + this._b);
      s += d * d;
    }
    return s / this.shared.DATA.length;
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this._w1 = 0; this._w2 = 0; this._b = 0;
    this._lossHistory = [];
    this._updateCurve();
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 1;
    for (const id of ['ml-loss-hud', 'ml-loss-chart', 'ml-progress', 'ml-params-hud']) {
      const el = document.getElementById(id); if (el) el.classList.remove('hidden');
    }
    const sub = document.getElementById('ml-loss-sub');
    if (sub) {
      const map = { az: 'kiçik = yaxşı', fa: 'کمتر = بهتر', en: 'smaller = better' };
      sub.textContent = map[lang] || map.en;
    }
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 12); ctl.target.set(0, 0, 0); }
  }
  async exit() {
    for (const id of ['ml-loss-chart', 'ml-progress']) {
      const el = document.getElementById(id); if (el) el.classList.add('hidden');
    }
    await super.exit();
  }
  onLanguageChange(lang) {
    const sub = document.getElementById('ml-loss-sub');
    if (sub) {
      const map = { az: 'kiçik = yaxşı', fa: 'کمتر = بهتر', en: 'smaller = better' };
      sub.textContent = map[lang] || map.en;
    }
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    const trainStart = 2, trainEnd = 14;
    const t = Math.max(0, Math.min(1, (this._t0 - trainStart) / (trainEnd - trainStart)));
    const ease = 1 - Math.pow(1 - t, 3);
    this._w1 = 0 + (this.shared.TRUE_W1 - 0) * ease;
    this._w2 = 0 + (this.shared.TRUE_W2 - 0) * ease;
    this._b = 0 + (this.shared.TRUE_B - 0) * ease;
    this._updateCurve();
    if (t > 0 && t < 1) {
      this._lossHistory.push({ t, v: this._loss() });
    }
    const lossEl = document.querySelector('#ml-loss-hud .ml-val');
    if (lossEl) lossEl.textContent = this._loss().toFixed(2);
    const w1El = document.querySelector('#ml-params-hud [data-k="w1"]');
    const w2El = document.querySelector('#ml-params-hud [data-k="w2"]');
    const bEl = document.querySelector('#ml-params-hud [data-k="b"]');
    if (w1El) w1El.textContent = this._w1.toFixed(2);
    if (w2El) w2El.textContent = this._w2.toFixed(2);
    if (bEl) bEl.textContent = this._b.toFixed(2);
    const barEl = document.querySelector('#ml-progress .bar > div');
    const tEl = document.querySelector('#ml-progress .t');
    if (barEl) barEl.style.width = (ease * 100).toFixed(0) + '%';
    if (tEl) tEl.textContent = 'step ' + Math.round(ease * 400) + ' / 400';
    this._drawLossChart();
  }
  _drawLossChart() {
    const canvas = document.querySelector('#ml-loss-chart canvas');
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w*dpr) { canvas.width = w*dpr; canvas.height = h*dpr; }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0, 0, w, h);
    if (this._lossHistory.length < 2) return;
    let maxV = 0;
    for (const p of this._lossHistory) if (p.v > maxV) maxV = p.v;
    maxV = maxV || 1;
    ctx.strokeStyle = '#7df9ff'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < this._lossHistory.length; i++) {
      const p = this._lossHistory[i];
      const x = p.t * w;
      const y = h - (p.v / maxV) * (h - 6) - 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(232,185,106,0.9)';
    ctx.font = '9px JetBrains Mono';
    ctx.fillText('LOSS', 4, 10);
  }
}
