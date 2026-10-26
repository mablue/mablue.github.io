import { SceneBase } from '../../../player/scene-base.js';
export class Scene3Relu extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this._build();
  }
  _build() {
    const THREE = this.THREE;
    const N = 60;
    this.positions = new Float32Array(N * 3);
    this.geom = new THREE.BufferGeometry();
    this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.lineMesh = new THREE.Line(this.geom, new THREE.LineBasicMaterial({ color: 0x7df9ff }));
    this.group.add(this.lineMesh);
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this.shared.pointsGroup.visible = false;
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 12); ctl.target.set(0, 0, 0); }
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    const p = Math.min(1, this._t0 / 2);
    for (let i = 0; i < this.positions.length / 3; i++) {
      const x = -4 + (i / (this.positions.length / 3 - 1)) * 8;
      this.positions[i*3] = x;
      this.positions[i*3+1] = Math.max(0, x * 0.7) * p;
      this.positions[i*3+2] = 0;
    }
    this.geom.attributes.position.needsUpdate = true;
  }
}
