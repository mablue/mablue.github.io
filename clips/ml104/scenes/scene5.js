import { SceneBase } from '../../../player/scene-base.js?v=20261028-202332';
import { buildCodeUI, applyCodeChunk } from '../../../player/walkthrough.js?v=20261028-202332';

export class Scene5Result extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._t0 = 0;
    this._lastChunk = -1;
    this._chapter = null;
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    const SIZE = 10, SEG = 24;
    this.heatGeom = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    this.heatColors = new Float32Array(this.heatGeom.attributes.position.count * 3);
    this.heatGeom.setAttribute('color', new THREE.BufferAttribute(this.heatColors, 3));
    this.heatMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false });
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
    this.boundary.scale.set(this.shared.TARGET_R, this.shared.TARGET_R, 1);
    this.group.add(this.boundary);
    this._updateHeat();
  }
  _updateHeat() {
    const pos = this.heatGeom.attributes.position.array;
    const c = this.heatColors;
    const R = this.shared.TARGET_R;
    for (let i = 0; i < pos.length / 3; i++) {
      const x = pos[i*3], y = pos[i*3+1];
      const r = Math.sqrt(x*x + y*y);
      const logit = (r - R) * 8;
      const p = 1 / (1 + Math.exp(-logit));
      c[i*3]   = 0.91 * (1-p) + 0.49 * p;
      c[i*3+1] = 0.73 * (1-p) + 0.98 * p;
      c[i*3+2] = 0.42 * (1-p) + 1.00 * p;
    }
    this.heatGeom.attributes.color.needsUpdate = true;
  }
  _pre() { return document.querySelector('#ml-code pre'); }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this._chapter = chapter;
    this._lastChunk = -1;
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 1;
    const p = document.getElementById('ml-params-hud');
    if (p) {
      p.classList.remove('hidden');
      const rEl = p.querySelector('[data-k="R"]');
      const aEl = p.querySelector('[data-k="acc"]');
      if (rEl) rEl.textContent = this.shared.TARGET_R.toFixed(2);
      if (aEl) aEl.textContent = '95%';
    }
    const code = document.getElementById('ml-code');
    if (code) code.classList.remove('hidden');
    buildCodeUI(this._pre(), chapter.code && chapter.code.lines);
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 11); ctl.target.set(0, 0, 0); }
  }
  async exit() {
    for (const id of ['ml-params-hud', 'ml-code']) {
      const el = document.getElementById(id); if (el) el.classList.add('hidden');
    }
    this._lastChunk = -1;
    this._chapter = null;
    await super.exit();
  }
  onLanguageChange(lang) { this._lastChunk = -1; }
  update(dt, time, duration, chunk) {
    if (!this.group.visible) return;
    this._t0 += dt;
    if (chunk !== this._lastChunk) {
      this._lastChunk = chunk;
      applyCodeChunk(this._pre(), this._chapter, chunk);
    }
    const cam = this.ctx.camera;
    if (cam && this._t0 < 8) cam.position.lerp(new this.THREE.Vector3(0, 0, 10), 0.02);
  }
}
