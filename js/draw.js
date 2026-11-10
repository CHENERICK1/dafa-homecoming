/* 《大发回家》 shared drawing helpers (1920x1080 virtual canvas) */
(function () {
  const { W, H } = DF;
  const D = (DF.D = {});

  /* ---------- background ---------- */
  D.sky = function (ctx, stops) {             // stops: [[pos,color],...]
    const g = ctx.createLinearGradient(0, 0, 0, H);
    stops.forEach((s) => g.addColorStop(s[0], s[1]));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  };
  D.glow = function (ctx, x, y, r, color, a = 1) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.globalAlpha *= a; ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  };
  D.moon = function (ctx, x, y, r, a = 1) {
    D.glow(ctx, x, y, r * 6, 'rgba(190,210,255,0.25)', a);
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#f4f1e2';
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(200,195,175,0.35)';
    ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.22, 0, 7); ctx.arc(x + r * 0.35, y + r * 0.3, r * 0.15, 0, 7); ctx.fill();
    ctx.restore();
  };
  D.stars = function (ctx, n, seed, t, a = 1, maxY = H * 0.6) {
    const r = DF.rng(seed);
    ctx.save(); ctx.fillStyle = '#fff';
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = r() * maxY, s = r() * 1.8 + 0.4, ph = r() * 6;
      ctx.globalAlpha = a * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.5 + ph)));
      ctx.fillRect(x, y, s, s);
    }
    ctx.restore();
  };
  /* rolling hill band. y = baseline, amp, freq, color */
  D.hills = function (ctx, y, amp, freq, color, seed = 1, offset = 0) {
    const r = DF.rng(seed); const p1 = r() * 6, p2 = r() * 6;
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) {
      const u = (x + offset) / W;
      ctx.lineTo(x, y - amp * (0.6 * Math.sin(u * freq * 6.28 + p1) + 0.4 * Math.sin(u * freq * 2.3 * 6.28 + p2)));
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  };
  D.ground = function (ctx, y, c1, c2) {
    const g = ctx.createLinearGradient(0, y, 0, H);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
  };

  /* ---------- weather / particles ---------- */
  D.rain = function (ctx, t, n = 260, a = 0.35, slant = 0.25, seed = 7) {
    const r = DF.rng(seed);
    ctx.save(); ctx.strokeStyle = 'rgba(200,215,240,' + a + ')'; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const sp = 1400 + r() * 900, len = 24 + r() * 30, x0 = r() * (W + 400) - 200, ph = r();
      const y = ((ph * H * 1.3 + t * sp) % (H * 1.3)) - 100;
      const x = x0 + y * slant;
      ctx.moveTo(x, y); ctx.lineTo(x + len * slant, y + len);
    }
    ctx.stroke(); ctx.restore();
  };
  D.splashes = function (ctx, t, y0, y1, n = 40, seed = 9) {
    const r = DF.rng(seed);
    ctx.save(); ctx.strokeStyle = 'rgba(210,225,245,0.35)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = y0 + r() * (y1 - y0), ph = r(), k = ((t * 2 + ph) % 1);
      ctx.globalAlpha = 1 - k;
      ctx.beginPath(); ctx.ellipse(x, y, 4 + k * 14, (4 + k * 14) * 0.3, 0, 0, 7); ctx.stroke();
    }
    ctx.restore();
  };
  /* floating particles (petals, leaves, snow, dust, fireflies) */
  D.drift = function (ctx, t, n, seed, opt) {
    const r = DF.rng(seed);
    const o = Object.assign({ color: '#fff', size: 4, vy: 40, vx: 20, sway: 30, shape: 'dot', a: 0.8, glow: false }, opt);
    ctx.save();
    for (let i = 0; i < n; i++) {
      const x0 = r() * W, y0 = r() * H, sp = 0.5 + r(), ph = r() * 6, sz = o.size * (0.5 + r());
      let x = (x0 + t * o.vx * sp + Math.sin(t * 0.8 + ph) * o.sway) % (W + 40);
      let y = (y0 + t * o.vy * sp) % (H + 40);
      if (x < -20) x += W + 40; if (y < -20) y += H + 40;
      ctx.globalAlpha = o.a * (o.glow ? 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + ph)) : 1);
      ctx.fillStyle = Array.isArray(o.color) ? o.color[i % o.color.length] : o.color;
      if (o.glow) D.glow(ctx, x, y, sz * 5, o.color, ctx.globalAlpha);
      ctx.save(); ctx.translate(x - 20, y - 20); ctx.rotate(t * sp + ph);
      if (o.shape === 'petal') { ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.4, sz * 0.7, 0, 0, 7); ctx.fill(); }
      else if (o.shape === 'leaf') { ctx.beginPath(); ctx.moveTo(-sz * 1.5, 0); ctx.quadraticCurveTo(0, -sz, sz * 1.5, 0); ctx.quadraticCurveTo(0, sz, -sz * 1.5, 0); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(0, 0, sz, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
  };

  /* ---------- post effects ---------- */
  let grainCanvas = null;
  function makeGrain() {
    grainCanvas = document.createElement('canvas'); grainCanvas.width = grainCanvas.height = 256;
    const g = grainCanvas.getContext('2d'); const id = g.createImageData(256, 256); const r = DF.rng(42);
    for (let i = 0; i < id.data.length; i += 4) { const v = 110 + r() * 145; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0);
  }
  D.grain = function (ctx, t, a = 0.07) {
    if (!grainCanvas) makeGrain();
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay';
    const ox = Math.floor((t * 60) % 4) * 61, oy = Math.floor((t * 60) % 3) * 83;
    ctx.translate(-ox, -oy);
    ctx.fillStyle = ctx.createPattern(grainCanvas, 'repeat'); ctx.fillRect(0, 0, W + 300, H + 300);
    ctx.restore();
  };
  D.vignette = function (ctx, a = 0.55, color = '0,0,0') {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, 'rgba(' + color + ',0)'); g.addColorStop(1, 'rgba(' + color + ',' + a + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  };
  D.tint = function (ctx, color, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); };
  D.letterbox = function (ctx, k) { if (k <= 0) return; ctx.fillStyle = '#000'; const h = 110 * k; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); };
  D.post = function (ctx, t, o = {}) { D.grain(ctx, t, o.grain != null ? o.grain : 0.07); D.vignette(ctx, o.vig != null ? o.vig : 0.55); };

  /* ---------- camera ---------- */
  D.cam = function (ctx, x, y, z, rot = 0) {   // zoom z around point (x,y) brought to screen center
    ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.rotate(rot); ctx.translate(-x, -y);
  };

  /* ---------- props ---------- */
  D.tree = function (ctx, x, y, s, color = '#2d3a2a', trunk = '#3a2c22', seed = 3, t = 0) {
    const r = DF.rng(seed);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = trunk; ctx.fillRect(-6, -90, 12, 90);
    ctx.fillStyle = color; ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * 6.28, rr = 38 + r() * 18, sw = Math.sin(t * 0.8 + i) * 2;
      ctx.moveTo(Math.cos(a) * 34 + sw + rr, -130 + Math.sin(a) * 30);
      ctx.arc(Math.cos(a) * 34 + sw, -130 + Math.sin(a) * 30, rr, 0, 7);
    }
    ctx.arc(0, -130, 50, 0, 7); ctx.fill();
    ctx.restore();
  };
  D.bareTree = function (ctx, x, y, s, color, seed = 5) {
    const r = DF.rng(seed);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = color; ctx.lineCap = 'round';
    (function br(len, w, depth) {
      ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len); ctx.stroke();
      if (depth <= 0) return;
      ctx.save(); ctx.translate(0, -len);
      const n = 2 + (r() > 0.6 ? 1 : 0);
      for (let i = 0; i < n; i++) { ctx.save(); ctx.rotate((r() - 0.5) * 1.3); br(len * (0.6 + r() * 0.2), w * 0.65, depth - 1); ctx.restore(); }
      ctx.restore();
    })(70, 10, 5);
    ctx.restore();
  };
  D.pole = function (ctx, x, y, h, color = '#2b2620') {
    ctx.fillStyle = color; ctx.fillRect(x - 5, y - h, 10, h);
    ctx.fillRect(x - 40, y - h + 20, 80, 6);
  };
  D.wires = function (ctx, x1, x2, y, sag, color = 'rgba(20,18,15,0.7)') {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.moveTo(x1, y + k * 14); ctx.quadraticCurveTo((x1 + x2) / 2, y + sag + k * 14, x2, y + k * 14); ctx.stroke(); }
  };
  /* cloth strip tied to a branch/pole; flutters with wind */
  D.ribbon = function (ctx, x, y, t, len = 70, color = '#d9473d', wind = 1, glowA = 0) {
    if (glowA > 0) D.glow(ctx, x + len * 0.4, y + 10, 80, 'rgba(255,170,120,0.7)', glowA);
    ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill();
    const seg = 10, pts = [];
    for (let i = 0; i <= seg; i++) {
      const u = i / seg;
      pts.push([x + u * len * wind * 0.9 + Math.sin(t * 5 - u * 4) * 3 * u, y + u * len * (1 - wind * 0.7) + Math.sin(t * 6.3 - u * 5) * 9 * u * wind]);
    }
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] - 6 * (1 - i / seg * 0.4)) : ctx.moveTo(p[0], p[1] - 6)));
    for (let i = seg; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + 6 * (1 - i / seg * 0.4));
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  };
  /* "寻狗启事" poster */
  D.poster = function (ctx, x, y, s, rot = 0, a = 1, wet = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-58, -76, 120, 160);
    ctx.fillStyle = DF.mix('#fbf6e8', '#d8d2c0', wet); ctx.fillRect(-62, -80, 120, 160);
    ctx.fillStyle = '#c62f2f'; ctx.font = 'bold 22px "Microsoft YaHei",sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('寻狗启事', -2, -52);
    ctx.fillStyle = '#e9e1cc'; ctx.fillRect(-42, -40, 80, 58);
    DF.dog && DF.dog.icon(ctx, -2, 6, 0.42);
    ctx.fillStyle = '#c62f2f'; ctx.font = 'bold 17px "Microsoft YaHei",sans-serif'; ctx.fillText('悬赏 2000 元', -2, 44);
    ctx.fillStyle = '#555'; ctx.font = '11px "Microsoft YaHei",sans-serif'; ctx.fillText('白色西高地 · 名叫大发', -2, 62);
    ctx.fillText('联系电话 138****', -2, 75);
    ctx.fillStyle = 'rgba(200,190,170,0.9)'; ctx.fillRect(-20, -86, 40, 12); // tape
    ctx.restore();
  };
  D.redWall = function (ctx, x, y, w, h, seed = 11, light = 1) {
    ctx.save(); ctx.fillStyle = DF.mix('#5a2a20', '#9c4a36', light); ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(40,20,14,0.5)'; ctx.lineWidth = 2;
    for (let yy = y; yy < y + h; yy += 22) {
      ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke();
      const off = ((yy - y) / 22) % 2 ? 0 : 30;
      for (let xx = x + off; xx < x + w; xx += 60) { ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 22); ctx.stroke(); }
    }
    const r = DF.rng(seed); ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 40; i++) ctx.fillRect(x + r() * w, y + r() * h, 30 + r() * 40, 8);
    ctx.restore();
  };
  D.reeds = function (ctx, y, t, n = 120, color = '#8a7a52', seed = 13, h = 220, x0 = 0, x1 = W) {
    const r = DF.rng(seed);
    ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), hh = h * (0.6 + r() * 0.6), sw = Math.sin(t * 1.2 + x * 0.01) * 18 + (r() - 0.5) * 20;
      ctx.lineWidth = 2 + r() * 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw * 0.3, y - hh * 0.5, x + sw, y - hh); ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x + sw, y - hh - 12, 5, 18, sw * 0.02, 0, 7); ctx.fill();
    }
    ctx.restore();
  };
  D.grass = function (ctx, y, t, n = 200, color = '#2c3a24', seed = 17, h = 30) {
    const r = DF.rng(seed);
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = r() * W, hh = h * (0.5 + r()), sw = Math.sin(t * 2 + x * 0.02) * 4;
      ctx.moveTo(x, y + r() * 10); ctx.quadraticCurveTo(x + sw * 0.5, y - hh * 0.5, x + sw + (r() - 0.5) * 8, y - hh);
    }
    ctx.stroke(); ctx.restore();
  };
  /* simple building / window grid silhouette */
  D.building = function (ctx, x, y, w, h, color, winColor, seed = 1, litRatio = 0.4, t = 0) {
    ctx.fillStyle = color; ctx.fillRect(x, y - h, w, h);
    if (!winColor) return;
    const r = DF.rng(seed);
    for (let yy = y - h + 18; yy < y - 20; yy += 34) for (let xx = x + 12; xx < x + w - 18; xx += 28) {
      if (r() < litRatio) { ctx.fillStyle = winColor; ctx.globalAlpha = 0.6 + 0.4 * r(); ctx.fillRect(xx, yy, 14, 18); ctx.globalAlpha = 1; }
    }
  };
  D.streetLamp = function (ctx, x, y, h, on = 1, color = 'rgba(255,200,120,0.9)') {
    ctx.fillStyle = '#1d1a17'; ctx.fillRect(x - 4, y - h, 8, h);
    ctx.fillRect(x - 4, y - h, 40, 6);
    ctx.fillStyle = on ? '#ffe2a8' : '#555'; ctx.fillRect(x + 26, y - h + 6, 18, 8);
    if (on) {
      D.glow(ctx, x + 35, y - h + 12, 160, color, on);
      ctx.save(); ctx.globalAlpha = 0.12 * on; ctx.fillStyle = '#ffd890';
      ctx.beginPath(); ctx.moveTo(x + 28, y - h + 14); ctx.lineTo(x + 42, y - h + 14); ctx.lineTo(x + 140, y); ctx.lineTo(x - 70, y); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  };
  /* rounded rect */
  D.rr = function (ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  };
  /* phone frame; content drawn by callback in local coords (0..w,0..h) */
  D.phone = function (ctx, x, y, w, h, rot, contentFn) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#16171a'; D.rr(ctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 46); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save(); D.rr(ctx, -w / 2, -h / 2, w, h, 34); ctx.clip(); ctx.translate(-w / 2, -h / 2);
    contentFn && contentFn(ctx, w, h);
    ctx.restore();
    ctx.fillStyle = '#16171a'; D.rr(ctx, -50, -h / 2 + 10, 100, 26, 13); ctx.fill();
    ctx.restore();
  };
  /* text drawn on canvas (titles / cards) */
  D.text = function (ctx, str, x, y, size, color = '#fff', a = 1, o = {}) {
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = color; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
    ctx.font = (o.weight || '300') + ' ' + size + 'px "PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif';
    if (o.spacing) { try { ctx.letterSpacing = o.spacing + 'px'; } catch (e) {} }
    if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = o.shadow; }
    ctx.fillText(str, x, y); ctx.restore();
  };
  /* dashed route line between points with progress k (0..1) */
  D.route = function (ctx, pts, k, color = '#ffcf8a', w = 5, dash = [14, 12]) {
    let total = 0; const seglen = [];
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seglen.push(l); total += l; }
    let rem = total * k;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    let end = pts[0];
    for (let i = 1; i < pts.length && rem > 0; i++) {
      const l = seglen[i - 1], u = Math.min(1, rem / l);
      end = [DF.lerp(pts[i - 1][0], pts[i][0], u), DF.lerp(pts[i - 1][1], pts[i][1], u)];
      ctx.lineTo(end[0], end[1]); rem -= l;
    }
    ctx.stroke(); ctx.restore();
    return end;
  };
  D.pointOn = function (pts, k) {            // position along polyline
    let total = 0; const L = [];
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); total += l; }
    let rem = total * DF.clamp(k);
    for (let i = 1; i < pts.length; i++) {
      if (rem <= L[i - 1]) { const u = rem / L[i - 1]; return [DF.lerp(pts[i - 1][0], pts[i][0], u), DF.lerp(pts[i - 1][1], pts[i][1], u), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; }
      rem -= L[i - 1];
    }
    const n = pts.length - 1; return [pts[n][0], pts[n][1], 0];
  };
})();
