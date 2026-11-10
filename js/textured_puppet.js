/* 《大发回家》 真实皮影材质人偶渲染器 (Textured Puppet Rig)
   彻底废除 Canvas 几何画法，全面使用真实拆件 PNG 贴图 + 层级关节树 (Joint Tree)
*/
(function () {
  const DF = window.DF || (window.DF = {});
  const images = {};
  let loaded = false;

  function initTextures() {
    if (loaded || !DF.puppetTextures) return;
    for (const [key, b64] of Object.entries(DF.puppetTextures)) {
      const img = new Image();
      img.src = b64;
      images[key] = img;
    }
    loaded = true;
  }

  DF.texturedPuppet = {
    drawDafaPuppet: function (ctx, x, y, scale, dir, t, stateName) {
      initTextures();
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(dir * scale, scale);

      // 解剖学参数与动力学
      let breath = Math.sin(t * 1.5) * 3;
      let torsoAngle = 0;
      let headAngle = 0;
      let tailAngle = 0;
      let legAngleF = 0;
      let legAngleB = 0;

      if (stateName === 'curl_shiver') {
        // 幼犬受冻发抖：高频双震荡微动，身体紧缩
        const shiver1 = Math.sin(t * 22.0 * Math.PI * 2) * 2.5;
        const shiver2 = Math.sin(t * 17.3 * Math.PI * 2) * 1.8;
        ctx.translate(shiver1, shiver2);
        torsoAngle = 0.15;
        headAngle = 0.25;
        tailAngle = -0.5; // 尾巴夹紧
      } else if (stateName === 'neck_relax') {
        // 触碰温暖掌心：颈部下沉放松
        torsoAngle = 0.05;
        headAngle = -0.1 + Math.sin(t * 1.2) * 0.03;
        tailAngle = -0.2 + Math.sin(t * 2.0) * 0.08;
      } else if (stateName === 'stay_still') {
        // 顶叶定格：除极微弱呼吸外全身锁死
        breath = Math.sin(t * 0.5) * 0.8;
        headAngle = -0.05; // 微微昂首平衡
        tailAngle = 0.1 + Math.sin(t * 2.5) * 0.04; // 仅尾尖极轻微轻颤
      }

      // 1. 远侧后腿
      if (images.hindleg_2) {
        ctx.save();
        ctx.filter = 'brightness(0.65)';
        ctx.translate(-45, -35);
        ctx.rotate(-0.1);
        ctx.drawImage(images.hindleg_2, -35, -20, 75, 120);
        ctx.restore();
      }

      // 2. 远侧前腿
      if (images.foreleg_upper_2 && images.foreleg_lower_2) {
        ctx.save();
        ctx.filter = 'brightness(0.7)';
        ctx.translate(45, -30);
        ctx.drawImage(images.foreleg_upper_2, -20, -10, 50, 60);
        ctx.translate(5, 45);
        ctx.drawImage(images.foreleg_lower_2, -15, 0, 45, 60);
        ctx.restore();
      }

      // 3. 躯干 (Torso)
      ctx.save();
      ctx.translate(0, -60 + breath);
      ctx.rotate(torsoAngle);
      if (images.torso) {
        ctx.drawImage(images.torso, -95, -75, 190, 140);
      }

      // 4. 尾巴 (Tail)
      if (images.tail) {
        ctx.save();
        ctx.translate(-85, -20);
        ctx.rotate(tailAngle);
        ctx.drawImage(images.tail, -30, -75, 65, 85);
        ctx.restore();
      }

      // 5. 头部 (Head)
      if (images.head) {
        ctx.save();
        ctx.translate(65, -45);
        ctx.rotate(headAngle);
        ctx.drawImage(images.head, -65, -95, 135, 135);
        ctx.restore();
      }
      ctx.restore(); // 躯干结束

      // 6. 近侧后腿
      if (images.hindleg_1) {
        ctx.save();
        ctx.translate(-35, -35);
        ctx.drawImage(images.hindleg_1, -35, -20, 80, 130);
        ctx.restore();
      }

      // 7. 近侧前腿
      if (images.foreleg_upper_1 && images.foreleg_lower_1) {
        ctx.save();
        ctx.translate(55, -30);
        ctx.drawImage(images.foreleg_upper_1, -20, -10, 50, 65);
        ctx.translate(5, 50);
        ctx.drawImage(images.foreleg_lower_1, -15, 0, 45, 65);
        ctx.restore();
      }

      ctx.restore();
    },

    drawAmuHand: function (ctx, x, y, angle) {
      initTextures();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      if (images.amu_sleeve) {
        ctx.drawImage(images.amu_sleeve, -35, -120, 70, 110);
      }
      if (images.amu_hand) {
        ctx.drawImage(images.amu_hand, -25, -20, 110, 60);
      }
      ctx.restore();
    },

    drawGinkgo: function (ctx, x, y, scale, angle) {
      initTextures();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);
      if (images.ginkgo) {
        ctx.drawImage(images.ginkgo, -25, -25, 50, 50);
      }
      ctx.restore();
    }
  };
})();
