import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Player } from '../../player/player.v4.js';
import { chapters } from './config.js';
import { GalaxyScene } from './scenes/scene1.js';
import { RotationCurveScene } from './scenes/scene2.js';
import { BulletClusterScene } from './scenes/scene3.js';
import { DarkHaloScene } from './scenes/scene4.js';
import { NfwEquationScene } from './scenes/scene5.js';
import { MondScene } from './scenes/scene6.js';
import { HuntersScene } from './scenes/scene7.js';
import { TensionScene } from './scenes/scene8.js';

function makeGlow(stops) {
  const s = 512;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  stops.forEach(([p, col]) => g.addColorStop(p, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  return t;
}

export function start() {
  const canvas = document.getElementById('scene-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  const DPR = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x05060a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 14, 26);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.15;
  controls.minDistance = 8;
  controls.maxDistance = 70;
  controls.enablePan = false;

  // ── SHADERS ──
  const starVertexShader = `
attribute float aSize; attribute float aPhase; attribute float aTwinkleSpeed; attribute vec3 aColor;
uniform float uTime; uniform float uPixelRatio; uniform float uSizeScale;
varying vec3 vColor; varying float vBrightness;
void main() {
  vColor = aColor; float twinkle = 0.8 + 0.2 * sin(uTime * aTwinkleSpeed + aPhase); vBrightness = twinkle;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
  float depthFactor = clamp(20.0 / -mvPosition.z, 0.15, 1.8);
  gl_PointSize = max(max(aSize * uSizeScale * depthFactor, 2.5) * uPixelRatio * twinkle, 1.0);
}`;

  const starFragmentShader = `
varying vec3 vColor; varying float vBrightness;
void main() {
  vec2 uv = gl_PointCoord - 0.5; float d = length(uv) * 2.0;
  if (d > 1.0) discard;
  float glow = pow(1.0 - d, 2.0); float core = pow(1.0 - smoothstep(0.0, 0.35, d), 3.0);
  gl_FragColor = vec4(clamp(vColor + vec3(core * 0.3), 0.0, 1.5), min((glow * 0.7 + core * 0.5) * vBrightness, 1.0));
}`;

  const galaxyMat = new THREE.ShaderMaterial({
    uniforms: { uTime: {value: 0}, uPixelRatio: {value: DPR}, uSizeScale: {value: 4.5} },
    vertexShader: starVertexShader, fragmentShader: starFragmentShader,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });

  // Background stars
  const bgGeom = new THREE.BufferGeometry();
  const bgCount = 1500;
  const bgPos = new Float32Array(bgCount*3), bgSize = new Float32Array(bgCount), bgPhase = new Float32Array(bgCount), bgSpeed = new Float32Array(bgCount), bgColor = new Float32Array(bgCount*3);
  for (let i=0; i<bgCount; i++) {
    const r = 150 + Math.random()*300, th = Math.random()*Math.PI*2, phi = Math.acos(2*Math.random()-1);
    bgPos[i*3]=r*Math.sin(phi)*Math.cos(th); bgPos[i*3+1]=r*Math.cos(phi); bgPos[i*3+2]=r*Math.sin(phi)*Math.sin(th);
    bgSize[i]=2.5+Math.random()*3.5; bgPhase[i]=Math.random()*6; bgSpeed[i]=1;
    const c = Math.random();
    if (c<0.5){bgColor[i*3]=.85;bgColor[i*3+1]=.9;bgColor[i*3+2]=1;}
    else if (c<.85){bgColor[i*3]=bgColor[i*3+1]=bgColor[i*3+2]=1;}
    else {bgColor[i*3]=1;bgColor[i*3+1]=.92;bgColor[i*3+2]=.75;}
  }
  bgGeom.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
  bgGeom.setAttribute('aSize', new THREE.BufferAttribute(bgSize, 1));
  bgGeom.setAttribute('aPhase', new THREE.BufferAttribute(bgPhase, 1));
  bgGeom.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(bgSpeed, 1));
  bgGeom.setAttribute('aColor', new THREE.BufferAttribute(bgColor, 3));
  const bgMat = new THREE.ShaderMaterial({
    uniforms: { uTime:{value:0}, uPixelRatio:{value:DPR}, uSizeScale:{value:2.0} },
    vertexShader: starVertexShader, fragmentShader: starFragmentShader,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
  scene.add(new THREE.Points(bgGeom, bgMat));

  // Galaxy geometry
  const GALAXY_R = 12, STAR_COUNT = 15000, BULGE_COUNT = 3000, R_CORE = 2.5;
  const galaxyPos = new Float32Array(STAR_COUNT*3);
  const galaxySize = new Float32Array(STAR_COUNT);
  const galaxyPhase = new Float32Array(STAR_COUNT);
  const galaxyTwinkle = new Float32Array(STAR_COUNT);
  const galaxyColor = new Float32Array(STAR_COUNT*3);

  function pickColor(type, radius) {
    const r = Math.random();
    if (type==='bulge'){
      if (r<.2) return [1,.95,.78]; if (r<.4) return [1,.85,.58];
      if (r<.6) return [1,.92,.82]; if (r<.75) return [1,.72,.48];
      if (r<.85) return [1,.62,.42]; return [.92,.95,1];
    }
    const t = radius/GALAXY_R;
    if (t<.3){ if (r<.3) return [1,.95,.82]; if (r<.55) return [1,.9,.68]; if (r<.75) return [1,1,1]; if (r<.9) return [.88,.94,1]; return [1,.72,.48]; }
    if (t<.7){ if (r<.25) return [1,1,1]; if (r<.55) return [.88,.94,1]; if (r<.85) return [.72,.82,1]; return [1,.95,.85]; }
    if (r<.3) return [.72,.82,1]; if (r<.7) return [.58,.72,1]; return [.85,.92,1];
  }
  function pickSize(type, radius) {
    const r = Math.random();
    if (type==='bulge'){ if (r<.9) return 1.2+Math.random()*1.4; return 2.6+Math.random()*1.8; }
    if (r<.01) return 5+Math.random()*3;
    if (r<.1) return 2.6+Math.random()*1.8;
    const t = radius/GALAXY_R;
    if (t<.5) return 1.4+Math.random()*1.4;
    return 1+Math.random()*1.2;
  }

  for (let i=0; i<STAR_COUNT; i++) {
    if (i < BULGE_COUNT) {
      const r = Math.pow(Math.random(), 0.55) * R_CORE;
      const th = Math.random()*Math.PI*2, phi = Math.acos(2*Math.random()-1);
      const x = r*Math.sin(phi)*Math.cos(th), y = r*Math.cos(phi)*0.35, z = r*Math.sin(phi)*Math.sin(th);
      galaxyPos[i*3]=x; galaxyPos[i*3+1]=y; galaxyPos[i*3+2]=z;
      const c = pickColor('bulge', r); galaxyColor[i*3]=c[0]; galaxyColor[i*3+1]=c[1]; galaxyColor[i*3+2]=c[2];
      galaxySize[i]=pickSize('bulge',r); galaxyPhase[i]=Math.random()*6; galaxyTwinkle[i]=0.8+Math.random()*1.8;
    } else {
      const arm = Math.floor(Math.random()*2), armOffset = arm*Math.PI;
      const r = R_CORE + Math.pow(Math.random(),0.65)*(GALAXY_R-R_CORE);
      const b = -0.45, armPhase = Math.log(r/R_CORE)/b;
      const spread = (Math.random()-0.5)*0.55;
      const armTheta = armOffset + armPhase + spread;
      const turb = (Math.random()-0.5)*1.4;
      const initTheta = armTheta + turb;
      const y = (Math.random()-0.5)*(r*0.06+0.15);
      galaxyPos[i*3]=r*Math.cos(initTheta); galaxyPos[i*3+1]=y; galaxyPos[i*3+2]=r*Math.sin(initTheta);
      const c = pickColor('disk', r); galaxyColor[i*3]=c[0]; galaxyColor[i*3+1]=c[1]; galaxyColor[i*3+2]=c[2];
      galaxySize[i]=pickSize('disk',r); galaxyPhase[i]=Math.random()*6; galaxyTwinkle[i]=0.6+Math.random()*2.2;
    }
  }
  const galaxyGeom = new THREE.BufferGeometry();
  galaxyGeom.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
  galaxyGeom.setAttribute('aSize', new THREE.BufferAttribute(galaxySize, 1));
  galaxyGeom.setAttribute('aPhase', new THREE.BufferAttribute(galaxyPhase, 1));
  galaxyGeom.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(galaxyTwinkle, 1));
  galaxyGeom.setAttribute('aColor', new THREE.BufferAttribute(galaxyColor, 3));

  // Halo geometry
  const HALO_COUNT = 15000;
  const haloPos = new Float32Array(HALO_COUNT*3);
  const haloCol = new Float32Array(HALO_COUNT*3);
  const haloSize = new Float32Array(HALO_COUNT);
  const haloPhase = new Float32Array(HALO_COUNT);
  const haloSpeed = new Float32Array(HALO_COUNT);
  for (let i=0; i<HALO_COUNT; i++) {
    const r = Math.pow(Math.random(), 2.2)*20;
    const th = Math.random()*Math.PI*2, phi = Math.acos(2*Math.random()-1);
    haloPos[i*3]=r*Math.sin(phi)*Math.cos(th); haloPos[i*3+1]=r*Math.cos(phi); haloPos[i*3+2]=r*Math.sin(phi)*Math.sin(th);
    const intensity = Math.max(0.2, 1.0 - (r/20));
    haloCol[i*3]=0.2*intensity; haloCol[i*3+1]=0.4*intensity; haloCol[i*3+2]=1.0*intensity;
    haloSize[i]=1+Math.random()*2; haloPhase[i]=Math.random()*6; haloSpeed[i]=1;
  }
  const haloGeom = new THREE.BufferGeometry();
  haloGeom.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));
  haloGeom.setAttribute('aColor', new THREE.BufferAttribute(haloCol, 3));
  haloGeom.setAttribute('aSize', new THREE.BufferAttribute(haloSize, 1));
  haloGeom.setAttribute('aPhase', new THREE.BufferAttribute(haloPhase, 1));
  haloGeom.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(haloSpeed, 1));

  const glowTex = makeGlow([[0,'rgba(255,250,235,1)'],[0.15,'rgba(255,225,180,.85)'],[0.4,'rgba(255,180,100,.35)'],[0.7,'rgba(255,140,70,.08)'],[1,'rgba(255,100,50,0)']]);
  const glowTexOuter = makeGlow([[0,'rgba(255,210,150,.35)'],[0.3,'rgba(255,170,100,.15)'],[0.6,'rgba(220,130,80,.05)'],[1,'rgba(200,100,60,0)']]);

  const ctx = {
    THREE, scene, camera, controls, renderer, canvas,
    lang: 'fa',
    galaxyGeom, galaxyMat, haloGeom, glowTex, glowTexOuter,
    STAR_COUNT, BULGE_COUNT, GALAXY_R, R_CORE
  };

  const shared = { ...ctx };

  const player = new Player(ctx, chapters);
  player.registerScene(0, new GalaxyScene(ctx, shared));
  player.registerScene(1, new RotationCurveScene(ctx, shared));
  player.registerScene(2, new BulletClusterScene(ctx, shared));
  player.registerScene(3, new DarkHaloScene(ctx, shared));
  player.registerScene(4, new NfwEquationScene(ctx, shared));
  player.registerScene(5, new MondScene(ctx, shared));
  player.registerScene(6, new HuntersScene(ctx, shared));
  player.registerScene(7, new TensionScene(ctx, shared));

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    galaxyMat.uniforms.uTime.value += dt;
    bgMat.uniforms.uTime.value += dt;
    player.update(dt);
    controls.update();
    renderer.render(scene, camera);
  }
  tick();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  player.start('fa');
}
