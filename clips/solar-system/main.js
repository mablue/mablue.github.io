import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Player } from '../../player/player.js?v=20261026-2122';
import { chapters } from './config.js';
import { PlanetScene } from './scenes/planetscene.js';

export function start() {
  const canvas = document.getElementById('scene-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  const DPR = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x05060a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 8, 20);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = false;
  controls.minDistance = 2;
  controls.maxDistance = 60;
  controls.enablePan = false;

  const ctx = { THREE, scene, camera, controls, renderer, canvas, lang: 'fa' };
  const shared = { ...ctx };

  const player = new Player(ctx, chapters);
  chapters.forEach((ch, i) => {
    if (ch.built) {
      player.registerScene(i, new PlanetScene(ctx, shared, ch));
    }
  });

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

  player.start('fa');
}
