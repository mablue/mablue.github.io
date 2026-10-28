import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Player } from './player.v6.js?v=20261028-063539';

export { THREE };

export function setupThree(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(opts.bg ?? 0x05060a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    opts.fov ?? 50,
    window.innerWidth / window.innerHeight,
    0.1,
    opts.far ?? 500
  );
  const cp = opts.cameraPos ?? [0, 0, 14];
  camera.position.set(cp[0], cp[1], cp[2]);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = false;
  controls.minDistance = opts.minDistance ?? 5;
  controls.maxDistance = opts.maxDistance ?? 40;
  controls.enablePan = false;
  const tg = opts.target ?? [0, 0, 0];
  controls.target.set(tg[0], tg[1], tg[2]);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { THREE, scene, camera, controls, renderer, canvas };
}

export function createStarField(scene, count = 500, opts = {}) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = (opts.minR ?? 40) + Math.random() * (opts.maxR ?? 150);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i*3]   = r * Math.sin(ph) * Math.cos(th);
    pos[i*3+1] = r * Math.cos(ph);
    pos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size: opts.size ?? 1.2,
    color: opts.color ?? 0xffffff,
    transparent: true,
    opacity: opts.opacity ?? 0.4,
    sizeAttenuation: true,
  })));
}

export function createPointGroup(scene, DATA, opts = {}) {
  const group = new THREE.Group();
  scene.add(group);
  const geo = new THREE.SphereGeometry(opts.radius ?? 0.1, 10, 10);
  const color = opts.color ?? 0xe8b96a;
  const meshes = [];
  for (const p of DATA) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0,
    }));
    m.position.set(p.x, p.y, p.z || 0);
    group.add(m);
    meshes.push(m);
  }
  return { group, meshes };
}

export function startClip({
  chapters, clip,
  SceneClasses,
  makeData,
  trueValues = {},
  cameraPos, cameraTarget, minDistance, maxDistance,
  starCount = 500,
  pointConfig = {},
  defaultLang = 'az',
}) {
  const canvas = document.getElementById('scene-canvas');
  const { scene, camera, controls, renderer } = setupThree(canvas, {
    cameraPos, target: cameraTarget,
    minDistance, maxDistance,
  });
  createStarField(scene, starCount);

  const DATA = makeData ? makeData() : [];
  const { group: pointsGroup, meshes: dotMeshes } = createPointGroup(scene, DATA, pointConfig);

  const ctx = {
    THREE, scene, camera, controls, renderer, canvas,
    lang: defaultLang,
    DATA, ...trueValues,
    pointsGroup, dotMeshes,
  };
  const shared = { ...ctx };

  const sceneInstances = {};
  chapters.forEach((_, i) => {
    const SC = SceneClasses[i];
    if (SC) sceneInstances[i] = new SC(ctx, shared);
  });

  const player = new Player({ ctx, chapters, clip, scenes: sceneInstances });

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    player.update(dt);
    controls.update();
    renderer.render(scene, camera);
  }
  tick();
  player.start();
}
