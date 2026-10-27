export function drawLossChart(canvas, history) {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (w === 0 || h === 0) return;
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (!history || history.length < 2) return;

  let maxV = 0;
  for (const p of history) if (p.v > maxV) maxV = p.v;
  maxV = maxV || 1;

  ctx.strokeStyle = '#7df9ff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < history.length; i++) {
    const p = history[i];
    const x = p.t * w;
    const y = h - (p.v / maxV) * (h - 6) - 2;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(232,185,106,0.9)';
  ctx.font = '9px JetBrains Mono';
  ctx.fillText('LOSS', 4, 10);
}

export function updateTrainingHUD({ ease, totalSteps, loss, lossEl, barEl, stepEl }) {
  if (lossEl && loss !== undefined) lossEl.textContent = loss.toFixed(4);
  if (barEl) barEl.style.width = (ease * 100).toFixed(0) + '%';
  if (stepEl) stepEl.textContent = 'step ' + Math.round(ease * totalSteps) + ' / ' + totalSteps;
}
