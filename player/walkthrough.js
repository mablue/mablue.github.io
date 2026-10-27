export function buildCodeUI(pre, lines) {
  if (!pre || !lines) return;
  pre.innerHTML = lines.map((line, i) =>
    '<span class="code-line" data-line="' + i + '">' + (line || ' ') + '</span>'
  ).join('');
}

export function applyCodeChunk(pre, chapter, chunk) {
  if (!pre || !chapter || !chapter.code || !chapter.code.highlights) return;
  const range = chapter.code.highlights[chunk];
  const lines = pre.querySelectorAll('.code-line');
  if (!range) {
    lines.forEach(el => el.classList.remove('highlight', 'dimmed'));
    return;
  }
  const start = range[0], end = range[1];
  lines.forEach(el => {
    const n = parseInt(el.dataset.line, 10);
    const inRange = n >= start && n <= end;
    el.classList.toggle('highlight', inRange);
    el.classList.toggle('dimmed', !inRange);
  });
  const container = pre.closest('#ml-code') || pre.parentElement;
  if (!container) return;
  const firstLine = pre.querySelector('[data-line="' + start + '"]');
  if (firstLine) {
    const targetScroll = firstLine.offsetTop - container.clientHeight / 2 + firstLine.offsetHeight / 2;
    container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
  }
}

export function clearCodeHighlight(pre) {
  if (!pre) return;
  pre.querySelectorAll('.code-line').forEach(el => {
    el.classList.remove('highlight', 'dimmed');
  });
}
