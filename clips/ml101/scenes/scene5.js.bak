import { SceneBase } from '../../../player/scene-base.js';
export class Scene5Result extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this._lastChunk = -1; this._chapter = null;
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
  _buildCode(chapter) {
    const pre = document.querySelector('#ml-code pre');
    if (!pre || !chapter || !chapter.code || !chapter.code.lines) return;
    pre.innerHTML = chapter.code.lines.map((line, i) =>
      '<span class="code-line" data-line="' + i + '">' + (line || ' ') + '</span>'
    ).join('');
  }
  _applyChunk(chunk) {
    if (chunk === this._lastChunk) return;
    this._lastChunk = chunk;
    const ch = this._chapter;
    if (!ch || !ch.code || !ch.code.highlights) return;
    const range = ch.code.highlights[chunk];
    const lines = document.querySelectorAll('.code-line');
    if (!range) {
      lines.forEach(el => el.classList.remove('highlight', 'dimmed'));
      return;
    }
    const start = range[0], end = range[1];
    lines.forEach(el => {
      const n = parseInt(el.dataset.line, 10);
      const inRange = n >= start && n <= end;
      el.classList.toggle('highlight', inRange);
      el.classList.toggle('dimmed', !inRange);
    });
    const container = document.getElementById('ml-code');
    if (!container) return;
    const firstLine = container.querySelector('[data-line="' + start + '"]');
    if (firstLine) {
      const targetScroll = firstLine.offsetTop - container.clientHeight / 2 + firstLine.offsetHeight / 2;
      container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  }
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
    this._buildCode(chapter);
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
    this._applyChunk(chunk);
    const cam = this.ctx.camera;
    if (cam && this._t0 < 8) cam.position.lerp(new this.THREE.Vector3(0, 3, 15), 0.02);
  }
}
