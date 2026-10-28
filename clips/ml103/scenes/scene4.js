import { SceneBase } from '../../../player/scene-base.js?v=20261027-201954';
import { drawLossChart, updateTrainingHUD } from '../../../player/training.js?v=20261027-201954';

export class Scene4Training extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._t0 = 0;
    this._ease = 0;
    this._lossHistory = [];
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    const N = 80;
    this.N = N;
    this.positions = new Float32Array(N * 3);
    this.geom = new THREE.BufferGeometry();
    this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.lineMesh = new THREE.Line(this.geom, new THREE.LineBasicMaterial({ color: 0x7df9ff }));
    this.group.add(this.lineMesh);
    this._updateCurve();
  }
  _updateCurve() {
    for (let i = 0; i < this.N; i++) {
      const x = -4 + (i / (this.N - 1)) * 8;
      const y = (1 - Math.pow(1 - this._ease, 2)) * 2 * Math.sin(1.5 * x * this._ease);
      this.positions[i*3] = x;
      this.positions[i*3+1] = y;
      this.positions[i*3+2] = 0;
    }
    this.geom.attributes.position.needsUpdate = true;
  }
  _loss() {
    let s = 0;
    for (const p of this.shared.DATA) {
      const pred = (1 - Math.pow(1 - this._ease, 2)) * 2 * Math.sin(1.5 * p.x * this._ease);
      const d = p.y - pred;
      s += d * d;
    }
    return s / this.shared.DATA.length;
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this._ease = 0;
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
    const t = Math.max(0, Math.min(1, (this._t0 - 2) / 12));
    this._ease = t;
    this._updateCurve();
    if (t > 0 && t < 1) this._lossHistory.push({ t, v: this._loss() });
    const lossEl = document.querySelector('#ml-loss-hud .ml-val');
    const barEl = document.querySelector('#ml-progress .bar > div');
    const stepEl = document.querySelector('#ml-progress .t');
    updateTrainingHUD({ ease: this._ease, totalSteps: 1000, loss: this._loss(), lossEl, barEl, stepEl });
    drawLossChart(document.querySelector('#ml-loss-chart canvas'), this._lossHistory);
  }
}
