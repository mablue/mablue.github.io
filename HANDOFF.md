# HANDOFF — MasoudSoft Project

**Generated:** 2026-10-28
**For:** Continuation by a new LLM
**Repo:** github.com/mablue/mablue.github.io · **Live:** masoudsoft.ir

---

## §0 — TL;DR for the new LLM

You are continuing a Persian-language interactive film portfolio for **Masoud Azizi**. Stack: Three.js + custom Player class + per-clip configs. Currently **mid-migration** of clip `ml101` from single-file audio to **chunk-based audio** (one MP3 per sentence). The goal: eliminate a seek-sync bug where subtitle clicks reset audio to 0 on Chrome Android.

**Priority order:**
1. Verify ML101 chunk migration completed successfully (may or may not have run — see §8)
2. Test ML101 with new player.v7
3. Replicate for ml102, ml103, ml104
4. Later: dark-matter, solar-system (bigger effort)

**Read this whole document before responding.** It exists because the last session burned hours on repeated mistakes.

---

## §1 — User & Communication

- **Name:** Masoud Azizi (مسعود عزیزی)
- **Location:** Tabriz, Iran
- **Languages:** Persian (primary), Azerbaijani Turkish
- **Environment:** **Termux on Android phone** — no desktop, **no F12 DevTools**
- **Style:** Direct, no fluff, no self-congratulatory bullets
- **When broken:** Say so plainly, don't defend
- **When he says "بسه":** stop adding features
- **Prefers:** single-shot bash scripts, or step-by-step micro-fixes (1-2 lines each)

**CRITICAL:**
- **No F12.** Any debugging must be on-screen (visible div, log panel, or `_debugLog` helper)
- **Mobile = fragile.** Long scripts that spawn ffmpeg + node + python + curl + server simultaneously **will OOM the device**. Keep scripts ≤100 lines, split into phases
- **No hand-waving.** If untested, say so. He'll test on his phone and report

---

## §2 — Environment

### Paths
- **Repo:** `~/mablue_repos_dump/mablue.github.io`
- **Player:** `player/`
- **Clips:** `clips/<name>/`
- **Vendor:** `vendor/three/` (three.js r160, local, no CDN)
- **Audio per clip:** `clips/<name>/audio/{az,fa,en}/`
- **Chunk audio:** `clips/<name>/audio-chunks/{az,fa,en}/ch{N}/00.mp3, 01.mp3...`

### Servers
```bash
# Start local server
cd ~/mablue_repos_dump/mablue.github.io
pkill -f "http.server 8765" 2>/dev/null || true
sleep 1
nohup python3 -m http.server 8765 > ~/server.log 2>&1 &
sleep 2
curl -sI http://127.0.0.1:8765/ | head -1
```

**Always `|| true` after `pkill`** — otherwise `set -e` scripts exit when no process found.

### Tools available
- `node` — `node --check file.js` for syntax; `node -e "..."` for parsing config.js
- `python3` — scripts; **avoid heavy loops** on mobile
- `ffmpeg`, `ffprobe` — audio
- `edge_tts` (Python) — TTS
- `git`, `gh` CLI, `curl`

### NOT available
- ❌ Chrome DevTools / F12
- ❌ xterm GUI
- ❌ Desktop environment

---

## §3 — Architecture

### Directory layout
```
mablue.github.io/
├── vendor/three/                 three.js r160 (local)
├── player/
│   ├── player.v7.js              NEW — chunk-aware (in progress)
│   ├── player.v6.js              previous — used by ml102/103/104, darkmatter, solar
│   ├── player.v4.js, v5.js       older fallbacks
│   ├── player.js                 oldest fallback
│   ├── player.css                styles
│   ├── scene-base.js             base class for scenes
│   ├── setup.js                  startClip() + Three.js boilerplate
│   ├── walkthrough.js            code line-by-line highlight
│   ├── visuals.js                updateLine / updateCurve / updateDrops
│   ├── training.js               drawLossChart / updateTrainingHUD
│   └── i18n.js                   langText(lang, key)
├── clips/
│   ├── dark-matter/              8 chapters (player.v6, string audio)
│   ├── solar-system/             10 chapters (player.v6, string audio)
│   ├── ml101/                    5 chapters (player.v7, array audio) — IN PROGRESS
│   ├── ml102/                    5 chapters (player.v6, string audio)
│   ├── ml103/                    5 chapters (player.v6, string audio)
│   └── ml104/                    5 chapters (player.v6, string audio)
├── media/
│   ├── music/                    43 MP3s
│   └── podcast/                  113 MP3s (user uploaded manually)
├── index.html, ml101.html, ml102.html, ml103.html, ml104.html,
│   darkmatter.html, solarsystem.html
├── MASTER_CONTEXT.md, MASTER_SOURCE.md  (older handoff docs)
└── _wp_data.json, _music.json, _podcast.json, _assets.json
```

### Player ownership contract

**Player owns (builds/renders internally):**
- `.top-bar` (brand + back link)
- `.subtitle-bar` (prev/next + text)
- `.controls` (play button, progress bar, time, lang toggle)
- Language buttons (rendered from detected languages)
- Autoplay with gesture fallback (`▶ tap to play` pill)
- Next-clip button at end of last chapter
- Chunk-to-chunk auto-advance (queue mode)

**Clip provides (via `config.js`):**
- `clip.name`, `clip.backUrl`, `clip.backText`, `clip.defaultLang`
- `clip.nextClip`, `clip.nextClipLabel` (optional)
- `clip.ui: [{id, html}]` — overlay panels for scenes
- `chapters[]` — each with `audio`, `chunks`, `duration`, `chunkDurations`

**Player does NOT know:**
- Clip names, chapter count, audio paths, anything specific

### Chapter contract

**Old format (still works in v7):**
```javascript
{
  n: 1, title: 'Data', duration: 39.4, built: true,
  audio: {
    az: './clips/ml101/audio/az/data.mp3?v=20261028-XXXXXX',
    fa: './clips/ml101/audio/fa/data.mp3?v=20261028-XXXXXX',
    en: './clips/ml101/audio/en/data.mp3?v=20261028-XXXXXX',
  },
  chunks: {
    az: ['Sentence 1.', 'Sentence 2.', ...],
    fa: [...],
    en: [...],
  }
}
```

**New format (chunk-based):**
```javascript
{
  n: 1, title: 'Data', duration: 39.4, built: true,
  audio: {
    az: [
      './clips/ml101/audio-chunks/az/ch1/00.mp3?v=...',
      './clips/ml101/audio-chunks/az/ch1/01.mp3?v=...',
      // length === chunks.az.length
    ],
    fa: [...],
    en: [...],
  },
  chunks: { az: [...], fa: [...], en: [...] },
  chunkDurations: {
    az: [3.2, 2.8, 4.1, ...],   // optional, for accurate progress bar
    fa: [...],
    en: [...],
  }
}
```

**Player behavior:**
| `audio[lang]` | Mode | `currentChunk` source | Progress |
|---|---|---|---|
| `string` | Single-file | Estimated from word count | `t/dur` |
| `array` | **Queue** | `audioQueueIndex` | From `chunkDurations` if present, else `idx/total` |

---

## §4 — Player v7 (in progress)

**Status:** written, not confirmed tested.

8 patches from v6:
1. Constructor: `_queueMode`, `audioQueue`, `audioQueueIndex`, `_chunkDurations`
2. `_computeChunks()`: no-op in queue mode
3. `loadChapter()`: array → queue init
4. `setLanguage()`: same
5. `ended` handler: advance chunk in queue mode, else chapter
6. `_onTimeUpdate()`: queue mode → global time from `chunkDurations`
7. `update(dt)`: passes global `sceneTime`, `sceneDuration` to scenes
8. Click handler + progress track: queue-aware

**Full source:** `player/player.v7.js` after migration script runs.

### Key methods (v6/v7 shared)
```javascript
_ensureChrome()         // builds top-bar/subtitle/controls if missing
_injectClipUI()         // injects clip.ui[] panels as .scene-ui.hidden
_renderLangButtons()    // from languages detected in chapters[0].audio keys
_tryPlay()              // autoplay + gesture fallback
_showTapHint()          // "▶ tap to play" pill
_armGesture()           // waits for first tap to retry play
_loadChapter(i)         // hides all .scene-ui, enters scene, starts audio
_subtitleNav(dir)       // prev/next chunk (currently inline click handler)
```

---

## §5 — Audio format requirements

### For seek support on Chrome Android

**edge_tts default MP3s DO NOT seek on Chrome Android.** Clicking seek jumps to 0. Root cause: missing/malformed Xing header.

**Fix — re-encode every MP3:**
```bash
ffmpeg -y -i input.mp3 \
  -c:a libmp3lame -b:a 48k -ac 1 -ar 22050 \
  -write_xing 1 -id3v2_version 3 \
  -map_metadata -1 -fflags +bitexact \
  output.mp3
```

**Applied to:** ml101, ml102, ml103, ml104 (all audio).
**NOT yet applied to:** `clips/dark-matter/audio/*` and `clips/solar-system/audio/*` (they still have broken MP3s, but those clips currently use single-file mode with cached audio so bug may not be visible on all devices).

### TTS voices (edge_tts)
- **AZ:** `az-AZ-BabekNeural` (fallback: `az-AZ-BanuNeural`)
- **FA:** `fa-IR-FaridNeural` (fallback: `fa-IR-DilaraNeural`)
- **EN:** `en-US-AriaNeural`
- **Rate:** `-8%` for clarity

### Persian phonetic substitution

`fa-IR-FaridNeural` mispronounces Latin letters. Apply before TTS:

```python
PLAIN_REPLS = [
    ('X_new', 'ایکس نیو'), ('x_new', 'ایکس نیو'), ('y_pred', 'وای پردیکت'),
    ('W₁', 'دابلیو یک'), ('W₂', 'دابلیو دو'),
    ('X²', 'ایکس به توان دو'), ('x²', 'ایکس به توان دو'),
    ('x**2', 'ایکس به توان دو'),  # use str.replace NOT re.sub (** breaks regex)
    ('ReLU', 'رِلو'), ('PyTorch', 'پای‌تورچ'), ('Python', 'پایتون'),
    ('SGD', 'اس‌جی‌دی'), ('Adam', 'آدام'), ('Linear', 'لینیر'), ('MSE', 'ام‌اس‌ای'),
    ('feature', 'فیچر'),
]
WORD_REPLS = [
    (r'\bX\b', 'ایکس'), (r'\bY\b', 'وای'), (r'\bW\b', 'دابلیو'), (r'\bB\b', 'بی'),
    (r'\bx\b', 'ایکس'), (r'\by\b', 'وای'), (r'\bw\b', 'دابلیو'), (r'\bb\b', 'بی'),
]
```

**Subtitles stay Latin.** Only TTS input is substituted.

### Chunk-based audio (why)

edge_tts on Termux **does not return WordBoundary events** (returns 0). So we can't extract exact per-word timing. Solution: **generate one MP3 per sentence** — no seek needed, just `audio.src = nextFile`. `currentChunk` is exactly `audioQueueIndex`.

---

## §6 — Bug patterns (DO NOT REPEAT)

### Bash
1. **`pkill ... ` without `|| true`** → scripts exit on `set -e` when no process found
2. **`/tmp/` NOT writable on Termux** → use `~/` or `$HOME/`
3. **`sed -E "s|(a|b)|...|"`** → `|` is delimiter AND alternation → "unknown option to 's'". **Use Python `re.sub` instead.**
4. **`cat > file << 'EOF'` with content containing ` ``` `** → markdown rendering in chat breaks, use ````` placeholder + Python `chr(96)*3` replacement
5. **`python3 << 'EOF'`** → tries to open file named `EOF`. Use `python3 - << 'EOF'` (stdin)
6. **Long scripts with `ffmpeg` + `node` + `python` + server simultaneously** → OOM on mobile
7. **`git push` rejected** → `git fetch origin && git pull --rebase origin main -X theirs && git push origin main`

### Python
1. **`re.sub(pattern, replacement, s)`** with `\n` in replacement → interprets as newline. Use `str.replace` or `Path.write_text`
2. **`re.sub('x**2', ...)`** → `**` means "multiple repeat" regex error. Use `str.replace`
3. **`Path(BK) / 'sub'`** vs `BK / 'sub'` where BK is str → `TypeError`. Always `pathlib.Path(BK)`
4. **`python3 script.py << EOF`** → wrong. Use `python3 - << EOF` for stdin

### JS / modules
1. **ES module cache** → `?v=YYYYMMDD-HHMMSS` on all imports. If cache refuses: **rename file** (`player.v6.js` → `player.v7.js`)
2. **`player.currentChunk` stale in `loadChapter`** → reset to -1
3. **Method defined outside class** → `str.replace` silently fails. **Verify:** `grep -c "^  methodName(" file.js` should be 1 (2 spaces indent)
4. **`this._method` in event handler** → arrow functions keep `this`, `function(){}` do not
5. **`opacity:0` canvas** → 300×150 default. `_resizeCheck` in every frame
6. **Backward scrub** → state-driven `_setVisible([ids])` not class toggles

### Cloudflare
1. **`cf-cache-status: HIT`** → Purge Everything
2. **Purge not immediate** → wait 30s, or test with `?bypass=$(date +%s)`
3. **JS modules cached** → rename file if purge fails
4. **Page Rule needed** for auto-purge on `/player/*` (not set up yet)

### Deployment
1. **`git push` timeout** → `git -c http.postBuffer=1048576000 -c http.lowSpeedLimit=0 -c http.lowSpeedTime=999999 push`
2. **Workflow auto-sync runs every 6h** → may push `chore: auto-sync` commits, blocking your push
3. **Browser cache** → `?fresh=1` + Settings → Clear cached files

---

## §7 — Tools & commands

### Compare local vs remote
```bash
cd ~/mablue_repos_dump/mablue.github.io
echo "local:  $(wc -l < player/player.v7.js) lines"
echo "commit: $(git show origin/main:player/player.v7.js 2>/dev/null | wc -l) lines"
echo "remote: $(curl -s https://raw.githubusercontent.com/mablue/mablue.github.io/main/player/player.v7.js | wc -l) lines"
echo "cache:  $(curl -sI https://masoudsoft.ir/player/player.v7.js | grep cf-cache)"
```

### Parse config with node
```bash
node -e "
const fs = require('fs');
const code = fs.readFileSync('clips/ml101/config.js', 'utf8').replace(/export /g, '');
const { clip, chapters } = new Function(code + '; return { clip, chapters };')();
console.log(JSON.stringify(chapters.map(c => ({ n: c.n, az: c.chunks.az.length, audio: Array.isArray(c.audio?.az) ? c.audio.az.length : 'string' }))));
"
```

### Check audio duration + bitrate
```bash
ffprobe -v error -show_entries format=duration,bit_rate -of csv=p=0 clips/ml101/audio/az/data.mp3
```

### Re-encode for mobile seek
```bash
for f in clips/ml101/audio/az/*.mp3; do
  tmp="${f%.mp3}-tmp.mp3"
  ffmpeg -y -i "$f" -c:a libmp3lame -b:a 48k -ac 1 -ar 22050 \
    -write_xing 1 -id3v2_version 3 -map_metadata -1 -fflags +bitexact \
    "$tmp" 2>/dev/null && mv "$tmp" "$f"
done
```

### Generate chunk TTS (edge_tts)
```python
import asyncio, edge_tts
async def gen(text, voice, out_path):
    comm = edge_tts.Communicate(text, voice, rate="-8%")
    with open(out_path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
# then re-encode with ffmpeg (see above)
```

### Bump version everywhere
```bash
NEW_VER=$(date +%Y%m%d-%H%M%S)
python3 -c "
import pathlib, re, glob
ver = '$NEW_VER'
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
"
```

### Deploy
```bash
git add -A
git -c user.email="mablue92@gmail.com" -c user.name="Masoud Azizi" \
  commit -m "message"
git push origin main 2>&1 | tail -3
# If rejected:
git fetch origin && git pull --rebase origin main -X theirs && git push origin main
# Then Cloudflare → Caching → Purge Everything
```

---

## §8 — Current state

### DONE ✓

- Player v6 with `_subtitleNav` inline, autoplay gesture fallback, animation fallback (`performance.now()` when audio blocked)
- 4 ML clips built: ml101 (linear regression), ml102 (feature engineering x²), ml103 (hidden layer + ReLU), ml104 (classification)
- ML101 fully rewritten in ELI5 Persian/Azerbaijani/English — hill descent analogy, ice cream shop story, word-by-word code walkthrough
- ML104 classification with heatmap visual, sigmoid HUD, accuracy counter
- **All ML audio re-encoded with `-write_xing 1`** (fixes Chrome Android seek bug)
- **ML101 chunk audio generated:** `clips/ml101/audio-chunks/{az,fa,en}/ch{1-5}/*.mp3` (62 chunks/language, 186 files)
- Duplicate `.opus` music deleted (43 files, ~20MB freed)
- MASTER_CONTEXT.md + MASTER_SOURCE.md exist (partially outdated — cover pre-v7)
- All pushed to GitHub, Cloudflare purged

### IN PROGRESS (verify before continuing)

**ML101 chunk migration** — `migrate-ml101-chunks.sh` was provided; user said they ran a shell file but didn't confirm which.

**Verify by running:**
```bash
cd ~/mablue_repos_dump/mablue.github.io
echo "=== player.v7 exists? ==="
ls -la player/player.v7.js 2>&1
echo "=== config has chunkDurations? ==="
grep -c "chunkDurations" clips/ml101/config.js
echo "=== setup.js imports v7? ==="
grep "player.v" player/setup.js | head -1
echo "=== syntax checks ==="
node --check player/player.v7.js 2>&1 && echo "  ✓ v7 OK"
node --check clips/ml101/config.js 2>&1 && echo "  ✓ config OK"
```

**If any check fails** → run `bash ~/migrate-ml101-chunks.sh` again carefully, or diagnose per file.

**If all pass** → test in browser (next).

### TODO

1. **Test ML101** — open `http://127.0.0.1:8765/ml101.html?fresh=1`, verify:
   - Play → chunk 0 plays, subtitle shows chunk 0
   - Chunk 0 ends → chunk 1 plays automatically
   - Sub-nav → or ← → **exact** prev/next chunk (no seek drift)
   - Progress bar accurate (uses chunkDurations)
   - Lang switch → reloads array, starts chunk 0
2. **If ML101 works** → replicate for ml102, ml103, ml104:
   - Generate chunks: TTS + ffmpeg (adapt `gen-ml101.sh`)
   - Migrate config: adapt `migrate-ml101-chunks.sh`
   - Test each
3. **Later:**
   - Re-encode `clips/dark-matter/audio/*` and `clips/solar-system/audio/*` with `-write_xing 1`
   - Migrate dark-matter (8 ch) and solar-system (10 ch) to chunk-based
   - Update MASTER_CONTEXT.md to v3 (reflect v7, chunks, new bugs)
   - Set up Cloudflare Page Rule for auto-purge on `/player/*`

### Known issues (not urgent)

- **`media/podcast/` 113 files** — may be large, check `du -sh media/podcast`. If > 500MB, consider moving to GitHub Releases or re-encoding to 32k
- **Multiple player versions in repo** (`v4.js, v5.js, v6.js, v7.js, player.js`) — ~60KB total. Can delete old ones after v7 confirmed
- **`.bak` files** — may exist in some folders. `find . -name "*.bak" -not -path "./.git/*"`
- **dark-matter and solar-system audio** — not re-encoded with `-write_xing 1`

---

## §9 — On-screen debugging (mobile)

User has no F12. Use one of:

### Green panel (in player.v6+)
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

### Log div in HTML (safer — no JS setup needed)
```html
<div id="onscreen-log" style="position:fixed;top:0;left:0;right:0;max-height:35vh;
     overflow-y:auto;background:rgba(0,0,0,0.92);color:#0f0;font-family:monospace;
     font-size:11px;padding:6px;z-index:999999;display:none;white-space:pre-wrap;"></div>
```

```javascript
const el = document.getElementById('onscreen-log');
if (el) { el.style.display = 'block'; el.textContent += 'msg\n'; el.scrollTop = el.scrollHeight; }
```

**User workflow:** Screenshot phone → paste image → new LLM reads log.

**CRITICAL:** Never `setInterval` at <500ms for logging — kills mobile browsers.

---

## §10 — Deployment workflow

1. Edit locally
2. Test: `http://127.0.0.1:8765/<page>?fresh=1`
3. Cache bump `?v=YYYYMMDD-HHMMSS` in all HTML + JS imports
4. `git add -A && git commit -m "..." && git push origin main`
5. If rejected (auto-sync workflow): `git fetch origin && git pull --rebase origin main -X theirs && git push origin main`
6. **Cloudflare → Caching → Purge Everything**
7. User closes all Chrome tabs, reopens with `?fresh=1`

**If site shows old version despite purge:**
- `curl -sI https://masoudsoft.ir/... | grep cf-cache` — if HIT, purge again
- `curl -s https://raw.githubusercontent.com/...` — if new, GitHub fine, only Cloudflare
- User: Settings → Privacy → Clear browsing data → Cached images

---

## §11 — Files to read next (if you need more context)

- `MASTER_CONTEXT.md` — older handoff, covers player v6 era (partly outdated)
- `MASTER_SOURCE.md` — full source of player/ helpers
- `player/player.v7.js` — current player (source of truth for behavior)
- `clips/ml101/config.js` — current config format example
- `clips/ml101/main.js` — minimal startClip pattern
- `clips/ml101/scenes/scene5.js` — walkthrough scene example

---

## §12 — Pre-response checklist

Before hitting "send":

- [ ] Script ≤100 lines? (or split into phases)
- [ ] `pkill ... || true`? (no `set -e` early-exit)
- [ ] No `/tmp/` — using `~/`?
- [ ] No `sed` with `|` delimiter that has regex alternation?
- [ ] No `re.sub` with `\n` in replacement?
- [ ] `?v=` bumped on all changed files?
- [ ] Verification step (grep/wc/curl) provided?
- [ ] Honest about tested vs untested?
- [ ] Responding to the actual ask, not a tangent?

---

## §13 — The immediate pending action

**User's last message:** "بله تایید میکنم قرارداد رو ولی زدم پلی میشه اون فایل شل" — approved the architecture contract, ran a shell file (likely `gen-ml101.sh`).

**Provided but not confirmed:** `migrate-ml101-chunks.sh`.

**Next step for new LLM:**
1. **Ask user:** "Did `migrate-ml101-chunks.sh` complete? Or just `gen-ml101.sh`?"
2. **Verify** using commands from §8
3. If migration ran → **test ML101** (see §8 TODO)
4. If migration didn't run → run it, then test
5. Once ML101 confirmed → replicate for ml102, ml103, ml104

---

## END OF HANDOFF

**Check order for any question:**
1. This HANDOFF.md
2. MASTER_CONTEXT.md
3. `player/player.v7.js` (player behavior)
4. `clips/ml101/config.js` (chapter format)
5. Ask user directly — he knows the project
