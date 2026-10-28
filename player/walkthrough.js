export function buildCodeUI(pre, lines) {
  if (!pre || !lines) return;
  pre.innerHTML = lines.map((line, i) =>
    '<span class="code-line" data-line="' + i + '">' + (line || ' ') + '</span>'
  ).join('');
}

export function applyCodeChunk(pre, chapter, chunk) {
  if (!pre || !chapter || !chapter.code || !chapter.code.highlights) return;
  const entry = chapter.code.highlights[chunk];
  const lines = pre.querySelectorAll('.code-line');

  lines.forEach(el => el.classList.remove('highlight', 'dimmed'));
  pre.querySelectorAll('.tok-highlight').forEach(t => t.classList.remove('tok-highlight'));

  if (entry === undefined || entry === null) return;

  let startLine, endLine, tokens = [];
  if (Array.isArray(entry)) {
    startLine = entry[0];
    endLine = entry[1];
  } else if (typeof entry === 'object' && entry.line !== undefined) {
    startLine = endLine = entry.line;
    if (entry.tokens) tokens = entry.tokens;
  } else {
    return;
  }

  lines.forEach(el => {
    const n = parseInt(el.dataset.line, 10);
    const inRange = n >= startLine && n <= endLine;
    el.classList.toggle('highlight', inRange);
    el.classList.toggle('dimmed', !inRange);
  });

  if (tokens.length > 0) {
    const lineEl = pre.querySelector('[data-line="' + startLine + '"]');
    if (lineEl) {
      tokens.forEach(tokName => {
        const tok = lineEl.querySelector('[data-tok="' + tokName + '"]');
        if (tok) tok.classList.add('tok-highlight');
      });
    }
  }

  const container = pre.closest('#ml-code') || pre.parentElement;
  if (!container) return;
  const firstLine = pre.querySelector('[data-line="' + startLine + '"]');
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
  pre.querySelectorAll('.tok-highlight').forEach(t => t.classList.remove('tok-highlight'));
}
