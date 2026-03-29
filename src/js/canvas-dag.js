_initWhenReady('adag', function() {
 const c = document.getElementById('adag');
 if (!c) return;

 const ctx = c.getContext('2d');
 const KAS = 'rgba(73,234,203,';
 const GOLD = 'rgba(240,192,64,';
 const PURPLE = 'rgba(192,132,252,';
 const NODE_COUNT = 65;

 let nodes = [];
 let edges = [];
 let dust = [];
 let W = 0, H = 0, cx = 0, cy = 0, R = 0;
 let t = 0;
 let rafId = null;
 let resizeTimer = null;
 let lastCssW = 0;
 let lastCssH = 0;
 let sceneBuilt = false;

 function buildScene() {
  nodes = [];
  edges = [];
  dust = [];

  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < NODE_COUNT; i++) {
   const y = 1 - (i / (NODE_COUNT - 1)) * 2;
   const r = Math.sqrt(1 - y * y);
   const th = golden * i;
   const rng = Math.random();

   nodes.push({
    x: Math.cos(th) * r,
    y,
    z: Math.sin(th) * r,
    sz: rng < 0.12 ? 5.5 : rng < 0.22 ? 4.5 : 3.6,
    col: rng < 0.12 ? GOLD : rng < 0.22 ? PURPLE : KAS,
    ph: Math.random() * 6.28,
    sp: 0.02 + Math.random() * 0.03
   });
  }

  for (let i = 0; i < nodes.length; i++) {
   for (let j = i + 1; j < nodes.length; j++) {
    const dx = nodes[i].x - nodes[j].x;
    const dy = nodes[i].y - nodes[j].y;
    const dz = nodes[i].z - nodes[j].z;

    if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.7 && Math.random() < 0.48) {
     edges.push([i, j]);
    }
   }
  }

  for (let i = 0; i < 25; i++) {
   const rng = Math.random();

   dust.push({
    ang: Math.random() * 6.28,
    dist: 1.02 + Math.random() * 0.1,
    speed: (0.0008 + Math.random() * 0.003) * (Math.random() < 0.5 ? 1 : -1),
    sz: 1 + Math.random() * 1.8,
    col: rng < 0.25 ? GOLD : rng < 0.45 ? PURPLE : KAS,
    ph: Math.random() * 6.28,
    psp: 0.008 + Math.random() * 0.02,
    yoff: 0.5 + Math.random() * 0.4
   });
  }

  sceneBuilt = true;
 }

 function resizeCanvas(forceRebuild) {
  const wrap = c.parentElement;
  if (!wrap) return;

  const rect = wrap.getBoundingClientRect();
  const cssW = Math.max(280, Math.round(rect.width || c.offsetWidth || 500));
  const cssH = Math.max(260, Math.round(rect.height || c.offsetHeight || 440));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const widthChanged = Math.abs(cssW - lastCssW) > 6;
  const heightChanged = Math.abs(cssH - lastCssH) > 6;

  if (!forceRebuild && !widthChanged && !heightChanged && c.width && c.height) {
   return;
  }

  lastCssW = cssW;
  lastCssH = cssH;

  c.width = Math.round(cssW * dpr);
  c.height = Math.round(cssH * dpr);
  c.style.width = cssW + 'px';
  c.style.height = cssH + 'px';

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  W = cssW;
  H = cssH;

  const mob = window.innerWidth <= 640;
  cx = mob ? W / 2 : W / 2 + W * 0.035;
  cy = H / 2;
  R = mob ? Math.min(W, H) * 0.33 : Math.min(H * 0.42, W * 0.36);

  if (!sceneBuilt || forceRebuild) {
   buildScene();
   return;
  }

  dust.forEach((d) => {
   d.dist = R * (d.dist / Math.max(1, d.dist / R));
  });
 }

 function rY(x, y, z, a) {
  return {
   x: x * Math.cos(a) + z * Math.sin(a),
   y,
   z: -x * Math.sin(a) + z * Math.cos(a)
  };
 }

 function rX(x, y, z, a) {
  return {
   x,
   y: y * Math.cos(a) - z * Math.sin(a),
   z: y * Math.sin(a) + z * Math.cos(a)
  };
 }

 function pj(x, y, z) {
  const d = 2.8;
  const s = d / (d + z);

  return {
   sx: cx + x * R * s,
   sy: cy + y * R * s,
   sc: s,
   z
  };
 }

 function frame() {
  ctx.clearRect(0, 0, W, H);

  t += 0.003;
  const ra = t * 0.7;
  const ta = 0.32;

  var g1 = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.14);
  g1.addColorStop(0, 'rgba(73,234,203,.06)');
  g1.addColorStop(0.6, 'rgba(73,234,203,.02)');
  g1.addColorStop(1, 'rgba(73,234,203,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.14, 0, 6.28);
  ctx.fillStyle = g1;
  ctx.fill();

  var g2 = ctx.createRadialGradient(cx + R * 0.2, cy - R * 0.15, 0, cx + R * 0.1, cy, R * 1.1);
  g2.addColorStop(0, 'rgba(192,132,252,.04)');
  g2.addColorStop(0.6, 'rgba(192,132,252,.01)');
  g2.addColorStop(1, 'rgba(192,132,252,0)');
  ctx.beginPath();
  ctx.arc(cx + R * 0.1, cy, R * 1.1, 0, 6.28);
  ctx.fillStyle = g2;
  ctx.fill();

  var g3 = ctx.createRadialGradient(cx - R * 0.15, cy + R * 0.12, 0, cx, cy, R * 1.05);
  g3.addColorStop(0, 'rgba(240,192,64,.022)');
  g3.addColorStop(1, 'rgba(240,192,64,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.05, 0, 6.28);
  ctx.fillStyle = g3;
  ctx.fill();

  dust.forEach((d) => {
   d.ang += d.speed;
   d.ph += d.psp;

   const distPx = R * (1.02 + ((d.dist / R) - 1.02));
   const dx = cx + Math.cos(d.ang) * distPx;
   const dy = cy + Math.sin(d.ang) * distPx * d.yoff;

   if (dx < 0 || dx > W || dy < 0 || dy > H) return;

   const a = 0.2 + 0.25 * Math.sin(d.ph);

   ctx.beginPath();
   ctx.arc(dx, dy, d.sz * 2.2, 0, 6.28);
   ctx.fillStyle = d.col + (a * 0.06) + ')';
   ctx.fill();

   ctx.beginPath();
   ctx.arc(dx, dy, d.sz, 0, 6.28);
   ctx.fillStyle = d.col + (a * 0.4) + ')';
   ctx.fill();
  });

  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = '#49eacb';
  ctx.lineWidth = 0.7;

  ctx.beginPath();
  for (let a = 0; a <= 6.3; a += 0.05) {
   const p = rY(Math.cos(a), 0, Math.sin(a), ra);
   const q = rX(p.x, p.y, p.z, ta);
   const s = pj(q.x, q.y, q.z);
   a < 0.01 ? ctx.moveTo(s.sx, s.sy) : ctx.lineTo(s.sx, s.sy);
  }
  ctx.stroke();

  for (let m = 0; m < 2; m++) {
   ctx.beginPath();
   const mo = m * 1.57;
   for (let a = 0; a <= 6.3; a += 0.05) {
    const q = rX(
     Math.cos(a) * Math.cos(mo + ra),
     Math.sin(a),
     Math.cos(a) * Math.sin(mo + ra),
     ta
    );
    const s = pj(q.x, q.y, q.z);
    a < 0.01 ? ctx.moveTo(s.sx, s.sy) : ctx.lineTo(s.sx, s.sy);
   }
   ctx.stroke();
  }

  [-0.5, 0.5].forEach((lat) => {
   const lr = Math.sqrt(1 - lat * lat);
   ctx.beginPath();
   for (let a = 0; a <= 6.3; a += 0.05) {
    const p = rY(Math.cos(a) * lr, lat, Math.sin(a) * lr, ra);
    const q = rX(p.x, p.y, p.z, ta);
    const s = pj(q.x, q.y, q.z);
    a < 0.01 ? ctx.moveTo(s.sx, s.sy) : ctx.lineTo(s.sx, s.sy);
   }
   ctx.stroke();
  });

  ctx.globalAlpha = 1;

  var gf = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.25, R * 0.08, cx + R * 0.05, cy + R * 0.05, R * 1.01);
  gf.addColorStop(0, 'rgba(18,55,60,.4)');
  gf.addColorStop(0.25, 'rgba(8,32,42,.4)');
  gf.addColorStop(0.5, 'rgba(4,18,28,.3)');
  gf.addColorStop(0.75, 'rgba(2,12,18,.15)');
  gf.addColorStop(1, 'rgba(2,11,17,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 6.28);
  ctx.fillStyle = gf;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R - 0.5, 0, 6.28);
  ctx.clip();

  const wt = t * 2.5;
  for (let w = 0; w < 7; w++) {
   const wy = cy - R * 0.7 + w * (R * 1.4 / 6);
   const wAlpha = 0.04 + 0.03 * Math.sin(wt + w * 0.8);
   const wColor = w < 2 ? PURPLE : w > 4 ? GOLD : KAS;

   ctx.beginPath();
   for (let x = cx - R; x <= cx + R; x += 2) {
    const nx = (x - cx) / R;
    const wave = Math.sin(nx * 4 + wt + w * 1.1) * R * 0.06 +
                 Math.sin(nx * 7 - wt * 0.7 + w * 0.5) * R * 0.03;
    x === cx - R
     ? ctx.moveTo(x, wy + wave)
     : ctx.lineTo(x, wy + wave + Math.sin(wt * 0.3 + w) * R * 0.04);
   }
   ctx.strokeStyle = wColor + wAlpha + ')';
   ctx.lineWidth = 1.5 + Math.sin(wt + w) * 0.5;
   ctx.stroke();
  }

  for (let i = 0; i < 5; i++) {
   const lx = cx - R * 0.4 + i * (R * 0.2) + Math.sin(wt * 0.4 + i * 2) * R * 0.15;
   const ly = cy - R * 0.3 + Math.cos(wt * 0.3 + i * 1.5) * R * 0.2;
   const lr = R * 0.12 + Math.sin(wt * 0.6 + i) * R * 0.04;
   const la = 0.02 + 0.015 * Math.sin(wt + i * 1.3);

   var lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
   lg.addColorStop(0, KAS + la + ')');
   lg.addColorStop(1, KAS + '0)');
   ctx.beginPath();
   ctx.arc(lx, ly, lr, 0, 6.28);
   ctx.fillStyle = lg;
   ctx.fill();
  }

  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 6.28);
  ctx.strokeStyle = 'rgba(73,234,203,.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  var hl = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.32, 0, cx - R * 0.2, cy - R * 0.22, R * 0.45);
  hl.addColorStop(0, 'rgba(73,234,203,.05)');
  hl.addColorStop(0.5, 'rgba(73,234,203,.012)');
  hl.addColorStop(1, 'rgba(73,234,203,0)');
  ctx.beginPath();
  ctx.arc(cx - R * 0.2, cy - R * 0.22, R * 0.45, 0, 6.28);
  ctx.fillStyle = hl;
  ctx.fill();

  const pr = nodes.map((n) => {
   const a = rY(n.x, n.y, n.z, ra);
   const b = rX(a.x, a.y, a.z, ta);
   const p = pj(b.x, b.y, b.z);

   return {
    ...p,
    n,
    vis: b.z < 0.15
   };
  });

  [false, true].forEach((fp) => {
   edges.forEach(([i, j]) => {
    const a = pr[i];
    const b = pr[j];
    const bf = a.vis && b.vis;
    const bb = !a.vis && !b.vis;

    if (fp && bb) return;
    if (!fp && !bb) return;

    const al = bf ? 0.28 : bb ? 0.035 : 0.06;
    const col = a.n.col === GOLD || b.n.col === GOLD
     ? GOLD
     : a.n.col === PURPLE || b.n.col === PURPLE
      ? PURPLE
      : KAS;

    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.strokeStyle = col + al + ')';
    ctx.lineWidth = bf ? 1.3 : 0.4;
    ctx.stroke();
   });
  });

  const now = t * 4;
  [0, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88].forEach((off) => {
   const ei = Math.floor(now + off * edges.length) % edges.length;
   const [i, j] = edges[ei];
   const a = pr[i];
   const b = pr[j];

   if (!a.vis && !b.vis) return;

   const p = (now * 1.5 + off * 7) % 1;
   const px = a.sx + (b.sx - a.sx) * p;
   const py = a.sy + (b.sy - a.sy) * p;
   const al = a.vis && b.vis ? 1 : 0.2;

   ctx.beginPath();
   ctx.arc(px, py, 3.5 * a.sc, 0, 6.28);
   ctx.fillStyle = 'rgba(240,192,64,' + al + ')';
   ctx.fill();

   ctx.beginPath();
   ctx.arc(px, py, 10 * a.sc, 0, 6.28);
   ctx.fillStyle = 'rgba(240,192,64,' + (al * 0.14) + ')';
   ctx.fill();
  });

  [false, true].forEach((fp) => {
   pr.forEach((p) => {
    if (fp !== p.vis) return;

    p.n.ph += p.n.sp;
    const g = 0.6 + 0.4 * Math.sin(p.n.ph);
    const ba = p.vis ? 1 : 0.11;
    const sz = p.n.sz * p.sc;

    if (p.vis) {
     ctx.beginPath();
     ctx.arc(p.sx, p.sy, sz * 4.5, 0, 6.28);
     ctx.fillStyle = p.n.col + (g * 0.12) + ')';
     ctx.fill();

     ctx.beginPath();
     ctx.arc(p.sx, p.sy, sz * 2, 0, 6.28);
     ctx.fillStyle = p.n.col + (g * 0.06) + ')';
     ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(p.sx, p.sy, sz * 1.1, 0, 6.28);
    ctx.fillStyle = p.n.col + (g * ba) + ')';
    ctx.fill();

    if (p.vis && p.n.sz > 4) {
     ctx.beginPath();
     ctx.arc(p.sx, p.sy, sz * 0.45, 0, 6.28);
     ctx.fillStyle = p.n.col + '.9)';
     ctx.fill();
    }
   });
  });

  var rim = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.04);
  rim.addColorStop(0, 'rgba(73,234,203,0)');
  rim.addColorStop(0.4, 'rgba(73,234,203,.06)');
  rim.addColorStop(0.7, 'rgba(192,132,252,.02)');
  rim.addColorStop(1, 'rgba(73,234,203,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.04, 0, 6.28);
  ctx.fillStyle = rim;
  ctx.fill();

  rafId = requestAnimationFrame(frame);
 }

 function start() {
  if (rafId) return;
  rafId = requestAnimationFrame(frame);
 }

 function stop() {
  if (!rafId) return;
  cancelAnimationFrame(rafId);
  rafId = null;
 }

 function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
   resizeCanvas(false);
  }, 120);
 }

 resizeCanvas(true);
 start();

 window.addEventListener('resize', handleResize);
 window.addEventListener('orientationchange', handleResize);

 document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
   stop();
  } else {
   resizeCanvas(false);
   start();
  }
 });
});
_initWhenReady('mdag', function() {
 const c = document.getElementById('mdag');
 if (!c) return;

 const ctx = c.getContext('2d');
 const K = 'rgba(73,234,203,';
 const GOLD = 'rgba(240,192,64,';
 const SCROLL_SPEED = 1.4;
 const BLOCK_GAP = 52;
 const LAYERS = 5;

 let blocks = [];
 let spawnX = 0;
 let frameCount = 0;
 let bps = 0;
 let mdW = 480;
 let mdH = 380;
 let rafId = null;
 let resizeTimer = null;
 let lastCssW = 0;
 let lastCssH = 0;
 let sceneBuilt = false;

 function mkBlock(x) {
  const lane = Math.floor(Math.random() * LAYERS);
  const y = mdH * (0.1 + lane * (0.8 / LAYERS)) + Math.random() * mdH * 0.14;
  const isGold = Math.random() < 0.08;
  const parents = [];
  const behind = blocks.filter((b) => b.x < x && b.x > x - BLOCK_GAP * 3.5);

  if (behind.length) {
   parents.push(behind[Math.floor(Math.random() * behind.length)]);
   if (behind.length > 1 && Math.random() < 0.45) {
    parents.push(behind[Math.floor(Math.random() * behind.length)]);
   }
  }

  return {
   x,
   y,
   r: isGold ? 5 : 3.5,
   isGold,
   parents,
   alpha: 0
  };
 }

 function buildScene() {
  blocks = [];
  frameCount = 0;

  for (let x = 40; x < mdW + BLOCK_GAP; x += BLOCK_GAP * (0.7 + Math.random() * 0.6)) {
   blocks.push(mkBlock(x));
  }

  blocks.forEach((b) => {
   b.alpha = 0.7 + Math.random() * 0.3;
  });

  spawnX = mdW + BLOCK_GAP;
  sceneBuilt = true;
 }

 function resizeCanvas(forceRebuild) {
  const wrap = c.parentElement;
  if (!wrap) return;

  const rect = wrap.getBoundingClientRect();
  const mob = window.innerWidth <= 640;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const cssW = Math.max(280, Math.round(rect.width || c.offsetWidth || window.innerWidth || 480));
  const cssH = Math.max(220, Math.round(rect.height || c.offsetHeight || (mob ? 220 : 380)));

  const widthChanged = Math.abs(cssW - lastCssW) > 6;
  const heightChanged = Math.abs(cssH - lastCssH) > 6;

  if (!forceRebuild && !widthChanged && !heightChanged && c.width && c.height) {
   return;
  }

  lastCssW = cssW;
  lastCssH = cssH;

  c.width = Math.round(cssW * dpr);
  c.height = Math.round(cssH * dpr);
  c.style.width = cssW + 'px';
  c.style.height = cssH + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  mdW = cssW;
  mdH = cssH;

  if (!sceneBuilt || forceRebuild) {
   buildScene();
   return;
  }

  const oldW = Math.max(1, mdW);
  const scaleX = cssW / oldW;

  blocks.forEach((b) => {
   b.x *= scaleX;
  });

  spawnX = cssW + BLOCK_GAP;
 }

 const bpsTimer = setInterval(() => {
  bps++;
  const el = document.getElementById('bpsc');
  if (el) el.textContent = Math.min(10, bps) + ' BPS';
  setTimeout(() => bps--, 1000);
 }, 100);

 function drawFrame() {
  const W = mdW;
  const H = mdH;

  ctx.clearRect(0, 0, W, H);
  frameCount++;

  blocks.forEach((b) => {
   b.x -= SCROLL_SPEED;
   b.alpha = Math.min(1, b.alpha + 0.04);
  });

  if (frameCount % Math.floor(BLOCK_GAP / SCROLL_SPEED / 1.4) === 0) {
   blocks.push(mkBlock(mdW + 40));
  }

  blocks = blocks.filter((b) => b.x > -30);

  blocks.forEach((b) => {
   b.parents.forEach((p) => {
    if (p.x < -30) return;

    const alpha = Math.min(b.alpha, p.alpha) * 0.22;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = b.isGold ? GOLD + alpha + ')' : K + (alpha * 1.8) + ')';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    const mx = (b.x + p.x) / 2;
    const my = (b.y + p.y) / 2;
    const ang = Math.atan2(p.y - b.y, p.x - b.x);

    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx - 6 * Math.cos(ang - 0.42), my - 6 * Math.sin(ang - 0.42));
    ctx.lineTo(mx - 6 * Math.cos(ang + 0.42), my - 6 * Math.sin(ang + 0.42));
    ctx.closePath();
    ctx.fillStyle = b.isGold ? GOLD + (alpha * 1.4) + ')' : K + (alpha * 1.4) + ')';
    ctx.fill();
   });
  });

  blocks.forEach((b) => {
   const col = b.isGold ? GOLD : K;
   const a = b.alpha;

   ctx.beginPath();
   ctx.arc(b.x, b.y, b.r * 3.8, 0, Math.PI * 2);
   ctx.fillStyle = col + (a * 0.1) + ')';
   ctx.fill();

   ctx.beginPath();
   ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
   ctx.fillStyle = col + a + ')';
   ctx.fill();
  });

  const now = Date.now() / 1000;

  blocks.forEach((b) => {
   b.parents.forEach((p, pi) => {
    if (p.x < -30 || b.alpha < 0.5) return;

    [0, 0.5].forEach((offset) => {
     const prog = (now * 1.8 + b.x * 0.008 + pi * 0.3 + offset) % 1;
     const tx = p.x + (b.x - p.x) * prog;
     const ty = p.y + (b.y - p.y) * prog;

     ctx.beginPath();
     ctx.arc(tx, ty, 2.2, 0, Math.PI * 2);
     ctx.fillStyle = 'rgba(240,192,64,.75)';
     ctx.fill();

     ctx.beginPath();
     ctx.arc(tx, ty, 5, 0, Math.PI * 2);
     ctx.fillStyle = 'rgba(240,192,64,.08)';
     ctx.fill();
    });
   });
  });

  rafId = requestAnimationFrame(drawFrame);
 }

 function start() {
  if (rafId) return;
  rafId = requestAnimationFrame(drawFrame);
 }

 function stop() {
  if (!rafId) return;
  cancelAnimationFrame(rafId);
  rafId = null;
 }

 function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
   resizeCanvas(false);
  }, 120);
 }

 resizeCanvas(true);
 start();

 window.addEventListener('resize', handleResize);
 window.addEventListener('orientationchange', handleResize);

 document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
   stop();
  } else {
   resizeCanvas(false);
   start();
  }
 });
});
_initWhenReady('orbit-canvas', function() {
 const canvas=document.getElementById('orbit-canvas');
 const tip=document.getElementById('orbit-tooltip');
 if(!canvas)return;
 const ctx=canvas.getContext('2d');

 const RANKS=[
 {
 emoji:'🧜', name:'Aquaman', tier:'Tier I — Supreme', color:'#f0c040', ring:0, speed:.2, size:30, angle:0
 },
 {
 emoji:'🐋', name:'Humpback', tier:'Tier II — Leviathan', color:'#c084fc', ring:1, speed:.14, size:25, angle:0.6
 },
 {
 emoji:'🐳', name:'Blue Whale', tier:'Tier III — Apex', color:'#7dd3fc', ring:1, speed:.14, size:25, angle:2.7
 },
 {
 emoji:'🦈', name:'Shark', tier:'Tier IV — Predator', color:'#60a5fa', ring:1, speed:.14, size:23, angle:4.8
 },
 {
 emoji:'🐬', name:'Dolphin', tier:'Tier V — Smart', color:'#34d399', ring:2, speed:.095, size:21, angle:0.3
 },
 {
 emoji:'🐟', name:'Fish', tier:'Tier VI — Swimmer', color:'#4ade80', ring:2, speed:.095, size:19, angle:1.5
 },
 {
 emoji:'🐙', name:'Octopus', tier:'Tier VII — Depths', color:'#f472b6', ring:2, speed:.095, size:19, angle:2.7
 },
 {
 emoji:'🦀', name:'Crab', tier:'Tier VIII — Floor', color:'#fb923c', ring:2, speed:.095, size:18, angle:3.9
 },
 {
 emoji:'🦐', name:'Shrimp', tier:'Tier IX — Starter', color:'#f9a8d4', ring:2, speed:.095, size:17, angle:5.1
 },
 {
 emoji:'🦪', name:'Oyster', tier:'Tier X — Seabed', color:'#94a3b8', ring:2, speed:.095, size:17, angle:0.9
 },
 {
 emoji:'🦠', name:'Plankton', tier:'Tier XI — Genesis', color:'#64748b', ring:2, speed:.095, size:15, angle:3.3
 },
 ];

 const RADII=[0, 110, 190, 275];
 let W, H, cx, cy, scale;
 let hoveredRank=null;
 let dpr=1;
 let emojiCache={};

 function resize() {
 emojiCache={};
 const rect=canvas.parentElement.getBoundingClientRect();
 const isMob=window.innerWidth<=640;
 const isMid=window.innerWidth<=1024;
 dpr=window.devicePixelRatio||1;
 const cssW=window.innerWidth<=1024 ? window.innerWidth : (rect.width||580);
 const cssH=isMob?300:isMid?460:Math.min(680, window.innerWidth*0.6);
 canvas.width=cssW*dpr;
 canvas.height=cssH*dpr;
 canvas.style.width=cssW+'px';
 canvas.style.height=cssH+'px';
 ctx.setTransform(dpr,0,0,dpr,0,0);
 W=cssW; H=cssH;
 cx=W/2; cy=H*0.5;
 scale=Math.min(W, H)/680;
 }
 let t=0;
 let lastPositions=[];

 resize();
 frame();
 let _ot; window.addEventListener('resize', ()=> { clearTimeout(_ot); _ot=setTimeout(resize, 150) });

 function hex2rgb(hex) {
 return[parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
 }

 function frame() {
 ctx.clearRect(0, 0, W, H);
 ctx.save();
 ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
 t+=.006;
 const ringColors=[
 [240, 192, 64], // gold inner
 [73, 234, 203], // kas middle
 [192, 132, 252] // purple outer
 ];
 [1, 2, 3].forEach((ri, i)=> {
 const r=RADII[ri]*scale;
 const rc=ringColors[i];
 const alpha=.12+.06*Math.sin(t*1.5+i);
 ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
 ctx.strokeStyle=`rgba(${rc[0]},${rc[1]},${rc[2]},${alpha})`;
 ctx.lineWidth=1.5;
 ctx.setLineDash([4, 8]); ctx.stroke(); ctx.setLineDash([]);
 ctx.beginPath(); ctx.arc(cx, cy, r+3*scale, 0, Math.PI*2);
 ctx.strokeStyle=`rgba(${rc[0]},${rc[1]},${rc[2]},${alpha*.25})`;
 ctx.lineWidth=6*scale; ctx.stroke();
 });
 for(let i=0; i<18; i++) {
 const pa=t*.4+i*1.1;
 const pr=(60+i*22)*scale;
 const px=cx+Math.cos(pa)*pr;
 const py=cy+Math.sin(pa)*pr;
 const pc=ringColors[i%3];
 const palpha=.15+.12*Math.sin(t*3+i*2);
 ctx.beginPath(); ctx.arc(px, py, 1.5*scale, 0, Math.PI*2);
 ctx.fillStyle=`rgba(${pc[0]},${pc[1]},${pc[2]},${palpha})`; ctx.fill();
 }
 const positions=RANKS.map((rank, i)=> {
 const r=RADII[rank.ring+1]*scale;
 const angle=rank.angle+t*rank.speed*(i%2===0?1:-1);
 return {
 x:cx+Math.cos(angle)*r, y:cy+Math.sin(angle)*r, rank, angle
 };
 });

 lastPositions=positions;
 for(let i=0; i<positions.length-1; i++) {
 const a=positions[i], b=positions[i+1];
 const dist=Math.hypot(b.x-a.x, b.y-a.y);
 const maxDist=260*scale;
 if(dist<maxDist) {
 const[r1, g1, b1]=hex2rgb(a.rank.color);
 const[r2, g2, b2]=hex2rgb(b.rank.color);
 const alpha=(1-dist/maxDist)*.45;
 const grad=ctx.createLinearGradient(a.x, a.y, b.x, b.y);
 grad.addColorStop(0, `rgba(${r1},${g1},${b1},${alpha})`);
 grad.addColorStop(1, `rgba(${r2},${g2},${b2},${alpha})`);
 ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
 ctx.strokeStyle=grad; ctx.lineWidth=1.4; ctx.stroke();
 }
 }
 for(let i=0; i<positions.length; i++) {
 for(let j=i+2; j<positions.length; j++) {
 const a=positions[i], b=positions[j];
 const dist=Math.hypot(b.x-a.x, b.y-a.y);
 if(dist<180*scale) {
 const[r1, g1, b1]=hex2rgb(a.rank.color);
 const[r2, g2, b2]=hex2rgb(b.rank.color);
 const alpha=(1-dist/(180*scale))*.12;
 const grad=ctx.createLinearGradient(a.x, a.y, b.x, b.y);
 grad.addColorStop(0, `rgba(${r1},${g1},${b1},${alpha})`);
 grad.addColorStop(1, `rgba(${r2},${g2},${b2},${alpha})`);
 ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
 ctx.strokeStyle=grad; ctx.lineWidth=.6; ctx.stroke();
 }
 }
 }
 positions.forEach(({
 x, y, rank
 })=> {
 const[r, g, b]=hex2rgb(rank.color);
 const dist=Math.hypot(x-cx, y-cy);
 const alpha=Math.max(0, (1-dist/(280*scale))*.18);
 ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
 ctx.strokeStyle=`rgba(${r},${g},${b},${alpha})`;
 ctx.lineWidth=.8; ctx.stroke();
 });
 // Pre-render emoji sprites at high resolution for crisp mobile quality
 function getEmojiSprite(emoji, size) {
   const key=emoji+'_'+Math.round(size);
   if(emojiCache[key]) return emojiCache[key];
   const renderPx=Math.max(size,16)*4;
   const osc=document.createElement('canvas');
   osc.width=renderPx; osc.height=renderPx;
   const oCtx=osc.getContext('2d');
   oCtx.font=`${renderPx*.75}px serif`;
   oCtx.textAlign='center'; oCtx.textBaseline='middle';
   oCtx.fillText(emoji, renderPx/2, renderPx/2);
   emojiCache[key]=osc;
   return osc;
 }

 positions.forEach(({
 x, y, rank
 })=> {
 const isHovered=hoveredRank===rank;
 const s=rank.size*scale*(isHovered?1.4:1);
 const[r, g, b]=hex2rgb(rank.color);
 const glowAlpha=isHovered?.5:(.14+.1*Math.sin(t*2+rank.angle));
 const grd=ctx.createRadialGradient(x, y, 0, x, y, s*3);
 grd.addColorStop(0, `rgba(${r},${g},${b},${glowAlpha})`);
 grd.addColorStop(.5, `rgba(${r},${g},${b},${glowAlpha*.3})`);
 grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
 ctx.beginPath(); ctx.arc(x, y, s*3, 0, Math.PI*2);
 ctx.fillStyle=grd; ctx.fill();
 ctx.beginPath(); ctx.arc(x, y, s*1.08, 0, Math.PI*2);
 ctx.fillStyle=`rgba(2,11,17,${isHovered?.96:.87})`;
 ctx.fill();
 ctx.strokeStyle=`rgba(${r},${g},${b},${isHovered?.95:.55})`;
 ctx.lineWidth=isHovered?2:1.4;
 ctx.stroke();
 const drawSize=Math.max(s*1.15,14)*1.3;
 const sprite=getEmojiSprite(rank.emoji, s*1.15);
 ctx.drawImage(sprite, x-drawSize/2, y-drawSize/2, drawSize, drawSize);
 });
 const pulse=.5+.5*Math.sin(t*2.3);
 const coreR=32*scale;
 const ng1=ctx.createRadialGradient(cx-8*scale, cy-6*scale, 0, cx, cy, coreR*3.5);
 ng1.addColorStop(0, `rgba(73,234,203,${.12+.06*pulse})`);
 ng1.addColorStop(.5, `rgba(192,132,252,${.04+.03*pulse})`);
 ng1.addColorStop(1, 'rgba(0,0,0,0)');
 ctx.beginPath(); ctx.arc(cx, cy, coreR*3.5, 0, Math.PI*2);
 ctx.fillStyle=ng1; ctx.fill();

 const ng2=ctx.createRadialGradient(cx+10*scale, cy+8*scale, 0, cx, cy, coreR*2.8);
 ng2.addColorStop(0, `rgba(240,192,64,${.06+.04*pulse})`);
 ng2.addColorStop(1, 'rgba(0,0,0,0)');
 ctx.beginPath(); ctx.arc(cx, cy, coreR*2.8, 0, Math.PI*2);
 ctx.fillStyle=ng2; ctx.fill();
 ctx.beginPath(); ctx.arc(cx, cy, coreR+20*scale*pulse, 0, Math.PI*2);
 ctx.strokeStyle=`rgba(73,234,203,${.04+.08*pulse})`; ctx.lineWidth=1; ctx.stroke();
 ctx.save();
 ctx.translate(cx, cy);
 ctx.rotate(t*.3);
 ctx.beginPath(); ctx.arc(0, 0, coreR*1.55, 0, Math.PI*2);
 ctx.strokeStyle=`rgba(73,234,203,${.06+.06*pulse})`;
 ctx.lineWidth=.8;
 ctx.setLineDash([8, 16]);
 ctx.stroke();
 ctx.setLineDash([]);
 ctx.restore();
 ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI*2);
 ctx.fillStyle='rgba(2,11,17,.97)'; ctx.fill();
 const ig=ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR*.9);
 ig.addColorStop(0, `rgba(73,234,203,${.06+.05*pulse})`);
 ig.addColorStop(1, 'rgba(73,234,203,0)');
 ctx.beginPath(); ctx.arc(cx, cy, coreR*.9, 0, Math.PI*2);
 ctx.fillStyle=ig; ctx.fill();
 ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI*2);
 ctx.strokeStyle=`rgba(73,234,203,${.45+.25*pulse})`;
 ctx.lineWidth=1.2; ctx.stroke();
 ctx.beginPath(); ctx.arc(cx, cy, coreR*.78, 0, Math.PI*2);
 ctx.strokeStyle=`rgba(73,234,203,${.08+.06*pulse})`;
 ctx.lineWidth=.6; ctx.stroke();
 ctx.save();
 ctx.translate(cx, cy);
 const ks=coreR*.72;
 ctx.scale(ks/12, ks/12);
 ctx.translate(-11.35, -11.9);
 ctx.shadowColor='rgba(73,234,203,.8)'; ctx.shadowBlur=8+10*pulse;
 ctx.fillStyle=`rgba(73,234,203,${.82+.18*pulse})`;
 ctx.beginPath();
 const kp=[[15.3, 18.9], [12.7, 18.5], [13.4, 13.4], [8, 17.6], [6.4, 15.6], [11.2, 11.9], [6.4, 8.2], [8, 6.2], [13.4, 10.4], [12.7, 5.3], [15.3, 4.9], [16.3, 11.9]];
 ctx.moveTo(kp[0][0], kp[0][1]);
 for(let i=1; i<kp.length; i++)ctx.lineTo(kp[i][0], kp[i][1]);
 ctx.closePath(); ctx.fill();
 ctx.shadowBlur=0;
 ctx.restore();
 ctx.restore(); // clip region

 requestAnimationFrame(frame);
 }
 function handlePointer(clientX, clientY) {
 const rect=canvas.getBoundingClientRect();
 const mx=(clientX-rect.left)*(W/rect.width);
 const my=(clientY-rect.top)*(H/rect.height);
 let found=null;
 lastPositions.forEach(p=> {
 if(Math.hypot(mx-p.x, my-p.y)<p.rank.size*scale*1.8)found=p;
 });
 hoveredRank=found?found.rank:null;
 canvas.style.cursor=found?'pointer':'default';
 if(found) {
 const rect2=canvas.getBoundingClientRect();
 const tipX=(found.x/W)*rect2.width;
 const tipY=(found.y/H)*rect2.height-36;
 const tipW=180;
 if(tipX+tipW+20>rect2.width){
 tip.style.left=(tipX-tipW-10)+'px';
 }else{
 tip.style.left=(tipX+18)+'px';
 }
 tip.style.top=tipY+'px';
 tip.innerHTML=`<div class="ot-name">${found.rank.emoji} ${found.rank.name}</div><div class="ot-tier" style="color:${found.rank.color}">${found.rank.tier}</div>`;
 tip.style.opacity='1';
 }
 else {
 tip.style.opacity='0';
 }
 }
 canvas.addEventListener('mousemove', e=>handlePointer(e.clientX, e.clientY));
 if(window.innerWidth>768) {
   canvas.addEventListener('touchstart', e=> {
   e.preventDefault(); handlePointer(e.touches[0].clientX, e.touches[0].clientY);
   }, {
   passive:false
   });
   canvas.addEventListener('touchmove', e=> {
   e.preventDefault(); handlePointer(e.touches[0].clientX, e.touches[0].clientY);
   }, {
   passive:false
   });
 }
 canvas.addEventListener('mouseleave', ()=> {
 hoveredRank=null; tip.style.opacity='0';
 });
 canvas.addEventListener('touchend', ()=> {
 setTimeout(()=> {
 hoveredRank=null; tip.style.opacity='0';
 }, 1200);
 });
});
// end orbital _initWhenReady
