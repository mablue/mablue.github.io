import { SceneBase } from '../../../player/scene-base.js';

export class BulletClusterScene extends SceneBase {
  constructor(ctx, shared) {
    super(ctx);
    this.THREE = ctx.THREE;
    this.shared = shared;
    this._build();
  }

  _makeCloud(count, color, radius) {
    const THREE = this.THREE;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count*3);
    const col = new Float32Array(count*3);
    const siz = new Float32Array(count);
    const pha = new Float32Array(count);
    const spd = new Float32Array(count);
    for (let i=0; i<count; i++) {
      const r = Math.pow(Math.random(), 2)*radius;
      const th = Math.random()*Math.PI*2;
      const phi = Math.acos(2*Math.random()-1);
      pos[i*3]=r*Math.sin(phi)*Math.cos(th);
      pos[i*3+1]=r*Math.cos(phi)*0.3;
      pos[i*3+2]=r*Math.sin(phi)*Math.sin(th);
      col[i*3]=color[0]; col[i*3+1]=color[1]; col[i*3+2]=color[2];
      siz[i]=1.5+Math.random()*2;
      pha[i]=Math.random()*6;
      spd[i]=1;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
    geom.setAttribute('aPhase', new THREE.BufferAttribute(pha, 1));
    geom.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(spd, 1));
    return new THREE.Points(geom, this.shared.galaxyMat);
  }

  _build() {
    this.lastChunk = -1;
    this.ui = null;
    this._onResize = null;
    this.clusterA = this._makeCloud(2000, [1,0.9,0.8], 3);
    this.clusterB = this._makeCloud(2000, [0.9,0.9,1], 3);
    this.gasA = this._makeCloud(2500, [1,0.4,0.6], 4.5);
    this.gasB = this._makeCloud(2500, [1,0.4,0.6], 4.5);
    this.dmA = this._makeCloud(1000, [0.3,0.6,1], 5);
    this.dmB = this._makeCloud(1000, [0.3,0.6,1], 5);

    this.group.add(this.clusterA, this.clusterB, this.gasA, this.gasB, this.dmA, this.dmB);
    this._reset();
  }

  _reset() {
    this.clusterA.position.set(-25, 0, 0);
    this.clusterB.position.set(25, 0, 0);
    this.gasA.position.set(-25, 0, 0);
    this.gasB.position.set(25, 0, 0);
    this.dmA.position.set(-25, 0, 0);
    this.dmB.position.set(25, 0, 0);
  }

  _getGroupScale() {
    const w = window.innerWidth;
    if (w < 500) return 0.3;
    if (w < 768) return 0.5;
    if (w < 1024) return 0.7;
    return 1.0;
  }

  _hesitationCurve(p) {
    // Cubic Hermite spline with velocity dip in the middle.
    // Keyframes: (0,0,v=1.2) → (0.5,0.385,v=0.2) → (1,1,v=1.2)
    // Result: white+blue slow down dramatically at the center,
    // as if acknowledging the red gas before passing through.
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    if (p < 0.5) {
      const t = p * 2;
      return -0.07 * t * t * t - 0.145 * t * t + 0.6 * t;
    }
    const t = (p - 0.5) * 2;
    return -0.53 * t * t * t + 1.045 * t * t + 0.1 * t + 0.385;
  }

  async enter(chapter, lang) {
    await super.enter(chapter, lang);
    this.group.scale.setScalar(this._getGroupScale());
    this._onResize = () => this.group.scale.setScalar(this._getGroupScale());
    window.addEventListener('resize', this._onResize);
    this._reset();
    this.lastChunk = -1;
    this.ui = document.getElementById('scene-3-ui');
    if (this.ui) this.ui.classList.remove('hidden');
  }

  async exit() {
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    }
    if (this.ui) this.ui.classList.add('hidden');
    await super.exit();
  }

  _applyChunk(chunk, lang) {
    if (chunk === this.lastChunk) return;
    this.lastChunk = chunk;

    const cap = document.getElementById('scene-3-caption');
    if (!cap) return;

    const messages = {
      en: [
        'Two galaxy clusters, 5 million km/h',
        'Red gas: slowed by friction',
        'Red gas lags behind — stuck',
        'Blue dark matter: passes right through',
        'Bullet Cluster — the smoking gun'
      ],
      fa: [
        'دو خوشه‌ی کهکشانی، ۵ میلیون کیلومتر بر ساعت',
        'گاز قرمز: با اصطکاک کند می‌شه',
        'گاز قرمز عقب می‌مونه — گیر می‌کنه',
        'ماده تاریک آبی: مستقیم رد می‌شه',
        'خوشه‌ی گلوله — مدرک اصلی'
      ]
    };

    const colors = ['#e8b96a', '#ff6b8a', '#ff6b8a', '#7df9ff', '#f0ece4'];
    const idx = Math.min(Math.max(chunk, 0), 4);
    cap.textContent = (messages[lang] || messages.en)[idx] || '';
    cap.style.color = colors[idx] || '#f0ece4';
    cap.classList.toggle('ltr', lang === 'en');
  }

  onLanguageChange(lang) {
    this.lastChunk = -1;
  }

  update(dt, time, duration, currentChunk) {
    if (!this.group.visible) return;
    const t = time || 0;
    let aX, bX, gaX, gbX, daX, dbX;

    if (t < 5) {
      // Phase 1: approach — all three layers move together
      const p = t / 5;
      aX = -25 + 15 * p; bX = 25 - 15 * p;
      gaX = aX; gbX = bX; daX = aX; dbX = bX;
    } else if (t < 15) {
      // Phase 2: crossing — red sticks, white+blue hesitate
      const p = (t - 5) / 10;

      // Red gas: rapid friction stop at ±4
      const redP = Math.min(1, p * 2.5);
      const redEase = 1 - Math.pow(1 - redP, 2);
      gaX = -10 + 6 * redEase;
      gbX =  10 - 6 * redEase;

      // White + blue: pass through, hesitate at center
      const h = this._hesitationCurve(p);
      aX  = -10 + 26 * h;
      bX  =  10 - 26 * h;
      daX = -10 + 28 * h;
      dbX =  10 - 28 * h;
    } else {
      // Phase 3: aftermath
      aX  =  16; bX  = -16;
      gaX =  -4; gbX =   4;
      daX =  18; dbX = -18;
    }

    this.clusterA.position.x = aX;
    this.clusterB.position.x = bX;
    this.gasA.position.x = gaX;
    this.gasB.position.x = gbX;
    this.dmA.position.x = daX;
    this.dmB.position.x = dbX;

    this._applyChunk(currentChunk, this.ctx.lang);
  }
}