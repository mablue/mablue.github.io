import { startClip } from '../../player/setup.js?v=20261028-202332';
import { clip, chapters } from './config.js?v=20261028-202332';
import { timings } from './timings.js?v=20261028-202332';
import { Scene1Curve } from './scenes/scene1.js?v=20261028-202332';
import { Scene2AddX2 } from './scenes/scene2.js?v=20261028-202332';
import { Scene3Model } from './scenes/scene3.js?v=20261028-202332';
import { Scene4Training } from './scenes/scene4.js?v=20261028-202332';
import { Scene5Result } from './scenes/scene5.js?v=20261028-202332';

const TRUE_W1 = 0.0;
const TRUE_W2 = 0.5;
const TRUE_B = -2.0;

function makeData() {
  const pts = [];
  for (let i = 0; i < 30; i++) {
    const x = -3 + (i / 29) * 6;
    const y = TRUE_W2 * x * x + TRUE_B + (Math.random() - 0.5) * 0.6;
    pts.push({ x, y, z: (Math.random() - 0.5) * 0.3 });
  }
  return pts;
}

export function start() {
  startClip({
    chapters, clip: { ...clip, timings },
    SceneClasses: [Scene1Curve, Scene2AddX2, Scene3Model, Scene4Training, Scene5Result],
    makeData,
    trueValues: { TRUE_W1, TRUE_W2, TRUE_B },
    cameraPos: [0, 0, 14],
    cameraTarget: [0, -1, 0],
    minDistance: 5,
    maxDistance: 30,
    pointConfig: { radius: 0.1, color: 0xe8b96a },
  });
}
