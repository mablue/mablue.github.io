import { SceneBase } from '../../../player/scene-base.js';

export class DarkHaloScene extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this.canvas = null;
    this.chartCtx = null;
    this._build();
  }

  _build() {
    const THREE = this.THREE;
    const G = this.shared;
    this.haloGroup = new THREE.Group();
    this.smallGalaxy = new THREE.Points(G.galaxyGeom, G.galaxyMat);
    this.smallGalaxy.scale.set(0.3, 0.3, 0.3);
    this.haloGroup.add(this.smallGalaxy);

    this.haloPoints = new THREE.Points(G.haloGeom, G.galaxyMat);
    this.haloGroup.add(this.haloPoints);
    this.group.add(this.haloGroup);
  }

  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this.ui = document.getElementById('chart-4');
    this.ui.classList.remove('hidden');
    this.canvas = this.ui.querySelector('canvas');
    this.chartCtx = this.canvas.getContext('2d');
    setTimeout(() => this._draw(), 100);
  }

  async exit() {
    await super.exit();
    if (this.ui) this.ui.classList.add('hidden');
  }

  _resize() {
    if (!this.canvas) return;
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = r.width * dpr;
    this.canvas.height = r.height * dpr;
    this.chartCtx.setTransform(1,0,0,1,0,0);
    this.chartCtx.scale(dpr, dpr);
  }

  _draw() {
    if (!this.chartCtx) return;
    this._resize();
    const r = this.canvas.getBoundingClientRect();
    const W = r.width, H = r.height;
    const ctx = this.chartCtx;
    ctx.clearRect(0, 0, W, H);
    const pl=25, pr=10, pt=10, pb=20, pw=W-pl-pr, ph=H-pt-pb;
    ctx.strokeStyle = 'rgba(240,236,228,0.2)';
    ctx.beginPath();
    ctx.moveTo(pl,pt); ctx.lineTo(pl,pt+ph); ctx.lineTo(pl+pw,pt+ph);
    ctx.stroke();

    ctx.strokeStyle = '#7df9ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let rr=0.5; rr<=20; rr+=0.5) {
      const x = rr/5;
      const rho = 1.0/(x*Math.pow(1+x,2));
      const val = Math.min(rho, 1.0);
      const px = pl+(rr/20)*pw, py = pt+ph-(val/1.0)*ph;
      if (rr===0.5) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();
  }

  update(dt, time, duration) {
    if (!this.group.visible) return;
    this.haloGroup.rotation.y += dt * 0.1;
    this.smallGalaxy.rotation.y += dt * 0.5;
    this._draw();
  }
}
