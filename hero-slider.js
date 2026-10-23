import * as THREE from 'three';

const state = { current: 0 };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function _resizeCheck(canvas, renderer, camera, dpr) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (w <= 0 || h <= 0) return false;
  const cw = Math.floor(w * dpr), ch = Math.floor(h * dpr);
  if (canvas.width !== cw || canvas.height !== ch) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    return true;
  }
  return false;
}

function initSlides() {
  const slider = document.getElementById('hero-slider');
  if (!slider) return;
  const slides = slider.querySelectorAll('.slide');
  const dots = slider.querySelectorAll('.dot');
  const prevBtn = slider.querySelector('.slider-arrow.prev');
  const nextBtn = slider.querySelector('.slider-arrow.next');
  const AUTO_MS = 7000;
  let autoTimer = null;
  let paused = false;

  function goTo(i) {
    i = ((i % slides.length) + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle('active', j === i));
    dots.forEach((d, j) => d.classList.toggle('active', j === i));
    state.current = i;
    restart();
  }
  function next() { goTo(state.current + 1); }
  function prev() { goTo(state.current - 1); }
  function restart() {
    if (autoTimer) clearInterval(autoTimer);
    if (!paused && !reducedMotion) autoTimer = setInterval(next, AUTO_MS);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  slider.addEventListener('mouseenter', () => {
    paused = true;
    if (autoTimer) clearInterval(autoTimer);
  });
  slider.addEventListener('mouseleave', () => {
    paused = false;
    restart();
  });

  let touchX = 0;
  slider.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) dx > 0 ? prev() : next();
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  });

  populateGallery(slider);
  restart();
}

function populateGallery(slider) {
  const grid = slider.querySelector('.slide-gallery-grid');
  if (!grid || grid.children.length > 0) return;
  const items = window.GALLERY_PREVIEW;
  if (!items || !items.length) {
    setTimeout(() => populateGallery(slider), 150);
    return;
  }
  items.slice(0, 6).forEach(item => {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.title || '';
    img.loading = 'lazy';
    grid.appendChild(img);
  });
}

function initSolarSystem() {
  const canvas = document.getElementById('solar-canvas');
  if (!canvas) return;
  const isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio, 2.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x05060a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);

  // Stars
  const N = isMobile ? 800 : 1500;
  const sPos = new Float32Array(N * 3);
  const sCol = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 100 + Math.random() * 250;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    sPos[i*3] = r * Math.sin(ph) * Math.cos(th);
    sPos[i*3+1] = r * Math.cos(ph);
    sPos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
    const c = Math.random();
    if (c < 0.5) { sCol[i*3]=0.85; sCol[i*3+1]=0.9; sCol[i*3+2]=1; }
    else if (c < 0.85) { sCol[i*3]=1; sCol[i*3+1]=1; sCol[i*3+2]=1; }
    else { sCol[i*3]=1; sCol[i*3+1]=0.92; sCol[i*3+2]=0.75; }
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3));
  scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
    size: 1.5, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true
  })));

  scene.add(new THREE.AmbientLight(0x303040, 1.5));
  const sunLight = new THREE.PointLight(0xffeedd, 3, 0, 1);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffcc44 })
  );
  scene.add(sun);

  const glowTex = makeGlowTexture();
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.85
  }));
  sunGlow.scale.set(14, 14, 1);
  scene.add(sunGlow);

  const planetsData = [
    { color: 0x8c8c8c, size: 0.4, dist: 4.5, speed: 1.8 },
    { color: 0xe6c28b, size: 0.65, dist: 6.5, speed: 1.4 },
    { color: 0x4a90d9, size: 0.7, dist: 9, speed: 1.1 },
    { color: 0xd95c3d, size: 0.55, dist: 11.5, speed: 0.9 },
    { color: 0xd9b38c, size: 1.5, dist: 15, speed: 0.6 },
    { color: 0xe0c97a, size: 1.3, dist: 19, speed: 0.45, ring: true },
    { color: 0x7ad9d9, size: 0.9, dist: 23, speed: 0.35 },
    { color: 0x3d5cd9, size: 0.85, dist: 27, speed: 0.28 }
  ];
  const planets = [];
  planetsData.forEach(p => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(p.size, 24, 24),
      new THREE.MeshStandardMaterial({
        color: p.color, roughness: 0.8, metalness: 0.1,
        emissive: p.color, emissiveIntensity: 0.1
      })
    );
    mesh.userData = { dist: p.dist, speed: p.speed, angle: Math.random() * Math.PI * 2 };
    scene.add(mesh);

    const pts = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist));
    }
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xe8b96a, transparent: true, opacity: 0.06 })
    ));

    if (p.ring) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(p.size * 1.4, p.size * 2.2, 48),
        new THREE.MeshBasicMaterial({ color: 0xe0c97a, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
      );
      ring.rotation.x = Math.PI / 2.2;
      mesh.add(ring);
    }
    planets.push(mesh);
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    _resizeCheck(canvas, renderer, camera, dpr);
    if (state.current !== 0) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    sun.rotation.y += dt * 0.1;
    sunGlow.material.opacity = 0.75 + Math.sin(t * 1.5) * 0.1;

    planets.forEach(m => {
      m.userData.angle += dt * m.userData.speed * 0.35;
      m.position.x = Math.cos(m.userData.angle) * m.userData.dist;
      m.position.z = Math.sin(m.userData.angle) * m.userData.dist;
      m.rotation.y += dt * 0.5;
    });

    const r = 52;
    const ang = t * 0.05;
    camera.position.x = Math.cos(ang) * r;
    camera.position.z = Math.sin(ang) * r;
    camera.position.y = 28 + Math.sin(t * 0.3) * 2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
}

function makeGlowTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0, 'rgba(255,250,235,1)');
  g.addColorStop(0.15, 'rgba(255,225,180,0.85)');
  g.addColorStop(0.4, 'rgba(255,180,100,0.35)');
  g.addColorStop(0.7, 'rgba(255,140,70,0.08)');
  g.addColorStop(1, 'rgba(255,100,50,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function initGalaxySlide() {
  const canvas = document.getElementById('galaxy-canvas');
  if (!canvas) return;
  const isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio, 2.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x05060a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);

  // Background stars
  const N = isMobile ? 500 : 900;
  const sPos = new Float32Array(N * 3);
  const sCol = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 80 + Math.random() * 200;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    sPos[i*3]   = r * Math.sin(ph) * Math.cos(th);
    sPos[i*3+1] = r * Math.cos(ph);
    sPos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
    const c = Math.random();
    if (c < 0.5) { sCol[i*3]=0.85; sCol[i*3+1]=0.9; sCol[i*3+2]=1; }
    else { sCol[i*3]=1; sCol[i*3+1]=1; sCol[i*3+2]=1; }
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3));
  scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
    size: 1.4, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true
  })));

  // Galaxy spiral (from darkmatter scene1)
  const GALAXY_R = 10;
  const STAR_COUNT = isMobile ? 5000 : 9000;
  const BULGE_COUNT = Math.floor(STAR_COUNT * 0.18);
  const R_CORE = 1.8;

  const gPos = new Float32Array(STAR_COUNT * 3);
  const gCol = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    if (i < BULGE_COUNT) {
      const r = Math.pow(Math.random(), 0.55) * R_CORE;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      gPos[i*3]   = r * Math.sin(ph) * Math.cos(th);
      gPos[i*3+1] = r * Math.cos(ph) * 0.35;
      gPos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
      const c = Math.random();
      if (c < 0.4) { gCol[i*3]=1; gCol[i*3+1]=0.95; gCol[i*3+2]=0.78; }
      else if (c < 0.75) { gCol[i*3]=1; gCol[i*3+1]=0.85; gCol[i*3+2]=0.58; }
      else { gCol[i*3]=1; gCol[i*3+1]=0.92; gCol[i*3+2]=0.82; }
    } else {
      const arm = Math.floor(Math.random() * 2);
      const armOffset = arm * Math.PI;
      const r = R_CORE + Math.pow(Math.random(), 0.65) * (GALAXY_R - R_CORE);
      const armPhase = Math.log(r / R_CORE) / -0.45;
      const spread = (Math.random() - 0.5) * 0.55;
      const th = armOffset + armPhase + spread;
      gPos[i*3]   = r * Math.cos(th);
      gPos[i*3+1] = (Math.random() - 0.5) * (r * 0.06 + 0.15);
      gPos[i*3+2] = r * Math.sin(th);
      const t = r / GALAXY_R;
      const c = Math.random();
      if (t < 0.5) {
        if (c < 0.4) { gCol[i*3]=1; gCol[i*3+1]=0.95; gCol[i*3+2]=0.82; }
        else if (c < 0.8) { gCol[i*3]=0.88; gCol[i*3+1]=0.94; gCol[i*3+2]=1; }
        else { gCol[i*3]=1; gCol[i*3+1]=1; gCol[i*3+2]=1; }
      } else {
        if (c < 0.5) { gCol[i*3]=0.72; gCol[i*3+1]=0.82; gCol[i*3+2]=1; }
        else { gCol[i*3]=0.85; gCol[i*3+1]=0.92; gCol[i*3+2]=1; }
      }
    }
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  gGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
  const galaxyPoints = new THREE.Points(gGeo, new THREE.PointsMaterial({
    size: 2.4, vertexColors: true, transparent: true, opacity: 0.95,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(galaxyPoints);

  // Dark matter halo (dim blue sphere — the "missing mass")
  const HALO_COUNT = isMobile ? 1200 : 2200;
  const hPos = new Float32Array(HALO_COUNT * 3);
  const hCol = new Float32Array(HALO_COUNT * 3);
  for (let i = 0; i < HALO_COUNT; i++) {
    const r = Math.pow(Math.random(), 0.8) * 14;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    hPos[i*3]   = r * Math.sin(ph) * Math.cos(th);
    hPos[i*3+1] = r * Math.cos(ph);
    hPos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
    const inten = Math.max(0.1, 1 - r / 14);
    hCol[i*3]   = 0.2 * inten;
    hCol[i*3+1] = 0.4 * inten;
    hCol[i*3+2] = 1.0 * inten;
  }
  const hGeo = new THREE.BufferGeometry();
  hGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
  hGeo.setAttribute('color', new THREE.BufferAttribute(hCol, 3));
  const haloPoints = new THREE.Points(hGeo, new THREE.PointsMaterial({
    size: 2.8, vertexColors: true, transparent: true, opacity: 0.5,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(haloPoints);

  // Core glow
  const glowTex = makeGlowTexture();
  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, opacity: 0.75
  }));
  coreGlow.scale.set(5, 5, 1);
  scene.add(coreGlow);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    _resizeCheck(canvas, renderer, camera, dpr);
    if (state.current !== 1) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    galaxyPoints.rotation.y += dt * 0.08;
    haloPoints.rotation.y += dt * 0.04;

    const r = 22;
    const ang = t * 0.06;
    camera.position.x = Math.cos(ang) * r;
    camera.position.z = Math.sin(ang) * r;
    camera.position.y = 14 + Math.sin(t * 0.3) * 1.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
}

function init() {
  initSlides();
  initSolarSystem();
  initGalaxySlide();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
