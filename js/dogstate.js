/**
 * 《大发归家路》折耳大发皮影关节骨架与 28 种纯函数状态机 (Dog State Solver)
 * 对应 director_master_plan.md §3 与 RIGSPEC.md
 * 
 * 铁律 R2：大发默认外形属性 ears: 'soft_fold'（柔和折耳/垂耳），严禁尖立耳！与 SCENE 05/08/11 一致！
 * 提供 pose(jointTree, phi, t, opt) 纯函数接口，支持任意进度拖拽寻道（seekable），零副作用。
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DF = root.DF || {};
    root.DF.DOG_STATE = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TAU = Math.PI * 2;
  const DEG2RAD = Math.PI / 180;

  // 全局唯一大发形象规范契约（R2 强制）
  const DafaAvatar = {
    coat: 'white_curl',            // 白色微卷毛
    ears: 'soft_fold',             // 柔和折耳/垂耳（默认形态，铁律 R2）
    earFoldAngle: 0.65,            // 折耳垂下基准弧度 (~37度)
    earMode: {
      ACT03: 'perk',               // 狂欢迎门立耳
      ACT04: 'perk_startle',       // 婴儿床横穿惊觉瞬间立耳
      ACT09: 'perk_alert',         // 车灯逼近炸起立耳
      ACT17: 'fold_listen',        // 楼道守候柔和折耳听声
      ACT18: 'perk_burst'          // 狂喜重逢门开瞬间立耳
    },
    tail: 'carrot_vertical',       // 胡萝卜竖尾
    harness: 'red_black_bear',     // 红黑胸背带 + 小熊
    sizeAnchor: 'SHOULDER_HEIGHT = 1.0'
  };

  /**
   * 基础静止基准姿势（Base Rest Pose）
   * 默认前腿自然立直、后腿微屈、耳朵为柔和折耳
   */
  function createBasePose() {
    return {
      // 躯干根节点位移与俯仰 (Pelvis)
      bodyX: 0,
      bodyY: 0,
      bodyPitch: 0,
      torsoPitch: 0,
      chestBreathing: 1.0,         // 胸廓膨胀比例
      spine1: 0,
      spine2: 0,

      // 颈与头部
      neck: -0.06,
      head: 0.02,
      headRoll: 0,                 // 歪头角度
      noseDelta: 0,
      eyeOpen: 1.0,                // 睁眼比例 (0:闭眼, 1:全睁)
      eyeOffsetX: 0,
      eyeOffsetY: 0,
      eyeU: 0,                     // 眼球上瞅 (0/1)

      // 耳朵 (近侧与远侧) - 默认柔和折耳 (soft_fold)
      earType: 'soft_fold',
      earN: 0.62,                  // 近侧耳折下
      earF: 0.55,                  // 远侧耳折下

      // 舌头
      tongueOut: 0,                // 舌头探出程度 (0~1)

      // 前腿（大腿 upper -> 小腿 fore -> 爪 paw）
      flNu: 0.05, flNf: -0.02, flNp: 0,
      flFu: -0.05, flFf: 0.04, flFp: 0,

      // 后腿（大腿 femur -> 小腿 tibia -> 爪 paw）
      blNu: -0.05, blNf: 0.04, blNp: 0,
      blFu: 0.04, blFf: -0.05, blFp: 0,

      // 尾巴三节与运动模糊
      tail: [0.18, 0.10, 0.06],
      tailBlur: false,

      // 头顶银杏叶
      hasLeaf: false,
      leaf: { a: 0, x: 0, y: 0 },

      // 震颤与额外位移
      shiver: 0,
      legStuck: 0
    };
  }

  // -------------------------------------------------------------
  // 28 种纯函数状态机实现
  // -------------------------------------------------------------

  /** 01. curl_shiver: 纸箱发抖 (幼犬抗拍频双频叠加) */
  function poseCurlShiver(t, opt) {
    const p = createBasePose();
    const f1 = 21.0, f2 = 17.3;
    const shiverX = 0.015 * (0.6 * Math.sin(TAU * f1 * t) + 0.4 * Math.sin(TAU * f2 * t));
    const br = Math.sin(TAU * 0.45 * t);

    p.bodyX = shiverX * 120;
    p.bodyY = 12 + br * 1.5;
    p.bodyPitch = 0.18;
    p.torsoPitch = 0.16;
    p.shiver = shiverX * 90;

    // 蜷缩四肢
    p.neck = 0.32;
    p.head = 0.28;
    p.earN = 0.72; p.earF = 0.65; // 紧贴头皮
    p.eyeOpen = 0.35 + Math.sin(t * 3) * 0.15;

    p.flNu = -0.42; p.flNf = 0.75; p.flNp = -0.3;
    p.flFu = -0.38; p.flFf = 0.70; p.flFp = -0.3;
    p.blNu = 0.55; p.blNf = -0.65; p.blNp = 0.25;
    p.blFu = 0.50; p.blFf = -0.60; p.blFp = 0.25;

    p.tail = [-0.65, -0.4, -0.2]; // 夹在胯下
    return p;
  }

  /** 02. neck_relax: 落下巴受抚、闭眼、颈部下沉 */
  function poseNeckRelax(t, opt) {
    const p = createBasePose();
    p.bodyY = 10;
    p.neck = 0.35;
    p.head = 0.32;
    p.eyeOpen = Math.max(0, 0.3 - (t * 0.1 % 1));
    p.earN = 0.78; p.earF = 0.70;
    p.flNu = -0.35; p.flNf = 0.65;
    p.flFu = -0.30; p.flFf = 0.60;
    p.blNu = 0.50; p.blNf = -0.60;
    p.blFu = 0.45; p.blFf = -0.55;
    p.tail = [-0.3, -0.15, 0.05];
    return p;
  }

  /** 03. stay_still: 顶叶绝对静止，仅 0.25Hz 呼吸，眼球上翻，尾尖 2Hz 轻颤 */
  function poseStayStill(t, opt) {
    const p = createBasePose();
    const br = Math.sin(TAU * 0.25 * t);
    p.bodyY = br * 1.5;
    p.torsoPitch = br * 0.005;
    p.neck = -0.06;
    p.head = 0.02 + Math.sin(TAU * 0.25 * t + 0.6) * 0.008;

    p.eyeU = 1;
    p.eyeOffsetY = -0.009 * 100; // 上翻
    p.eyeOpen = 1.0;

    // 默认折耳微动
    p.earN = 0.58 + Math.sin(t * 1.8) * 0.02;
    p.earF = 0.52 + Math.sin(t * 1.5 + 1) * 0.02;

    p.tail = [0.22, 0.12, 0.06 + 0.03 * Math.sin(TAU * 2.0 * t)];

    p.hasLeaf = true;
    p.leaf = {
      a: Math.sin(t * 1.6) * 0.08,
      x: Math.sin(t * 1.1) * 1.5,
      y: Math.sin(t * 1.9) * 1.2
    };
    return p;
  }

  /** 04. propeller_wag: 迎门狂暴螺旋桨摇尾 (8.5~10Hz 圆锥轨迹) */
  function posePropellerWag(t, opt) {
    const p = createBasePose();
    const freq = (opt && opt.freq) || 8.5;
    const omega = TAU * freq;
    const alpha = 0.75, r = 0.35;

    // 尾部三维圆锥圆周轨迹投影
    const tWag = alpha * Math.sin(omega * t) - 0.15;
    const tVert = r * Math.cos(omega * t);

    p.tail = [tWag, 0.35 * Math.sin(omega * t - 0.7), 0.25 * Math.sin(omega * t - 1.4)];
    p.tailBlur = true;

    // 臀部共振反传脊柱
    p.bodyPitch = 0.055 * Math.sin(omega * t - 0.35);
    p.bodyY = -Math.abs(Math.sin(TAU * 3.0 * t)) * 4;

    // 前爪 3Hz 踏碎步
    const pawStep = TAU * 3.0 * t;
    p.flNu = 0.04 + Math.sin(pawStep) * 0.18;
    p.flNf = -0.02 + Math.max(0, Math.sin(pawStep)) * 0.22;
    p.flFu = -0.04 - Math.sin(pawStep) * 0.18;
    p.flFf = 0.02 + Math.max(0, -Math.sin(pawStep)) * 0.22;

    p.neck = -0.18 + Math.sin(t * 5.0) * 0.05;
    p.head = 0.12 + Math.sin(t * 6.5) * 0.06;

    // ACT03/ACT18 特殊立耳冲刺
    if (opt && opt.perkEar) {
      p.earType = 'perk';
      p.earN = -0.15 + Math.sin(omega * t) * 0.08;
      p.earF = -0.22 + Math.cos(omega * t) * 0.08;
    } else {
      p.earN = 0.45 + Math.sin(omega * t) * 0.08;
      p.earF = 0.38 + Math.cos(omega * t) * 0.08;
    }
    return p;
  }

  /** 05. roll_over: 仰卧四脚朝天轻蹬 */
  function poseRollOver(t, opt) {
    const p = createBasePose();
    p.bodyPitch = Math.PI * 0.95;
    p.bodyY = 16;
    p.neck = 0.2;
    p.head = 0.3;
    p.earN = 0.85; p.earF = 0.80; // 摊在地面

    const kick = TAU * 1.2 * t;
    p.flNu = 0.2 + Math.sin(kick) * 0.25;
    p.flFu = 0.2 - Math.sin(kick) * 0.25;
    p.blNu = -0.3 + Math.cos(kick) * 0.3;
    p.blFu = -0.3 - Math.cos(kick) * 0.3;

    p.tail = [0.4 + Math.sin(t * 4) * 0.3, 0.2, 0.1];
    return p;
  }

  /** 06. chin_rest: 下巴枕脚背 */
  function poseChinRest(t, opt) {
    const p = createBasePose();
    p.bodyY = -0.10 * 100;
    p.neck = 0.45;
    p.head = 0.42;
    p.eyeU = 1;
    p.earN = 0.65; p.earF = 0.58;

    p.flNu = -0.55; p.flNf = 0.68;
    p.flFu = -0.50; p.flFf = 0.62;
    p.blNu = 0.45; p.blNf = -0.55;
    p.blFu = 0.40; p.blFf = -0.50;

    p.tail = [0.15, 0.08, 0.04];
    return p;
  }

  /** 07. startle: 惊觉竖耳，后退半步 */
  function poseStartle(t, opt) {
    const p = createBasePose();
    p.bodyX = -0.06 * 100; // 后退
    p.bodyY = -3;
    p.neck = -0.25;
    p.head = -0.12;
    p.earType = 'perk';
    p.earN = -38 * DEG2RAD; // 炸起立耳
    p.earF = -42 * DEG2RAD;

    p.flNu = 0.22; p.flNf = -0.15;
    p.flFu = 0.18; p.flFf = -0.12;
    p.blNu = -0.28; p.blNf = 0.32;
    p.blFu = -0.24; p.blFf = 0.28;

    p.tail = [0.65, 0.3, 0.1];
    return p;
  }

  /** 08. head_tilt: 歪头 18 度思考 */
  function poseHeadTilt(t, opt) {
    const p = createBasePose();
    const deg = (opt && opt.angle) || 18.0;
    p.headRoll = deg * DEG2RAD;
    p.neck = -0.15;
    p.head = 0.08;
    p.earType = 'perk_startle';
    p.earN = -20 * DEG2RAD;
    p.earF = -28 * DEG2RAD;

    p.flNu = 0.08; p.flNf = -0.05;
    p.flFu = -0.02; p.flFf = 0.03;
    p.blNu = -0.12; p.blNf = 0.15;
    p.blFu = 0.05; p.blFf = -0.08;

    p.tail = [0.35, 0.18, 0.08];
    return p;
  }

  /** 09. sit_back: 背对坐 (ACT 05/08 阳台/水盆垂耳背影) */
  function poseSitBack(t, opt) {
    const p = createBasePose();
    p.bodyY = 14;
    p.bodyPitch = -0.08;
    p.neck = 0.12;
    p.head = -0.05;

    // 严格折耳
    p.earType = 'soft_fold';
    p.earN = 0.68;
    p.earF = 0.62;

    // 坐姿关节折叠
    p.flNu = 0.02; p.flNf = -0.02;
    p.flFu = -0.02; p.flFf = 0.02;
    p.blNu = 1.35; p.blNf = -2.1;
    p.blFu = 1.30; p.blFf = -2.05;

    p.tail = [0.9, 0.4, 0.2]; // 尾巴完全夹紧
    return p;
  }

  /** 10. breathe_out: 周期性呼气成雾 */
  function poseBreatheOut(t, opt) {
    const p = poseSitBack(t, opt);
    const cycle = (t % 4.2) / 4.2;
    p.chestBreathing = 1.0 + Math.sin(cycle * Math.PI) * 0.08;
    return p;
  }

  /** 11. sit_lick: 坐姿舔发冷手指 (舌 1.8Hz 触伸) */
  function poseSitLick(t, opt) {
    const p = createBasePose();
    p.bodyY = 8;
    p.neck = 0.18;
    p.head = 0.14;
    p.earType = 'soft_fold';
    p.earN = 0.64; p.earF = 0.58;

    const lick = Math.sin(TAU * 1.8 * t);
    p.tongueOut = Math.max(0, lick);

    p.flNu = 0.05; p.flNf = 0.02;
    p.flFu = -0.02; p.flFf = 0.04;
    p.blNu = 1.15; p.blNf = -1.8;
    p.blFu = 1.10; p.blFf = -1.75;

    p.tail = [0.25 + Math.sin(t * 3.6) * 0.1, 0.12, 0.05];
    return p;
  }

  /** 12. stare: 凝望尾灯远去 (身体锁定仅眼动) */
  function poseStare(t, opt) {
    const p = createBasePose();
    p.neck = -0.10;
    p.head = 0.02;
    p.earType = 'soft_fold';
    p.earN = 0.60; p.earF = 0.54;

    p.eyeOffsetX = Math.sin(t * 0.4) * 0.006 * 100;
    p.eyeOffsetY = 0;

    p.blNu = 1.1; p.blNf = -1.6;
    p.blFu = 1.05; p.blFf = -1.55;
    p.tail = [0.08, 0.02, 0.0];
    return p;
  }

  /** 13. sit_back_dark: 寒夜水盆前孤独静坐背影 */
  function poseSitBackDark(t, opt) {
    const p = poseSitBack(t, opt);
    p.tail = [0.95, 0.45, 0.25]; // 尾完全夹紧 0 振幅
    p.earN = 0.72; p.earF = 0.68;
    return p;
  }

  /** 14. alert: 车灯逼近炸毛警觉 */
  function poseAlert(t, opt) {
    const p = createBasePose();
    p.neck = -0.32;
    p.head = -0.18;
    p.earType = 'perk';
    p.earN = -35 * DEG2RAD;
    p.earF = -40 * DEG2RAD;

    p.eyeOpen = 1.4; // 瞳孔放大
    p.flNu = 0.25; p.flNf = -0.18;
    p.flFu = 0.22; p.flFf = -0.15;
    p.blNu = -0.35; p.blNf = 0.45;
    p.blFu = -0.30; p.blFf = 0.40;

    p.tail = [0.85, 0.4, 0.2];
    return p;
  }

  /** 15. lunge: 拼死前扑拉断麻绳 */
  function poseLunge(t, opt) {
    const p = createBasePose();
    p.bodyX = 18;
    p.bodyY = -6;
    p.bodyPitch = 0.28;
    p.spine1 = 0.28;
    p.spine2 = 0.22;

    p.neck = -0.35;
    p.head = 0.15;
    p.earType = 'perk';
    p.earN = -45 * DEG2RAD;
    p.earF = -50 * DEG2RAD;

    // 前腿向前全力蹬出，后腿全力蹬地
    p.flNu = 1.15; p.flNf = -0.35; p.flNp = 0.4;
    p.flFu = 1.05; p.flFf = -0.30; p.flFp = 0.35;
    p.blNu = -0.85; p.blNf = 0.95; p.blNp = -0.4;
    p.blFu = -0.80; p.blFf = 0.90; p.blFp = -0.35;

    p.tail = [0.95, 0.5, 0.25];
    return p;
  }

  /** 16. break_free: 挣脱断裂瞬间 0.6s 死寂腾空 */
  function poseBreakFree(t, opt) {
    const p = createBasePose();
    p.bodyX = 28;
    p.bodyY = -16;
    p.bodyPitch = 0.32;

    p.neck = -0.22; p.head = 0.08;
    p.earType = 'perk';
    p.earN = -30 * DEG2RAD; p.earF = -35 * DEG2RAD;

    p.flNu = 0.85; p.flNf = -0.45;
    p.flFu = 0.75; p.flFf = -0.40;
    p.blNu = -0.92; p.blNf = 0.65;
    p.blFu = -0.88; p.blFf = 0.60;

    p.tail = [1.1, 0.55, 0.3];
    return p;
  }

  /** 17. gallop: 荒原急奔 (4.5Hz / 5.2Hz 步频) */
  function poseGallop(t, opt) {
    const p = createBasePose();
    const freq = (opt && opt.freq) || 4.5;
    const ph = ((t * freq) % 1) * TAU;
    const s = Math.sin(ph), c = Math.cos(ph);

    // 脊柱弹性屈伸
    p.spine1 = 0.16 * Math.cos(ph + 0.15 * Math.PI);
    p.bodyPitch = 0.16 + c * 0.05;

    // 悬空相判定
    const cyclePhase = (t * freq) % 1;
    if (cyclePhase >= 0.62 && cyclePhase <= 0.92) {
      const sPhase = (cyclePhase - 0.62) / 0.30;
      p.bodyY = -0.075 * 100 * Math.sin(Math.PI * sPhase);
    } else {
      p.bodyY = -Math.abs(s) * 7 + 2;
    }

    p.neck = -0.16 + s * 0.06;
    p.head = 0.10 - s * 0.05;

    // 默认折耳受风后掠
    p.earType = 'soft_fold';
    p.earN = 0.72 + s * 0.14;
    p.earF = 0.65 + Math.sin(ph + 0.4) * 0.14;

    // 对角奔同步态
    p.flNu = s * 0.95;
    p.flNf = -Math.max(0, -s) * 0.55 + 0.12;
    p.flFu = Math.sin(ph + Math.PI - 0.5) * 0.9;
    p.flFf = -Math.max(0, -Math.sin(ph + Math.PI - 0.5)) * 0.5 + 0.1;

    p.blNu = Math.sin(ph + Math.PI * 0.62) * 0.95;
    p.blNf = -Math.max(0, -Math.sin(ph + Math.PI * 0.62)) * 0.7 + 0.1;
    p.blFu = Math.sin(ph - 0.55) * 0.9;
    p.blFf = -Math.max(0, -Math.sin(ph - 0.55)) * 0.65 + 0.1;

    p.tail = [0.95 + Math.sin(ph * 2) * 0.25, 0.35 + Math.sin(ph * 2 - 0.6) * 0.3, 0.2];
    return p;
  }

  /** 18. stuck: 陷进深泥艰难拔爪 (躯干前倾 + 后腿蹬地) */
  function poseStuck(t, opt) {
    const p = createBasePose();
    p.bodyPitch = 0.20;
    p.bodyY = 12;
    p.neck = 0.25;
    p.head = -0.15;
    p.earType = 'soft_fold';
    p.earN = 0.68; p.earF = 0.62;

    const pull = Math.sin(t * 3.5);
    p.flNu = 0.15 + pull * 0.35;
    p.flNf = 0.45;
    p.flFu = -0.15;
    p.flFf = 0.65;

    p.blNu = -0.65; p.blNf = 0.85; // 后腿全力蹬地
    p.blFu = -0.60; p.blFf = 0.80;

    p.legStuck = 1;
    p.tail = [0.4, 0.2, 0.05];
    return p;
  }

  /** 19. walk_tired: 芦苇荡疲惫跋涉 (0.7x 步频，躯干左右摆) */
  function poseWalkTired(t, opt) {
    const p = createBasePose();
    const ph = ((t * 1.8) % 1) * TAU;
    const s = Math.sin(ph);

    p.bodyX = s * 0.04 * 100;
    p.bodyPitch = 0.08 + Math.cos(ph) * 0.03;
    p.bodyY = 4 + Math.abs(s) * 3;

    p.neck = 0.22 + s * 0.04;
    p.head = 0.18;
    p.earType = 'soft_fold';
    p.earN = 0.75 + s * 0.05;
    p.earF = 0.70 - s * 0.05;

    p.flNu = s * 0.45; p.flNf = -Math.max(0, -s) * 0.3;
    p.flFu = -s * 0.45; p.flFf = -Math.max(0, s) * 0.3;
    p.blNu = -s * 0.45; p.blNf = Math.max(0, -s) * 0.35;
    p.blFu = s * 0.45; p.blFf = Math.max(0, s) * 0.35;

    p.tail = [0.15, 0.05, -0.05];
    return p;
  }

  /** 20. sprint_stop: 冲向车灯落空急刹 (惯性前冲 0.3s) */
  function poseSprintStop(t, opt) {
    const p = createBasePose();
    p.bodyPitch = -0.25; // 身体后仰急停
    p.bodyX = 14;
    p.bodyY = 2;

    p.neck = -0.15; p.head = -0.10;
    p.earType = 'soft_fold';
    p.earN = 0.62; p.earF = 0.55;

    // 前腿向前硬顶地面，后腿深屈
    p.flNu = 0.85; p.flNf = -0.12; p.flNp = -0.25;
    p.flFu = 0.80; p.flFf = -0.10; p.flFp = -0.25;
    p.blNu = 0.95; p.blNf = -1.35;
    p.blFu = 0.90; p.blFf = -1.30;

    p.tail = [0.2, 0.1, -0.15]; // 急剧垂落夹紧
    return p;
  }

  /** 21. sit_collapse: 力竭瘫坐泥泞 (后腿发软，头低垂) */
  function poseSitCollapse(t, opt) {
    const p = createBasePose();
    p.bodyY = 16;
    p.bodyPitch = 0.06;
    p.neck = 0.38;
    p.head = 0.32;
    p.earType = 'soft_fold';
    p.earN = 0.78; p.earF = 0.72;
    p.eyeOpen = 0.4;

    p.flNu = -0.25; p.flNf = 0.45;
    p.flFu = -0.20; p.flFf = 0.40;
    p.blNu = 1.45; p.blNf = -2.25;
    p.blFu = 1.40; p.blFf = -2.20;

    p.tail = [0.92, 0.4, 0.2];
    return p;
  }

  /** 22. fall_slide: 失足滑落沟渠 (重力加速度) */
  function poseFallSlide(t, opt) {
    const p = createBasePose();
    p.bodyPitch = -0.42;
    p.bodyY = 18;
    p.neck = -0.2;
    p.head = 0.25;
    p.earType = 'soft_fold';
    p.earN = 0.55; p.earF = 0.50;

    p.flNu = 0.65; p.flNf = -0.25;
    p.flFu = 0.55; p.flFf = -0.20;
    p.blNu = 0.45; p.blNf = -0.65;
    p.blFu = 0.35; p.blFf = -0.60;

    p.tail = [0.75, 0.3, 0.1];
    return p;
  }

  /** 23. lie: 侧卧泥沟 */
  function poseLie(t, opt) {
    const p = createBasePose();
    p.bodyPitch = Math.PI * 0.5; // 侧躺
    p.bodyY = 24;
    p.neck = 0.3;
    p.head = 0.2;
    p.earType = 'soft_fold';
    p.earN = 0.82; p.earF = 0.75;
    p.eyeOpen = 0.25;

    p.flNu = -0.45; p.flNf = 0.85;
    p.flFu = -0.40; p.flFf = 0.80;
    p.blNu = 0.65; p.blNf = -0.95;
    p.blFu = 0.60; p.blFf = -0.90;

    p.tail = [0.1, 0.05, 0.0];
    return p;
  }

  /** 24. deep_inhale: 鼻埋污泥中长吸一口气 (胸廓 overshoot 1.10) */
  function poseDeepInhale(t, opt) {
    const p = poseLie(t, opt);
    const progress = Math.min(1.0, (t % 3.0) / 1.4);
    // 缓吸并超调
    let scale = 1.0;
    if (progress < 0.8) {
      scale = 1.0 + 0.10 * (progress / 0.8);
    } else {
      scale = 1.10 - 0.02 * ((progress - 0.8) / 0.2);
    }
    p.chestBreathing = scale;
    p.noseDelta = Math.sin(t * 12.0) * 0.045;
    return p;
  }

  /** 25. rise_struggle: 泥沟中奋力挣扎站起 */
  function poseRiseStruggle(t, opt) {
    const p = createBasePose();
    p.bodyPitch = 0.15;
    p.bodyY = 12 + Math.sin(t * 8.0) * 2; // 膝关节抖动

    p.neck = -0.15;
    p.head = -0.05;
    p.earType = 'soft_fold';
    p.earN = 0.65; p.earF = 0.58;

    p.flNu = -0.15 + Math.sin(t * 6) * 0.25;
    p.flNf = 0.45;
    p.flFu = 0.15 - Math.sin(t * 6) * 0.25;
    p.flFf = 0.40;

    p.blNu = -0.4; p.blNf = 0.75;
    p.blFu = -0.35; p.blFf = 0.70;

    p.tail = [0.45, 0.2, 0.08];
    return p;
  }

  /** 26. focus: 凝望远处树梢布条，瞳孔聚光 */
  function poseFocus(t, opt) {
    const p = createBasePose();
    p.neck = -0.28;
    p.head = -0.12;
    p.earType = 'soft_fold';
    p.earN = 0.52; p.earF = 0.46; // 折耳微抬听风

    p.eyeOpen = 1.25;
    p.eyeOffsetY = -0.005 * 100;

    p.tail = [0.45, 0.25, 0.1];
    return p;
  }

  /** 27. limping_walk: 历经磨难的一瘸一拐步态 (左右步幅差 1.0 : 0.55) */
  function poseLimpingWalk(t, opt) {
    const p = createBasePose();
    const ph = ((t * 1.9) % 1) * TAU;
    const s = Math.sin(ph);

    // 跛行明显左右颠簸
    p.bodyY = 3 + Math.sin(ph) * 5;
    p.bodyPitch = 0.04 + Math.sin(ph) * 0.08;

    p.neck = 0.08 + Math.sin(ph) * 0.06;
    p.head = 0.12 - Math.sin(ph) * 0.04;
    p.earType = 'fold_listen';
    p.earN = 0.68; p.earF = 0.60;

    // 前腿非对称步伐
    p.flNu = s * 0.75;            // 健侧大步
    p.flNf = -Math.max(0, -s) * 0.4;
    p.flFu = -s * (0.75 * 0.55);   // 患侧仅 55% 步幅
    p.flFf = -Math.max(0, s) * 0.25;

    p.blNu = -s * 0.65;
    p.blFu = s * (0.65 * 0.55);

    p.tail = [0.25 + Math.sin(ph) * 0.12, 0.1, 0.0];
    return p;
  }

  /** 28. sit_wait: 门垫前安详守候、慢眨眼 (slow_blink 1.2s) */
  function poseSitWait(t, opt) {
    const p = poseSitBack(t, opt);
    p.neck = 0.02;
    p.head = -0.08; // 微仰头听声
    p.earType = 'fold_listen';
    p.earN = 0.58; p.earF = 0.52;

    // 1.2s 慢眨眼周期
    const blinkCycle = (t % 3.6) / 1.2;
    if (blinkCycle <= 1.0) {
      // 0 -> 1 -> 0 曲线
      p.eyeOpen = Math.abs(Math.sin(blinkCycle * Math.PI - Math.PI * 0.5));
    } else {
      p.eyeOpen = 1.0;
    }

    p.tail = [0.35, 0.15, 0.05];
    return p;
  }

  // -------------------------------------------------------------
  // 状态机字典与别名映射 (兼容原有与扩展)
  // -------------------------------------------------------------
  const STATE_MAP = {
    // 28 种核心纯函数状态
    curl_shiver: poseCurlShiver,
    neck_relax: poseNeckRelax,
    stay_still: poseStayStill,
    propeller_wag: posePropellerWag,
    roll_over: poseRollOver,
    chin_rest: poseChinRest,
    startle: poseStartle,
    head_tilt: poseHeadTilt,
    sit_back: poseSitBack,
    breathe_out: poseBreatheOut,
    sit_lick: poseSitLick,
    stare: poseStare,
    sit_back_dark: poseSitBackDark,
    alert: poseAlert,
    lunge: poseLunge,
    break_free: poseBreakFree,
    gallop: poseGallop,
    stuck: poseStuck,
    walk_tired: poseWalkTired,
    sprint_stop: poseSprintStop,
    sit_collapse: poseSitCollapse,
    fall_slide: poseFallSlide,
    lie: poseLie,
    deep_inhale: poseDeepInhale,
    rise_struggle: poseRiseStruggle,
    focus: poseFocus,
    limping_walk: poseLimpingWalk,
    sit_wait: poseSitWait,

    // 补充常用别名与基础状态
    trot: function (t, opt) {
      return poseGallop(t, Object.assign({ freq: 2.6 }, opt));
    },
    wag: function (t, opt) {
      return posePropellerWag(t, Object.assign({ freq: 4.5 }, opt));
    },
    sniff: function (t, opt) {
      const p = createBasePose();
      p.bodyPitch = -0.18;
      p.bodyY = -4;
      p.neck = -0.30;
      p.head = -0.16;
      p.noseDelta = Math.sin(t * 11.5) * 0.045;
      p.earN = 0.56; p.earF = 0.50;
      return p;
    },
    brake: function (t, opt) {
      return poseSprintStop(t, opt);
    },
    slow_blink: function (t, opt) {
      return poseSitWait(t, opt);
    },
    pure_dark_cut: function (t, opt) {
      return createBasePose();
    }
  };

  /**
   * pose(jointTree, phi, t, opt): 纯函数统一计算接口
   * @param {Object} jointTree 外部传入或 null 的骨架树/部件
   * @param {Number} phi 相位 (0~1)
   * @param {Number} t 绝对时间秒
   * @param {Object} opt 选项 (stateName, perkEar, leaf, 等)
   * @returns {Object} 完整计算后的姿态数据
   */
  function pose(jointTree, phi, t, opt) {
    const o = opt || {};
    const stateName = o.stateName || 'stay_still';
    const solver = STATE_MAP[stateName] || STATE_MAP.stay_still;
    const computed = solver(t, o);

    // 铁律 R2 形象强制约束注入
    if (computed.earType !== 'perk' && computed.earType !== 'perk_startle') {
      computed.avatarCoat = DafaAvatar.coat;
      computed.avatarEars = DafaAvatar.ears;
    }

    if (jointTree && typeof jointTree === 'object') {
      return Object.assign({}, jointTree, computed);
    }
    return computed;
  }

  return {
    DafaAvatar: DafaAvatar,
    STATE_COUNT: Object.keys(STATE_MAP).length,
    STATE_NAMES: Object.keys(STATE_MAP),
    STATES: STATE_MAP,
    createBasePose: createBasePose,
    pose: pose
  };
});
