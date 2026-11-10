/**
 * 《大发归家路》18 幕时间轴、镜头机位、天气与场景元数据 (Storyboard 18)
 * 对应 director_master_plan.md §1 & §2
 * 严格 18 幕，总时长 160.0 秒
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DF = root.DF || {};
    root.DF.STORYBOARD18 = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SCENE_COUNT = 18;
  const TOTAL_DURATION = 160.0;

  const SCENES = [
    {
      act: 1,
      id: 'act01',
      name: '纸箱',
      start: 0.0,
      end: 9.0,
      duration: 9.0,
      emotionStart: 48,
      emotionEnd: 66,
      mainState: 'curl_shiver',
      desc: '冷开场，青灰冷雨街角，湿透纸箱内脏湿幼犬被掌心接住',
      camera: {
        type: 'ECU_TO_CU',
        groundY: 0.82,
        heightAboveGroundCm: 18,
        parallax: 0.2,
        fov: 1.0,
        shake: 0.0
      },
      weather: {
        type: 'rain_city',
        intensity: 0.65,
        windSpeed: 0.2,
        fog: 0.35,
        colorTone: '#4a5b6c'
      },
      assetName: 'scene_01_cardboard',
      earMode: 'soft_fold',
      dialogue: null,
      subtitles: null
    },
    {
      act: 2,
      id: 'act02',
      name: '叶冠',
      start: 9.0,
      end: 18.0,
      duration: 9.0,
      emotionStart: 66,
      emotionEnd: 84,
      mainState: 'stay_still',
      desc: '五年后，银杏叶落头顶，一动不动=信任仪式（位置匹配剪辑硬约束）',
      camera: {
        type: 'CU_MATCH_CUT',
        groundY: 0.82,
        heightAboveGroundCm: 18,
        parallax: 0.0,
        fov: 1.0,
        shake: 0.0
      },
      weather: {
        type: 'warm_indoor',
        intensity: 0.0,
        windSpeed: 0.05,
        fog: 0.0,
        colorTone: '#f4ede1'
      },
      assetName: 'scene_02_leaf_crown',
      earMode: 'soft_fold',
      dialogue: null,
      subtitles: {
        text: '家里的大儿子 / The firstborn',
        start: 11.8,
        end: 17.2
      }
    },
    {
      act: 3,
      id: 'act03',
      name: '五季',
      start: 18.0,
      end: 27.5,
      duration: 9.5,
      emotionStart: 84,
      emotionEnd: 78,
      mainState: 'propeller_wag',
      desc: '迎门螺旋桨摇尾，三季快剪，全片最欢腾；26.0s门锁弹开',
      camera: {
        type: 'MS',
        groundY: 0.82,
        heightAboveGroundCm: 45,
        parallax: 0.4,
        fov: 1.1,
        shake: 0.02
      },
      weather: {
        type: 'seasons_shift',
        intensity: 0.1,
        windSpeed: 0.1,
        fog: 0.0,
        colorTone: '#fbe2a0'
      },
      assetName: 'scene_03_five_seasons',
      earMode: 'perk',
      dialogue: null,
      subtitles: null
    },
    {
      act: 4,
      id: 'act04',
      name: '小床',
      start: 27.5,
      end: 37.0,
      duration: 9.5,
      emotionStart: 78,
      emotionEnd: 54,
      mainState: 'head_tilt',
      desc: '婴儿床横穿画面挤压空间，双耳竖起惊觉退半步，歪头18度',
      camera: {
        type: 'MS_LOW_ANGLE',
        groundY: 0.82,
        heightAboveGroundCm: 25,
        parallax: 1.6,
        fov: 1.05,
        shake: 0.01
      },
      weather: {
        type: 'indoor_dim',
        intensity: 0.0,
        windSpeed: 0.0,
        fog: 0.05,
        colorTone: '#d9cfbe'
      },
      assetName: 'scene_04_baby_crib',
      earMode: 'perk_startle',
      dialogue: null,
      subtitles: null
    },
    {
      act: 5,
      id: 'act05',
      name: '阳台',
      start: 37.0,
      end: 46.0,
      duration: 9.0,
      emotionStart: 54,
      emotionEnd: 42,
      mainState: 'sit_back',
      desc: '玻璃物理双分割构图，左暖室内右冷阳台，大发柔和垂耳背影白雾呼吸',
      camera: {
        type: 'MS_SPLIT_FRAME',
        groundY: 0.82,
        heightAboveGroundCm: 50,
        parallax: 0.3,
        fov: 1.0,
        shake: 0.0
      },
      weather: {
        type: 'cold_balcony_wind',
        intensity: 0.4,
        windSpeed: 0.6,
        fog: 0.2,
        colorTone: '#687e94'
      },
      assetName: 'scene_05_balcony_glass',
      earMode: 'soft_fold', // 铁律R2: 必须垂耳
      dialogue: null,
      subtitles: null
    },
    {
      act: 6,
      id: 'act06',
      name: '系绳',
      start: 46.0,
      end: 55.0,
      duration: 9.0,
      emotionStart: 42,
      emotionEnd: 36,
      mainState: 'sit_lick',
      desc: '官塘黄昏柿子树下，婉儿蹲姿系绳，大发舔她发冷手指',
      camera: {
        type: 'MCU_WARM_DUSK',
        groundY: 0.82,
        heightAboveGroundCm: 40,
        parallax: 0.35,
        fov: 1.0,
        shake: 0.0
      },
      weather: {
        type: 'autumn_dusk',
        intensity: 0.1,
        windSpeed: 0.25,
        fog: 0.1,
        colorTone: '#cc8b58'
      },
      assetName: 'scene_06_leash_tied',
      earMode: 'soft_fold',
      dialogue: {
        speaker: '婉儿',
        text: '乖，就几天。',
        translation: 'Just a few days.',
        start: 46.8,
        end: 49.6
      },
      subtitles: null
    },
    {
      act: 7,
      id: 'act07',
      name: '尾灯',
      start: 55.0,
      end: 64.0,
      duration: 9.0,
      emotionStart: 36,
      emotionEnd: 30,
      mainState: 'stare',
      desc: 'POV极低机位透过铁门，两盏红尾灯拐弯熄灭，粗绳落地',
      camera: {
        type: 'POV_GATE_LOW',
        groundY: 0.82,
        heightAboveGroundCm: 15,
        parallax: 0.5,
        fov: 1.15,
        shake: 0.0
      },
      weather: {
        type: 'night_fog',
        intensity: 0.3,
        windSpeed: 0.2,
        fog: 0.45,
        colorTone: '#1b2a47'
      },
      assetName: 'scene_07_taillights',
      earMode: 'soft_fold',
      dialogue: null,
      subtitles: null
    },
    {
      act: 8,
      id: 'act08',
      name: '水盆',
      start: 64.0,
      end: 73.0,
      duration: 9.0,
      emotionStart: 30,
      emotionEnd: 26,
      mainState: 'sit_back_dark',
      desc: '不锈钢水盆寒光，剩饭原封未动，大发笔直背对镜头仅占画幅14%',
      camera: {
        type: 'CU_TOP_DOWN_PULL_OUT',
        groundY: 0.82,
        heightAboveGroundCm: 60,
        parallax: 0.1,
        fov: 1.2,
        shake: 0.0
      },
      weather: {
        type: 'cold_night',
        intensity: 0.15,
        windSpeed: 0.1,
        fog: 0.25,
        colorTone: '#252e3d'
      },
      assetName: 'scene_08_steel_bowl',
      earMode: 'soft_fold',
      dialogue: null,
      subtitles: null
    },
    {
      act: 9,
      id: 'act09',
      name: '断绳',
      start: 73.0,
      end: 83.0,
      duration: 10.0,
      emotionStart: 26,
      emotionEnd: 48,
      mainState: 'lunge',
      desc: '车灯逼近前扑，77.8s纤维炸裂绳断，0.6s全频死寂，冲入荒野',
      camera: {
        type: 'DYNAMIC_POV_TO_WS',
        groundY: 0.82,
        heightAboveGroundCm: 35,
        parallax: 2.4,
        fov: 1.25,
        shake: 0.08
      },
      weather: {
        type: 'highway_night_storm_brewing',
        intensity: 0.4,
        windSpeed: 0.7,
        fog: 0.3,
        colorTone: '#181e2b'
      },
      assetName: 'scene_09_rope_snap',
      earMode: 'perk_alert',
      dialogue: null,
      subtitles: null
    },
    {
      act: 10,
      id: 'act10',
      name: '泥泞',
      start: 83.0,
      end: 92.0,
      duration: 9.0,
      emotionStart: 48,
      emotionEnd: 28,
      mainState: 'gallop',
      desc: '十字泥泞路口转头三次，秋雨倾盆，爪陷黑淖艰难拔出',
      camera: {
        type: 'EWS_OVERHEAD_TO_GROUND',
        groundY: 0.82,
        heightAboveGroundCm: 15,
        parallax: 1.2,
        fov: 1.1,
        shake: 0.04
      },
      weather: {
        type: 'autumn_downpour',
        intensity: 0.85,
        windSpeed: 0.65,
        fog: 0.5,
        colorTone: '#2b332b'
      },
      assetName: 'scene_10_mud_crossroad',
      earMode: 'soft_fold',
      dialogue: null,
      subtitles: null
    },
    {
      act: 11,
      id: 'act11',
      name: '信标',
      start: 92.0,
      end: 101.0,
      duration: 9.0,
      emotionStart: 28,
      emotionEnd: 40,
      mainState: 'walk_tired',
      desc: '双线交替：芦苇荡抽打大发垂耳白气 ↔ 阿沐雨夜绑蓝布条用力拍树',
      camera: {
        type: 'POV_REED_INTERCUT_WS',
        groundY: 0.82,
        heightAboveGroundCm: 30,
        parallax: 2.0,
        fov: 1.0,
        shake: 0.03
      },
      weather: {
        type: 'wet_reed_gale',
        intensity: 0.75,
        windSpeed: 0.8,
        fog: 0.4,
        colorTone: '#34433c'
      },
      assetName: 'scene_11_blue_ribbon',
      earMode: 'soft_fold', // 铁律R2: 必须垂耳
      dialogue: null,
      subtitles: null
    },
    {
      act: 12,
      id: 'act12',
      name: '三误',
      start: 101.0,
      end: 110.0,
      duration: 9.0,
      emotionStart: 40,
      emotionEnd: 22,
      mainState: 'sprint_stop',
      desc: '三次狂奔冲向车灯三次落空，尾巴由抬起到夹紧，力竭坐倒泥水',
      camera: {
        type: 'CU_WS_FOLLOW_LOOP',
        groundY: 0.82,
        heightAboveGroundCm: 35,
        parallax: 1.5,
        fov: 1.1,
        shake: 0.05
      },
      weather: {
        type: 'chill_drizzle',
        intensity: 0.5,
        windSpeed: 0.5,
        fog: 0.6,
        colorTone: '#2e353f'
      },
      assetName: 'scene_12_three_mistakes',
      earMode: 'soft_fold',
      dialogue: null,
      subtitles: null
    },
    {
      act: 13,
      id: 'act13',
      name: '剪衣',
      start: 110.0,
      end: 119.0,
      duration: 9.0,
      emotionStart: 22,
      emotionEnd: 18,
      mainState: 'pure_dark_cut',
      desc: '全片最低谷：110-112s纯黑屏，台灯下剪刀咬合剪旧毛衣四下四音',
      camera: {
        type: 'BLACKOUT_TO_CU_TOPDOWN',
        groundY: 0.82,
        heightAboveGroundCm: 45,
        parallax: 0.0,
        fov: 0.9,
        shake: 0.0
      },
      weather: {
        type: 'indoor_night_lamp',
        intensity: 0.0,
        windSpeed: 0.0,
        fog: 0.0,
        colorTone: '#2a2318'
      },
      assetName: 'scene_13_scissors_sweater',
      earMode: 'soft_fold',
      dialogue: null,
      subtitles: null
    },
    {
      act: 14,
      id: 'act14',
      name: '水沟',
      start: 119.0,
      end: 128.0,
      duration: 9.0,
      emotionStart: 18,
      emotionEnd: 34,
      mainState: 'fall_slide',
      desc: '滑落两米水泥排污沟，鼻埋污泥中长吸一口气(胸腔overshoot扩张)',
      camera: {
        type: 'TOP_40M_TO_DITCH_CU',
        groundY: 0.82,
        heightAboveGroundCm: 15,
        parallax: 0.6,
        fov: 1.05,
        shake: 0.02
      },
      weather: {
        type: 'deep_mud_cold',
        intensity: 0.35,
        windSpeed: 0.2,
        fog: 0.55,
        colorTone: '#222722'
      },
      assetName: 'scene_14_ditch_slide',
      earMode: 'soft_fold',
      dialogue: null,
      subtitles: null
    },
    {
      act: 15,
      id: 'act15',
      name: '微风',
      start: 128.0,
      end: 137.0,
      duration: 9.0,
      emotionStart: 34,
      emotionEnd: 62,
      mainState: 'rise_struggle',
      desc: '一缕微风掠过泥面漾起波纹，爬出深沟，远处树梢深蓝布条泛荧光',
      camera: {
        type: 'ECU_TO_LOW_ANGLE',
        groundY: 0.82,
        heightAboveGroundCm: 20,
        parallax: 0.8,
        fov: 1.0,
        shake: 0.01
      },
      weather: {
        type: 'dawn_mist_breeze',
        intensity: 0.2,
        windSpeed: 0.45,
        fog: 0.35,
        colorTone: '#3f4c54'
      },
      assetName: 'scene_15_breeze_ribbon',
      earMode: 'soft_fold',
      dialogue: null,
      subtitles: {
        text: '三十七根。',
        start: 134.0,
        end: 136.4
      }
    },
    {
      act: 16,
      id: 'act16',
      name: '破晓',
      start: 137.0,
      end: 146.0,
      duration: 9.0,
      emotionStart: 62,
      emotionEnd: 90,
      mainState: 'gallop',
      desc: '双线咬合：金粉晨曦贴地狂奔，飞驰掠过树梢布条，音阶解决',
      camera: {
        type: 'VERTICAL_SPLIT_TRACK',
        groundY: 0.82,
        heightAboveGroundCm: 25,
        parallax: 1.8,
        fov: 1.15,
        shake: 0.03
      },
      weather: {
        type: 'golden_dawn',
        intensity: 0.05,
        windSpeed: 0.55,
        fog: 0.15,
        colorTone: '#e8af6f'
      },
      assetName: 'scene_16_dawn_gallop',
      earMode: 'soft_fold',
      dialogue: null,
      subtitles: null
    },
    {
      act: 17,
      id: 'act17',
      name: '门外',
      start: 146.0,
      end: 154.0,
      duration: 8.0,
      emotionStart: 90,
      emotionEnd: 70,
      mainState: 'sit_wait',
      desc: '一瘸一拐走到深绿铁门前，声控灯咔哒亮起，布条拂耳，一声安稳汪',
      camera: {
        type: 'CORRIDOR_LOW_TO_CU',
        groundY: 0.82,
        heightAboveGroundCm: 24,
        parallax: 0.2,
        fov: 1.0,
        shake: 0.0
      },
      weather: {
        type: 'warm_hallway_light',
        intensity: 0.0,
        windSpeed: 0.05,
        fog: 0.05,
        colorTone: '#8e795c'
      },
      assetName: 'scene_17_doorstep_wait',
      earMode: 'fold_listen',
      dialogue: null,
      subtitles: null
    },
    {
      act: 18,
      id: 'act18',
      name: '归家',
      start: 154.0,
      end: 160.0,
      duration: 6.0,
      emotionStart: 70,
      emotionEnd: 92,
      mainState: 'stay_still',
      desc: '门锁清脆洞开金光吞没，狂暴摇尾10cm硬刹，银杏叶归位头顶，终极定音',
      camera: {
        type: 'CU_TO_TITLE_CARD',
        groundY: 0.82,
        heightAboveGroundCm: 30,
        parallax: 0.4,
        fov: 1.0,
        shake: 0.02
      },
      weather: {
        type: 'golden_bloom',
        intensity: 0.0,
        windSpeed: 0.1,
        fog: 0.0,
        colorTone: '#ffe4a0'
      },
      assetName: 'scene_18_homecoming_title',
      earMode: 'perk_burst',
      dialogue: {
        speaker: '婉儿/阿沐',
        text: '……回来啦。认得路啊你。',
        translation: 'You came home.',
        start: 156.6,
        end: 158.4
      },
      subtitles: {
        text: '《大发归家路》 / THE WAY HOME',
        start: 159.4,
        end: 160.0
      }
    }
  ];

  function getSceneAtTime(t) {
    const clampedT = Math.max(0, Math.min(TOTAL_DURATION, t));
    for (let i = 0; i < SCENES.length; i++) {
      const s = SCENES[i];
      if (clampedT >= s.start && (clampedT < s.end || i === SCENES.length - 1)) {
        return s;
      }
    }
    return SCENES[SCENES.length - 1];
  }

  function emotionAt(t) {
    const s = getSceneAtTime(t);
    const progress = (t - s.start) / Math.max(0.001, s.duration);
    const clampedP = Math.max(0, Math.min(1, progress));
    return s.emotionStart + (s.emotionEnd - s.emotionStart) * clampedP;
  }

  return {
    SCENE_COUNT: SCENE_COUNT,
    TOTAL_DURATION: TOTAL_DURATION,
    SCENES: SCENES,
    getSceneAtTime: getSceneAtTime,
    emotionAt: emotionAt
  };
});
