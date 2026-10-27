# MASTER_CONTEXT — Masoud Azizi Interactive Film System

**Version:** 2.0 (post-refactor)
**Updated:** 2026-10-27
**Companion:** MASTER_SOURCE.md (full code of player/)

---

## §0 — Identity

Masoud Azizi (مسعود عزیزی). Persian speaker, direct, no fluff.

- Site: masoudsoft.ir (Cloudflare → GitHub Pages)
- Repo: github.com/mablue/mablue.github.io
- Local: ~/mablue_repos_dump/mablue.github.io
- Dev: Termux (Android)

I build interactive educational films. Each film = series of scenes. Each scene has:
- Narration (az / fa / en) — edge_tts, cached mp3
- Three.js visualization
- Camera choreography synced to chunks
- Full player (play / pause / seek / lang / markers / code walkthrough / next-clip button)

**Live clips:**
- darkmatter.html — 8 chapters, dark matter
- solarsystem.html — 10 chapters, planets
- ml101.html — 5 chapters, linear regression (Level 1)
- ml102.html — 5 chapters, feature engineering x² (Level 2)
- ml103.html — 5 chapters, hidden layer + ReLU (Level 3)

ML101 → ML102 → ML103 connected via clip.nextClip.

---

## §1 — File structure

    mablue.github.io/
    ├── vendor/three/                 three.js r160 (LOCAL)
    ├── player/                       SHARED across all clips
    │   ├── player.v4.js              Player class (current)
    │   ├── player.js                 legacy v1
    │   ├── player.css                player styles
    │   ├── scene-base.js             SceneBase
    │   ├── setup.js            NEW   startClip + Three.js boilerplate
    │   ├── walkthrough.js      NEW   code line-by-line highlight
    │   ├── visuals.js          NEW   updateLine / updateCurve / updateDrops
    │   ├── training.js         NEW   drawLossChart / updateTrainingHUD
    │   └── i18n.js             NEW   langText(lang, key)
    ├── clips/<name>/
    │   ├── config.js                 clip metadata + chapters[]
    │   ├── main.js                   ~30 lines (startClip)
    │   ├── style.css                 clip-specific CSS
    │   ├── audio/{az,fa,en}/*.mp3
    │   └── scenes/sceneN.js
    └── <name>.html                   ~20 lines

Rules: all assets LOCAL. Fonts from Google OK. Cache bust via ?v=YYYYMMDD-HHMMSS.

---

## §2 — API cheat sheet (full source: MASTER_SOURCE.md)

### player/player.v4.js

    new Player({ ctx, chapters, clip, scenes })

ctx — { THREE, scene, camera, controls, renderer, canvas, lang, DATA, pointsGroup, dotMeshes, ...trueValues }
chapters — array from config.js
clip — { name, backUrl, backText, defaultLang, nextClip?, nextClipLabel?, ui: [{id, html}] }
scenes — { 0: SceneInstance, 1: SceneInstance, ... }

Auto-detects languages from chapter.audio dict. Renders lang toggle if >1. Builds chrome if missing. _tryPlay() with gesture fallback. _showNextClipButton() at end of last chapter if clip.nextClip set.

### player/setup.js

    setupThree(canvas, { fov, bg, far, cameraPos, target, minDistance, maxDistance })
      → { THREE, scene, camera, controls, renderer, canvas }

    createStarField(scene, count, { minR, maxR, size, color, opacity })
    createPointGroup(scene, DATA, { radius, color })   → { group, meshes }

    startClip({
      chapters, clip, SceneClasses, makeData?, trueValues?,
      cameraPos, cameraTarget, minDistance, maxDistance,
      starCount?, starOpts?, pointConfig?, defaultLang?,
      skipPoints?, extraSetup?
    })

startClip = setupThree + starfield + pointGroup + Player + tick loop + player.start().

### player/walkthrough.js

    buildCodeUI(pre, lines)               // inject .code-line spans
    applyCodeChunk(pre, chapter, chunk)   // highlight chapter.code.highlights[chunk]
    clearCodeHighlight(pre)

### player/visuals.js

    updateLine(mesh, w, b, xRange, z)                    // cylinder from (w, b)
    updateCurvePositions(positions, w1, w2, b, xRange)   // y = w1*x + w2*x² + b
    updateDrops(drops, DATA, w, b, { THREE })            // lines from points to model

### player/training.js

    drawLossChart(canvas, history)                       // history = [{t,v}]
    updateTrainingHUD({ ease, totalSteps, loss, lossEl, barEl, stepEl })

### player/i18n.js

    langText(lang, key)   // keys: lossSub

### player/scene-base.js

    class SceneBase {
      constructor(ctx)
      async enter(chapter, lang)
      async exit()
      update(dt, time, duration, chunk)
      onLanguageChange(lang)
    }

---

## §3 — Clip config template

    // clips/<name>/config.js
    export const clip = {
      name: 'CLIP NAME',
      backUrl: 'index.html',
      backText: '← back',
      defaultLang: 'az',
      nextClip: 'ml102.html',         // optional
      nextClipLabel: 'Continue →',    // optional
      ui: [
        { id: 'ml-loss-hud',   html: '<div class="ml-val">0.00</div>' },
        { id: 'ml-loss-chart', html: '<canvas></canvas>' },
        { id: 'ml-code',       html: '<pre style="margin:0;"></pre>' },
      ],
    };

    export const chapters = [
      { n: 1, title: 'Data', duration: 12, built: true,
        audio: {
          az: './clips/<name>/audio/az/1-data.mp3?v=VER',
          fa: './clips/<name>/audio/fa/1-data.mp3?v=VER',
          en: './clips/<name>/audio/en/1-data.mp3?v=VER',
        },
        chunks: {
          az: ['Sentence 1.', 'Sentence 2.'],
          fa: ['جمله ۱.', 'جمله ۲.'],
          en: ['Sentence 1.', 'Sentence 2.'],
        },
        code: {
          lines: ['<span class="com"># comment</span>', 'line 2'],
          highlights: [[0,3], [5,7], [10,12]]   // chunk → [start, end]
        }
      },
    ];

---

## §4 — Scene template

    import { SceneBase } from '../../../player/scene-base.js?v=VER';
    import { updateLine, updateCurvePositions, updateDrops } from '../../../player/visuals.js?v=VER';
    import { buildCodeUI, applyCodeChunk } from '../../../player/walkthrough.js?v=VER';
    import { drawLossChart, updateTrainingHUD } from '../../../player/training.js?v=VER';
    import { langText } from '../../../player/i18n.js?v=VER';

    export class MyScene extends SceneBase {
      constructor(ctx, shared) {
        super(ctx);
        this.THREE = ctx.THREE;
        this.shared = shared;
        this._t0 = 0;
        this._lastChunk = -1;
        this._chapter = null;
        this._build();
      }
      _build() { /* add meshes to this.group */ }
      async enter(chapter, lang) {
        await super.enter(chapter, lang);
        this._t0 = 0;
        this._chapter = chapter;
        this._lastChunk = -1;
        this.shared.pointsGroup.visible = true;
        for (const m of this.shared.dotMeshes) m.material.opacity = 1;
        const cam = this.ctx.camera, ctl = this.ctx.controls;
        if (cam && ctl) { ctl.autoRotate = false; cam.position.set(0, 0, 14); ctl.target.set(0,0,0); }
      }
      async exit() {
        for (const id of ['ml-code', 'ml-loss-hud']) {
          const el = document.getElementById(id); if (el) el.classList.add('hidden');
        }
        this._chapter = null;
        this._lastChunk = -1;
        await super.exit();
      }
      onLanguageChange(lang) { this._lastChunk = -1; }
      update(dt, time, duration, chunk) {
        if (!this.group.visible) return;
        this._t0 += dt;
        if (chunk !== this._lastChunk) {
          this._lastChunk = chunk;
          applyCodeChunk(document.querySelector('#ml-code pre'), this._chapter, chunk);
        }
      }
    }

---

## §5 — main.js template (~30 lines)

    import { startClip } from '../../player/setup.js?v=VER';
    import { clip, chapters } from './config.js?v=VER';
    import { Scene1 } from './scenes/scene1.js?v=VER';
    import { Scene2 } from './scenes/scene2.js?v=VER';

    const TRUE_W = 2.0, TRUE_B = 1.0;

    function makeData() {
      const pts = [];
      for (let i = 0; i < 25; i++) {
        const x = -4 + (i / 24) * 8;
        const y = TRUE_W * x + TRUE_B + (Math.random() - 0.5) * 1.6;
        pts.push({ x, y, z: (Math.random() - 0.5) * 0.4 });
      }
      return pts;
    }

    export function start() {
      startClip({
        chapters, clip,
        SceneClasses: [Scene1, Scene2],
        makeData,
        trueValues: { TRUE_W, TRUE_B },
        cameraPos: [0, 2.5, 16],
        cameraTarget: [0, 0, 0],
        minDistance: 6,
        maxDistance: 40,
        pointConfig: { radius: 0.13, color: 0xe8b96a },
        defaultLang: 'az',
      });
    }

---

## §6 — startClip API reference

| Param | Required | Default | Purpose |
|-------|----------|---------|---------|
| chapters | yes | — | from config.js |
| clip | yes | — | from config.js |
| SceneClasses | yes | — | array, one per chapter |
| makeData | no | — | () => [{x,y,z}], sets shared.DATA |
| trueValues | no | {} | spread into shared |
| cameraPos | no | [0,0,14] | camera.position.set |
| cameraTarget | no | [0,0,0] | controls.target.set |
| minDistance, maxDistance | no | 5, 40 | OrbitControls |
| starCount | no | 500 | background stars |
| starOpts | no | {} | { minR, maxR, size, color, opacity } |
| pointConfig | no | {radius:0.1,color:0xe8b96a} | point mesh |
| defaultLang | no | 'az' | initial language |
| skipPoints | no | false | don't create point group |
| extraSetup | no | — | (ctx, shared) => extra |

---

## §7 — FA TTS phonetic substitution

fa-IR-FaridNeural mispronounces Latin. Subscript stays Latin (educational), audio speaks phonetic:

    PLAIN_REPLS = [
        ('X_new','ایکس نیو'), ('x_new','ایکس نیو'), ('y_pred','وای پردیکت'),
        ('W₁','دابلیو یک'), ('W₂','دابلیو دو'),
        ('X²','ایکس به توان دو'), ('x²','ایکس به توان دو'), ('x**2','ایکس به توان دو'),
        ('ReLU','رِلو'), ('PyTorch','پای‌تورچ'), ('Python','پایتون'),
        ('SGD','اس‌جی‌دی'), ('Adam','آدام'), ('Linear','لینیر'), ('MSE','ام‌اس‌ای'),
        ('feature','فیچر'),
    ]
    WORD_REPLS = [
        (r'\bX\b','ایکس'), (r'\bY\b','وای'), (r'\bW\b','دابلیو'), (r'\bB\b','بی'),
        (r'\bx\b','ایکس'), (r'\by\b','وای'), (r'\bw\b','دابلیو'), (r'\bb\b','بی'),
    ]

Rule: for x**2, use str.replace NOT re.sub (** = "multiple repeat" error).

---

## §8 — Bug log (do not repeat)

1. player.currentChunk not reset in loadChapter → stale chunk fires triggers → scene hidden
2. Canvas resize on opacity:0 → 300×150 default → blurry. Fix: _resizeCheck in every frame
3. UI leakage across scenes → force-hide all .scene-ui in Player.loadChapter
4. Backward scrub doesn't undo → use _setVisible([ids]) state-driven
5. re.sub with string replacement → \n interpreted → JS SyntaxError. Use Python write_text or str.replace
6. re.sub('x**2', ...) → ** = "multiple repeat" regex error
7. _tryPlay patch with regex → method defined outside class. **Always rewrite whole file, not patch**
8. .code-line { display: block } missing → all spans on one line
9. /media/ in .gitignore → blocked whole media directory
10. ES module cache → main.js?v=, player.v4.js?v=, scene-base.js?v=. If cached, rename file (v4 → v5)
11. workflow auto-sync → pushes chore: auto-sync commits → rebase fails. Fix: git pull --rebase origin main -X theirs
12. GitHub Actions cache old rebuild_data.py → first run uses stale version
13. Cache bust after push → Cloudflare purge + hard-refresh
14. Mobile overlay overlap → bottom: 12rem desktop, 14rem mobile
15. Error banner user-select → add user-select: text !important
16. git push rejected → git fetch origin && git pull --rebase origin main -X theirs && git push
17. git push timeout → git -c http.postBuffer=1048576000 -c http.lowSpeedLimit=0 -c http.lowSpeedTime=999999 push

---

## §9 — Workflow

### Deploy
    git add -A && git commit -m "..." && git push origin main
    # then Cloudflare → Caching → Purge Everything

### If push rejected (workflow auto-sync first)
    git fetch origin && \
    git pull --rebase origin main -X theirs && \
    git push origin main

### If push times out
    git -c http.postBuffer=1048576000 \
        -c http.lowSpeedLimit=0 \
        -c http.lowSpeedTime=999999 \
        push origin main

### If ES module still cached
Rename file (player.v4.js → player.v5.js), update imports, cache bump HTML.

### Backup before risky changes
    cp file.js file.js.bak

---

## §10 — ML101 / ML102 / ML103 differences

| Aspect | ML101 | ML102 | ML103 |
|--------|-------|-------|-------|
| Title | First Model | Feature Engineering | Hidden Layer |
| Data | y = 2x + 1 | y = 0.5x² - 2 | y = 2sin(1.5x) |
| Model | w, b (manual) | nn.Linear(2,1) | nn.Sequential(1→8→1) |
| Params | 2 | 3 (w₁, w₂, b) | 25 |
| Optimizer | SGD lr=0.05 | SGD lr=0.02 | Adam lr=0.02 |
| Steps | 200 | 400 | 1000 |
| Loss chunks | 6 | 5 | 5 |
| Walkthrough chunks | 7 | 8 | 8 |
| Key lesson | Model = equation | feature = x² | ReLU breaks linearity |

nextClip: ML101 → ml102.html → ml103.html. ML103 is last.

---

## §11 — New clip checklist

1. Create clips/<name>/ with scenes/, audio/{az,fa,en}/
2. Write config.js — clip + chapters[]
3. Write scenes/sceneN.js — extends SceneBase
4. Write main.js — startClip({...}) (~30 lines)
5. Copy style.css from an existing clip
6. Write <name>.html (~20 lines) — see §14 template
7. Generate TTS (edge_tts) for all languages — see §7 phonetic for FA
8. Test with ?fresh=1 before commit
9. Add to index.html slider or link from another clip

---

## §12 — Communication style

- Persian, direct, no fluff
- Admit when broken or untested
- No self-congratulatory bullets
- No over-promising
- If you don't know, say so
- When user says "بسه" — stop adding
- When criticized ("boring", "square") — diagnose, don't defend
- Prefer fixes over patches: rewrite whole file if a helper method is broken (see bug #7)

---

## §13 — Companion file

MASTER_SOURCE.md contains full source of:
player/player.v4.js, scene-base.js, setup.js, walkthrough.js, visuals.js, training.js, i18n.js

Ask user to paste it if you need exact signatures beyond §2.

---

## §14 — HTML template

    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>CLIP TITLE</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Vazirmatn:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="player/player.css?v=VER">
    <link rel="stylesheet" href="clips/<name>/style.css?v=VER">
    </head>
    <body>
    <canvas id="scene-canvas"></canvas>
    <script>
    window.addEventListener('error', function(e){
      var b=document.createElement('div');
      b.style.cssText='position:fixed;top:10px;left:10px;background:rgba(200,0,0,.92);color:#fff;padding:10px;border-radius:4px;z-index:99999;font-family:monospace;font-size:11px;max-width:90vw;word-break:break-word;user-select:text;-webkit-user-select:text;pointer-events:auto;white-space:pre-wrap;';
      var t='Error: '+e.message;
      if(e.filename){t+='\n  file: '+e.filename.split('/').pop()+'\n  line: '+e.lineno+':'+e.colno;}
      b.textContent=t;
      document.body.appendChild(b);
    });
    </script>
    <script type="importmap">
    {"imports":{"three":"./vendor/three/three.module.js","three/addons/":"./vendor/three/addons/"}}
    </script>
    <script type="module">
    import { start } from './clips/<name>/main.js?v=VER';
    start();
    </script>
    </body>
    </html>

---

## §15 — User preferences

- Single-shot bash scripts
- No step-by-step
- Persian
- No self-congratulation
- Fix root cause
- Test before commit
- Backup before risky changes
- Cache bump on every deploy

---

**END OF MASTER_CONTEXT**
