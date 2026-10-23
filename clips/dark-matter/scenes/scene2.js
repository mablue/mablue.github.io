import { SceneBase } from '../../../player/scene-base.js';

export class RotationCurveScene extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this.ui = null;
    this.canvas = null;
    this.chartCtx = null;
    this.probeR = 2.5;
    this._build();
  }

  _build() {
    const THREE = this.THREE;
    const G = this.shared;

    // Galaxy
    this.galaxy = new THREE.Points(G.galaxyGeom, G.galaxyMat);
    this.group.add(this.galaxy);

    // Core glow
    const inner = new THREE.Sprite(new THREE.SpriteMaterial({
      map: G.glowTex, transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, depthTest: false, opacity: 0.55
    }));
    inner.scale.set(G.R_CORE * 5, G.R_CORE * 5, 1);
    this.group.add(inner);

    // Orbit lines
    this.orbitLines = [];
    for (let r = 4; r <= 12; r += 4) {
      const pts = [];
      for (let a = 0; a <= 360; a += 4) {
        const rad = a * Math.PI / 180;
        pts.push(new THREE.Vector3(r * Math.cos(rad), 0, r * Math.sin(rad)));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0.06 });
      const line = new THREE.Line(geom, mat);
      this.group.add(line);
      this.orbitLines.push(line);
    }

    // Probe ring
    this.probeRing = new THREE.Group();
    const ringMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.0, 128),
      new THREE.MeshBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    ringMesh.rotation.x = -Math.PI / 2;
    this.probeRing.add(ringMesh);
    this.probeRing.position.y = 0.05;
    this.group.add(this.probeRing);

    // Dot
    this.dotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0x7df9ff })
    );
    this.dotMesh.visible = true;
    this.group.add(this.dotMesh);

    // Arrow
    this.arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0.1, 0),
      2, 0x7df9ff, 0.7, 0.35
    );
    this.group.add(this.arrowHelper);
  }

  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this.ui = document.getElementById('chart-2');
    this.ui.classList.remove('hidden');
    this.canvas = this.ui.querySelector('canvas');
    this.chartCtx = this.canvas.getContext('2d');
    this.probeR = 2.5;
    this._updateProbe(0);
    setTimeout(() => this._draw(), 100);
  }

  async exit() {
    await super.exit();
    if (this.ui) this.ui.classList.add('hidden');
  }

  _updateProbe(t) {
    const THREE = this.THREE;
    const DURATION = 10.0;
    const R0 = 2.5, R1 = 15;
    const p = Math.min(t / DURATION, 1);
    this.probeR = R0 + (R1 - R0) * p;

    this.probeRing.scale.set(this.probeR, 1, this.probeR);
    this.dotMesh.position.set(0, 0.1, this.probeR);

    const vo = this.probeR < 2.5 ? this.probeR / 2.5 : 1.0;
    const arrowLen = Math.max(0.8, vo * 2.5);
    this.arrowHelper.position.set(0, 0.1, this.probeR);
    this.arrowHelper.setDirection(new THREE.Vector3(1, 0, 0));
    this.arrowHelper.setLength(arrowLen, 0.7, 0.35);
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

    // Axes
    ctx.strokeStyle = 'rgba(240,236,228,0.2)';
    ctx.beginPath();
    ctx.moveTo(pl,pt); ctx.lineTo(pl,pt+ph); ctx.lineTo(pl+pw,pt+ph);
    ctx.stroke();

    // Kepler (dashed)
    ctx.strokeStyle = 'rgba(232,185,106,0.8)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,4]);
    ctx.beginPath();
    for (let rr=0.5; rr<=20; rr+=0.5) {
      const v = rr < 2.5 ? (rr/2.5) : Math.sqrt(2.5/rr);
      const px = pl+(rr/20)*pw, py = pt+ph-(v/1.2)*ph;
      if (rr===0.5) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Rubin (solid flat)
    ctx.strokeStyle = '#7df9ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let rr=0.5; rr<=20; rr+=0.5) {
      const v = rr < 2.5 ? (rr/2.5) : 1.0;
      const px = pl+(rr/20)*pw, py = pt+ph-(v/1.2)*ph;
      if (rr===0.5) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Probe marker on chart
    const prR = this.probeR;
    const prV = prR < 2.5 ? (prR/2.5) : 1.0;
    const prX = pl + (Math.min(prR, 20)/20) * pw;
    const prY = pt+ph - (prV/1.2) * ph;
    if (prR <= 20) {
      ctx.fillStyle = '#7df9ff';
      ctx.beginPath();
      ctx.arc(prX, prY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(125,249,255,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(prX, prY, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(dt, time, duration) {
    if (!this.group.visible) return;
    const t = time || 0;
    this._updateProbe(t);
    this.galaxy.rotation.y += dt * 0.1;
    this._draw();
  }
}
