import { SceneBase } from '../../../player/scene-base.js';
export class Scene2Hidden extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this._build();
  }
  _build() {
    const THREE = this.THREE;
    this.nodes = []; this.lines = [];
    const layerX = [-3.5, 0, 3.5];
    const layerCounts = [1, 8, 1];
    for (let L = 0; L < 3; L++) {
      const nodes = [];
      const n = layerCounts[L];
      for (let i = 0; i < n; i++) {
        const y = (i - (n - 1) / 2) * (L === 1 ? 0.55 : 0);
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 12, 12),
          new THREE.MeshBasicMaterial({ color: L === 1 ? 0x7df9ff : 0xe8b96a, transparent: true, opacity: 0 })
        );
        node.position.set(layerX[L], y, 0);
        this.group.add(node);
        nodes.push(node);
      }
      this.nodes.push(nodes);
    }
    for (let L = 0; L < 2; L++) {
      for (const a of this.nodes[L]) {
        for (const b of this.nodes[L + 1]) {
          const g = new THREE.BufferGeometry().setFromPoints([a.position, b.position]);
          const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x3a3a4a, transparent: true, opacity: 0 }));
          this.group.add(line);
          this.lines.push(line);
        }
      }
    }
  }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    for (const layer of this.nodes) for (const n of layer) n.material.opacity = 0;
    for (const l of this.lines) l.material.opacity = 0;
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 10); ctl.target.set(0, 0, 0); }
  }
  update(dt) {
    if (!this.group.visible) return;
    this._t0 += dt;
    for (let L = 0; L < 3; L++) {
      const start = [0, 1.8, 3.6][L];
      const p = Math.max(0, Math.min(1, (this._t0 - start) / 0.8));
      for (const n of this.nodes[L]) n.material.opacity = p;
    }
    const lp = Math.max(0, Math.min(1, (this._t0 - 5) / 1.5));
    for (const l of this.lines) l.material.opacity = lp * 0.5;
    if (this._t0 > 7) {
      const pulse = 0.5 + Math.sin((this._t0 - 7) * 2.5) * 0.5;
      for (let i = 0; i < this.nodes[1].length; i++) {
        const v = 0.4 + 0.6 * Math.abs(Math.sin(i * 1.5 + this._t0 * 2));
        this.nodes[1][i].material.opacity = v * pulse;
      }
    }
  }
}
