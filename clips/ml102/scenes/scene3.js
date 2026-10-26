import { SceneBase } from '../../../player/scene-base.js';
export class Scene3Model extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this._build();
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
    this._w1 = 0.3; this._w2 = 0.8; this._b = -1.0;
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
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this._w1 = 0.3; this._w2 = 0.8; this._b = -1.0;
    this._updateCurve();
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 1;
    const p = document.getElementById('ml-params-hud'); if (p) p.classList.remove('hidden');
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 12); ctl.target.set(0, 0, 0); }
  }
  async exit() {
    const p = document.getElementById('ml-params-hud'); if (p) p.classList.add('hidden');
    await super.exit();
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    if (this._t0 > 2) {
      const t = this._t0 - 2;
      this._w1 = 0.3 + Math.sin(t * 0.8) * 0.4;
      this._w2 = 0.8 + Math.cos(t * 0.6) * 0.3;
      this._b = -1.0 + Math.sin(t * 0.5) * 0.6;
      this._updateCurve();
    }
    const w1El = document.querySelector('#ml-params-hud [data-k="w1"]');
    const w2El = document.querySelector('#ml-params-hud [data-k="w2"]');
    const bEl = document.querySelector('#ml-params-hud [data-k="b"]');
    if (w1El) w1El.textContent = this._w1.toFixed(2);
    if (w2El) w2El.textContent = this._w2.toFixed(2);
    if (bEl) bEl.textContent = this._b.toFixed(2);
  }
}
