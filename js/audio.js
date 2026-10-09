/* PALEO HIGHWAY — silnik audio
 * Wszystkie dźwięki i muzyka są syntetyzowane w Web Audio API.
 * Funkcje instrumentów i SFX przyjmują dowolny BaseAudioContext, dzięki czemu
 * ten sam kod działa w grze (AudioContext) i w eksporcie WAV (OfflineAudioContext).
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------- utils
  const SEMI = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function noteFreq(n) {
    const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
    if (!m) return 0;
    const midi = SEMI[m[1]] + (parseInt(m[2], 10) + 1) * 12;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  const noiseCache = new WeakMap();
  function noise(ctx) {
    let b = noiseCache.get(ctx);
    if (!b) {
      const len = ctx.sampleRate * 2;
      b = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      noiseCache.set(ctx, b);
    }
    return b;
  }
  const curveCache = new WeakMap();
  function distCurve(ctx, k) {
    let map = curveCache.get(ctx);
    if (!map) { map = {}; curveCache.set(ctx, map); }
    if (!map[k]) {
      const n = 1024, c = new Float32Array(n);
      for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
      map[k] = c;
    }
    return map[k];
  }

  function gainEnv(ctx, out, t, a, hold, r, peak) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + a + Math.max(0, hold));
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + Math.max(0, hold) + r);
    g.connect(out);
    return g;
  }
  function osc(ctx, type, f, t, end, out) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    o.connect(out);
    o.start(t);
    o.stop(end);
    return o;
  }
  function noiseSrc(ctx, t, end, out, rate) {
    const s = ctx.createBufferSource();
    s.buffer = noise(ctx);
    s.loop = true;
    if (rate) s.playbackRate.value = rate;
    s.connect(out);
    s.start(t, Math.random() * 1.5);
    s.stop(end);
    return s;
  }
  function filter(ctx, type, f, q, out) {
    const b = ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    if (q !== undefined) b.Q.value = q;
    b.connect(out);
    return b;
  }
  function shaper(ctx, k, out) {
    const w = ctx.createWaveShaper();
    w.curve = distCurve(ctx, k);
    w.connect(out);
    return w;
  }

  // ---------------------------------------------------------- instruments
  const INST = {
    lead(ctx, out, t, f, dur, v) {
      const g = gainEnv(ctx, out, t, 0.006, dur - 0.03, 0.09, 0.11 * v);
      const lp = filter(ctx, 'lowpass', 3200, 0.7, g);
      const o1 = osc(ctx, 'square', f, t, t + dur + 0.15, lp);
      const g2 = ctx.createGain(); g2.gain.value = 0.5; g2.connect(lp);
      const o2 = osc(ctx, 'sawtooth', f, t, t + dur + 0.15, g2);
      o2.detune.value = 8;
      if (dur > 0.18) {
        const lfo = ctx.createOscillator(); lfo.frequency.value = 5.8;
        const dg = ctx.createGain();
        dg.gain.setValueAtTime(0, t);
        dg.gain.setValueAtTime(0, t + 0.14);
        dg.gain.linearRampToValueAtTime(f * 0.014, t + 0.3);
        lfo.connect(dg); dg.connect(o1.frequency); dg.connect(o2.frequency);
        lfo.start(t); lfo.stop(t + dur + 0.15);
      }
    },
    brass(ctx, out, t, f, dur, v) {
      const g = gainEnv(ctx, out, t, 0.02, dur - 0.04, 0.12, 0.09 * v);
      const lp = filter(ctx, 'lowpass', 600, 2, g);
      lp.frequency.setValueAtTime(500, t);
      lp.frequency.linearRampToValueAtTime(2800, t + 0.06);
      lp.frequency.exponentialRampToValueAtTime(1300, t + 0.3);
      osc(ctx, 'sawtooth', f, t, t + dur + 0.2, lp);
      const o = osc(ctx, 'sawtooth', f, t, t + dur + 0.2, lp); o.detune.value = -10;
    },
    bass(ctx, out, t, f, dur, v) {
      const g = gainEnv(ctx, out, t, 0.004, dur - 0.02, 0.06, 0.22 * v);
      const lp = filter(ctx, 'lowpass', 900, 6, g);
      lp.frequency.setValueAtTime(1800, t);
      lp.frequency.exponentialRampToValueAtTime(260, t + 0.18);
      osc(ctx, 'sawtooth', f, t, t + dur + 0.1, lp);
      const sg = ctx.createGain(); sg.gain.value = 0.7; sg.connect(g);
      osc(ctx, 'sine', f, t, t + dur + 0.1, sg);
    },
    arp(ctx, out, t, f, dur, v) {
      const g = gainEnv(ctx, out, t, 0.002, 0.01, 0.16, 0.09 * v);
      osc(ctx, 'triangle', f, t, t + 0.25, g);
      const g2 = gainEnv(ctx, out, t, 0.002, 0, 0.05, 0.03 * v);
      osc(ctx, 'square', f * 2, t, t + 0.1, g2);
    },
    pad(ctx, out, t, f, dur, v) {
      const g = gainEnv(ctx, out, t, Math.min(0.25, dur * 0.4), dur - 0.25, 0.35, 0.035 * v);
      const lp = filter(ctx, 'lowpass', 1100, 0.5, g);
      [-12, 12, 0].forEach(d => { const o = osc(ctx, 'sawtooth', f, t, t + dur + 0.5, lp); o.detune.value = d; });
    },
    pluck(ctx, out, t, f, dur, v) {
      const g = gainEnv(ctx, out, t, 0.002, 0.02, Math.min(0.4, dur + 0.1), 0.12 * v);
      const lp = filter(ctx, 'lowpass', 4000, 3, g);
      lp.frequency.setValueAtTime(4200, t);
      lp.frequency.exponentialRampToValueAtTime(500, t + 0.25);
      osc(ctx, 'sawtooth', f, t, t + dur + 0.45, lp);
      const o = osc(ctx, 'square', f * 1.003, t, t + dur + 0.45, lp); o.detune.value = -6;
    },
    bell(ctx, out, t, f, dur, v) {
      const g = gainEnv(ctx, out, t, 0.002, 0.02, 0.9, 0.07 * v);
      const car = osc(ctx, 'sine', f, t, t + 1.1, g);
      const mod = ctx.createOscillator(); mod.frequency.value = f * 3.5;
      const mg = ctx.createGain(); mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(1, t + 0.8);
      mod.connect(mg); mg.connect(car.frequency); mod.start(t); mod.stop(t + 1.1);
    },
    kick(ctx, out, t, v) {
      const g = gainEnv(ctx, out, t, 0.001, 0.02, 0.28, 0.9 * v);
      const o = osc(ctx, 'sine', 160, t, t + 0.35, g);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
      const cg = gainEnv(ctx, out, t, 0.001, 0, 0.015, 0.3 * v);
      noiseSrc(ctx, t, t + 0.03, filter(ctx, 'lowpass', 3000, 0.5, cg));
    },
    snare(ctx, out, t, v) {
      const g = gainEnv(ctx, out, t, 0.001, 0.01, 0.17, 0.42 * v);
      noiseSrc(ctx, t, t + 0.22, filter(ctx, 'bandpass', 2200, 0.7, g));
      const tg = gainEnv(ctx, out, t, 0.001, 0, 0.08, 0.35 * v);
      const o = osc(ctx, 'triangle', 220, t, t + 0.1, tg);
      o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    },
    hat(ctx, out, t, v) {
      const g = gainEnv(ctx, out, t, 0.001, 0, 0.035, 0.16 * v);
      noiseSrc(ctx, t, t + 0.05, filter(ctx, 'highpass', 7500, 0.7, g));
    },
    ohat(ctx, out, t, v) {
      const g = gainEnv(ctx, out, t, 0.001, 0.02, 0.2, 0.13 * v);
      noiseSrc(ctx, t, t + 0.26, filter(ctx, 'highpass', 6500, 0.7, g));
    },
    tom(ctx, out, t, v) {
      const g = gainEnv(ctx, out, t, 0.001, 0.02, 0.22, 0.6 * v);
      const o = osc(ctx, 'sine', 210, t, t + 0.3, g);
      o.frequency.exponentialRampToValueAtTime(85, t + 0.2);
    },
    crash(ctx, out, t, v) {
      const g = gainEnv(ctx, out, t, 0.001, 0.05, 1.1, 0.2 * v);
      noiseSrc(ctx, t, t + 1.3, filter(ctx, 'highpass', 4200, 0.5, g));
    }
  };
  const DRUM_KEYS = { k: 'kick', s: 'snare', h: 'hat', o: 'ohat', t: 'tom', c: 'crash' };

  // ----------------------------------------------------------------- SFX
  function voice(ctx, out, t, f0, f1, dur, formants, vol) {
    const g = gainEnv(ctx, out, t, 0.01, dur * 0.4, dur * 0.6, vol);
    const pre = ctx.createGain(); pre.gain.value = 1;
    formants.forEach((ff, i) => {
      const fg = ctx.createGain(); fg.gain.value = [1, 0.6, 0.3][i] || 0.2; fg.connect(g);
      const bp = filter(ctx, 'bandpass', ff, 7, fg);
      pre.connect(bp);
    });
    const o = osc(ctx, 'sawtooth', f0, t, t + dur + 0.05, pre);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const ng = ctx.createGain(); ng.gain.value = 0.25; ng.connect(pre);
    noiseSrc(ctx, t, t + dur, ng);
  }

  const SFX = {
    punch(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.001, 0.01, 0.07, 0.7);
      noiseSrc(ctx, t, t + 0.1, filter(ctx, 'lowpass', 1400, 1, g));
      const g2 = gainEnv(ctx, out, t, 0.001, 0, 0.09, 0.6);
      const o = osc(ctx, 'sine', 190, t, t + 0.12, g2);
      o.frequency.exponentialRampToValueAtTime(55, t + 0.09);
    },
    hit(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.001, 0.015, 0.1, 0.7);
      noiseSrc(ctx, t, t + 0.14, filter(ctx, 'bandpass', 2600, 1.2, g));
      const g2 = gainEnv(ctx, out, t, 0.001, 0.01, 0.1, 0.35);
      const o = osc(ctx, 'square', 320, t, t + 0.13, filter(ctx, 'lowpass', 1500, 1, g2));
      o.frequency.exponentialRampToValueAtTime(70, t + 0.1);
      SFX.punch(ctx, out, t);
    },
    heavy(ctx, out, t) {
      const d = shaper(ctx, 8, gainEnv(ctx, out, t, 0.001, 0.04, 0.3, 0.6));
      const o = osc(ctx, 'sine', 130, t, t + 0.4, d);
      o.frequency.exponentialRampToValueAtTime(34, t + 0.28);
      const g = gainEnv(ctx, out, t, 0.001, 0.03, 0.22, 0.6);
      noiseSrc(ctx, t, t + 0.3, filter(ctx, 'lowpass', 2200, 1, g));
      SFX.hit(ctx, out, t);
    },
    whoosh(ctx, out, t) {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.6, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
      g.connect(out);
      const bp = filter(ctx, 'bandpass', 500, 2.5, g);
      bp.frequency.setValueAtTime(400, t);
      bp.frequency.exponentialRampToValueAtTime(2600, t + 0.15);
      noiseSrc(ctx, t, t + 0.2, bp);
    },
    jump(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.002, 0.03, 0.08, 0.12);
      const o = osc(ctx, 'square', 200, t, t + 0.15, filter(ctx, 'lowpass', 2000, 1, g));
      o.frequency.exponentialRampToValueAtTime(560, t + 0.11);
    },
    land(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.001, 0.01, 0.08, 0.5);
      noiseSrc(ctx, t, t + 0.1, filter(ctx, 'lowpass', 450, 1, g));
      const g2 = gainEnv(ctx, out, t, 0.001, 0, 0.08, 0.4);
      const o = osc(ctx, 'sine', 100, t, t + 0.1, g2);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.08);
    },
    grab(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.001, 0.01, 0.05, 0.45);
      noiseSrc(ctx, t, t + 0.07, filter(ctx, 'bandpass', 1100, 2, g));
      const g2 = gainEnv(ctx, out, t, 0.001, 0.01, 0.06, 0.2);
      osc(ctx, 'triangle', 420, t, t + 0.08, g2);
    },
    throw(ctx, out, t) {
      SFX.whoosh(ctx, out, t);
      SFX.whoosh(ctx, out, t + 0.07);
      voice(ctx, out, t, 210, 150, 0.2, [750, 1150, 2500], 0.35);
    },
    crash(ctx, out, t) {
      for (let i = 0; i < 6; i++) {
        const tt = t + i * 0.025 + Math.random() * 0.02;
        const g = gainEnv(ctx, out, tt, 0.001, 0.005, 0.06 + Math.random() * 0.06, 0.4);
        noiseSrc(ctx, tt, tt + 0.14, filter(ctx, 'bandpass', 500 + Math.random() * 1400, 3, g));
      }
      const g2 = gainEnv(ctx, out, t, 0.001, 0.02, 0.15, 0.5);
      const o = osc(ctx, 'sine', 110, t, t + 0.2, g2);
      o.frequency.exponentialRampToValueAtTime(50, t + 0.15);
    },
    pickup(ctx, out, t) {
      [660, 880, 1320].forEach((f, i) => {
        const g = gainEnv(ctx, out, t + i * 0.05, 0.002, 0.03, 0.06, 0.13);
        osc(ctx, 'square', f, t + i * 0.05, t + i * 0.05 + 0.12, g);
      });
    },
    food(ctx, out, t) {
      ['C6', 'E6', 'G6', 'C7', 'E7'].forEach((n, i) => {
        const tt = t + i * 0.055;
        const g = gainEnv(ctx, out, tt, 0.002, 0.02, 0.12, 0.14);
        osc(ctx, 'triangle', noteFreq(n), tt, tt + 0.18, g);
        const g2 = gainEnv(ctx, out, tt, 0.002, 0, 0.05, 0.05);
        osc(ctx, 'square', noteFreq(n) * 2, tt, tt + 0.08, g2);
      });
    },
    coin(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.002, 0.05, 0.05, 0.12);
      osc(ctx, 'square', noteFreq('B5'), t, t + 0.07, g);
      const g2 = gainEnv(ctx, out, t + 0.07, 0.002, 0.12, 0.2, 0.12);
      osc(ctx, 'square', noteFreq('E6'), t + 0.07, t + 0.45, g2);
    },
    gun(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.001, 0.01, 0.22, 0.8);
      const lp = filter(ctx, 'lowpass', 5000, 0.7, g);
      lp.frequency.setValueAtTime(6000, t);
      lp.frequency.exponentialRampToValueAtTime(400, t + 0.2);
      noiseSrc(ctx, t, t + 0.3, lp);
      const d = shaper(ctx, 12, gainEnv(ctx, out, t, 0.001, 0.02, 0.18, 0.5));
      const o = osc(ctx, 'sine', 220, t, t + 0.25, d);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.16);
      // echo ogona
      const g3 = gainEnv(ctx, out, t + 0.12, 0.01, 0.02, 0.35, 0.12);
      noiseSrc(ctx, t + 0.12, t + 0.5, filter(ctx, 'lowpass', 900, 0.7, g3));
    },
    empty(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.001, 0, 0.02, 0.3);
      noiseSrc(ctx, t, t + 0.03, filter(ctx, 'highpass', 3000, 1, g));
      const g2 = gainEnv(ctx, out, t + 0.06, 0.001, 0, 0.02, 0.25);
      noiseSrc(ctx, t + 0.06, t + 0.09, filter(ctx, 'highpass', 2500, 1, g2));
    },
    screech(ctx, out, t) {
      const dur = 0.5;
      const g = gainEnv(ctx, out, t, 0.02, 0.2, 0.28, 0.32);
      const bp = filter(ctx, 'bandpass', 1500, 1.6, g);
      const o = osc(ctx, 'sawtooth', 700, t, t + dur + 0.05, bp);
      o.frequency.linearRampToValueAtTime(1500, t + 0.12);
      o.frequency.linearRampToValueAtTime(1150, t + 0.3);
      o.frequency.exponentialRampToValueAtTime(480, t + dur);
      const o2 = osc(ctx, 'square', 712, t, t + dur + 0.05, bp);
      o2.frequency.linearRampToValueAtTime(1530, t + 0.12);
      o2.frequency.exponentialRampToValueAtTime(500, t + dur);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 34;
      const lg = ctx.createGain(); lg.gain.value = 90;
      lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
      lfo.start(t); lfo.stop(t + dur);
      const ng = gainEnv(ctx, out, t, 0.02, 0.15, 0.2, 0.12);
      noiseSrc(ctx, t, t + dur, filter(ctx, 'highpass', 3500, 0.7, ng));
    },
    roar(ctx, out, t) {
      const dur = 1.0;
      const g = gainEnv(ctx, out, t, 0.08, 0.45, 0.45, 0.5);
      const d = shaper(ctx, 20, filter(ctx, 'lowpass', 900, 1, g));
      const am = ctx.createGain(); am.connect(d);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 23;
      const lg = ctx.createGain(); lg.gain.value = 0.45;
      lfo.connect(lg); lg.connect(am.gain); lfo.start(t); lfo.stop(t + dur);
      const o = osc(ctx, 'sawtooth', 95, t, t + dur + 0.05, am);
      o.frequency.linearRampToValueAtTime(130, t + 0.3);
      o.frequency.exponentialRampToValueAtTime(55, t + dur);
      noiseSrc(ctx, t, t + dur, filter(ctx, 'lowpass', 700, 1, am));
    },
    bite(ctx, out, t) {
      [0, 0.09].forEach(o => {
        const g = gainEnv(ctx, out, t + o, 0.001, 0.01, 0.05, 0.6);
        noiseSrc(ctx, t + o, t + o + 0.08, filter(ctx, 'bandpass', 1300, 2, g));
      });
      SFX.punch(ctx, out, t);
    },
    pHurt(ctx, out, t) { voice(ctx, out, t, 190, 120, 0.22, [720, 1220, 2600], 0.5); },
    eHurt(ctx, out, t) { voice(ctx, out, t, 135 + Math.random() * 20, 90, 0.2, [520, 950, 2400], 0.5); },
    eDie(ctx, out, t) { voice(ctx, out, t, 170, 55, 0.7, [650, 1050, 2400], 0.55); },
    ko(ctx, out, t) {
      SFX.heavy(ctx, out, t);
      const g = gainEnv(ctx, out, t + 0.05, 0.01, 0.3, 0.9, 0.22);
      noiseSrc(ctx, t + 0.05, t + 1.3, filter(ctx, 'highpass', 4000, 0.5, g));
    },
    slam(ctx, out, t) {
      const d = shaper(ctx, 15, gainEnv(ctx, out, t, 0.001, 0.08, 0.6, 0.7));
      const o = osc(ctx, 'sine', 90, t, t + 0.8, d);
      o.frequency.exponentialRampToValueAtTime(28, t + 0.6);
      const g = gainEnv(ctx, out, t, 0.001, 0.05, 0.6, 0.5);
      noiseSrc(ctx, t, t + 0.7, filter(ctx, 'lowpass', 1200, 0.7, g));
      SFX.crash(ctx, out, t + 0.02);
    },
    zap(ctx, out, t) {
      const dur = 0.45;
      const g = gainEnv(ctx, out, t, 0.002, dur * 0.5, dur * 0.5, 0.25);
      const am = ctx.createGain(); am.connect(g);
      const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 38;
      const lg = ctx.createGain(); lg.gain.value = 0.6;
      lfo.connect(lg); lg.connect(am.gain); lfo.start(t); lfo.stop(t + dur);
      noiseSrc(ctx, t, t + dur, filter(ctx, 'bandpass', 3200, 1.5, am));
      const o = osc(ctx, 'sawtooth', 62, t, t + dur, filter(ctx, 'lowpass', 2500, 1, am));
      o.frequency.linearRampToValueAtTime(120, t + dur);
    },
    charge(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.05, 0.35, 0.1, 0.18);
      const o = osc(ctx, 'sawtooth', 90, t, t + 0.55, filter(ctx, 'lowpass', 1600, 4, g));
      o.frequency.exponentialRampToValueAtTime(420, t + 0.45);
    },
    go(ctx, out, t) {
      [0, 0.16].forEach(o => {
        const g = gainEnv(ctx, out, t + o, 0.002, 0.07, 0.03, 0.14);
        osc(ctx, 'square', 988, t + o, t + o + 0.12, g);
      });
    },
    select(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.002, 0.03, 0.06, 0.13);
      const o = osc(ctx, 'square', 660, t, t + 0.12, g);
      o.frequency.setValueAtTime(990, t + 0.04);
    },
    start(ctx, out, t) {
      ['C5', 'G5', 'C6', 'E6', 'G6'].forEach((n, i) => {
        const tt = t + i * 0.06;
        const g = gainEnv(ctx, out, tt, 0.002, 0.05, 0.15, 0.12);
        osc(ctx, 'square', noteFreq(n), tt, tt + 0.25, g);
      });
      INST.crash(ctx, out, t + 0.3, 0.8);
    },
    explode(ctx, out, t) {
      const d = shaper(ctx, 18, gainEnv(ctx, out, t, 0.001, 0.1, 0.9, 0.8));
      const o = osc(ctx, 'sine', 80, t, t + 1.1, d);
      o.frequency.exponentialRampToValueAtTime(25, t + 0.8);
      const g = gainEnv(ctx, out, t, 0.001, 0.08, 1.0, 0.75);
      const lp = filter(ctx, 'lowpass', 3000, 0.6, g);
      lp.frequency.setValueAtTime(3500, t); lp.frequency.exponentialRampToValueAtTime(200, t + 1.0);
      noiseSrc(ctx, t, t + 1.2, lp);
      SFX.crash(ctx, out, t + 0.03);
    },
    fuse(ctx, out, t) {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(out);
      for (let i = 0; i < 8; i++) { g.gain.setValueAtTime(0.18, t + i * 0.06); g.gain.setValueAtTime(0.05, t + i * 0.06 + 0.03); }
      g.gain.setValueAtTime(0, t + 0.5);
      noiseSrc(ctx, t, t + 0.5, filter(ctx, 'highpass', 5000, 1, g));
    },
    whip(ctx, out, t) {
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.25, t + 0.12); g.gain.setValueAtTime(0.9, t + 0.13); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); g.connect(out);
      const bp = filter(ctx, 'bandpass', 600, 2, g); bp.frequency.setValueAtTime(600, t); bp.frequency.exponentialRampToValueAtTime(5000, t + 0.13);
      noiseSrc(ctx, t, t + 0.22, bp);
    },
    harpoon(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.001, 0.02, 0.35, 0.4);
      const o = osc(ctx, 'triangle', 420, t, t + 0.4, g); o.frequency.exponentialRampToValueAtTime(140, t + 0.35);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 28; const lg = ctx.createGain(); lg.gain.value = 40;
      lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + 0.4);
      SFX.gun(ctx, out, t);
    },
    warp(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.01, 0.15, 0.2, 0.22);
      const o = osc(ctx, 'sine', 1800, t, t + 0.4, g); o.frequency.exponentialRampToValueAtTime(120, t + 0.32);
      const o2 = osc(ctx, 'square', 900, t, t + 0.4, filter(ctx, 'lowpass', 2500, 1, g)); o2.frequency.exponentialRampToValueAtTime(60, t + 0.32);
    },
    energy(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.01, 0.3, 0.3, 0.3);
      const bp = filter(ctx, 'bandpass', 800, 3, g); bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(2400, t + 0.5);
      osc(ctx, 'sawtooth', 110, t, t + 0.65, bp);
      const o = osc(ctx, 'sawtooth', 112, t, t + 0.65, bp); o.detune.value = 30;
      noiseSrc(ctx, t, t + 0.6, filter(ctx, 'highpass', 3000, 1, gainEnv(ctx, out, t, 0.01, 0.3, 0.3, 0.08)));
    },
    thunder(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.005, 0.2, 1.8, 0.7);
      const lp = filter(ctx, 'lowpass', 900, 0.5, g); lp.frequency.setValueAtTime(1500, t); lp.frequency.exponentialRampToValueAtTime(120, t + 1.8);
      noiseSrc(ctx, t, t + 2.1, lp, 0.6);
    },
    // ---- zróżnicowane trafienia: pięść / kopnięcie / rura / łańcuch / ostrze / tarcza / garda
    kickHit(ctx, out, t) {
      const d = shaper(ctx, 6, gainEnv(ctx, out, t, 0.001, 0.03, 0.22, 0.65));
      const o = osc(ctx, 'sine', 115, t, t + 0.3, d);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.2);
      const g = gainEnv(ctx, out, t, 0.001, 0.015, 0.1, 0.5);
      noiseSrc(ctx, t, t + 0.14, filter(ctx, 'lowpass', 900, 1, g));
      SFX.punch(ctx, out, t);
    },
    pipeHit(ctx, out, t) {
      // metaliczny brzęk: nieharmoniczne alikwoty z długim wybrzmieniem
      [[523, 'square', 0.12], [1371, 'triangle', 0.16], [2214, 'sine', 0.12], [3460, 'sine', 0.06]].forEach(([f, ty, v], i) => {
        const g = gainEnv(ctx, out, t, 0.001, 0.005, 0.25 + i * 0.05, v);
        osc(ctx, ty, f * (0.98 + Math.random() * 0.04), t, t + 0.45, filter(ctx, 'bandpass', f, 4, g));
      });
      const g = gainEnv(ctx, out, t, 0.001, 0.01, 0.06, 0.6);
      noiseSrc(ctx, t, t + 0.08, filter(ctx, 'highpass', 1800, 1, g));
      SFX.punch(ctx, out, t);
    },
    chainHit(ctx, out, t) {
      // brzęk ogniw: szybka seria wysokich dźwięków
      for (let i = 0; i < 6; i++) {
        const tt = t + i * 0.017 + Math.random() * 0.008, f = 2300 + Math.random() * 1600;
        const g = gainEnv(ctx, out, tt, 0.001, 0.003, 0.07, 0.12);
        osc(ctx, 'triangle', f, tt, tt + 0.1, g);
        const gn = gainEnv(ctx, out, tt, 0.001, 0.002, 0.02, 0.18);
        noiseSrc(ctx, tt, tt + 0.03, filter(ctx, 'highpass', 4500, 1, gn));
      }
      SFX.hit(ctx, out, t);
    },
    blade(ctx, out, t) {
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.55, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); g.connect(out);
      const hp = filter(ctx, 'highpass', 2500, 0.8, g); hp.frequency.setValueAtTime(2500, t); hp.frequency.exponentialRampToValueAtTime(7000, t + 0.1);
      noiseSrc(ctx, t, t + 0.13, hp);
      const g2 = gainEnv(ctx, out, t + 0.01, 0.001, 0.01, 0.18, 0.07);
      osc(ctx, 'sine', 3300, t + 0.01, t + 0.25, g2);
      SFX.punch(ctx, out, t);
    },
    shieldHit(ctx, out, t) {
      // dzwon blachy: niskie, nieharmoniczne „bong”
      [[176, 0.32], [287, 0.2], [456, 0.12], [731, 0.06]].forEach(([f, v], i) => {
        const g = gainEnv(ctx, out, t, 0.001, 0.01, 0.55 - i * 0.08, v);
        osc(ctx, i ? 'sine' : 'triangle', f, t, t + 0.7, g);
      });
      const g = gainEnv(ctx, out, t, 0.001, 0.01, 0.08, 0.55);
      noiseSrc(ctx, t, t + 0.1, filter(ctx, 'bandpass', 1500, 1.5, g));
    },
    block(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.001, 0.01, 0.07, 0.5);
      noiseSrc(ctx, t, t + 0.09, filter(ctx, 'bandpass', 800, 1.4, g));
      const g2 = gainEnv(ctx, out, t, 0.001, 0.005, 0.12, 0.18);
      osc(ctx, 'triangle', 640, t, t + 0.16, g2);
    },
    drip(ctx, out, t) {
      const g = gainEnv(ctx, out, t, 0.001, 0.005, 0.09, 0.22);
      const o = osc(ctx, 'sine', 1500 + Math.random() * 700, t, t + 0.12, g);
      o.frequency.exponentialRampToValueAtTime(520, t + 0.06);
    },
    clack(ctx, out, t) {
      [0, 0.1].forEach(o => {
        const g = gainEnv(ctx, out, t + o, 0.001, 0.005, 0.06, 0.4);
        noiseSrc(ctx, t + o, t + o + 0.08, filter(ctx, 'bandpass', 700, 1.5, g));
        const g2 = gainEnv(ctx, out, t + o, 0.001, 0, 0.05, 0.25);
        osc(ctx, 'square', 160, t + o, t + o + 0.07, filter(ctx, 'lowpass', 600, 1, g2));
      });
    },
    oneup(ctx, out, t) {
      ['E6', 'G6', 'E7', 'C7', 'D7', 'G7'].forEach((n, i) => {
        const tt = t + i * 0.08;
        const g = gainEnv(ctx, out, tt, 0.002, 0.05, 0.03, 0.12);
        osc(ctx, 'square', noteFreq(n), tt, tt + 0.1, g);
      });
    }
  };

  // ------------------------------------------------------- głosy postaci
  // Krótkie okrzyki składane z sylab: samogłoska (formanty), kontur wysokości, opcjonalna spółgłoska szumowa.
  const VOWEL = { a: [800, 1200, 2600], e: [500, 1800, 2500], o: [520, 900, 2400], u: [350, 800, 2300], i: [320, 2200, 2900] };
  function syllable(ctx, out, t, pr, s) {
    const dur = s.d, vol = pr.vol * (s.a || 1);
    const g = gainEnv(ctx, out, t, 0.012, dur * 0.45, dur * 0.55, vol);
    const pre = ctx.createGain(); pre.gain.value = 1;
    VOWEL[s.v].forEach((ff, i) => {
      const fg = ctx.createGain(); fg.gain.value = [1, 0.55, 0.28][i]; fg.connect(g);
      pre.connect(filter(ctx, 'bandpass', ff * pr.fm, 6, fg));
    });
    const o = osc(ctx, 'sawtooth', pr.f * s.p0, t, t + dur + 0.05, pre);
    o.frequency.exponentialRampToValueAtTime(pr.f * s.p1, t + dur);
    if (pr.vib) {
      const lg = ctx.createGain(); lg.gain.value = pr.f * 0.04; lg.connect(o.frequency);
      osc(ctx, 'sine', pr.vib, t, t + dur + 0.05, lg);
    }
    // chrypa: szum przez te same formanty
    const ng = ctx.createGain(); ng.gain.value = pr.rough; ng.connect(pre);
    noiseSrc(ctx, t, t + dur, ng);
    // spółgłoska na początku sylaby (h, s, k)
    if (s.c) {
      const cg = gainEnv(ctx, out, t - 0.04, 0.005, 0.02, 0.03, vol * (s.c === 'k' ? 0.9 : 0.5));
      noiseSrc(ctx, t - 0.04, t + 0.03, filter(ctx, s.c === 's' ? 'highpass' : 'bandpass', s.c === 's' ? 4000 : s.c === 'k' ? 1800 : 1200, 1, cg));
    }
  }
  function shout(ctx, out, t, pr, line) {
    let tt = t;
    line.forEach(s => { tt += s.c ? 0.04 : 0; syllable(ctx, out, tt, pr, s); tt += s.d + (s.gap || 0.02); });
  }
  const S_ = (v, d, p0, p1, extra) => Object.assign({ v, d, p0, p1 }, extra);
  // profil: f — podstawa głosu (Hz), fm — przesunięcie formantów, rough — chrypa, vib — wibrato (Hz)
  const VOICES = {
    kruk: { f: 150, fm: 1, rough: 0.22, vib: 0, vol: 0.55,
      special: [S_('a', 0.08, 1.1, 1.25, { c: 'h' }), S_('a', 0.2, 1.4, 1.0, { c: 'h' })],
      super: [S_('o', 0.1, 1.0, 1.15), S_('a', 0.42, 1.35, 1.5, { c: 'k' })],
      win: [S_('e', 0.12, 1.1, 1.35, { c: 'h' }), S_('a', 0.32, 1.35, 0.95)],
      hurt: [S_('u', 0.16, 1.2, 0.8)] },
    nina: { f: 290, fm: 1.18, rough: 0.12, vib: 0, vol: 0.5,
      special: [S_('i', 0.07, 1.0, 1.2, { c: 'h' }), S_('a', 0.2, 1.3, 1.05)],
      super: [S_('i', 0.12, 1.1, 1.25, { c: 's' }), S_('a', 0.38, 1.45, 1.6, { c: 'h' })],
      win: [S_('i', 0.1, 1.2, 1.4, { c: 'h' }), S_('e', 0.08, 1.3, 1.3), S_('i', 0.28, 1.5, 1.2)],
      hurt: [S_('a', 0.14, 1.3, 0.9)] },
    tur: { f: 92, fm: 0.84, rough: 0.5, vib: 0, vol: 0.62,
      special: [S_('o', 0.12, 1.0, 0.95, { c: 'h' }), S_('a', 0.24, 1.2, 0.85, { c: 'h' })],
      super: [S_('o', 0.18, 0.95, 1.0, { c: 'h' }), S_('a', 0.5, 1.15, 1.35)],
      win: [S_('o', 0.14, 1.0, 1.0, { c: 'h' }), S_('o', 0.14, 1.0, 1.0, { c: 'h' }), S_('a', 0.3, 1.25, 1.0, { c: 'h' })],
      hurt: [S_('o', 0.18, 1.1, 0.75)] },
    borys: { f: 125, fm: 0.92, rough: 0.65, vib: 5, vol: 0.58,
      special: [S_('a', 0.1, 1.1, 1.0, { c: 'k' }), S_('a', 0.2, 1.3, 0.9)],
      super: [S_('u', 0.12, 1.0, 1.1, { c: 'h' }), S_('a', 0.45, 1.3, 1.25, { c: 'h' })],
      win: [S_('a', 0.09, 1.3, 1.2, { c: 'h' }), S_('a', 0.09, 1.25, 1.15, { c: 'h' }), S_('a', 0.09, 1.2, 1.1, { c: 'h' }), S_('a', 0.25, 1.2, 0.9, { c: 'h' })],
      hurt: [S_('u', 0.2, 1.1, 0.7)] },
    padlin: { f: 82, fm: 0.8, rough: 0.7, vib: 0, vol: 0.62,
      special: [S_('o', 0.14, 1.0, 0.9, { c: 'h' }), S_('a', 0.26, 1.15, 0.8, { c: 'h' })],
      super: [S_('u', 0.2, 0.9, 1.0, { c: 'h' }), S_('a', 0.55, 1.1, 1.3, { c: 'k' })],
      win: [S_('a', 0.12, 1.0, 1.1, { c: 'h' }), S_('a', 0.12, 1.05, 1.1, { c: 'h' }), S_('o', 0.4, 1.2, 0.8, { c: 'h' })],
      hurt: [S_('o', 0.2, 1.0, 0.7)] },
    zmijka: { f: 250, fm: 1.12, rough: 0.3, vib: 4, vol: 0.5,
      special: [S_('i', 0.16, 1.1, 1.0, { c: 's' }), S_('a', 0.18, 1.25, 1.05, { c: 's' })],
      super: [S_('i', 0.2, 1.0, 1.2, { c: 's' }), S_('a', 0.4, 1.4, 1.5, { c: 's' })],
      win: [S_('e', 0.1, 1.2, 1.3, { c: 's' }), S_('i', 0.32, 1.4, 1.1, { c: 's' })],
      hurt: [S_('a', 0.15, 1.2, 0.85, { c: 's' })] },
    bursztyn: { f: 112, fm: 0.95, rough: 0.08, vib: 6, vol: 0.55,
      special: [S_('e', 0.14, 1.0, 1.15, { c: 'h' }), S_('a', 0.22, 1.2, 0.95)],
      super: [S_('u', 0.2, 0.9, 1.0), S_('a', 0.5, 1.15, 1.45, { c: 'k' })],
      win: [S_('u', 0.12, 1.0, 1.05, { c: 'h' }), S_('u', 0.12, 1.05, 1.1, { c: 'h' }), S_('a', 0.4, 1.3, 0.85, { c: 'h' })],
      hurt: [S_('o', 0.16, 1.0, 0.8)] }
  };
  // ---- głosy wrogów: profile (wysokość, chrypa) i kilka wariantów każdego okrzyku, losowanych przy odtworzeniu
  const EVOICES = {
    grunt: { f: 140, fm: 0.96, rough: 0.38, vib: 0, vol: 0.5 },
    gruff: { f: 112, fm: 0.9, rough: 0.5, vib: 0, vol: 0.52 },
    thin: { f: 205, fm: 1.1, rough: 0.18, vib: 0, vol: 0.46 },
    brute: { f: 78, fm: 0.78, rough: 0.7, vib: 0, vol: 0.6 },
    masked: { f: 120, fm: 0.66, rough: 0.8, vib: 0, vol: 0.5 },
    boss: { f: 96, fm: 0.86, rough: 0.45, vib: 3, vol: 0.6 },
    hag: { f: 240, fm: 1.12, rough: 0.35, vib: 5, vol: 0.5 }
  };
  const ELINES = {
    attack: [[S_('a', 0.13, 1.1, 1.3, { c: 'h' })], [S_('e', 0.08, 1.2, 1.3, { c: 'h' }), S_('e', 0.08, 1.3, 1.1)],
      [S_('a', 0.1, 1.15, 1.25), S_('a', 0.12, 1.2, 1.0, { c: 's' })], [S_('o', 0.16, 1.0, 1.3, { c: 'h' })]],
    taunt: [[S_('a', 0.1, 1.0, 1.1, { c: 'k' }), S_('o', 0.24, 1.2, 1.0, { c: 'k' })],
      [S_('u', 0.08, 1.0, 1.1, { c: 'k' }), S_('e', 0.08, 1.1, 1.2, { c: 'h' }), S_('e', 0.22, 1.3, 1.0, { c: 's' })],
      [S_('e', 0.1, 1.1, 1.2, { c: 'h' }), S_('a', 0.08, 1.2, 1.2), S_('i', 0.2, 1.3, 1.5)],
      [S_('o', 0.12, 1.0, 1.0, { c: 'h' }), S_('o', 0.12, 1.05, 1.05, { c: 'h' }), S_('o', 0.22, 1.1, 0.9, { c: 'h' })]],
    hurt: [[S_('u', 0.14, 1.2, 0.8)], [S_('a', 0.12, 1.3, 0.9, { c: 'h' })], [S_('o', 0.09, 1.15, 0.9), S_('u', 0.09, 0.95, 0.7)], [S_('e', 0.12, 1.25, 0.85, { c: 'h' })]],
    die: [[S_('a', 0.12, 1.3, 1.25), S_('a', 0.5, 1.2, 0.45)], [S_('u', 0.1, 1.1, 1.0), S_('o', 0.55, 1.15, 0.42)], [S_('e', 0.08, 1.3, 1.3, { c: 'h' }), S_('a', 0.45, 1.25, 0.5)]]
  };
  Object.keys(EVOICES).forEach(pr => Object.keys(ELINES).forEach(kind => {
    SFX['e_' + pr + '_' + kind] = (ctx, out, t) => { const L = ELINES[kind]; shout(ctx, out, t, EVOICES[pr], L[Math.random() * L.length | 0]); };
  }));
  Object.keys(VOICES).forEach(hero => ['special', 'super', 'win', 'hurt'].forEach(kind => {
    SFX['v_' + hero + '_' + kind] = (ctx, out, t) => shout(ctx, out, t, VOICES[hero], VOICES[hero][kind]);
  }));

  // dodatkowa ścieżka perkusji (wchodzi przy dużym kombo albo gdy boss słabnie)
  const LAYER = ['kt', 'h', 't', 'h', 'sh', 'h', 't', 't', 'kt', 'h', 't', 'h', 'sh', 't', 's', 's'];

  // ---------------------------------------------------------- songs
  // Format trackerowy: token na 1/16. "A4" = nuta, "A3+C4+E4" = akord,
  // "." = przedłużenie, "-" = cisza. Perkusja: litery k s h o t c, np. "kh".
  function rep(str, n) { return Array(n).fill(str).join(' '); }

  const CH = {
    Am: ['A', 'C', 'E'], G: ['G', 'B', 'D'], F: ['F', 'A', 'C'], E: ['E', 'G#', 'B'],
    C: ['C', 'E', 'G'], Em: ['E', 'G', 'B'], B: ['B', 'D#', 'F#'], D: ['D', 'F#', 'A'],
    Bm: ['B', 'D', 'F#'], A: ['A', 'C#', 'E'], Dm: ['D', 'F', 'A'], 'F#m': ['F#', 'A', 'C#'],
    Cm: ['C', 'Eb', 'G'], Ab: ['Ab', 'C', 'Eb'], Bb: ['Bb', 'D', 'F'], Fm: ['F', 'Ab', 'C'],
    Gm: ['G', 'Bb', 'D'], 'F#': ['F#', 'A#', 'C#'], Eb: ['Eb', 'G', 'Bb'], 'C#m': ['C#', 'E', 'G#']
  };
  // rozkład akordu rosnąco od oktawy oct
  function voicing(chord, oct) {
    const notes = CH[chord]; let o = oct, prev = -1; const res = [];
    notes.forEach(n => { const s = SEMI[n]; if (s <= prev) o++; prev = s; res.push(n + o); });
    return res;
  }
  function padBar(chord, oct) { return voicing(chord, oct).join('+') + ' ' + rep('.', 15); }
  function arpBar(chord, oct, shape) {
    const v = voicing(chord, oct); const up = v.concat([CH[chord][0] + (oct + 1)]);
    return shape.map(i => up[i]).join(' ');
  }
  function bassBar(chord, oct, style) {
    const r = CH[chord][0], f = CH[chord][2];
    const R = r + oct, R2 = r + (oct + 1), F = f + (SEMI[f] < SEMI[r] ? oct + 1 : oct);
    const styles = {
      drive: [R, '.', R, R2, '-', R, R, '-', R, '.', R2, '-', R, F, R2, R],
      gallop: [R, R, R2, R, R, R2, R, R2, R, R, R2, R, F, F, R2, F],
      walk: [R, '.', '.', R2, '-', '.', F, '.', R, '.', '.', R2, '-', F, R2, '.'],
      long: [R, '.', '.', '.', '.', '.', '.', '.', F, '.', '.', '.', R, '.', '.', '.']
    };
    return styles[style].join(' ');
  }

  const SONG_DEFS = {
    stage1: (() => {
      const progA = ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'];
      const progB = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'E'];
      const prog = progA.concat(progB);
      const lead = [
        'A4 . . . E5 . . . D5 . C5 . B4 . C5 .',
        'D5 . . . . . B4 . G4 . . . B4 . D5 .',
        'C5 . . . A4 . . . F4 . A4 . C5 . F5 .',
        'E5 . . . . . . . G#4 . . . B4 . D5 .',
        'A4 . . . E5 . . . D5 . C5 . B4 . C5 .',
        'D5 . . . G5 . . . F5 . E5 . D5 . B4 .',
        'C5 . . . . . A4 . C5 . F5 . E5 . C5 .',
        'B4 . . . . . . . . . . . - . . .',
        'E5 . . . G5 . . . E5 . . . C5 . D5 .',
        'D5 . . . . . B4 . D5 . G5 . F5 . D5 .',
        'C5 . . . E5 . A5 . G5 . . . E5 . C5 .',
        'F5 . . . E5 . . . D5 . C5 . A4 . C5 .',
        'E5 . . . G5 . . . C6 . . . B5 . G5 .',
        'A5 . . . G5 . . . D5 . . . G5 . . .',
        'F5 . E5 . D5 . C5 . D5 . . . E5 . . .',
        'E5 . . . . . . . G#5 . . . B5 . . .'
      ].join(' ');
      const beat = 'kh - h - sh - h k - k h - sh - h h';
      const beat2 = 'kh - h - sh - h k - k h k sh - h o';
      const fill = 'kh - h - sh - h k s - s s t t t t';
      const drums = [];
      for (let i = 0; i < 16; i++) {
        let b = (i % 8 === 7) ? fill : (i % 2 ? beat2 : beat);
        if (i === 0 || i === 8) b = 'kc' + b.slice(2);
        drums.push(b);
      }
      return {
        bpm: 138,
        channels: {
          lead: { inst: 'lead', vol: 1, data: lead },
          bass: { inst: 'bass', vol: 1, data: prog.map(c => bassBar(c, 2, 'drive')).join(' ') },
          arp: { inst: 'arp', vol: 0.8, data: prog.map(c => arpBar(c, 4, [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 1])).join(' ') },
          pad: { inst: 'pad', vol: 1, data: prog.map(c => padBar(c, 3)).join(' ') },
          drums: { inst: 'drums', vol: 1, data: drums.join(' ') }
        }
      };
    })(),

    boss: (() => {
      const prog = ['Em', 'Em', 'C', 'B', 'Em', 'Em', 'C', 'B'];
      const lead = [
        'E5 . . . B4 . . . E5 . F#5 . G5 . . .',
        'F#5 . E5 . D#5 . . . B4 . . . . . . .',
        'C5 . . . E5 . . . G5 . . . F#5 . E5 .',
        'D#5 . . . . . . . F#5 . . . B5 . . .',
        'E6 . . . B5 . G5 . E5 . . . G5 . B5 .',
        'A5 . G5 . F#5 . G5 . E5 . . . . . . .',
        'C6 . . . B5 . A5 . G5 . A5 . B5 . C6 .',
        'B5 . . . . . . . D#5 . . . F#5 . A5 .'
      ].join(' ');
      const beat = 'kh h sh h kh k sh h kh h sh h kh k sh o';
      const drums = prog.map((c, i) => i === 7 ? 'kh h sh h kh k sh h s s t t s s t c' : (i === 0 ? 'kc' + beat.slice(2) : beat));
      return {
        bpm: 152,
        channels: {
          lead: { inst: 'lead', vol: 1, data: lead },
          brass: { inst: 'brass', vol: 0.8, data: prog.map(c => voicing(c, 3).join('+') + ' . . - - - ' + voicing(c, 3).join('+') + ' . - - - - ' + voicing(c, 3).join('+') + ' . . -').join(' ') },
          bass: { inst: 'bass', vol: 1, data: prog.map(c => bassBar(c, 2, 'gallop')).join(' ') },
          drums: { inst: 'drums', vol: 1, data: drums.join(' ') }
        }
      };
    })(),

    title: (() => {
      const prog = ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'A'];
      const lead = [
        'D5 . . . A4 . D5 . F#5 . . . E5 . D5 .',
        'E5 . . . . . F#5 . D5 . . . B4 . . .',
        'G4 . B4 . D5 . G5 . F#5 . . . E5 . D5 .',
        'E5 . . . . . . . . . . . A4 . C#5 .',
        'D5 . . . A5 . . . F#5 . . . A5 . D6 .',
        'C#6 . . . B5 . . . F#5 . . . D5 . . .',
        'G5 . F#5 . E5 . D5 . E5 . . . F#5 . G5 .',
        'A5 . . . . . . . . . . . - . . .'
      ].join(' ');
      const beat = 'k - h - s - h - k - k - s - h h';
      const drums = prog.map((c, i) => i === 0 || i === 4 ? 'kc' + beat.slice(1) : (i === 7 ? 'k - h - s - h - t t t t s s s s' : beat));
      return {
        bpm: 120,
        channels: {
          lead: { inst: 'lead', vol: 1, data: lead },
          brass: { inst: 'brass', vol: 0.9, data: prog.map(c => voicing(c, 3).join('+') + ' . . . . . - ' + voicing(c, 3).join('+') + ' . - ' + voicing(c, 3).join('+') + ' . . . . .').join(' ') },
          bass: { inst: 'bass', vol: 1, data: prog.map(c => bassBar(c, 2, 'walk')).join(' ') },
          arp: { inst: 'arp', vol: 0.6, data: prog.map(c => arpBar(c, 5, [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3])).join(' ') },
          drums: { inst: 'drums', vol: 0.9, data: drums.join(' ') }
        }
      };
    })(),

    clear: {
      bpm: 140, loop: false,
      channels: {
        lead: { inst: 'lead', vol: 1, data: 'C5 . E5 . G5 . C6 . . . G5 . C6 . . . D6 . . . . . . . E6 . . . . . . . . . . . - . . .' },
        brass: { inst: 'brass', vol: 1, data: 'C4+E4+G4 . . . . . . . . . . . . . . . Bb3+D4+F4 . . . . . . . C4+E4+G4 . . . . . . . . . . . - . . .' },
        bass: { inst: 'bass', vol: 1, data: 'C2 . . . C3 . . . C2 . . . C3 . . . Bb1 . . . . . . . C2 . . . . . . . . . . . - . . .' },
        drums: { inst: 'drums', vol: 1, data: 'kc - - - s - - - k - - - s s s s kc - - - - - - - kc - - - - - - - - - - - - - - -' }
      }
    },

    gameover: {
      bpm: 84, loop: false,
      channels: {
        lead: { inst: 'lead', vol: 1, data: 'A4 . . . G4 . . . F4 . . . E4 . . . D4 . . . . . . . C#4 . . . . . . . . . . . - . . .' },
        pad: { inst: 'pad', vol: 1.2, data: 'A2+C3+E3 . . . . . . . . . . . . . . . Bb2+D3+F3 . . . . . . . A2+C#3+E3 . . . . . . . . . . . - . . .' },
        bass: { inst: 'bass', vol: 1, data: 'A1 . . . . . . . . . . . . . . . Bb1 . . . . . . . A1 . . . . . . . . . . . - . . .' }
      }
    },

    // ---- etapy 2–6 i bossowie (aranżowane przez arrange())
    stage2: arrange({
      bpm: 112, prog: ['Dm', 'G', 'Dm', 'G', 'F', 'C', 'Dm', 'A'], bass: 'walk', leadInst: 'pluck',
      arp: { oct: 4, shape: [0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 3], inst: 'bell', vol: 0.5 }, pad: 3,
      beat: 'k - h h s - h k k - h h s - h -', fill: 'k - h h s - h k s s t - t t s s',
      lead: [
        'D5 . . . F5 . A5 . G5 . F5 . D5 . . .', 'B4 . . . D5 . . . E5 . D5 . B4 . . .',
        'D5 . . . F5 . A5 . C6 . A5 . G5 . F5 .', 'G5 . . . . . . . D5 . . . B4 . . .',
        'A5 . . . G5 . F5 . E5 . F5 . G5 . . .', 'E5 . . . . . C5 . E5 . G5 . C6 . . .',
        'A5 . G5 . F5 . E5 . D5 . . . F5 . E5 .', 'C#5 . . . . . . . E5 . . . A4 . . .']
    }),
    stage3: arrange({
      bpm: 128, prog: ['F#m', 'D', 'A', 'E', 'Bm', 'D', 'F#m', 'E'], bass: 'drive',
      arp: { oct: 4, shape: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 2, 1, 2, 3], inst: 'pluck', vol: 0.55 }, pad: 3,
      beat: 'kh h sh h kh h sh h kh h sh h kh h sh o', fill: 'kh h sh h kh h sh h s s s s t t t c',
      lead: [
        'F#5 . . . C#6 . . . A5 . . . G#5 . F#5 .', 'F#5 . . . . . E5 . D5 . . . A4 . . .',
        'C#5 . . . E5 . A5 . G#5 . A5 . B5 . C#6 .', 'B5 . . . . . . . G#5 . . . E5 . . .',
        'D6 . . . C#6 . B5 . F#5 . . . B5 . . .', 'A5 . . . F#5 . . . D5 . E5 . F#5 . A5 .',
        'C#6 . . . B5 . A5 . G#5 . A5 . F#5 . . .', 'G#5 . . . . . . . . . . . - . . .']
    }),
    stage4: arrange({
      bpm: 146, prog: ['Cm', 'Cm', 'Ab', 'Bb', 'Cm', 'Cm', 'Fm', 'G'], bass: 'gallop', brass: 3,
      beat: 'kh h sh k kh k sh h kh h sh k kh k sh o', fill: 'kh k sh k kh k sh k t t t t s s s c',
      lead: [
        'C5 . . . G4 . C5 . Eb5 . . . D5 . C5 .', 'G5 . . . . . F5 . Eb5 . D5 . C5 . . .',
        'Eb5 . . . C5 . Eb5 . Ab5 . . . G5 . F5 .', 'D5 . . . . . F5 . Bb5 . . . A5 . Bb5 .',
        'C6 . . . G5 . . . Eb5 . G5 . C6 . D6 .', 'Eb6 . . . D6 . C6 . G5 . . . . . . .',
        'F5 . . . Ab5 . C6 . Bb5 . Ab5 . G5 . F5 .', 'G5 . . . . . . . B4 . . . D5 . F5 .']
    }),
    stage5: arrange({
      bpm: 132, prog: ['G', 'F', 'C', 'G', 'Em', 'C', 'D', 'D'], bass: 'walk', pad: 3,
      arp: { oct: 4, shape: [0, 2, 3, 2, 1, 2, 3, 2, 0, 2, 3, 2, 1, 2, 3, 2], inst: 'arp', vol: 0.7 },
      beat: 'k - h - s - h k - k h - s - h h', fill: 'k - h - s - h k s s s s t t t t',
      lead: [
        'G5 . . . D5 . G5 . B5 . . . A5 . G5 .', 'A5 . . . F5 . . . C5 . . . F5 . A5 .',
        'G5 . . . E5 . C5 . E5 . G5 . C6 . . .', 'B5 . . . . . . . D5 . . . G5 . . .',
        'G5 . . . B5 . . . E6 . D6 . B5 . G5 .', 'E5 . . . G5 . . . C6 . B5 . A5 . G5 .',
        'F#5 . . . A5 . . . D6 . . . C6 . A5 .', 'F#5 . . . . . . . D5 . E5 . F#5 . A5 .']
    }),
    stage6: arrange({
      bpm: 150, prog: ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'Em', 'F#'], bass: 'drive', brass: 3, pad: 3,
      beat: 'kh h sh h kh k sh h kh h sh h kh k sh o', fill: 'kh h sh h kh k sh h s s t t s s t c',
      lead: [
        'B4 . . . F#5 . . . B5 . A5 . F#5 . D5 .', 'E5 . . . . . D5 . B4 . . . D5 . E5 .',
        'F#5 . . . A5 . . . D6 . C#6 . A5 . F#5 .', 'E5 . . . . . . . C#5 . E5 . A5 . . .',
        'B5 . . . . . A5 . F#5 . . . D6 . . .', 'C#6 . B5 . A5 . G5 . F#5 . . . E5 . . .',
        'G5 . . . F#5 . E5 . B5 . . . G5 . E5 .', 'F#5 . . . . . . . A#4 . . . C#5 . E5 .']
    }),
    // Opuszczona Plaża — zmęczony surf-rock w molu, szarpana gitara
    beach: arrange({
      bpm: 138, prog: ['Am', 'G', 'F', 'E', 'Am', 'G', 'Dm', 'E'], bass: 'drive',
      arp: { oct: 4, shape: [0, 2, 1, 2, 0, 2, 1, 3, 0, 2, 1, 2, 0, 2, 3, 2], inst: 'pluck', vol: 0.6 },
      beat: 'k - h - s - h k k - h - s - h h', fill: 'k - h - s - h k s s t t t t s c',
      lead: [
        'A4 . . . C5 . E5 . . . D5 . C5 . . .', 'B4 . . . D5 . G5 . . . F5 . E5 . D5 .',
        'C5 . . . F5 . A5 . . . G5 . F5 . . .', 'E5 . . . . . G#4 . B4 . . . E5 . . .',
        'A5 . . . G5 . E5 . C5 . . . E5 . A5 .', 'G5 . . . F5 . D5 . B4 . . . D5 . . .',
        'F5 . . . E5 . D5 . A4 . . . D5 . F5 .', 'E5 . . . . . . . B4 . . . G#4 . . .']
    }),
    // Kanały Otchłani — ciężki, mroczny marsz z tomami
    sewer: arrange({
      bpm: 112, prog: ['Cm', 'Cm', 'Ab', 'Bb', 'Cm', 'Fm', 'Ab', 'G'], bass: 'walk', pad: 3,
      beat: 'kt - h - s - t - kt - h t s - t t', fill: 'kt - t - s - t t t t t t s s t c',
      lead: [
        'C5 . . . . . Eb5 . D5 . . . C5 . . .', 'G4 . . . . . . . Ab4 . G4 . F4 . G4 .',
        'Ab4 . . . C5 . . . Eb5 . . . D5 . C5 .', 'Bb4 . . . . . D5 . F5 . . . D5 . . .',
        'C5 . . . G5 . . . Eb5 . D5 . C5 . . .', 'F4 . . . Ab4 . C5 . F5 . . . Eb5 . D5 .',
        'Eb5 . . . C5 . Ab4 . Eb5 . . . F5 . G5 .', 'D5 . . . . . B4 . G4 . . . . . . .']
    }),
    beast: arrange({
      bpm: 160, prog: ['Em', 'F', 'Em', 'F', 'Em', 'F', 'G', 'F'], bass: 'gallop', brass: 3, leadInst: 'brass',
      beat: 'kh t sh t kh k sh t kh t sh t kh k sh o', fill: 'kh k sh k t t t t t t t t s s s c',
      lead: [
        'E4 . . . . . F4 . E4 . . . B3 . . .', 'C4 . . . . . B3 . A3 . . . C4 . . .',
        'E4 . G4 . F4 . E4 . B4 . . . A4 . G4 .', 'F4 . . . . . . . A4 . . . C5 . . .',
        'B4 . . . . . C5 . B4 . . . G4 . E4 .', 'F4 . . . A4 . . . C5 . . . A4 . F4 .',
        'G4 . . . B4 . . . D5 . . . C5 . B4 .', 'A4 . . . . . . . F4 . . . . . . .']
    }),
    final: arrange({
      bpm: 164, prog: ['Dm', 'Bb', 'C', 'A', 'Dm', 'Bb', 'Gm', 'A'], bass: 'gallop', brass: 3, pad: 3,
      beat: 'kh h sh h kh k sh h kh h sh k kh k sh o', fill: 'kh k sh k kh k sh k s s t t s s t c',
      lead: [
        'D5 . . . A5 . . . F5 . G5 . A5 . D6 .', 'C6 . . . Bb5 . A5 . F5 . . . D5 . . .',
        'E5 . . . G5 . C6 . Bb5 . A5 . G5 . E5 .', 'A5 . . . . . . . C#6 . . . E6 . . .',
        'F6 . . . E6 . D6 . A5 . . . F5 . A5 .', 'D6 . . . C6 . Bb5 . F5 . . . Bb5 . . .',
        'G5 . . . A5 . Bb5 . D6 . C6 . Bb5 . G5 .', 'A5 . . . . . . . E5 . . . C#5 . . .']
    }),
    drive: arrange({
      bpm: 156, prog: ['E', 'C#m', 'A', 'B', 'E', 'C#m', 'A', 'B'], bass: 'drive', brass: 3,
      arp: { oct: 4, shape: [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3], inst: 'pluck', vol: 0.5 },
      beat: 'kh h sh h kh k sh h kh h sh h kh k sh o', fill: 'kh h sh h kh k sh h s s s s t t t c',
      lead: [
        'E5 . . . B5 . . . G#5 . . . E5 . F#5 .', 'G#5 . . . . . E5 . C#5 . . . E5 . G#5 .',
        'A5 . . . C#6 . . . B5 . A5 . G#5 . A5 .', 'B5 . . . . . . . F#5 . . . D#5 . F#5 .',
        'E6 . . . D#6 . B5 . G#5 . . . B5 . E6 .', 'C#6 . . . B5 . G#5 . E5 . . . G#5 . . .',
        'A5 . B5 . C#6 . E6 . D#6 . C#6 . B5 . A5 .', 'B5 . . . . . . . D#6 . . . F#6 . . .']
    }),
    map: arrange({
      bpm: 118, prog: ['D', 'G', 'Bm', 'A', 'D', 'G', 'Em', 'A'], bass: 'walk', pad: 3,
      arp: { oct: 5, shape: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 3], inst: 'bell', vol: 0.45 },
      beat: 'k - h - s - h - k - h k s - h h', fill: 'k - h - s - h - s s t t t t s s',
      lead: [
        'D5 . . . F#5 . A5 . . . G5 . F#5 . . .', 'G5 . . . B5 . . . D6 . . . B5 . . .',
        'B5 . A5 . F#5 . . . D5 . . . F#5 . . .', 'E5 . . . . . . . A4 . C#5 . E5 . . .',
        'F#5 . . . A5 . D6 . . . C#6 . B5 . . .', 'B5 . . . G5 . . . D5 . E5 . G5 . . .',
        'G5 . F#5 . E5 . B4 . E5 . G5 . B5 . . .', 'A5 . . . . . . . C#6 . . . E6 . . .']
    }),
    ending: {
      bpm: 100,
      channels: {
        lead: { inst: 'bell', vol: 1.4, data: 'D5 . . . F#5 . . . A5 . . . F#5 . . . G5 . . . B5 . . . D6 . . . B5 . . . A5 . . . C#6 . . . E6 . . . C#6 . . . D6 . . . . . . . . . . . - . . .' },
        pad: { inst: 'pad', vol: 1.3, data: 'D3+F#3+A3 . . . . . . . . . . . . . . . G3+B3+D4 . . . . . . . . . . . . . . . A3+C#4+E4 . . . . . . . . . . . . . . . D3+F#3+A3 . . . . . . . . . . . . . . .' },
        bass: { inst: 'bass', vol: 0.8, data: 'D2 . . . . . . . A2 . . . . . . . G2 . . . . . . . D2 . . . . . . . A2 . . . . . . . E2 . . . . . . . D2 . . . . . . . . . . . . . . .' }
      }
    }
  };

  // Składa utwór z progresji akordów, melodii (8 taktów) i stylu akompaniamentu.
  function arrange(o) {
    const ch = {
      lead: { inst: o.leadInst || 'lead', vol: 1, data: o.lead.join(' ') },
      bass: { inst: 'bass', vol: 1, data: o.prog.map(c => bassBar(c, 2, o.bass)).join(' ') },
      drums: { inst: 'drums', vol: 1, data: o.prog.map((c, i) => i === o.prog.length - 1 ? o.fill : (i === 0 ? 'kc' + o.beat.replace(/^\S+/, '') : o.beat)).join(' ') }
    };
    if (o.arp) ch.arp = { inst: o.arp.inst || 'arp', vol: o.arp.vol || 0.7, data: o.prog.map(c => arpBar(c, o.arp.oct, o.arp.shape)).join(' ') };
    if (o.pad) ch.pad = { inst: 'pad', vol: 1, data: o.prog.map(c => padBar(c, o.pad)).join(' ') };
    if (o.brass) {
      const stab = c => { const v = voicing(c, o.brass).join('+'); return [v, '.', '-', '-', '-', '-', v, '.', '-', '-', v, '.', '.', '-', '-', '-'].join(' '); };
      ch.brass = { inst: 'brass', vol: 0.75, data: o.prog.map(stab).join(' ') };
    }
    return { bpm: o.bpm, channels: ch };
  }

  // Rozbudowa utworu: 2-taktowy wstęp (bez melodii, perkusja się rozkręca) + część A + część B.
  // Część B powstaje z A: takty przesunięte o pół utworu (melodia dalej pasuje do akordów),
  // melodia oktawę niżej na dzwonkach, perkusja w połowie tempa. Pętla wraca za wstęp.
  const BAR = 16;
  const transposeTok = (tk, d) => tk === '.' || tk === '-' ? tk : tk.split('+').map(n => n.replace(/(-?\d+)$/, m => String(+m + d))).join('+');
  function structure(def) {
    if (def.loop === false || def.structured) return def;
    const names = Object.keys(def.channels);
    const toks = {}; names.forEach(n => { toks[n] = def.channels[n].data.trim().split(/\s+/); });
    const L = Math.max(...names.map(n => toks[n].length)), bars = Math.round(L / BAR);
    names.forEach(n => { while (toks[n].length < L) toks[n].push('-'); });
    const ch = {};
    // wstęp
    const introDrums = 'k - - - k - - - k - - - k - h - k - h - k - h - k - h - s s s s'.split(' ');
    names.forEach(n => {
      const c = def.channels[n];
      let intro;
      if (c.inst === 'drums') intro = introDrums;
      else if (n === 'lead') intro = Array(BAR * 2).fill('-');
      else intro = toks[n].slice(0, BAR * 2);
      ch[n] = { inst: c.inst, vol: c.vol, parts: [intro, toks[n]] };
    });
    // część B (tylko dla utworów 8-taktowych; dłuższe mają już własną drugą część)
    if (bars === 8 && !def.noB) {
      const rot = a => a.slice(BAR * 4).concat(a.slice(0, BAR * 4));
      const half = 'k - h - - - h - s - h - k - h -'.split(' '), halfFill = 'k - h - s - h - s s t t t t s s'.split(' ');
      names.forEach(n => {
        const c = def.channels[n];
        let b;
        if (c.inst === 'drums') { b = []; for (let i = 0; i < 8; i++) b.push(...(i === 7 ? halfFill : half)); }
        else if (n === 'lead') b = rot(toks[n]).map(tk => transposeTok(tk, -1));
        else b = rot(toks[n]);
        ch[n].parts.push(b);
      });
      ch.leadB = { inst: 'bell', vol: 1.1, parts: [Array(BAR * 2).fill('-'), Array(L).fill('-'), rot(toks.lead || Array(L).fill('-')).map(tk => transposeTok(tk, 0))] };
      if (ch.lead) ch.lead.parts[2] = ch.lead.parts[2].map(tk => tk);   // melodia B: dzwonki + ciche echo prowadzącej oktawę niżej
      if (ch.lead) ch.lead.volB = 0.45;
    }
    const out = { bpm: def.bpm, loopStart: BAR * 2, structured: true, channels: {} };
    Object.keys(ch).forEach(n => { out.channels[n] = { inst: ch[n].inst, vol: ch[n].vol, data: ch[n].parts.map(p => p.join(' ')).join(' '), volB: ch[n].volB, bStart: BAR * 2 + L }; });
    return out;
  }
  function compile(def) {
    def = structure(def);
    const stepsPerBeat = 4;
    const stepDur = 60 / def.bpm / stepsPerBeat;
    let length = 0;
    const events = {};
    Object.keys(def.channels).forEach(name => {
      const ch = def.channels[name];
      const toks = ch.data.trim().split(/\s+/);
      length = Math.max(length, toks.length);
      for (let i = 0; i < toks.length; i++) {
        const tk = toks[i];
        if (tk === '.' || tk === '-') continue;
        let len = 1;
        while (i + len < toks.length && toks[i + len] === '.') len++;
        const vol = ch.volB && i >= ch.bStart ? ch.volB : ch.vol;
        (events[i] = events[i] || []).push({ inst: ch.inst, vol, tok: tk, len });
      }
    });
    return { def, stepDur, length, events, loop: def.loop !== false, loopStart: def.loopStart || 0 };
  }
  const SONGS = {};
  Object.keys(SONG_DEFS).forEach(k => { SONGS[k] = compile(SONG_DEFS[k]); });

  function scheduleStep(ctx, out, song, step, t) {
    const evs = song.events[step];
    if (!evs) return;
    evs.forEach(e => {
      if (e.inst === 'drums') {
        for (const c of e.tok) { const d = DRUM_KEYS[c]; if (d) INST[d](ctx, out, t, e.vol); }
      } else {
        const dur = e.len * song.stepDur;
        e.tok.split('+').forEach(n => { const f = noteFreq(n); if (f) INST[e.inst](ctx, out, t, f, dur, e.vol); });
      }
    });
  }

  // ---------------------------------------------------- runtime engine
  const Engine = {
    ctx: null, master: null, music: null, sfx: null,
    muted: false, current: null, timer: null, last: {},
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      const ctx = this.ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4;
      comp.connect(ctx.destination);
      this.master = ctx.createGain(); this.master.gain.value = 0.8; this.master.connect(comp);
      this.music = ctx.createGain(); this.music.gain.value = 0.55; this.music.connect(this.master);
      this.sfx = ctx.createGain(); this.sfx.gain.value = 0.9; this.sfx.connect(this.master);
      if (this.vol) this.setVolumes(this.vol.m, this.vol.s);
    },
    // opt.xfade — płynne przejście (s): stary utwór gra dalej i cichnie, nowy narasta; opt.skipIntro — od razu część A
    fading: [],
    play(name, opt) {
      if (!this.ctx || !SONGS[name]) return;
      opt = opt || {};
      if (this.current && this.current.name === name) return;
      const xf = opt.xfade || 0, t = this.ctx.currentTime;
      if (xf && this.current) this._fadeOut(this.current, xf); else this.stopMusic();
      const song = SONGS[name];
      const bus = this.ctx.createGain(); bus.connect(this.music);
      if (xf) { bus.gain.setValueAtTime(0.0001, t); bus.gain.linearRampToValueAtTime(1, t + xf * 0.85); }
      const layer = this.ctx.createGain(); layer.gain.value = this.intensity ? 1 : 0; layer.connect(bus);
      this.current = { name, song, bus, layer, step: opt.skipIntro ? song.loopStart : 0, next: t + 0.06 };
      if (!this.timer) this.timer = setInterval(() => this._tick(), 25);
      this._tick();
    },
    _fadeOut(c, fade) {
      const t = this.ctx.currentTime, g = c.bus.gain;
      g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.linearRampToValueAtTime(0.0001, t + fade);
      c.end = t + fade; this.fading.push(c);
      if (this.current === c) this.current = null;
    },
    _schedule(c) {
      while (c.next < this.ctx.currentTime + 0.15) {
        if (c.step >= c.song.length) {
          if (!c.song.loop) { c.done = true; return; }
          c.step = c.song.loopStart || 0;
        }
        scheduleStep(this.ctx, c.bus, c.song, c.step, c.next);
        if (c === this.current && (this.intensity || this.ctx.currentTime < this.layerUntil)) {
          for (const ch of LAYER[c.step % 16]) { const d = DRUM_KEYS[ch]; if (d) INST[d](this.ctx, c.layer, c.next, 0.75); }
        }
        c.step++;
        c.next += c.song.stepDur;
      }
    },
    _tick() {
      const now = this.ctx.currentTime;
      if (this.current && !this.current.done) this._schedule(this.current);
      this.fading = this.fading.filter(c => {
        if (now >= c.end) { setTimeout(() => c.bus.disconnect(), 400); return false; }
        if (!c.done) this._schedule(c);
        return true;
      });
      if ((!this.current || this.current.done) && !this.fading.length && this.timer) { clearInterval(this.timer); this.timer = null; }
    },
    // włącza / wycisza dodatkową ścieżkę perkusji
    intensity: false, layerUntil: 0,
    setIntensity(on) {
      on = !!on;
      if (on === this.intensity) return;
      this.intensity = on;
      const c = this.current; if (!c || !this.ctx) return;
      const t = this.ctx.currentTime, g = c.layer.gain;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
      if (on) { g.linearRampToValueAtTime(1, t + 0.15); INST.crash(this.ctx, c.layer, t + 0.02, 0.8); }
      else { g.linearRampToValueAtTime(0, t + 1.2); this.layerUntil = t + 1.3; }
    },
    // wyciszenie: utwór gra dalej i cichnie przez `fade` sekund (domyślnie krótko)
    stopMusic(fade) {
      if (!this.current || !this.ctx) return;
      this._fadeOut(this.current, fade || 0.25);
      if (!this.timer) this.timer = setInterval(() => this._tick(), 25);
    },
    // ---- dźwięki otoczenia: 'waves' (plaża), 'drips' (kanały), 'wind' (burza piaskowa), 'rain' (deszcz), 'train'
    amb: null,
    setAmbience(kind) {
      if (!this.ctx) return;
      const cur = this.amb;
      if ((cur && cur.kind) === (kind || null)) return;
      const t = this.ctx.currentTime;
      if (cur) {
        cur.gain.gain.cancelScheduledValues(t); cur.gain.gain.setValueAtTime(Math.max(0.0001, cur.gain.gain.value), t); cur.gain.gain.linearRampToValueAtTime(0.0001, t + 1.2);
        clearInterval(cur.timer); setTimeout(() => { cur.stop.forEach(n => { try { n.stop(); } catch (e) { } }); cur.gain.disconnect(); }, 1500);
        this.amb = null;
      }
      if (!kind) return;
      this.amb = this._buildAmbience(kind);
    },
    _buildAmbience(kind) {
      const ctx = this.ctx, t = ctx.currentTime, stop = [];
      const gain = ctx.createGain(); gain.gain.setValueAtTime(0.0001, t); gain.gain.linearRampToValueAtTime(1, t + 1.5); gain.connect(this.sfx);
      const loopNoise = (out, rate) => { const s = ctx.createBufferSource(); s.buffer = noise(ctx); s.loop = true; if (rate) s.playbackRate.value = rate; s.connect(out); s.start(t, Math.random()); stop.push(s); return s; };
      const lfo = (f, depth, param) => { const o = ctx.createOscillator(); o.frequency.value = f; const g = ctx.createGain(); g.gain.value = depth; o.connect(g); g.connect(param); o.start(t); stop.push(o); };
      const level = (v, out) => { const g = ctx.createGain(); g.gain.value = v; g.connect(out || gain); return g; };
      let timer = null;
      if (kind === 'waves') {
        // szum fal narastający i opadający co kilka sekund + piana
        const swell = level(0.22); lfo(0.13, 0.18, swell.gain);
        loopNoise(filter(ctx, 'lowpass', 520, 0.7, swell));
        const foam = level(0.05); lfo(0.13, 0.045, foam.gain);
        loopNoise(filter(ctx, 'highpass', 2600, 0.5, foam));
      } else if (kind === 'rain') {
        loopNoise(filter(ctx, 'bandpass', 3200, 0.6, level(0.16)));
        loopNoise(filter(ctx, 'lowpass', 300, 0.5, level(0.06)), 0.5);
      } else if (kind === 'wind') {
        const w = level(0.2); lfo(0.11, 0.14, w.gain);
        const bp = filter(ctx, 'bandpass', 650, 1.3, w); lfo(0.07, 320, bp.frequency);
        loopNoise(bp);
        loopNoise(filter(ctx, 'highpass', 4000, 0.5, level(0.03)));
      } else if (kind === 'drips') {
        // dudnienie tuneli + krople z echem
        loopNoise(filter(ctx, 'lowpass', 140, 0.7, level(0.14)), 0.6);
        const dl = ctx.createDelay(1); dl.delayTime.value = 0.21; const fb = level(0.38, dl); dl.connect(fb); dl.connect(gain);
        const dripIn = level(0.9); dripIn.connect(dl);
        timer = setInterval(() => { if (Math.random() < 0.42) SFX.drip(ctx, dripIn, ctx.currentTime + 0.02 + Math.random() * 0.1); }, 260);
      } else if (kind === 'train') {
        loopNoise(filter(ctx, 'lowpass', 220, 0.7, level(0.18)), 0.8);
        const w = level(0.08); lfo(0.2, 0.05, w.gain); loopNoise(filter(ctx, 'bandpass', 900, 0.8, w));
        const cl = level(0.5); let k = 0;
        timer = setInterval(() => { if (++k % 2 === 0) SFX.clack(ctx, cl, ctx.currentTime + 0.02); }, 290);
      }
      return { kind, gain, stop, timer };
    },
    sfxPlay(name) {
      if (!this.ctx || this.muted || !SFX[name]) return;
      const now = this.ctx.currentTime;
      // ogranicz spam tego samego dźwięku w jednej klatce
      if (this.last[name] && now - this.last[name] < 0.03) return;
      this.last[name] = now;
      SFX[name](this.ctx, this.sfx, now + 0.005);
    },
    // głośność 0–10 dla muzyki i efektów
    setVolumes(m, s) {
      this.vol = { m, s };
      if (this.music) this.music.gain.value = 0.55 * m / 7;
      if (this.sfx) this.sfx.gain.value = 0.9 * s / 8;
    },
    toggleMute() {
      this.muted = !this.muted;
      if (this.master) this.master.gain.value = this.muted ? 0 : 0.8;
      return this.muted;
    }
  };

  // ------------------------------------------------------- offline export
  function renderSfx(name, sr) {
    sr = sr || 44100;
    const len = 2.0;
    const ctx = new OfflineAudioContext(1, Math.ceil(sr * len), sr);
    SFX[name](ctx, ctx.destination, 0.01);
    return ctx.startRendering().then(trimBuffer).then(normalize);
  }
  function renderSong(name, loops, sr) {
    sr = sr || 44100;
    const song = SONGS[name];
    loops = song.loop ? (loops || 2) : 1;
    const total = song.length * song.stepDur * loops + 1.5;
    const ctx = new OfflineAudioContext(1, Math.ceil(sr * total), sr);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(ctx.destination);
    const g = ctx.createGain(); g.gain.value = 0.6; g.connect(comp);
    let t = 0.02;
    for (let l = 0; l < loops; l++) {
      for (let s = 0; s < song.length; s++) { scheduleStep(ctx, g, song, s, t); t += song.stepDur; }
    }
    return ctx.startRendering().then(trimBuffer);
  }
  function trimBuffer(buf) {
    const chs = []; for (let c = 0; c < buf.numberOfChannels; c++) chs.push(buf.getChannelData(c));
    let end = buf.length - 1;
    while (end > 0 && chs.every(d => Math.abs(d[end]) < 0.0005)) end--;
    end = Math.min(buf.length, end + Math.floor(buf.sampleRate * 0.05));
    return { sampleRate: buf.sampleRate, channels: chs.map(d => d.subarray(0, end)) };
  }
  function normalize(r) {
    let peak = 0;
    r.channels.forEach(d => { for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; } });
    if (peak > 0) { const k = 0.89 / peak; r.channels = r.channels.map(d => d.map(v => v * k)); }
    return r;
  }
  function encodeWav(r) {
    const nCh = r.channels.length, len = r.channels[0].length;
    const buf = new ArrayBuffer(44 + len * nCh * 2), v = new DataView(buf);
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); v.setUint32(4, 36 + len * nCh * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nCh, true);
    v.setUint32(24, r.sampleRate, true); v.setUint32(28, r.sampleRate * nCh * 2, true);
    v.setUint16(32, nCh * 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, len * nCh * 2, true);
    let o = 44;
    for (let i = 0; i < len; i++) for (let c = 0; c < nCh; c++) {
      const s = Math.max(-1, Math.min(1, r.channels[c][i]));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2;
    }
    return buf;
  }

  global.GameAudio = {
    Engine, SONGS, EVOICE_NAMES: Object.keys(EVOICES), SFX_NAMES: Object.keys(SFX), SONG_NAMES: Object.keys(SONGS),
    renderSfx, renderSong, encodeWav, noteFreq, VOICE_HEROES: Object.keys(VOICES)
  };
})(window);
