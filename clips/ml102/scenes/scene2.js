import { SceneBase } from '../../../player/scene-base.js?v=20261028-195119';
import { updateCurvePositions } from '../../../player/visuals.js?v=20261028-195119';

export class Scene2AddX2 extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._t0 = 0;
    this._w1 = 2.0; this._w2 = 0.0; this._b = 0.5;
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    const N = 80;
    this.N = N;
    this.positions = new Float32Array(N * 3);
    this.geom = new THREE.BufferGeometry();
    this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.lineMesh = new THREE.Line(this.geom, new THREE.LineBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0.9 }));
    this.group.add(this.lineMesh);
    this._update();
  }
  _update() {
    updateCurvePositions(this.positions, this._w1, this._w2, this._b, [-4, 4]);
    this.geom.attributes.position.needsUpdate = true;
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this._w1 = 2.0; this._w2 = 0.0; this._b = 0.5;
    this._update();
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
      this._update();
    }
  }
}
