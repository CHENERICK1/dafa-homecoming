/* 《大发回家》 - 真实西高地白梗「大发」纯 Canvas 2D 骨骼关节驱动模块 (v2 Opus 5.5 版)
   - 骨骼重构：短腿、紧凑身躯、菊花形蓬松大头、竖立小三角耳、胡萝卜直立粗尾巴
   - 专属标志物：
     1. 明黄色珊瑚绒小熊背心（带棕色小熊刺绣印花）
     2. 鲜红色配黑色织带 H 型胸背带 + 银色 D 环 + 拖行断绳
     3. 标志性头顶金黄银杏叶（带抖动、甩落与平衡解算）
   - 泥垢演变（S0–S5 阶段化）：
     S0: 幼犬灰毛凌乱
     S1: 纯白蓬松 + 干净小熊背心 + 红黑背带
     S2: 略带灰尘 + 泥爪 + 完整麻绳
     S3: 暴雨浸透毛发紧贴 + 浑身黑泥草籽 + 断绳拖行 + 背心泥渍盖住小熊
     S4: 半干泥壳 + 耳朵挂苍耳草籽 + 仅露小熊单耳
     S5: 晨光露珠 + 手指擦拭出完整小熊笑脸 + 归家光晕
   - 全新动力学状态机：
     stand / trot / gallop / sniff / wag (螺旋桨残影) / lie / freeze (头顶叶子定住) / shake (甩毛甩叶)
*/

(function () {
  const DF = window.DF || (window.DF = {});
  const dog = (DF.dog = {});

  // 基础数学插值
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;

  // 西高地特有菊花形蓬松毛发簇
  function drawChrysanthemumFluff(ctx, x, y, r, n = 12, color = '#f8f5ee', angleOffset = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // 放射状蓬松层次毛尖
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + angleOffset;
      const spikeR = r * (1 + 0.32 * Math.sin(i * 4.3 + angleOffset));
      const px = Math.cos(a) * spikeR;
      const py = Math.sin(a) * spikeR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 骨骼关节姿态计算器 (Rig Engine)
  function computePose(phase, state, t = 0) {
    let p = {
      torsoPitch: 0,
      torsoY: 0,
      neckAngle: -0.32,
      headAngle: 0.12,
      snoutAngle: 0,
      tailRot0: 0.65, // 西高地招牌直立萝卜尾
      tailRot1: 0.2,
      tailRot2: 0.1,
      earRotL: 0,
      earRotR: 0,
      // 西高地特有紧凑短腿 (前L, 前R, 后L, 后R)
      frontThighL: 0, frontShinL: 0, frontPawL: 0,
      frontThighR: 0, frontShinR: 0, frontPawR: 0,
      backThighL: 0, backShinL: 0, backPawL: 0,
      backThighR: 0, backShinR: 0, backPawR: 0,
      shiver: 0,
      blink: 0,
      leafAngle: 0,
      leafOffsetX: 0,
      leafOffsetY: 0,
      hasLeaf: false,
      tailBlur: false
    };

    // 眨眼生理微动
    const blinkCycle = (t * 0.35) % 1;
    if (blinkCycle < 0.04) p.blink = 1;

    if (state === 'freeze') {
      // 核心戏剧动作：头顶放着落叶，大发乖乖完全定住不动！
      // 只有轻微的小呼吸起伏与眼珠向上看
      const breathe = Math.sin(t * 1.8) * 1.2;
      p.torsoY = breathe;
      p.torsoPitch = 0.01;
      p.neckAngle = -0.4;
      p.headAngle = 0.05; // 稍微放平头部保持落叶平衡
      p.tailRot0 = 0.8 + Math.sin(t * 2) * 0.08; // 尾巴直立微晃
      p.earRotL = -0.05; p.earRotR = -0.05;
      p.hasLeaf = true;
      p.leafAngle = Math.sin(t * 2.5) * 0.08;

    } else if (state === 'shake') {
      // 甩毛甩落叶动作
      const shPh = Math.sin(t * 28);
      p.torsoPitch = shPh * 0.18;
      p.headAngle = -shPh * 0.35;
      p.earRotL = shPh * 0.4;
      p.earRotR = -shPh * 0.4;
      p.tailRot0 = 0.5 + shPh * 0.5;

    } else if (state === 'sniff') {
      // 树下仰头抽嗅深蓝布条
      const breathe = Math.sin(t * 12) * 0.05; // 鼻尖快速抽嗅
      p.torsoPitch = -0.15; // 前躯抬高
      p.neckAngle = -0.85;  // 极度仰头
      p.headAngle = -0.4 + breathe;
      p.snoutAngle = breathe;
      // 前肢踮起趴在树上
      p.frontThighL = 0.35; p.frontShinL = -0.2;
      p.frontThighR = 0.28; p.frontShinR = -0.15;
      p.backThighL = -0.18; p.backShinL = 0.25;
      p.backThighR = -0.12; p.backShinR = 0.2;
      p.tailRot0 = 0.75 + Math.sin(t * 4) * 0.18; // 尾巴重新充满希望上翘
      p.earRotL = 0.22; p.earRotR = 0.18; // 耳朵兴奋警觉立起

    } else if (state === 'wag' || state === 'reunion') {
      // 螺旋桨甩尾大爆发 (8-10Hz 物理合理频率 + 运动模糊残影)
      const wagPh = t * 50; 
      const stepPh = t * 14;

      p.torsoY = Math.abs(Math.sin(stepPh)) * 3.5;
      p.torsoPitch = Math.sin(stepPh) * 0.07;
      p.tailBlur = true;

      p.tailRot0 = 0.6 + Math.sin(wagPh) * 0.95;
      p.tailRot1 = 0.3 + Math.sin(wagPh - 0.5) * 0.85;
      p.tailRot2 = 0.2 + Math.sin(wagPh - 1.0) * 0.75;

      p.frontThighL = Math.sin(stepPh) * 0.35;
      p.frontShinL = Math.max(0, -Math.sin(stepPh)) * 0.4;
      p.frontThighR = Math.sin(stepPh + Math.PI) * 0.35;
      p.frontShinR = Math.max(0, -Math.sin(stepPh + Math.PI)) * 0.4;

      p.neckAngle = -0.55;
      p.headAngle = 0.3 + Math.sin(t * 6) * 0.08;
      p.earRotL = 0.2 + Math.sin(t * 12) * 0.15;
      p.earRotR = 0.2 + Math.sin(t * 12 + 0.4) * 0.15;
      p.shiver = Math.sin(t * 32) * 1.2;

    } else if (state === 'run' || state === 'gallop') {
      // 短腿西高地飞跃奔跑 (四足大腾空与触地)
      const ph = phase * Math.PI * 2;
      p.torsoY = Math.sin(ph) * 12 - 3;
      p.torsoPitch = Math.sin(ph) * 0.14;

      // 短腿快速腾挪
      p.frontThighL = Math.sin(ph) * 0.85;
      p.frontShinL = Math.sin(ph) > 0 ? 0.7 : 0.1;
      p.frontThighR = Math.sin(ph + Math.PI * 0.8) * 0.85;
      p.frontShinR = Math.sin(ph + Math.PI * 0.8) > 0 ? 0.7 : 0.1;

      p.backThighL = Math.sin(ph + 2.0) * 0.8;
      p.backShinL = Math.sin(ph + 2.0) > 0 ? 0.65 : -0.15;
      p.backThighR = Math.sin(ph + 2.0 + Math.PI * 0.8) * 0.8;
      p.backShinR = Math.sin(ph + 2.0 + Math.PI * 0.8) > 0 ? 0.65 : -0.15;

      p.neckAngle = -0.42 + Math.sin(ph) * 0.1;
      p.headAngle = 0.18 + Math.sin(ph) * 0.08;
      p.tailRot0 = 0.2 + Math.sin(ph * 2) * 0.2;
      p.earRotL = -0.22 + Math.sin(ph) * 0.15;
      p.earRotR = -0.18 + Math.sin(ph + 0.2) * 0.15;

    } else if (state === 'walk' || state === 'trot') {
      const ph = phase * Math.PI * 2;
      p.torsoY = Math.abs(Math.sin(ph * 2)) * 4;
      p.torsoPitch = Math.sin(ph) * 0.04;

      p.frontThighL = Math.sin(ph) * 0.4;
      p.frontShinL = Math.max(0, -Math.sin(ph)) * 0.45;
      p.frontThighR = Math.sin(ph + Math.PI) * 0.4;
      p.frontShinR = Math.max(0, -Math.sin(ph + Math.PI)) * 0.45;

      p.backThighL = Math.sin(ph + 1.2) * 0.35;
      p.backShinL = Math.max(0, -Math.sin(ph + 1.2)) * 0.4;
      p.backThighR = Math.sin(ph + 1.2 + Math.PI) * 0.35;
      p.backShinR = Math.max(0, -Math.sin(ph + 1.2 + Math.PI)) * 0.4;

      p.tailRot0 = 0.65 + Math.sin(ph * 2) * 0.18;
      p.earRotL = Math.sin(ph * 2) * 0.06;
      p.earRotR = Math.sin(ph * 2 + 0.3) * 0.06;

    } else if (state === 'lie' || state === 'sleep') {
      const breathe = Math.sin(t * 1.5) * 2.5;
      p.torsoY = 14 + breathe;
      p.torsoPitch = 0.04;
      p.frontThighL = 1.0; p.frontShinL = -1.1;
      p.frontThighR = 0.9; p.frontShinR = -1.0;
      p.backThighL = -0.9; p.backShinL = 1.2;
      p.backThighR = -0.8; p.backShinR = 1.1;
      p.neckAngle = 0.2;
      p.headAngle = -0.3;
      p.blink = 1;
      p.tailRot0 = 0.8;
      p.earRotL = -0.15; p.earRotR = -0.12;

    } else {
      // idle 站立呼吸
      const breathe = Math.sin(t * 2) * 0.04;
      p.torsoY = Math.sin(t * 2) * 2;
      p.neckAngle = -0.32 + breathe;
      p.headAngle = 0.12 - breathe;
      p.tailRot0 = 0.7 + Math.sin(t * 3) * 0.12;
    }

    return p;
  }

  // 绘制西高地身材 (偏瘦、腿稍微长一点的匀称身形)
  function drawLeg(ctx, thighL, shinL, pawL, thighA, shinA, pawA, isFront, color = '#f7f4ec', dirt = 0) {
    ctx.save();
    ctx.rotate(thighA);

    // 适度修长匀称的大腿
    const thighW = isFront ? 11 : 13;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, thighL * 0.5, thighW * 0.5, thighL * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 稍微修长的小腿
    ctx.translate(0, thighL);
    ctx.rotate(shinA);
    const shinW = isFront ? 8.5 : 10;
    ctx.fillStyle = dirt > 0.4 ? DF.mix(color, '#5a4634', dirt * 0.7) : color;
    ctx.beginPath();
    ctx.ellipse(0, shinL * 0.5, shinW * 0.5, shinL * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 圆润小脚爪
    ctx.translate(0, shinL);
    ctx.rotate(pawA);
    ctx.fillStyle = dirt > 0.2 ? DF.mix(color, '#443527', dirt * 0.85) : color;
    ctx.beginPath();
    ctx.ellipse(2, pawL * 0.4, 6, 4.5, 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 绘制黄色珊瑚绒小熊背心 (Yellow Fleece Vest) - 偏瘦精干身型
  function drawYellowBearVest(ctx, dirt = 0, isCleanThumbWiped = false) {
    ctx.save();
    // 1. 背心黄色珊瑚绒主体 (更瘦长流畅)
    let vestColor = '#f5c542'; // 明亮暖黄
    if (dirt > 0.3) {
      vestColor = DF.mix(vestColor, '#5e4b37', Math.min(0.8, dirt * 0.85));
    }
    ctx.fillStyle = vestColor;
    ctx.beginPath();
    // 覆盖躯干的背心轮廓 (从33x19收紧为31x16，身形更清瘦匀称)
    ctx.ellipse(0, -5, 31, 15.5, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 领口罗纹与边缘缝线
    ctx.strokeStyle = dirt > 0.3 ? '#423528' : '#e0a825';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(22, -10, 11, -Math.PI * 0.4, Math.PI * 0.6);
    ctx.stroke();

    // 2. 标志性棕色小熊刺绣印花 (Teddy Bear Face Print)
    ctx.save();
    ctx.translate(6, -6);
    // 泥巴未遮挡或拇指擦亮时清晰展现
    const showBear = (dirt < 0.65) || isCleanThumbWiped;
    if (showBear) {
      // 擦亮的光晕
      if (isCleanThumbWiped) {
        ctx.fillStyle = 'rgba(255, 235, 170, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // 小熊圆脸
      ctx.fillStyle = '#8d5b32';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8.5, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // 小熊圆耳朵
      ctx.beginPath();
      ctx.arc(-6.5, -6, 3, 0, Math.PI * 2);
      ctx.arc(6.5, -6, 3, 0, Math.PI * 2);
      ctx.fill();
      // 浅色口鼻部
      ctx.fillStyle = '#d7b596';
      ctx.beginPath();
      ctx.ellipse(0, 1.8, 4.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // 小黑鼻点与眼睛
      ctx.fillStyle = '#221812';
      ctx.beginPath();
      ctx.arc(0, 0.8, 1.3, 0, Math.PI * 2); // 鼻子
      ctx.arc(-3.2, -1.8, 1, 0, Math.PI * 2); // 左眼
      ctx.arc(3.2, -1.8, 1, 0, Math.PI * 2);  // 右眼
      ctx.fill();
    } else if (dirt >= 0.65 && dirt < 0.85) {
      // 泥垢严重时，只露出一只萌萌的小熊耳朵！
      ctx.fillStyle = '#8d5b32';
      ctx.beginPath();
      ctx.arc(6.5, -6, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. 鲜红色配黑色 H 型胸背带 (Red/Black Harness + Silver D-ring)
    ctx.strokeStyle = '#c0392b'; // 鲜红
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    // 环绕前胸与腰背织带
    ctx.moveTo(12, -18); ctx.lineTo(16, 8);
    ctx.moveTo(-10, -18); ctx.lineTo(-8, 8);
    ctx.stroke();

    // 黑色内层衬垫滚边
    ctx.strokeStyle = '#1e2124';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(14, -18); ctx.lineTo(18, 8);
    ctx.stroke();

    // 背部银色金属 D 环 (D-Ring)
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.arc(-2, -19, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 绘制标志性头顶金黄银杏叶 (Golden Ginkgo Leaf Crown)
  function drawGinkgoLeaf(ctx, angle = 0) {
    ctx.save();
    ctx.rotate(angle);
    // 细细的叶柄
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(4, -8, 2, -16);
    ctx.stroke();

    // 扇形金黄银杏叶片 (两瓣微裂)
    ctx.translate(2, -16);
    ctx.fillStyle = '#f1c40f'; // 亮黄金黄
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-15, -12, -12, -22);
    ctx.quadraticCurveTo(-4, -26, 0, -18); // 中间浅裂口
    ctx.quadraticCurveTo(4, -26, 12, -22);
    ctx.quadraticCurveTo(15, -12, 0, 0);
    ctx.closePath();
    ctx.fill();

    // 叶脉与金光高光
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-6, -18);
    ctx.moveTo(0, 0); ctx.lineTo(0, -17);
    ctx.moveTo(0, 0); ctx.lineTo(6, -18);
    ctx.stroke();

    ctx.restore();
  }

  // 核心绘制入口
  dog.draw = function (ctx, x, y, scale = 1, dir = 1, animState = 'trot', options = {}) {
    const t = options.t || 0;
    const phase = options.phase !== undefined ? options.phase : (t * 2) % 1;
    const dirt = options.dirtLevel || 0; // 0.0 - 1.0 (S0 - S5)
    const isCleanThumbWiped = options.thumbWiped || false;
    const snappedRope = options.snappedRope || false; // 是否挂着断绳
    const forceLeaf = options.hasLeaf || false; // 是否佩戴落叶

    const coatBase = options.coatColor || '#fbf8f1';
    const coatShadow = '#dfd6c0';

    const pose = computePose(phase, animState, t);
    if (forceLeaf) pose.hasLeaf = true;

    ctx.save();
    ctx.translate(x, y + pose.shiver);
    ctx.scale(dir * scale, scale);

    // 1. 地面真实软阴影
    ctx.save();
    ctx.fillStyle = 'rgba(18, 14, 10, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 42, 38 * (1 - pose.torsoY * 0.015), 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. 远侧后肢 (腿稍微长一点、匀称修长)
    ctx.save();
    ctx.translate(-20, 0 + pose.torsoY);
    drawLeg(ctx, 28, 28, 7, pose.backThighR, pose.backShinR, pose.backPawR, false, coatShadow, dirt);
    ctx.restore();

    // 3. 远侧前肢
    ctx.save();
    ctx.translate(18, -4 + pose.torsoY);
    drawLeg(ctx, 26, 26, 7, pose.frontThighR, pose.frontShinR, pose.frontPawR, true, coatShadow, dirt);
    ctx.restore();

    // 4. 躯干与黄色小熊背心
    ctx.save();
    ctx.translate(0, pose.torsoY);
    ctx.rotate(pose.torsoPitch);

    // 西高地标志性直立胡萝卜短尾 (Carrot Tail)
    ctx.save();
    ctx.translate(-26, -8);
    ctx.rotate(pose.tailRot0);

    // 尾巴螺旋桨模糊残影
    if (pose.tailBlur) {
      ctx.fillStyle = 'rgba(251, 248, 241, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-6, -8, 18, 8, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = coatBase;
    ctx.beginPath();
    ctx.ellipse(-6, -4, 10, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(-10, -6);
    ctx.rotate(pose.tailRot1);
    ctx.beginPath();
    ctx.ellipse(-6, -3, 8, 4.5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore(); // 尾巴绘制结束

    // 拖行断绳（如果有）
    if (snappedRope) {
      ctx.save();
      ctx.strokeStyle = '#bda072';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-2, -19);
      // 残留甩动的粗麻绳段
      ctx.quadraticCurveTo(-18, 8, -36 + Math.sin(t * 8) * 8, 32);
      ctx.stroke();
      // 崩断毛刺
      ctx.fillStyle = '#d8be92';
      for (let bi = 0; bi < 4; bi++) {
        ctx.fillRect(-36 + bi * 2, 30 + (bi % 2) * 3, 2.5, 2.5);
      }
      ctx.restore();
    }

    // 躯干白毛肉体
    ctx.fillStyle = coatBase;
    ctx.beginPath();
    ctx.ellipse(0, -6, 32, 19, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 穿在身上的黄色小熊背心！
    drawYellowBearVest(ctx, dirt, isCleanThumbWiped);

    // 泥巴斑点与草籽苍耳（S2 - S5 阶段）
    if (dirt > 0.2) {
      ctx.fillStyle = 'rgba(68, 50, 34, ' + Math.min(0.85, dirt * 0.9) + ')';
      ctx.beginPath();
      ctx.arc(-8, -2, 5, 0, 7);
      ctx.arc(14, 5, 6, 0, 7);
      ctx.arc(-16, 4, 5.5, 0, 7);
      ctx.fill();

      // 苍耳草籽
      ctx.fillStyle = '#3d4422';
      ctx.beginPath();
      ctx.arc(4, -16, 2.4, 0, 7);
      ctx.arc(-12, -12, 2.2, 0, 7);
      ctx.arc(16, -10, 2.6, 0, 7);
      ctx.fill();
    }

    // 5. 颈部与头部 (菊花形蓬松头颅与头顶落叶)
    ctx.save();
    ctx.translate(22, -14);
    ctx.rotate(pose.neckAngle);

    // 颈部毛发
    ctx.fillStyle = coatBase;
    ctx.beginPath();
    ctx.ellipse(0, -6, 12, 16, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 转到头部
    ctx.translate(2, -16);
    ctx.rotate(pose.headAngle);

    // 头颅圆毛球 (西高地菊花脸特有的大毛球)
    drawChrysanthemumFluff(ctx, 0, 0, 18, 14, coatBase, t * 0.8);

    // 标志性竖耳 (Upright Ears)
    // 远侧耳
    ctx.save();
    ctx.translate(-5, -15);
    ctx.rotate(pose.earRotR - 0.15);
    ctx.fillStyle = coatShadow;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(7, -18); ctx.lineTo(14, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 近侧耳
    ctx.save();
    ctx.translate(3, -16);
    ctx.rotate(pose.earRotL);
    ctx.fillStyle = coatBase;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(7, -18); ctx.lineTo(14, 2);
    ctx.closePath();
    ctx.fill();
    // 耳蜗内侧粉嫩肉色
    ctx.fillStyle = 'rgba(235, 175, 165, 0.45)';
    ctx.beginPath();
    ctx.moveTo(3, -2); ctx.lineTo(7, -13); ctx.lineTo(11, -1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 头顶金黄银杏叶 (如果处于佩戴状态)
    if (pose.hasLeaf) {
      ctx.save();
      ctx.translate(0, -18); // 稳稳顶在正脑门上方
      drawGinkgoLeaf(ctx, pose.leafAngle);
      ctx.restore();
    }

    // 面部五官 (西高地黑鼻黑眼与吻部胡子)
    ctx.save();
    ctx.translate(8, -1);

    // 饱满圆胡子
    drawChrysanthemumFluff(ctx, 4, 3, 10, 8, coatBase, 0.5);

    // 大黑鼻头
    ctx.fillStyle = '#1c1b18';
    ctx.beginPath();
    ctx.ellipse(12, 2, 4.2, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // 鼻头高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(11, 1, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 黑亮豆豆眼
    if (pose.blink) {
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(2, -3, 3.5, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#1a1410';
      ctx.beginPath();
      ctx.arc(2, -3, 3.6, 0, Math.PI * 2);
      ctx.fill();
      // 眼神光 (如果头顶有叶子，眼光往上翻着看)
      ctx.fillStyle = '#fff';
      if (pose.hasLeaf) {
        ctx.arc(2, -5, 1.2, 0, Math.PI * 2); // 向上翻看
      } else {
        ctx.arc(1.2, -4, 1.2, 0, Math.PI * 2); // 灵动前视
      }
      ctx.fill();
    }

    ctx.restore(); // 面部结束
    ctx.restore(); // 头部结束
    ctx.restore(); // 躯干结束

    // 6. 近侧前肢 (适度修长匀称前腿)
    ctx.save();
    ctx.translate(14, -2 + pose.torsoY);
    drawLeg(ctx, 26, 26, 7, pose.frontThighL, pose.frontShinL, pose.frontPawL, true, coatBase, dirt);
    ctx.restore();

    // 7. 近侧后肢 (适度修长匀称后腿)
    ctx.save();
    ctx.translate(-16, 2 + pose.torsoY);
    drawLeg(ctx, 28, 28, 7, pose.backThighL, pose.backShinL, pose.backPawL, false, coatBase, dirt);
    ctx.restore();

    ctx.restore(); // 总体结束
  };

})();
