/* ============================================================
   SoundEngine — синтез звука на Web Audio API (без аудиофайлов)
   ============================================================ */
'use strict';

const Sfx = (() => {
  let ctx = null, master = null, musicGain = null, sfxGain = null, comp = null, noiseBuf = null;
  let muted = false;
  let musicOn = false, musicTimer = null, step = 0, nextT = 0;

  const STEP_DUR = 60 / 96 / 2; // 96 BPM, восьмые
  const BASS_ROOTS = [110.0, 87.31, 130.81, 98.0]; // A2 F2 C3 G2
  const LEAD_PENT = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0];
  // 32-шаговая мелодия (индексы пентатоники, -1 — пауза)
  const MELODY = [
    0, -1, 2, -1, 3, -1, 2, 1,  0, -1, 1, -1, 2, -1, -1, -1,
    3, -1, 4, -1, 5, -1, 4, 3,  2, -1, 3, -1, 1, -1, 0, -1
  ];

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 6;
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.05;
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.5;
      musicGain.connect(comp);
      sfxGain.connect(comp);
      comp.connect(master);
      master.connect(ctx.destination);
      const len = Math.floor(ctx.sampleRate * 0.5);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) { return false; }
  }

  function resumeCtx() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
  }
  function suspendCtx() {
    if (ctx && ctx.state === 'running') { try { ctx.suspend(); } catch (e) {} }
  }

  // Базовые генераторы
  function tone(o) {
    if (!ensure()) return;
    const t0 = o.t !== undefined ? o.t : ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), t0 + (o.dur || 0.2));
    const g = ctx.createGain();
    const peak = o.v !== undefined ? o.v : 0.3;
    const atk = o.a || 0.004;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (o.dur || 0.2));
    osc.connect(g);
    g.connect(o.dest || sfxGain);
    osc.start(t0);
    osc.stop(t0 + (o.dur || 0.2) + 0.05);
  }

  function noise(o) {
    if (!ensure()) return;
    const t0 = o.t !== undefined ? o.t : ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const g = ctx.createGain();
    const peak = o.v !== undefined ? o.v : 0.25;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + (o.a || 0.003));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (o.dur || 0.12));
    let node = src;
    if (o.hp) {
      const f = ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = o.hp;
      node.connect(f); node = f;
    }
    if (o.lp) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = o.lp;
      node.connect(f); node = f;
    }
    node.connect(g);
    g.connect(o.dest || sfxGain);
    src.start(t0);
    src.stop(t0 + (o.dur || 0.12) + 0.05);
  }

  // ---------- SFX ----------
  const S = {
    tap() { // клик по наковальне — ускорение ковки
      const t0 = ctx.currentTime;
      noise({ t: t0, dur: 0.05, v: 0.16, hp: 3000 });
      tone({ type: 'triangle', f: 320 + Math.random() * 40, f2: 180, dur: 0.07, v: 0.18, t: t0 });
    },
    anvil() { // ковка завершена — сочный удар по наковальне
      const t0 = ctx.currentTime;
      const base = 1150 + Math.random() * 250;
      tone({ type: 'triangle', f: base, f2: base * 0.4, dur: 0.28, v: 0.32, t: t0 });
      tone({ type: 'sine', f: base * 1.51, f2: base * 1.2, dur: 0.18, v: 0.2, t: t0 + 0.005 });
      noise({ t: t0, dur: 0.08, v: 0.3, hp: 2400 });
      tone({ type: 'sine', f: 130, f2: 55, dur: 0.12, v: 0.3, t: t0 });
    },
    hit() {
      const t0 = ctx.currentTime;
      noise({ t: t0, dur: 0.07, v: 0.22, hp: 900, lp: 5200 });
      tone({ type: 'square', f: 190, f2: 70, dur: 0.09, v: 0.2, t: t0 });
    },
    crit() {
      const t0 = ctx.currentTime;
      noise({ t: t0, dur: 0.12, v: 0.3, hp: 700, lp: 6000 });
      tone({ type: 'square', f: 240, f2: 60, dur: 0.14, v: 0.28, t: t0 });
      tone({ type: 'sine', f: 2100, f2: 1400, dur: 0.16, v: 0.16, t: t0 + 0.02 });
    },
    kill() {
      const t0 = ctx.currentTime;
      tone({ type: 'square', f: 420, f2: 110, dur: 0.18, v: 0.24, t: t0 });
      noise({ t: t0 + 0.02, dur: 0.14, v: 0.18, hp: 400, lp: 3000 });
    },
    merge(combo) {
      const t0 = ctx.currentTime;
      const k = Math.min(12, combo || 0);
      const base = 380 * Math.pow(1.059, k * 2);
      tone({ type: 'sine', f: base, dur: 0.1, v: 0.26, t: t0 });
      tone({ type: 'sine', f: base * 1.25, dur: 0.1, v: 0.24, t: t0 + 0.07 });
      tone({ type: 'triangle', f: base * 1.5, f2: base * 1.9, dur: 0.22, v: 0.26, t: t0 + 0.14 });
      tone({ type: 'sine', f: base * 3, dur: 0.3, v: 0.1, t: t0 + 0.14 });
      noise({ t: t0 + 0.14, dur: 0.16, v: 0.1, hp: 5000 });
    },
    coin() {
      const t0 = ctx.currentTime;
      tone({ type: 'square', f: 987.77, dur: 0.06, v: 0.12, t: t0 });
      tone({ type: 'square', f: 1318.5, dur: 0.16, v: 0.12, t: t0 + 0.055 });
    },
    buy() {
      const t0 = ctx.currentTime;
      tone({ type: 'triangle', f: 660, dur: 0.08, v: 0.2, t: t0 });
      tone({ type: 'triangle', f: 880, dur: 0.14, v: 0.2, t: t0 + 0.07 });
      noise({ t: t0, dur: 0.05, v: 0.08, hp: 4000 });
    },
    craftUp() {
      const t0 = ctx.currentTime;
      tone({ type: 'sawtooth', f: 200, f2: 800, dur: 0.2, v: 0.14, t: t0 });
      tone({ type: 'square', f: 523.25, dur: 0.1, v: 0.18, t: t0 + 0.15 });
      tone({ type: 'square', f: 783.99, dur: 0.18, v: 0.18, t: t0 + 0.24 });
    },
    err() {
      const t0 = ctx.currentTime;
      tone({ type: 'sawtooth', f: 130, f2: 90, dur: 0.16, v: 0.2, t: t0 });
      tone({ type: 'sawtooth', f: 98, dur: 0.2, v: 0.16, t: t0 + 0.1 });
    },
    click() {
      const t0 = ctx.currentTime;
      tone({ type: 'sine', f: 740, f2: 620, dur: 0.05, v: 0.14, t: t0 });
    },
    fanfare() {
      const t0 = ctx.currentTime;
      const seq = [523.25, 659.26, 783.99, 1046.5, 783.99, 1046.5];
      seq.forEach((f, i) => {
        tone({ type: 'square', f: f, dur: 0.16, v: 0.16, t: t0 + i * 0.13 });
        tone({ type: 'triangle', f: f / 2, dur: 0.16, v: 0.12, t: t0 + i * 0.13 });
      });
      noise({ t: t0 + seq.length * 0.13, dur: 0.5, v: 0.08, hp: 3500 });
    },
    bossCome() {
      const t0 = ctx.currentTime;
      [110, 110, 87.31, 98].forEach((f, i) => {
        tone({ type: 'sawtooth', f: f, dur: 0.22, v: 0.24, t: t0 + i * 0.2 });
        tone({ type: 'square', f: f * 2, dur: 0.2, v: 0.1, t: t0 + i * 0.2 });
      });
    },
    bossFail() {
      const t0 = ctx.currentTime;
      [392, 349.23, 311.13, 261.63].forEach((f, i) => {
        tone({ type: 'sawtooth', f: f, f2: f * 0.94, dur: 0.3, v: 0.2, t: t0 + i * 0.22 });
      });
    },
    spin() {
      const t0 = ctx.currentTime;
      for (let i = 0; i < 10; i++) {
        tone({ type: 'square', f: 600 + i * 60, dur: 0.04, v: 0.1, t: t0 + i * 0.09 });
      }
    },
    tick() {
      const t0 = ctx.currentTime;
      tone({ type: 'square', f: 900, dur: 0.03, v: 0.08, t: t0 });
    },
    reward() {
      const t0 = ctx.currentTime;
      [523.25, 659.26, 783.99].forEach((f, i) => tone({ type: 'sine', f: f, dur: 0.14, v: 0.2, t: t0 + i * 0.09 }));
      tone({ type: 'sine', f: 1046.5, dur: 0.34, v: 0.22, t: t0 + 0.27 });
    },
    disc() {
      const t0 = ctx.currentTime;
      [659.26, 830.61, 987.77, 1318.5].forEach((f, i) => tone({ type: 'triangle', f: f, dur: 0.14, v: 0.16, t: t0 + i * 0.08 }));
    },
    drone() {
      const t0 = ctx.currentTime;
      tone({ type: 'sine', f: 300, f2: 520, dur: 0.4, v: 0.1, t: t0 });
      tone({ type: 'sine', f: 260, f2: 480, dur: 0.4, v: 0.08, t: t0 + 0.1 });
    },
    pet() {
      const t0 = ctx.currentTime;
      tone({ type: 'sine', f: 880, f2: 1200, dur: 0.12, v: 0.12, t: t0 });
    }
  };

  function play(name, p) {
    if (muted) return;
    if (!ensure()) return;
    resumeCtx();
    try { if (S[name]) S[name](p); } catch (e) {}
  }

  // ---------- Музыка (chiptune/lofi-луп) ----------
  function scheduleStep(s, t) {
    const bar = Math.floor(s / 8) % 4;
    const inBar = s % 8;
    const root = BASS_ROOTS[bar];
    // бас
    const bassNote = (inBar % 4 === 3) ? root * 1.5 : root;
    tone({ type: 'triangle', f: bassNote, dur: STEP_DUR * 0.9, v: 0.5, t: t, dest: musicGain });
    // кик
    if (inBar === 0 || inBar === 4) {
      tone({ type: 'sine', f: 150, f2: 45, dur: 0.12, v: 0.7, t: t, dest: musicGain });
    }
    // хэт
    if (inBar % 2 === 0) {
      noise({ t: t, dur: 0.03, v: inBar % 4 === 2 ? 0.16 : 0.09, hp: 7000, dest: musicGain });
    }
    // мелодия
    const m = MELODY[s % 32];
    if (m >= 0) {
      const f = LEAD_PENT[m];
      tone({ type: 'square', f: f, dur: STEP_DUR * 1.4, v: 0.22, t: t, dest: musicGain });
      if (s % 8 === 0) tone({ type: 'sine', f: f * 2, dur: STEP_DUR, v: 0.07, t: t + 0.02, dest: musicGain });
    }
  }

  function startMusic() {
    if (!ensure()) return;
    resumeCtx();
    if (musicOn) return;
    musicOn = true;
    step = 0;
    nextT = ctx.currentTime + 0.1;
    musicTimer = setInterval(() => {
      if (!musicOn || !ctx) return;
      while (nextT < ctx.currentTime + 0.3) {
        scheduleStep(step, nextT);
        step = (step + 1) % 32;
        nextT += STEP_DUR;
      }
    }, 100);
  }
  function stopMusic() {
    musicOn = false;
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  function setMuted(m) {
    muted = !!m;
    if (ensure()) master.gain.value = muted ? 0 : 1;
    if (muted) stopMusic();
  }

  return {
    play, ensure, resumeCtx, suspendCtx,
    startMusic, stopMusic,
    setMuted,
    get muted() { return muted; }
  };
})();
