import { SceneBase } from '../../../player/scene-base.js';
export class Scene2AddX2 extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this._build();
  }
  _build() {
    const THREE = this.THREE;
    const N = 80;
    this.N = N;
    this.positions = new Float32Array(N * 3);
    this.lineMat = new THREE.LineBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0.9 });
    this.geom = new THREE.BufferGeometry();
    this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.lineMesh = new THREE.Line(this.geom, this.lineMat);
    this.group.add(this.lineMesh);
    this._w1 = 2.0; this._w2 = 0.0; this._b = 0.5;
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
    this._w1 = 2.0; this._w2 = 0.0; this._b = 0.5;
    this._updateCurve();
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 1;
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 12); ctl.target.set(0, 0, 0); }
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    if (this._t0 > 3 && this._t0 < 9) {
      const t = (this._t0 - 3) / 6;
      const ease = 1 - Math.pow(1 - t, 3);
      this._w1 = 2.0 * (1 - ease) + 0.0 * ease;
      this._w2 = 0.0 * (1 - ease) + 0.5 * ease;
      this._b = 0.5 + (this.shared.TRUE_B - 0.5) * ease;
      this._updateCurve();
    }
  }
}
