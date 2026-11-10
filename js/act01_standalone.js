/* 《大发回家》 第一幕专属高精度微电影演绎 (Act 1 Director's Cut)
   - 包含两大子幕：
     1. 【纸箱 · 寒雨之遇】：青灰暴雨、纸箱纤维、幼犬瑟瑟发抖(curl_shiver)、阿沐温暖手掌入画接住幼犬
     2. 【叶冠 · 信任仪式】：雪白圆头、一片金黄银杏叶悠悠飘落顶在头上、全身定住一动不动(stay_still)、Celesta钢片琴G5主旋律
*/
(function () {
  const DF = window.DF || (window.DF = {});
  const { W, H } = DF;
  const D = DF.D;
  const CP = DF.cutout;
  const ST = DF.stage;

  DF.act01_standalone = {
    id: "act01_full",
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
        // 1. 舞台背景 (雨夜小巷/纸箱)
        ST.backdrop(ctx, "scene_06", lt, { dur: 9.0, zoom0: 1.02, zoom1: 1.06, dim: 0.35, fallbackTop: "#121824" });

        // 2. 真实物理暴雨与迷雾
        if (D && D.rain) {
          D.rain(ctx, lt, { intensity: 0.8, wind: 0.25, fog: 0.35 });
        }

        // 3. 幼犬蜷缩发抖 (curl_shiver 状态机)
        const puppyScale = 0.72;
        const puppyX = W * 0.48;
        const puppyY = H * 0.68;
        
        // 幼犬颤抖与呼吸 (两组频率抗拍频)
        const shiver = (Math.sin(lt * 21.0 * Math.PI * 2) * 0.6 + Math.sin(lt * 17.3 * Math.PI * 2) * 0.4) * (lt < 6.0 ? 3.5 : 1.2);
        
        ctx.save();
        ctx.translate(puppyX + shiver, puppyY);
        if (CP && CP.drawDafa) {
          // 状态：curl_shiver -> 6.5s 后 neck_relax
          const stName = lt < 6.5 ? "curl_shiver" : "neck_relax";
          CP.drawDafa(ctx, 0, 0, puppyScale, 1, lt, stName, {
            coat: "white_curl",
            ears: "soft_fold"
          });
        }
        ctx.restore();

        // 4. 阿沐的手臂与手掌温情入画 (4.5s 开始由右上方向下探入)
        if (lt >= 4.0) {
          const handProgress = DF.clamp((lt - 4.0) / 2.5, 0, 1);
          // 缓动曲线
          const easeHand = 1 - Math.pow(1 - handProgress, 3);
          const handX = DF.lerp(W * 0.75, puppyX + 45, easeHand);
          const handY = DF.lerp(H * 0.45, puppyY + 15, easeHand);

          ctx.save();
          ctx.translate(handX, handY);
          ctx.rotate(-0.35 + Math.sin(lt * 2) * 0.03);

          // 绘制手掌与衣袖
          // 衣袖 (深色风衣)
          ctx.fillStyle = "#222c38";
          ctx.beginPath();
          ctx.moveTo(-15, -120);
          ctx.lineTo(40, -110);
          ctx.lineTo(30, -35);
          ctx.lineTo(-20, -40);
          ctx.closePath();
          ctx.fill();

          // 手腕与手掌 (暖肤色)
          ctx.fillStyle = "#e0ab88";
          ctx.beginPath();
          ctx.ellipse(0, 0, 22, 14, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // 舒展的手指
          ctx.lineWidth = 9;
          ctx.lineCap = "round";
          ctx.strokeStyle = "#deb896";
          for (let f = 0; f < 4; f++) {
            ctx.beginPath();
            ctx.moveTo(-8 + f * 7, 5);
            ctx.lineTo(-14 + f * 9, 26 + Math.sin(f + lt * 2) * 2);
            ctx.stroke();
          }

          // 温暖光晕 (掌心微光)
          if (D && D.glow) {
            D.glow(ctx, 0, 10, 75, "rgba(255, 210, 140, 0.45)");
          }
          ctx.restore();
        }

      } else {
        // ========== 后半段 (9.0 - 18.0s)：成年大发与头顶金黄银杏叶 ==========
        const act2Lt = lt - 9.0;

        // 1. 暖琥珀色书房温馨背景
        ST.backdrop(ctx, "scene_10", act2Lt, { dur: 9.0, zoom0: 1.0, zoom1: 1.04, dim: 0.2, fallbackTop: "#2d2015" });

        // 2. 室内微风吹拂金黄银杏落叶
        if (D && D.ginkgo) {
          D.ginkgo(ctx, act2Lt, { count: 6, swirl: 0.25 });
        }

        // 3. 成年大发 (大比例雪白圆头，正前方偏侧定格坐立)
        const dafaScale = 1.05;
        const dafaX = W * 0.50;
        const dafaY = H * 0.72;

        ctx.save();
        ctx.translate(dafaX, dafaY);
        if (CP && CP.drawDafa) {
          // stay_still 状态：呼吸锁定在 0.25Hz，眼球努力上翻想看叶子
          CP.drawDafa(ctx, 0, 0, dafaScale, 1, act2Lt, "stay_still", {
            coat: "white_curl",
            ears: "soft_fold"
          });
        }
        ctx.restore();

        // 4. 金黄银杏叶悠悠下落与定格在头上 (9.6s ~ 11.0s 飘落，11.0s 稳稳贴在头顶)
        let leafX = dafaX;
        let leafY = dafaY - 145;
        let leafAngle = 0.15;

        if (act2Lt < 2.0) {
          // 正在从右上空飘落
          const p = act2Lt / 2.0;
          leafX = DF.lerp(dafaX + 180, dafaX, p) + Math.sin(p * Math.PI * 4) * 25;
          leafY = DF.lerp(H * 0.25, dafaY - 145, Math.pow(p, 1.4));
          leafAngle = Math.sin(p * Math.PI * 6) * 0.6;
        } else {
          // 11.0s 后落定在头顶：随着极轻微呼吸微动 (信任之约)
          leafY += Math.sin(act2Lt * 1.5) * 1.2;
          leafAngle = 0.08 + Math.cos(act2Lt * 1.5) * 0.02;
        }

        // 绘制一片精致的金黄银杏叶
        ctx.save();
        ctx.translate(leafX, leafY);
        ctx.rotate(leafAngle);
        if (CP && CP.drawGinkgo) {
          CP.drawGinkgo(ctx, 0, 0, 1.4);
        } else {
          ctx.fillStyle = "#ffcc00";
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI, true);
          ctx.fill();
        }
        // 金叶光芒辉映
        if (D && D.glow) {
          D.glow(ctx, 0, 0, 45, "rgba(255, 215, 0, 0.4)");
        }
        ctx.restore();
      }
    }
  };
})();
