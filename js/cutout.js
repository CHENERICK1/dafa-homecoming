/* 《大发回家》 皮影切片骨骼人偶库 (Shadow-Puppet Cutout Rig) — v3 重构版
   ============================================================================
   设计原则（彻底重构，杜绝"散图拼接成怪物"）：

   1. 单一清晰的骨树（Parent-Child Transform Tree），每一块骨骼都在局部坐标系中定义：
        Root(hip / 舞台落点，地面原点)
         ├─ Torso(躯干)                       ← 呼吸起伏 / 前后俯仰
         │    ├─ Neck → Head(菊花形蓬松大头)   ← 仰头 / 低头
         │    │     ├─ EarNear / EarFar        ← 独立竖耳微颤
         │    │     ├─ Pupil                    ← 眼珠灵动上瞅
         │    │     └─ Leaf(金黄银杏叶)         ← 独立漂浮平衡
         │    ├─ FrontLeg.upper → .fore → .paw ← 近侧前腿(肩→肘→爪) 两段+爪
         │    ├─ FrontFarLeg(同上)             ← 远侧前腿(压暗)
         │    ├─ BackLeg.upper → .fore → .paw  ← 近侧后腿(髋→膝→爪)
         │    └─ BackFarLeg(同上)              ← 远侧后腿(压暗)
         └─ Tail0 → Tail1 → Tail2              ← 胡萝卜竖尾三节

   2. 每条腿是"大腿(upper)+小腿(fore)+爪(paw)"的三段链，枢轴精确对齐关节：
        肩/髋关节 → 肘/膝关节 → 爪
      每个关节的枢轴都在真实解剖位置（肘、膝的旋转中心），
      因此角度旋转时肢体不会"脱臼 / 反向 / 错位"。

   3. 比例依据真实西高地白梗（West Highland White Terrier）：
       - 紧凑矩形躯干，深而窄的胸，短而笔直的前腿（并非"长腿"，但匀称直立）
       - 菊花形蓬松圆头，吻部略短，黑鼻黑眼
       - 竖立小三角耳，胡萝卜形竖立的粗尾
       - 明黄色珊瑚绒小熊背心 + 红黑 H 胸背带（故事专属标志）

   4. 皮影双投软阴影：先压暗绘制一次剪影偏移，再画正片，形成剪纸/皮影真实质感。

   与旧版的区别：
   - 彻底移除"散图按绝对坐标拼接"的 drawSlice 残留路径；
   - 腿部改为三段自然锥形（非圆盘/甲片），带绒毛描边与爪垫；
   - 骨树加入爪(paw)段，关节枢轴精确；躯干/头/耳比例重新校准。
   ============================================================================
*/
(function () {
  const DF = window.DF || (window.DF = {});
  const CP = (DF.cutout = {});
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  /* ============================================================
     1. 切片精灵（Cutout Sprite）— 每块"骨骼"先抠成离屏 canvas 精灵
     ============================================================ */
  let uid = 0;
  function makeSprite(key, w, h, pivot, paint) {
    const pad = 16;                       // 容纳投影 / 绒毛尖的边距
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(w + pad * 2);
    cv.height = Math.ceil(h + pad * 2);
    const c = cv.getContext('2d');
    c.translate(pad, pad);
    paint(c);
    return { key: key || ('spr' + (++uid)), cv, pad, w, h, px: pivot[0], py: pivot[1] };
  }
  CP.makeSprite = makeSprite;

  // 远侧部件：整体压暗去饱和（皮影的近远景层次）
  const DEF_FAR = { gray: 0.32 };
  function shaded(spr, opt) {
    if (spr._shaded) return spr._shaded;
    const o = Object.assign({}, DEF_FAR, opt);
    const cv = document.createElement('canvas');
    cv.width = spr.cv.width; cv.height = spr.cv.height;
    const c = cv.getContext('2d');
    c.drawImage(spr.cv, 0, 0);
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = 'rgba(80,64,46,' + o.gray + ')';
    c.fillRect(0, 0, cv.width, cv.height);
    const out = Object.assign({}, spr, { cv, key: spr.key + '_far' });
    spr._shaded = out;
    return out;
  }
  CP.shaded = shaded;

  /* ---------- 画笔：菊花毛簇 / 银杏叶 / 绒毛腿 ---------- */
  function fluff(c, x, y, r, n, phase, fill, rim) {
    c.save(); c.translate(x, y);
    c.beginPath();
    const N = n * 5;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * TAU + phase;
      const spike = i % 5 === 0 ? 1.32 : 1.06;
      const wob = 0.04 * Math.sin(i * 2.3 + phase * 3);
      const rr = r * (spike + wob);
      const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
    c.fillStyle = fill; c.fill();
    if (rim) { c.strokeStyle = rim; c.lineWidth = 2.0; c.stroke(); }
    c.restore();
  }

  function ginkgo(c, x, y, s, angle) {
    c.save(); c.translate(x, y); c.rotate(angle); c.scale(s, s);
    c.strokeStyle = '#9d6f12'; c.lineWidth = 3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(5, 16, 2, 26); c.stroke();
    c.translate(2, 26);
    const g = c.createLinearGradient(0, 0, 0, -46);
    g.addColorStop(0, '#e9a81b'); g.addColorStop(0.55, '#f6c92e'); g.addColorStop(1, '#ffe06a');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-16, -6, -30, -30, -22, -44);
    c.bezierCurveTo(-12, -52, -4, -44, 0, -34);
    c.bezierCurveTo(4, -44, 12, -52, 22, -44);
    c.bezierCurveTo(30, -30, 16, -6, 0, 0);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(150,100,10,0.45)'; c.lineWidth = 1.6; c.stroke();
    c.strokeStyle = 'rgba(255,248,205,0.75)'; c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(0, -2); c.lineTo(-13, -40);
    c.moveTo(0, -2); c.lineTo(-4, -40);
    c.moveTo(0, -2); c.lineTo(4, -40);
    c.moveTo(0, -2); c.lineTo(13, -40);
    c.stroke();
    c.restore();
  }
  CP.drawGinkgo = ginkgo;

  /* ============================================================
     2. 大发（Dafa）皮影切片构建
     坐标：以髋部落点为原点 (0,0)，向上为 -y，朝右为 +x。
     ============================================================ */
  const COAT = '#fbf8f1';            // 白奶油色蓬毛
  const COAT_SH = '#e4dac6';         // 压暗/阴影毛
  const COAT_LINE = 'rgba(130,108,80,0.50)';

  /* ---------- 腿：一段自然锥形骨（大腿/小腿），带绒毛 + 爪 ---------- */
  // 参数：isFront 前后腿（前腿更笔直，后腿大腿更粗壮有飞节）
  function paintLimb(c, w, h, isFront, isPaw) {
    // 局部坐标：pivot 在 (cx, top)，骨骼向下延伸
    const cx = w / 2;
    // 锥形主体（上宽下窄，自然毛茸茸的腿）
    const topW = isFront ? w * 0.44 : w * 0.46;
    const botW = isPaw ? w * 0.42 : w * 0.30;
    c.fillStyle = COAT;
    c.beginPath();
    c.moveTo(cx - topW, 3);
    c.bezierCurveTo(cx - topW - 1, h * 0.5, cx - botW, h * 0.8, cx - botW + 1, h - 2);
    c.quadraticCurveTo(cx, h + 2, cx + botW - 1, h - 2);
    c.bezierCurveTo(cx + botW, h * 0.8, cx + topW + 1, h * 0.5, cx + topW, 3);
    c.closePath();
    c.fill();
    c.strokeStyle = COAT_LINE; c.lineWidth = 1.6; c.stroke();
    // 向阳面高光（近侧腿的立体感）
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(cx - topW * 0.5, 8);
    c.quadraticCurveTo(cx - botW * 0.6, h * 0.55, cx - botW * 0.4, h - 6);
    c.stroke();
  }

  function buildDafaParts() {
    const P = {};

    /* --- 腿尺寸（西高地短而匀称的腿） --- */
    const UPPER = { front: { w: 24, h: 34 }, back: { w: 28, h: 40 } };
    const FORE  = { front: { w: 18, h: 30 }, back: { w: 20, h: 34 } };
    const PAW   = { front: { w: 16, h: 14 }, back: { w: 16, h: 15 } };

    /* ----- 前腿：大腿(肩) → 小腿(肘) → 爪 ----- */
    function legParts(prefix, isFront, isNear) {
      const u = UPPER[isFront ? 'front' : 'back'];
      const f = FORE[isFront ? 'front' : 'back'];
      const p = PAW[isFront ? 'front' : 'back'];
      const col = isNear ? COAT : COAT_SH;
      // 软绒毛腿：锥形、无硬轮廓描边，关节处自然过渡（避免"机甲甲片"感）
      function fuzzyLimb(c, w, h, topW, botW, eli) {
        const cx = w / 2;
        // 主体（软渐变）
        let g = c.createLinearGradient(cx, 0, cx, h);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.55, col);
        g.addColorStop(1, eli ? COAT_SH : col);
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(cx - topW, 2);
        c.bezierCurveTo(cx - topW - 1.5, h * 0.45, cx - botW, h * 0.82, cx - botW + 1, h - 3);
        c.quadraticCurveTo(cx, h + 3, cx + botW - 1, h - 3);
        c.bezierCurveTo(cx + botW, h * 0.82, cx + topW + 1.5, h * 0.45, cx + topW, 2);
        c.closePath();
        c.fill();
        // 绒毛尖：沿两侧画小锯齿，弱化硬边
        c.fillStyle = 'rgba(255,255,255,0.35)';
        c.beginPath();
        for (let i = 1; i < 7; i++) {
          const yy = (i / 7) * h * 0.85 + 2;
          const ww = topW - (topW - botW) * (i / 7);
          c.moveTo(cx - ww, yy);
          c.lineTo(cx - ww - 2.4, yy + h * 0.14);
          c.lineTo(cx - ww + 1.6, yy + h * 0.07);
          c.moveTo(cx + ww, yy);
          c.lineTo(cx + ww + 2.4, yy + h * 0.14);
          c.lineTo(cx + ww - 1.6, yy + h * 0.07);
        }
        c.fill();
        // 极淡主体描边（仅体现蓬毛轮廓，不用深硬线）
        c.strokeStyle = 'rgba(130,108,80,0.22)';
        c.lineWidth = 1.1;
        c.stroke();
      }
      const upper = makeSprite(prefix + '.upper', u.w, u.h, [u.w / 2, 3], (c) => {
        const cx = u.w / 2;
        const topW = u.w * 0.44 + (isFront ? 0 : 2);   // 后腿大腿略粗
        fuzzyLimb(c, u.w, u.h, topW, u.w * 0.30, false);
        // 近侧腿的高光（柔和）
        if (isNear) {
          c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.2;
          c.beginPath(); c.moveTo(cx - u.w * 0.22, 9);
          c.quadraticCurveTo(cx - u.w * 0.26, u.h * 0.55, cx - u.w * 0.16, u.h - 8);
          c.stroke();
        }
      });
      const fore = makeSprite(prefix + '.fore', f.w, f.h, [f.w / 2, 3], (c) => {
        fuzzyLimb(c, f.w, f.h, f.w * 0.40, f.w * 0.28, false);
      });
      const paw = makeSprite(prefix + '.paw', p.w, p.h, [p.w / 2, 3], (c) => {
        const cx = p.w / 2;
        // 软圆爪（蓬毛包裹，非甲片）
        let g = c.createLinearGradient(cx, 0, cx, p.h);
        g.addColorStop(0, '#ffffff'); g.addColorStop(1, COAT_SH);
        c.fillStyle = g;
        c.beginPath(); c.ellipse(cx, p.h * 0.5, p.w * 0.42, p.h * 0.42, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.4)';
        c.beginPath(); c.ellipse(cx - 1, p.h * 0.4, p.w * 0.22, p.h * 0.20, 0, 0, TAU); c.fill();
        if (isNear) {
          c.strokeStyle = 'rgba(130,108,80,0.28)'; c.lineWidth = 1;
          c.beginPath();
          c.moveTo(cx - 3, p.h * 0.42); c.lineTo(cx - 3, p.h * 0.62);
          c.moveTo(cx + 3, p.h * 0.42); c.lineTo(cx + 3, p.h * 0.62);
          c.stroke();
        }
      });
      return { upper, fore, paw };
    }

    // 远侧腿（压暗）
    const getLeg = (prefix, isFront, isNear) => {
      const built = legParts(prefix, isFront, isNear);
      if (isNear) return built;
      return {
        upper: shaded(built.upper), fore: shaded(built.fore), paw: shaded(built.paw)
      };
    };

    P.flNear = getLeg('dafa.flN', true, true);    // 近侧前腿
    P.flFar  = getLeg('dafa.flF', true, false);   // 远侧前腿
    P.blNear = getLeg('dafa.blN', false, true);   // 近侧后腿
    P.blFar  = getLeg('dafa.blF', false, false);  // 远侧后腿

    /* --- 躯干：白毛肉体 + 明黄小熊背心 + 红黑 H 胸背带 --- */
    const TW = 80, TH = 64;
    P.torso = makeSprite('dafa.torso', TW, TH, [30, TH - 8], (c) => {
      // 白毛躯体（西高地紧凑矩形身躯）
      c.fillStyle = COAT;
      c.beginPath();
      c.moveTo(8, 30);
      c.bezierCurveTo(6, 12, 20, 4, 40, 6);
      c.bezierCurveTo(62, 8, 72, 18, 71, 34);
      c.bezierCurveTo(70, 50, 52, 58, 32, 57);
      c.bezierCurveTo(14, 56, 8, 44, 8, 30);
      c.closePath(); c.fill();
      c.strokeStyle = COAT_LINE; c.lineWidth = 2.2; c.stroke();

      // 蓬毛边缘锯齿（菊花毛质感）
      c.save();
      c.beginPath();
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * TAU;
        const rr = 1 + (i % 2 ? 0.04 : 0);
        const px = 38 + Math.cos(a) * 33 * rr, py = 32 + Math.sin(a) * 26 * rr;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.closePath(); c.clip();
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.beginPath(); c.ellipse(42, 18, 26, 11, -0.18, 0, TAU); c.fill();
      c.restore();

      // —— 明黄色珊瑚绒小熊背心 ——
      const vg = c.createLinearGradient(0, 8, 0, 58);
      vg.addColorStop(0, '#ffd75e'); vg.addColorStop(0.55, '#f5c542'); vg.addColorStop(1, '#e0a825');
      c.fillStyle = vg;
      c.beginPath();
      c.moveTo(6, 26);
      c.bezierCurveTo(8, 8, 24, 4, 38, 6);
      c.bezierCurveTo(56, 8, 64, 16, 63, 30);
      c.bezierCurveTo(60, 46, 46, 52, 32, 51);
      c.bezierCurveTo(16, 50, 4, 40, 6, 26);
      c.closePath(); c.fill();
      // 领口罗纹
      c.strokeStyle = '#d99a18'; c.lineWidth = 2.6;
      c.beginPath(); c.arc(46, 14, 13, -Math.PI * 0.75, Math.PI * 0.35); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(10, 30); c.quadraticCurveTo(32, 44, 59, 33); c.stroke();

      // 棕色小熊刺绣（胸口，一只，清晰）
      c.save(); c.translate(30, 28);
      c.fillStyle = '#8d5b32';
      c.beginPath();
      c.arc(-7, -7, 3.6, 0, TAU); c.arc(7, -7, 3.6, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(0, 0, 10, 8.6, 0, 0, TAU); c.fill();
      c.fillStyle = '#d7b596';
      c.beginPath(); c.ellipse(0, 2.2, 5.2, 3.6, 0, 0, TAU); c.fill();
      c.fillStyle = '#221812';
      c.beginPath(); c.arc(0, 1, 1.6, 0, TAU); c.fill();
      c.beginPath(); c.arc(-3.8, -2.2, 1.2, 0, TAU); c.arc(3.8, -2.2, 1.2, 0, TAU); c.fill();
      c.restore();

      // —— 红黑 H 型胸背带（主动、清晰的两根织带 + D 环） ——
      c.fillStyle = '#b8352a';
      c.fillRect(52, 8, 6, 38);
      c.fillRect(14, 12, 5.5, 34);
      c.fillStyle = '#1e2124';
      c.fillRect(57.5, 10, 2, 34);
      c.fillRect(19, 14, 1.6, 30);
      c.strokeStyle = '#c8ccd0'; c.lineWidth = 2.6;
      c.beginPath(); c.arc(55, 12, 4.6, 0, TAU); c.stroke();
    });

    /* --- 颈 --- */
    P.neck = makeSprite('dafa.neck', 28, 30, [13, 26], (c) => {
      c.fillStyle = COAT;
      c.beginPath(); c.ellipse(14, 15, 12, 15, 0.12, 0, TAU); c.fill();
      c.strokeStyle = COAT_LINE; c.lineWidth = 1.8; c.stroke();
    });

    /* --- 头（菊花形蓬松圆脸 + 黑鼻黑眼 + 胡子） --- */
    const HW = 64, HH = 60;
    P.head = makeSprite('dafa.head', HW, HH, [18, HH - 12], (c) => {
      c.save(); c.translate(31, 29);
      fluff(c, 0, 0, 25, 12, 0.3, COAT, COAT_LINE);
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.beginPath(); c.ellipse(-2, -9, 14, 9, -0.3, 0, TAU); c.fill();
      c.restore();
      // 吻部胡子（菊花形）
      c.save(); fluff(c, 48, 35, 13, 9, 1.1, COAT, COAT_LINE); c.restore();
      // 口鼻线
      c.strokeStyle = 'rgba(120,100,74,0.4)'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(39, 31); c.quadraticCurveTo(51, 28, 59, 29); c.stroke();
      // 大黑鼻
      c.fillStyle = '#1c1b18';
      c.beginPath(); c.ellipse(54, 25, 6, 4.6, -0.12, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.beginPath(); c.arc(52.5, 23.5, 1.6, 0, TAU); c.fill();
      // 眼
      c.fillStyle = '#17120e';
      c.beginPath(); c.arc(37, 21, 5.0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.92)';
      c.beginPath(); c.arc(38.6, 19.4, 1.5, 0, TAU); c.fill();
      // 眉间小毛簇
      c.fillStyle = COAT;
      c.beginPath(); c.ellipse(31, 5, 8, 5, -0.4, 0, TAU); c.fill();
    });
    // 眼珠高光（用于"眼珠上瞅"）
    P.pupil = makeSprite('dafa.pupil', 12, 12, [6, 6], (c) => {
      c.fillStyle = 'rgba(255,255,255,0.95)';
      c.beginPath(); c.arc(1.6, 1.6, 1.7, 0, TAU); c.fill();
    });

    /* --- 竖立小三角耳 x2 --- */
    function paintEar(c) {
      c.fillStyle = COAT;
      c.beginPath();
      c.moveTo(3, 24);
      c.quadraticCurveTo(5, 6, 11, 1);
      c.quadraticCurveTo(17, 8, 18, 24);
      c.closePath(); c.fill();
      c.strokeStyle = COAT_LINE; c.lineWidth = 1.8; c.stroke();
      c.fillStyle = 'rgba(232,166,156,0.55)';
      c.beginPath();
      c.moveTo(7, 21); c.quadraticCurveTo(8, 10, 11.5, 6); c.quadraticCurveTo(14, 11, 14.6, 21);
      c.closePath(); c.fill();
    }
    P.ear = makeSprite('dafa.ear', 20, 26, [6, 22], paintEar);

    /* --- 胡萝卜形竖尾（三节） --- */
    P.tail0 = makeSprite('dafa.tail0', 26, 24, [3, 12], (c) => {
      c.fillStyle = COAT;
      c.beginPath(); c.ellipse(11, 12, 12, 9, 0, 0, TAU); c.fill();
      c.strokeStyle = COAT_LINE; c.lineWidth = 1.8; c.stroke();
    });
    P.tail1 = makeSprite('dafa.tail1', 22, 18, [2, 9], (c) => {
      c.fillStyle = COAT;
      c.beginPath(); c.ellipse(9, 9, 9, 7, 0, 0, TAU); c.fill();
      c.strokeStyle = COAT_LINE; c.lineWidth = 1.6; c.stroke();
    });
    P.tail2 = makeSprite('dafa.tail2', 20, 16, [2, 8], (c) => {
      c.fillStyle = COAT;
      c.beginPath(); c.ellipse(8, 8, 8, 6.4, 0, 0, TAU); c.fill();
      c.strokeStyle = COAT_LINE; c.lineWidth = 1.6; c.stroke();
    });

    /* --- 头顶金黄银杏叶 --- */
    P.leaf = makeSprite('dafa.leaf', 66, 80, [33, 74], (c) => {
      c.save();
      c.shadowColor = 'rgba(255,200,60,0.55)'; c.shadowBlur = 10;
      ginkgo(c, 33, 72, 1.0, 0);
      c.restore();
    });

    return P;
  }
  CP.buildDafaParts = buildDafaParts;

  /* ============================================================
     3. 姿态状态机 (Pose Solver)
     腿部角度约定：0 = 竖直向下；正值 = 向前(朝头方向)摆动。
     前后腿关节：大腿(髋/肩) + 小腿(膝/肘) + 爪。
     ============================================================ */
  function basePose() {
    return {
      torsoY: 0, torsoPitch: 0,
      neck: -0.06, head: 0.02, eyeU: 0,
      earN: -0.03, earF: -0.10,
      // 前腿：大腿(肩) -> 小腿(肘) -> 爪
      flNu: 0.05, flNf: -0.02, flNp: 0,
      flFu: -0.05, flFf: 0.04, flFp: 0,
      // 后腿：大腿(髋) -> 小腿(膝) -> 爪
      blNu: -0.05, blNf: 0.04, blNp: 0,
      blFu: 0.04, blFf: -0.05, blFp: 0,
      tail: [0.18, 0.10, 0.06],
      leaf: { a: 0, x: 0, y: 0 },
      hasLeaf: false,
      tailBlur: false,
      shiver: 0
    };
  }

  function poseFreeze(t, o) {
    const br = Math.sin(t * 1.7);
    return Object.assign(basePose(), {
      torsoY: br * 1.6, torsoPitch: 0.008 + br * 0.004,
      neck: -0.06, head: 0.02 + Math.sin(t * 1.7 + 0.6) * 0.01,
      eyeU: 1,
      earN: -0.03 + Math.sin(t * 1.9) * 0.03, earF: -0.10 + Math.sin(t * 1.6 + 1) * 0.03,
      blNu: -0.05, blNf: 0.04, blFu: 0.04, blFf: -0.05,
      flNu: 0.04, flNf: -0.03, flFu: -0.04, flFf: 0.04,
      tail: [0.22 + Math.sin(t * 1.3) * 0.03, 0.10, 0.06],
      leaf: { a: Math.sin(t * 1.6) * 0.10, x: Math.sin(t * 1.1) * 3, y: Math.sin(t * 1.9) * 2 },
      hasLeaf: true
    });
  }

  function poseGallop(t, o) {
    const ph = ((t * 3.1) % 1) * TAU;
    const s = Math.sin(ph), cc = Math.cos(ph);
    return Object.assign(basePose(), {
      torsoY: -Math.abs(Math.sin(ph)) * 7 + 2, torsoPitch: 0.16 + cc * 0.05,
      neck: -0.16 + s * 0.06, head: 0.10 - s * 0.05,
      earN: -0.34 + s * 0.14, earF: -0.40 + Math.sin(ph + 0.4) * 0.14,
      // 对角步态
      flNu: s * 0.95, flNf: -Math.max(0, -s) * 0.55 + 0.12,
      flFu: Math.sin(ph + Math.PI - 0.5) * 0.9, flFf: -Math.max(0, -Math.sin(ph + Math.PI - 0.5)) * 0.5 + 0.1,
      blNu: Math.sin(ph + Math.PI * 0.62) * 0.95, blNf: -Math.max(0, -Math.sin(ph + Math.PI * 0.62)) * 0.7 + 0.1,
      blFu: Math.sin(ph - 0.55) * 0.9, blFf: -Math.max(0, -Math.sin(ph - 0.55)) * 0.65 + 0.1,
      tail: [0.95 + Math.sin(ph * 2) * 0.25, 0.35 + Math.sin(ph * 2 - 0.6) * 0.3, 0.2],
      leaf: { a: Math.sin(t * 7) * 0.22, x: Math.sin(t * 9) * 1.5, y: Math.sin(t * 11) * 1 }
    });
  }

  function poseSniff(t, o) {
    const sniff = Math.sin(t * 11.5);
    return Object.assign(basePose(), {
      torsoY: -4, torsoPitch: -0.18,
      neck: -0.30 + sniff * 0.02, head: -0.16 + sniff * 0.025,
      earN: 0.06 + Math.sin(t * 9) * 0.05, earF: 0.0 + Math.sin(t * 8.2) * 0.05,
      blNu: 0.34, blNf: -0.30, blFu: 0.30, blFf: -0.26,
      flNu: -0.62, flNf: 0.72, flFu: -0.55, flFf: 0.66,
      tail: [0.85 + Math.sin(t * 6) * 0.14, 0.3 + Math.sin(t * 6 - 0.5) * 0.16, 0.15],
      leaf: { a: Math.sin(t * 2.2) * 0.06, x: 0, y: Math.sin(t * 2.6) * 2.5 }
    });
  }

  function poseWag(t, o) {
    const w = t * 15, step = t * 7;
    return Object.assign(basePose(), {
      torsoY: -Math.abs(Math.sin(step)) * 3, torsoPitch: -0.06 + Math.sin(step) * 0.05,
      neck: -0.20 + Math.sin(t * 5) * 0.05, head: 0.10 + Math.sin(t * 6.4) * 0.07,
      earN: 0.10 + Math.sin(t * 13) * 0.08, earF: 0.04 + Math.sin(t * 11 + 0.5) * 0.08,
      blNu: Math.sin(step) * 0.18, blNf: -Math.max(0, Math.sin(step)) * 0.2,
      blFu: -Math.sin(step) * 0.18, blFf: -Math.max(0, -Math.sin(step)) * 0.2,
      flNu: -0.06 + Math.sin(step + 1) * 0.12, flNf: 0.05,
      flFu: -0.06 - Math.sin(step + 1) * 0.12, flFf: 0.05,
      tail: [0.55 + Math.sin(w) * 0.75, 0.25 + Math.sin(w - 0.7) * 0.65, 0.15 + Math.sin(w - 1.4) * 0.55],
      tailBlur: true,
      leaf: { a: Math.sin(t * 2.4) * 0.08, x: 0, y: Math.sin(t * 3) * 3 }
    });
  }

  function poseWind(t, o) {
    const sh = Math.sin(t * 26) * 0.9;
    return Object.assign(basePose(), {
      torsoY: 6, torsoPitch: 0.10,
      neck: 0.10, head: 0.22 + Math.sin(t * 0.9) * 0.02,
      earN: 0.32 + Math.sin(t * 7) * 0.05, earF: 0.30 + Math.sin(t * 6.4) * 0.05,
      blNu: 0.30, blNf: -0.34, blFu: 0.24, blFf: -0.28,
      flNu: -0.22, flNf: 0.34, flFu: -0.16, flFf: 0.28,
      tail: [0.05 + Math.sin(t * 5) * 0.12, -0.15, -0.2],
      leaf: { a: 0, x: 0, y: 0 },
      shiver: sh * 0.6
    });
  }

  function poseRun(t, o) {
    const ph = ((t * 2.4) % 1) * TAU;
    const s = Math.sin(ph);
    return Object.assign(basePose(), {
      torsoY: -2, torsoPitch: 0.12,
      neck: -0.12, head: 0.06,
      earN: -0.20, earF: -0.26,
      blNu: Math.sin(ph + 2) * 0.7, blNf: -Math.max(0, -Math.sin(ph + 2)) * 0.5,
      blFu: Math.sin(ph + 2 + Math.PI) * 0.7, blFf: -Math.max(0, -Math.sin(ph + 2 + Math.PI)) * 0.5,
      flNu: s * 0.7, flNf: -Math.max(0, -s) * 0.45,
      flFu: Math.sin(ph + Math.PI) * 0.7, flFf: -Math.max(0, -Math.sin(ph + Math.PI)) * 0.45,
      tail: [0.6 + Math.sin(ph * 2) * 0.2, 0.25, 0.15],
      leaf: { a: Math.sin(t * 4) * 0.12, x: 0, y: 0 }
    });
  }

  const STATES = { freeze: poseFreeze, gallop: poseGallop, sniff: poseSniff, wag: poseWag, wind: poseWind, run: poseRun, reunions: poseWag };

  /* ============================================================
     4. 矩阵工具 + 骨树渲染
     ============================================================ */
  const M = {
    id: () => [1, 0, 0, 1, 0, 0],
    mul(m, n) {
      return [
        m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
        m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
        m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]
      ];
    },
    T(x, y) { return [1, 0, 0, 1, x, y]; },
    R(a) { const c = Math.cos(a), s2 = Math.sin(a); return [c, s2, -s2, c, 0, 0]; },
    S(k) { return [k, 0, 0, k, 0, 0]; },
    apply(c, m) { c.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]); }
  };

  // 在父矩阵下，于关节 (jx,jy) 以角 a 画一片；pivot 对齐关节
  function blit(c, spr, parent, jx, jy, a) {
    const mm = M.mul(parent, M.mul(M.T(jx, jy), M.R(a)));
    M.apply(c, mm);
    c.drawImage(spr.cv, -spr.px - spr.pad, -spr.py - spr.pad);
    return mm;
  }

  // 剪影版精灵（转纯黑）用于皮影投影
  const silCache = new WeakMap();
  function sil(spr) {
    let o = silCache.get(spr);
    if (!o) {
      const cv = document.createElement('canvas');
      cv.width = spr.cv.width; cv.height = spr.cv.height;
      const cc = cv.getContext('2d');
      cc.drawImage(spr.cv, 0, 0);
      cc.globalCompositeOperation = 'source-in';
      cc.fillStyle = '#000'; cc.fillRect(0, 0, cv.width, cv.height);
      o = Object.assign({}, spr, { cv });
      silCache.set(spr, o);
    }
    return o;
  }
  function pick(spr, silhouette, far) {
    let s2 = far ? shaded(spr) : spr;
    return silhouette ? sil(s2) : s2;
  }

  /* ---------- 画一条腿（三段链 upper -> fore -> paw） ---------- */
  // hipX/hipZ：髋关节局部坐标；angles:{u,f,p} 三段角度
  function drawLeg(c, leg, parent, hipX, hipY, ang, silhouette, far) {
    // upper 枢轴在 (w/2, 3)，关节在 hipX,hipY；向下延伸
    let m = blit(c, pick(leg.upper, silhouette, far), parent, hipX, hipY, ang.u);
    // 肘/膝：upper 末端（向下 leg.upper.w 长）
    m = blit(c, pick(leg.fore, silhouette, far), m, 0, leg.upper.w - 6, ang.f);
    // 爪：fore 末端
    blit(c, pick(leg.paw, silhouette, far), m, 0, leg.fore.w - 6, ang.p);
  }

  const SHADOW_OFF = [12, 16];

  CP.drawDafa = function (c, x, y, scale, dir, t, stateName, opt) {
    const o = opt || {};
    const P = o.parts || (CP._dafaParts || (CP._dafaParts = buildDafaParts()));
    const pose = (STATES[stateName] || poseFreeze)(t, o);
    if (o.nodebug !== false) o._pose = pose;

    const root = M.mul(M.T(x, y), M.S(scale * dir));

    // ---- 舞台落地软阴影 ----
    {
      const w = 72 * Math.max(0.7, 1 + Math.min(0, pose.torsoY) * 0.012);
      M.apply(c, root);
      c.fillStyle = 'rgba(24,14,6,0.34)';
      c.beginPath(); c.ellipse(8, 2, w, 17, 0, 0, TAU); c.fill();
    }

    // ---- 皮影双投（软阴影） ----
    if (o.shadow !== false) {
      c.globalAlpha = o.shadowA != null ? o.shadowA : 0.30;
      rig(c, P, pose, o, true, M.mul(root, M.T(SHADOW_OFF[0], SHADOW_OFF[1])));
      c.globalAlpha = 1;
    }
    // ---- 正片 ----
    rig(c, P, pose, o, false, root);
    c.setTransform(1, 0, 0, 1, 0, 0);
    return pose;
  };

  function rig(c, P, pose, o, silhouette, root) {
    const ty = pose.torsoY + (pose.shiver || 0);
    // 髋部：地面原点上方；身体整体靠这几处局部坐标对齐
    const hipX = 6, hipY = -64 + ty;

    // ===== A. 远侧后腿 =====
    drawLeg(c, P.blFar, root, hipX - 22, hipY + 8, { u: pose.blFu, f: pose.blFf, p: pose.blFp || 0 }, silhouette, true);

    // ===== B. 远侧前腿 =====
    drawLeg(c, P.flFar, root, hipX + 4, hipY + 8, { u: pose.flFu, f: pose.flFf, p: pose.flFp || 0 }, silhouette, true);

    // ===== C. 胡萝卜竖尾（三节链 + 螺旋桨残影） =====
    {
      const mTail = M.mul(root, M.T(hipX - 36, hipY - 28));
      if (pose.tailBlur && !silhouette) {
        for (let k = -3; k <= 3; k++) {
          if (k === 0) continue;
          c.globalAlpha = 0.10 + 0.06 * (3 - Math.abs(k));
          blit(c, pick(P.tail0, false, true), mTail, 3, 12, pose.tail[0] + k * 0.22);
        }
        c.globalAlpha = 1;
      }
      let mt = blit(c, pick(P.tail0, silhouette, true), mTail, 3, 12, pose.tail[0]);
      mt = M.mul(mt, M.T(19, -1));
      mt = blit(c, pick(P.tail1, silhouette, true), mt, 2, 9, pose.tail[1]);
      mt = M.mul(mt, M.T(15, -1));
      blit(c, pick(P.tail2, silhouette, true), mt, 2, 8, pose.tail[2]);
    }

    // ===== D. 躯干（枢轴在髋前上方，含俯仰） =====
    const mTorso = M.mul(root, M.mul(M.T(hipX, hipY + 4), M.R(pose.torsoPitch)));
    {
      M.apply(c, mTorso);
      const tS = pick(P.torso, silhouette, false);
      c.drawImage(tS.cv, -P.torso.px - P.torso.pad, -P.torso.py - P.torso.pad);
    }

    // ===== E. 颈 + 头 + 耳 + 眼珠 =====
    const mNeck = M.mul(mTorso, M.T(46, -28));
    {
      const nS = pick(P.neck, silhouette, false);
      M.apply(c, mNeck);
      c.drawImage(nS.cv, -P.neck.px - P.neck.pad, -P.neck.py - P.neck.pad);
    }
    const mHead0 = M.mul(mNeck, M.mul(M.T(0, -17), M.R(pose.neck)));
    const mHead = blit(c, pick(P.head, silhouette, false), mHead0, 18, 48, pose.head);
    {
      // 远侧耳（头骨局部，压暗）
      blit(c, pick(P.ear, silhouette, true), M.mul(mHead, M.T(10, 18)), 6, 22, pose.earF - 0.18);
      // 近侧耳
      blit(c, pick(P.ear, silhouette, false), M.mul(mHead, M.T(18, 19)), 6, 22, pose.earN);
      // 眼珠上瞅
      if (pose.eyeU && !silhouette) {
        M.apply(c, M.mul(mHead, M.T(38.6, 19.4)));
        c.drawImage(P.pupil.cv, -P.pupil.pad - P.pupil.px + 1.6, -P.pupil.pad - P.pupil.py + 1.6);
      }
    }

    // ===== F. 头顶金黄银杏叶（独立漂浮平衡） =====
    if (o.leaf && pose.hasLeaf && (o.leaf !== false)) {
      const mL = M.mul(mHead, M.T(14 + (pose.leaf.x || 0), -24 + (pose.leaf.y || 0)));
      M.apply(c, M.mul(mL, M.R((pose.leaf.a || 0) - 0.10)));
      const lf = pick(P.leaf, silhouette, false);
      c.drawImage(lf.cv, -P.leaf.px - P.leaf.pad, -P.leaf.py - P.leaf.pad);
    }

    // ===== G. 近侧后腿（覆盖在躯干之后画，形成前后层次） =====
    drawLeg(c, P.blNear, root, hipX - 12, hipY + 8, { u: pose.blNu, f: pose.blNf, p: pose.blNp || 0 }, silhouette, false);

    // ===== H. 近侧前腿 =====
    drawLeg(c, P.flNear, root, hipX + 18, hipY + 4, { u: pose.flNu, f: pose.flNf, p: pose.flNp || 0 }, silhouette, false);

    c.setTransform(1, 0, 0, 1, 0, 0);
  }

  /* ============================================================
     5. 婉儿（跪姿抚摸）—— 简化矢量人偶
     ============================================================ */
  CP.drawWanKneel = function (c, x, y, scale, dir, t, opt) {
    const o = opt || {};
    c.save();
    c.translate(x, y);
    c.scale(dir * scale, scale);
    c.fillStyle = 'rgba(24,16,8,0.22)';
    c.beginPath(); c.ellipse(0, 2, 78, 14, 0, 0, TAU); c.fill();
    const br = Math.sin(t * 1.9) * 1.5;
    // 腿（跪姿）
    c.fillStyle = '#2f3542';
    c.beginPath(); c.moveTo(-34, 0); c.lineTo(6, 0); c.lineTo(10, -58); c.lineTo(-30, -58); c.closePath(); c.fill();
    // 大衣
    const g = c.createLinearGradient(0, -160, 0, -40);
    g.addColorStop(0, '#fbf7ef'); g.addColorStop(1, '#e2dccd');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-26, -52); c.bezierCurveTo(-30, -100, -18, -132, 2, -134 + br);
    c.bezierCurveTo(22, -132, 30, -100, 26, -52); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,110,90,0.5)'; c.lineWidth = 1.8; c.stroke();
    // 手臂抚摸
    const armA = Math.sin(t * 2.4) * 0.10 - 0.30;
    c.save();
    c.translate(10, -108);
    c.rotate(armA);
    c.fillStyle = '#f4efe4';
    c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.lineTo(96, 30); c.lineTo(92, 44); c.lineTo(-6, 16);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,110,90,0.45)'; c.lineWidth = 1.6; c.stroke();
    c.fillStyle = '#f6d9bd';
    c.beginPath(); c.ellipse(100, 40, 14, 9, 0.3, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(150,110,80,0.5)'; c.lineWidth = 1.4; c.stroke();
    c.restore();
    // 头与马尾
    c.fillStyle = '#f6d9bd';
    c.beginPath(); c.arc(0, -152 + br, 16, 0, TAU); c.fill();
    c.fillStyle = '#1e1e1e';
    c.beginPath(); c.arc(0, -156 + br, 17, Math.PI * 0.75, Math.PI * 2.25); c.fill();
    c.beginPath(); c.ellipse(-19, -140 + br + Math.sin(t * 2) * 1.5, 7, 20, 0.5, 0, TAU); c.fill();
    c.restore();
  };

})();
