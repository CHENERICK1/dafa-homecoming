/* 《大发回家》 18 幕完整皮影舞台剧场 — 分幕驱动脚本 (Scenes 18)
   对应 director_master_plan.md §1 & §2，18 幕严格 160.0 秒。
   每一幕：高清分镜底图当幕布背景，主体由 cutout 骨骼人偶与程序化天气粒子在台前表演。
*/
(function () {
  const DF = window.DF || (window.DF = {});
  const { W, H } = DF;
  const D = DF.D;
  const SP = DF.puppet;
  const CP = DF.cutout;
  const ST = DF.stage;

  const actMap = {
    "act01": "scene_06",
    "act02": "scene_10",
    "act03": "scene_08",
    "act04": "act_11",
    "act05": "scene_11",
    "act06": "scene_07",
    "act07": "scene_04",
    "act08": "act_04",
    "act09": "act_05",
    "act10": "act_08",
    "act11": "scene_01",
    "act12": "scene_02",
    "act13": "act_07",
    "act14": "scene_03",
    "act15": "scene_05",
    "act16": "act_09",
    "act17": "scene_09",
    "act18": "act_10"
  };

  DF.scenes18 = [
    {
      id: "act01",
      badge: "第 一 幕",
      title: "纸箱 · 寒雨之遇",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "那年深秋的暴雨夜，你在路旁纸箱里瑟瑟发抖。"],
        [5.0, 8.5, "一双温暖的手伸过来，将你抱入了怀中。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act01"], lt, { dur: 9.0, zoom0: 1.02, zoom1: 1.05, dim: 0.35, fallbackTop: "#1c2430" });
        if (D && D.rain) D.rain(ctx, lt, { intensity: 0.7, wind: 0.2, fog: 0.3 });
      }
    },
    {
      id: "act02",
      badge: "第 二 幕",
      title: "叶冠 · 信任之约",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "戴上金黄的银杏叶，你就成了最听话的骑士。"],
        [5.0, 8.5, "只要叶子不掉，你就会乖乖定住一动不动。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act02"], lt, { dur: 9.0, zoom0: 1.0, zoom1: 1.04, dim: 0.25, fallbackTop: "#3a2b1a" });
        if (D && D.ginkgo) D.ginkgo(ctx, lt, { count: 8, swirl: 0.3 });
      }
    },
    {
      id: "act03",
      badge: "第 三 幕",
      title: "五季 · 岁月擦拭",
      dur: 9.5,
      subs: [
        [1.0, 4.5, "春去秋来五个寒暑，暖黄的台灯下，"],
        [5.0, 9.0, "每次淋湿回家，总有大毛巾将你轻轻包裹擦干。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act03"], lt, { dur: 9.5, zoom0: 1.02, zoom1: 1.05, dim: 0.28, fallbackTop: "#342215" });
      }
    },
    {
      id: "act04",
      badge: "第 四 幕",
      title: "小床 · 守护天使",
      dur: 9.5,
      subs: [
        [1.0, 4.5, "家里迎来了新的小生命。"],
        [5.0, 9.0, "你戴着小背心，寸步不离守在婴儿床边。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act04"], lt, { dur: 9.5, zoom0: 1.0, zoom1: 1.03, dim: 0.22, fallbackTop: "#2b221a" });
      }
    },
    {
      id: "act05",
      badge: "第 五 幕",
      title: "阳光 · 新生抚摸",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "金色的晨光洒进卧室。"],
        [5.0, 8.5, "小手伸出床栏，第一次抚摸你的头顶。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act05"], lt, { dur: 9.0, zoom0: 1.02, zoom1: 1.05, dim: 0.2, fallbackTop: "#3e3220" });
      }
    },
    {
      id: "act06",
      badge: "第 六 幕",
      title: "系绳 · 温暖叮嘱",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "每次出门前，她总是细心喂你热乎的面包。"],
        [5.0, 8.5, "戴好牵引绳，轻声叮嘱你不要乱跑。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act06"], lt, { dur: 9.0, zoom0: 1.0, zoom1: 1.04, dim: 0.28, fallbackTop: "#25201b" });
      }
    },
    {
      id: "act07",
      badge: "第 七 幕",
      title: "尾灯 · 暴雨突袭",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "突如其来的雷暴打碎了宁静。"],
        [5.0, 8.5, "卡车刺眼的光柱划破夜空，雷鸣轰顶。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act07"], lt, { dur: 9.0, zoom0: 1.03, zoom1: 1.07, dim: 0.38, fallbackTop: "#151822" });
        if (D && D.rain) D.rain(ctx, lt, { intensity: 0.9, wind: 0.4, headlights: true });
      }
    },
    {
      id: "act08",
      badge: "第 八 幕",
      title: "水洼 · 慌乱狂奔",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "受到惊吓的你挣脱绳索，冲入泥泞的十字路口。"],
        [5.0, 8.5, "四周是无尽的雨水与茫然四顾的高墙。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act08"], lt, { dur: 9.0, zoom0: 1.02, zoom1: 1.06, dim: 0.4, fallbackTop: "#121720" });
        if (D && D.rain) D.rain(ctx, lt, { intensity: 0.85, wind: 0.3 });
      }
    },
    {
      id: "act09",
      badge: "第 九 幕",
      title: "断绳 · 荒野觉醒",
      dur: 10.0,
      subs: [
        [1.0, 4.5, "断绳还在脖颈，身上的雨水泥水飞溅。"],
        [5.0, 9.5, "甩落枯草与寒风，你望向远方，必须找到回家的路。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act09"], lt, { dur: 10.0, zoom0: 1.0, zoom1: 1.05, dim: 0.32, fallbackTop: "#1a1f18" });
        if (D && D.wind) D.wind(ctx, lt, { speed: 0.5 });
      }
    },
    {
      id: "act10",
      badge: "第 十 幕",
      title: "泥泞 · 水渠辨息",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "两米深的水泥深沟里，积水浸透四爪。"],
        [5.0, 8.5, "你高高仰起头，逆风捕捉空气中极其微弱的气味。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act10"], lt, { dur: 9.0, zoom0: 1.02, zoom1: 1.06, dim: 0.35, fallbackTop: "#1c2226" });
      }
    },
    {
      id: "act11",
      badge: "第 十 一 幕",
      title: "信标 · 铁网寻踪",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "另一边，家人在铁皮围墙上贴满了寻犬启事。"],
        [5.0, 8.5, "墙角系着带熟悉气味的深蓝牛仔布条。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act11"], lt, { dur: 9.0, zoom0: 1.01, zoom1: 1.04, dim: 0.3, fallbackTop: "#202632" });
        if (D && D.rain) D.rain(ctx, lt, { intensity: 0.5, wind: 0.1 });
      }
    },
    {
      id: "act12",
      badge: "第 十 二 幕",
      title: "站台 · 蓝巾信物",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "每一个你可能经过的公交站亭，"],
        [5.0, 8.5, "长椅的一角都紧紧系着深蓝色的围巾信物。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act12"], lt, { dur: 9.0, zoom0: 1.02, zoom1: 1.05, dim: 0.32, fallbackTop: "#1b212c" });
      }
    },
    {
      id: "act13",
      badge: "第 十 三 幕",
      title: "剪布 · 指尖祈愿",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "台灯下，剪刀剪开一件又一件穿旧的牛仔裤。"],
        [5.0, 8.5, "将浓浓的思念与家的气味，化作沿途指引的灯塔。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act13"], lt, { dur: 9.0, zoom0: 1.0, zoom1: 1.03, dim: 0.22, fallbackTop: "#32261a" });
      }
    },
    {
      id: "act14",
      badge: "第 十 四 幕",
      title: "路灯 · 孤灯引路",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "夜雨中的古典路灯杆上，布条随风飘拂。"],
        [5.0, 8.5, "撑伞的人虽然远去，但气息久久不散。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act14"], lt, { dur: 9.0, zoom0: 1.01, zoom1: 1.05, dim: 0.35, fallbackTop: "#1e2430" });
      }
    },
    {
      id: "act15",
      badge: "第 十 五 幕",
      title: "微风 · 气味灯塔",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "你停下脚步，柔和的折耳迎风颤动。"],
        [5.0, 8.5, "那道金色的气味光痕，直直指向远方的枯树。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act15"], lt, { dur: 9.0, zoom0: 1.02, zoom1: 1.06, dim: 0.25, fallbackTop: "#302820" });
      }
    },
    {
      id: "act16",
      badge: "第 十 六 幕",
      title: "破晓 · 树杈重逢",
      dur: 9.0,
      subs: [
        [1.0, 4.5, "晨曦破晓，你拼尽全力扒上树干。"],
        [5.0, 8.5, "终于嗅到了那条深蓝布条——是家的味道！"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act16"], lt, { dur: 9.0, zoom0: 1.02, zoom1: 1.06, dim: 0.22, fallbackTop: "#403222" });
      }
    },
    {
      id: "act17",
      badge: "第 十 七 幕",
      title: "门外 · 归家等待",
      dur: 8.0,
      subs: [
        [1.0, 4.0, "熟悉的地垫，门把手上熟悉的深蓝布条。"],
        [4.5, 7.5, "你乖乖端坐在门口，静静等待门开的那一刻。"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act17"], lt, { dur: 8.0, zoom0: 1.0, zoom1: 1.03, dim: 0.2, fallbackTop: "#282420" });
      }
    },
    {
      id: "act18",
      badge: "第 十 八 幕",
      title: "归家 · 门锁转动",
      dur: 6.0,
      subs: [
        [0.5, 3.0, "咔哒——门锁转动，暖光倾泻。"],
        [3.5, 5.5, "“大发，欢迎回家。”"]
      ],
      draw: function (ctx, lt) {
        ST.backdrop(ctx, actMap["act18"], lt, { dur: 6.0, zoom0: 1.01, zoom1: 1.04, dim: 0.18, fallbackTop: "#352b22" });
      }
    }
  ];

  DF.scenes = DF.scenes18;
})();
