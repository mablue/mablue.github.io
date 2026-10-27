import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Player } from '../../player/player.v4.js?v=20261026-221748';
import { clip, chapters } from './config.js?v=20261026-222850';
import { Scene1Hard } from './scenes/scene1.js?v=20261026-221748';
import { Scene2Hidden } from './scenes/scene2.js?v=20261026-221748';
import { Scene3Relu } from './scenes/scene3.js?v=20261026-221748';
import { Scene4Training } from './scenes/scene4.js?v=20261026-221748';
import { Scene5Result } from './scenes/scene5.js?v=20261026-221748';

const TRUE_AMP = 2.0, TRUE_FREQ = 1.5;

function makeData() {
  const pts = [];
  for (let i = 0; i < 40; i++) {
    const x = -3 + (i / 39) * 6;
    const y = TRUE_AMP * Math.sin(TRUE_FREQ * x) + (Math.random() - 0.5) * 0.2;
    pts.push({ x, y, z: (Math.random() - 0.5) * 0.3 });
  }
  return pts;
}

export function start() {
  const canvas = document.getElementById('scene-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x05060a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 0, 14);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = false;
  controls.minDistance = 5;
  controls.maxDistance = 30;
  controls.enablePan = false;
  controls.target.set(0, 0, 0);

  const DATA = makeData();
  const pointsGroup = new THREE.Group();
  scene.add(pointsGroup);
  const dotGeom = new THREE.SphereGeometry(0.1, 10, 10);
  const dotMeshes = [];
  for (const p of DATA) {
    const m = new THREE.Mesh(dotGeom, new THREE.MeshBasicMaterial({ color: 0xe8b96a, transparent: true, opacity: 0 }));
    m.position.set(p.x, p.y, p.z);
    pointsGroup.add(m);
    dotMeshes.push(m);
  }

  const N = 500;
  const sPos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 40 + Math.random() * 150;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    sPos[i*3] = r * Math.sin(ph) * Math.cos(th);
    sPos[i*3+1] = r * Math.cos(ph);
    sPos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ size: 1.2, color: 0xffffff, transparent: true, opacity: 0.4 })));

  const ctx = { THREE, scene, camera, controls, renderer, canvas, lang: 'az', DATA, TRUE_AMP, TRUE_FREQ, pointsGroup, dotMeshes };
  const shared = { ...ctx };

  const scenes = {};
  chapters.forEach((_, i) => {
    const SceneClass = [Scene1Hard, Scene2Hidden, Scene3Relu, Scene4Training, Scene5Result][i];
    if (SceneClass) scenes[i] = new SceneClass(ctx, shared);
  });

  const player = new Player({ ctx, chapters, clip, scenes });

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
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
  player.start();
}
