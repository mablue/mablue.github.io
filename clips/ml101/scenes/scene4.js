import { SceneBase } from '../../../player/scene-base.js?v=20261027-201954';
import { updateLine, updateDrops } from '../../../player/visuals.js?v=20261027-201954';
import { drawLossChart, updateTrainingHUD } from '../../../player/training.js?v=20261027-201954';

export class Scene4Train extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._t0 = 0;
    this.w = 0.4;
    this.b = 3.5;
    this._lossHistory = [];
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    this.lineMat = new THREE.MeshBasicMaterial({ color: 0x7df9ff });
    this.lineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 8), this.lineMat);
    this.group.add(this.lineMesh);

    this.drops = [];
    const dropMat = new THREE.LineBasicMaterial({ color: 0xff8855, transparent: true, opacity: 0.5 });
    for (let i = 0; i < this.shared.DATA.length; i++) {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)
      ]);
      const line = new THREE.Line(geom, dropMat.clone());
      this.group.add(line);
      this.drops.push(line);
    }
    this._updateScene();
  }
  _updateScene() {
    updateLine(this.lineMesh, this.w, this.b, [-4, 4], 0);
    updateDrops(this.drops, this.shared.DATA, this.w, this.b, { THREE: this.THREE });
  }
  _loss() {
    let s = 0;
    for (const p of this.shared.DATA) {
      const d = p.y - (this.w * p.x + this.b);
      s += d * d;
    }
    return s / this.shared.DATA.length;
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this.w = 0.4;
    this.b = 3.5;
    this._lossHistory = [];
    this._updateScene();
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
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 2, 15); ctl.target.set(0, 0, 0); }
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
    const t = Math.max(0, Math.min(1, (this._t0 - 2.5) / 11.5));
    const ease = 1 - Math.pow(1 - t, 3);
    this.w = 0.4 + (this.shared.TRUE_W - 0.4) * ease;
    this.b = 3.5 + (this.shared.TRUE_B - 3.5) * ease;
    this._updateScene();
    if (t > 0 && t < 1) this._lossHistory.push({ t, v: this._loss() });
    const lossEl = document.querySelector('#ml-loss-hud .ml-val');
    const wEl = document.querySelector('#ml-params-hud [data-k="w"]');
    const bEl = document.querySelector('#ml-params-hud [data-k="b"]');
    if (wEl) wEl.textContent = this.w.toFixed(2);
    if (bEl) bEl.textContent = this.b.toFixed(2);
    const barEl = document.querySelector('#ml-progress .bar > div');
    const stepEl = document.querySelector('#ml-progress .t');
    updateTrainingHUD({ ease, totalSteps: 200, loss: this._loss(), lossEl, barEl, stepEl });
    drawLossChart(document.querySelector('#ml-loss-chart canvas'), this._lossHistory);
  }
}
