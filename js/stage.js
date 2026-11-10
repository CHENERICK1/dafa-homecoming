/* 皮影舞台 (Shadow-Puppet Stage) — 背景分层 + 天气粒子 + 台灯光晕
   背景只做极缓的运镜（≤2%），主体表演交给 cutout 骨骼人偶。
*/
(function () {
  const DF = window.DF || (window.DF = {});
  const ST = (DF.stage = {});
  const { W, H } = DF;
  const D = DF.D;
  const TAU = Math.PI * 2;

  ST.img = function (key) {
    const d = DF.storyboard18Data || DF.storyboardData || {};
    if (!ST._cache) ST._cache = {};
    if (ST._cache[key]) return ST._cache[key];
    if (!d[key]) return null;
    const im = new Image();
    im.src = d[key];
    ST._cache[key] = im;
    return im;
  };
  ST.ready = function (im) { return !!im && im.complete && im.naturalWidth > 0; };

  /* 背景底图：轻微推拉 + 暗角 + 统一调色，让底图"退到幕后" */
  ST.backdrop = function (ctx, key, t, o) {
    const opt = o || {};
    const im = ST.img(key);
    ctx.save();
    ctx.fillStyle = opt.fallback || '#191510';
    ctx.fillRect(0, 0, W, H);
    if (ST.ready(im)) {
      const zoom = (opt.zoom0 || 1.02) + ((opt.zoom1 || 1.05) - (opt.zoom0 || 1.02)) * Math.min(1, t / (opt.dur || 12));
      const px = opt.panX || 0, py = opt.panY || 0;
      const ir = im.naturalWidth / im.naturalHeight, cr = W / H;
      let dw, dh;
      if (ir > cr) { dh = H; dw = H * ir; } else { dw = W; dh = W / ir; }
      ctx.globalAlpha = opt.alpha != null ? opt.alpha : 0.92;
      ctx.drawImage(im, W / 2 - dw * zoom / 2 + px, H / 2 - dh * zoom / 2 + py, dw * zoom, dh * zoom);
      ctx.globalAlpha = 1;
      // 压暗 & 统一色调，让底图变成"幕布"
      if (opt.dim) { ctx.fillStyle = 'rgba(12,9,6,' + opt.dim + ')'; ctx.fillRect(0, 0, W, H); }
      if (opt.tint) { ctx.fillStyle = opt.tint; ctx.fillRect(0, 0, W, H); }
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, opt.fallbackTop || '#221a12');
      g.addColorStop(1, opt.fallbackBottom || '#0e0a07');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  };

  /* 皮影台光：暖色顶光 + 幕布两侧的机械"提线人"暗影 */
  ST.spot = function (ctx, x, y, r, color, a) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(0.45, color.replace(/[\d.]+\)$/, '0.18)'));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a;
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  };

  /* 纸纹幕布 + 皮影戏幕框 */
  ST.proscenium = function (ctx, t, a) {
    const k = a == null ? 1 : a;
    ctx.save();
    ctx.globalAlpha = 0.20 * k;
    ctx.fillStyle = '#f3d9a4';
    ctx.fillRect(0, 0, W, 90);
    ctx.fillRect(0, H - 90, W, 90);
    ctx.globalAlpha = 0.5 * k;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, 26);
    ctx.fillRect(0, H - 26, W, 26);
    ctx.restore();
  };

  /* 雨：带风斜的细线 + 地面水洼涟漪 */
  ST.rain = function (ctx, t, n, alpha, slant) {
    const r = DF.rng(7);
    ctx.save();
    ctx.strokeStyle = 'rgba(198,214,240,' + alpha + ')';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const sp = 1500 + r() * 1100, len = 30 + r() * 44;
      const x0 = r() * (W + 500) - 250, ph = r();
      const y = ((ph * H * 1.25 + t * sp) % (H * 1.25)) - 120;
      const x = x0 + y * slant;
      ctx.moveTo(x, y); ctx.lineTo(x + len * slant, y + len);
    }
    ctx.stroke();
    ctx.restore();
  };

  ST.ripples = function (ctx, t, y0, y1, n) {
    const r = DF.rng(9);
    ctx.save();
    for (let i = 0; i < (n || 26); i++) {
      const x = r() * W, y = y0 + r() * (y1 - y0), ph = r();
      const k = (t * 0.9 + ph) % 1;
      ctx.strokeStyle = 'rgba(205,222,245,' + (0.42 * (1 - k)) + ')';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(x, y, 6 + k * 26, (6 + k * 26) * 0.28, 0, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  };

  /* 阳光浮尘 / 金色气味微尘 / 暖光 */
  ST.motes = function (ctx, t, n, color, seed, opt) {
    const o = opt || {};
    const r = DF.rng(seed || 12);
    ctx.save();
    ctx.globalCompositeOperation = o.glow ? 'lighter' : 'source-over';
    for (let i = 0; i < n; i++) {
      const x0 = r() * W, y0 = r() * H, sp = 0.4 + r(), ph = r() * TAU, sz = (o.size || 4) * (0.5 + r());
      let x = (x0 + t * (o.vx || 14) * sp + Math.sin(t * 0.7 + ph) * (o.sway || 26)) % (W + 60);
      let y = (y0 + t * (o.vy || -18) * sp) % (H + 60);
      if (x < -30) x += W + 60;
      if (y < -30) y += H + 60;
      if (y > H + 30) y -= H + 60;
      ctx.globalAlpha = (o.a || 0.7) * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + ph)));
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
    }
    ctx.restore();
  };

  /* 金色气味信标（通感光带），供第五幕 POV 使用 */
  ST.scentBeacon = function (ctx, t, x0, y0, x1, y1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = 'rgba(255,214,120,' + (0.30 - k * 0.08) + ')';
      ctx.lineWidth = 26 - k * 7;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      const mx = (x0 + x1) / 2 + Math.sin(t * 1.6 + k) * 70;
      const my = (y0 + y1) / 2;
      ctx.quadraticCurveTo(mx, my, x1, y1);
      ctx.stroke();
    }
    ctx.restore();
    ST.motes(ctx, t, 30, 'rgba(255,232,150,0.95)', 21, { vy: -40, vx: -30, size: 4.2, glow: true });
  };

  /* 车灯扫过的眩光 */
  ST.headlight = function (ctx, t, x, y, a) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, 700);
    g.addColorStop(0, 'rgba(255,252,235,' + (0.85 * a) + ')');
    g.addColorStop(0.25, 'rgba(255,240,190,' + (0.35 * a) + ')');
    g.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 1100, y - 520);
    ctx.lineTo(x + 1100, y + 560);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,240,' + (0.9 * a) + ')';
    ctx.beginPath(); ctx.ellipse(x, y, 46, 30, 0, 0, TAU); ctx.fill();
    ctx.restore();
  };

  /* 台前灰尘纸纹（复用 draw.js 的 grain） */
  ST.finish = function (ctx, t, o) {
    const opt = o || {};
    D.grain(ctx, t, opt.grain != null ? opt.grain : 0.05);
    D.vignette(ctx, opt.vig != null ? opt.vig : 0.5);
  };

})();
