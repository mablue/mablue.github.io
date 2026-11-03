# HANDOFF — MasoudSoft (v8, post-chunk-migration)

**Generated:** 2026-10-31
**Repo:** github.com/mablue/mablue.github.io · **Live:** masoudsoft.ir
**Previous handoffs:** HANDOFF-v1.md (v6 era), HANDOFF-v2.md (if exists)

---

## §0 — TL;DR for new LLM

**What is this:** Persian-language interactive film portfolio for **Masoud Azizi** (Tabriz, Iran). Three.js scenes + custom audio-driven Player. Each "clip" is a chaptered mini-documentary with 3D visuals synced to narration in 3 languages (AZ/FA/EN).

**Current state (as of 2026-10-31):**

| Clip | Audio mode | Status |
|---|---|---|
| ml101 (linear regression) | chunk-based v7 | ✅ working |
| ml102 (feature eng x²) | chunk-based v7 | ✅ working |
| ml103 (hidden layer + ReLU) | chunk-based v7 | ✅ working |
| ml104 (classification) | chunk-based v7 | ✅ working |
| dark-matter (8 ch) | single-file v6 | not migrated |
| solar-system (10 ch) | single-file v6 | not migrated |

**Critical pending issue (see §9):** ml101/102/103 chunk mp3 files return 404 on `raw.githubusercontent.com` but exist in git HEAD. ml104 works. Root cause under investigation — could be Git LFS, raw CDN lag, or partial push. **Verify before assuming production works.**

---

## §1 — User & Communication

- **Name:** Masoud Azizi (مسعود عزیزی)
- **Location:** Tabriz, Iran
- **Languages:** Persian (primary), Azerbaijani Turkish
- **Environment:** **Termux on Android phone** — no desktop, **no F12 DevTools**
- **Style:** Direct, no fluff. When broken, say so plainly.
- **When he says "بسه":** stop adding features.

**CRITICAL:**
- **No F12.** Debug on-screen only (visible div, log panel, `_debugLog` helper)
- **Mobile = fragile.** Long scripts spawning ffmpeg + node + python + server simultaneously **will OOM**. Keep scripts ≤100 lines, split into phases
- **No hand-waving.** If untested, say so. He tests on phone, reports back

---

## §2 — Environment (Termux)

### Paths
- Repo: `~/mablue_repos_dump/mablue.github.io`
- Player: `player/`
- Clips: `clips/<name>/`
- Vendor: `vendor/three/` (three.js r160, local, no CDN)
- Single-file audio: `clips/<name>/audio/{az,fa,en}/*.mp3`
- Chunk audio: `clips/<name>/audio-chunks/{az,fa,en}/ch{N}/00.mp3, 01.mp3...`

### Server
```bash
cd ~/mablue_repos_dump/mablue.github.io
pkill -f "http.server 8765" 2>/dev/null || true
sleep 1
nohup python3 -m http.server 8765 > ~/server.log 2>&1 &
sleep 2
curl -sI http://127.0.0.1:8765/ | head -1
```

Always || true after pkill — otherwise set -e scripts exit when no process found.

Tools

· node (v26) — node --check file.js, node -e "..." for config parsing
· python3 (3.14) — scripts; avoid heavy loops
· ffmpeg, ffprobe — audio
· edge_tts (Python package ≥ 7.3.1 required)
· git, gh CLI, curl

NOT available

· ❌ Chrome DevTools / F12
· ❌ xterm GUI
· ❌ Desktop environment
· ⚠️ which command (use command -v)
· ⚠️ /tmp/ writable (use ~/)

---

§3 — Architecture

Directory layout

```
mablue.github.io/
├── vendor/three/                 three.js r160 (local)
├── player/
│   ├── player.v7.js              CURRENT — chunk-aware (queue mode)
│   ├── player.v6.js              previous — single-file only
│   ├── player.v4.js, v5.js       older fallbacks
│   ├── player.js                 oldest fallback
│   ├── player.css
│   ├── scene-base.js             base class for scenes
│   ├── setup.js                  startClip() + Three.js boilerplate + extraSetup support
│   ├── walkthrough.js            code line-by-line highlight
│   ├── visuals.js                updateLine / updateCurve / updateDrops
│   ├── training.js               drawLossChart / updateTrainingHUD
│   └── i18n.js                   langText(lang, key)
├── clips/
│   ├── ml101/ (5 ch, 73 chunk/lang, 219 files)  v7
│   ├── ml102/ (5 ch, 22 chunk/lang, 66 files)   v7
│   ├── ml103/ (5 ch, 24 chunk/lang, 72 files)   v7
│   ├── ml104/ (5 ch, 22 chunk/lang, 66 files)   v7
│   ├── dark-matter/ (8 ch)  v6
│   └── solar-system/ (10 ch) v6
├── media/music/ (43 MP3)
├── media/podcast/ (113 MP3)
├── *.html
├── MASTER_CONTEXT.md, MASTER_SOURCE.md
├── HANDOFF.md (this file)
├── HANDOFF-v1.md, HANDOFF-v2.md (older)
└── _wp_data.json, _music.json, _podcast.json, _assets.json
```

Player ownership contract

Player builds/renders internally:

· .top-bar, .subtitle-bar, .controls, progress bar, time, lang toggle
· Autoplay with gesture fallback (tap-to-play pill)
· Next-clip button at end
· Chunk-to-chunk auto-advance (queue mode)

Clip provides (via config.js):

· clip.name, backUrl, backText, defaultLang, nextClip, nextClipLabel
· clip.ui: [{id, html}] — overlay panels
· chapters[] — each with audio, chunks, duration, chunkDurations

Clip main.js provides (via startClip()):

· chapters, clip, SceneClasses[], cameraPos, cameraTarget
· Either makeData() OR extraSetup(ctx, shared) for shared state

setup.js — critical detail

startClip() signature (v7+):

```js
export function startClip({
  chapters, clip,
  SceneClasses,
  makeData,           // optional: () => data array
  extraSetup,         // optional: (ctx, shared) => object to merge
  trueValues = {},
  cameraPos, cameraTarget, minDistance, maxDistance,
  starCount = 500,
  pointConfig = {},
  defaultLang = 'az',
})
```

extraSetup runs after shared is created. Its return value is Object.assign-ed onto both shared and ctx. This lets scenes access custom shared state (e.g. shared.DATA, shared.TARGET_R).

Bug history: ml104 used extraSetup but setup.js didn't call it until 2026-10-28. Result: shared.DATA = [], _loss() = NaN, _accuracy() = NaN. Fixed by adding extraSetup param + call.

---

§4 — Player v7 (queue mode) — the core

The contract

Two modes per chapter, detected by typeof audio[lang]:

audio[lang] Mode Mechanism
string single-file audio.src = url, seek via currentTime
array queue mode audio.src = audioQueue[i], auto-advance via ended

Queue state fields (constructor)

```js
this._queueMode = false;
this.audioQueue = [];
this.audioQueueIndex = 0;
this._chunkDurations = null;
```

Key methods

Method Queue-mode behavior
loadChapter(i) If audio[lang] is array → set queue, index=0, load first chunk
setLanguage(lang) Reload queue for new lang, reset index=0
_computeChunks() If queue mode: chunks = texts.map((t,i)=>({start:i, text:t})), sets currentChunk = audioQueueIndex, explicitly sets subtitle text for chunk 0 (fixes first-chunk-hide bug)
_onTimeUpdate() Branches to _onTimeUpdateQueue() in queue mode
_onTimeUpdateQueue() Progress from _chunkDurations, global time = sum(durations before idx) + currentTime
ended handler If queue has next chunk → advance, audio.src = next, play. Else → next chapter
subtitle nav (‹›) audioQueueIndex += dir, audio.src = newChunk, no seek
progress click global time → chunk index + local offset, then load + seek within chunk
update(dt) Passes global audioTime and duration (sum of chunkDurations) to scenes

Chapter config format (v7)

```js
{
  n: 1, title: 'Data', duration: 44.3, built: true,
  audio: {
    az: ['./clips/ml101/audio-chunks/az/ch1/00.mp3?v=...', ...],
    fa: [...],
    en: [...],
  },
  chunks: {
    az: ['Sentence 1.', 'Sentence 2.', ...],
    fa: [...],
    en: [...],
  },
  chunkDurations: {
    az: [3.2, 2.8, 4.1, ...],
    fa: [...],
    en: [...],
  }
}
```

duration = sum(chunkDurations.az) (updated after ELI5 rewrite because old durations were stale).

---

§5 — Audio pipeline

Requirements for Chrome Android seek

edge_tts default MP3s DO NOT seek on Chrome Android. Clicking seek jumps to 0. Root cause: missing/malformed Xing header.

Fix — re-encode every MP3:

```bash
ffmpeg -y -i input.mp3 \
  -c:a libmp3lame -b:a 48k -ac 1 -ar 22050 \
  -write_xing 1 -id3v2_version 3 \
  -map_metadata -1 -fflags +bitexact \
  output.mp3
```

Applied to: all audio-chunks (ml101-104) and single-file audio (ml101-104).
NOT applied to: clips/dark-matter/audio/*, clips/solar-system/audio/* (v6 clips, still using cached audio which masks the bug on some devices).

edge_tts — CRITICAL VERSION

Requires edge-tts ≥ 7.3.1. Microsoft changed auth flow around Oct 2026; older versions fail with NoAudioReceived. Verify with python3 -c "import edge_tts; print(edge_tts.__version__)".

TTS voices

· AZ: az-AZ-BabekNeural (fallback: az-AZ-BanuNeural)
· FA: fa-IR-FaridNeural (fallback: fa-IR-DilaraNeural)
· EN: en-US-AriaNeural
· Rate: -8% for clarity

Persian phonetic substitution

fa-IR-FaridNeural mispronounces Latin letters. Apply to TTS input only (subtitles stay Latin):

```python
PLAIN_REPLS = [
    ('X_new', 'ایکس نیو'), ('x_new', 'ایکس نیو'), ('y_pred', 'وای پردیکت'),
    ('W₁', 'دابلیو یک'), ('W₂', 'دابلیو دو'),
    ('X²', 'ایکس به توان دو'), ('x²', 'ایکس به توان دو'),
    ('x**2', 'ایکس به توان دو'),  # use str.replace NOT re.sub (** breaks regex)
    ('ReLU', 'رِلو'), ('PyTorch', 'پای‌تورچ'), ('Python', 'پایتون'),
    ('SGD', 'اس‌جی‌دی'), ('Adam', 'آدام'), ('Linear', 'لینیر'), ('MSE', 'ام‌اس‌ای'),
    ('Sigmoid', 'سیگموید'), ('BCE', 'بی‌سی‌ای'),
    ('Cross-entropy', 'کراس آنتروپی'), ('Binary cross-entropy', 'باینری کراس آنتروپی'),
    ('feature', 'فیچر'),
]
WORD_REPLS = [
    (r'\bX\b', 'ایکس'), (r'\bY\b', 'وای'), (r'\bW\b', 'دابلیو'), (r'\bB\b', 'بی'),
    (r'\bx\b', 'ایکس'), (r'\by\b', 'وای'), (r'\bw\b', 'دابلیو'), (r'\bb\b', 'بی'),
    (r'\bW1\b', 'دابلیو یک'), (r'\bW2\b', 'دابلیو دو'),
]

def subst(t):
    for a, b in PLAIN_REPLS: t = t.replace(a, b)
    for pat, rep in WORD_REPLS: t = re.sub(pat, rep, t)
    return t
```

Apply order matters: PLAIN first (handles multi-char tokens like W₁ before WORD_REPLS eats W).

Chunk TTS generation (canonical pattern)

```python
import asyncio, edge_tts, pathlib, subprocess

async def gen_one(text, out_path, voice, rate='-8%'):
    comm = edge_tts.Communicate(text, voice, rate=rate)
    buf = bytearray()
    async for c in comm.stream():
        if c['type'] == 'audio': buf += c['data']
    if not buf: raise RuntimeError('empty')
    tmp = out_path.with_suffix('.raw.mp3')
    tmp.write_bytes(bytes(buf))
    subprocess.run(['ffmpeg','-y','-i',str(tmp),
        '-c:a','libmp3lame','-b:a','48k','-ac','1','-ar','22050',
        '-write_xing','1','-id3v2_version','3',
        '-map_metadata','-1','-fflags','+bitexact', str(out_path)],
        check=True, capture_output=True)
    tmp.unlink()
```

Always separate phases per language on mobile (AZ → verify → FA → verify → EN → verify), not all 3 at once — prevents OOM.

---

§6 — Bugs encountered & fixed (full history)

Bash / shell

1. pkill ...  without || true → scripts exit on set -e when no process found
2. /tmp/ NOT writable on Termux → use ~/ or $HOME/
3. sed -E "s|(a|b)|...|" → | is delimiter AND alternation → "unknown option to 's'". Use Python re.sub.
4. cat > file << 'EOF' with content containing   ``` → markdown in chat breaks. Use ````` placeholder + Python chr(96)*3 replacement
5. python3 << 'EOF' → tries to open file named EOF. Use python3 - << 'EOF' (stdin)
6. Long scripts with ffmpeg + node + python + server simultaneously → OOM on mobile
7. git push rejected → git fetch origin && git pull --rebase origin main -X theirs && git push origin main
8. !clips/... in bash → history expansion. Termux bash has H set by default. Use set +H first, or echo "..." >> file via Python
9. which not installed on Termux → use command -v

Python

1. re.sub(pattern, replacement, s) with \n in replacement → interprets as newline. Use str.replace or Path.write_text
2. re.sub('x**2', ...) → ** means "multiple repeat" regex error. Use str.replace
3. Path(BK) / 'sub' vs BK / 'sub' where BK is str → TypeError. Always pathlib.Path(BK)
4. python3 script.py << EOF → wrong. Use python3 - << EOF for stdin
5. done scope in nested functions → cosmetic NameError at end, files fine. Just print after asyncio.run

JavaScript / ES modules

1. ES module cache → ?v=YYYYMMDD-HHMMSS on all imports. If cache refuses: rename file (player.v6.js → player.v7.js)
2. player.currentChunk stale in loadChapter → reset to -1
3. Method defined outside class → str.replace silently fails. Verify: grep -c "^  methodName(" file.js should be 1 (2 spaces indent)
4. this._method in event handler → arrow functions keep this, function(){} do not
5. opacity:0 canvas → 300×150 default. _resizeCheck in every frame
6. Backward scrub → state-driven _setVisible([ids]) not class toggles

Player v7 — specific bugs fixed

1. First-chunk subtitle hidden on chapter entry — _computeChunks (queue branch) set currentChunk = 0 which made if (idx !== currentChunk) false in _onTimeUpdateQueue. Fix: explicitly set sub-text.textContent in _computeChunks when entering.
2. extraSetup return ignored by setup.js — ml104's shared.DATA = [] → NaN in loss/acc on ch4. Fix: added extraSetup param + call in setup.js.
3. ch.duration stale after ELI5 rewrite — progress/markers used old durations. Fix: set ch.duration = sum(chunkDurations.az) during config migration.
4. _renderMarkers used ch.duration but progress bar used chunkDurations — misaligned markers. Fix: _renderMarkers uses chunkDurations[lang] sum when present.

Cloudflare

1. cf-cache-status: HIT → Purge Everything
2. Purge not immediate → wait 30s, or test with ?bypass=$(date +%s)
3. JS modules cached → rename file if purge fails
4. Page Rule needed for auto-purge on /player/* (NOT set up yet — manual purge required each deploy)

Deployment

1. git push timeout → git -c http.postBuffer=1048576000 -c http.lowSpeedLimit=0 -c http.lowSpeedTime=999999 push
2. Workflow auto-sync runs every 6h → may push chore: auto-sync commits, blocking your push
3. Browser cache → ?fresh=1 + Settings → Clear cached files
4. .gitignore *.mp3 hid 423 chunk files from git for weeks. Fix: whitelist !clips/**/audio-chunks/**/*.mp3 in .gitignore + git add -f (only after fixing .gitignore — -f alone doesn't persist if .gitignore still blocks)

---

§7 — Tools & commands (quick reference)

Compare local vs remote vs live

```bash
cd ~/mablue_repos_dump/mablue.github.io
echo "local:  $(wc -l < player/player.v7.js) lines"
echo "commit: $(git show origin/main:player/player.v7.js 2>/dev/null | wc -l) lines"
echo "remote: $(curl -s https://raw.githubusercontent.com/mablue/mablue.github.io/main/player/player.v7.js | wc -l) lines"
echo "cache:  $(curl -sI https://masoudsoft.ir/player/player.v7.js | grep cf-cache)"
```

Parse config with node

```bash
node -e "
const fs = require('fs');
const code = fs.readFileSync('clips/ml101/config.js', 'utf8').replace(/export /g, '');
const { clip, chapters } = new Function(code + '; return { clip, chapters };')();
console.log(JSON.stringify(chapters.map(c => ({ n: c.n, az: c.chunks.az.length, audio: Array.isArray(c.audio?.az) ? c.audio.az.length : 'string' }))));
"
```

Probe all chunk durations to JSON

```bash
OUT=~/chunks_dur.json
echo '{' > "$OUT"
FIRST_L=1
for L in az fa en; do
  if [ $FIRST_L -eq 0 ]; then echo ',' >> "$OUT"; fi
  FIRST_L=0
  echo -n "\"$L\": [" >> "$OUT"
  FIRST=1
  for d in 1 2 3 4 5; do
    for f in clips/ml101/audio-chunks/$L/ch$d/*.mp3; do
      dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null)
      if [ $FIRST -eq 0 ]; then echo -n ',' >> "$OUT"; fi
      FIRST=0
      echo -n "${dur:-0}" >> "$OUT"
    done
  done
  echo -n ']' >> "$OUT"
done
echo '}' >> "$OUT"
```

Bump version everywhere

```bash
NEW_VER=$(date +%Y%m%d-%H%M%S)
NEW_VER="$NEW_VER" python3 - << 'PYEOF'
import pathlib, re, glob, os
ver = os.environ['NEW_VER']
for f in glob.glob('clips/*/main.js') + glob.glob('clips/*/scenes/*.js'):
    p = pathlib.Path(f); s = p.read_text()
    s2 = re.sub(r'(from\s+[\'\"][^\'\"]*?)\.js\?v=[\d-]+([\'\"])', rf'\1.js?v={ver}\2', s)
    if s2 != s: p.write_text(s2)
p = pathlib.Path('player/setup.js'); s = p.read_text()
s = re.sub(r'player\.v\d+\.js\?v=[\d-]+', f'player.v7.js?v={ver}', s)
p.write_text(s)
for f in glob.glob('*.html'):
    p = pathlib.Path(f); s = p.read_text()
    s2 = re.sub(r'\?v=[0-9A-Za-z._-]+', f'?v={ver}', s)
    if s2 != s: p.write_text(s2)
print(f'BUMP={ver}')
PYEOF
```

Deploy

```bash
cd ~/mablue_repos_dump/mablue.github.io
git add -A
git -c user.email="mablue92@gmail.com" -c user.name="Masoud Azizi" \
  commit -m "message"
git push origin main 2>&1 | tail -3
# If rejected:
git fetch origin && git pull --rebase origin main -X theirs && git push origin main
# Then Cloudflare → Caching → Purge Everything
```

Health check (full chain)

```bash
CB=$(date +%s)
for f in ml104.html player/player.v7.js player/setup.js clips/ml104/main.js clips/ml104/config.js clips/ml104/scenes/scene4.js; do
  local=$(wc -l < "$f" 2>/dev/null)
  live=$(curl -s "https://masoudsoft.ir/$f?cb=$CB" | wc -l)
  if [ "$local" = "$live" ]; then echo "OK   $f ($local)"; else echo "DIFF $f  local=$local live=$live"; fi
done

# Check audio chunks
for m in ml101 ml102 ml103 ml104; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://masoudsoft.ir/clips/$m/audio-chunks/az/ch1/00.mp3?cb=$CB")
  echo "  $m audio: HTTP $code"
done
```

---

§8 — Current state

DONE ✓

· Player v7 with queue mode (chunk-based audio, no seek drift)
· ml101, ml102, ml103, ml104 fully migrated to chunk-based
· 423 chunk MP3 files generated (ml101=219, ml102=66, ml103=72, ml104=66)
· All chunk MP3s re-encoded with -write_xing 1 (mobile seek fix)
· All commits pushed to GitHub main branch
· .gitignore fixed to allow clips/*/audio-chunks/**/*.mp3
· setup.js supports extraSetup return
· First-chunk subtitle bug fixed
· ml104 ch4 NaN bug fixed
· Chapter markers language-aware
· Chapter duration = sum(chunkDurations.az)
· HANDOFF-v1.md and this file exist

IN PROGRESS / UNRESOLVED ⚠️

Audio chunk raw.githubusercontent.com 404 issue (2026-10-31):

· ml104 az/ch1/00.mp3 → HTTP 200 on raw.githubusercontent.com ✓
· ml101 az/ch1/00.mp3 → HTTP 404 ⚠️
· ml102 az/ch1/00.mp3 → HTTP 404 ⚠️
· ml103 az/ch1/00.mp3 → HTTP 404 ⚠️
· Yet git ls-tree -r HEAD likely contains all 423 files (commit message said so)
· Possible causes: Git LFS behavior, GitHub raw CDN lag, partial push race with auto-sync
· NEXT LLM MUST VERIFY BEFORE ASSUMING PRODUCTION WORKS

TODO

1. Diagnose chunk 404s (§9) — priority #1
2. Test ml101-104 on live (masoudsoft.ir) once 404s resolved
3. Re-encode dark-matter & solar-system audio with -write_xing 1 (NOT chunk migration — just Xing fix)
4. Later: migrate dark-matter (8 ch) + solar-system (10 ch) to chunk mode
5. Later: clean up old player versions (player.v4.js, v5.js, player.js, v6.js) after v7 stable ~60KB saved
6. Later: Cloudflare Page Rule for auto-purge on /player/*
7. Later: check media/podcast/ size (du -sh media/podcast). If >500MB, move to GitHub Releases
8. Later: update MASTER_CONTEXT.md to reflect v7 era

---

§9 — The immediate pending action (chunk 404 diagnosis)

GitHub raw returning 404 for ml101/102/103 while ml104 works is suspicious. Commands to run:

```bash
cd ~/mablue_repos_dump/mablue.github.io

# 1. git ls-tree — files in commit?
for m in ml101 ml102 ml103 ml104; do
  echo "$m: $(git ls-tree -r HEAD -- clips/$m/audio-chunks | wc -l) files in HEAD"
done

# 2. GitHub API — authoritative source of truth
for m in ml101 ml102 ml103 ml104; do
  code=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://api.github.com/repos/mablue/mablue.github.io/contents/clips/$m/audio-chunks/az/ch1/00.mp3")
  echo "$m: API HTTP $code"
done

# 3. raw with cache buster
for m in ml101 ml102 ml103 ml104; do
  cb=$(date +%s%N)
  code=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://raw.githubusercontent.com/mablue/mablue.github.io/main/clips/$m/audio-chunks/az/ch1/00.mp3?t=$cb")
  echo "$m: raw HTTP $code"
done

# 4. git check-ignore — still ignored?
git check-ignore -v clips/ml101/audio-chunks/az/ch1/00.mp3 || echo "not ignored"
```

Interpretation:

· API 404 → file not actually in repo. Fix: git add -f for missing paths, commit, push.
· API 200, raw 404 → CDN cache. Fix: wait, use ?t=, or force-purge via API.
· git check-ignore reports ignored → .gitignore whitelist broken. Fix: verify pattern with git check-ignore -v.
· git ls-tree shows missing → files not committed at all. Fix: re-add, re-commit, re-push.

Once diagnosed: the fix will be one of:

1. Re-add missing files + commit + push
2. Wait for CDN + Cloudflare purge
3. Something structural about how GitHub handles the file (LFS, extension size limit, etc.)

---

§10 — On-screen debugging (no F12)

Use one of these approaches:

Green debug panel (already in player.v7)

```javascript
function _debugLog(...args) {
  const el = document.getElementById('debug-panel') || (() => {
    const d = document.createElement('div');
    d.id = 'debug-panel';
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;max-height:30vh;overflow-y:auto;background:rgba(0,0,0,0.92);color:#0f0;font-family:monospace;font-size:11px;padding:6px;z-index:999999;white-space:pre-wrap;';
    document.body.appendChild(d);
    return d;
  })();
  el.textContent += args.join(' ') + '\n';
  el.scrollTop = el.scrollHeight;
}
```

User taps panel to dismiss. Screenshot → paste → new LLM reads.

Log div in HTML (safer, no JS setup)

```html
<div id="onscreen-log" style="position:fixed;top:0;left:0;right:0;max-height:35vh;
     overflow-y:auto;background:rgba(0,0,0,0.92);color:#0f0;font-family:monospace;
     font-size:11px;padding:6px;z-index:999999;display:none;white-space:pre-wrap;"></div>
```

Rules

· NEVER setInterval at <500ms — kills mobile browsers
· Combine multiple log lines into one textContent += per event
· Use \n at end of each log line

---

§11 — Files to read next (for deeper context)

· HANDOFF-v1.md — v6 era handoff, older but detailed
· MASTER_CONTEXT.md — older docs (partly outdated)
· MASTER_SOURCE.md — full source of player/ helpers
· player/player.v7.js — source of truth for player behavior
· clips/ml101/config.js — canonical v7 config format
· clips/ml101/main.js — minimal startClip pattern
· clips/ml101/scenes/scene5.js — walkthrough scene example
· clips/ml104/main.js — extraSetup example

---

§12 — Pre-response checklist

Before hitting "send", verify:

☐ Script ≤100 lines? (or split into phases)
☐ pkill ... || true included?
☐ No /tmp/ — using ~/?
☐ No sed with | delimiter that has regex alternation?
☐ No re.sub with \n in replacement?
☐ No bash ! history expansion in heredocs?
☐ ?v= bumped on all changed files?
☐ Verification step (grep/wc/curl) provided?
☐ Honest about tested vs untested?
☐ Responding to actual ask, not a tangent?
☐ If debugging live vs local: compare byte-by-byte, not just line counts

---

§13 — Philosophical notes (from repeated user frustration)

User got angry when: an LLM said "it's a cache issue, just purge" without verifying byte-for-byte that local/git/live all match. The actual bug was .gitignore hiding 423 files for weeks.

Lesson: When live doesn't work but local does, assume files are missing before assuming cache. Verify with:

1. git ls-files — are files tracked?
2. git check-ignore — are they ignored?
3. curl raw.githubusercontent.com — are they on GitHub?
4. curl masoudsoft.ir — are they on live?

Compare bytes, not line counts (line counts miss content changes).

Don't defend. Say plainly what's broken and fix it.

---

END OF HANDOFF

Check order for any question:

1. This HANDOFF.md
2. player/player.v7.js (player behavior — queue mode is subtle)
3. clips/ml101/config.js (canonical chapter format)
4. clips/ml104/main.js (extraSetup example)
5. HANDOFF-v1.md (v6 era, historical)
6. Ask user directly — he knows the project

If live is broken but local isn't:

· FIRST check if files exist in git (git ls-tree)
· THEN check .gitignore
· THEN check raw.githubusercontent.com
· THEN check Cloudflare cache
· NOWHERE in that order is "just purge" the first answer
