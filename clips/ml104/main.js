import { startClip } from '../../player/setup.js?v=20261028-202332';
import { clip, chapters } from './config.js?v=20261028-202332';
import { timings } from './timings.js?v=20261028-202332';
import { Scene1Tribes } from './scenes/scene1.js?v=20261028-202332';
import { Scene2Circle } from './scenes/scene2.js?v=20261028-202332';
import { Scene3Sigmoid } from './scenes/scene3.js?v=20261028-202332';
import { Scene4Training } from './scenes/scene4.js?v=20261028-202332';
import { Scene5Result } from './scenes/scene5.js?v=20261028-202332';

const TARGET_R = 2.5;

function makeData() {
  const pts = [];
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 1.5;
    pts.push({ x: r * Math.cos(a), y: r * Math.sin(a), z: 0, cls: 0 });
  }
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 3 + Math.random() * 1.5;
    pts.push({ x: r * Math.cos(a), y: r * Math.sin(a), z: 0, cls: 1 });
  }
  return pts;
}

export function start() {
  startClip({
    chapters, clip: { ...clip, timings },
    SceneClasses: [Scene1Tribes, Scene2Circle, Scene3Sigmoid, Scene4Training, Scene5Result],
    trueValues: { TARGET_R },
    cameraPos: [0, 0, 14],
    cameraTarget: [0, 0, 0],
    minDistance: 6,
    maxDistance: 30,
    skipPoints: true,
    extraSetup: (ctx, shared) => {
      const THREE = ctx.THREE;
      const data = makeData();
      const group = new THREE.Group();
      ctx.scene.add(group);
      const dotMeshes = [];
      const geo = new THREE.SphereGeometry(0.15, 10, 10);
      for (const p of data) {
        const color = p.cls === 0 ? 0xe8b96a : 0x7df9ff;
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 }));
        m.position.set(p.x, p.y, p.z);
        group.add(m);
        dotMeshes.push(m);
      }
      return { DATA: data, pointsGroup: group, dotMeshes };
    },
  });
}
