import { SceneBase } from '../../../player/scene-base.js';

export class GalaxyScene extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this.stars = [];
    this.formation = 0;
    this.spinTimer = 0;
    this.spinActive = false;
    this.driftMode = false;
    this.galaxy = null;

    this._build();
  }

  _build() {
    const THREE = this.THREE;
    const G = this.shared;
    this.galaxy = new THREE.Points(G.galaxyGeom, G.galaxyMat);
    this.galaxy.scale.set(1, 1, 1);
    this.group.add(this.galaxy);

    // core glow
    const inner = new THREE.Sprite(new THREE.SpriteMaterial({
      map: G.glowTex,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: 0.55
    }));
    inner.scale.set(G.R_CORE * 5, G.R_CORE * 5, 1);
    this.group.add(inner);

    const outer = new THREE.Sprite(new THREE.SpriteMaterial({
      map: G.glowTexOuter,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: 0.4
    }));
    outer.scale.set(G.R_CORE * 9, G.R_CORE * 9, 1);
    this.group.add(outer);

    // stars data — reference the shared geometry's attributes
    const stars = this.stars;
    const pos = G.galaxyGeom.attributes.position.array;
    for (let i = 0; i < G.STAR_COUNT; i++) {
      const idx = i * 3;
      const x = pos[idx], y = pos[idx+1], z = pos[idx+2];
      if (i < G.BULGE_COUNT) {
        stars.push({ type: 'bulge', radius: Math.sqrt(x*x+z*z), theta: Math.atan2(z,x), rot: 0, omega: 0.18+Math.random()*0.06, y, drift:0, driftVel:0, thetaJitter:0, thetaJitterVel:0 });
      } else {
        const r = Math.sqrt(x*x+z*z);
        const armTheta = Math.atan2(z, x);
        stars.push({ type: 'disk', radius: r, armTheta, turb: 0, rot: 0, omega: 0.55/r, y, drift:0, driftVel:0, thetaJitter:0, thetaJitterVel:0 });
      }
    }
  }

  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this.formation = 0;
    this.spinTimer = 0;
    this.spinActive = true;
    this.driftMode = false;
    for (const s of this.stars) { s.drift = 0; s.driftVel = 0; s.thetaJitter = 0; s.thetaJitterVel = 0; }
  }

  update(dt, audioTime, audioDuration, currentChunk) {
    if (!this.group.visible) return;
    const THREE = this.THREE;
    const G = this.shared;

    if (this.spinActive) {
      this.spinTimer += dt;
      const t = Math.min(this.spinTimer / 3.5, 1.0);
      this.formation = 1.0 - Math.pow(1.0 - t, 3.0);
      if (this.spinTimer >= 3.5) { this.spinActive = false; this.formation = 1.0; }
    }

    const shouldDrift = audioTime >= 11.0 && audioTime < 19.5;
    if (shouldDrift !== this.driftMode) this.driftMode = shouldDrift;

    const posArr = G.galaxyGeom.attributes.position.array;
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.rot += s.omega * dt;
      const idx = i * 3;
      if (this.driftMode) {
        const rn = Math.min(s.radius / G.GALAXY_R, 1.0);
        s.driftVel += Math.pow(rn, 2.0) * 25.0 * dt;
        s.drift += s.driftVel * dt;
        const cs = Math.pow(rn, 1.5) * 3.0;
        s.thetaJitterVel += (Math.random() - 0.5) * cs * 4.0 * dt;
        s.thetaJitterVel *= 0.995;
        s.thetaJitter += s.thetaJitterVel * dt;
      } else {
        s.driftVel += -s.drift * 4.0 * dt;
        s.driftVel *= Math.exp(-2.5 * dt);
        s.drift += s.driftVel * dt;
        s.thetaJitterVel += -s.thetaJitter * 4.0 * dt;
        s.thetaJitterVel *= Math.exp(-3.0 * dt);
        s.thetaJitter += s.thetaJitterVel * dt;
        if (Math.abs(s.drift) < 0.02) s.drift = 0;
        if (Math.abs(s.driftVel) < 0.02) s.driftVel = 0;
        if (Math.abs(s.thetaJitter) < 0.005) s.thetaJitter = 0;
        if (Math.abs(s.thetaJitterVel) < 0.005) s.thetaJitterVel = 0;
      }
      const ct = s.type === 'disk' ? s.turb * (1 - this.formation) : 0;
      const th = (s.type === 'bulge' ? s.theta : s.armTheta + ct) + s.rot + s.thetaJitter;
      const r = s.radius + s.drift;
      posArr[idx] = r * Math.cos(th);
      posArr[idx+1] = s.y;
      posArr[idx+2] = r * Math.sin(th);
    }
    G.galaxyGeom.attributes.position.needsUpdate = true;
  }
}
