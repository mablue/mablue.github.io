import { SceneBase } from '../../../player/scene-base.js';
export class Scene2Model extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this.w = 0.4; this.b = 3.5;
    
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    this.lineMat = new THREE.MeshBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0 });
    this.lineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 8), this.lineMat);
    this.group.add(this.lineMesh);
    this._updateLine();
  }
  _updateLine() {
    const x1 = -4, y1 = this.w * x1 + this.b, x2 = 4, y2 = this.w * x2 + this.b;
    const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx*dx + dy*dy);
    this.lineMesh.position.set((x1+x2)/2, (y1+y2)/2, 0);
    this.lineMesh.scale.set(1, len, 1);
    this.lineMesh.rotation.z = Math.atan2(dy, dx) - Math.PI/2;
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0; this.w = 0.4; this.b = 3.5; this.lineMat.opacity = 0; this._updateLine();
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 1;
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 2.5, 16); ctl.target.set(0, 0, 0); }
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    this.lineMat.opacity = Math.min(1, this._t0 / 2);
    if (this._t0 > 3) {
      const w2 = this._t0 - 3;
      this.w = 0.4 + Math.sin(w2 * 1.2) * 0.5;
      this.b = 3.5 + Math.cos(w2 * 0.9) * 0.6;
      this._updateLine();
    }
    const cam = this.ctx.camera;
    if (cam) cam.position.lerp(new this.THREE.Vector3(0, 2, 14), 0.02);
  }
}
