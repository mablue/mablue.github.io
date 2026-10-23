export class SceneBase {
  constructor(ctx) {
    this.ctx = ctx;
    this.group = new ctx.THREE.Group();
    this.ctx.scene.add(this.group);
    this.group.visible = false;
  }
  async enter(chapter, lang) { this.group.visible = true; }
  async exit() { this.group.visible = false; }
  update(dt, time, duration, chunk) {}
  onLanguageChange(lang) {}
}
