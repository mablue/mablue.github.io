import { SceneBase } from '../../../player/scene-base.js';

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export class PlanetScene extends SceneBase {
  constructor(ctx, shared, chapterCfg) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this.cfg = chapterCfg;
    this._build();
  }

  _build() {
    const THREE = this.THREE;
    const cfg = this.cfg;

    // Background stars
    const N = 900;
    const sPos = new Float32Array(N * 3);
    const sCol = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 80 + Math.random() * 250;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      sPos[i*3]   = r * Math.sin(ph) * Math.cos(th);
      sPos[i*3+1] = r * Math.cos(ph);
      sPos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
      const c = Math.random();
      if (c < 0.5) { sCol[i*3]=0.85; sCol[i*3+1]=0.9; sCol[i*3+2]=1; }
      else { sCol[i*3]=1; sCol[i*3+1]=1; sCol[i*3+2]=1; }
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3));
    this.stars = new THREE.Points(sGeo, new THREE.PointsMaterial({
      size: 1.4, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true
    }));
    this.group.add(this.stars);

    // Sun (either at origin for Sun chapter, or as light source far away)
    const sunPos = cfg.isSun ? [0, 0, 0] : (cfg.sunPos || [-25, 8, -15]);
    const sunRadius = cfg.isSun ? cfg.planet.radius : 1.2;

    this.sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(sunRadius, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffcc44 })
    );
    this.sunMesh.position.set(sunPos[0], sunPos[1], sunPos[2]);
    this.group.add(this.sunMesh);

    // Sun glow sprite
    const glowTex = this._makeGlowTexture();
    this.sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, opacity: 0.85
    }));
    this.sunGlow.scale.set(sunRadius * 8, sunRadius * 8, 1);
    this.sunGlow.position.copy(this.sunMesh.position);
    this.group.add(this.sunGlow);

    // Point light at sun
    this.sunLight = new THREE.PointLight(0xffeedd, 3, 0, 1);
    this.sunLight.position.copy(this.sunMesh.position);
    this.group.add(this.sunLight);

    // Ambient
    this.ambient = new THREE.AmbientLight(0x303040, 1.2);
    this.group.add(this.ambient);

    // Planet (skip if this IS the sun chapter)
    this.planetMesh = null;
    this.planetRing = null;
    if (!cfg.isSun) {
      const p = cfg.planet;
      this.planetMesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.radius, 48, 48),
        new THREE.MeshStandardMaterial({
          color: p.color, roughness: 0.8, metalness: 0.1,
          emissive: p.color, emissiveIntensity: 0.08
        })
      );
      this.group.add(this.planetMesh);

      // Subtle atmosphere halo
      this.planetGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex,
        color: p.color,
        transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, opacity: 0.18
      }));
      this.planetGlow.scale.set(p.radius * 4, p.radius * 4, 1);
      this.group.add(this.planetGlow);

      // Rings (Saturn)
      if (p.ring) {
        this.planetRing = new THREE.Mesh(
          new THREE.RingGeometry(p.radius * 1.4, p.radius * 2.2, 64),
          new THREE.MeshBasicMaterial({
            color: 0xe0c97a, side: THREE.DoubleSide, transparent: true, opacity: 0.65
          })
        );
        this.planetRing.rotation.x = Math.PI / 2.4;
        this.planetMesh.add(this.planetRing);
      }

      // Generic axial tilt (Saturn 26.7°, Uranus 98°)
      if (p.tilt) {
        this.planetMesh.rotation.z = p.tilt * Math.PI / 180;
      }
    }
  }

  _makeGlowTexture() {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    g.addColorStop(0, 'rgba(255,250,235,1)');
    g.addColorStop(0.15, 'rgba(255,225,180,0.85)');
    g.addColorStop(0.4, 'rgba(255,180,100,0.35)');
    g.addColorStop(0.7, 'rgba(255,140,70,0.08)');
    g.addColorStop(1, 'rgba(255,100,50,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new this.THREE.CanvasTexture(c);
  }

  _getCameraTarget(t, dur) {
    const THREE = this.THREE;
    const cfg = this.cfg;
    const path = cfg.cameraPath || [{ p: 0, r: 10, y: 3 }, { p: 1, r: 6, y: 2 }];
    const p = Math.max(0, Math.min(1, t / dur));

    let kA = path[0], kB = path[path.length - 1];
    for (let i = 0; i < path.length - 1; i++) {
      if (p >= path[i].p && p <= path[i+1].p) { kA = path[i]; kB = path[i+1]; break; }
    }
    const k = kB.p > kA.p ? smoothstep(kA.p, kB.p, p) : 0;
    const r = kA.r + (kB.r - kA.r) * k;
    const y = kA.y + (kB.y - kA.y) * k;

    const drift = cfg.drift || 0.12;
    const angle = t * drift;

    return [
      new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r),
      new THREE.Vector3(0, 0, 0)
    ];
  }

  async enter(chapter, lang) {
    await super.enter(chapter, lang);

    // Reset rotations
    if (this.planetMesh) {
      this.planetMesh.rotation.y = 0;
    }
    this.group.position.set(0, 0, 0);

    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) {
      ctl.autoRotate = false;
      const dur = chapter?.duration || this.cfg.duration || 15;
      const [pos, look] = this._getCameraTarget(0, dur);
      cam.position.copy(pos);
      ctl.target.copy(look);
    }
  }

  update(dt, time, duration, chunk) {
    if (!this.group.visible) return;
    const t = time || 0;
    const dur = duration || this.cfg.duration || 15;

    // Camera
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) {
      ctl.autoRotate = false;
      const [pos, look] = this._getCameraTarget(t, dur);
      cam.position.lerp(pos, 0.06);
      ctl.target.lerp(look, 0.06);
    }

    // Sun rotation + pulse
    this.sunMesh.rotation.y += dt * 0.15;
    const pulse = 0.75 + Math.sin(t * 1.8) * 0.12;
    this.sunGlow.material.opacity = pulse;

    // Planet rotation
    if (this.planetMesh) {
      this.planetMesh.rotation.y += dt * 0.4;
    }
  }

  onLanguageChange(lang) {
    // nothing to reset
  }
}
