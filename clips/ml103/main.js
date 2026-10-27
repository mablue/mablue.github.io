import { startClip } from '../../player/setup.js?v=20261027-064851';
import { clip, chapters } from './config.js?v=20261027-064851';
import { Scene1Hard } from './scenes/scene1.js?v=20261027-064851';
import { Scene2Hidden } from './scenes/scene2.js?v=20261027-064851';
import { Scene3Relu } from './scenes/scene3.js?v=20261027-064851';
import { Scene4Training } from './scenes/scene4.js?v=20261027-064851';
import { Scene5Result } from './scenes/scene5.js?v=20261027-064851';

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
  startClip({
    chapters, clip,
    SceneClasses: [Scene1Hard, Scene2Hidden, Scene3Relu, Scene4Training, Scene5Result],
    makeData,
    trueValues: { TRUE_AMP, TRUE_FREQ },
    cameraPos: [0, 0, 14],
    cameraTarget: [0, 0, 0],
    minDistance: 5,
    maxDistance: 30,
    pointConfig: { radius: 0.1, color: 0xe8b96a },
  });
}
