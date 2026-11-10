/* 《大发回家》 第一幕真实材质皮影微电影 (Act 1 Director's Cut v2)
   使用 texturedPuppet 真实拆件贴图 + 层级关节动力学
*/
(function () {
  const DF = window.DF || (window.DF = {});
  const { W, H } = DF;
  const D = DF.D;
  const TP = DF.texturedPuppet;
  const ST = DF.stage;

  DF.act01_standalone = {
    id: "act01_textured",
    title: "第一幕 · 纸箱与叶冠",
    dur: 18.0,
    subs: [
      [0.8, 4.2, "五年前深秋的暴雨夜，你在路旁纸箱里瑟瑟发抖。"],
      [4.6, 8.5, "一双温暖的手自风雨中伸来，轻轻接住了你。"],
      [9.5, 13.5, "戴上金黄银杏叶，只要叶子不掉，你就乖乖定住一动不动。"],
      [14.0, 17.5, "从此，你成了家里最听话的大儿子。"]
    ],
    draw: function (ctx, lt) {
      if (lt < 9.0) {
        // ========== 前半段 (0.0 - 9.0s)：纸箱与寒雨初遇 ==========
        // 1. 舞台背景 (雨夜纸箱)
        ST.backdrop(ctx, "scene_06", lt, { dur: 9.0, zoom0: 1.02, zoom1: 1.06, dim: 0.35, fallbackTop: "#121824" });

        // 2. 真实物理暴雨与迷雾
        if (D && D.rain) {
          D.rain(ctx, lt, { intensity: 0.85, wind: 0.25, fog: 0.35 });
        }

        // 3. 真实贴图幼犬 (蜷缩发抖 -> 颈部放松)
        const puppyScale = 0.85;
        const puppyX = W * 0.46;
        const puppyY = H * 0.72;
        const stName = lt < 5.5 ? "curl_shiver" : "neck_relax";

        if (TP) {
          TP.drawDafaPuppet(ctx, puppyX, puppyY, puppyScale, 1, lt, stName);
        }

        // 4. 阿沐真实贴图风衣手掌探入 (4.0s - 8.5s)
        if (lt >= 4.0 && TP) {
          const handProgress = DF.clamp((lt - 4.0) / 2.2, 0, 1);
          const easeHand = 1 - Math.pow(1 - handProgress, 3);
          const handX = DF.lerp(W * 0.82, puppyX + 75, easeHand);
          const handY = DF.lerp(H * 0.48, puppyY - 20, easeHand);
          const handAngle = DF.lerp(-0.25, -0.42, easeHand);

          TP.drawAmuHand(ctx, handX, handY, handAngle);

          // 掌心微光与暖意
          if (D && D.glow) {
            D.glow(ctx, handX - 10, handY + 10, 85, "rgba(255, 215, 140, 0.35)");
          }
        }

      } else {
        // ========== 后半段 (9.0 - 18.0s)：成年大发与头顶金黄银杏叶 ==========
        const act2Lt = lt - 9.0;

        // 1. 暖琥珀色书房温馨背景
        ST.backdrop(ctx, "scene_10", act2Lt, { dur: 9.0, zoom0: 1.0, zoom1: 1.04, dim: 0.2, fallbackTop: "#2d2015" });

        // 2. 室内微风吹拂银杏叶
        if (D && D.ginkgo) {
          D.ginkgo(ctx, act2Lt, { count: 6, swirl: 0.25 });
        }

        // 3. 真实贴图成年大发 (stay_still 顶叶定格)
        const dafaScale = 1.15;
        const dafaX = W * 0.48;
        const dafaY = H * 0.73;

        if (TP) {
          TP.drawDafaPuppet(ctx, dafaX, dafaY, dafaScale, 1, act2Lt, "stay_still");
        }

        // 4. 真实银杏叶贴图自右上空飘落并定格头顶
        let leafX = dafaX + 75;
        let leafY = dafaY - 150;
        let leafAngle = 0.2;

        if (act2Lt < 2.0) {
          const p = act2Lt / 2.0;
          leafX = DF.lerp(dafaX + 220, dafaX + 75, p) + Math.sin(p * Math.PI * 4) * 20;
          leafY = DF.lerp(H * 0.28, dafaY - 150, Math.pow(p, 1.4));
          leafAngle = Math.sin(p * Math.PI * 5) * 0.5;
        } else {
          leafY += Math.sin(act2Lt * 1.5) * 1.2;
          leafAngle = 0.15 + Math.cos(act2Lt * 1.5) * 0.03;
        }

        if (TP) {
          TP.drawGinkgo(ctx, leafX, leafY, 1.3, leafAngle);
        }

        // 金叶光晕
        if (D && D.glow) {
          D.glow(ctx, leafX, leafY, 55, "rgba(255, 215, 0, 0.4)");
        }
      }
    }
  };
})();
