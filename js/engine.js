/* 《大发回家》 纯代码程序化骨架引擎 (Vector Puppet Runtime Engine) - 9:16 竖屏电影版 */

(function () {
  const W = 1080, H = 1920;
  const DF = window.DF || (window.DF = {});
  DF.W = W;
  DF.H = H;
  DF.scenes = DF.scenes || [];

  /* ---------- math & color helpers (for draw.js and dog.js) ---------- */
  DF.clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  DF.lerp = (a, b, k) => a + (b - a) * k;
  DF.rng = function (seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  };
  DF.mix = (c1, c2, k) => {
    const parse = (c) => {
      if (typeof c === 'string' && c.startsWith('#')) {
        return [1, 3, 5].map((i) => parseInt(c.substr(i, 2), 16));
      }
      return [128, 128, 128];
    };
    const a = parse(c1), b = parse(c2);
    return 'rgb(' + a.map((v, i) => Math.round(DF.lerp(v, b[i], k))).join(',') + ')';
  };

  // 章节计算（延迟在 boot 时计算，确保 scenes 已注入）
  DF.initTimeline = function () {
    let totalDur = 0;
    (DF.scenes || []).forEach((s) => {
      s.start = totalDur;
      totalDur += s.dur;
    });
    DF.totalDur = totalDur;
  };

  // DOM 元素
  const cv = document.getElementById("cv");
  const ctx = cv.getContext("2d");
  const chBadge = document.getElementById("chBadge");
  const chTitle = document.getElementById("chTitle");
  const chOverlay = document.getElementById("chapter-overlay");
  const subline = document.getElementById("subline");
  const startEl = document.getElementById("start");
  const playBtn = document.getElementById("playBtn");
  const btnPP = document.getElementById("btnPP");
  const btnMute = document.getElementById("btnMute");
  const btnFS = document.getElementById("btnFS");
  const bar = document.getElementById("bar");
  const fill = document.getElementById("fill");
  const timeEl = document.getElementById("time");
  const stage = document.getElementById("stage");

  let currentTime = 0;
  let isPlaying = false;
  let isMuted = false;
  let lastTimestamp = 0;
  let activeScene = null;
  let curSubText = "";

  function resize() {
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
  }
  window.addEventListener("resize", resize);
  resize();

  function getSceneAt(t) {
    for (let i = DF.scenes.length - 1; i >= 0; i--) {
      if (t >= DF.scenes[i].start) return DF.scenes[i];
    }
    return DF.scenes[0];
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
  }

  // 渲染主函数
  function render(dt) {
    const scene = getSceneAt(currentTime);
    const lt = currentTime - scene.start;

    // 章节切换
    if (activeScene !== scene) {
      activeScene = scene;
      chBadge.textContent = scene.badge;
      chTitle.textContent = scene.title;
      chOverlay.classList.remove("show");
      void chOverlay.offsetWidth;
      chOverlay.classList.add("show");
      playAudioForScene(scene.id);
    }

    // 字幕切换
    let targetSub = "";
    if (scene.subs) {
      for (let i = 0; i < scene.subs.length; i++) {
        const item = scene.subs[i];
        if (lt >= item[0] && lt < item[1]) {
          targetSub = item[2];
          break;
        }
      }
    }

    if (targetSub !== curSubText) {
      curSubText = targetSub;
      if (targetSub) {
        subline.textContent = targetSub;
        subline.classList.remove("show");
        void subline.offsetWidth;
        subline.classList.add("show");
      } else {
        subline.classList.remove("show");
      }
    }

    // 章节淡出
    if (lt > 5.5 && !DF._freezeUI) {
      chOverlay.classList.remove("show");
    }

    // 画布变换与逐帧绘制
    ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    try {
      scene.draw(ctx, lt, dt);
    } catch (e) {
      console.error("Draw scene error", e);
    }
    ctx.restore();

    // 更新底部进度
    const total = DF.totalDur || 84;
    const pct = (currentTime / total) * 100;
    fill.style.width = pct + "%";
    timeEl.textContent = formatTime(currentTime) + " / " + formatTime(total);
    DF._cur = { t: currentTime, id: scene.id, lt: lt };
  }

  // 动画主循环
  function loop(timestamp) {
    if (!DF.totalDur && DF.initTimeline) DF.initTimeline();
    if (DF._pendingSeek != null) applyPendingSeek();
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    if (isPlaying) {
      currentTime += dt;
      const total = DF.totalDur || 84;
      if (currentTime >= total) {
        currentTime = total;
        pause();
      }
    }

    render(dt);
    requestAnimationFrame(loop);
  }
  // URL 定格参数（截图/审片用）：?t=秒&paused=1&ui=0
  // 关键：engine.js 先于 scenes.js 执行，此时 DF.totalDur 还不存在，
  // 所以 seek 必须推迟到"scenes 已加载 + timeline 已初始化"之后，否则会被 clamp 成 0。
  (function readUrlParams() {
    const q = new URLSearchParams(location.search);
    if (!q.has("t")) return;
    const raw = parseFloat(q.get("t"));
    DF._pendingSeek = isFinite(raw) ? Math.max(0, raw) : 0;
    DF._pausedBoot = q.get("paused") === "1";
    if (DF._pausedBoot) {
      DF._freezeUI = true;
      if (startEl) startEl.classList.add("hide");
    }
    if (q.get("ui") === "0") {
      const ui = document.getElementById("ui");
      if (ui) ui.style.display = "none";
      const st = document.getElementById("start");
      if (st) st.style.display = "none";
    }
  })();

  // 在时间轴可用后落实 seek（由 loop 首帧调用一次）
  function applyPendingSeek() {
    if (DF._pendingSeek == null) return;
    if (!DF.totalDur) return;
    currentTime = Math.max(0, Math.min(DF.totalDur, DF._pendingSeek));
    DF._seek = currentTime;
    lastTimestamp = 0;
    activeScene = null;
    curSubText = null;
    DF._pendingSeek = null;
  }

  requestAnimationFrame(loop);

  // 交互控制
  function play() {
    isPlaying = true;
    btnPP.textContent = "❚❚";
    startEl.classList.add("hide");
    initAudio();
  }

  function pause() {
    isPlaying = false;
    btnPP.textContent = "▶";
  }

  function togglePlay() {
    if (isPlaying) pause();
    else play();
  }

  playBtn.addEventListener("click", play);
  btnPP.addEventListener("click", togglePlay);

  window.addEventListener("keydown", (e) => {
    const total = DF.totalDur || 84;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.code === "KeyF") {
      toggleFullscreen();
    } else if (e.code === "KeyM") {
      toggleMute();
    } else if (e.code === "ArrowRight") {
      currentTime = Math.min(total, currentTime + 3);
    } else if (e.code === "ArrowLeft") {
      currentTime = Math.max(0, currentTime - 3);
    }
  });

  bar.addEventListener("click", (e) => {
    const total = DF.totalDur || 84;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    currentTime = ratio * total;
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
  btnFS.addEventListener("click", toggleFullscreen);

  function toggleMute() {
    isMuted = !isMuted;
    btnMute.textContent = isMuted ? "✕" : "♪";
    if (audioMaster) {
      audioMaster.gain.setTargetAtTime(isMuted ? 0 : 0.45, audioCtx.currentTime, 0.1);
    }
  }
  btnMute.addEventListener("click", toggleMute);

  // Web Audio 配乐系统
  let audioCtx = null, audioMaster = null, filterNode = null;
  function initAudio() {
    if (audioCtx) {
      if (audioCtx.state === "suspended") audioCtx.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    audioMaster = audioCtx.createGain();
    audioMaster.gain.value = 0.45;
    audioMaster.connect(audioCtx.destination);

    // 环境粉红噪音生成器（模拟雨声/风声）
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.value = 450;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.08;

    whiteNoise.connect(filterNode);
    filterNode.connect(noiseGain);
    noiseGain.connect(audioMaster);
    whiteNoise.start();

    // 钢琴琶音步进器
    startSequencer();
    // 初始化 Earshot 音效解码系统
    initSFX();
  }

  // ----------------------------------------------------
  // Earshot Pro 电影级声效系统 (嵌入式物理 DSP 音效)
  // ----------------------------------------------------
  const sfxBuffers = {};
  function initSFX() {
    if (!audioCtx || !window.DF_SFX) return;
    Object.keys(window.DF_SFX).forEach((key) => {
      try {
        const base64Data = window.DF_SFX[key].split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioCtx.decodeAudioData(bytes.buffer, (buffer) => {
          sfxBuffers[key] = buffer;
        }, (err) => {
          console.warn('SFX decode error for', key, err);
        });
      } catch (e) {
        console.warn('SFX parse error', e);
      }
    });
  }

  DF.playSFX = function (name, gainVal = 0.5, delaySec = 0) {
    if (!audioCtx || isMuted) return;
    const buf = sfxBuffers[name];
    if (!buf) return;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(gainVal, audioCtx.currentTime + delaySec);
    src.connect(g);
    g.connect(audioMaster);
    src.start(audioCtx.currentTime + delaySec);
  };

  function playPiano(freq, time, dur = 2.5, vel = 0.45) {
    if (!audioCtx || isMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    const sub = audioCtx.createOscillator();
    sub.type = "triangle";
    sub.frequency.setValueAtTime(freq * 2, time);
    const subGain = audioCtx.createGain();
    subGain.gain.setValueAtTime(vel * 0.25, time);
    subGain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.6);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vel * 0.4, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    sub.connect(subGain);
    subGain.connect(gain);
    gain.connect(audioMaster);

    osc.start(time);
    sub.start(time);
    osc.stop(time + dur);
    sub.stop(time + dur);
  }

  const NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99
  };

  function playAudioForScene(sceneId) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    if (sceneId === 's1') {
      // 第一幕：阳光客厅、落叶王冠建立信任仪式（空灵钢片琴单音）
      filterNode.frequency.setTargetAtTime(500, now, 1.2);
      DF.playSFX('s1_celesta', 0.45, 0.4); // 钢片琴点亮落叶仪式
    } else if (sceneId === 's2') {
      // 第二幕：阳台守望与目送尾灯，低沉空旷
      filterNode.frequency.setTargetAtTime(450, now, 1.5);
      DF.playSFX('s2_crib', 0.4, 0.5);
    } else if (sceneId === 's3') {
      // 第三幕：误判车灯追逐，绳索崩裂瞬态爆发 + 狂风骤起
      filterNode.frequency.setTargetAtTime(1400, now, 0.8);
      DF.playSFX('s3_rope_snap', 0.7, 0.1); // 麻绳崩断瞬态
      DF.playSFX('s3_wind', 0.6, 0.3); // 拔足狂奔呼啸
    } else if (sceneId === 's4') {
      // 第四幕：雨夜寻找，暴风雨夜呼啸与低频脉动
      filterNode.frequency.setTargetAtTime(1600, now, 0.9);
      DF.playSFX('s4_wind_rain', 0.6, 0.2);
    } else if (sceneId === 's5') {
      // 第五幕：破晓微光，晨风翻卷深蓝布条 + 再次回响同一声钢片琴单音！
      filterNode.frequency.setTargetAtTime(600, now, 1.2);
      DF.playSFX('s5_ribbon', 0.5, 0.5); // 布料翻卷
      DF.playSFX('s1_celesta', 0.5, 1.2); // 记忆觉醒灵动高音（与第1幕同一音高呼应！）
    } else if (sceneId === 's6') {
      // 第六幕：终局大团圆，同一把门锁弹开回响 + 温暖 Bloom 全面爆发
      filterNode.frequency.setTargetAtTime(650, now, 1.0);
      DF.playSFX('s6_door_latch', 0.55, 0.2); // 门锁微弹
      DF.playSFX('s6_reunion', 0.65, 0.6); // 晨光 Bloom 绽放
      DF.playSFX('s1_celesta', 0.45, 3.5); // 婴儿小手触碰落叶的最后一声回响
    } else {
      filterNode.frequency.setTargetAtTime(500, now, 1.5);
    }
  }

  function startSequencer() {
    let beat = 0;
    setInterval(() => {
      if (!audioCtx || !isPlaying || isMuted) return;
      const now = audioCtx.currentTime;
      const s = getSceneAt(currentTime);
      if (s.id === 's1') {
        const chord = [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.B4];
        playPiano(chord[beat % chord.length], now, 3.0, 0.45);
      } else if (s.id === 's2') {
        const chord = [NOTES.A3, NOTES.E4, NOTES.C4, NOTES.D4];
        playPiano(chord[beat % chord.length], now, 3.2, 0.35);
      } else if (s.id === 's3') {
        // 紧张疾奔
        const chord = [NOTES.D3, NOTES.A3, NOTES.F3, NOTES.C4];
        playPiano(chord[beat % chord.length], now, 2.0, 0.5);
      } else if (s.id === 's4') {
        // 深夜寻找低沉脉动
        const chord = [NOTES.A3, NOTES.C4, NOTES.E4, NOTES.G4];
        playPiano(chord[beat % chord.length], now, 2.5, 0.4);
      } else if (s.id === 's5') {
        // 破晓希望
        const chord = [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5];
        playPiano(chord[beat % chord.length], now, 2.8, 0.48);
      } else if (s.id === 's6') {
        // 重逢大团圆温暖大三和弦
        playPiano(NOTES.C4, now, 4.0, 0.6);
        playPiano(NOTES.G4, now + 0.12, 3.5, 0.5);
        playPiano(NOTES.E5, now + 0.24, 3.5, 0.55);
      }
      beat++;
    }, 1800);
  }

})();
