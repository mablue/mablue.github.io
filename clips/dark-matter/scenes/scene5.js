import { SceneBase } from '../../../player/scene-base.js';

export class NfwEquationScene extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this.canvas = null;
    this.chartCtx = null;
    this.targetMorph = 0;
    this.lastChunk = -1;
    this.volumeSphere = null;
    this.rsRing = null;
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

    // Volume sphere
    this.volumeSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0x7df9ff, wireframe: true, transparent: true, opacity: 0, depthWrite: false })
    );
    this.volumeSphere.visible = false;
    this.haloGroup.add(this.volumeSphere);

    // rs ring
    this.rsRing = new THREE.Mesh(
      new THREE.RingGeometry(7.9, 8.0, 64),
      new THREE.MeshBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    this.rsRing.rotation.x = -Math.PI / 2;
    this.haloGroup.add(this.rsRing);

    this.group.add(this.haloGroup);
  }

  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this.ui = document.getElementById('scene-5-ui');
    this.ui.classList.remove('hidden');
    this.canvas = this.ui.querySelector('canvas');
    this.chartCtx = this.canvas.getContext('2d');

    // Reset state
    this.targetMorph = 0;
    this.lastChunk = -1;
    this.volumeSphere.visible = false;
    this.rsRing.material.opacity = 0;
    ['eq-rho','eq-equals','eq-fraction','eq-part-inner','eq-part-outer'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.opacity = '0';
    });
    const cap = document.getElementById('eq-caption');
    if (cap) cap.textContent = '';

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
    const pl=30, pr=10, pt=10, pb=20, pw=W-pl-pr, ph=H-pt-pb;
    ctx.strokeStyle = 'rgba(240,236,228,0.2)';
    ctx.beginPath();
    ctx.moveTo(pl,pt); ctx.lineTo(pl,pt+ph); ctx.lineTo(pl+pw,pt+ph);
    ctx.stroke();

    ctx.strokeStyle = '#7df9ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let rr=0.5; rr<=20; rr+=0.5) {
      let val=0;
      if (this.targetMorph===0) val=0.5;
      else if (this.targetMorph===1) val=1.0/rr;
      else if (this.targetMorph===2) val=1.0/(rr*rr*rr);
      else val=Math.min(1.0/((rr/5)*Math.pow(1+rr/5,2)),1.0);
      if (val>1.0) val=1.0;
      const px=pl+(rr/20)*pw, py=pt+ph-(val/1.0)*ph;
      if (rr===0.5) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();
  }

  _applyChunk(chunk, lang) {
    if (chunk === this.lastChunk) return;
    this.lastChunk = chunk;
    const show = (id) => { const el = document.getElementById(id); if (el) el.style.opacity = '1'; };
    const hide = (id) => { const el = document.getElementById(id); if (el) el.style.opacity = '0'; };
    const hl = (id) => { const el = document.getElementById(id); if (el) el.classList.add('highlight-eq'); };
    const unhl = (id) => { const el = document.getElementById(id); if (el) el.classList.remove('highlight-eq'); };
    ['eq-rho','eq-rho0','eq-r','eq-rs','eq-r2','eq-rs2'].forEach(id => unhl(id));
    const cap = document.getElementById('eq-caption');
    if (!cap) return;

    if (chunk === 0) cap.textContent = lang === 'fa' ? 'بیایید از صفر شروع کنیم...' : 'Let us start from zero...';
    else if (chunk === 1) { cap.textContent = lang === 'fa' ? 'چگالی = جرم / حجم' : 'Density = Mass / Volume'; show('eq-rho'); show('eq-equals'); }
    else if (chunk === 2) { cap.textContent = lang === 'fa' ? 'ابر یکدست' : 'Uniform cloud'; this.targetMorph = 0; this._draw(); }
    else if (chunk === 3) { cap.textContent = lang === 'fa' ? 'نزدیک مرکز متراکم' : 'Dense core'; show('eq-fraction'); }
    else if (chunk === 4) { cap.textContent = lang === 'fa' ? 'افت درونی: ۱/r' : 'Inner drop: 1/r'; show('eq-part-inner'); hl('eq-r'); hl('eq-rs'); this.targetMorph = 1; this._draw(); }
    else if (chunk === 5) { cap.textContent = lang === 'fa' ? 'افت بیرونی: ۱/r³' : 'Outer drop: 1/r³'; show('eq-part-outer'); unhl('eq-r'); unhl('eq-rs'); hl('eq-r2'); hl('eq-rs2'); this.targetMorph = 2; this._draw(); this.volumeSphere.visible = true; this.volumeSphere.material.opacity = 0.8; }
    else if (chunk === 6) { cap.textContent = lang === 'fa' ? 'ترکیب دو افت' : 'Combine both'; this.volumeSphere.visible = false; unhl('eq-r2'); unhl('eq-rs2'); hl('eq-part-inner'); hl('eq-part-outer'); }
    else if (chunk === 7) { cap.textContent = lang === 'fa' ? 'کسر دقیق' : 'Exact fraction'; unhl('eq-part-inner'); unhl('eq-part-outer'); hl('eq-fraction'); this.targetMorph = 3; this._draw(); }
    else if (chunk === 8) { cap.textContent = lang === 'fa' ? 'شعاع مقیاس (rs)' : 'Scale radius (rs)'; unhl('eq-fraction'); hl('eq-rho0'); hl('eq-rs'); hl('eq-rs2'); this.rsRing.material.opacity = 0.5; }
    else if (chunk >= 9) { cap.textContent = lang === 'fa' ? 'پروفایل NFW' : 'NFW profile'; unhl('eq-rho0'); unhl('eq-rs'); unhl('eq-rs2'); }
  }

  update(dt, time, duration, currentChunk) {
    if (!this.group.visible) return;
    this.haloGroup.rotation.y += dt * 0.1;
    this.smallGalaxy.rotation.y += dt * 0.5;
    this._applyChunk(currentChunk, this.ctx.lang);
    if (this.volumeSphere.visible) {
      if (this.volumeSphere.scale.x < 12) {
        this.volumeSphere.scale.x += dt * 3;
        this.volumeSphere.scale.y += dt * 3;
        this.volumeSphere.scale.z += dt * 3;
        this.volumeSphere.material.opacity = Math.min(this.volumeSphere.material.opacity + dt, 0.3);
      }
      this.volumeSphere.rotation.x += dt * 0.2;
      this.volumeSphere.rotation.y += dt * 0.3;
    }
    if (this.rsRing.material.opacity > 0) {
      this.rsRing.material.opacity = 0.5 + Math.sin(Date.now()/1000 * 3) * 0.3;
    }
    this._draw();
  }

  onLanguageChange(lang) {
    this.lastChunk = -1;
  }
}
