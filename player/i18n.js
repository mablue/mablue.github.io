const MAPS = {
  lossSub: { az: 'kiçik = yaxşı', fa: 'کمتر = بهتر', en: 'smaller = better' },
};

export function langText(lang, key) {
  const m = MAPS[key];
  if (!m) return '';
  return m[lang] || m.en || '';
}
