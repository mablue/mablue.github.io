import { SceneBase } from '../../../player/scene-base.js?v=20261028-202332';

export class Scene2Circle extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._t0 = 0;
    this._R = 1.5;
    this._sharp = 3;
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    // Heatmap plane
    const SIZE = 10, SEG = 24;
    this.heatGeom = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    this.heatColors = new Float32Array(this.heatGeom.attributes.position.count * 3);
    this.heatGeom.setAttribute('color', new THREE.BufferAttribute(this.heatColors, 3));
    this.heatMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false });
    this.heatMesh = new THREE.Mesh(this.heatGeom, this.heatMat);
    this.heatMesh.position.z = -0.5;
    this.group.add(this.heatMesh);

    // Boundary circle
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0.1));
    }
    this.boundaryGeom = new THREE.BufferGeometry().setFromPoints(pts);
    this.boundaryMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    this.boundary = new THREE.LineLoop(this.boundaryGeom, this.boundaryMat);
    this.group.add(this.boundary);
  }
  _updateHeat() {
    const pos = this.heatGeom.attributes.position.array;
    const c = this.heatColors;
    for (let i = 0; i < pos.length / 3; i++) {
      const x = pos[i*3], y = pos[i*3+1];
      const r = Math.sqrt(x*x + y*y);
      const logit = (r - this._R) * this._sharp;
      const p = 1 / (1 + Math.exp(-logit));
      // amber (class 0) → cyan (class 1)
      c[i*3]   = 0.91 * (1-p) + 0.49 * p;
      c[i*3+1] = 0.73 * (1-p) + 0.98 * p;
      c[i*3+2] = 0.42 * (1-p) + 1.00 * p;
    }
    this.heatGeom.attributes.color.needsUpdate = true;
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this._R = 1.5;
    this._sharp = 3;
    this.heatMat.opacity = 0;
    this.boundaryMat.opacity = 0;
    this.boundary.scale.set(1.5, 1.5, 1);
    this._updateHeat();
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 1;
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 14); ctl.target.set(0, 0, 0); }
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    const t = Math.min(1, this._t0 / 4);
    this.heatMat.opacity = t * 0.45;
    this.boundaryMat.opacity = Math.min(1, Math.max(0, (this._t0 - 1.5) / 1.5));
    const R = 1.5 + (2.5 - 1.5) * Math.min(1, this._t0 / 6);
    this._R = R;
    this.boundary.scale.set(R, R, 1);
    this._updateHeat();
    const cam = this.ctx.camera;
    if (cam) cam.position.lerp(new this.THREE.Vector3(0, 0, 11), 0.02);
  }
}
