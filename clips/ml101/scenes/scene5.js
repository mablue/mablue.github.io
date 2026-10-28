import { SceneBase } from '../../../player/scene-base.js?v=20261028-202332';
import { buildCodeUI, applyCodeChunk } from '../../../player/walkthrough.js?v=20261028-202332';
import { updateLine } from '../../../player/visuals.js?v=20261028-202332';
import { langText } from '../../../player/i18n.js?v=20261028-202332';

export class Scene5Result extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._t0 = 0;
    this._lastChunk = -1;
    this._chapter = null;
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    this.lineMat = new THREE.MeshBasicMaterial({ color: 0x7df9ff });
    this.lineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1, 8), this.lineMat);
    this.group.add(this.lineMesh);
    updateLine(this.lineMesh, this.shared.TRUE_W, this.shared.TRUE_B, [-4, 4], 0);
  }
  _pre() { return document.querySelector('#ml-code pre'); }
  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this._t0 = 0;
    this._chapter = chapter;
    this._lastChunk = -1;
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
    buildCodeUI(this._pre(), chapter.code && chapter.code.lines);
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 3, 17); ctl.target.set(0, 0, 0); }
  }
  async exit() {
    for (const id of ['ml-params-hud', 'ml-code']) {
      const el = document.getElementById(id); if (el) el.classList.add('hidden');
    }
    this._lastChunk = -1;
    this._chapter = null;
    await super.exit();
  }
  onLanguageChange(lang) { this._lastChunk = -1; }
  update(dt, time, duration, chunk) {
    if (!this.group.visible) return;
    this._t0 += dt;
    if (chunk !== this._lastChunk) {
      this._lastChunk = chunk;
      applyCodeChunk(this._pre(), this._chapter, chunk);
    }
    const cam = this.ctx.camera;
    if (cam && this._t0 < 8) cam.position.lerp(new this.THREE.Vector3(0, 3, 15), 0.02);
  }
}
