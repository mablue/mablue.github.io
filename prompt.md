پرامپت جامع — Master Context برای هر چت جدید

این سند رو توی هر چت جدید پیست کن. خودش کامله — کد، ساختار، باگ‌هایی که حل کردیم، قواعد، و اسکریپت تمپلیت. قبل از هر پاسخی، AI باید کل این رو بخونه.

فایل رو دو جا ذخیره کن: ~/MASTER_CONTEXT.md توی ترمکس، و یه کپی توی همون ریپو که هر بار دستت باشه.

```bash
cat > ~/MASTER_CONTEXT.md << 'MASTER_EOF'
# ═══════════════════════════════════════════════════════════════
# MASOUD AZIZI — INTERACTIVE FILM SYSTEM
# Master Context Prompt v1.0
# ═══════════════════════════════════════════════════════════════
#
# [READ THIS ENTIRE DOCUMENT BEFORE RESPONDING.]
# This is not a tutorial. It is the working state of a real
# production system. Everything here is tested. Do not "improve"
# on it without asking. Do not use regex to patch HTML.
#
# ━━━ §0 — IDENTITY ━━━
#
# I am Masoud Azizi. Persian speaker, direct, no fluff.
# My work lives at masoudsoft.ir (Cloudflare → GitHub Pages).
# Repo: github.com/mablue/mablue.github.io (local: ~/mablue_repos_dump/mablue.github.io)
# Built on Termux (Android). Local test: python3 -m http.server 8765
#
# I build INTERACTIVE EDUCATIONAL FILMS. Each film is a series
# of scenes. Each scene = one chapter with:
#   • Narration (EN + FA) — edge_tts, cached as mp3
#   • A Three.js visualization
#   • Camera choreography synced to narration chunks
#   • Full player (play/pause/seek/lang/markers)
#
# Existing films:
#   darkmatter.html     — 8 chapters, ~4 min
#   solarsystem.html    — 8 chapters, ~2 min
#
# When I ask for a new clip, you produce ONE bash script that:
#   1. Generates TTS for every chapter (EN + FA)
#   2. Writes clips/<name>/config.js + main.js + style.css + scenes/*.js
#   3. Writes <name>.html
#   4. Updates any links (index.html, etc.)
#   5. Cache-bumps all ?v=
#   6. Commits + pushes
#   7. Prints a test checklist
#
# ━━━ §1 — FILE STRUCTURE (canonical) ━━━
#
# mablue.github.io/
#   vendor/three/                ← three.js r160, LOCAL (never CDN)
#     three.module.js
#     addons/controls/OrbitControls.js
#     addons/loaders/GLTFLoader.js
#   assets/audio/narration/      ← all narration mp3s, LOCAL
#   player/
#     player.js                  ← universal Player class
#     player.css                 ← universal player styles
#     scene-base.js              ← SceneBase base class
#   clips/<name>/
#     config.js                  ← chapters array
#     main.js                    ← entry point
#     style.css                  ← clip-specific overrides
#     scenes/scene1.js ...       ← one file per scene
#   <name>.html                  ← entry: importmap + module script
#
# ⚠️ ALL assets LOCAL. No unpkg, no jsdelivr, no CDN.
#    Fonts may load from Google Fonts (acceptable).
#
# ━━━ §2 — PLAYER CLASS (player/player.js) ━━━
#
# Full source. Do NOT modify except as noted.
#
# ```javascript
# export class Player {
#   constructor(ctx, chapters) {
#     this.ctx = ctx;
#     this.chapters = chapters;
#     this.scenes = {};
#     this.currentIndex = 0;
#     this.lang = 'fa';
#     this.audio = new Audio();
#     this.audio.preload = 'auto';
#     this.chunks = [];
#     this.currentChunk = -1;
#     this.ui = {};
#     this._bindUI();
#     this._bindAudio();
#   }
#
#   registerScene(index, scene) { this.scenes[index] = scene; }
#
#   _bindUI() {
#     const $ = id => document.getElementById(id);
#     this.ui.text = $('sub-text');
#     this.ui.play = $('play-btn');
#     this.ui.fill = $('progress-fill');
#     this.ui.time = $('time');
#     this.ui.track = $('progress-track');
#     this.ui.labels = $('chapter-labels');
#     this.ui.markers = $('chapter-markers');
#
#     this.ui.play.onclick = () => {
#       if (this.audio.paused) this.audio.play().catch(() => {});
#       else this.audio.pause();
#     };
#
#     this.ui.track.onclick = (e) => {
#       if (!this.audio.duration) return;
#       const rect = this.ui.track.getBoundingClientRect();
#       const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
#       this.audio.currentTime = pct * this.audio.duration;
#     };
#
#     document.querySelectorAll('[data-lang]').forEach(btn => {
#       btn.addEventListener('click', (e) => {
#         e.preventDefault();
#         this.setLanguage(btn.dataset.lang);
#       });
#     });
#
#     document.querySelectorAll('[data-sub]').forEach(btn => {
#       btn.addEventListener('click', () => {
#         if (!this.chunks.length) return;
#         const dir = btn.dataset.sub === 'prev' ? -1 : 1;
#         const target = Math.max(0, Math.min(this.chunks.length - 1, this.currentChunk + dir));
#         this.audio.currentTime = this.chunks[target].start;
#       });
#     });
#   }
#
#   _bindAudio() {
#     this.audio.addEventListener('play', () => {
#       this.ui.play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
#     });
#     this.audio.addEventListener('pause', () => {
#       this.ui.play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
#     });
#     this.audio.addEventListener('timeupdate', () => this._onTimeUpdate());
#     this.audio.addEventListener('loadedmetadata', () => this._computeChunks());
#     this.audio.addEventListener('ended', () => {
#       if (this.currentIndex + 1 < this.chapters.length) {
#         this.loadChapter(this.currentIndex + 1);
#       }
#     });
#   }
#
#   _computeChunks() {
#     const ch = this.chapters[this.currentIndex];
#     const chunks = ch[this.lang === 'fa' ? 'chunksFa' : 'chunksEn'];
#     const dur = this.audio.duration || ch.duration;
#     const totalWords = chunks.reduce((s, c) => s + c.split(/\s+/).length, 0);
#     let acc = 0;
#     this.chunks = chunks.map(c => {
#       const w = c.split(/\s+/).length;
#       const st = (acc / totalWords) * dur;
#       acc += w;
#       return { start: st, text: c };
#     });
#     this.currentChunk = -1;
#   }
#
#   _onTimeUpdate() {
#     const dur = this.audio.duration || 0;
#     const t = this.audio.currentTime || 0;
#     this.ui.fill.style.width = dur ? ((t / dur) * 100) + '%' : '0%';
#     this.ui.time.textContent = this._fmt(t) + ' / ' + this._fmt(dur);
#
#     let idx = 0;
#     for (let i = 0; i < this.chunks.length; i++) {
#       if (t >= this.chunks[i].start) idx = i;
#       else break;
#     }
#     if (idx !== this.currentChunk) {
#       this.currentChunk = idx;
#       if (this.chunks[idx]) {
#         this.ui.text.textContent = this.chunks[idx].text;
#         this.ui.text.classList.toggle('rtl', this.lang === 'fa');
#         this.ui.text.classList.toggle('ltr', this.lang === 'en');
#       }
#     }
#   }
#
#   _fmt(s) {
#     if (!s || !isFinite(s)) return '0:00';
#     return Math.floor(s / 60) + ':' + Math.floor(s % 60).toString().padStart(2, '0');
#   }
#
#   _renderMarkers() {
#     const lbls = this.ui.labels, mkrs = this.ui.markers;
#     lbls.innerHTML = '';
#     mkrs.innerHTML = '';
#     let acc = 0;
#     const total = this.chapters.reduce((s, c) => s + c.duration, 0);
#     this.chapters.forEach((ch, i) => {
#       const pct = (acc / total) * 100;
#       const l = document.createElement('div');
#       l.className = 'ch-label';
#       l.style.left = pct + '%';
#       l.textContent = ch.n;
#       if (i === this.currentIndex) l.classList.add('active');
#       else if (!ch.built) l.classList.add('disabled');
#       else if (i < this.currentIndex) l.classList.add('done');
#       l.onclick = () => { if (ch.built) this.loadChapter(i); };
#       lbls.appendChild(l);
#
#       if (i > 0) {
#         const m = document.createElement('div');
#         m.className = 'ch-marker';
#         m.style.left = pct + '%';
#         if (i === this.currentIndex) m.classList.add('active');
#         else if (!ch.built) m.classList.add('disabled');
#         else if (i < this.currentIndex) m.classList.add('done');
#         m.onclick = (e) => { e.stopPropagation(); if (ch.built) this.loadChapter(i); };
#         mkrs.appendChild(m);
#       }
#       acc += ch.duration;
#     });
#   }
#
#   async loadChapter(index) {
#     const ch = this.chapters[index];
#     if (!ch || !ch.built) return;
#
#     // CRITICAL: hide ALL .scene-ui before showing the new one.
#     // Prevents UI leakage across scenes (was a real bug).
#     document.querySelectorAll('.scene-ui').forEach(el => el.classList.add('hidden'));
#
#     if (this.scenes[this.currentIndex]) {
#       try { await this.scenes[this.currentIndex].exit(); }
#       catch (e) { console.warn('scene exit failed:', e); }
#     }
#
#     this.currentIndex = index;
#     this.audio.src = ch[this.lang === 'fa' ? 'audioFa' : 'audioEn'];
#     this.audio.load();
#     this.chunks = [];
#     this.currentChunk = -1;  // ← critical: stale chunk from prev scene fires triggers early
#
#     if (this.scenes[index]) await this.scenes[index].enter(ch, this.lang);
#
#     this._renderMarkers();
#     this.audio.play().catch(() => {});
#   }
#
#   setLanguage(lang) {
#     this.lang = lang;
#     if (this.ctx) this.ctx.lang = lang;
#     document.querySelectorAll('[data-lang]').forEach(b => {
#       b.classList.toggle('active', b.dataset.lang === lang);
#     });
#     const wasPlaying = !this.audio.paused;
#     const ch = this.chapters[this.currentIndex];
#     if (ch) {
#       this.audio.src = ch[lang === 'fa' ? 'audioFa' : 'audioEn'];
#       this.audio.load();
#       if (wasPlaying) this.audio.play().catch(() => {});
#     }
#     if (this.scenes[this.currentIndex]) this.scenes[this.currentIndex].onLanguageChange(lang);
#   }
#
#   update(dt) {
#     const scene = this.scenes[this.currentIndex];
#     if (scene) {
#       scene.update(dt, this.audio.currentTime, this.audio.duration, this.currentChunk);
#     }
#   }
#
#   start(initialLang = 'fa') {
#     this.setLanguage(initialLang);
#     this.loadChapter(0);
#   }
# }
# ```
#
# ━━━ §3 — SCENE BASE (player/scene-base.js) ━━━
#
# ```javascript
# export class SceneBase {
#   constructor(ctx) {
#     this.ctx = ctx;
#     this.group = new ctx.THREE.Group();
#     this.ctx.scene.add(this.group);
#     this.group.visible = false;
#   }
#   async enter(chapter, lang) { this.group.visible = true; }
#   async exit() { this.group.visible = false; }
#   update(dt, time, duration, chunk) {}
#   onLanguageChange(lang) {}
# }
# ```
#
# ━━━ §4 — PLAYER CSS (player/player.css) ━━━
#
# Reference (do not paste into new clips, it's loaded from player/):
#   .top-bar, .lang-switch, .subtitle-bar, .sub-text, .controls,
#   .play-btn, .progress-track, .progress-fill, .chapter-labels,
#   .ch-marker, .time, .lang-toggle-bottom
#
# Full file lives at player/player.css. Load it in the HTML with
# <link rel="stylesheet" href="player/player.css?v=BUMP">
#
# ━━━ §5 — CLIP TEMPLATE: config.js ━━━
#
# Each chapter is one scene. Structure:
#
# ```javascript
# export const chapters = [
#   {
#     n: 1,                          // chapter number (1-indexed)
#     title: 'Chapter Title',        // shown in progress
#     duration: 15,                  // seconds (approximate, used for fallback)
#     built: true,                   // false = disabled marker in player
#     audioEn: './assets/audio/narration/scene1-en.mp3?v=BUMP',
#     audioFa: './assets/audio/narration/scene1-fa.mp3?v=BUMP',
#     chunksEn: ['Sentence 1.', 'Sentence 2.', 'Sentence 3.'],
#     chunksFa: ['جمله ۱.', 'جمله ۲.', 'جمله ۳.'],
#     // scene-specific data (camera paths, colors, positions):
#     cameraPath: [{ p: 0, r: 20, y: 8 }, { p: 1, r: 6, y: 2 }],
#     // ...anything else the scene class reads
#   },
#   // ...more chapters
# ];
# ```
#
# RULES:
#   • chunksEn.length must equal chunksFa.length
#   • duration is approximate; player uses actual audio duration
#   • built:false disables the marker; scenes with built:false are skipped
#
# ━━━ §6 — CLIP TEMPLATE: main.js ━━━
#
# ```javascript
# import * as THREE from 'three';
# import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
# import { Player } from '../../player/player.js';
# import { chapters } from './config.js';
# import { Scene1 } from './scenes/scene1.js';
# import { Scene2 } from './scenes/scene2.js';
# // ...more imports
#
# export function start() {
#   const canvas = document.getElementById('scene-canvas');
#   const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
#   const DPR = Math.min(window.devicePixelRatio, 2);
#   renderer.setPixelRatio(DPR);
#   renderer.setSize(window.innerWidth, window.innerHeight);
#   renderer.setClearColor(0x05060a, 1);
#
#   const scene = new THREE.Scene();
#   const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
#   camera.position.set(0, 14, 26);
#
#   const controls = new OrbitControls(camera, renderer.domElement);
#   controls.enableDamping = true;
#   controls.dampingFactor = 0.06;
#   controls.autoRotate = false;
#   controls.minDistance = 3;
#   controls.maxDistance = 80;
#   controls.enablePan = false;
#
#   const ctx = { THREE, scene, camera, controls, renderer, canvas, lang: 'fa' };
#   const shared = { ...ctx };
#
#   const player = new Player(ctx, chapters);
#   player.registerScene(0, new Scene1(ctx, shared));
#   player.registerScene(1, new Scene2(ctx, shared));
#   // ...register all scenes
#
#   const clock = new THREE.Clock();
#   function tick() {
#     requestAnimationFrame(tick);
#     const dt = Math.min(clock.getDelta(), 0.05);
#     player.update(dt);
#     controls.update();
#     renderer.render(scene, camera);
#   }
#   tick();
#
#   window.addEventListener('resize', () => {
#     camera.aspect = window.innerWidth / window.innerHeight;
#     camera.updateProjectionMatrix();
#     renderer.setSize(window.innerWidth, window.innerHeight);
#   });
#
#   player.start('fa');
# }
# ```
#
# ━━━ §7 — CLIP TEMPLATE: style.css ━━━
#
# Minimal — CSS vars + any clip-specific panels (charts, HUD, math).
# Reuse the same var names as darkmatter:
#
# ```css
# :root {
#   --bg: #05060a;
#   --ink: #f0ece4;
#   --ink-dim: #a8a094;
#   --ink-mute: #6b655c;
#   --amber: #e8b96a;
#   --cyan: #7df9ff;
#   --line: rgba(240,236,228,0.08);
#   --line-strong: rgba(240,236,228,0.16);
# }
# ```
#
# ━━━ §8 — CLIP TEMPLATE: <name>.html ━━━
#
# ```html
# <!DOCTYPE html>
# <html lang="en" dir="ltr">
# <head>
# <meta charset="UTF-8">
# <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
# <title>CLIP TITLE</title>
# <link rel="preconnect" href="https://fonts.googleapis.com">
# <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Vazirmatn:wght@300;400;500;700&display=swap" rel="stylesheet">
# <link rel="stylesheet" href="player/player.css?v=BUMP">
# <link rel="stylesheet" href="clips/CLIP_NAME/style.css?v=BUMP">
# </head>
# <body>
#
# <canvas id="scene-canvas"></canvas>
#
# <div class="top-bar">
#   <a href="index.html" class="brand">MASOUD<span>.</span></a>
#   <a href="index.html">خانه ←</a>
# </div>
#
# <div class="lang-switch">
#   <button data-lang="en">EN</button>
#   <button data-lang="fa" class="active">FA</button>
# </div>
#
# <!-- .scene-ui panels go here (charts, HUD, formulas) -->
#
# <div class="subtitle-bar" id="subtitle-bar">
#   <button class="sub-nav" data-sub="prev" aria-label="Previous">‹</button>
#   <div class="sub-text" id="sub-text"></div>
#   <button class="sub-nav" data-sub="next" aria-label="Next">›</button>
# </div>
#
# <div class="controls">
#   <button class="play-btn" id="play-btn" aria-label="Play">
#     <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
#   </button>
#   <div class="progress-section">
#     <div class="chapter-labels" id="chapter-labels"></div>
#     <div class="progress-track" id="progress-track">
#       <div class="progress-fill" id="progress-fill"></div>
#       <div class="chapter-markers" id="chapter-markers"></div>
#     </div>
#   </div>
#   <span class="time" id="time">0:00 / 0:00</span>
#   <div class="lang-toggle-bottom">
#     <button data-lang="fa" class="active">FA</button>
#     <button data-lang="en">EN</button>
#   </div>
# </div>
#
# <script>
# window.addEventListener('error', function(e) {
#   var b = document.createElement('div');
#   b.style.cssText = 'position:fixed;top:10px;left:10px;background:rgba(200,0,0,0.9);color:#fff;padding:6px 10px;border-radius:4px;z-index:99999;font-family:monospace;font-size:11px;max-width:80vw;';
#   b.textContent = 'Error: ' + e.message;
#   document.body.appendChild(b);
# });
# </script>
#
# <script type="importmap">
# {"imports":{"three":"./vendor/three/three.module.js","three/addons/":"./vendor/three/addons/"}}
# </script>
#
# <script type="module">
# import { start } from './clips/CLIP_NAME/main.js';
# start();
# </script>
# </body>
# </html>
# ```
#
# ━━━ §9 — SCENE CLASS TEMPLATE ━━━
#
# Every scene extends SceneBase. The pattern:
#
# ```javascript
# import { SceneBase } from '../../../player/scene-base.js';
#
# function smoothstep(a, b, x) {
#   const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
#   return t * t * (3 - 2 * t);
# }
#
# export class MyScene extends SceneBase {
#   constructor(ctx, shared) {
#     super(ctx);
#     this.THREE = ctx.THREE;
#     this.shared = shared;
#     this._built = false;
#     this.lastChunk = -1;
#     this.ui = null;
#     this._build();
#   }
#
#   _build() {
#     // Create meshes, particles, shaders, sprites.
#     // Add all to this.group (which is at scene root).
#     // this.group.visible = false by default (SceneBase).
#   }
#
#   async enter(chapter, lang) {
#     await super.enter(chapter, lang);
#     this.lastChunk = -1;
#     // Reset any per-chapter state:
#     //   • Animations
#     //   • Rotations
#     //   • Visibility
#     //   • UI (.scene-ui#ui-N.classList.remove('hidden'))
#     // Snap camera to opening position:
#     const [pos, look] = this._getCameraTarget(0, chapter.duration);
#     this.ctx.camera.position.copy(pos);
#     this.ctx.controls.target.copy(look);
#   }
#
#   async exit() {
#     if (this.ui) this.ui.classList.add('hidden');
#     await super.exit();
#   }
#
#   _getCameraTarget(t, dur) {
#     // Choreography: array of { p, r, y, lookY }
#     // r = orbit radius, y = height, lookY = target Y
#     // Use smoothstep interpolation between keys
#     // Example:
#     // const path = chapter.cameraPath || [
#     //   { p: 0, r: 20, y: 8 },
#     //   { p: 1, r: 6, y: 2 }
#     // ];
#     // ...
#   }
#
#   _applyChunk(chunk, lang) {
#     // Chunk-gated visual changes.
#     // Guard: if (chunk === this.lastChunk) return;
#     // CRITICAL: also handle backward scrub (chunk 5 → 2 must undo chunk 3-5 effects).
#     // Pattern: use a _setVisible([ids]) helper for show/hide.
#   }
#
#   update(dt, time, duration, chunk) {
#     if (!this.group.visible) return;
#     // CRITICAL: defensive guard for stale chunk from previous scene:
#     if (typeof chunk === 'number' && chunk > 99) chunk = -1;
#     const t = time || 0;
#     const dur = duration || 15;
#
#     // Camera: lerp toward target (don't snap)
#     const [pos, look] = this._getCameraTarget(t, dur);
#     this.ctx.camera.position.lerp(pos, 0.05);
#     this.ctx.controls.target.lerp(look, 0.05);
#
#     // Rotations, animations, particle updates
#
#     // Apply chunk-driven changes
#     this._applyChunk(chunk, this.ctx.lang);
#   }
#
#   onLanguageChange(lang) {
#     this.lastChunk = -1;  // force re-apply chunk text in new language
#   }
# }
# ```
#
# ━━━ §10 — PATTERNS FROM THE TRENCHES ━━━
#
# PATTERN A — CHUNK-GATED TRIGGERS (safe pattern):
# ```javascript
# update(dt, time, duration, chunk) {
#   // Stale-chunk guard
#   if (typeof chunk === 'number' && chunk > LAST_CHUNK_INDEX) chunk = -1;
#
#   // Trigger
#   if (!this._triggered && chunk >= 3) {
#     this._triggered = true;
#     this._doThing();
#   }
#
#   // Un-trigger on backward scrub
#   if (this._triggered && chunk < 3) {
#     this._triggered = false;
#     this._undoThing();
#   }
# }
# ```
#
# PATTERN B — STATE-DRIVEN VISIBILITY (fixes backward scrubbing):
# ```javascript
# _setVisible(ids) {
#   const all = ['mond-card-newton', 'mond-card-mond',
#                'mond-step-1', 'mond-step-2', 'mond-step-3', 'mond-step-4'];
#   for (const id of all) {
#     const el = document.getElementById(id);
#     if (!el) continue;
#     el.classList.toggle('show', ids.includes(id));
#   }
# }
#
# _applyChunk(chunk, lang) {
#   if (chunk === this.lastChunk) return;
#   this.lastChunk = chunk;
#   if (chunk <= 1) this._setVisible([]);
#   else if (chunk === 2) this._setVisible(['mond-card-newton']);
#   else if (chunk === 3) this._setVisible(['mond-card-newton', 'mond-card-mond', 'mond-step-1']);
#   // ...
# }
# ```
#
# PATTERN C — CAMERA CHOREOGRAPHY:
# ```javascript
# const CHOREO = [
#   { p: 0.00, r: 26, y: 8,  lookY: 0 },
#   { p: 0.28, r: 16, y: 4,  lookY: 0 },
#   { p: 0.62, r: 10, y: 1,  lookY: 0.6 },
#   { p: 1.00, r: 38, y: 18, lookY: 0 }
# ];
#
# _getCameraTarget(t, dur) {
#   const p = Math.max(0, Math.min(1, t / dur));
#   let kA = CHOREO[0], kB = CHOREO[CHOREO.length - 1];
#   for (let i = 0; i < CHOREO.length - 1; i++) {
#     if (p >= CHOREO[i].p && p <= CHOREO[i+1].p) {
#       kA = CHOREO[i]; kB = CHOREO[i+1]; break;
#     }
#   }
#   const k = kB.p > kA.p ? smoothstep(kA.p, kB.p, p) : 0;
#   const r = kA.r + (kB.r - kA.r) * k;
#   const y = kA.y + (kB.y - kA.y) * k;
#   const lookY = kA.lookY + (kB.lookY - kA.lookY) * k;
#   const angle = t * 0.1;
#   return [
#     new this.THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r),
#     new this.THREE.Vector3(0, lookY, 0)
#   ];
# }
# ```
#
# PATTERN D — PARTICLE SHADER (shared across scenes):
# ```javascript
# // Vertex: size + twinkle + color, additive blending
# // Fragment: soft round glow with core
# // See dark-matter/shared main.js for full source
# ```
#
# PATTERN E — HUD OVERLAY:
# ```javascript
# // .scene-ui hidden #ui-N with position:fixed panels
# // On enter: classList.remove('hidden')
# // On exit: classList.add('hidden')
# // Player.loadChapter also force-hides all .scene-ui (belt + suspenders)
# ```
#
# ━━━ §11 — KNOWN BUGS + FIXES ━━━
#
# BUG 1 — STALE CHUNK FROM PREVIOUS SCENE
#   Symptom: New scene shows blank/nothing on entry.
#   Cause: player.currentChunk wasn't reset in loadChapter().
#          Scene 6 ended at chunk=7; scene 7's guard `chunk >= 7` fired
#          immediately, hiding everything.
#   Fix:   player.js: this.currentChunk = -1 in loadChapter()
#          scene.js: defensive `if (chunk > MAX) chunk = -1;`
#
# BUG 2 — CANVAS RESIZE WHEN INACTIVE (opacity: 0)
#   Symptom: Canvas stretched, blurry, low quality.
#   Cause: clientWidth/clientHeight return 0 when element is invisible.
#          Renderer fell back to 300x150 default.
#   Fix:   Call resize check in EVERY frame, BEFORE the active guard:
#          function _resizeCheck(canvas, renderer, camera, dpr) {
#            const w = canvas.clientWidth, h = canvas.clientHeight;
#            if (w <= 0 || h <= 0) return false;
#            const cw = Math.floor(w * dpr), ch = Math.floor(h * dpr);
#            if (canvas.width !== cw || canvas.height !== ch) {
#              renderer.setSize(w, h, false);
#              camera.aspect = w / h;
#              camera.updateProjectionMatrix();
#            }
#          }
#
# BUG 3 — UI LEAKAGE ACROSS SCENES
#   Symptom: Scene 2's chart still visible in scene 6.
#   Cause: Scene.exit() didn't hide UI, or was async and not awaited.
#   Fix:   player.loadChapter: force-hide ALL .scene-ui before enter():
#          document.querySelectorAll('.scene-ui').forEach(el => el.classList.add('hidden'));
#
# BUG 4 — BACKWARD SCRUB DOESN'T UNDO
#   Symptom: Scrub from chunk 5 back to chunk 2, cards/steps stay visible.
#   Cause: _applyChunk only ADDED classes, never removed them.
#   Fix:   _setVisible([ids]) helper — toggle show/hide for the full set.
#
# BUG 5 — ES MODULE CACHE
#   Symptom: Pushed fix doesn't show up; old code runs.
#   Cause: ES module imports aren't version-busted.
#   Fix:   Hard-refresh (Ctrl+Shift+R). No other workaround.
#
# BUG 6 — CLOUDFLARE CACHE
#   Symptom: Site shows old CSS/JS even after hard-refresh.
#   Cause: Cloudflare caches aggressively.
#   Fix:   dashboard.cloudflare.com → Caching → Purge Everything
#
# ━━━ §12 — TTS RECIPE ━━━
#
# Voice: en-US-AriaNeural (rate=-5% or -8%)
#        fa-IR-FaridNeural (rate=-5% or -8%)
#        fallback: fa-IR-DilaraNeural
#
# Command (in bash script):
#   python3 -m edge_tts --voice "en-US-AriaNeural" --rate="-5%" \
#     --text "$EN_TEXT" --write-media "assets/audio/narration/sceneN-en.mp3"
#
# Sanity check: file must be >5000 bytes (else TTS failed silently).
#
# ALWAYS archive to mablue/videos repo:
#   git clone https://github.com/mablue/videos.git
#   cp sceneN-*.mp3 videos/narration/
#   git commit -m "feat: scene N narration"
#   git push
#
# ALWAYS copy to local runtime:
#   cp sceneN-*.mp3 assets/audio/narration/
#
# ━━━ §13 — SCRIPT SKELETON ━━━
#
# Every script must follow this shape:
#
# ```bash
# #!/data/data/com.termux/files/usr/bin/bash
# set -Eeuo pipefail
#
# C_OK="\033[0;32m"; C_INFO="\033[0;36m"; C_WARN="\033[1;33m"; C_ERR="\033[0;31m"; C_END="\033[0m"
# ok(){ echo -e "${C_OK}✓${C_END} $*"; }
# info(){ echo -e "${C_INFO}→${C_END} $*"; }
# warn(){ echo -e "${C_WARN}⚠${C_END} $*"; }
# err(){ echo -e "${C_ERR}✗${C_END} $*"; }
#
# SITE_DIR="$HOME/mablue_repos_dump/mablue.github.io"
# [ -d "$SITE_DIR" ] || { err "Site dir not found"; exit 1; }
# cd "$SITE_DIR"
#
# BUMP=$(date +%Y%m%d-%H%M)
# export BUMP
#
# # ── PRE-CHECK ──
# command -v python3 >/dev/null || { err "python3 missing"; exit 1; }
# command -v curl >/dev/null || { err "curl missing"; exit 1; }
# python3 -c "import edge_tts" 2>/dev/null || { err "edge-tts missing"; exit 1; }
# [ -f vendor/three/three.module.js ] || { err "three.js not vendored"; exit 1; }
# [ -f player/player.js ] || { err "player missing"; exit 1; }
#
# # ── STEP 1: TTS ──
# for scene in 1 2 3; do
#   python3 -m edge_tts --voice "en-US-AriaNeural" --rate="-5%" \
#     --text "$EN_TEXT_$scene" --write-media "assets/audio/narration/scene${scene}-en.mp3"
#   python3 -m edge_tts --voice "fa-IR-FaridNeural" --rate="-5%" \
#     --text "$FA_TEXT_$scene" --write-media "assets/audio/narration/scene${scene}-fa.mp3"
# done
#
# # ── STEP 2: config.js ──
# cat > clips/CLIP_NAME/config.js << 'CFG_EOF'
# ... (full content)
# CFG_EOF
# sed -i "s/BUMP/$BUMP/g" clips/CLIP_NAME/config.js
#
# # ── STEP 3: main.js ──
# cat > clips/CLIP_NAME/main.js << 'MAIN_EOF'
# ... (full content)
# MAIN_EOF
#
# # ── STEP 4: style.css ──
# cat > clips/CLIP_NAME/style.css << 'CSS_EOF'
# ... (full content)
# CSS_EOF
#
# # ── STEP 5: scenes/sceneN.js ──
# cat > clips/CLIP_NAME/scenes/scene1.js << 'SC_EOF'
# ... (full content)
# SC_EOF
#
# # ── STEP 6: HTML ──
# cat > CLIP_NAME.html << 'HTML_EOF'
# ... (full content)
# HTML_EOF
# sed -i "s/BUMP/$BUMP/g" CLIP_NAME.html
#
# # ── STEP 7: cache bump everywhere ──
# for f in index.html darkmatter.html solarsystem.html CLIP_NAME.html; do
#   [ -f "$f" ] && sed -i "s/?v=[0-9A-Za-z-]*/?v=$BUMP/g" "$f"
# done
#
# # ── STEP 8: verify ──
# echo ""
# echo "─── Verification ──────────────────────────────"
# for f in clips/CLIP_NAME/main.js clips/CLIP_NAME/config.js \
#          clips/CLIP_NAME/style.css CLIP_NAME.html \
#          assets/audio/narration/scene1-en.mp3; do
#   [ -f "$f" ] && ok "  $f" || err "  $f MISSING"
# done
#
# # ── STEP 9: commit ──
# git add -A
# if ! git diff --cached --quiet; then
#   git -c user.email="mablue92@gmail.com" -c user.name="Masoud Azizi" \
#     commit -m "feat(clip): CLIP_NAME — N chapters

# - New clip clips/CLIP_NAME/ with N scenes
# - config.js: N chapters, EN+FA audio, chunks
# - scenes/sceneN.js: N visualizations (list them)
# - main.js: imports + registers all scenes
# - CLIP_NAME.html: entry point, local vendor
# - Audio: assets/audio/narration/scene{1..N}-{en,fa}.mp3
# - Cache bump: $BUMP"
#   git push origin HEAD 2>&1 | tail -3
# fi
#
# # ── STEP 10: test checklist ──
# echo ""
# echo "  🎬 Test: http://127.0.0.1:8765/CLIP_NAME.html"
# echo "  ⚠ Hard refresh (Ctrl+Shift+R)"
# ```
#
# ━━━ §14 — RULES (NEVER BREAK) ━━━
#
# 1. NEVER use regex to patch HTML/JS/CSS. Use targeted replacements.
#    Regex on HTML = silent corruption = hours of debugging.
#
# 2. NEVER use external CDNs. Everything from ./vendor/ and ./assets/.
#
# 3. NEVER rewrite a whole file if a targeted change works.
#
# 4. NEVER skip the pre-check step in scripts.
#
# 5. ALWAYS cache-bust with ?v=YYYYMMDD-HHMM.
#
# 6. ALWAYS hard-refresh instruction in output (ES modules cache hard).
#
# 7. ALWAYS single-shot bash script. Not step-by-step.
#    The user runs `bash script.sh` once and it works.
#
# 8. ALWAYS backup protection: script can re-run safely.
#    (Check `if [ -f file ]` before overwriting; skip if already correct.)
#
# 9. ALWAYS commit + push at end of script.
#    No "you should commit this" — the script does it.
#
# 10. ALWAYS print a verification checklist at the end.
#
# ━━━ §15 — COMMUNICATION STYLE ━━━
#
# • Persian, direct, no fluff.
# • Admit when something is broken or untested.
# • No self-congratulatory bullets ("this is cinematic!").
# • No over-promising. "This is a 10-line silhouette" not "a fully
#   rigged 3D character."
# • If you don't know, say so. If untested, say so.
# • When the user says "بسه" (enough), stop. Don't keep adding.
# • When the user criticizes ("boring", "square", "unclear"), don't
#   defend — diagnose and fix.
#
# ━━━ §16 — WORKFLOW FOR NEW CLIPS ━━━
#
# User says: "make a clip about [topic], N chapters"
#
# You:
#   1. Ask 2-3 questions: tone? references? specific scenes?
#      (unless user says "you decide" — then decide)
#   2. Write narration text (EN + FA) for each chapter
#   3. Show the narration to the user for approval
#      (or proceed if user says "just build it")
#   4. Write ONE bash script that generates everything
#   5. Verify no CDN references, all paths local
#   6. Print test URL + checklist
#
# NEVER:
#   • Generate TTS without user approval on text
#   • Skip verification
#   • Assume the local server is running (tell user to start it)
#
# ━━━ §17 — QUICK REFERENCE ━━━
#
# File paths:
#   player/player.js               — Player class
#   player/player.css              — Player styles
#   player/scene-base.js           — SceneBase
#   clips/<name>/config.js         — chapters
#   clips/<name>/main.js           — Three.js setup + register
#   clips/<name>/style.css         — clip overrides
#   clips/<name>/scenes/sceneN.js  — one file per scene
#   <name>.html                    — entry
#   vendor/three/                  — three.js r160
#   assets/audio/narration/        — all mp3s
#
# Commands:
#   Local server:  python3 -m http.server 8765
#   Test URL:      http://127.0.0.1:8765/
#   Deploy:        git push origin HEAD
#   Cache purge:   dashboard.cloudflare.com → Caching → Purge Everything
#   Hard refresh:  Ctrl+Shift+R
#
# TTS voices:
#   en-US-AriaNeural   (rate=-5% or -8%)
#   fa-IR-FaridNeural  (rate=-5% or -8%)
#   fa-IR-DilaraNeural (fallback)
#
# ═══════════════════════════════════════════════════════════════
# END OF MASTER CONTEXT
# ═══════════════════════════════════════════════════════════════
MASTER_EOF

echo "✅ MASTER_CONTEXT.md written"
echo ""
echo "  Lines: $(wc -l < ~/MASTER_CONTEXT.md)"
echo "  Size:  $(du -h ~/MASTER_CONTEXT.md | cut -f1)"
echo ""
echo "  Copy to repo for easy access:"
echo "    cp ~/MASTER_CONTEXT.md \$HOME/mablue_repos_dump/mablue.github.io/MASTER_CONTEXT.md"
echo ""
echo "  Usage in any new chat:"
echo "    Paste the full content of ~/MASTER_CONTEXT.md"
echo "    Then: \"make a clip about [topic], N chapters\""
```

---

بعد از اجرا — چطور استفاده کن

بار اول (الان)

```bash
# 1. ساخت فایل
# (اسکریپت بالا رو اجرا کن)

# 2. کپی به ریپو + کامیت
cd ~/mablue_repos_dump/mablue.github.io
cp ~/MASTER_CONTEXT.md .
git add MASTER_CONTEXT.md
git -c user.email="mablue92@gmail.com" -c user.name="Masoud Azizi" \
  commit -m "docs: MASTER_CONTEXT.md — portable project knowledge"
git push origin HEAD
```

هر چت جدید

1. cat ~/MASTER_CONTEXT.md | pbcopy یا فایل رو باز کن و کپی بگیر
2. توی چت جدید پیست کن
3. بعدش فقط بگو: «یه کلیپ درباره‌ی [موضوع] بساز، ۵ سکانس»

چت جدید همه‌چیز رو داره — کد، باگ‌ها، قواعد، اسکریپت تمپلیت.

چه چیزایی داخلشه

بخش چه چیزی
§0 Identity، repo، domain، وضعیت
§1 File structure کامل
§2 Full Player class source
§3 Full SceneBase source
§4 player.css reference
§5 config.js template
§6 main.js template
§7 style.css template
§8 Full HTML template
§9 Full Scene class template
§10 5 الگوی تکرارشونده (chunk-gated، state-driven، camera choreography، particle shader، HUD)
§11 6 باگی که حل کردیم با فیکس دقیق
§12 TTS recipe دقیق
§13 Full bash script skeleton
§14 10 قاعده‌ی مطلق
§15 سبک پاسخ‌دهی
§16 Workflow ساخت کلیپ جدید
§17 Quick reference

---

چیزهایی که حل نشدن (صادقانه)

1. تست‌نشده در محیط جدید — من فقط از کد و تجربه‌ی خودم نوشتم. AI جدید ممکنه کد رو متفاوت تفسیر کنه.
2. ممکنه حجم کد توی چت جدید مشکل باشه — بعضی مدل‌ها context limit دارن. اگه ارور داد، بگو تا نسخه‌ی خلاصه‌تر (بدون full source) بسازم.
3. شیوه‌ی خواستن narration — من توی workflow نوشتم «نریشن بنویس، تأیید بگیر». ولی اگه می‌خوای سریع‌تر، بگو «بدون تأیید، فقط بساز».
4. کتابخانه‌ی scene ها — ما الان ۱۷ scene داریم (۸ darkmatter + ۹ solar). توی MASTER_CONTEXT نیاوردم چون حجم زیاد می‌شد. اگه بخوای، یه پیوست جدا SCENE_LIBRARY.md بسازم که همه‌ی scene class ها رو داشته باشه — که AI جدید بتونه ازشون import کنه.

می‌خوای SCENE_LIBRARY.md رو هم بسازم؟