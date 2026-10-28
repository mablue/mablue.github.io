import { SceneBase } from '../../../player/scene-base.js?v=20261028-202332';
import { updateCurvePositions } from '../../../player/visuals.js?v=20261028-202332';
import { drawLossChart, updateTrainingHUD } from '../../../player/training.js?v=20261028-202332';

export class Scene4Training extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._t0 = 0;
    this._lossHistory = [];
    this._w1 = 0; this._w2 = 0; this._b = 0;
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
    updateCurvePositions(this.positions, this._w1, this._w2, this._b, [-4, 4]);
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
    const t = Math.max(0, Math.min(1, (this._t0 - 2) / 12));
    const ease = 1 - Math.pow(1 - t, 3);
    this._w1 = this.shared.TRUE_W1 * ease;
    this._w2 = this.shared.TRUE_W2 * ease;
    this._b = this.shared.TRUE_B * ease;
    this._updateCurve();
    if (t > 0 && t < 1) this._lossHistory.push({ t, v: this._loss() });
    const lossEl = document.querySelector('#ml-loss-hud .ml-val');
    const w1El = document.querySelector('#ml-params-hud [data-k="w1"]');
    const w2El = document.querySelector('#ml-params-hud [data-k="w2"]');
    const bEl = document.querySelector('#ml-params-hud [data-k="b"]');
    if (w1El) w1El.textContent = this._w1.toFixed(2);
    if (w2El) w2El.textContent = this._w2.toFixed(2);
    if (bEl) bEl.textContent = this._b.toFixed(2);
    const barEl = document.querySelector('#ml-progress .bar > div');
    const stepEl = document.querySelector('#ml-progress .t');
    updateTrainingHUD({ ease, totalSteps: 400, loss: this._loss(), lossEl, barEl, stepEl });
    drawLossChart(document.querySelector('#ml-loss-chart canvas'), this._lossHistory);
  }
}
