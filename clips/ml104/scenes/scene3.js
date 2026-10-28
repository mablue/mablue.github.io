import { SceneBase } from '../../../player/scene-base.js?v=20261027-201954';

export class Scene3Sigmoid extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._t0 = 0;
    this._R = 2.5;
    this._sharp = 3;
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    const SIZE = 10, SEG = 24;
    this.heatGeom = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    this.heatColors = new Float32Array(this.heatGeom.attributes.position.count * 3);
    this.heatGeom.setAttribute('color', new THREE.BufferAttribute(this.heatColors, 3));
    this.heatMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false });
    this.heatMesh = new THREE.Mesh(this.heatGeom, this.heatMat);
    this.heatMesh.position.z = -0.5;
    this.group.add(this.heatMesh);

    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0.1));
    }
    this.boundaryGeom = new THREE.BufferGeometry().setFromPoints(pts);
    this.boundaryMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    this.boundary = new THREE.LineLoop(this.boundaryGeom, this.boundaryMat);
    this.boundary.scale.set(2.5, 2.5, 1);
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
      c[i*3]   = 0.91 * (1-p) + 0.49 * p;
      c[i*3+1] = 0.73 * (1-p) + 0.98 * p;
      c[i*3+2] = 0.42 * (1-p) + 1.00 * p;
    }
    this.heatGeom.attributes.color.needsUpdate = true;
  }
  _drawSigmoid() {
    const canvas = document.querySelector('#ml-sigmoid-hud canvas');
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0) return;
    if (canvas.width !== Math.floor(w*dpr)) { canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr); }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0, 0, w, h);
    // axes
    ctx.strokeStyle = 'rgba(240,236,228,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h*0.9); ctx.lineTo(w, h*0.9);
    ctx.moveTo(0, 0); ctx.lineTo(0, h*0.9);
    ctx.stroke();
    // sigmoid p(r)
    ctx.strokeStyle = '#7df9ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const rMax = 6;
    for (let px = 0; px <= w; px++) {
      const r = (px / w) * rMax;
      const p = 1 / (1 + Math.exp(-(r - this._R) * this._sharp));
      const py = h*0.9 - p * (h*0.85);
      if (px === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // boundary marker (R)
    const rPx = (this._R / rMax) * w;
    ctx.strokeStyle = 'rgba(232,185,106,0.7)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(rPx, 0); ctx.lineTo(rPx, h*0.9);
    ctx.stroke();
    ctx.setLineDash([]);
    // label
    ctx.fillStyle = 'rgba(232,185,106,0.9)';
    ctx.font = '8px JetBrains Mono';
    ctx.fillText('R=' + this._R.toFixed(1), rPx + 3, 10);
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this._R = 2.5;
    this._sharp = 3;
    this._updateHeat();
    this._drawSigmoid();
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 1;
    const hud = document.getElementById('ml-sigmoid-hud');
    if (hud) hud.classList.remove('hidden');
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 11); ctl.target.set(0, 0, 0); }
  }
  async exit() {
    const hud = document.getElementById('ml-sigmoid-hud');
    if (hud) hud.classList.add('hidden');
    await super.exit();
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    this._sharp = 3 + Math.min(5, this._t0 / 2);
    this._updateHeat();
    this._drawSigmoid();
  }
}
