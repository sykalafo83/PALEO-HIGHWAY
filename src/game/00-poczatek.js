  const W = 384, H = 224;
  const STAGES = window.STAGES, SP = window.Sprites, AU = window.GameAudio.Engine;
  const P = SP.POSES;
  let GRAV = 0.32;   // kod NISKA GRAWITACJA zmniejsza
  const FLOOR_TOP = 150, FLOOR_BOTTOM = 216;
  const sfx = n => AU.sfxPlay(n);
  // okrzyk bohatera (głosy z audio.js: v_<postać>_<rodzaj>)
  function shout(p, kind) { if (p && p.key) sfx('v_' + p.key + '_' + kind); }
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let ST = STAGES[0];

