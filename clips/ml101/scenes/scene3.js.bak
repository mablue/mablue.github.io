import { SceneBase } from '../../../player/scene-base.js';
export class Scene3Loss extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this.w = 0.4; this.b = 3.5;
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    this.lineMat = new THREE.MeshBasicMaterial({ color: 0x7df9ff });
    this.lineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 8), this.lineMat);
    this.group.add(this.lineMesh);
    this.drops = [];
    const dropMat = new THREE.LineBasicMaterial({ color: 0xff8855, transparent: true, opacity: 0 });
    for (let i = 0; i < this.shared.DATA.length; i++) {
      const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
      const line = new THREE.Line(geom, dropMat.clone());
      this.group.add(line);
      this.drops.push(line);
    }
    this._updateLine();
  }
  _updateLine() {
    const x1 = -4, y1 = this.w * x1 + this.b, x2 = 4, y2 = this.w * x2 + this.b;
    const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx*dx + dy*dy);
    this.lineMesh.position.set((x1+x2)/2, (y1+y2)/2, 0);
    this.lineMesh.scale.set(1, len, 1);
    this.lineMesh.rotation.z = Math.atan2(dy, dx) - Math.PI/2;
  }
  _updateDrops() {
    const THREE = this.THREE;
    for (let i = 0; i < this.shared.DATA.length; i++) {
      const p = this.shared.DATA[i];
      const modelY = this.w * p.x + this.b;
      this.drops[i].geometry.setFromPoints([new THREE.Vector3(p.x, p.y, p.z), new THREE.Vector3(p.x, modelY, 0)]);
    }
  }
  _computeLoss() {
    let s = 0;
    for (const p of this.shared.DATA) { const d = p.y - (this.w * p.x + this.b); s += d*d; }
    return s / this.shared.DATA.length;
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0; this.w = 0.4; this.b = 3.5;
    this._updateLine(); this._updateDrops();
    for (const d of this.drops) d.material.opacity = 0;
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 1;
    const hud = document.getElementById('ml-loss-hud');
    if (hud) hud.classList.remove('hidden');
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 2, 14); ctl.target.set(0, 0, 0); }
  }
  async exit() {
    const hud = document.getElementById('ml-loss-hud');
    if (hud) hud.classList.add('hidden');
    await super.exit();
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    if (this._t0 > 2) {
      const w2 = this._t0 - 2;
      this.w = 0.4 + Math.sin(w2 * 0.8) * 0.7;
      this.b = 3.5 + Math.cos(w2 * 0.6) * 1.2;
      this._updateLine(); this._updateDrops();
    }
    const dropFade = Math.max(0, Math.min(1, (this._t0 - 3) / 2));
    for (const d of this.drops) d.material.opacity = dropFade;
    const el = document.querySelector('#ml-loss-hud .ml-val');
    if (el) el.textContent = this._computeLoss().toFixed(2);
  }
}
