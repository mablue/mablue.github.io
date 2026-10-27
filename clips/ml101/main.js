import { startClip } from '../../player/setup.js?v=20261027-065407';
import { clip, chapters } from './config.js?v=20261027-065407';
import { Scene1Data } from './scenes/scene1.js?v=20261027-065407';
import { Scene2Model } from './scenes/scene2.js?v=20261027-065407';
import { Scene3Loss } from './scenes/scene3.js?v=20261027-065407';
import { Scene4Train } from './scenes/scene4.js?v=20261027-065407';
import { Scene5Result } from './scenes/scene5.js?v=20261027-065407';

const TRUE_W = 2.0;
const TRUE_B = 1.0;

function makeData() {
  const pts = [];
  for (let i = 0; i < 25; i++) {
    const x = -4 + (i / 24) * 8;
    const y = TRUE_W * x + TRUE_B + (Math.random() - 0.5) * 1.6;
    const z = (Math.random() - 0.5) * 0.4;
    pts.push({ x, y, z });
  }
  return pts;
}

export function start() {
  startClip({
    chapters, clip,
    SceneClasses: [Scene1Data, Scene2Model, Scene3Loss, Scene4Train, Scene5Result],
    makeData,
    trueValues: { TRUE_W, TRUE_B },
    cameraPos: [0, 2.5, 16],
    cameraTarget: [0, 0, 0],
    minDistance: 6,
    maxDistance: 40,
    pointConfig: { radius: 0.13, color: 0xe8b96a },
  });
}
