/**
 * 《大发归家路》Earshot 声学事件表与常量映射 (Audio Cue Sheet)
 * 对应 director_master_plan.md §4 与 docs/cue_sheet.tsv
 * 44 条 Earshot 声学 Cue（包含 L1 环境、L2 拟音、L3 情绪与 Ducking）
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DF = root.DF || {};
    root.DF.CUES = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CUES = [
    {
      id: 'A01_rain_city',
      t: 0.0,
      act: 1,
      layer: 'L1',
      resource: 'pro_whoosh_big/heavy+lp800',
      desc: '城市雨夜底噪低通800Hz',
      duck: { target: 'L3', amountDb: -9 }
    },
    {
      id: 'A01_fluff',
      t: 4.9,
      act: 1,
      layer: 'L2',
      resource: 'forge:fluff_contact',
      desc: '绒毛触掌',
      duck: { target: 'all', amountDb: -6 }
    },
    {
      id: 'A02_clock',
      t: 9.5,
      act: 2,
      layer: 'L1',
      resource: 'ui/tick',
      desc: '挂钟滴答',
      duck: null
    },
    {
      id: 'A02_celesta_g5',
      t: 11.0,
      act: 2,
      layer: 'L3',
      resource: 'synth:celesta_G5',
      desc: '主题音首现',
      duck: null
    },
    {
      id: 'A03_paw_taps',
      t: 18.2,
      act: 3,
      layer: 'L2',
      resource: 'forge:paw_drum',
      desc: '前爪碎步',
      duck: { target: 'L3', amountDb: -3 }
    },
    {
      id: 'A03_marimba',
      t: 21.0,
      act: 3,
      layer: 'L3',
      resource: 'synth:marimba_G4_B4_D5',
      desc: '翻相册三连音 (21.0/22.1/23.0)',
      duck: null
    },
    {
      id: 'A03_latch',
      t: 26.2,
      act: 3,
      layer: 'L2',
      resource: 'toggle/latch',
      desc: '门锁（与A18同采样）',
      duck: { target: 'all', amountDb: -4 }
    },
    {
      id: 'A04_crib_roll',
      t: 27.5,
      act: 4,
      layer: 'L2',
      resource: 'forge:wood_roll_carpet',
      desc: '木轮碾地毯',
      duck: { target: 'L3', hardCut: true }
    },
    {
      id: 'A05_glass_muffled',
      t: 37.0,
      act: 5,
      layer: 'L1',
      resource: 'forge:baby_cry_lp600',
      desc: '玻璃隔绝哭声',
      duck: null
    },
    {
      id: 'A05_balcony_wind',
      t: 37.0,
      act: 5,
      layer: 'L1',
      resource: 'pro_whoosh_small/dry',
      desc: '阳台干燥冷风',
      duck: null
    },
    {
      id: 'A06_whisper',
      t: 46.8,
      act: 6,
      layer: 'L2',
      resource: 'forge:whisper',
      desc: '乖就几天耳语',
      duck: { target: 'all', amountDb: -6 }
    },
    {
      id: 'A06_latch_click',
      t: 50.0,
      act: 6,
      layer: 'L2',
      resource: 'metal/latch_click',
      desc: '锁扣卡紧',
      duck: null
    },
    {
      id: 'A07_engine_away',
      t: 55.0,
      act: 7,
      layer: 'L1',
      resource: 'car/engine_doppler_out',
      desc: '尾灯远去引擎声',
      duck: null
    },
    {
      id: 'A07_rope_drop',
      t: 61.0,
      act: 7,
      layer: 'L2',
      resource: 'forge:rope_land',
      desc: '粗绳落地闷响',
      duck: null
    },
    {
      id: 'A08_heartbeat',
      t: 64.0,
      act: 8,
      layer: 'L3',
      resource: 'synth:heart_52bpm',
      desc: '极低频心跳首现',
      duck: null
    },
    {
      id: 'A08_crickets',
      t: 64.0,
      act: 8,
      layer: 'L1',
      resource: 'nature/crickets',
      desc: '秋虫鸣叫',
      duck: null
    },
    {
      id: 'A09_engine_in',
      t: 73.0,
      act: 9,
      layer: 'L1',
      resource: 'car/engine_doppler_in',
      desc: '车灯逼近时间反演',
      duck: null
    },
    {
      id: 'A09_fiber_tear',
      t: 77.0,
      act: 9,
      layer: 'L2',
      resource: 'fit/snap/fiber_tear',
      desc: '纤维撕扯0.8s',
      duck: { target: 'all', amountDb: -12 }
    },
    {
      id: 'A09_snap',
      t: 77.8,
      act: 9,
      layer: 'L2',
      resource: 'fit/snap/switch_flip',
      desc: '断点断裂脆响',
      duck: null
    },
    {
      id: 'A09_SILENCE',
      t: 77.8,
      act: 9,
      layer: 'L0',
      resource: 'gain=0',
      duration: 0.6,
      desc: '0.6s全频死寂(77.8-78.4s)',
      duck: { target: 'all', hardCut: true, silence: true }
    },
    {
      id: 'A10_rain_in',
      t: 85.6,
      act: 10,
      layer: 'L1',
      resource: 'weather/rain_start',
      desc: '首滴雨2.5s渐强',
      duck: null
    },
    {
      id: 'A10_mud_step',
      t: 86.0,
      act: 10,
      layer: 'L2',
      resource: 'forge:mud_step',
      desc: '爪踩泥每步一次',
      duck: null
    },
    {
      id: 'A10_mud_splat',
      t: 88.1,
      act: 10,
      layer: 'L2',
      resource: 'forge:mud_splat_glass',
      desc: '泥浆拍镜',
      duck: null
    },
    {
      id: 'A11_g4_knock',
      t: 96.5,
      act: 11,
      layer: 'L3',
      resource: 'synth:wood_knock_G4',
      desc: '四音动机一木响定调',
      duck: null
    },
    {
      id: 'A12_g4',
      t: 101.3,
      act: 12,
      layer: 'L3',
      resource: 'synth:chime_G4',
      desc: '误认一车灯敲击',
      duck: null
    },
    {
      id: 'A12_a4',
      t: 104.0,
      act: 12,
      layer: 'L3',
      resource: 'synth:chime_A4',
      desc: '误认二车灯敲击',
      duck: null
    },
    {
      id: 'A12_b4',
      t: 106.7,
      act: 12,
      layer: 'L3',
      resource: 'synth:chime_B4',
      desc: '误认三车灯敲击',
      duck: null
    },
    {
      id: 'A12_d5_unresolved',
      t: 108.4,
      act: 12,
      layer: 'L3',
      resource: 'synth:chime_D5',
      desc: '四音动机悬置于D5未解决',
      duck: null
    },
    {
      id: 'A13_SILENCE',
      t: 110.0,
      act: 13,
      layer: 'L0',
      resource: 'gain=0',
      duration: 2.0,
      desc: '黑屏2.0s死寂(110.0-112.0s)',
      duck: { target: 'all', hardCut: true, silence: true }
    },
    {
      id: 'A13_cut_x4',
      t: 112.8,
      act: 13,
      layer: 'L3',
      resource: 'synth:cloth_rip_lo_G4_A4_B4_D4',
      desc: '四音动机二低八度剪衣四音(112.8/114.0/115.2/116.4)',
      duck: null
    },
    {
      id: 'A14_slide',
      t: 119.0,
      act: 14,
      layer: 'L2',
      resource: 'forge:slide_gravel',
      desc: '滑落碎石与泥擦',
      duck: null
    },
    {
      id: 'A14_inhale',
      t: 123.0,
      act: 14,
      layer: 'L2',
      resource: 'forge:deep_inhale',
      desc: '长吸气1.4s',
      duck: { target: 'all', amountDb: -8 }
    },
    {
      id: 'A15_celesta_g5_soft',
      t: 129.0,
      act: 15,
      layer: 'L3',
      resource: 'synth:celesta_G5_p35',
      desc: '主题音二微弱复苏 (gain 0.35)',
      duck: null
    },
    {
      id: 'A15_ribbon_flap',
      t: 133.5,
      act: 15,
      layer: 'L2',
      resource: 'cloth/flap',
      desc: '布条猎猎风响',
      duck: null
    },
    {
      id: 'A16_g4',
      t: 137.2,
      act: 16,
      layer: 'L3',
      resource: 'synth:chime_G4',
      desc: '咬合起点脚步对齐',
      duck: null
    },
    {
      id: 'A16_step_G_A_B',
      t: 139.4,
      act: 16,
      layer: 'L3',
      resource: 'synth:chime_G4_A4_B4',
      desc: '擦过布条动机音步进(139.4/140.2/141.0)',
      duck: null
    },
    {
      id: 'A16_celesta_g5_full',
      t: 143.0,
      act: 16,
      layer: 'L3',
      resource: 'synth:celesta_G5_full',
      desc: '主题音三完整奏响与D5最终解决',
      duck: null
    },
    {
      id: 'A17_clap_light',
      t: 147.6,
      act: 17,
      layer: 'L2',
      resource: 'electric/switch',
      desc: '声控灯咔哒',
      duck: null
    },
    {
      id: 'A17_ribbon_brush',
      t: 149.4,
      act: 17,
      layer: 'L2',
      resource: 'forge:ribbon_brush',
      desc: '布条拂耳极轻',
      duck: null
    },
    {
      id: 'A17_bark',
      t: 151.8,
      act: 17,
      layer: 'L2',
      resource: 'forge:bark_soft',
      desc: '平稳安心吠声汪',
      duck: { target: 'all', hardCut: true }
    },
    {
      id: 'A18_latch',
      t: 154.0,
      act: 18,
      layer: 'L2',
      resource: 'toggle/latch',
      desc: '门锁（与A03同采样）',
      duck: { target: 'all', amountDb: -4 }
    },
    {
      id: 'A18_bloom',
      t: 154.6,
      act: 18,
      layer: 'L3',
      resource: 'synth:string_bloom_Gmajor',
      desc: '四音动机四大调弦乐Bloom引爆',
      duck: null
    },
    {
      id: 'A18_celesta_g5_ultimate',
      t: 158.6,
      act: 18,
      layer: 'L3',
      resource: 'synth:celesta_G5',
      desc: '主题音四终极奏响',
      duck: null
    },
    {
      id: 'A18_bowl',
      t: 160.0,
      act: 18,
      layer: 'L2',
      resource: 'gong/bowl_small',
      desc: '木质定音磬响沉静',
      duck: null
    }
  ];

  return {
    TOTAL_CUES: CUES.length,
    CUES: CUES,
    getCuesForTime: function (t, dt = 0.05) {
      return CUES.filter(c => Math.abs(c.t - t) <= dt);
    },
    getCuesForScene: function (actIndex) {
      return CUES.filter(c => c.act === actIndex);
    }
  };
});
