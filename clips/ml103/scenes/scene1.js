import { SceneBase } from '../../../player/scene-base.js';
export class Scene1Hard extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this._build();
  }
  _build() {
    const THREE = this.THREE;
    this.lineMat = new THREE.LineBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0 });
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const x = -4 + (i / 60) * 8;
      pts.push(new THREE.Vector3(x, 0, 0));
    }
    this.lineMesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.lineMat);
    this.group.add(this.lineMesh);
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this.lineMat.opacity = 0;
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 0;
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 14); ctl.target.set(0, 0, 0); }
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    const n = this.shared.dotMeshes.length;
    for (let i = 0; i < n; i++) {
      const delay = (i / n) * 2.5;
      const p = Math.max(0, Math.min(1, (this._t0 - delay) / 0.6));
      this.shared.dotMeshes[i].material.opacity = p;
    }
    if (this._t0 > 6) this.lineMat.opacity = Math.min(1, (this._t0 - 6) / 2);
    const cam = this.ctx.camera;
    if (cam) cam.position.lerp(new this.THREE.Vector3(0, 0, 12), 0.02);
  }
}
