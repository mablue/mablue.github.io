import { SceneBase } from '../../../player/scene-base.js';

const CHOREO = [
  { p: 0.00, r: 45, y: 15, lookY: 0 },
  { p: 0.20, r: 30, y: 9,  lookY: 0 },
  { p: 0.40, r: 20, y: 6,  lookY: 0 },
  { p: 0.55, r: 24, y: 8,  lookY: 0 },
  { p: 0.72, r: 14, y: 4,  lookY: 0 },
  { p: 0.88, r: 6,  y: 1.5, lookY: 0 },
  { p: 1.00, r: 2.8, y: 0.6, lookY: 0 }
];

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export class TensionScene extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._tensionActive = false;
    this._revealed = false;
    this._lastChunk = -1;
    this._lastLang = null;
    this.ui = null;
    this._build();
  }

  _build() {
    const THREE = this.THREE;

    // ── BIG COSMIC WEB (R ≈ 75) ──
    this.webMat = this._makeWebMaterial(1.0);
    this.bigWeb = this._buildWeb(80, 5.0, this.webMat, true);
    this.group.add(this.bigWeb.points);

    // ── MINI WEB (R ≈ 2.25) — the fractal reveal ──
    this.miniMat = this._makeWebMaterial(0.0);
    this.miniWeb = this._buildWeb(40, 0.15, this.miniMat, false);
    this.miniWeb.points.visible = false;
    this.group.add(this.miniWeb.points);

    // ── TENSION MARKERS (amber anomalies) ──
    this.tensionGroup = new THREE.Group();
    this.tensionMarkers = [];
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0xff9955, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false
        })
      );
      this.tensionGroup.add(mesh);
      this.tensionMarkers.push({ mesh, phase: Math.random() * Math.PI * 2, placed: false });
    }
    this.group.add(this.tensionGroup);
  }

  _makeWebMaterial(opacity) {
    const THREE = this.THREE;
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSizeScale: { value: 4.5 },
        uOpacity: { value: opacity }
      },
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        attribute float aTwinkle;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uSizeScale;
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = aColor;
          float tw = 0.7 + 0.3 * sin(uTime * 0.8 + aPhase);
          vAlpha = tw * uOpacity;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float depth = clamp(30.0 / max(-mv.z, 0.1), 0.2, 2.0);
          gl_PointSize = max(aSize * uSizeScale * depth * uPixelRatio * tw, 1.0);
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
          float core = pow(1.0 - smoothstep(0.0, 0.4, d), 3.0);
          gl_FragColor = vec4(vColor + vec3(core * 0.3), (glow * 0.7 + core * 0.5) * vAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }

  _buildWeb(nodeCount, scale, material, heroAtOrigin) {
    const THREE = this.THREE;
    const R = 15 * scale;

    // ── Nodes ──
    const nodes = [];
    if (heroAtOrigin) {
      nodes.push({ x: 0, y: 0, z: 0, bright: true });
    }
    const startIdx = heroAtOrigin ? 1 : 0;
    for (let i = startIdx; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const rr = Math.pow(Math.random(), 0.55) * R;
      nodes.push({
        x: rr * Math.sin(phi) * Math.cos(theta),
        y: rr * Math.cos(phi) * 0.6,
        z: rr * Math.sin(phi) * Math.sin(theta),
        bright: Math.random() < 0.15
      });
    }

    // ── Count total points ──
    const ptsPerNode = 60;
    const filamentsPerNode = 5;
    const ptsPerFilament = 15;
    const maxTotal = nodeCount * ptsPerNode + nodeCount * filamentsPerNode * ptsPerFilament;

    const pos = new Float32Array(maxTotal * 3);
    const colors = new Float32Array(maxTotal * 3);
    const sizes = new Float32Array(maxTotal);
    const phases = new Float32Array(maxTotal);
    const twinkles = new Float32Array(maxTotal);
    let p = 0;

    // ── Dense clusters at nodes ──
    for (const node of nodes) {
      const spread = node.bright ? 1.0 * scale : 0.5 * scale;
      for (let i = 0; i < ptsPerNode && p < maxTotal; i++) {
        const r = Math.pow(Math.random(), 0.7) * spread;
        const t = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos[p*3]   = node.x + r * Math.sin(ph) * Math.cos(t);
        pos[p*3+1] = node.y + r * Math.cos(ph);
        pos[p*3+2] = node.z + r * Math.sin(ph) * Math.sin(t);
        const c = node.bright ? [1, 0.9, 0.7] : [0.55, 0.7, 1.0];
        const j = 0.85 + Math.random() * 0.3;
        colors[p*3]   = c[0] * j;
        colors[p*3+1] = c[1] * j;
        colors[p*3+2] = c[2] * j;
        sizes[p] = (node.bright ? 2.4 : 1.2) + Math.random() * (node.bright ? 2.0 : 1.0);
        phases[p] = Math.random() * Math.PI * 2;
        twinkles[p] = 0.5 + Math.random() * 1.5;
        p++;
      }
    }

    // ── Filaments between nearest neighbors ──
    for (let ni = 0; ni < nodes.length; ni++) {
      const node = nodes[ni];
      const dists = [];
      for (let nj = 0; nj < nodes.length; nj++) {
        if (ni === nj) continue;
        const d = Math.hypot(nodes[nj].x - node.x, nodes[nj].y - node.y, nodes[nj].z - node.z);
        dists.push({ idx: nj, d });
      }
      dists.sort((a, b) => a.d - b.d);
      const nearest = dists.slice(0, filamentsPerNode);
      for (const { idx } of nearest) {
        const other = nodes[idx];
        for (let i = 0; i < ptsPerFilament && p < maxTotal; i++) {
          const t = Math.random();
          pos[p*3]   = node.x + (other.x - node.x) * t + (Math.random() - 0.5) * 0.4 * scale;
          pos[p*3+1] = node.y + (other.y - node.y) * t + (Math.random() - 0.5) * 0.4 * scale;
          pos[p*3+2] = node.z + (other.z - node.z) * t + (Math.random() - 0.5) * 0.4 * scale;
          colors[p*3]   = 0.35;
          colors[p*3+1] = 0.55;
          colors[p*3+2] = 0.9;
          sizes[p] = 0.8 + Math.random() * 0.8;
          phases[p] = Math.random() * Math.PI * 2;
          twinkles[p] = 0.3 + Math.random() * 1.0;
          p++;
        }
      }
    }

    const count = p;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos.slice(0, count*3), 3));
    geom.setAttribute('aColor', new THREE.BufferAttribute(colors.slice(0, count*3), 3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes.slice(0, count), 1));
    geom.setAttribute('aPhase', new THREE.BufferAttribute(phases.slice(0, count), 1));
    geom.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkles.slice(0, count), 1));

    const points = new THREE.Points(geom, material);
    return { points, nodes, count, scale };
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
    const driftSpeed = (p > 0.75) ? 0.02 : 0.07;
    const angle = t * driftSpeed;
    return [
      new this.THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r),
      new this.THREE.Vector3(0, lookY, 0)
    ];
  }

  async enter(chapter, lang) {
    await super.enter(chapter, lang);

    this._tensionActive = false;
    this._revealed = false;
    this._lastChunk = -1;
    this._lastLang = lang;

    this.webMat.uniforms.uOpacity.value = 1.0;
    this.miniMat.uniforms.uOpacity.value = 0.0;
    this.miniWeb.points.visible = false;
    this.bigWeb.points.visible = true;

    for (const m of this.tensionMarkers) {
      m.mesh.material.opacity = 0;
      m.mesh.scale.setScalar(1);
      m.placed = false;
    }

    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);

    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) {
      ctl.autoRotate = false;
      const dur = chapter?.duration || 42;
      const [pos, look] = this._getCameraTarget(0, dur);
      cam.position.copy(pos);
      ctl.target.copy(look);
    }
  }

  async exit() {
    await super.exit();
  }

  _placeTensionMarkers() {
    for (const m of this.tensionMarkers) {
      // Pick a random node (avoid hero node at origin)
      const nodes = this.bigWeb.nodes;
      let node;
      do {
        node = nodes[Math.floor(Math.random() * nodes.length)];
      } while (node.x === 0 && node.y === 0 && node.z === 0 && nodes.length > 1);
      m.mesh.position.set(node.x, node.y, node.z);
      m.placed = true;
    }
  }

  update(dt, time, duration, chunk) {
    if (!this.group.visible) return;
    if (typeof chunk === 'number' && chunk > 7) chunk = -1;

    const t = time || 0;
    const dur = duration || 42;

    // Camera
    const cam = this.ctx.camera, ctl = this.ctx.controls;
    if (cam && ctl) {
      ctl.autoRotate = false;
      const [pos, look] = this._getCameraTarget(t, dur);
      cam.position.lerp(pos, 0.05);
      ctl.target.lerp(look, 0.05);
    }

    // Material time
    this.webMat.uniforms.uTime.value += dt;
    this.miniMat.uniforms.uTime.value += dt;

    // Slow rotation
    this.bigWeb.points.rotation.y += dt * 0.03;
    this.miniWeb.points.rotation.y += dt * 0.08;

    // ── Tension markers ──
    if (chunk >= 3 && chunk <= 5) {
      if (!this._tensionActive) {
        this._tensionActive = true;
        this._placeTensionMarkers();
      }
      for (const m of this.tensionMarkers) {
        m.phase += dt * 2.5;
        const pulse = (Math.sin(m.phase) + 1) * 0.5;
        m.mesh.material.opacity = 0.4 + pulse * 0.6;
        m.mesh.scale.setScalar(1 + pulse * 1.8);
      }
    } else if (this._tensionActive) {
      let anyVisible = false;
      for (const m of this.tensionMarkers) {
        m.mesh.material.opacity *= 0.93;
        if (m.mesh.material.opacity > 0.05) anyVisible = true;
      }
      if (!anyVisible) this._tensionActive = false;
    }

    // ── Fractal reveal ──
    if (chunk >= 6 && !this._revealed) {
      this._revealed = true;
      this.miniWeb.points.visible = true;
    }

    if (this._revealed) {
      this.webMat.uniforms.uOpacity.value = Math.max(0, this.webMat.uniforms.uOpacity.value - dt * 1.5);
      this.miniMat.uniforms.uOpacity.value = Math.min(1.0, this.miniMat.uniforms.uOpacity.value + dt * 1.2);
    } else {
      this.webMat.uniforms.uOpacity.value = Math.min(1.0, this.webMat.uniforms.uOpacity.value + dt * 2.0);
      this.miniMat.uniforms.uOpacity.value = Math.max(0.0, this.miniMat.uniforms.uOpacity.value - dt * 2.0);
      if (this.miniMat.uniforms.uOpacity.value <= 0.01) {
        this.miniWeb.points.visible = false;
      }
    }

    // Language change handling
    if (this.ctx.lang !== this._lastLang) {
      this._lastLang = this.ctx.lang;
      this._lastChunk = -1;
    }
  }

  onLanguageChange(lang) {
    this._lastLang = lang;
    this._lastChunk = -1;
  }
}
