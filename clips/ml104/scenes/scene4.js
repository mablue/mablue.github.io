import { SceneBase } from '../../../player/scene-base.js?v=20261028-204517';
import { drawLossChart, updateTrainingHUD } from '../../../player/training.js?v=20261028-204517';

export class Scene4Training extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._t0 = 0;
    this._R = 1.5;
    this._sharp = 3;
    this._lossHistory = [];
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    const SIZE = 10, SEG = 24;
    this.heatGeom = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    this.heatColors = new Float32Array(this.heatGeom.attributes.position.count * 3);
    this.heatGeom.setAttribute('color', new THREE.BufferAttribute(this.heatColors, 3));
    this.heatMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6, depthWrite: false });
    this.heatMesh = new THREE.Mesh(this.heatGeom, this.heatMat);
    this.heatMesh.position.z = -0.5;
    this.group.add(this.heatMesh);

    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0.1));
    }
    this.boundaryGeom = new THREE.BufferGeometry().setFromPoints(pts);
    this.boundaryMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    this.boundary = new THREE.LineLoop(this.boundaryGeom, this.boundaryMat);
    this.group.add(this.boundary);
  }
  _updateHeat() {
    const pos = this.heatGeom.attributes.position.array;
    const c = this.heatColors;
    for (let i = 0; i < pos.length / 3; i++) {
      const x = pos[i*3], y = pos[i*3+1];
      const r = Math.sqrt(x*x + y*y);
      const logit = (r - this._R) * this._sharp;
      const p = 1 / (1 + Math.exp(-logit));
      c[i*3]   = 0.91 * (1-p) + 0.49 * p;
      c[i*3+1] = 0.73 * (1-p) + 0.98 * p;
      c[i*3+2] = 0.42 * (1-p) + 1.00 * p;
    }
    this.heatGeom.attributes.color.needsUpdate = true;
  }
  _loss() {
    let s = 0;
    for (const p of this.shared.DATA) {
      const r = Math.sqrt(p.x*p.x + p.y*p.y);
      const logit = (r - this._R) * this._sharp;
      const phat = 1 / (1 + Math.exp(-logit));
      const y = p.cls;
      s += -(y * Math.log(phat + 1e-7) + (1 - y) * Math.log(1 - phat + 1e-7));
    }
    return s / this.shared.DATA.length;
  }
  _accuracy() {
    let c = 0;
    for (const p of this.shared.DATA) {
      const r = Math.sqrt(p.x*p.x + p.y*p.y);
      const pred = r < this._R ? 0 : 1;
      if (pred === p.cls) c++;
    }
    return c / this.shared.DATA.length;
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this._R = 1.5;
    this._sharp = 3;
    this._lossHistory = [];
    this._updateHeat();
    this.boundary.scale.set(1.5, 1.5, 1);
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
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 11); ctl.target.set(0, 0, 0); }
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
    const t = Math.max(0, Math.min(1, (this._t0 - 2) / 14));
    const ease = 1 - Math.pow(1 - t, 3);
    this._R = 1.5 + (this.shared.TARGET_R - 1.5) * ease;
    this._sharp = 3 + 5 * ease;
    this.boundary.scale.set(this._R, this._R, 1);
    this._updateHeat();
    if (t > 0 && t < 1) this._lossHistory.push({ t, v: this._loss() });
    const lossEl = document.querySelector('#ml-loss-hud .ml-val');
    const rEl = document.querySelector('#ml-params-hud [data-k="R"]');
    const aEl = document.querySelector('#ml-params-hud [data-k="acc"]');
    if (rEl) rEl.textContent = this._R.toFixed(2);
    if (aEl) aEl.textContent = (this._accuracy() * 100).toFixed(0) + '%';
    const barEl = document.querySelector('#ml-progress .bar > div');
    const stepEl = document.querySelector('#ml-progress .t');
    updateTrainingHUD({ ease, totalSteps: 500, loss: this._loss(), lossEl, barEl, stepEl });
    drawLossChart(document.querySelector('#ml-loss-chart canvas'), this._lossHistory);
  }
}
