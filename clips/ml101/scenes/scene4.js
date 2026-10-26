import { SceneBase } from '../../../player/scene-base.js';
export class Scene4Train extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this.w = 0.4; this.b = 3.5; this._lossHistory = [];
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    this.lineMat = new THREE.MeshBasicMaterial({ color: 0x7df9ff });
    this.lineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 8), this.lineMat);
    this.group.add(this.lineMesh);
    this.drops = [];
    const dropMat = new THREE.LineBasicMaterial({ color: 0xff8855, transparent: true, opacity: 0.5 });
    for (let i = 0; i < this.shared.DATA.length; i++) {
      const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
      const line = new THREE.Line(geom, dropMat.clone());
      this.group.add(line);
      this.drops.push(line);
    }
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
  _loss() {
    let s = 0;
    for (const p of this.shared.DATA) { const d = p.y - (this.w * p.x + this.b); s += d*d; }
    return s / this.shared.DATA.length;
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0; this.w = 0.4; this.b = 3.5; this._lossHistory = [];
    this._updateLine(); this._updateDrops();
    this.shared.pointsGroup.visible = true;
    for (const m of this.shared.dotMeshes) m.material.opacity = 1;
    for (const id of ['ml-loss-hud', 'ml-loss-chart', 'ml-progress', 'ml-params-hud']) {
      const el = document.getElementById(id); if (el) el.classList.remove('hidden');
    }
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 2, 15); ctl.target.set(0, 0, 0); }
  }
  async exit() {
    for (const id of ['ml-loss-chart', 'ml-progress']) {
      const el = document.getElementById(id); if (el) el.classList.add('hidden');
    }
    await super.exit();
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    const trainStart = 2.5, trainEnd = 14;
    const t = Math.max(0, Math.min(1, (this._t0 - trainStart) / (trainEnd - trainStart)));
    const ease = 1 - Math.pow(1 - t, 3);
    this.w = 0.4 + (this.shared.TRUE_W - 0.4) * ease;
    this.b = 3.5 + (this.shared.TRUE_B - 3.5) * ease;
    this._updateLine(); this._updateDrops();
    if (t > 0 && t < 1) {
      this._lossHistory.push({ t, v: this._loss() });
      if (this._lossHistory.length > 200) this._lossHistory.shift();
    }
    const lossEl = document.querySelector('#ml-loss-hud .ml-val');
    if (lossEl) lossEl.textContent = this._loss().toFixed(2);
    const wEl = document.querySelector('#ml-params-hud [data-k="w"]');
    const bEl = document.querySelector('#ml-params-hud [data-k="b"]');
    if (wEl) wEl.textContent = this.w.toFixed(2);
    if (bEl) bEl.textContent = this.b.toFixed(2);
    const barEl = document.querySelector('#ml-progress .bar > div');
    const tEl = document.querySelector('#ml-progress .t');
    if (barEl) barEl.style.width = (ease * 100).toFixed(0) + '%';
    if (tEl) tEl.textContent = 'step ' + Math.round(ease * 200) + ' / 200';
    this._drawLossChart();
  }
  _drawLossChart() {
    const canvas = document.querySelector('#ml-loss-chart canvas');
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w*dpr) { canvas.width = w*dpr; canvas.height = h*dpr; }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0, 0, w, h);
    if (this._lossHistory.length < 2) return;
    const maxV = Math.max(...this._lossHistory.map(p => p.v)) || 1;
    ctx.strokeStyle = '#7df9ff'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < this._lossHistory.length; i++) {
      const p = this._lossHistory[i];
      const x = p.t * w, y = h - (p.v / maxV) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(232,185,106,0.9)'; ctx.font = '9px JetBrains Mono';
    ctx.fillText('LOSS', 4, 10);
  }
}
