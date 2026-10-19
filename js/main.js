const $ = id => document.getElementById(id);
const bgm = CONFIG.bgMusic ? Object.assign(new Audio(CONFIG.bgMusic), { loop: true, volume: .5 }) : null;
addEventListener('pointerdown', () => { if (bgm) bgm.play().catch(() => {}); }, { once: true });

for (let i = 0; i < 20; i++) {
  const e = document.createElement('span');
  e.className = 'fl';
  e.textContent = ['🌸', '💗', '🌸', '💕', '🌷'][i % 5];
  e.style.cssText = `left:${Math.random() * 100}vw;font-size:${12 + Math.random() * 16}px;opacity:${.45 + Math.random() * .4};animation-duration:${9 + Math.random() * 10}s;animation-delay:${-Math.random() * 16}s`;
  document.body.appendChild(e);
}

/* ---------- Giai đoạn 1: ghép ảnh ---------- */
const grid = $('grid'), tiles = [];
let order = [0, 1, 2, 3, 4, 5, 6, 7, 8], sel = null, won = false;
const idx = order.slice().sort(() => Math.random() - .5);
for (let k = 0; k < 3; k++) { const a = idx[2 * k], b = idx[2 * k + 1]; [order[a], order[b]] = [order[b], order[a]]; }
for (let p = 0; p < 9; p++) {
  const d = document.createElement('div');
  d.className = 't'; d.dataset.p = p;
  d.style.backgroundImage = `url("${CONFIG.puzzleImage}")`;
  grid.appendChild(d); tiles.push(d);
}
function render() {
  let ok = 0;
  tiles.forEach((t, p) => {
    const v = order[p];
    t.style.backgroundPosition = `${(v % 3) * 50}% ${Math.floor(v / 3) * 50}%`;
    t.classList.toggle('sel', p === sel);
    if (v === p) ok++;
  });
  const pc = Math.round(ok / 9 * 100);
  $('pct').textContent = pc + '%'; $('fill').style.width = pc + '%';
  return pc;
}
function win() {
  if (won) return; won = true; sel = null; render();
  grid.classList.add('done');
  setTimeout(() => { $('s1').classList.add('out'); setTimeout(() => { $('s1').style.display = 'none'; startTree(); }, 900); }, 1500);
}
grid.onclick = e => {
  const t = e.target.closest('.t'); if (!t || won) return;
  const p = +t.dataset.p;
  if (sel === null) sel = p;
  else if (sel === p) sel = null;
  else {
    [order[sel], order[p]] = [order[p], order[sel]];
    [sel, p].forEach(i => { tiles[i].classList.remove('pop'); void tiles[i].offsetWidth; tiles[i].classList.add('pop'); });
    sel = null;
  }
  if (render() === 100) win();
};
$('ttl').ondblclick = () => { order = [0, 1, 2, 3, 4, 5, 6, 7, 8]; render(); win(); };
render();

/* ---------- Giai đoạn 2: cây tình yêu (canvas) ---------- */
const cv = $('tree'), ctx = cv.getContext('2d');
let W, H, dpr, T0, last, started = false, letterOn = false;
const segs = [], hearts = [], leaves = [];
const COLORS = ['#e63946', '#ff4f9a', '#d63fc9', '#ff9ec4', '#ffd84d', '#ff8a3d', '#ff6b8a'];
const clamp = x => Math.max(0, Math.min(1, x));
const eio = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const eob = p => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2);
function resize() { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; }
addEventListener('resize', resize); resize();
function lay(k) {
  const S0 = Math.min(H * .8 / 355, W * .8 / 300);
  if (!k) return { cx: W / 2, gy: H * .88, S: S0 };
  return W < 760 ? { cx: W / 2, gy: H * .985, S: Math.min(H * .38 / 355, W * .8 / 300) }
                 : { cx: W * .75, gy: H * .88, S: Math.min(H * .8 / 355, W * .46 / 300) };
}
function fv(u, v) { const a = u * u + v * v - 1; return a * a * a - u * u * v * v * v; }
function inH(x, y) { return fv(x / 118, (-y - 200) / 118) <= 0; }
function gen(x, y, ang, len, d, t0, w0) {
  let L = len, x2, y2;
  for (;;) { x2 = x + Math.sin(ang) * L; y2 = y - Math.cos(ang) * L; if (!d || inH(x2, y2)) break; L *= .8; if (L < 10) return; }
  const dur = 90 + L * 3.2;
  const w1 = Math.max(1.4, w0 * (d ? .72 : .55)); segs.push({ x, y, x2, y2, w0, w1, t0, dur });
  if (d < 6 && L === len) {
    const n = d ? 2 : 3, sg = Math.random() < .5 ? -1 : 1;
    for (let i = 0; i < n; i++) {
      const s = i ? sg * (i === 1 ? 1 : -1) : 0, lead = !i;
      gen(x2, y2, lead ? ang * .7 - sg * .12 + (Math.random() - .5) * .2 : ang + s * (.55 + Math.random() * .35), len * (lead ? (d ? .84 : .72) : .62), d + 1, t0 + dur * .8, w1 * (lead ? 1 : .8));
    }
  }
}
function heart(x, y, s, r, c) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, .9);
  ctx.bezierCurveTo(-1.7, -.1, -.9, -1.3, 0, -.45);
  ctx.bezierCurveTo(.9, -1.3, 1.7, -.1, 0, .9);
  ctx.fillStyle = c; ctx.fill(); ctx.restore();
}
let trunkC, groundC, bloomEnd, slideAt, nextLeaf = 0;
function startTree() {
  const cs = getComputedStyle(document.documentElement);
  trunkC = cs.getPropertyValue('--trunk').trim() || '#4a2c2a';
  groundC = cs.getPropertyValue('--ground').trim() || '#8a5a52';
  const G0 = 2000;
  gen(0, 0, .03, 100, 0, G0, 30);
  const gEnd = Math.max(...segs.map(s => s.t0 + s.dur));
  while (hearts.length < 780) {
    const x = Math.random() * 2.6 - 1.3, y = Math.random() * 2.7 - 1.3, a = x * x + y * y - 1;
    const f = a * a * a - x * x * y * y * y;
    if (f <= 0 && (hearts.length < 640 || f > -.12)) {
      const hx = x * 118, hy = -(200 + y * 118);
      hearts.push({ x: hx, y: hy, s: 6 + Math.random() * 7, r: (Math.random() - .5) * 1.1, c: COLORS[Math.floor(Math.random() * COLORS.length)], ph: Math.random() * 6, tb: gEnd + Math.random() * 900 + Math.hypot(hx, hy + 200) * 6 });
    }
  }
  bloomEnd = gEnd + 900 + 780 + 520;
  slideAt = bloomEnd + 1500;
  cv.classList.add('on');
  T0 = last = performance.now(); started = true;
  requestAnimationFrame(frame);
}
function frame(ts) {
  const t = ts - T0, dt = Math.min(.05, (ts - last) / 1000); last = ts;
  const k = eio(clamp((t - slideAt) / 1400)), a = lay(0), b = lay(1);
  const cx = a.cx + (b.cx - a.cx) * k, gy = a.gy + (b.gy - a.gy) * k, S = a.S + (b.S - a.S) * k;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  const g = eio(clamp(t / 600));
  ctx.strokeStyle = groundC; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(W / 2 - W * .47 * g, gy); ctx.lineTo(W / 2 + W * .47 * g, gy); ctx.stroke();
  ctx.setTransform(dpr * S, 0, 0, dpr * S, dpr * cx, dpr * gy);
  const sp = clamp((t - 300) / 1400), r = 9 * (1 - clamp((t - 1950) / 250));
  if (r > .1) {
    const y0 = -(a.gy - H * .45) / S, sy = y0 * (1 - sp * sp) - r * sp * sp;
    ctx.globalAlpha = clamp(t / 300); ctx.beginPath(); ctx.arc(0, sy, r * 1.9, 0, 7); ctx.fillStyle = 'rgba(230,57,70,.22)'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, sy, r, 0, 7); ctx.fillStyle = '#e63946'; ctx.fill();
    ctx.beginPath(); ctx.arc(-3, sy - 3, r * .3, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill(); ctx.globalAlpha = 1;
  }
  ctx.fillStyle = trunkC;
  for (const s of segs) {
    if (t < s.t0) continue;
    const p = eio(clamp((t - s.t0) / s.dur));
    const ex = s.x + (s.x2 - s.x) * p, ey = s.y + (s.y2 - s.y) * p, we = s.w0 + (s.w1 - s.w0) * p, dx = s.x2 - s.x, dy = s.y2 - s.y, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, h0 = s.w0 / 2, h1 = we / 2;
    ctx.beginPath(); ctx.moveTo(s.x - nx * h0, s.y - ny * h0); ctx.lineTo(s.x + nx * h0, s.y + ny * h0); ctx.lineTo(ex + nx * h1, ey + ny * h1); ctx.lineTo(ex - nx * h1, ey - ny * h1); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(ex, ey, h1, 0, 7); ctx.fill();
  }
  for (const h of hearts) {
    if (t < h.tb) continue;
    const p = clamp((t - h.tb) / 520);
    heart(h.x, h.y, h.s * eob(p) * (1 + .05 * Math.sin(t / 500 + h.ph) * p), h.r, h.c);
  }
  if (t > bloomEnd - 400 && t > nextLeaf && leaves.length < 14) {
    nextLeaf = t + 450 + Math.random() * 250;
    const h = hearts[Math.floor(Math.random() * hearts.length)];
    leaves.push({ x: h.x, y: h.y, x0: h.x, vy: 22 + Math.random() * 20, ph: Math.random() * 6, amp: 12 + Math.random() * 14, s: 6 + Math.random() * 4, r: Math.random() * 3, c: h.c, land: 0 });
  }
  for (let i = leaves.length - 1; i >= 0; i--) {
    const l = leaves[i];
    if (l.y < -3) { l.y += l.vy * dt; l.x = l.x0 + Math.sin(l.ph + t / 650) * l.amp; l.r += dt; }
    else { l.y = -3; l.land += dt; if (l.land > 1.6) { leaves.splice(i, 1); continue; } }
    ctx.globalAlpha = 1 - clamp(l.land / 1.6);
    heart(l.x, l.y, l.s, l.r, l.c);
  }
  ctx.globalAlpha = 1;
  if (!letterOn && t > slideAt + 1000) { letterOn = true; showLetter(); }
  requestAnimationFrame(frame);
}

/* ---------- Giai đoạn 3: thư đánh chữ + Polaroid ---------- */
const cur = Object.assign(document.createElement('span'), { className: 'cur' });
function type(el, txt, done) {
  const n = document.createTextNode(''), ch = [...txt]; let i = 0;
  el.append(n, cur);
  (function step() {
    if (i >= ch.length) return done();
    n.nodeValue += ch[i];
    $('body').scrollTop = $('body').scrollHeight;
    const c = ch[i++];
    setTimeout(step, '.!?'.includes(c) ? 260 : c === ',' ? 140 : 32);
  })();
}
function showLetter() {
  $('lt').textContent = CONFIG.letterTitle;
  $('letter').classList.add('show');
  setTimeout(() => type($('gr'), CONFIG.letterGreeting, () => setTimeout(() => type($('tx'), CONFIG.letterContent, () => $('see').classList.add('on')), 350)), 900);
}
let gi = 0, flipped = false, timer;
function nextPhoto() {
  const imgs = CONFIG.galleryImages;
  gi = (gi + 1) % imgs.length;
  (flipped ? $('fa') : $('fb')).style.backgroundImage = `url("${imgs[gi]}")`;
  flipped = !flipped;
  $('ph').style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0)';
}
function auto() { clearInterval(timer); timer = setInterval(nextPhoto, 3000); }
$('see').onclick = () => {
  $('see').classList.replace('on', 'gone');
  $('fa').style.backgroundImage = `url("${CONFIG.galleryImages[0]}")`;
  $('pol').classList.add('on');
  auto();
};
$('pol').onclick = () => { nextPhoto(); auto(); };
