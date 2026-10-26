import { SceneBase } from '../../../player/scene-base.js';
export class Scene5Result extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared; this._t0 = 0;
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    this.lineMat = new THREE.MeshBasicMaterial({ color: 0x7df9ff });
    this.lineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1, 8), this.lineMat);
    this.group.add(this.lineMesh);
    const x1 = -4, y1 = this.shared.TRUE_W * x1 + this.shared.TRUE_B;
    const x2 = 4, y2 = this.shared.TRUE_W * x2 + this.shared.TRUE_B;
    const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx*dx + dy*dy);
    this.lineMesh.position.set((x1+x2)/2, (y1+y2)/2, 0);
    this.lineMesh.scale.set(1, len, 1);
    this.lineMesh.rotation.z = Math.atan2(dy, dx) - Math.PI/2;
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 1;
    const hud = document.getElementById('ml-params-hud');
    if (hud) {
      hud.classList.remove('hidden');
      const wEl = hud.querySelector('[data-k="w"]');
      const bEl = hud.querySelector('[data-k="b"]');
      if (wEl) wEl.textContent = this.shared.TRUE_W.toFixed(2);
      if (bEl) bEl.textContent = this.shared.TRUE_B.toFixed(2);
    }
    const code = document.getElementById('ml-code');
    if (code) code.classList.remove('hidden');
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 3, 17); ctl.target.set(0, 0, 0); }
  }
  async exit() {
    for (const id of ['ml-params-hud', 'ml-code']) {
      const el = document.getElementById(id); if (el) el.classList.add('hidden');
    }
    await super.exit();
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    const cam = this.ctx.camera;
    if (cam && this._t0 < 8) cam.position.lerp(new this.THREE.Vector3(0, 3, 15), 0.02);
  }
}
