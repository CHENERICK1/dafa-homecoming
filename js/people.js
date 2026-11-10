/* 《大发回家》 - 角色矢量骨骼绘制模块 (People & Props Rig)
   - 建筑师阿沐 (眼镜、围巾、风衣)
   - 妻子婉儿 (大衣、马尾)
   - 婴儿车/婴儿摇篮
   - 手电筒锥形光斑与阴影投射
*/

(function () {
  const DF = window.DF || (window.DF = {});
  const people = (DF.people = {});

  // 1. 绘制建筑师阿沐
  people.drawAmu = function (ctx, x, y, scale = 1, dir = 1, pose = 'stand', t = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir * scale, scale);

    const breathe = Math.sin(t * 2) * 2;

    if (pose === 'search') {
      // 雨夜打手电筒焦急搜寻
      // 腿部微屈
      ctx.fillStyle = '#1c222b';
      ctx.fillRect(-14, -80, 12, 80); // 后腿
      ctx.fillRect(4, -80, 12, 80);  // 前腿

      // 躯干风衣
      ctx.save();
      ctx.translate(0, -80 + breathe);
      ctx.rotate(0.12);
      ctx.fillStyle = '#2b3847';
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(18, 0);
      ctx.lineTo(26, 68);
      ctx.lineTo(-22, 68);
      ctx.closePath();
      ctx.fill();

      // 围巾迎风飘展
      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.lineTo(-28 + Math.sin(t * 6) * 6, 15);
      ctx.lineTo(-24 + Math.sin(t * 6) * 6, 25);
      ctx.lineTo(0, 0);
      ctx.fill();

      // 手持手电筒的前臂
      ctx.save();
      ctx.translate(14, 18);
      ctx.rotate(-0.35 + Math.sin(t * 3) * 0.05); // 晃动手电筒
      ctx.fillStyle = '#242f3d';
      ctx.fillRect(0, -6, 32, 12);
      // 手电筒筒身
      ctx.fillStyle = '#dcdde1';
      ctx.fillRect(30, -9, 16, 18);

      // 手电筒巨大光锥 (Volumetric Light Cone)
      ctx.save();
      const g = ctx.createRadialGradient(46, 0, 10, 46, 0, 800);
      g.addColorStop(0, 'rgba(255, 245, 200, 0.85)');
      g.addColorStop(0.2, 'rgba(255, 235, 170, 0.45)');
      g.addColorStop(0.8, 'rgba(255, 220, 140, 0.08)');
      g.addColorStop(1, 'rgba(255, 220, 140, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(46, 0);
      ctx.lineTo(950, -220);
      ctx.lineTo(950, 260);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore(); // 手臂结束

      // 头部 (戴眼镜)
      ctx.save();
      ctx.translate(2, -22);
      ctx.rotate(0.1);
      // 脸
      ctx.fillStyle = '#f0d9c0';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      // 头发
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, -4, 15, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      // 眼镜边框
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(4, -3, 8, 7);
      ctx.beginPath();
      ctx.moveTo(12, 0); ctx.lineTo(15, -1);
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // 躯干结束

    } else if (pose === 'crouch' || pose === 'beckon') {
      // 撑伞蹲下招手唤狗
      // 蹲姿腿
      ctx.fillStyle = '#1c222b';
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.lineTo(15, 0); ctx.lineTo(25, -28); ctx.lineTo(-15, -28);
      ctx.fill();

      // 躯干
      ctx.save();
      ctx.translate(0, -32 + breathe);
      ctx.rotate(0.2);
      ctx.fillStyle = '#2b3847';
      ctx.fillRect(-14, -40, 28, 42);

      // 伸出的前手招手
      ctx.save();
      ctx.translate(14, -20);
      ctx.rotate(0.3 + Math.sin(t * 5) * 0.1);
      ctx.fillStyle = '#f0d9c0';
      ctx.beginPath();
      ctx.arc(28, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 雨伞手柄与巨大伞顶
      ctx.save();
      ctx.translate(-6, -42);
      ctx.rotate(-0.1);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 20); ctx.lineTo(0, -45);
      ctx.stroke();
      // 伞面 (深蓝大雨伞)
      ctx.fillStyle = '#1e3799';
      ctx.beginPath();
      ctx.arc(0, -45, 75, Math.PI * 1.05, Math.PI * 1.95);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 头部
      ctx.fillStyle = '#f0d9c0';
      ctx.beginPath();
      ctx.arc(4, -54, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(4, -58, 14, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      // 眼镜
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(8, -54, 7, 6);

      ctx.restore();

    } else {
      // 正常站姿
      ctx.fillStyle = '#1c222b';
      ctx.fillRect(-12, -75, 10, 75);
      ctx.fillRect(4, -75, 10, 75);
      ctx.fillStyle = '#2b3847';
      ctx.fillRect(-15, -145 + breathe, 30, 70);
      ctx.fillStyle = '#f0d9c0';
      ctx.beginPath();
      ctx.arc(0, -160 + breathe, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, -164 + breathe, 15, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
    }

    ctx.restore();
  };

  // 2. 绘制妻子婉儿
  people.drawWan = function (ctx, x, y, scale = 1, dir = 1, pose = 'stand', t = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir * scale, scale);

    const breathe = Math.sin(t * 2 + 1) * 2;

    if (pose === 'embrace' || pose === 'weep_joy') {
      // 清晨门前激动掩面/相拥
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(-10, -70, 9, 70);
      ctx.fillRect(3, -70, 9, 70);

      // 暖黄色米白大衣
      ctx.save();
      ctx.translate(0, -70 + breathe);
      ctx.fillStyle = '#f1f2f6';
      ctx.beginPath();
      ctx.moveTo(-14, 0); ctx.lineTo(16, 0); ctx.lineTo(24, 62); ctx.lineTo(-18, 62);
      ctx.closePath();
      ctx.fill();

      // 双手掩面激动
      ctx.save();
      ctx.translate(10, -32);
      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.arc(6, -2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 头部与马尾辫
      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.arc(0, -42, 13, 0, Math.PI * 2);
      ctx.fill();
      // 黑色秀发与马尾
      ctx.fillStyle = '#1e1e1e';
      ctx.beginPath();
      ctx.arc(0, -45, 14, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      // 垂下马尾
      ctx.beginPath();
      ctx.ellipse(-14, -36 + Math.sin(t * 3) * 2, 6, 16, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

    } else {
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(-10, -70, 9, 70);
      ctx.fillRect(3, -70, 9, 70);
      ctx.fillStyle = '#f1f2f6';
      ctx.fillRect(-14, -135 + breathe, 28, 65);
      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.arc(0, -150 + breathe, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1e1e';
      ctx.beginPath();
      ctx.arc(0, -153 + breathe, 14, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
    }

    ctx.restore();
  };

  // 3. 婴儿床与安睡小婴儿 (Crib & Baby)
  people.drawCrib = function (ctx, x, y, scale = 1, t = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const rock = Math.sin(t * 1.5) * 0.02; // 婴儿床温柔轻晃
    ctx.rotate(rock);

    // 原木木腿
    ctx.fillStyle = '#b78b58';
    ctx.fillRect(-60, -20, 8, 70);
    ctx.fillRect(52, -20, 8, 70);

    // 婴儿床栅栏框
    ctx.fillStyle = '#dfba87';
    ctx.fillRect(-68, -75, 136, 55);

    // 栏杆空隙
    ctx.fillStyle = '#9e7343';
    for (let i = -56; i <= 46; i += 18) {
      ctx.fillRect(i, -70, 8, 45);
    }

    // 温暖的小棉被与婴儿圆脑袋
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.ellipse(0, -42, 48, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 宝宝露出的圆脸
    ctx.fillStyle = '#ffd1b3';
    ctx.beginPath();
    ctx.arc(22, -46, 12, 0, Math.PI * 2);
    ctx.fill();
    // 闭眼睫毛
    ctx.strokeStyle = '#8d5524';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(24, -45, 3.5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore();
  };

})();
