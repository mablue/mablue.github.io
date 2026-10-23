import { SceneBase } from '../../../player/scene-base.js';

const CHOREO = [
  { p: 0.00, r: 26, y: 8,  lookY: 0 },
  { p: 0.15, r: 24, y: 7,  lookY: 0 },
  { p: 0.28, r: 16, y: 4,  lookY: 0 },
  { p: 0.45, r: 13, y: 2,  lookY: 0.3 },
  { p: 0.62, r: 10, y: 1,  lookY: 0.6 },
  { p: 0.72, r: 11, y: 1,  lookY: 0.4 },
  { p: 0.88, r: 20, y: 7,  lookY: 0 },
  { p: 1.00, r: 38, y: 18, lookY: 0 }
];

const FLASH_CHUNK = 5;
const PERSON_CHUNK = 6;
const SILENCE_CHUNK = 7;

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export class HuntersScene extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;

    this._flashed = false;
    this._silenced = false;
    this._flashTriggerT = -1;
    this._shakeUntilT = -1;
    this._afterglowT = -1;
    this._shakeDuration = 1.2;
    this._scaleRevealed = false;

    this.flashMesh = null;
    this.afterglowMesh = null;
    this.shockwaveRing = null;
    this.tankMesh = null;
    this.innerMesh = null;
    this.pmtPoints = null;
    this.pmtMat = null;
    this.streaks = [];
    this.personGroup = null;
    this.scaleSprite = null;
    this.envGroup = null;

    this.burstGeom = null;
    this.burstMat = null;
    this.burstVel = null;
    this.burstLife = null;
    this.burstCount = 600;
    this.burstOrigin = null;

    this.ui = null;
    this.lastChunk = -1;

    this._build();
  }

  _build() {
    const THREE = this.THREE;

    // ── Tank ──
    this.tankMesh = new THREE.Mesh(
      new THREE.SphereGeometry(5, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x1a3a5a, wireframe: true, transparent: true,
        opacity: 0.18, side: THREE.DoubleSide
      })
    );
    this.group.add(this.tankMesh);

    // ── Inner backdrop ──
    this.innerMesh = new THREE.Mesh(
      new THREE.SphereGeometry(4.85, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x05060a, transparent: true, opacity: 0.85, side: THREE.BackSide })
    );
    this.group.add(this.innerMesh);

    // ── PMTs ──
    const pmtCount = 800;
    const pmtPos = new Float32Array(pmtCount * 3);
    const pmtSizes = new Float32Array(pmtCount);
    const pmtPhases = new Float32Array(pmtCount);
    const pmtSpeeds = new Float32Array(pmtCount);
    const pmtColors = new Float32Array(pmtCount * 3);
    for (let i = 0; i < pmtCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / pmtCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 4.78;
      pmtPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pmtPos[i*3+1] = r * Math.cos(phi);
      pmtPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
      pmtSizes[i]   = 1.4 + Math.random() * 1.6;
      pmtPhases[i]  = Math.random() * Math.PI * 2;
      pmtSpeeds[i]  = 0.3 + Math.random() * 0.7;
      pmtColors[i*3]   = 0.3;
      pmtColors[i*3+1] = 0.65;
      pmtColors[i*3+2] = 1.0;
    }
    const pmtGeom = new THREE.BufferGeometry();
    pmtGeom.setAttribute('position', new THREE.BufferAttribute(pmtPos, 3));
    pmtGeom.setAttribute('aSize', new THREE.BufferAttribute(pmtSizes, 1));
    pmtGeom.setAttribute('aPhase', new THREE.BufferAttribute(pmtPhases, 1));
    pmtGeom.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(pmtSpeeds, 1));
    pmtGeom.setAttribute('aColor', new THREE.BufferAttribute(pmtColors, 3));

    const galaxyMat = this.shared.galaxyMat;
    this.pmtMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: galaxyMat.uniforms.uPixelRatio,
        uSizeScale: { value: 3.5 }
      },
      vertexShader: galaxyMat.vertexShader,
      fragmentShader: galaxyMat.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.pmtPoints = new THREE.Points(pmtGeom, this.pmtMat);
    this.group.add(this.pmtPoints);

    // ── Flash sphere ──
    this.flashMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffee88, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    this.group.add(this.flashMesh);

    // ── Afterglow ──
    this.afterglowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 20, 20),
      new THREE.MeshBasicMaterial({
        color: 0xffcc66, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    this.group.add(this.afterglowMesh);

    // ── Shockwave ring ──
    this.shockwaveRing = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.05, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffdd88, transparent: true, opacity: 0,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    this.shockwaveRing.rotation.x = -Math.PI / 2;
    this.shockwaveRing.visible = false;
    this.group.add(this.shockwaveRing);

    // ── Particle burst ──
    this._buildBurst();

    // ── Environment ──
    this._buildEnvironment();

    // ── Person ──
    this._buildPerson();

    // ── Streaks ──
    for (let i = 0; i < 8; i++) {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.001, 0, 0)
      ]);
      const line = new THREE.Line(geom, new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0
      }));
      this.group.add(line);
      this.streaks.push({
        line, active: false, t: 0, duration: 0.4,
        start: new THREE.Vector3(), end: new THREE.Vector3()
      });
    }
  }

  _buildBurst() {
    const THREE = this.THREE;
    const N = this.burstCount;
    const pos = new Float32Array(N * 3);
    const cols = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    const alpha = new Float32Array(N);
    const vel = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 3 + Math.random() * 10;
      vel[i*3]   = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i*3+1] = Math.cos(phi) * speed;
      vel[i*3+2] = Math.sin(phi) * Math.sin(theta) * speed;

      const r = Math.random();
      if (r < 0.45)      { cols[i*3]=1; cols[i*3+1]=0.85; cols[i*3+2]=0.4; }
      else if (r < 0.75) { cols[i*3]=1; cols[i*3+1]=0.95; cols[i*3+2]=0.7; }
      else               { cols[i*3]=1; cols[i*3+1]=1;    cols[i*3+2]=1;   }

      sizes[i] = 2 + Math.random() * 3;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('aColor', new THREE.BufferAttribute(cols, 3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: this.shared.galaxyMat.uniforms.uPixelRatio
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aAlpha;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = aColor;
          vAlpha = aAlpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float depthFactor = clamp(20.0 / -mvPosition.z, 0.15, 1.8);
          gl_PointSize = aSize * uPixelRatio * depthFactor;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv) * 2.0;
          if (d > 1.0) discard;
          float glow = pow(1.0 - d, 2.0);
          gl_FragColor = vec4(vColor, glow * vAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.burstGeom = geom;
    this.burstMat = mat;
    this.burstVel = vel;
    this.burstLife = new Float32Array(N);
    this.burstOrigin = new THREE.Vector3();
    this.group.add(new THREE.Points(geom, mat));
  }

  _buildEnvironment() {
    const THREE = this.THREE;
    this.envGroup = new THREE.Group();

    // Floor grid
    const grid = new THREE.GridHelper(50, 25, 0x2a4a6a, 0x0a1a2a);
    grid.position.y = -5.5;
    grid.material.transparent = true;
    grid.material.opacity = 0.6;
    this.envGroup.add(grid);

    // Vertical pipes
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const px = Math.cos(angle) * 8.5;
      const pz = Math.sin(angle) * 8.5;
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 11, 8),
        new THREE.MeshBasicMaterial({ color: 0x2a4a6a, transparent: true, opacity: 0.35 })
      );
      pipe.position.set(px, 0, pz);
      this.envGroup.add(pipe);
    }

    // Control panel
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.9, 0.4),
      new THREE.MeshBasicMaterial({ color: 0x0a1520 })
    );
    panel.position.set(6.2, 1.6, 1.8);
    this.envGroup.add(panel);

    // Screen glow
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 0.6),
      new THREE.MeshBasicMaterial({
        color: 0x7df9ff, transparent: true, opacity: 0.65, side: THREE.DoubleSide
      })
    );
    screen.position.set(6.2, 1.6, 1.6);
    this.envGroup.add(screen);

    this.group.add(this.envGroup);
  }

  _buildPerson() {
    const THREE = this.THREE;
    this.personGroup = new THREE.Group();
    const pMat = new THREE.MeshBasicMaterial({ color: 0xe8b96a, transparent: true, opacity: 0.9 });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), pMat);
    head.position.y = 1.62;
    this.personGroup.add(head);

    // Hard hat (hemisphere, orange)
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.2),
      new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.95 })
    );
    helmet.position.y = 1.72;
    this.personGroup.add(helmet);

    // Torso
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.55, 6, 12), pMat);
    torso.position.y = 1.0;
    this.personGroup.add(torso);

    // Legs
    const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.35, 4, 8), pMat);
    legL.position.set(-0.1, 0.26, 0);
    this.personGroup.add(legL);
    const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.35, 4, 8), pMat);
    legR.position.set(0.1, 0.26, 0);
    this.personGroup.add(legR);

    // Arms
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 4, 8), pMat);
    armL.position.set(-0.32, 1.05, 0);
    armL.rotation.z = 0.15;
    this.personGroup.add(armL);
    const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 4, 8), pMat);
    armR.position.set(0.32, 1.05, 0);
    armR.rotation.z = -0.15;
    this.personGroup.add(armR);

    // Feet on floor (y=-5.5), beside tank
    this.personGroup.position.set(5.8, -5.5, 0);
    this.personGroup.rotation.y = -Math.PI / 2;
    this.personGroup.visible = false;
    this.group.add(this.personGroup);

    // ── Scale sprite ──
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 96;
    const cctx = canvas.getContext('2d');
    cctx.fillStyle = 'rgba(5, 6, 10, 0.9)';
    cctx.fillRect(0, 0, 320, 96);
    cctx.strokeStyle = '#7df9ff';
    cctx.lineWidth = 4;
    cctx.strokeRect(3, 3, 314, 90);
    cctx.fillStyle = '#7df9ff';
    cctx.font = 'bold 40px "JetBrains Mono", monospace';
    cctx.textAlign = 'center';
    cctx.textBaseline = 'middle';
    cctx.fillText('⌀ ≈ 10 m', 160, 48);
    const tex = new THREE.CanvasTexture(canvas);
    this.scaleSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthTest: false, opacity: 0.95
    }));
    this.scaleSprite.scale.set(3.6, 1.1, 1);
    this.scaleSprite.position.set(0, 6.6, 0);
    this.scaleSprite.visible = false;
    this.group.add(this.scaleSprite);
  }

  _getCameraTarget(t, dur) {
    const p = Math.max(0, Math.min(1, t / dur));
    let kA = CHOREO[0], kB = CHOREO[CHOREO.length - 1];
    for (let i = 0; i < CHOREO.length - 1; i++) {
      if (p >= CHOREO[i].p && p <= CHOREO[i+1].p) { kA = CHOREO[i]; kB = CHOREO[i+1]; break; }
    }
    const k = kB.p > kA.p ? smoothstep(kA.p, kB.p, p) : 0;
    const r = kA.r + (kB.r - kA.r) * k;
    const y = kA.y + (kB.y - kA.y) * k;
    const lookY = kA.lookY + (kB.lookY - kA.lookY) * k;
    const driftSpeed = (p >= 0.60 && p <= 0.75) ? 0.04 : 0.13;
    const angle = t * driftSpeed;
    return [
      new this.THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r),
      new this.THREE.Vector3(0, lookY, 0)
    ];
  }

  _applyChunk(chunk, lang) {
    if (chunk === this.lastChunk || !this.ui) return;
    this.lastChunk = chunk;

    const status = this.ui.querySelector('#hud-status');
    const events = this.ui.querySelector('#hud-events');
    const dot = this.ui.querySelector('.hud-bottom');

    const msgs = {
      en: ['SEARCHING...','DETECTOR: IDLE','DESCENDING...','XENON FILLED','PMT ARRAY ONLINE','AWAITING SIGNAL','ANALYZING...','— SILENCE —'],
      fa: ['در حال جستجو...','آشکارساز: بی‌حرکت','در حال فرود...','زنون پر شد','آرایه‌ی PMT روشن','منتظر سیگنال','در حال تحلیل...','— سکوت —']
    };
    const arr = msgs[lang] || msgs.en;
    const idx = Math.min(Math.max(chunk, 0), 7);

    if (status) status.textContent = arr[idx];
    if (dot) dot.classList.toggle('silence', idx === SILENCE_CHUNK);

    if (idx >= PERSON_CHUNK && !this._scaleRevealed) {
      this._scaleRevealed = true;
      this.personGroup.visible = true;
      this.scaleSprite.visible = true;
    }
    if (idx < PERSON_CHUNK && this._scaleRevealed) {
      this._scaleRevealed = false;
      this.personGroup.visible = false;
      this.scaleSprite.visible = false;
    }

    if (events && !(idx === FLASH_CHUNK && this._flashed)) {
      events.classList.remove('flash');
    }
  }

  async enter(chapter, lang) {
    await super.enter(chapter, lang);

    this._flashed = false;
    this._silenced = false;
    this._flashTriggerT = -1;
    this._shakeUntilT = -1;
    this._afterglowT = -1;
    this._scaleRevealed = false;
    this.lastChunk = -1;

    this.flashMesh.material.opacity = 0;
    this.flashMesh.scale.setScalar(1);
    this.flashMesh.visible = true;
    this.afterglowMesh.material.opacity = 0;
    this.afterglowMesh.visible = true;
    this.shockwaveRing.visible = false;
    this.shockwaveRing.material.opacity = 0;
    this.shockwaveRing.scale.setScalar(1);
    this.tankMesh.material.opacity = 0.18;
    this.tankMesh.material.color.setRGB(0.1, 0.23, 0.35);
    this.pmtPoints.visible = true;
    this.tankMesh.visible = true;
    this.innerMesh.visible = true;
    this.pmtMat.uniforms.uSizeScale.value = 3.5;
    this.personGroup.visible = false;
    this.scaleSprite.visible = false;

    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);

    this.burstLife.fill(0);
    const alphaAttr = this.burstGeom.attributes.aAlpha;
    alphaAttr.array.fill(0);
    alphaAttr.needsUpdate = true;

    this.streaks.forEach(s => { s.active = false; s.line.material.opacity = 0; });

    this.ui = document.getElementById('ui-7');
    if (this.ui) {
      this.ui.classList.remove('hidden');
      const ev = this.ui.querySelector('#hud-events');
      if (ev) { ev.textContent = '0'; ev.classList.remove('flash'); }
    }

    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) {
      ctl.autoRotate = false;
      const dur = chapter?.duration || 33;
      const [pos, look] = this._getCameraTarget(0, dur);
      cam.position.copy(pos);
      ctl.target.copy(look);
    }
  }

  async exit() {
    if (this.ui) this.ui.classList.add('hidden');
    await super.exit();
  }

  _triggerFlash() {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 4.0;
    const fx = r * Math.sin(phi) * Math.cos(theta);
    const fy = r * Math.cos(phi);
    const fz = r * Math.sin(phi) * Math.sin(theta);

    this.flashMesh.position.set(fx, fy, fz);
    this.shockwaveRing.position.set(fx, fy, fz);
    this.shockwaveRing.visible = true;
    this.shockwaveRing.scale.setScalar(1);
    this.shockwaveRing.material.opacity = 0.9;
    this.burstOrigin.set(fx, fy, fz);

    const posAttr = this.burstGeom.attributes.position;
    const alphaAttr = this.burstGeom.attributes.aAlpha;
    for (let i = 0; i < this.burstCount; i++) {
      posAttr.array[i*3]   = fx;
      posAttr.array[i*3+1] = fy;
      posAttr.array[i*3+2] = fz;
      alphaAttr.array[i] = 1.0;
      this.burstLife[i] = 1.5;
    }
    posAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
  }

  _spawnStreak() {
    const s = this.streaks.find(x => !x.active);
    if (!s) return;
    const angle = Math.random() * Math.PI * 2;
    const yOff = (Math.random() - 0.5) * 8;
    const dx = Math.cos(angle), dz = Math.sin(angle);
    s.start.set(-dx * 9, yOff, -dz * 9);
    s.end.set(dx * 9, yOff * 0.7, dz * 9);
    s.t = 0;
    s.active = true;
    s.line.geometry.setFromPoints([s.start, s.start.clone()]);
    s.line.material.opacity = 0.55;
  }

  update(dt, time, duration, chunk) {
    if (!this.group.visible) return;
    if (typeof chunk === 'number' && chunk > 7) chunk = -1;
    const t = time || 0;
    const dur = duration || 33;

    // Camera choreography
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) {
      ctl.autoRotate = false;
      const [pos, look] = this._getCameraTarget(t, dur);
      cam.position.lerp(pos, 0.04);
      ctl.target.lerp(look, 0.04);
    }

    // Rotation
    this.tankMesh.rotation.y += dt * 0.06;
    this.pmtPoints.rotation.y += dt * 0.06;
    this.pmtMat.uniforms.uTime.value += dt;

    let pmtScale = 3.5 + Math.sin(t * 1.2) * 0.35;

    // Tank opacity by chunk
    if (typeof chunk === 'number' && chunk >= 3) {
      this.tankMesh.material.opacity = Math.min(0.32, this.tankMesh.material.opacity + dt * 0.08);
    }

    // Flash trigger
    if (!this._flashed && chunk >= FLASH_CHUNK && chunk <= PERSON_CHUNK) {
      this._flashed = true;
      this._flashTriggerT = t;
      this._shakeUntilT = t + this._shakeDuration;
      this._triggerFlash();
      const ev = this.ui?.querySelector('#hud-events');
      if (ev) { ev.textContent = '1'; ev.classList.add('flash'); }
    }

    // Flash animation
    if (this._flashed && this._flashTriggerT >= 0) {
      const ft = t - this._flashTriggerT;

      // Main flash
      if (ft >= 0 && ft < 0.4) {
        const p = ft / 0.4;
        this.flashMesh.scale.setScalar(1 + p * 20);
        this.flashMesh.material.opacity = Math.min(1, p * 1.5);
      } else if (ft >= 0.4 && ft < 1.5) {
        const p = (ft - 0.4) / 1.1;
        this.flashMesh.scale.setScalar(20 + p * 10);
        this.flashMesh.material.opacity = Math.max(0, 0.95 * (1 - p));
      } else {
        this.flashMesh.material.opacity = 0;
      }

      // Shockwave
      if (this.shockwaveRing.visible) {
        const rp = Math.min(1, ft / 1.0);
        if (rp >= 1) {
          this.shockwaveRing.visible = false;
        } else {
          this.shockwaveRing.scale.setScalar(1 + rp * 12);
          this.shockwaveRing.material.opacity = 0.9 * (1 - rp);
        }
      }

      // Afterglow
      if (ft >= 1.8 && this._afterglowT < 0) {
        this._afterglowT = t;
        this.afterglowMesh.position.copy(this.flashMesh.position);
      }
      if (this._afterglowT >= 0) {
        const ap = Math.min(1, (t - this._afterglowT) / 1.4);
        if (ap >= 1) {
          this.afterglowMesh.material.opacity = 0;
        } else {
          this.afterglowMesh.scale.setScalar(1 + ap * 15);
          this.afterglowMesh.material.opacity = 0.5 * (1 - ap);
        }
      }

      // Tank glows during flash
      const glow = (ft >= 0 && ft < 2) ? (1 - ft / 2) : 0;
      this.tankMesh.material.color.setRGB(
        0.1 + 0.7 * glow,
        0.23 + 0.6 * glow,
        0.35 + 0.3 * glow
      );

      // PMT burst
      if (ft >= 0 && ft < 1.0) {
        pmtScale = 3.5 + 5.0 * (1 - ft);
      }
    }
    this.pmtMat.uniforms.uSizeScale.value = pmtScale;

    // Burst particles
    let anyAlive = false;
    const posArr = this.burstGeom.attributes.position.array;
    const alphaArr = this.burstGeom.attributes.aAlpha.array;
    for (let i = 0; i < this.burstCount; i++) {
      if (this.burstLife[i] <= 0) continue;
      anyAlive = true;
      this.burstLife[i] -= dt;
      const v = i * 3;
      this.burstVel[v]   *= 0.96;
      this.burstVel[v+1] *= 0.96;
      this.burstVel[v+2] *= 0.96;
      this.burstVel[v+1] -= 1.5 * dt;
      posArr[v]   += this.burstVel[v]   * dt;
      posArr[v+1] += this.burstVel[v+1] * dt;
      posArr[v+2] += this.burstVel[v+2] * dt;
      alphaArr[i] = Math.max(0, this.burstLife[i] / 1.5);
    }
    if (anyAlive) {
      this.burstGeom.attributes.position.needsUpdate = true;
      this.burstGeom.attributes.aAlpha.needsUpdate = true;
    }

    // Shake + roll
    if (t < this._shakeUntilT) {
      const sp = (this._shakeUntilT - t) / this._shakeDuration;
      const amp = 1.8 * sp;
      this.group.position.x = (Math.random() - 0.5) * amp;
      this.group.position.y = (Math.random() - 0.5) * amp;
      this.group.position.z = (Math.random() - 0.5) * amp * 0.4;
      this.group.rotation.z = (Math.random() - 0.5) * amp * 0.015;
      this.group.rotation.x = (Math.random() - 0.5) * amp * 0.010;
    } else {
      this.group.position.multiplyScalar(0.85);
      this.group.rotation.z *= 0.85;
      this.group.rotation.x *= 0.85;
    }

    // Silence
    if (!this._silenced && chunk >= SILENCE_CHUNK) {
      this._silenced = true;
      this._scaleRevealed = false;
      this.tankMesh.visible = false;
      this.innerMesh.visible = false;
      this.pmtPoints.visible = false;
      this.flashMesh.visible = false;
      this.afterglowMesh.visible = false;
      this.shockwaveRing.visible = false;
      this.personGroup.visible = false;
      this.scaleSprite.visible = false;
      this.envGroup.visible = false;
    }
    if (this._silenced && typeof chunk === 'number' && chunk < SILENCE_CHUNK) {
      this._silenced = false;
      this.tankMesh.visible = true;
      this.innerMesh.visible = true;
      this.pmtPoints.visible = true;
      this.flashMesh.visible = true;
      this.afterglowMesh.visible = true;
      this.envGroup.visible = true;
    }

    // Streaks
    if (!this._silenced && Math.random() < dt * 0.4) this._spawnStreak();
    this.streaks.forEach(s => {
      if (!s.active) return;
      s.t += dt;
      const p = s.t / s.duration;
      if (p >= 1) {
        s.active = false;
        s.line.material.opacity = 0;
        return;
      }
      const head = s.start.clone().lerp(s.end, p);
      s.line.geometry.setFromPoints([s.start, head]);
      s.line.material.opacity = 0.55 * (1 - p);
    });

    this._applyChunk(chunk, this.ctx.lang);
  }

  onLanguageChange(lang) {
    this.lastChunk = -1;
  }
}
