import { SceneBase } from '../../../player/scene-base.js';
export class Scene5Result extends SceneBase {
  constructor(ctx, shared) {
    super(ctx); this.THREE = ctx.THREE; this.shared = shared;
    this._t0 = 0; this._lastChunk = -1; this._chapter = null;
    this._build();
  }
  _build() {
    const THREE = this.THREE;
    const N = 80;
    this.positions = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const x = -4 + (i / (N - 1)) * 8;
      this.positions[i*3] = x;
      this.positions[i*3+1] = 2 * Math.sin(1.5 * x);
      this.positions[i*3+2] = 0;
    }
    this.geom = new THREE.BufferGeometry();
    this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.lineMesh = new THREE.Line(this.geom, new THREE.LineBasicMaterial({ color: 0x7df9ff }));
    this.group.add(this.lineMesh);
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
    const p = document.getElementById('ml-params-hud'); if (p) p.classList.remove('hidden');
    const c = document.getElementById('ml-code'); if (c) c.classList.remove('hidden');
    this._buildCode(chapter);
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 12); ctl.target.set(0, 0, 0); }
  }
  async exit() {
    for (const id of ['ml-params-hud', 'ml-code']) {
      const el = document.getElementById(id); if (el) el.classList.add('hidden');
    }
    this._lastChunk = -1;
    this._chapter = null;
    await super.exit();
  }
  onLanguageChange(lang) {
    this._lastChunk = -1;
  }
  update(dt, time, duration, chunk) {
    if (!this.group.visible) return;
    this._t0 += dt;
    this._applyChunk(chunk);
    const cam = this.ctx.camera;
    if (cam && this._t0 < 8) cam.position.lerp(new this.THREE.Vector3(0, 0, 10), 0.02);
  }
}
