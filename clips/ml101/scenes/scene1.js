import { SceneBase } from '../../../player/scene-base.js';
export class Scene1Data extends SceneBase {
  constructor(ctx, shared) { super(ctx); this.THREE = ctx.THREE; this.shared = shared; this._t0 = 0; }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 0;
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 2.5, 18); ctl.target.set(0, 0, 0); }
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
    const cam = this.ctx.camera;
    if (cam) cam.position.lerp(new this.THREE.Vector3(0, 2.5, 16), 0.03);
  }
}
