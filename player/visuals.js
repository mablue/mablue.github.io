export function updateLine(mesh, w, b, xRange = [-4, 4], z = 0) {
  if (!mesh) return;
  const [x1, x2] = xRange;
  const y1 = w * x1 + b, y2 = w * x2 + b;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  mesh.position.set((x1+x2)/2, (y1+y2)/2, z);
  mesh.scale.set(1, len, 1);
  mesh.rotation.z = Math.atan2(dy, dx) - Math.PI/2;
}

export function updateCurvePositions(positions, w1, w2, b, xRange = [-4, 4]) {
  if (!positions) return;
  const N = positions.length / 3;
  const [xMin, xMax] = xRange;
  for (let i = 0; i < N; i++) {
    const x = xMin + (i / (N - 1)) * (xMax - xMin);
    const y = w1 * x + w2 * x * x + b;
    positions[i*3] = x;
    positions[i*3+1] = y;
    positions[i*3+2] = 0;
  }
}

export function updateDrops(drops, DATA, w, b, opts = {}) {
  if (!drops || !DATA) return;
  const THREE = opts.THREE;
  if (!THREE) return;
  for (let i = 0; i < DATA.length && i < drops.length; i++) {
    const p = DATA[i];
    const modelY = w * p.x + b;
    drops[i].geometry.setFromPoints([
      new THREE.Vector3(p.x, p.y, p.z || 0),
      new THREE.Vector3(p.x, modelY, 0)
    ]);
  }
}
