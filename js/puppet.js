/* 《大发回家》 - 绘本分镜与皮影动画融合渲染器 (Storyboard Shadow-Puppet Renderer)
   - 基于高质量生成绘本原画为视觉画底
   - 注入皮影戏/Opus 5.5 骨骼切片动效 (2.5D Ken Burns 视差运镜 + 呼吸微动 + 动态粒子光影)
   - 彻底摆脱纯代码几何图形的粗糙感，完全保留绘本原画的温润颗粒感与质感
*/

(function () {
  const DF = window.DF || (window.DF = {});
  const SP = (DF.puppet = {});

  // 预载嵌入的绘本分镜图资源
  const images = {};
  DF.loadStoryboardImage = function (key, src) {
    const img = new Image();
    img.src = src;
    images[key] = img;
    return img;
  };

  // 2.5D 视差镜头矩阵控制 (Parallax Camera with Ken Burns Easing)
  SP.drawParallaxFrame = function (ctx, img, t, dur, options = {}) {
    if (!img || !img.complete || img.naturalWidth === 0) return false;

    const { W, H } = DF;
    const progress = Math.max(0, Math.min(1, t / dur));
    // 缓动平滑计算
    const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

    const zoomStart = options.zoomStart || 1.0;
    const zoomEnd = options.zoomEnd || 1.08;
    const panXStart = options.panXStart || 0;
    const panXEnd = options.panXEnd || 0;
    const panYStart = options.panYStart || 0;
    const panYEnd = options.panYEnd || 0;

    const curZoom = zoomStart + (zoomEnd - zoomStart) * ease;
    const curPanX = panXStart + (panXEnd - panXStart) * ease;
    const curPanY = panYStart + (panYEnd - panYStart) * ease;

    // 生理呼吸/手持镜头微震 (Handheld Camera Shake)
    const shakeSpeed = options.shakeSpeed || 1.5;
    const shakeAmp = options.shakeAmp || 3.0;
    const shakeX = Math.sin(t * shakeSpeed * 2.3) * shakeAmp;
    const shakeY = Math.cos(t * shakeSpeed * 1.9) * shakeAmp;

    ctx.save();
    ctx.translate(W / 2 + curPanX + shakeX, H / 2 + curPanY + shakeY);
    ctx.scale(curZoom, curZoom);

    // 保持 9:16 画幅居中铺满
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = W / H;
    let drawW, drawH;

    if (imgRatio > canvasRatio) {
      drawH = H;
      drawW = H * imgRatio;
    } else {
      drawW = W;
      drawH = W / imgRatio;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
    return true;
  };

  // 皮影落叶浮动组件 (针对第一幕与第六幕的落叶仪式)
  SP.drawFloatingGinkgoLeaf = function (ctx, x, y, t, options = {}) {
    const floatY = Math.sin(t * 2.5) * 4;
    const rotate = Math.sin(t * 1.8) * 0.12;
    const scale = options.scale || 1.0;

    ctx.save();
    ctx.translate(x, y + floatY);
    ctx.rotate(rotate);
    ctx.scale(scale, scale);

    // 叶柄
    ctx.strokeStyle = '#c68a18';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(6, -12, 3, -24);
    ctx.stroke();

    // 金黄两裂扇形叶面
    ctx.translate(3, -24);
    ctx.fillStyle = '#f1c40f';
    ctx.shadowColor = 'rgba(243, 156, 18, 0.6)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-22, -18, -18, -32);
    ctx.quadraticCurveTo(-6, -38, 0, -26);
    ctx.quadraticCurveTo(6, -38, 18, -32);
    ctx.quadraticCurveTo(22, -18, 0, 0);
    ctx.fill();

    // 细腻金色叶脉
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-9, -26);
    ctx.moveTo(0, 0); ctx.lineTo(0, -25);
    ctx.moveTo(0, 0); ctx.lineTo(9, -26);
    ctx.stroke();

    ctx.restore();
  };

  // 皮影气味粒子信标（通感光尘）
  SP.drawScentGoldenTrail = function (ctx, startX, startY, endX, endY, t) {
    ctx.save();
    // 飘忽柔和的金色气味曲线
    ctx.strokeStyle = 'rgba(255, 220, 130, 0.75)';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#f39c12';
    ctx.shadowBlur = 24;
    ctx.setLineDash([16, 12]);
    ctx.lineDashOffset = -t * 40;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const midX = (startX + endX) / 2 + Math.sin(t * 3) * 60;
    const midY = (startY + endY) / 2;
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();

    // 沿途发散的微尘光斑
    ctx.fillStyle = 'rgba(255, 240, 180, 0.85)';
    for (let i = 0; i < 12; i++) {
      const p = ((t * 0.4 + i / 12) % 1);
      const px = startX + (endX - startX) * p + Math.sin(t * 4 + i) * 25;
      const py = startY + (endY - startY) * p;
      const r = 3 + Math.sin(i * 1.5) * 2;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

})();
