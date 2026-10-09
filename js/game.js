/* PALEO HIGHWAY — silnik gry. PLIK GENEROWANY przez tools/build.mjs z src/game/*.js — nie edytuj ręcznie. */
(function () {
  'use strict';
  const W = 384, H = 224;
  const STAGES = window.STAGES, SP = window.Sprites, AU = window.GameAudio.Engine;
  const P = SP.POSES;
  const GRAV = 0.32;
  const FLOOR_TOP = 150, FLOOR_BOTTOM = 216;
  const sfx = n => AU.sfxPlay(n);
  // okrzyk bohatera (głosy z audio.js: v_<postać>_<rodzaj>)
  function shout(p, kind) { if (p && p.key) sfx('v_' + p.key + '_' + kind); }
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let ST = STAGES[0];

  // =============================================================== DEFINICJE
  const BASE_BUILD = { scale: 1, legU: 11, legL: 11, torso: 17, shoulderW: 12, hipW: 10, armU: 9, armL: 9, limbW: 5, armW: 4, head: 5.5 };
  const build = o => Object.assign({}, BASE_BUILD, o, { colors: Object.assign({ outline: '#140c10' }, o.colors) });

  const MOVES = {
    jab: { pose: 'jab', start: 3, active: 3, rec: 7, dmg: 5, reach: 26, snd: 'punch' },
    cross: { pose: 'cross', start: 3, active: 3, rec: 8, dmg: 6, reach: 27, snd: 'punch' },
    upper: { pose: 'upper', wind: 'crouch', start: 5, active: 4, rec: 15, dmg: 10, reach: 24, knock: true, snd: 'heavy' },
    kick: { pose: 'kick', start: 6, active: 4, rec: 14, dmg: 11, reach: 34, knock: true, snd: 'kickHit' },
    spinkick: { pose: 'spinkick', start: 6, active: 4, rec: 15, dmg: 12, reach: 32, knock: true, snd: 'kickHit' },
    hammer: { pose: 'hammerDown', wind: 'hammerUp', start: 9, active: 4, rec: 16, dmg: 15, reach: 27, knock: true, snd: 'heavy', shake: 4 },
    pipe: { pose: 'swingDown', wind: 'swingUp', start: 7, active: 4, rec: 10, dmg: 13, reach: 38, snd: 'pipeHit' },
    machete: { pose: 'swingDown', wind: 'swingUp', start: 4, active: 3, rec: 6, dmg: 15, reach: 34, snd: 'blade' },
    chain: { pose: 'swingDown', wind: 'swingUp', start: 9, active: 6, rec: 12, dmg: 12, reach: 58, depth: 14, snd: 'chainHit' },
    chainSpin: { pose: 'spin', start: 6, active: 10, rec: 14, dmg: 14, reach: 52, depth: 16, knock: true, around: true, launch: true, snd: 'chainHit' },
    launcher: { pose: 'upper', wind: 'crouch', start: 5, active: 4, rec: 9, dmg: 9, reach: 28, knock: true, launch: true, snd: 'heavy' },
    rampage: { reach: 24, dmg: 16, depth: 12, height: 44, knock: true, snd: 'heavy' },
    // wrogowie
    stab: { pose: 'stab', wind: 'crouch', start: 14, active: 4, rec: 22, dmg: 7, reach: 28, snd: 'blade' },
    slash: { pose: 'jab', start: 10, active: 3, rec: 18, dmg: 5, reach: 26, snd: 'punch' },
    slap: { pose: 'hammerDown', wind: 'hammerUp', start: 18, active: 4, rec: 24, dmg: 12, reach: 30, knock: true, snd: 'heavy', shake: 3 },
    bossSwing: { pose: 'hammerDown', wind: 'hammerUp', start: 20, active: 5, rec: 26, dmg: 16, reach: 48, depth: 14, knock: true, snd: 'slam', shake: 8 },
    whip: { pose: 'jab', wind: 'swingUp', start: 12, active: 5, rec: 16, dmg: 11, reach: 70, depth: 8, snd: 'whip', whip: true },
    pWhip: { pose: 'jab', wind: 'swingUp', start: 7, active: 4, rec: 10, dmg: 11, reach: 64, depth: 8, knock: true, snd: 'whip', whip: true },
    anchor: { pose: 'hammerDown', wind: 'hammerUp', start: 18, active: 5, rec: 24, dmg: 15, reach: 46, depth: 14, knock: true, snd: 'slam', shake: 6 },
    cane: { pose: 'jab', wind: 'cross', start: 6, active: 3, rec: 8, dmg: 7, reach: 34, snd: 'hit' },
    caneFinal: { pose: 'upper', wind: 'crouch', start: 8, active: 4, rec: 18, dmg: 13, reach: 34, knock: true, snd: 'heavy', shake: 4 },
    rexBite: { abs: true, start: 22, active: 6, rec: 26, dmg: 18, reach: 66, depth: 16, knock: true, snd: 'bite', shake: 6 },
    rexTail: { abs: true, start: 16, active: 6, rec: 22, dmg: 15, reach: 86, depth: 16, knock: true, snd: 'heavy', shake: 5 },
    // BORYS — laska
    caneJab: { pose: 'jab', start: 4, active: 3, rec: 8, dmg: 6, reach: 38, snd: 'hit' },
    caneJab2: { pose: 'cross', start: 4, active: 3, rec: 9, dmg: 6, reach: 38, snd: 'hit' },
    caneSweep: { pose: 'swingDown', wind: 'swingUp', start: 8, active: 5, rec: 16, dmg: 13, reach: 44, knock: true, snd: 'heavy' },
    // ruchy komendowe (↓ ↘ → + atak)
    cmdPoke: { pose: 'stab', wind: 'crouch', start: 8, active: 5, rec: 16, dmg: 15, reach: 70, knock: true, snd: 'heavy', shake: 3 },
    // dosiadany raptor
    rideBite: { abs: true, start: 6, active: 6, rec: 10, dmg: 12, reach: 40, depth: 10, snd: 'bite' }
  };

  const CHARS = {
    kruk: {
      name: 'KRUK', desc: 'MECHANIK — WSZECHSTRONNY', speed: 1.55, hp: 120, stats: [3, 3, 3],
      combo: ['jab', 'cross', 'jab', 'spinkick'],
      build: build({
        hair: 'bandana', details: [{ t: 'straps', c: '#2e5aa8' }, { t: 'belt', c: '#3a2a1e' }],
        colors: { skin: '#e0a878', hair: '#3a2418', shirt: '#e8dcc4', pants: '#2e5aa8', boots: '#3a2a1e', gloves: '#6a4426', accent: '#d03a2a' }
      })
    },
    nina: {
      name: 'NINA', desc: 'STRAŻNICZKA — SZYBKA', speed: 1.8, hp: 105, stats: [4, 2, 3],
      combo: ['jab', 'jab', 'cross', 'kick'],
      build: build({
        hair: 'ponytail', legU: 12, legL: 12, shoulderW: 10, hipW: 9, limbW: 4.5, armW: 3.6, head: 5.3,
        details: [{ t: 'belt', c: '#5a3a22' }, { t: 'pocket', c: '#3a5a2a' }],
        colors: { skin: '#f0c098', hair: '#c0602a', shirt: '#4a7a3a', pants: '#b8a070', boots: '#5a3a22', gloves: '#3a5a2a', accent: '#e0c040' }
      })
    },
    tur: {
      name: 'TUR', desc: 'GÓRNIK — SIŁACZ', speed: 1.3, hp: 140, stats: [2, 4, 4],
      combo: ['jab', 'cross', 'hammer'], power: 1.25,
      build: build({
        hair: 'beard', scale: 1.1, shoulderW: 15, hipW: 11, limbW: 6, armW: 5.2, sleeveless: true,
        details: [{ t: 'vest', c: '#5a2e22' }, { t: 'belt', c: '#2a2a2a' }],
        colors: { skin: '#c88858', hair: '#5a3a2a', shirt: '#9a4a32', pants: '#4a4a52', boots: '#2a2a2a', gloves: '#c88858', accent: '#e0c040' }
      })
    }
  };
  CHARS.borys = {
    name: 'BORYS', desc: 'TROPICIEL • ZASIĘG', speed: 1.45, hp: 125, stats: [2, 3, 3], innate: 'cane',
    combo: ['caneJab', 'caneJab2', 'caneSweep'], power: 1.05,
    build: build({
      hair: 'hatbeard', scale: 1.04, legU: 11.5, legL: 11.5, shoulderW: 12, hipW: 10,
      details: [{ t: 'bandolier', c: '#5a3a1a' }, { t: 'belt', c: '#3a2a1a' }, { t: 'pocket', c: '#6a5030' }],
      colors: { skin: '#d8a878', hair: '#e8e4d8', shirt: '#7a5a3a', pants: '#4a5a3a', boots: '#3a2a1a', gloves: '#5a4028', accent: '#5a4028' }
    })
  };
  CHARS.kruk.desc = 'MECHANIK • BALANS'; CHARS.nina.desc = 'STRAŻNICZKA • SZYBKA'; CHARS.tur.desc = 'GÓRNIK • SIŁA';
  // nazwy ruchów specjalnych (instrukcja na ekranie wyboru)
  CHARS.kruk.moves = ['SPECJAŁ: WIRUJĄCY KOPNIAK', 'DÓŁ,PRZÓD+ATAK: RZUT KLUCZEM'];
  CHARS.nina.moves = ['SPECJAŁ: SALTO Z KOPNIĘCIEM', 'DÓŁ,PRZÓD+ATAK: WŚLIZG'];
  CHARS.tur.moves = ['SPECJAŁ: TRZĘSIENIE ZIEMI', 'DÓŁ,PRZÓD+ATAK: TARAN BARKIEM'];
  CHARS.borys.moves = ['SPECJAŁ: MŁYNEK LASKĄ', 'DÓŁ,PRZÓD+ATAK: PCHNIĘCIE LASKĄ'];
  // drugi zestaw kolorów, gdy obaj gracze wybiorą tę samą postać
  const ALT = { kruk: { shirt: '#3a3a3a', pants: '#8a2a2a' }, nina: { shirt: '#2a5a8a', pants: '#5a5a5a' }, tur: { shirt: '#2a5a3a', pants: '#2a2a5a' }, borys: { shirt: '#3a4a6a', pants: '#5a4a3a' } };
  function altBuild(key) { const b = CHARS[key].build; return Object.assign({}, b, { colors: Object.assign({}, b.colors, ALT[key]) }); }
  const CHAR_KEYS = ['kruk', 'nina', 'tur', 'borys'];
  const selKeys = () => CHAR_KEYS.concat(HERO_UNLOCKS.filter(([k, u]) => app.unlocks && app.unlocks[u]).map(([k]) => k));
  const P_COLS = ['#ff6040', '#40a8ff'];

  const GRUNT_COLS = [
    { skin: '#d8a070', hair: '#e04a8a', shirt: '#4a3a2a', pants: '#5a5a3a', boots: '#1a1a1a', gloves: '#3a2a1a', accent: '#a03a2a', vest: '#a03a2a' },
    { skin: '#b88050', hair: '#40c040', shirt: '#3a3a4a', pants: '#4a4030', boots: '#1a1a1a', gloves: '#3a2a1a', accent: '#2a6aa0', vest: '#2a6aa0' }
  ];
  const ENEMIES = {
    grunt: {
      name: 'SZAKAL', hp: 42, speed: 0.95, range: 26, score: 200, weapon: 'knife', attacks: ['stab', 'slash'], ai: 'grunt',
      mk: () => { const c = GRUNT_COLS[Math.random() * 2 | 0]; return build({ hair: 'mohawk', acc: [{ t: 'scarf', c: c.vest }], details: [{ t: 'vest', c: c.vest }, { t: 'belt', c: '#2a1a10' }], colors: c }); }
    },
    thin: {
      name: 'ĆWIEK', hp: 30, speed: 1.45, range: 24, score: 300, attacks: ['slash'], ai: 'thin',
      mk: () => build({ hair: 'hood', legU: 12.5, legL: 12.5, shoulderW: 10, hipW: 8, limbW: 4, armW: 3.4, head: 5.2, acc: [{ t: 'goggles', c: '#e0c040' }],
        details: [{ t: 'stripe', c: '#e0c040' }],
        colors: { skin: '#c8a080', hair: '#5a3a7a', shirt: '#5a3a7a', pants: '#2a2a3a', boots: '#1a1a1a', gloves: '#2a2a3a' } })
    },
    brute: {
      name: 'GŁAZ', hp: 95, speed: 0.65, range: 30, score: 600, attacks: ['slap'], ai: 'brute',
      mk: () => build({ hair: 'bald', scale: 1.15, belly: 9, bellyCol: 'skin', shoulderW: 17, hipW: 14, limbW: 6.5, armW: 5.5, sleeveless: true, acc: ['eyepatch'],
        details: [{ t: 'vest', c: '#6a5a4a' }, { t: 'belt', c: '#2a1a10' }],
        colors: { skin: '#d09060', hair: '#d09060', shirt: '#6a5a4a', pants: '#3a3a4a', boots: '#1a1a1a', gloves: '#d09060' } })
    },
    bomber: {
      name: 'MIOTACZ', hp: 34, speed: 0.9, range: 26, score: 350, attacks: ['slash'], ai: 'bomber', weapon: 'dynamite',
      mk: () => build({ hair: 'cap', acc: [{ t: 'dynapack', c: '#6a4a2a' }], details: [{ t: 'bandolier', c: '#c0302a' }, { t: 'belt', c: '#2a1a10' }],
        colors: { skin: '#d0a078', hair: '#8a3a2a', shirt: '#c06a2a', pants: '#4a4a3a', boots: '#1a1a1a', gloves: '#3a2a1a', accent: '#8a3a2a' } })
    },
    gunner: {
      name: 'STRZELEC', hp: 38, speed: 0.85, range: 26, score: 400, attacks: ['slash'], ai: 'gunner', weapon: 'rifle',
      mk: () => build({ hair: 'cap', acc: [{ t: 'radio', c: '#4a5a3a' }], details: [{ t: 'pocket', c: '#3a4a2a' }, { t: 'belt', c: '#2a2a1a' }],
        colors: { skin: '#c89870', hair: '#3a4a2a', shirt: '#5a6a3a', pants: '#3a4030', boots: '#1a1a1a', gloves: '#2a2a1a', accent: '#3a4a2a' } })
    },
    shield: {
      name: 'TARCZOWNIK', hp: 55, speed: 0.7, range: 28, score: 500, attacks: ['slap'], ai: 'shield', weapon: 'shield', shield: true,
      mk: () => build({ hair: 'helmet', scale: 1.08, shoulderW: 14, hipW: 11, limbW: 5.5, armW: 4.6, details: [{ t: 'plate', c: '#5a6068' }, { t: 'belt', c: '#1a1a1a' }],
        colors: { skin: '#c89070', hair: '#4a5058', shirt: '#3a4a3a', pants: '#2a2e2a', boots: '#141414', gloves: '#2a2a2a', accent: '#ff9a2a' } })
    },
    sniper: {
      name: 'SNAJPER', hp: 30, speed: 0.8, range: 26, score: 600, attacks: ['slash'], ai: 'sniper', weapon: 'rifle',
      mk: () => build({ hair: 'cap', acc: [{ t: 'goggles', c: '#ff4030' }, { t: 'pack', c: '#3a3e34' }], details: [{ t: 'bandolier', c: '#3a3a2a' }, { t: 'belt', c: '#1a1a1a' }],
        colors: { skin: '#b88a60', hair: '#2a2a2a', shirt: '#3a3e34', pants: '#2a2e28', boots: '#111', gloves: '#1a1a1a', accent: '#2a2a2a' } })
    },
    netter: {
      name: 'SIECIARZ', hp: 40, speed: 0.9, range: 26, score: 450, attacks: ['slash'], ai: 'netter',
      mk: () => build({ hair: 'hood', acc: [{ t: 'netpack', c: '#5a4a32' }, { t: 'scarf', c: '#8a7a50' }], details: [{ t: 'bandolier', c: '#c8b080' }, { t: 'belt', c: '#2a1a10' }],
        colors: { skin: '#d0a078', hair: '#6a5a3a', shirt: '#6a5a3a', pants: '#3a3428', boots: '#1a1a1a', gloves: '#3a2a1a' } })
    },
    ptera: { name: 'PTERANODON', hp: 40, speed: 1.6, score: 700, beast: true },
    trike: { name: 'TRICERATOPS', hp: 95, speed: 0.8, score: 800, beast: true, chargeSpeed: 3.4, chargeDmg: 16 },
    para: { name: 'PARAZAUROLOF', hp: 65, speed: 1.1, score: 700, beast: true },
    dummy: {
      name: 'MANEKIN', hp: 999, speed: 0, range: 0, score: 0, ai: 'dummy', attacks: [],
      mk: () => build({ hair: 'bald', scale: 1.05, details: [{ t: 'stripe', c: '#c03a2a' }, { t: 'belt', c: '#5a3a1a' }],
        colors: { skin: '#d8c070', hair: '#d8c070', shirt: '#9a7a4a', pants: '#7a5a30', boots: '#5a3a1a', gloves: '#d8c070' } })
    },
    whitefang: { name: 'BIAŁY KIEŁ', hp: 170, speed: 1.7, score: 10000, beast: true, drop1up: true },
    raptor: { name: 'RAPTOR', hp: 56, speed: 1.3, score: 500, beast: true },
    pachy: { name: 'PACHY', hp: 75, speed: 1.0, score: 600, beast: true },
    // ---- nowi wrogowie: jeździec na raptorze, podpalacz, lotniarz
    rraptor: { name: 'JEŹDZIEC', hp: 70, speed: 1.55, score: 900 },
    flamer: {
      name: 'PODPALACZ', hp: 48, speed: 0.8, range: 26, score: 650, attacks: ['slap'], ai: 'flamer', weapon: 'flamer',
      mk: () => build({ hair: 'helmet', scale: 1.05, shoulderW: 13, hipW: 11, limbW: 5.2, acc: ['tank', 'gasmask'], details: [{ t: 'plate', c: '#7a3a1a' }, { t: 'belt', c: '#1a1a1a' }],
        colors: { skin: '#c89070', hair: '#3a3a3a', shirt: '#b8642a', pants: '#3a3028', boots: '#141414', gloves: '#2a2a2a', accent: '#ffb030' } })
    },
    glider: {
      name: 'LOTNIARZ', hp: 32, speed: 1.4, range: 24, score: 700, attacks: ['slash'], ai: 'thin',
      mk: () => build({ hair: 'bandana', legU: 12.5, legL: 12.5, shoulderW: 10, hipW: 8, limbW: 4, armW: 3.4, acc: [{ t: 'goggles' }, { t: 'pack', c: '#5a4a3a' }],
        details: [{ t: 'bandolier', c: '#e0d4a8' }, { t: 'belt', c: '#2a1a10' }],
        colors: { skin: '#d0a078', hair: '#c8402a', shirt: '#2a4a6a', pants: '#3a3a3a', boots: '#1a1a1a', gloves: '#2a2a2a', accent: '#c8402a' } })
    },
    // ---- bossowie
    boss: {
      name: 'KAPITAN RDZA', title: 'KAPITAN RDZA', sub: 'SZEF KŁUSOWNIKÓW', hp: 440, speed: 0.85, range: 46, score: 8000, boss: true, ai: 'hammer', weapon: 'hammer',
      summon: ['grunt', 'thin'], shout: 'BRAĆ GO!',
      mk: () => build({ hair: 'helmet', scale: 1.35, shoulderW: 16, hipW: 12, limbW: 6, armW: 5, head: 5.6,
        details: [{ t: 'plate', c: '#7b8794' }, { t: 'bandolier', c: '#5a3a1a' }, { t: 'belt', c: '#1a1a1a' }],
        colors: { skin: '#c89070', hair: '#5a5f66', shirt: '#3a4048', pants: '#2a2e34', boots: '#141414', gloves: '#5a5f66', accent: '#ff3a2a' } })
    },
    zmija: {
      name: 'ŻMIJA', title: 'ŻMIJA', sub: 'KRÓLOWA BAGIEN', hp: 380, speed: 1.35, range: 70, score: 9000, boss: true, ai: 'whip', weapon: 'whip',
      summon: ['thin', 'thin'], shout: 'SSSIOSTRY, DO MNIE!',
      mk: () => build({ hair: 'ponytail', scale: 1.12, legU: 12.5, legL: 12.5, shoulderW: 10, hipW: 9, limbW: 4.5, armW: 3.6, head: 5.3,
        details: [{ t: 'belt', c: '#d0a040' }, { t: 'stripe', c: '#2a1a2a' }],
        colors: { skin: '#e8c0a0', hair: '#e8e8f0', shirt: '#5a2a6a', pants: '#1a1a22', boots: '#a02a2a', gloves: '#1a1a22', accent: '#d0a040' } })
    },
    klin: {
      name: 'KLIN', title: 'BRACIA TRZASK', sub: 'KLIN I KLAMRA', hp: 230, speed: 0.8, range: 32, score: 6000, boss: true, ai: 'brute', attacks: ['slap'],
      mk: () => build({ hair: 'bald', scale: 1.3, belly: 8, bellyCol: 'skin', shoulderW: 17, hipW: 13, limbW: 6.5, armW: 5.5, sleeveless: true,
        details: [{ t: 'vest', c: '#5a1a1a' }, { t: 'belt', c: '#1a1a1a' }],
        colors: { skin: '#b07850', hair: '#b07850', shirt: '#8a2a2a', pants: '#2a2a3a', boots: '#141414', gloves: '#b07850' } })
    },
    klamra: {
      name: 'KLAMRA', title: 'BRACIA TRZASK', sub: 'KLIN I KLAMRA', hp: 190, speed: 1.55, range: 26, score: 6000, boss: true, ai: 'thin', attacks: ['slash', 'stab'], knives: true, weapon: 'knife',
      mk: () => build({ hair: 'hood', scale: 1.12, legU: 12.5, legL: 12.5, shoulderW: 10, hipW: 8, limbW: 4.2, armW: 3.5, head: 5.2,
        details: [{ t: 'stripe', c: '#f0f0f0' }, { t: 'belt', c: '#1a1a1a' }],
        colors: { skin: '#c8a080', hair: '#8a2a2a', shirt: '#8a2a2a', pants: '#1a1a1a', boots: '#141414', gloves: '#1a1a1a' } })
    },
    rex: { name: 'STARY KIEŁ', title: 'STARY KIEŁ', sub: 'PRADAWNY WŁADCA GÓRY', hp: 680, speed: 0.9, score: 15000, boss: true, superArmor: true },
    szpon: {
      name: 'ADMIRAŁ SZPON', title: 'ADMIRAŁ SZPON', sub: 'PAN PRZEMYTNIKÓW', hp: 470, speed: 0.8, range: 46, score: 10000, boss: true, ai: 'harpoon', weapon: 'harpoonGun',
      summon: ['gunner', 'gunner'], shout: 'ZAŁOGA, OGNIA!',
      mk: () => build({ hair: 'cap', scale: 1.3, shoulderW: 15, hipW: 12, limbW: 6, armW: 5, head: 5.6,
        details: [{ t: 'stripe', c: '#d0a040' }, { t: 'belt', c: '#1a1a1a' }, { t: 'pocket', c: '#d0a040' }],
        colors: { skin: '#c89070', hair: '#1a2a4a', shirt: '#1e2e5a', pants: '#e8e0d0', boots: '#141414', gloves: '#1a1a1a', accent: '#d0a040' } })
    },
    padliniarz: {
      name: 'PADLINIARZ', title: 'PADLINIARZ', sub: 'KRÓL ŚMIETNISKA', hp: 520, speed: 0.85, range: 48, score: 12000, boss: true, ai: 'hammer', weapon: 'anchor',
      summon: ['bomber', 'grunt'], shout: 'ŚMIECI DO ŚMIECI!',
      mk: () => build({ hair: 'hood', scale: 1.4, belly: 9, bellyCol: 'shirt', shoulderW: 17, hipW: 13, limbW: 6.5, armW: 5.5, head: 5.6,
        details: [{ t: 'bandolier', c: '#6a5a3a' }, { t: 'belt', c: '#2a2a1a' }, { t: 'pocket', c: '#a08a30' }],
        colors: { skin: '#b89070', hair: '#d8b030', shirt: '#d8b030', pants: '#3a3a2a', boots: '#1a1a14', gloves: '#5a6a3a', accent: '#8a2a22' } })
    },
    kolos: { name: 'BURSZTYNOWY KOLOS', title: 'BURSZTYNOWY KOLOS', sub: 'OSTATNIE DZIEŁO BARONA', hp: 1000, speed: 0.95, score: 50000, boss: true, superArmor: true },
    digger: {
      name: 'BRYGADZISTA', title: 'BRYGADZISTA', sub: 'POSTRACH WYKOPÓW', hp: 520, speed: 0.75, score: 12000, boss: true, superArmor: true,
      mk: () => build({ hair: 'hatbeard', scale: 1.2, belly: 7, bellyCol: 'shirt', shoulderW: 16, hipW: 13, limbW: 6, armW: 5,
        details: [{ t: 'vest', c: '#f0d040' }, { t: 'belt', c: '#1a1a1a' }],
        colors: { skin: '#d09468', hair: '#e0b020', shirt: '#5a6a7a', pants: '#3a4048', boots: '#141414', gloves: '#c8a040', accent: '#e0b020' } })
    },
    deino: { name: 'ZĘBACZ', title: 'ZĘBACZ', sub: 'MUTANT Z KANAŁÓW', hp: 720, speed: 1.0, score: 18000, boss: true, superArmor: true },
    baron: {
      name: 'BARON BURSZTYN', title: 'BARON BURSZTYN', sub: 'WŁADCA IMPERIUM KŁUSOWNIKÓW', hp: 640, speed: 1.2, range: 34, score: 30000, boss: true, ai: 'baron', weapon: 'cane',
      summon: ['raptor', 'raptor'], shout: 'DO MNIE, BESTIE!',
      mk: () => build({ hair: 'cap', scale: 1.25, legU: 12, legL: 12, shoulderW: 13, hipW: 10, head: 5.4,
        details: [{ t: 'plate', c: '#d0a040' }, { t: 'belt', c: '#1a1014' }],
        colors: { skin: '#e0c0a8', hair: '#1a1014', shirt: '#3a1a2a', pants: '#1a1014', boots: '#0a0a0a', gloves: '#e8e0d0', accent: '#d0a040' } })
    }
  };
  const RAPTOR_COLS = [
    { body: '#5a8a3a', belly: '#d8d0a0', stripe: '#2e4a1e' },
    { body: '#3a7a7a', belly: '#d0d8b8', stripe: '#1e3a4a' }
  ];
  const PACHY_COLS = [
    { body: '#8a6a3a', belly: '#e0d0a0', dome: '#c8a070', spots: '#5a4020' },
    { body: '#6a7a8a', belly: '#d8d8c8', dome: '#a0a8b8', spots: '#3a4a5a' }
  ];
  const REX_COLS = { body: '#6a4a3a', belly: '#c8b090', stripe: '#3a2418' };
  const DEINO_COLS = { body: '#4a5a3a', belly: '#b0a878', stripe: '#24301c' };
  const KOLOS_COLS = { body: '#c08a30', belly: '#f0d890', stripe: '#6a3a10' };
  // BARON BURSZTYN — antybohater do odblokowania po ukończeniu gry
  CHARS.bursztyn = {
    name: 'BARON', desc: 'ANTYBOHATER • ENERGIA', speed: 1.5, hp: 115, stats: [3, 3, 2], innate: 'cane', power: 1.1,
    combo: ['caneJab', 'caneJab2', 'caneSweep'],
    moves: ['SPECJAŁ: SKOK PRZEZ CIEŃ', 'DÓŁ,PRZÓD+ATAK: FALA ENERGII'],
    build: Object.assign(ENEMIES.baron.mk(), { scale: 1.08 })
  };
  ALT.bursztyn = { shirt: '#1a2a3a', pants: '#3a2a1a' };
  // bossowie do odblokowania (pokonaj ich bez straty życia)
  CHARS.padlin = {
    name: 'PADLINIARZ', desc: 'ZBIERACZ • KOTWICA', speed: 1.15, hp: 150, stats: [1, 3, 3], innate: 'anchor', power: 1.3,
    combo: ['jab', 'cross', 'hammer'],
    moves: ['SPECJAŁ: MŁYN KOTWICĄ', 'DÓŁ,PRZÓD+ATAK: RZUT KOTWICĄ'],
    build: Object.assign(ENEMIES.padliniarz.mk(), { scale: 1.16 })
  };
  ALT.padlin = { shirt: '#4a7a9a', hair: '#4a7a9a' };
  CHARS.zmijka = {
    name: 'ŻMIJA', desc: 'KRÓLOWA BAGIEN • BICZ', speed: 1.9, hp: 100, stats: [3, 2, 1], innate: 'whip', power: 0.95,
    combo: ['jab', 'jab', 'pWhip'],
    moves: ['SPECJAŁ: WIR BICZA', 'DÓŁ,PRZÓD+ATAK: WACHLARZ NOŻY'],
    build: Object.assign(ENEMIES.zmija.mk(), { scale: 1.04 })
  };
  ALT.zmijka = { shirt: '#2a5a3a', hair: '#c03a2a' };
  const HERO_UNLOCKS = [['bursztyn', 'baron'], ['padlin', 'padlin'], ['zmijka', 'zmijka']];
  const TRIKE_COLS = [{ body: '#7a8a5a', belly: '#d8d0a8', frill: '#c0603a' }, { body: '#8a6a5a', belly: '#e0d0b0', frill: '#3a7aa0' }];
  const PARA_COLS = [{ body: '#5a7a9a', belly: '#d8dce0', crest: '#c04a3a', stripe: '#3a4a6a' }, { body: '#7a6a3a', belly: '#e0d8b8', crest: '#3a8a5a', stripe: '#4a3a1a' }];
  const TAMEABLE = ['raptor', 'pachy', 'trike', 'para', 'ptera'];

  // =============================================================== EKRAN
  const screen = document.getElementById('screen');
  let sctx = screen.getContext('2d');
  const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
  const ctx = buf.getContext('2d');
  let S = 3;
  // Płótno ma rozdzielczość fizycznych pikseli monitora (devicePixelRatio), więc przy skalowaniu Windows
  // (125%, 150%) przeglądarka go nie rozciąga — piksele i skanlinie CRT zostają równe.
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    // dopasowanie do okna (bez zaokrąglania do całości) — gra wypełnia pełną wysokość, wolne miejsce zostaje tylko po bokach
    const k = Math.min(innerWidth * dpr / W, innerHeight * dpr / H);
    S = k;
    screen.width = Math.round(W * S); screen.height = Math.round(H * S);
    screen.style.width = (screen.width / dpr) + 'px'; screen.style.height = (screen.height / dpr) + 'px';
    if (window.__paleoBooted) drawBezel();
  }
  matchMedia && (function watchDpr() {
    try { matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`).addEventListener('change', () => { resize(); watchDpr(); }, { once: true }); } catch (e) { }
  })();
  addEventListener('resize', resize); resize();

  // Font pikselowy nie ma polskich znaków — rysujemy literę bazową i dokładamy znak diakrytyczny.
  const DIAC = { 'Ą': ['A', 'ogonek'], 'Ć': ['C', 'acute'], 'Ę': ['E', 'ogonek'], 'Ł': ['L', 'stroke'], 'Ń': ['N', 'acute'],
    'Ó': ['O', 'acute'], 'Ś': ['S', 'acute'], 'Ź': ['Z', 'acute'], 'Ż': ['Z', 'dot'] };
  const PAD_FACE = { 0: ['A', '#3cb043'], 1: ['B', '#e03c31'], 2: ['X', '#2f6fdf'], 3: ['Y', '#e8b820'] };
  const PAD_NAMES = { 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT', 8: 'SELECT', 9: 'START', 10: 'L3', 11: 'R3', 16: 'HOME' };
  const TOKEN_ACT = { ok: 'attack', back: 'jump' };
  const PAD_BACK = 1;   // przycisk B — zawsze „wstecz” w menu
  function padBtnOf(action, pIdx) {
    if (action === 'back') return PAD_BACK;
    const M = PADMAPS[pIdx || 0];
    // „OK” w menu: przycisk ataku inny niż B (B zawsze cofa), a gdy go brak — START
    if (action === 'ok') { const b = M.attack.find(x => x !== PAD_BACK); return b !== undefined ? b : (M.start[0] !== undefined ? M.start[0] : null); }
    const m = M[TOKEN_ACT[action] || action]; return m && m.length ? m[0] : null;
  }
  Object.assign(PAD_NAMES, { 12: 'D▲', 13: 'D▼', 14: 'D◄', 15: 'D►' });
  // nazwa wpisu: przycisk, oś gałki (L/R = lewa/prawa gałka) albo krzyżak „hat”
  function padLabel(e) {
    if (typeof e === 'number') return PAD_NAMES[e] || ('B' + e);
    if (e[0] === 'a') {
      const ax = +e.slice(1, -1), neg = e.endsWith('-');
      if (ax < 4) return (ax < 2 ? 'L' : 'R') + (ax % 2 ? (neg ? '▲' : '▼') : (neg ? '◄' : '►'));
      return 'OŚ' + ax + (neg ? '-' : '+');
    }
    const v = +e.split(':')[1], dirs = ['▲', '▲►', '►', '►▼', '▼', '▼◄', '◄', '◄▲'];
    return 'HAT' + dirs[Math.round((v + 1) / HAT_STEP) % 8];
  }
  function padIconW(btn, px) { return PAD_FACE[btn] ? px * 1.25 : px * (0.75 * padLabel(btn).length + 0.6); }
  // rysuje ikonę przycisku pada (współrzędne ekranu w pikselach), zwraca szerokość
  function drawPadIcon(g, btn, x, y, px) {
    const w = btn === null ? px : padIconW(btn, px), cy = y + px * 0.5;
    g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
    if (btn === null) { g.fillStyle = '#808080'; g.font = `${px}px "Press Start 2P", monospace`; g.fillText('—', x + w / 2, cy); g.restore(); return w; }
    if (PAD_FACE[btn]) {
      const [l, c] = PAD_FACE[btn], r = px * 0.62;
      g.fillStyle = '#000'; g.beginPath(); g.arc(x + w / 2, cy, r + Math.max(1, px * 0.12), 0, Math.PI * 2); g.fill();
      g.fillStyle = c; g.beginPath(); g.arc(x + w / 2, cy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff'; g.font = `${Math.round(px * 0.72)}px "Press Start 2P", monospace`; g.fillText(l, x + w / 2 + px * 0.04, cy + px * 0.05);
    } else {
      const l = padLabel(btn), h = px * 1.15, r = px * 0.35;
      g.fillStyle = '#000'; g.fillRect(x - 1, cy - h / 2 - 1, w + 2, h + 2);
      g.fillStyle = '#505868'; g.beginPath(); g.moveTo(x + r, cy - h / 2); g.arcTo(x + w, cy - h / 2, x + w, cy + h / 2, r); g.arcTo(x + w, cy + h / 2, x, cy + h / 2, r);
      g.arcTo(x, cy + h / 2, x, cy - h / 2, r); g.arcTo(x, cy - h / 2, x + w, cy - h / 2, r); g.fill();
      // tekst + strzałki rysowane jako trójkąty (czcionka ma je bardzo małe)
      const arr = [...(l.match(/[▲▼◄►]+$/) || [''])[0]], t = l.slice(0, l.length - arr.length), aw = px * 0.62;
      g.font = `${Math.round(px * 0.6)}px "Press Start 2P", monospace`;
      const tw = t ? g.measureText(t).width : 0, tot = tw + arr.length * aw + (t && arr.length ? px * 0.1 : 0);
      let ax = x + (w - tot) / 2;
      g.fillStyle = '#fff';
      if (t) { g.textAlign = 'left'; g.fillText(t, ax, cy + px * 0.05); ax += tw + (arr.length ? px * 0.1 : 0); }
      arr.forEach(ch => {
        const c = ax + aw / 2, r = px * 0.26;
        g.beginPath();
        if (ch === '▲') { g.moveTo(c, cy - r); g.lineTo(c + r, cy + r * 0.8); g.lineTo(c - r, cy + r * 0.8); }
        else if (ch === '▼') { g.moveTo(c, cy + r); g.lineTo(c + r, cy - r * 0.8); g.lineTo(c - r, cy - r * 0.8); }
        else if (ch === '◄') { g.moveTo(c - r, cy); g.lineTo(c + r * 0.8, cy - r); g.lineTo(c + r * 0.8, cy + r); }
        else { g.moveTo(c + r, cy); g.lineTo(c - r * 0.8, cy - r); g.lineTo(c - r * 0.8, cy + r); }
        g.fill(); ax += aw;
      });
    }
    g.restore();
    return w;
  }
  // Drobny tekst (podpowiedzi, opisy) — czytelna pikselowa czcionka Tiny5 z polskimi znakami.
  // Rozmiar zaokrąglony do wielokrotności siatki kroju (8 px), żeby piksele liter były równe.
  const SMALL_TEXT = 5;
  function fontOf(size) {
    if (size < SMALL_TEXT) {
      const raw = size * S * 1.45, px = raw >= 12 ? Math.max(8, Math.round(raw / 8) * 8) : Math.max(8, Math.round(raw));
      return { px, small: true, font: `${px}px "Tiny5", "Pixelify Sans", "Courier New", monospace` };
    }
    const px = Math.round(size * S);
    return { px, small: false, font: `${px}px "Press Start 2P", "Courier New", monospace` };
  }
  function richText(str, x, y, size, col, align, noOutline) {
    const parts = [], re = /\{(\w+)(?::(\d))?\|([^}]*)\}/g;
    let m, last = 0;
    while ((m = re.exec(str))) { parts.push(str.slice(last, m.index)); parts.push({ act: m[1], p: +(m[2] || 0), kb: m[3] }); last = re.lastIndex; }
    parts.push(str.slice(last));
    if (app.lastDev !== 'pad') { text(parts.map(q => typeof q === 'string' ? q : q.kb).join(''), x, y, size, col, align, noOutline); return; }
    const px = Math.round(size * S);
    sctx.font = fontOf(size).font;
    const widths = parts.map(q => typeof q === 'string' ? sctx.measureText(q).width : (padBtnOf(q.act, q.p) === null ? px : padIconW(padBtnOf(q.act, q.p), px)));
    const total = widths.reduce((a, b) => a + b, 0);
    let cx = x * S - (align === 'center' ? total / 2 : align === 'right' ? total : 0);
    parts.forEach((q, i) => {
      if (typeof q === 'string') { if (q) text(q, cx / S, y, size, col, 'left', noOutline); }
      else drawPadIcon(sctx, padBtnOf(q.act, q.p), cx, y * S, px);
      cx += widths[i];
    });
  }
  function text(str, x, y, size, col, align, noOutline) {
    if (str.indexOf('{') >= 0) { richText(str, x, y, size, col, align, noOutline); return; }
    const F = fontOf(size), px = F.px;
    sctx.font = F.font;
    sctx.textAlign = align || 'left'; sctx.textBaseline = 'top';
    if (F.small) {
      // Tiny5 ma własne polskie znaki — bez doklejania ogonków; lekko w górę, bo krój ma wysoki górny margines
      const ty = Math.round(y * S - px * 0.12), tx = Math.round(x * S);
      if (!noOutline) { sctx.lineJoin = 'round'; sctx.lineWidth = Math.max(2, S * 1.1); sctx.strokeStyle = '#000'; sctx.strokeText(str, tx, ty); }
      sctx.fillStyle = col || '#fff'; sctx.fillText(str, tx, ty);
      return;
    }
    const marks = [];
    let base = '';
    for (const ch of str) {
      const d = DIAC[ch];
      if (d) { marks.push([base.length, d[1]]); base += d[0]; } else base += ch;
    }
    if (!noOutline) { sctx.lineJoin = 'round'; sctx.lineWidth = Math.max(2, S * 1.3); sctx.strokeStyle = '#000'; sctx.strokeText(base, x * S, y * S); }
    sctx.fillStyle = col || '#fff'; sctx.fillText(base, x * S, y * S);
    if (!marks.length) return;
    const total = sctx.measureText(base).width, cw = total / [...base].length;
    const x0 = x * S - (align === 'center' ? total / 2 : align === 'right' ? total : 0), y0 = y * S;
    const u = px / 8;
    for (const [i, m] of marks) {
      const cx = x0 + i * cw;
      const rects = m === 'acute' ? [[4, -3, 2, 1.5], [3, -2, 2, 1.2]]
        : m === 'dot' ? [[3, -2.5, 2, 1.8]]
          : m === 'ogonek' ? [[5, 7, 1.5, 1.6], [5.5, 8.2, 2, 1.2]]
            : [[0.5, 3, 4, 1.4]];
      if (!noOutline) { sctx.fillStyle = '#000'; for (const [rx, ry, rw, rh] of rects) sctx.fillRect(cx + rx * u - S * 0.6, y0 + ry * u - S * 0.6, rw * u + S * 1.2, rh * u + S * 1.2); }
      sctx.fillStyle = col || '#fff';
      for (const [rx, ry, rw, rh] of rects) sctx.fillRect(cx + rx * u, y0 + ry * u, rw * u, rh * u);
    }
  }

  // =============================================================== WEJŚCIE
  // Gracz 1: WASD + J/K/L (lub Z/X/C), Enter. Gracz 2: strzałki + ,/./ (lub Num1/2/3), Num Enter / prawy Shift.
  // Dopóki gracz 2 nie dołączy, strzałki sterują graczem 1.
  const KEYMAPS = [
    { KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down', KeyJ: 'attack', KeyZ: 'attack', KeyK: 'jump', KeyX: 'jump', Space: 'jump', KeyU: 'block', KeyV: 'block', Enter: 'start' },
    { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Numpad1: 'attack', Comma: 'attack', Numpad2: 'jump', Period: 'jump', Numpad0: 'block', Quote: 'block', NumpadEnter: 'start', ShiftRight: 'start' }
  ];
  const KEYMAP_SYS = { KeyP: 'pause', Escape: 'pause', KeyM: 'mute' };
  const ACTIONS = ['left', 'right', 'up', 'down', 'attack', 'jump', 'special', 'block', 'start', 'pause', 'mute'];
  const kbd = [{}, {}], raw = [{}, {}], held = {}, pressed = {};
  const inp = [{ held: {}, pressed: {} }, { held: {}, pressed: {} }];
  let padPrev = [{}, {}];
  // Pad (standardowy układ): 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 8 SELECT, 9 START, 12–15 krzyżak.
  // Kierunki zawsze z gałki i krzyżaka; przyciski akcji można przypisać w opcjach.
  // Wpis mapy: liczba = przycisk; 'a0-' / 'a1+' = oś gałki (numer osi i kierunek); 'h9:-1.000' = krzyżak typu „hat” na jednej osi.
  const PAD_DIRS = ['up', 'down', 'left', 'right'];
  const PAD_ACTIONS = ['attack', 'jump', 'block', 'start', 'pause'];
  const PAD_BINDS = PAD_DIRS.concat(PAD_ACTIONS);
  const DEFAULT_PADMAP = { up: [12, 'a1-'], down: [13, 'a1+'], left: [14, 'a0-'], right: [15, 'a0+'],
    attack: [0, 2], jump: [1, 3], block: [4, 6], start: [9], pause: [8] };
  const PADMAPS = [0, 1].map(() => JSON.parse(JSON.stringify(DEFAULT_PADMAP)));
  (function () {
    const k = loadJSON('paleo_pads');
    if (Array.isArray(k) && k.length === 2) k.forEach((m, i) => {
      PAD_BINDS.forEach(a => { if (m && Array.isArray(m[a])) PADMAPS[i][a] = m[a]; });
      // mapa sprzed bloku: blok dostaje wolne z domyślnych przycisków (LB / LT)
      if (m && !Array.isArray(m.block)) { const used = PAD_BINDS.filter(a => a !== 'block').flatMap(a => PADMAPS[i][a]); PADMAPS[i].block = DEFAULT_PADMAP.block.filter(b => !used.includes(b)); }
    });
  })();
  let padsNow = [], padBtnPrev = [[], []];
  // ---- ujednolicenie padów: niestandardowe układy (np. pad Xbox przez Bluetooth: „Unknown Gamepad Vendor 045e”)
  // przemapowujemy na układ standardowy, a krzyżak typu „hat” (jedna oś) zamieniamy na przyciski 12–15.
  // indeks w układzie standardowym <- indeks surowy
  const XBOX_BT = { 0: 0, 1: 1, 2: 3, 3: 4, 4: 6, 5: 7, 8: 10, 9: 11, 10: 13, 11: 14, 16: 12 };
  const padKnown = {};
  function hatDirs(v) {
    if (v === undefined || Math.abs(v) > 1.05) return null;            // spoczynek (ok. 1.2857)
    const k = Math.round((v + 1) / (2 / 7)) % 8;                        // 0 góra, 1 góra-prawo … 7 góra-lewo
    return { up: k === 7 || k <= 1, right: k >= 1 && k <= 3, down: k >= 3 && k <= 5, left: k >= 5 && k <= 7 };
  }
  function padView(raw) {
    if (raw.mapping === 'standard') return raw;
    const rb = raw.buttons, btn = j => rb[j] ? { pressed: !!rb[j].pressed, value: rb[j].value || 0 } : { pressed: false, value: 0 };
    let buttons;
    const xbox = /045e/i.test(raw.id) && rb.length >= 15;
    if (xbox) {
      buttons = [];
      for (let j = 0; j < 17; j++) buttons[j] = btn(XBOX_BT[j] !== undefined ? XBOX_BT[j] : 99);
    } else buttons = Array.from(rb, (b, j) => btn(j));
    while (buttons.length < 17) buttons.push({ pressed: false, value: 0 });
    // krzyżak „hat”: oś, której spoczynek wypada poza zakresem [-1, 1]
    let hi = raw.axes.length > 9 ? 9 : -1;
    for (let j = 0; j < raw.axes.length; j++) if (Math.abs(raw.axes[j]) > 1.05) { hi = j; break; }
    const hd = hi >= 0 ? hatDirs(raw.axes[hi]) : null;
    if (hd) { if (hd.up) buttons[12] = { pressed: true, value: 1 }; if (hd.down) buttons[13] = { pressed: true, value: 1 }; if (hd.left) buttons[14] = { pressed: true, value: 1 }; if (hd.right) buttons[15] = { pressed: true, value: 1 }; }
    const axes = raw.axes.slice();
    if (hi >= 0) axes[hi] = 0;                                            // „hat” obsłużony jako przyciski
    return { id: raw.id, index: raw.index, mapping: 'paleo', connected: true, buttons, axes, vibrationActuator: raw.vibrationActuator, hapticActuators: raw.hapticActuators };
  }
  addEventListener('gamepadconnected', e => { AU.init(); });
  const menuBack = [false, false];
  const PAD_DEAD = 0.4, HAT_STEP = 2 / 7;
  // czy wpis mapy jest teraz wciśnięty / wychylony
  function padHeld(pad, e) {
    if (typeof e === 'number') return !!(pad.buttons[e] && pad.buttons[e].pressed);
    if (e[0] === 'a') { const v = pad.axes[+e.slice(1, -1)] || 0; return e.endsWith('-') ? v < -PAD_DEAD : v > PAD_DEAD; }
    if (e[0] === 'h') {
      const [ax, tv] = e.slice(1).split(':'), v = pad.axes[+ax];
      if (v === undefined || Math.abs(v) > 1.05) return false;          // pozycja spoczynku krzyżaka „hat”
      // pozycja docelowa i sąsiednie skosy (wartości „hat” co 2/7, zawinięte między -1 a 1)
      const d = Math.abs(v - (+tv)), dw = Math.min(d, Math.abs(d - (2 + HAT_STEP)));
      return dw < HAT_STEP * 1.2;
    }
    return false;
  }
  const entryKind = e => typeof e === 'number' ? 'b' : e[0];
  function resetPads() { PADMAPS.forEach(m => PAD_BINDS.forEach(a => { m[a] = DEFAULT_PADMAP[a].slice(); })); safeSet('paleo_pads', JSON.stringify(PADMAPS)); }
  function assignPad(i, action, entry) {
    const m = PADMAPS[i];
    PAD_BINDS.forEach(a => { m[a] = m[a].filter(b => b !== entry); });
    // kierunek trzyma po jednym wpisie każdego rodzaju (przycisk, oś, „hat”) — np. krzyżak i gałka naraz
    if (PAD_DIRS.includes(action)) m[action] = m[action].filter(b => entryKind(b) !== entryKind(entry)).concat([entry]);
    else m[action] = [entry];
    safeSet('paleo_pads', JSON.stringify(PADMAPS));
    app.padCapture = null; sfx('pickup');
  }
  // wykrywa nowy przycisk albo wychylenie osi (względem pozycji z chwili rozpoczęcia przypisywania)
  function padCaptureEntry(pad, i, now) {
    const c = app.padCapture;
    const k = now.findIndex((v, j) => v && !padBtnPrev[i][j]);
    if (k >= 0) return k;
    if (!c.rest) { c.rest = pad.axes.slice(); return null; }
    for (let j = 0; j < pad.axes.length; j++) {
      const v = pad.axes[j], r = c.rest[j] || 0;
      if (Math.abs(r) > 1.05) { if (Math.abs(v) <= 1.05 && Math.abs(v - r) > 0.1) return 'h' + j + ':' + v.toFixed(3); continue; }
      if (Math.abs(v) > 0.6 && Math.abs(v - r) > 0.6) return 'a' + j + (v < 0 ? '-' : '+');
    }
    return null;
  }
  // wibracje pada gracza pIdx (jeśli przeglądarka i pad je obsługują)
  function rumble(pIdx, strong, weak, ms) {
    if (!OPTS.rumble) return;
    const pad = padsNow[pIdx];
    if (!pad) return;
    try {
      const va = pad.vibrationActuator;
      if (va && va.playEffect) { const r = va.playEffect('dual-rumble', { duration: ms, strongMagnitude: Math.min(1, strong), weakMagnitude: Math.min(1, weak) }); if (r && r.catch) r.catch(() => {}); }
      else if (pad.hapticActuators && pad.hapticActuators[0]) pad.hapticActuators[0].pulse(Math.max(strong, weak), ms);
    } catch (e) { }
  }
  function rumbleAll(strong, weak, ms) { for (let i = 0; i < 2; i++) rumble(i, strong, weak, ms); }
  addEventListener('keydown', e => {
    AU.init(); app.lastDev = 'kbd';
    if (app.capture) { e.preventDefault(); captureKey(e.code); return; }
    if (e.code === 'KeyR' && app.mode === 'options' && app.padFor != null && !app.padCapture) kbd[0].resetPad = true;
    let hit = false;
    KEYMAPS.forEach((m, i) => { const a = m[e.code]; if (a) { hit = true; if (!kbd[i][a]) raw[i][a] = true; kbd[i][a] = true; } });
    const s = KEYMAP_SYS[e.code];
    if (s) { hit = true; if (!kbd[0][s]) raw[0][s] = true; kbd[0][s] = true; }
    if (e.code === 'Escape' && !e.repeat) menuBack[0] = true;
    if (hit) e.preventDefault();
  });
  addEventListener('keyup', e => {
    KEYMAPS.forEach((m, i) => { const a = m[e.code]; if (a) kbd[i][a] = false; });
    const s = KEYMAP_SYS[e.code]; if (s) kbd[0][s] = false;
  });
  addEventListener('pointerdown', () => AU.init());
  function pollInput() {
    let pads = [];
    try { pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p && p.connected !== false).map(padView) : []; } catch (e) { }
    // komunikat o nowo wykrytym padzie
    pads.forEach((p, i) => {
      const key = i + ':' + p.id;
      if (!padKnown[key]) { padKnown[key] = 1; app.toasts.push({ head: 'PAD ' + (i + 1) + ' WYKRYTY', name: /045e/i.test(p.id) ? 'PAD XBOX' : (String(p.id).replace(/\s*\(.*$/, '').toUpperCase().slice(0, 30) || 'PAD'), t: 0, col: '#80f0ff' }); }
    });
    padsNow = pads;
    const p2 = app.p2Active;
    for (let i = 0; i < 2; i++) {
      const pad = pads[i], pd = {};
      if (pad) {
        const now = pad.buttons.map(x => !!(x && x.pressed)), edge = j => now[j] && !padBtnPrev[i][j];
        if (now.some((v, j) => edge(j))) app.lastDev = 'pad';
        if (edge(PAD_BACK) && !app.padCapture) menuBack[i] = true;
        if (app.padCapture && app.padCapture.pIdx === i) {
          const k = padCaptureEntry(pad, i, now);
          if (k !== null) assignPad(i, app.padCapture.action, k);
          // trzymany przycisk nie może od razu wywołać akcji — czekamy na puszczenie
          padBtnPrev[i] = now; padPrev[i] = Object.fromEntries(ACTIONS.map(k => [k, true]));
          continue;
        }
        padBtnPrev[i] = now;
        const PM = PADMAPS[i];
        PAD_BINDS.forEach(a => { pd[a] = PM[a].some(e => padHeld(pad, e)); });
        if (PAD_DIRS.some(a => pd[a] && !padPrev[i][a])) app.lastDev = 'pad';
        if (app.padCapture) Object.keys(pd).forEach(k => { pd[k] = false; });
        Object.keys(pd).forEach(k => { if (pd[k] && !padPrev[i][k]) { raw[i][k] = true; AU.init(); } });
      }
      padPrev[i] = pd;
      const I = inp[i];
      ACTIONS.forEach(k => {
        // gracz 1 dostaje strzałki gracza 2, dopóki ten nie dołączył
        const dirKey = k === 'left' || k === 'right' || k === 'up' || k === 'down';
        const shareH = i === 0 && !p2 && dirKey && kbd[1][k], shareP = i === 0 && !p2 && dirKey && raw[1][k];
        I.held[k] = !!(kbd[i][k] || pd[k] || shareH);
        I.pressed[k] = !!(raw[i][k] || shareP);
      });
    }
    // specjał: tylko atak i skok naraz (jeden z nich wciśnięty, drugi trzymany)
    inp.forEach(I => {
      I.pressed.special = !!((I.pressed.attack && I.held.jump) || (I.pressed.jump && I.held.attack));
      I.held.special = !!(I.held.attack && I.held.jump);
    });
    // Escape / B w menu zawsze znaczą „wstecz” — niezależnie od przypisań; nie mogą przy tym zatwierdzać
    const inMenu = !['play', 'bonus'].includes(app.mode) && !app.capture && !app.padCapture;
    for (let i = 0; i < 2; i++) {
      if (menuBack[i] && inMenu) { const P = inp[i].pressed; P.pause = true; P.attack = P.start = P.special = false; }
      menuBack[i] = false;
    }
    ACTIONS.forEach(k => { held[k] = inp[0].held[k] || inp[1].held[k]; pressed[k] = inp[0].pressed[k] || inp[1].pressed[k]; });
  }
  // ---------------------------------------------------------------- OPCJE (config.js + pamięć przeglądarki)
  const CFG = window.GAME_CONFIG || {};
  const DIFFS = { easy: { name: 'ŁATWY', hp: 0.75, dmg: 0.6, desc: 'SŁABSI WROGOWIE, MNIEJ OBRAŻEŃ' },
    normal: { name: 'NORMALNY', hp: 1, dmg: 1, desc: 'ZBALANSOWANA ROZGRYWKA' },
    arcade: { name: 'ARCADE', hp: 1.25, dmg: 1.4, desc: 'JAK NA AUTOMACIE — BEZ LITOŚCI' } };
  const DIFF_KEYS = ['easy', 'normal', 'arcade'];
  const TOUCH_MODES = ['auto', 'on', 'off'], TOUCH_NAMES = { auto: 'AUTO', on: 'WŁ.', off: 'WYŁ.' };
  const num = (v, d) => (typeof v === 'number' && !isNaN(v)) ? v : d;
  function defaultOpts() {
    return { difficulty: DIFFS[CFG.difficulty] ? CFG.difficulty : 'normal', lives: clamp(num(CFG.lives, 3), 1, 5),
      music: clamp(num(CFG.musicVolume, 7), 0, 10), sfx: clamp(num(CFG.sfxVolume, 8), 0, 10), touch: TOUCH_MODES.includes(CFG.touch) ? CFG.touch : 'auto', assist: CFG.assist === true, crt: CFG.crt === true ? 'arcade' : (['arcade', 'pc', 'tv'].includes(CFG.crt) ? CFG.crt : 'off'), rumble: CFG.rumble !== false, bezel: CFG.bezel !== false };
  }
  function loadJSON(k) { try { return JSON.parse(safeGet(k)); } catch (e) { return null; } }
  let OPTS = Object.assign(defaultOpts(), loadJSON('paleo_opts') || {});
  const diffNow = () => DIFFS[OPTS.difficulty] || DIFFS.normal;
  function saveOpts() { safeSet('paleo_opts', JSON.stringify(OPTS)); AU.setVolumes(OPTS.music, OPTS.sfx); updateTouchVisibility(); }
  // przypisania klawiszy
  const DEFAULT_KEYMAPS = KEYMAPS.map(m => Object.assign({}, m));
  (function () {
    const k = loadJSON('paleo_keys');
    if (!(Array.isArray(k) && k.length === 2)) return;
    k.forEach((m, i) => {
      Object.keys(m).forEach(code => { if (m[code] === 'special') delete m[code]; });   // specjał tylko atak+skok
      if (!Object.values(m).includes('block')) Object.keys(DEFAULT_KEYMAPS[i]).forEach(code => { if (DEFAULT_KEYMAPS[i][code] === 'block' && !m[code]) m[code] = 'block'; });
      KEYMAPS[i] = m;
    });
  })();
  function resetKeys() { DEFAULT_KEYMAPS.forEach((m, i) => { KEYMAPS[i] = Object.assign({}, m); }); safeSet('paleo_keys', JSON.stringify(KEYMAPS)); }
  const RESERVED = ['KeyP', 'Escape', 'KeyM'];
  const BIND_ACTIONS = ['left', 'right', 'up', 'down', 'attack', 'jump', 'block', 'start'];
  const ACTION_NAMES = { left: 'LEWO', right: 'PRAWO', up: 'GÓRA', down: 'DÓŁ', attack: 'ATAK', jump: 'SKOK', special: 'SPECJAŁ', block: 'BLOK', start: 'START', pause: 'PAUZA' };
  function keyName(code) {
    const M = { Space: 'SPACJA', Enter: 'ENTER', NumpadEnter: 'NUM ENTER', ShiftRight: 'P.SHIFT', ShiftLeft: 'L.SHIFT', ControlLeft: 'L.CTRL', ControlRight: 'P.CTRL',
      AltLeft: 'L.ALT', AltRight: 'P.ALT', Comma: ',', Period: '.', Slash: '/', Semicolon: ';', Quote: "'", BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '=',
      Tab: 'TAB', Backspace: 'BACKSPACE', ArrowLeft: 'STRZ.LEWO', ArrowRight: 'STRZ.PRAWO', ArrowUp: 'STRZ.GÓRA', ArrowDown: 'STRZ.DÓŁ' };
    if (M[code]) return M[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Numpad')) return 'NUM ' + code.slice(6).toUpperCase();
    return code.toUpperCase();
  }
  function keysFor(pIdx, action) { return Object.keys(KEYMAPS[pIdx]).filter(k => KEYMAPS[pIdx][k] === action).map(keyName).join(' / ') || '—'; }
  function captureKey(code) {
    const c = app.capture;
    if (code === 'Escape') { app.capture = null; sfx('select'); return; }
    if (RESERVED.includes(code)) { app.captureMsg = 90; sfx('empty'); return; }
    KEYMAPS.forEach(m => { delete m[code]; });
    const m = KEYMAPS[c.pIdx];
    Object.keys(m).forEach(k => { if (m[k] === c.action) delete m[k]; });
    m[code] = c.action;
    safeSet('paleo_keys', JSON.stringify(KEYMAPS));
    app.capture = null; sfx('pickup');
  }

  // ---------------------------------------------------------------- STEROWANIE DOTYKOWE
  let touchRoot = null;
  const isTouchDevice = () => ('ontouchstart' in window) || !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  function updateTouchVisibility() {
    const on = OPTS.touch === 'on' || (OPTS.touch === 'auto' && isTouchDevice());
    if (on && !touchRoot) buildTouch();
    if (touchRoot) touchRoot.classList.toggle('off', !on);
  }
  function buildTouch() {
    touchRoot = document.createElement('div'); touchRoot.id = 'touch'; document.body.appendChild(touchRoot);
    const mk = (cls, label) => { const d = document.createElement('div'); d.className = 'tp ' + cls; d.textContent = label || ''; touchRoot.appendChild(d); return d; };
    const set = (a, v) => { if (v && !kbd[0][a]) raw[0][a] = true; kbd[0][a] = v; };
    const pad = mk('pad'), knob = document.createElement('div'); knob.className = 'knob'; pad.appendChild(knob);
    let padId = null;
    const place = (dx, dy) => { knob.style.left = (50 + dx * 32) + '%'; knob.style.top = (50 + dy * 32) + '%'; knob.style.transform = 'translate(-50%,-50%)'; };
    const padMove = e => {
      const r = pad.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2);
      const len = Math.hypot(dx, dy); if (len > 1) { dx /= len; dy /= len; }
      place(dx, dy);
      set('left', dx < -0.38); set('right', dx > 0.38); set('up', dy < -0.38); set('down', dy > 0.38);
    };
    const padEnd = () => { padId = null; ['left', 'right', 'up', 'down'].forEach(a => set(a, false)); place(0, 0); };
    pad.addEventListener('pointerdown', e => { AU.init(); padId = e.pointerId; pad.setPointerCapture(e.pointerId); padMove(e); e.preventDefault(); });
    pad.addEventListener('pointermove', e => { if (e.pointerId === padId) padMove(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => pad.addEventListener(ev, e => { if (e.pointerId === padId) padEnd(); }));
    padEnd();
    [['ba', 'ATAK', 'attack'], ['bb', 'SKOK', 'jump'], ['bg', 'BLOK', 'block'], ['bst', 'START', 'start']].forEach(([cls, label, a]) => {
      const b = mk(cls, label);
      b.addEventListener('pointerdown', e => { AU.init(); b.setPointerCapture(e.pointerId); set(a, true); b.classList.add('on'); e.preventDefault(); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, () => { set(a, false); b.classList.remove('on'); }));
    });
  }

  function clearPressed() {
    Object.keys(pressed).forEach(k => pressed[k] = false);
    raw.forEach(r => Object.keys(r).forEach(k => r[k] = false));
    inp.forEach(I => Object.keys(I.pressed).forEach(k => I.pressed[k] = false));
  }

  // Przebieg gry: 1 → 2 → [3A miasto | 3B kopalnia] → bonus „Autostrada” → 4 port → bonus „Zagroda”
  //               → 5 opuszczona plaża → 6 kanały otchłani → 7 twierdza
  const STAGE_LABELS = ['1', '2', '3A', '3B', '4', '5', '6', '7'], RUN_LEN = 7;
  STAGES.forEach((st, i) => { st.label = STAGE_LABELS[i]; st.name = st.name.replace(/^ETAP \d+/, 'ETAP ' + STAGE_LABELS[i]); });
  const shortName = st => st.name.replace(/^ETAP \S+ — /, '');
  // co po ukończeniu etapu idx
  function afterStage(idx, team) {
    if (idx === 1) return goMap('branch', team);
    if (idx === 2 || idx === 3) return startBonus(team, 4);
    if (idx === 4) return startCages(team, 5);
    if (idx === 5) return startFlight(team, 6);
    if (idx === 6) return startTrain(team, 7);
    goMap(idx + 1, team);
  }
  function nextLabel(idx) {
    if (idx === 1) return 'WYBÓR TRASY: MIASTO LUB KOPALNIA';
    if (idx === 2 || idx === 3) return 'ETAP BONUSOWY — AUTOSTRADA 7';
    if (idx === 4) return 'ETAP BONUSOWY — ZAGRODA';
    if (idx === 5) return 'ETAP BONUSOWY — LOT NAD ZATOKĄ';
    if (idx === 6) return 'POCIĄG DO TWIERDZY';
    return STAGES[idx + 1] ? shortName(STAGES[idx + 1]) : '';
  }
  const bonus = window.BonusStage({ W, H, ctx, text, sfx, held, pressed, AU, rumble: (a, b, ms) => rumbleAll(a, b, ms) });
  const flight = window.FlightStage({ W, H, ctx, text, sfx, held, pressed, AU, rumble: (a, b, ms) => rumbleAll(a, b, ms) });
  const curBonus = () => app.bonusKind === 'flight' ? flight : bonus;

  // =============================================================== STAN GRY
  let layers = null;
  let G = null;
  const urlParams = new URLSearchParams(location.search);
  const urlStage = clamp((parseInt(urlParams.get('stage'), 10) || 1) - 1, 0, STAGES.length - 1);
  const app = { mode: 'title', t: 0, frame: 0, sel: 0, sel2: 1, p2Active: false, stageSel: urlStage, hiscore: 0 };
  // ---- tabela wyników (top 10, localStorage)
  const DEFAULT_SCORES = [['ANA', 120000, 6, 'nina'], ['KRK', 90000, 5, 'kruk'], ['TUR', 70000, 4, 'tur'], ['DIN', 55000, 4, 'nina'],
    ['REX', 40000, 3, 'tur'], ['ŻMI', 30000, 3, 'kruk'], ['PAL', 22000, 2, 'nina'], ['HWY', 15000, 2, 'kruk'], ['KŁY', 10000, 1, 'tur'], ['RDZ', 5000, 1, 'kruk']]
    .map(([n, s, st, c]) => ({ n, s, st, c }));
  function loadScores() {
    try { const v = JSON.parse(safeGet('paleo_scores')); if (Array.isArray(v) && v.length) return v.slice(0, 10); } catch (e) { /* brak */ }
    return DEFAULT_SCORES.map(x => Object.assign({}, x));
  }
  app.scores = loadScores();
  app.hiscore = app.scores[0].s;
  // Tryb debug pochodzi wyłącznie z pliku konfiguracji (config.js).
  app.debug = !!(window.GAME_CONFIG && window.GAME_CONFIG.debug);
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* brak */ } }

  function makeTeam() {
    const K = selKeys();
    const team = [makePlayer(K[app.sel] || K[0], 0)];
    if (app.p2Active) team.push(makePlayer(K[app.sel2] || K[1], 1, app.sel2 === app.sel));
    return team;
  }
  function startStage(idx, team, stObj) {
    if (team && !Array.isArray(team)) team = [team];
    ST = stObj || STAGES[idx];
    app.share = null;
    if (!stObj) {
      app.route = app.route || [];
      if (app.route[app.route.length - 1] !== idx) { app.route.push(idx); if (app.route.length === 1) { app.wxSeed = 1 + Math.random() * 1000; app.run = { cages: false, secrets: 0 }; } }
    }
    layers = ST.buildLayers();
    G = {
      stageIdx: idx, frame: 0, camX: 0, lockX: null, waveIdx: 0, wave: null, groupIdx: 0, pending: [],
      actors: [], items: [], props: [], fx: [], popups: [], shots: [],
      timer: 99, timerT: 0, goT: 0, hitstop: 0, shake: 0, slowmo: 0,
      lastEnemy: null, lastEnemyT: 0, bossDead: false, clearT: 0, introT: 150, introBoss: null
    };
    ST.PROPS.forEach(p => G.props.push({ x: p.x, y: p.y, kind: p.kind, drop: p.drop, secret: p.secret, hp: PROP_HP[p.kind] || 2, shake: 0 }));
    G.WAVES = (app.ngpRun && !stObj) ? shuffleWaves(ST.WAVES) : ST.WAVES;
    G.wx = stObj ? null : pickWeather(idx);
    G.vehicles = (ST.VEHICLES || []).map(v => Object.assign({ used: false }, v));
    G.special = ST.special || null; G.freed = 0; G.cageTotal = ST.PROPS.filter(p => p.kind === 'pen').length;
    if (G.special) G.timer = ST.time || 45;
    ST.PICKUPS.forEach(p => G.items.push({ type: p.type, x: p.x, y: p.y, z: 0, vz: 0, t: 0 }));
    G.players = team || makeTeam();
    G.playT = 0;
    G.players.forEach((pl, i) => {
      pl.st = { kills: 0, maxCombo: 0, dmg: 0, deaths: 0 }; pl.combo = 0; pl.comboT = 0;
      if (pl.out) { pl.out = false; pl.lives = Math.max(pl.lives, 0); }
      applyUps(pl);
      Object.assign(pl, { x: ST.startX - 60 - i * 26, y: 178 + i * 18, z: 0, vx: 0, vy: 0, vz: 0, face: 1, hp: pl.maxHp, lagHp: pl.maxHp, weapon: null,
        grabbing: null, grabbedBy: null, carry: null, invuln: 0, flash: 0, alive: true, dying: false, victory: false, running: false, mount: null });
      setState(pl, 'enter');
      G.actors.push(pl);
    });
    G.player = G.players[0];
    AU.stopMusic(); AU.play(ST.music);
  }

  // =============================================================== AKTORZY
  function baseActor(o) {
    return Object.assign({
      x: 0, y: 185, z: 0, vx: 0, vy: 0, vz: 0, face: 1, state: 'idle', t: 0, animT: 0,
      flash: 0, invuln: 0, hitSet: null, move: null, alive: true, remove: false, bounced: false, hurtCount: 0, alpha: 1
    }, o);
  }
  function makePlayer(key, idx, alt) {
    const d = CHARS[key];
    return baseActor({
      kind: 'player', team: 'player', key, def: d, b: alt ? altBuild(key) : d.build, name: d.name, pIdx: idx || 0,
      hp: d.hp, maxHp: d.hp, lagHp: d.hp, lives: OPTS.lives - 1, score: 0,
      comboIdx: 0, weapon: null, ammo: 0, dur: 0, running: false, tapDir: 0, tapT: -99, rad: 8,
      fury: 0, amber: 0, up: { hp: 0, combo: 0, bomb: 0, ride: 0, fury: 0 }
    });
  }
  function makeEnemy(type, x, y) {
    const d = ENEMIES[type];
    const kind = (type === 'raptor' || type === 'whitefang' || type === 'rraptor') ? 'raptor' : type === 'glider' ? 'glider' : type === 'digger' ? 'digger' : type === 'pachy' ? 'pachy' : type === 'ptera' ? 'ptera' : type === 'trike' ? 'trike' : type === 'para' ? 'para' : (type === 'rex' || type === 'deino' || type === 'kolos') ? 'rex' : (d.ai && ['hammer', 'whip', 'harpoon', 'baron'].includes(d.ai) ? 'boss' : 'human');
    const diff = ST.diff;
    const ngp = app.ngpRun && d.ai !== 'dummy' ? (d.boss ? 1.5 : 1.3) : 1;
    // trudność: bossowie dostają 60% różnicy życia (ARCADE +15%, ŁATWY -15%), zwykli wrogowie pełną
    const dHp = d.ai === 'dummy' ? 1 : d.boss ? 1 + (diffNow().hp - 1) * 0.6 : diffNow().hp;
    const hp = Math.round(d.hp * (d.boss ? 1 + (diff - 1) * 0.4 : diff) * dHp * ngp);
    const a = baseActor({
      kind, type, team: d.beast ? 'beast' : 'enemy', def: d, name: d.name,
      x, y, hp, maxHp: hp, lagHp: hp, state: 'enter', cool: rnd(30, 70), mode: 'hover', dmgMul: (1 + (diff - 1) * 0.6) * diffNow().dmg * (app.ngpRun ? 1.25 : 1),
      modeT: rnd(20, 80), hoverY: rnd(FLOOR_TOP + 10, FLOOR_BOTTOM - 6),
      rad: kind === 'digger' ? 34 : kind === 'rex' ? 30 : (kind === 'boss' ? 14 : (type === 'brute' || type === 'klin' ? 12 : (kind === 'pachy' ? 14 : 9))),
      depthR: kind === 'rex' ? 10 : kind === 'digger' ? 6 : 0
    });
    if (d.mk) a.b = d.mk();
    if (type !== 'dummy' && !app.demo && !app.seen[type]) { app.seen[type] = 1; safeSet('paleo_seen', JSON.stringify(app.seen)); }
    if (type === 'raptor') a.cols = RAPTOR_COLS[Math.random() * 2 | 0];
    if (type === 'rraptor') { a.cols = { body: '#7a5a3a', belly: '#c8a878', stripe: '#3a2a1a' }; a.rider = ENEMIES.grunt.mk(); }
    if (type === 'whitefang') a.cols = { body: '#e8e6dc', belly: '#ffffff', stripe: '#b8b8c4' };
    if (type === 'trike') { a.cols = TRIKE_COLS[Math.random() * 2 | 0]; a.rad = 16; }
    if (type === 'para') { a.cols = PARA_COLS[Math.random() * 2 | 0]; a.rad = 12; }
    if (type === 'pachy') a.cols = PACHY_COLS[Math.random() * 2 | 0];
    if (type === 'rex') a.cols = REX_COLS;
    if (type === 'deino') a.cols = DEINO_COLS;
    if (type === 'kolos') a.cols = KOLOS_COLS;
    if (d.weapon) a.weapon = d.weapon;
    return a;
  }
  function setState(a, s) { a.state = s; a.t = 0; a.hitSet = null; }
  const players = () => G.actors.filter(a => a.kind === 'player' && a.alive);
  const foes = () => G.actors.filter(a => a.team !== 'player' && a.alive);
  const isBoss = a => !!(a.def && a.def.boss);
  const scaleOf = a => (a.b && a.b.scale) || 1;
  const hitY = a => a.kind === 'rex' ? 52 : a.kind === 'trike' ? 26 : a.kind === 'para' ? 30 : (a.kind === 'raptor' || a.kind === 'pachy') ? 22 : 26 * scaleOf(a);

  function hostile(att, t) {
    if (att === t) return false;
    if (att.team === 'player') return t.team !== 'player';
    if (att.team === 'enemy') return t.team === 'player';
    if (att.team === 'beast') return t.team !== 'beast' && !isBoss(t);
    return false;
  }
  function hittable(t) {
    if (!t.alive || t.invuln > 0) return false;
    // żonglerka: wróg wybity w powietrze może być dobity (do 3 razy na jeden lot)
    if (t.state === 'fall' && t.team !== 'player' && t.z > 4 && t.hp > 0 && !isBoss(t) && (t.juggle || 0) < 3) return true;
    return !['down', 'dead', 'getup', 'fall', 'thrown', 'grabbed', 'enter', 'drop', 'tamed', 'flee', 'airthrow', 'teamfly'].includes(t.state);
  }

  // Zastosuj obrażenia
  // Blok gracza: ciosy i pociski z przodu zadają ~12% obrażeń; pasek gardy maleje, przy zerze — przebicie.
  function tryBlock(t, dmg, knock, src, opt) {
    if (t.kind !== 'player' || t.state !== 'block' || !src || opt.unblock || src.team === 'player') return false;
    if ((Math.sign(src.x - t.x) || 1) !== t.face) return false;
    // blok wciśnięty tuż przed ciosem = parowanie
    if (!src.proj && G.frame - (t.blockStart || -99) <= 8 && t.hp > 0) { parry(t, src); return true; }
    t.guard = (t.guard === undefined ? 100 : t.guard) - dmg * (isBoss(src) ? 3.5 : 2.2);
    if (t.guard <= 0) {
      t.guard = 35; G.popups.push({ x: t.x, y: t.y - 60, txt: 'PRZEBITA GARDA!', t: 0, col: '#ff8060' });
      sfx('heavy'); G.shake = 6; rumble(t.pIdx, 0.9, 0.6, 260);
      return false;                        // cios wchodzi w pełni
    }
    const chip = Math.min(Math.max(0, t.hp - 1), Math.round(dmg * 0.12));
    t.hp -= chip; t.flash = 2; t.blockFlash = 8;
    t.x -= t.face * (knock ? 7 : 3);
    t.fury = Math.min(100, (t.fury || 0) + dmg * 0.3 * furyMul(t));
    if (t.st) t.st.dmg += chip;
    sfx('block'); spark(t.x + t.face * 10, t.y, 30, false); G.hitstop = Math.max(G.hitstop, 3);
    rumble(t.pIdx, 0.2, 0.45, 70);
    if (Math.random() < 0.35) G.popups.push({ x: t.x, y: t.y - 58, txt: 'BLOK!', t: 0, col: '#80f0ff' });
    return true;
  }
  function hurt(t, dmg, dirX, knock, src, opt) {
    opt = opt || {};
    if (t.kind === 'player' && G.introT > 0) return;
    if (tryBlock(t, dmg, knock, src, opt)) return;
    // parowanie: atak wciśnięty tuż przed ciosem wroga z przodu
    if (t.kind === 'player' && src && src.team !== 'player' && !opt.unblock && t.hp > 0 && G.frame - (t.lastAtkPress || -99) <= 7
      && ['idle', 'walk', 'attack'].includes(t.state) && (Math.sign(src.x - t.x) || 1) === t.face) { parry(t, src); return; }
    // kryza triceratopsa chroni jeźdźca z przodu
    if (t.mount && t.mount.type === 'trike' && src && !opt.unblock && (Math.sign(src.x - t.x) || 1) === t.face) {
      sfx('hit'); sfx('empty'); spark(t.x + t.face * 26, t.y, 30, false); G.hitstop = 3;
      if (Math.random() < 0.4) G.popups.push({ x: t.x, y: t.y - 60, txt: 'KRYZA!', t: 0, col: '#c0d0e0' });
      return;
    }
    // tryb opiekuna: część ciosów blokowana automatycznie
    if (t.kind === 'player' && OPTS.assist && src && src.team !== 'player' && !opt.unblock && ['idle', 'walk'].includes(t.state) && Math.random() < 0.4) {
      sfx('hit'); sfx('empty'); spark(t.x + t.face * 8, t.y, 26, false);
      G.popups.push({ x: t.x, y: t.y - 54, txt: 'BLOK!', t: 0, col: '#80f0ff' });
      return;
    }
    // tarczownik blokuje ciosy z przodu (nie: wybuchy, rzuty, specjały, ataki z góry)
    if (t.def && t.def.shield && !opt.unblock && src && t.hp > 0 && (src.z || 0) < 16 && ['idle', 'walk', 'attack', 'recover'].includes(t.state) && (Math.sign(src.x - t.x) || 1) === t.face) {
      sfx('shieldHit'); spark(t.x + t.face * 10, t.y, 26, false); G.hitstop = 3;
      if (src.kind === 'player') { src.x -= src.face * 5; if (Math.random() < 0.5) G.popups.push({ x: t.x, y: t.y - 54, txt: 'BLOK!', t: 0, col: '#c0d0e0' }); }
      return;
    }
    if (t.perch) { t.perch = false; knock = true; }
    const air = t.state === 'fall' && t.z > 4 && t.team !== 'player';
    if (air) { knock = true; dmg = Math.max(1, Math.round(dmg * 0.75)); }
    t.hp -= dmg; t.flash = 6; t.lastHitWeapon = opt.weapon || null; t.lastThrow = !!opt.throw || t.state === 'thrown';
    if (G.ch && t.kind === 'player' && dmg > 0) G.ch.hurt = true;
    if (src && src.kind === 'player' && t.team !== 'player' && src.state !== 'super') src.fury = Math.min(100, (src.fury || 0) + dmg * 0.9 * furyMul(src));
    if (t.kind === 'player') t.fury = Math.min(100, (t.fury || 0) + dmg * 0.6 * furyMul(t));
    if (src && src.kind === 'player' && dmg > 0 && t.team !== 'player') addCombo(src);
    if (t.kind === 'player' && t.st) t.st.dmg += dmg;
    if (src && src.kind === 'player') {
      addScore(src, dmg * 10);
      G.lastEnemy = t; G.lastEnemyT = 200;
    }
    if (t.kind === 'player') { t.hurtF = G.frame; if (dmg >= 8 && Math.random() < 0.5) shout(t, 'hurt'); else sfx('pHurt'); rumble(t.pIdx, Math.min(1, 0.3 + dmg / 25), 0.5, 120 + dmg * 6); }
    else if (src && src.kind === 'player' && dmg > 0) rumble(src.pIdx, knock ? 0.35 : 0, knock ? 0.5 : 0.28, knock ? 90 : 45);
    else if (t.kind === 'raptor' || t.kind === 'pachy') { if (Math.random() < 0.5) sfx('screech'); }
    else if (t.kind === 'rex') { if (Math.random() < 0.3) sfx('roar'); }
    else if (Math.random() < 0.6) evoice(t, 'hurt');
    if (t.grabbing) { release(t.grabbing); t.grabbing = null; }
    if (t.carry) dropCarry(t);
    if (t.grabbedBy) { t.grabbedBy.grabbing = null; t.grabbedBy = null; }
    if (t.mount && !(t.mount.vehicle && !knock)) { dismount(t, false); knock = true; }
    if (t.hp <= 0 && TAMEABLE.includes(t.kind)) t.tame = true;
    if (t.hp > 0 && t.def && t.def.superArmor && t.state !== 'dazed') return;
    if (t.hp > 0 && t.armor && !opt.force) return;
    if (isBoss(t) && t.hp > 0 && !knock) { setState(t, 'hurt'); t.vx = dirX * 0.4; t.hurtCount++; return; }
    if (t.hp <= 0 || knock || t.hurtCount >= 5) {
      if (t.hp <= 0) onDeath(t, src);
      if (t.weapon && t.kind === 'player') dropWeapon(t);
      setState(t, 'fall'); t.bounced = false;
      t.vx = dirX * (air ? 0.3 : opt.launch ? 0.05 : knock ? 2.3 : 1.6) * (t.kind === 'rex' ? 0.3 : 1); t.vz = t.kind === 'rex' ? 2 : (air ? 3.1 : opt.launch ? 4.6 : 3.6); t.z = Math.max(t.z, 1); t.face = -dirX || t.face; t.hurtCount = 0;
      if (air && src && src.kind === 'player') {
        t.juggle = (t.juggle || 0) + 1; addScore(src, 200 * t.juggle); addCombo(src);
        if (G.ch) G.ch.juggles = (G.ch.juggles || 0) + 1;
        if (t.juggle >= 3) unlock('juggler');
        G.popups.push({ x: t.x, y: t.y - 60 - t.z, txt: 'ŻONGLERKA ×' + t.juggle, t: 0, col: '#ffb040' });
      }
      if (src && src.kind === 'player') t.lastPlayer = src;
      if (ST.deck && t.team !== 'player' && !isBoss(t) && src) t.fvy = (t.y < (ST.deck.y0 + ST.deck.y1) / 2 ? -1 : 1) * (knock ? 0.85 : 0.5);
      if (t.rider) ejectRider(t, src);
    } else {
      setState(t, 'hurt'); t.vx = dirX * 0.9; t.hurtCount++;
    }
  }
  // okrzyki wrogów: każdy typ ma swój głos (profil w audio.js), najwyżej jeden okrzyk na 12 klatek
  const EVOICE_OF = { grunt: 'grunt', bomber: 'grunt', netter: 'grunt', thin: 'thin', glider: 'thin', klamra: 'thin', brute: 'brute', klin: 'brute',
    padliniarz: 'brute', gunner: 'gruff', sniper: 'gruff', shield: 'gruff', flamer: 'masked', boss: 'boss', szpon: 'boss', baron: 'boss', digger: 'boss', zmija: 'hag' };
  function evoice(e, kind, force) {
    if (!e || e.kind === 'player') return;
    const pr = EVOICE_OF[e.type]; if (!pr) { if (kind === 'die') sfx('eDie'); else if (kind === 'hurt') sfx('eHurt'); return; }
    if (!force && G.frame - (G.voiceF || -99) < 12) return;
    G.voiceF = G.frame; sfx('e_' + pr + '_' + kind);
  }
  function onDeath(t, src) {
    if (t.dying) return;
    t.dying = true;
    if (G.ch && t.team !== 'player' && t.lastThrow) G.ch.throws++;
    if (t.kind === 'player') { sfx('ko'); return; }
    if (t.kind === 'raptor' || t.kind === 'pachy') sfx('screech'); else if (t.kind === 'rex') sfx('roar'); else evoice(t, 'die', true);
    if (src && src.kind === 'player') {
      if (src.st) src.st.kills++;
      addScore(src, t.def.score);
      const drop = t.type === 'bomber' && Math.random() < 0.45 ? 'dynamite' : t.type === 'gunner' && Math.random() < 0.35 ? 'grenade' : null;
      if (drop) G.items.push({ type: drop, x: t.x, y: t.y, z: 16, vz: 3, t: 0, ammo: 2 });
      G.popups.push({ x: t.x, y: t.y - 50, txt: '' + t.def.score, t: 0 });
    }
    if (t.type === 'whitefang') unlock('whitefang');
    if (t.kind === 'rex' && t.lastHitWeapon === 'dynamite') unlock('rexdyn');
    if (src && src.kind === 'player' && t.type !== 'dummy') {
      const n = isBoss(t) ? 4 : Math.random() < 0.2 ? 1 : 0;
      for (let i = 0; i < n; i++) G.items.push({ type: 'amber', x: t.x + rnd(-14, 14), y: clamp(t.y + rnd(-6, 6), FLOOR_TOP + 8, FLOOR_BOTTOM), z: 14, vz: 2.5 + i * 0.4, t: 0 });
    }
    if (t.def.drop1up) G.items.push({ type: '1up', x: t.x, y: t.y, z: 18, vz: 3.4, t: 0 });
    if (isBoss(t) && G.wave && G.wave.boss) {
      const others = G.actors.some(a => a !== t && a.alive && isBoss(a) && a.hp > 0) || G.pending.some(p => ENEMIES[p.type].boss);
      if (others) {
        G.actors.forEach(a => { if (a !== t && isBoss(a)) { a.enraged = true; if ((a.type === 'klin' || a.type === 'klamra') && (t.type === 'klin' || t.type === 'klamra')) G.popups.push({ x: a.x, y: a.y - 70, txt: 'BRACIE!!!', t: 0, col: '#ff6040' }); } });
        return;
      }
      G.bossDead = true; G.slowmo = G.rush ? 36 : 100; sfx('ko'); G.shake = 20;
      // odblokowanie bossów jako postaci: pokonani bez utraty życia na tym etapie
      if (app.gameMode !== 'custom' && G.players.every(q => !q.st || q.st.deaths === 0)) {
        if (t.type === 'padliniarz') unlockHero('padlin', 'PADLINIARZ');
        if (t.type === 'zmija') unlockHero('zmijka', 'ŻMIJA');
      }
      AU.stopMusic(1.5);
      G.pending.length = 0; G.shots.length = 0;
      G.actors.forEach(a => { if (a !== t && a.team !== 'player' && a.alive && a.hp > 0) { a.hp = 0; onDeath(a); setState(a, 'fall'); a.vz = 3; a.vx = a.x < t.x ? -2 : 2; } });
    }
  }
  // ---- OSIĄGNIĘCIA
  const ACH = [
    ['nodmg', 'BEZ ZADRAPANIA', 'UKOŃCZ ETAP BEZ OTRZYMANIA OBRAŻEŃ'],
    ['rexdyn', 'DYNAMITOWY ŁOWCA', 'POKONAJ STAREGO KŁA DYNAMITEM'],
    ['cleanroad', 'CZYSTY LAKIER', 'PRZEJEDŹ AUTOSTRADĘ BEZ ZADRAPANIA'],
    ['cages', 'OPIEKUN STADA', 'UWOLNIJ WSZYSTKIE DINOZAURY Z ZAGRODY'],
    ['combo20', 'MISTRZ KOMBO', 'ZRÓB KOMBO NA 20 TRAFIEŃ'],
    ['rider', 'JEŹDZIEC', 'DOSIĄDŹ DINOZAURA'],
    ['whitefang', 'BIAŁA LEGENDA', 'POKONAJ BIAŁEGO KŁA'],
    ['secret', 'POSZUKIWACZ', 'ODKRYJ SEKRET ZA ŚCIANĄ'],
    ['rankS', 'PERFEKCJA', 'ZDOBĄDŹ OCENĘ S'],
    ['suplex', 'ZAPAŚNIK', 'WYKONAJ SUPLEX'],
    ['airthrow', 'PODNIEBNY RZUT', 'WYKONAJ RZUT W LOCIE'],
    ['chain', 'REAKCJA ŁAŃCUCHOWA', 'WYSADŹ NARAZ DWIE BECZKI PALIWA'],
    ['coop', 'RAZEM RAŹNIEJ', 'UKOŃCZ ETAP WE DWÓCH'],
    ['allchars', 'CZWÓRKA WSPANIAŁYCH', 'UKOŃCZ ETAP KAŻDĄ Z CZTERECH POSTACI'],
    ['beatgame', 'WYZWOLICIEL', 'UKOŃCZ GRĘ'],
    ['arcade', 'LEGENDA AUTOMATÓW', 'UKOŃCZ GRĘ NA POZIOMIE ARCADE'],
    ['rush', 'POGROMCA BOSSÓW', 'UKOŃCZ BOSS RUSH'],
    ['surv10', 'NIEZŁOMNY', 'PRZETRWAJ 10 FAL'],
    ['ngplus', 'DRUGI ROZDZIAŁ', 'UKOŃCZ NOWĄ GRĘ+'],
    ['baronplay', 'ZMIANA STRON', 'ZAGRAJ BARONEM BURSZTYNEM'],
    ['teamwork', 'ZGRANA DRUŻYNA', 'WYKONAJ ATAK DRUŻYNOWY W CO-OPIE'],
    ['juggler', 'ŻONGLER', 'PODBIJ WROGA W POWIETRZU 3 RAZY'],
    ['flyer', 'PODNIEBNY BOMBARDIER', 'ZATOP 12 ŁODZI W LOCIE NAD ZATOKĄ'],
    ['chalall', 'MISTRZ WYZWAŃ', 'ZDOBĄDŹ 3 GWIAZDKI W KAŻDYM WYZWANIU'],
    ['daily', 'CODZIENNY BYWALEC', 'UKOŃCZ CODZIENNE WYZWANIE'],
    ['trueend', 'PRAWDZIWE ZAKOŃCZENIE', 'POKONAJ BURSZTYNOWEGO KOLOSA'],
    ['beachclean', 'SPRZĄTACZ PLAŻY', 'ROZBIJ WSZYSTKIE BECZKI I SKRZYNIE NA OPUSZCZONEJ PLAŻY'],
    ['ratcatcher', 'SZCZUROŁAP', 'ZŁAP 10 SZCZURÓW W KANAŁACH OTCHŁANI'],
    ['abovewave', 'PONAD FALĄ', 'PRZECZEKAJ 3 FALE ŚCIEKÓW BEZ ZALANIA'],
    ['ringout', 'SPŁUKANY!', 'WRZUĆ WROGA W LAWĘ, ŚCIEKI, MORZE ALBO ZRZUĆ GO Z POCIĄGU'],
    ['bowling', 'KRĘGLE', 'PRZEWRÓĆ RZUCONĄ BECZKĄ TRZECH WROGÓW NARAZ'],
    ['scrapper', 'ZŁOMIARZ', 'ZEZŁOMUJ KOPARKĘ BRYGADZISTY']
  ];
  app.ach = loadJSON('paleo_ach') || {};
  app.unlocks = loadJSON('paleo_unlocks') || {};
  app.cleared = loadJSON('paleo_cleared') || {};
  app.toasts = [];
  function unlockHero(key, name) {
    if (app.unlocks[key]) return;
    app.unlocks[key] = true; safeSet('paleo_unlocks', JSON.stringify(app.unlocks));
    app.toasts.push({ head: 'NOWA POSTAĆ DO WYBORU!', name, t: 0, col: '#7cff7c' });
  }
  function unlock(id) {
    if (app.ach[id] || app.demo || (app.gameMode === 'custom' && G && ST && ST.custom)) return;   // własne etapy nie dają osiągnięć
    app.ach[id] = Date.now(); safeSet('paleo_ach', JSON.stringify(app.ach));
    const a = ACH.find(x => x[0] === id); if (a) app.toasts.push({ name: a[1], t: 0 });
    sfx('oneup');
  }
  function markCleared(key) {
    app.cleared[key] = 1; safeSet('paleo_cleared', JSON.stringify(app.cleared));
    if (CHAR_KEYS.every(k => app.cleared[k])) unlock('allchars');
  }
  function drawToasts() {
    const tt = app.toasts[0]; if (!tt) return;
    tt.t++;
    const a = tt.t < 15 ? tt.t / 15 : tt.t > 165 ? (180 - tt.t) / 15 : 1, y = -30 + 40 * a;
    sctx.fillStyle = 'rgba(20,12,16,0.88)'; sctx.fillRect((W / 2 - 110) * S, y * S, 220 * S, 24 * S);
    sctx.fillStyle = '#d0a040'; sctx.fillRect((W / 2 - 110) * S, (y + 23) * S, 220 * S, S);
    text(tt.head || 'OSIĄGNIĘCIE ODBLOKOWANE!', W / 2, y + 3, 4, tt.col || '#ffe080', 'center');
    text(tt.name, W / 2, y + 11, 7, '#fff', 'center');
    if (tt.t >= 180) app.toasts.shift();
  }

  // ---- OPIEKUN: podpowiedzi przy pierwszym spotkaniu
  const HINTS = {
    grunt: 'SZAKAL: ZWYKŁY KŁUSOWNIK — PEŁNE KOMBO GO POWALI', thin: 'ĆWIEK: DOSKAKUJE Z KOPNIĘCIEM — ODSKOCZ I KONTRUJ',
    brute: 'GŁAZ: SZARŻUJE BRZUCHEM — ZEJDŹ Z JEGO LINII', bomber: 'MIOTACZ: UCIEKAJ OD ŻARZĄCEGO SIĘ LONTU',
    gunner: 'STRZELEC: CZERWONY LASER = STRZAŁ, PRZESKOCZ KULĘ', shield: 'TARCZOWNIK: ZAJDŹ GO OD TYŁU, CHWYĆ LUB KOPNIJ Z WYSKOKU',
    sniper: 'SNAJPER: UCIEKAJ Z CELOWNIKA, ZDEJMIJ GO Z WYSKOKU', netter: 'SIECIARZ: W SIECI WCISKAJ SZYBKO PRZYCISKI',
    raptor: 'RAPTOR: POKONANY POZWOLI SIĘ DOSIĄŚĆ (ATAK)',
    rraptor: 'JEŹDZIEC: PRZEWRÓĆ GO, A RAPTOR ZOSTANIE TWÓJ', flamer: 'PODPALACZ: NIE STÓJ W OGNIU — ATAKUJ Z BOKU',
    glider: 'LOTNIARZ: UCIEKAJ SPOD CIENIA SIECI, STRĄĆ GO Z WYSKOKU', pachy: 'PACHY: SZARŻUJE GŁOWĄ — USUŃ SIĘ Z DROGI',
    ptera: 'PTERANODON: PATRZ NA CIEŃ KAMIENIA, TRAF GO Z WYSKOKU', trike: 'TRICERATOPS: TWARDY — UŻYJ BOMBY ALBO SPECJAŁU',
    para: 'PARAZAUROLOF: JEGO RYK OGŁUSZA — PODSKOCZ!', whitefang: 'BIAŁY KIEŁ: BARDZO SZYBKI — UŻYJ FURII',
    boss: 'BOSS: PAROWANIE (ATAK TUŻ PRZED CIOSEM) GO OGŁUSZA', zmija: 'ŻMIJA: BICZ MA DŁUGI ZASIĘG — WALCZ Z BLISKA',
    klin: 'BRACIA TRZASK: ROZDZIEL ICH, ZAJMIJ SIĘ NAJPIERW KLAMRĄ', rex: 'STARY KIEŁ: PO UDERZENIU W ŚCIANĘ JEST OGŁUSZONY',
    szpon: 'ADMIRAŁ SZPON: CZERWONY LASER = HARPUN, ZMIEŃ LINIĘ', baron: 'BARON: PO TELEPORCIE STOI ZA TOBĄ — ODWRÓĆ SIĘ'
  };
  app.hinted = {};

  // ---- FURIA, PAROWANIE, ULEPSZENIA
  const furyMul = p => 1 + 0.25 * ((p.up && p.up.fury) || 0);
  function applyUps(p) { p.maxHp = Math.round(p.def.hp * (1 + 0.1 * ((p.up && p.up.hp) || 0))); }
  function parry(p, src) {
    p.invuln = Math.max(p.invuln, 24); p.fury = Math.min(100, (p.fury || 0) + 20 * furyMul(p)); addScore(p, 300);
    G.hitstop = 12; sfx('zap'); sfx('heavy');
    G.fx.push({ type: 'spark', x: (p.x + src.x) / 2, y: p.y, z: 30, t: 0, life: 18, big: true });
    G.popups.push({ x: p.x, y: p.y - 64, txt: 'PAROWANIE!', t: 0, col: '#80f0ff' });
    if (src.kind === 'rex') setState(src, 'dazed');
    else if (isBoss(src)) { setState(src, 'hurt'); src.cool = Math.max(src.cool || 0, 50); }
    else if (src.kind === 'human') setState(src, 'stun');
    else { setState(src, 'hurt'); src.vx = -Math.sign(p.x - src.x) * 1.5; }
  }
  const SUPER_NAMES = { kruk: 'BURZA KLUCZY', nina: 'TANIEC CIENI', tur: 'FALA SEJSMICZNA', borys: 'GRAD LASKI', bursztyn: 'BURSZTYNOWA BURZA', padlin: 'KOTWICA ZAGŁADY', zmijka: 'TANIEC BICZA' };
  function launchMate(p, q) {
    setState(p, 'teamthrow');
    setState(q, 'teamfly'); q.face = p.face; q.vx = p.face * 5.2; q.vz = 3.6; q.z = 8; q.invuln = Math.max(q.invuln, 40); q.hitSet = new Set();
    sfx('throw'); shout(q, 'special');
    G.popups.push({ x: (p.x + q.x) / 2, y: p.y - 66, txt: 'WYRZUT DRUŻYNOWY!', t: 0, col: '#7cff7c' });
    unlock('teamwork');
  }
  function doubleThrow(p, e) {
    const q = e.grabbedBy;
    q.grabbing = null; e.grabbedBy = null;
    setState(q, 'teamthrow'); setState(p, 'teamthrow'); p.face = Math.sign(e.x - p.x) || p.face;
    hurt(e, 28, p.face, true, p, { unblock: true, force: true });
    if (e.state === 'fall') { e.vz = 4.8; e.vx = p.face * 2.6; }
    addScore(p, 1000); addScore(q, 1000); G.shake = 10; G.hitstop = 8; sfx('slam');
    G.popups.push({ x: e.x, y: e.y - 70, txt: 'PODWÓJNY RZUT!', t: 0, col: '#7cff7c' });
    unlock('teamwork');
  }
  // wspólny super: gdy obaj gracze mają pełną furię i stoją blisko — po obu super-ruchach wybuch na cały ekran
  function teamBlast() {
    const w = G.superWho;
    G.superWho2 = null;
    G.flash = 14; G.shake = 22; sfx('thunder'); sfx('explode');
    G.fx.push({ type: 'shock', x: G.camX + W / 2, y: 190, z: 0, t: 0, life: 30, r: 200 });
    for (const e of foes()) {
      if (!e.alive || e.hp <= 0 || e.x < G.camX - 20 || e.x > G.camX + W + 20) continue;
      hurt(e, isBoss(e) ? 40 : 45, e.x >= (w ? w.x : e.x) ? 1 : -1, true, w, { unblock: true, force: true });
    }
    G.popups.push({ x: G.camX + W / 2, y: 80, txt: 'SUPER DRUŻYNOWY!', t: 0, col: '#ffe040' });
  }
  function startSuper(p) {
    p.fury = 0; setState(p, 'super'); p.invuln = Math.max(p.invuln, 30); p.superTargets = null; p.slammed = false;
    G.superFreeze = 50; G.superWho = p; sfx('zap'); sfx('start'); shout(p, 'super'); rumble(p.pIdx, 0.5, 0.8, 450);
    const q = G.players.find(o => o !== p && o.alive && o.fury >= 100 && Math.abs(o.x - p.x) < 160 && ['idle', 'walk', 'block', 'attack'].includes(o.state));
    if (q) {
      q.fury = 0; setState(q, 'super'); q.invuln = Math.max(q.invuln, 30); q.superTargets = null; q.slammed = false;
      G.superWho2 = q; G.teamSuperT = 70; G.superFreeze = 64; shout(q, 'super'); rumble(q.pIdx, 0.5, 0.8, 450);
      unlock('teamwork');
    }
  }
  function updateSuper(p) {
    p.invuln = Math.max(p.invuln, 2);
    const pw = p.def.power || 1;
    switch (p.key) {
      case 'kruk':
        if (p.t % 6 === 0 && p.t <= 48) { shoot({ type: 'wrench', owner: p, x: p.x + p.face * 14, y: clamp(p.y + rnd(-18, 18), FLOOR_TOP + 6, FLOOR_BOTTOM), z: 26, vx: p.face * 5.2, dmg: Math.round(16 * pw), knock: true, life: 140 }); sfx('throw'); }
        if (p.t > 56) setState(p, 'idle');
        return;
      case 'nina': {
        if (!p.superTargets) p.superTargets = G.actors.filter(t => hostile(p, t) && hittable(t) && t.x > G.camX - 10 && t.x < G.camX + W + 10).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x)).slice(0, 6);
        if (p.t % 12 === 1) {
          const tgt = p.superTargets.shift();
          if (!tgt) { setState(p, 'idle'); return; }
          G.fx.push({ type: 'ghost', x: p.x, y: p.y, z: p.z, t: 0, life: 24, face: p.face, b: p.b });
          const side = tgt.x > p.x ? -1 : 1; p.x = clamp(tgt.x + side * 22, G.camX + 10, G.camX + W - 10); p.y = tgt.y; p.face = tgt.x > p.x ? 1 : -1; sfx('warp');
          if (hittable(tgt)) { hurt(tgt, Math.round(18 * pw), p.face, true, p, { unblock: true }); spark(tgt.x, tgt.y, hitY(tgt), true); sfx('heavy'); G.hitstop = 3; }
        }
        if (p.t > 80) setState(p, 'idle');
        return;
      }
      case 'tur':
        if (p.t === 1) { p.vz = 6; sfx('jump'); }
        if (p.t > 1 && !p.slammed) { p.vz -= GRAV; p.z = Math.max(0, p.z + p.vz); }
        if (p.t > 4 && p.z <= 0 && !p.slammed) {
          p.slammed = true; sfx('slam'); sfx('explode'); G.shake = 30; G.flash = 8;
          G.fx.push({ type: 'shock', x: p.x, y: p.y, z: 0, t: 0, life: 40, r: 260 });
          for (let i = 0; i < 12; i++) dust(G.camX + rnd(0, W), rnd(FLOOR_TOP + 8, FLOOR_BOTTOM));
          for (const t of G.actors) if (hostile(p, t) && hittable(t) && t.z < 12 && t.x > G.camX - 20 && t.x < G.camX + W + 20) hurt(t, Math.round(30 * pw), t.x >= p.x ? 1 : -1, true, p, { unblock: true });
        }
        if (p.slammed && p.t > 40) { p.slammed = false; setState(p, 'idle'); }
        return;
      case 'bursztyn':
        if (p.t % 14 === 1 && p.t < 50) {
          [-16, 0, 16].forEach(o => shoot({ type: 'wave', owner: p, x: p.x + p.face * 18, y: clamp(p.y + o, FLOOR_TOP + 6, FLOOR_BOTTOM), z: 0, vx: p.face * 4.2, dmg: Math.round(16 * pw), knock: true, life: 160 }));
          sfx('energy'); G.shake = 5;
        }
        if (p.t > 60) setState(p, 'idle');
        return;
      default:
        if (p.t % 5 === 1 && p.t < 56) { p.hitSet = null; sfx('whoosh'); resolveHits(p, { reach: 56, dmg: 6, knock: false, snd: 'hit', height: 50 }, true); }
        if (p.t === 60) { p.hitSet = null; G.shake = 10; resolveHits(p, { reach: 64, dmg: 22, knock: true, snd: 'heavy', height: 50 }, true); }
        if (p.t > 70) setState(p, 'idle');
    }
  }

  // ---- licznik kombo: seria trafień bez przerwy dłuższej niż ~1,6 s
  function addCombo(p) {
    p.combo = (p.comboT > 0 ? p.combo : 0) + 1; p.comboT = 100 + 30 * ((p.up && p.up.combo) || 0); p.comboPulse = 10;
    if (p.st) p.st.maxCombo = Math.max(p.st.maxCombo, p.combo);
    if (p.combo >= 20) unlock('combo20');
  }
  function finishCombo(p) {
    if (p.combo >= 5) {
      const bonus = Math.min(20000, p.combo * p.combo * 10);
      addScore(p, bonus); sfx('coin');
      G.popups.push({ x: p.x, y: p.y - 72, txt: 'KOMBO ' + p.combo + '! +' + bonus, t: 0, col: '#ffe040' });
    }
    p.combo = 0;
  }
  const RANK_BONUS = { S: 20000, A: 10000, B: 5000, C: 2000, D: 0 };
  const RANK_COLS = { S: '#ffe040', A: '#7cff7c', B: '#80d0ff', C: '#e0a060', D: '#ff6060' };
  function rankOf(st, secs) {
    const v = 100 - Math.min(40, st.dmg / 4) - st.deaths * 15 - Math.min(25, Math.max(0, (secs - 150) / 4)) + Math.min(15, st.maxCombo);
    return v >= 90 ? 'S' : v >= 75 ? 'A' : v >= 60 ? 'B' : v >= 45 ? 'C' : 'D';
  }
  function addScore(p, n) {
    p.score += n;
    const next = (p.nextLife || 30000);
    if (p.score >= next) { p.nextLife = next + 50000; p.lives++; sfx('oneup'); G.popups.push({ x: p.x, y: p.y - 60, txt: '1UP!', t: 0, col: '#7cff7c' }); }
  }
  function release(v) { if (!v) return; v.grabbedBy = null; if (v.state === 'grabbed') { setState(v, 'hurt'); v.vx = 0; } }
  function dropWeapon(p) {
    if (!p.weapon) return;
    if (MELEE[p.weapon] || p.ammo > 0) G.items.push({ type: p.weapon, x: p.x, y: p.y, z: 20, vz: 3, t: 0, ammo: p.ammo, dur: p.dur });
    p.weapon = null;
  }

  function spark(x, y, z, big) { G.fx.push({ type: 'spark', x, y, z, t: 0, life: big ? 14 : 10, big }); }
  // odłamki szkła po rozbitej butelce
  function glass(x, y, z) { for (let i = 0; i < 7; i++) G.fx.push({ type: 'debris', x, y, z: z || 20, vx: rnd(-1.6, 1.6), vz: rnd(1, 3), t: 0, life: 40, col: i % 2 ? '#7ad08a' : '#c8f0d0' }); }
  function dust(x, y) { G.fx.push({ type: 'dust', x, y, z: 0, t: 0, life: 22 }); }

  // Sprawdź trafienia ruchu `m` atakującego `a`. around = trafia w obie strony.
  function resolveHits(a, m, around) {
    if (!a.hitSet) a.hitSet = new Set();
    const hs = a.hitSet;   // trafienie może zmienić stan atakującego (parowanie) i wyzerować a.hitSet
    let hits = 0;
    const power = (a.def && a.def.power) || 1;
    const mul = a.team === 'player' ? power : (a.dmgMul || 1);
    for (const t of G.actors) {
      if (hs.has(t) || !hostile(a, t) || !hittable(t)) continue;
      const dx = (t.x - a.x) * a.face;
      const reach = (m.abs ? m.reach : m.reach * scaleOf(a)) + t.rad + (t.state === 'fall' && t.z > 4 ? 10 : 0);
      if (around ? Math.abs(dx) > reach : (dx < -6 - t.rad * 0.5 || dx > reach)) continue;
      if (Math.abs(t.y - a.y) > (m.depth || 10) + (t.depthR || 0)) continue;
      if (Math.abs(t.z - a.z) > (m.height || (t.state === 'fall' ? 52 : 24))) continue;   // wróg w locie: łatwiej go dosięgnąć
      hs.add(t); hits++;
      const dir = around ? (t.x >= a.x ? 1 : -1) : a.face;
      hurt(t, Math.round(m.dmg * mul), dir, m.knock, a, { launch: m.launch, unblock: m.unblock || !!a.mount || ['special', 'cmd', 'dash', 'jump', 'super'].includes(a.state) });
      spark(t.x - dir * 4, t.y, t.z + hitY(t), m.knock);
      sfx(m.snd || 'hit');
      G.hitstop = m.knock ? 6 : 4;
      if (m.shake) G.shake = Math.max(G.shake, m.shake);
    }
    if (a.kind === 'player') {
      for (const pr of G.props) {
        if (pr.hp <= 0 || hs.has(pr)) continue;
        const dx = (pr.x - a.x) * a.face;
        if ((around ? Math.abs(dx) : dx) > m.reach + (pr.kind === 'wall' ? 22 : 10) || (!around && dx < -6) || Math.abs(pr.y - a.y) > (pr.kind === 'wall' ? 16 : 12)) continue;
        hs.add(pr); hits++;
        hitProp(pr, a.face, a);
      }
    }
    return hits;
  }
  const PROP_HP = { pen: 4, wall: 6, fuel: 1 };
  const PROP_COL = { crate: '#9b6a34', wall: '#8a7a68', pen: '#c8a050', fuel: '#b02a20' };
  function hitProp(pr, dir, by) {
    pr.hp--; pr.shake = 8;
    sfx(pr.hp <= 0 ? 'crash' : 'hit');
    spark(pr.x, pr.y, pr.kind === 'wall' ? 26 : 14, false);
    if (pr.hp > 0) return;
    for (let i = 0; i < (pr.kind === 'wall' ? 18 : 10); i++) G.fx.push({ type: 'debris', x: pr.x + rnd(-8, 8), y: pr.y, z: rnd(4, 24), vx: rnd(-2, 2) + dir, vz: rnd(1, 4), t: 0, life: 50, col: PROP_COL[pr.kind] || '#8a5a2b' });
    const owner = by && by.kind === 'player' ? by : null;
    if (pr.kind === 'fuel') {
      if (G.fuelFrame === G.frame) { if (++G.fuelChain >= 2) unlock('chain'); } else { G.fuelFrame = G.frame; G.fuelChain = 1; }
      explode(pr.x, pr.y, owner, { r: 46, dmg: 24 });
    }
    if (pr.kind === 'pen') freeDino(pr, owner);
    if (pr.kind === 'wall') openSecret(pr, owner);
    if (pr.drop) G.items.push({ type: pr.drop, x: pr.x, y: pr.y, z: 12, vz: 2.5, t: 0, ammo: pr.drop === 'bottle' ? 2 : pr.drop === 'rifle' ? 8 : 3, dur: 16 });
    // Sprzątacz plaży: wszystkie beczki i skrzynie na Opuszczonej Plaży
    if (G.stageIdx === 5 && !G.special && !ST.custom && G.props.every(q => q.kind === 'wall' || q.hp <= 0) && !G.beachClean) {
      G.beachClean = true; unlock('beachclean'); G.popups.push({ x: pr.x, y: pr.y - 70, txt: 'PLAŻA POSPRZĄTANA!', t: 0, col: '#7cff7c' });
    }
  }
  function freeDino(pr, by) {
    G.freed = (G.freed || 0) + 1;
    G.fx.push({ type: 'baby', x: pr.x, y: pr.y, z: 0, t: 0, life: 150, dir: pr.x - G.camX < W / 2 ? -1 : 1 });
    sfx('screech'); sfx('coin');
    if (by) addScore(by, 1000);
    G.popups.push({ x: pr.x, y: pr.y - 40, txt: 'UWOLNIONY! ' + G.freed + '/' + (G.cageTotal || 10), t: 0, col: '#7cff7c' });
  }
  function openSecret(pr, by) {
    G.shake = 10; sfx('slam'); unlock('secret');
    if (app.run) app.run.secrets = (app.run.secrets || 0) + 1;
    if (pr.secret === 'boss') {
      G.popups.push({ x: pr.x, y: pr.y - 60, txt: 'UKRYTY PRZECIWNIK!', t: 0, col: '#ff6040' });
      const e = makeEnemy('whitefang', pr.x, pr.y + 6);
      e.face = -1; setState(e, 'roar'); sfx('screech'); G.actors.push(e);
    } else {
      G.popups.push({ x: pr.x, y: pr.y - 60, txt: 'SEKRET!', t: 0, col: '#ffe080' });
      for (let i = 0; i < 3; i++) G.items.push({ type: 'gem', x: pr.x - 16 + i * 16, y: pr.y + 8, z: 14, vz: 2 + i * 0.4, t: 0 });
      G.items.push({ type: 'meat', x: pr.x, y: pr.y + 18, z: 14, vz: 3, t: 0 });
      if (pr.secret === 'treasure1up') G.items.push({ type: '1up', x: pr.x + 20, y: pr.y + 16, z: 18, vz: 3.4, t: 0 });
      if (by) addScore(by, 1500);
    }
  }

  // =============================================================== POCISKI
  function shoot(o) { G.shots.push(Object.assign({ t: 0, vy: 0, vz: 0, z: 0, life: 240, dmg: 10, knock: true }, o)); }
  // owner = gracz → rani tylko wrogów (także bossów); inaczej rani wszystkich poza bossami
  function explode(x, y, owner, opt) {
    opt = opt || {};
    const R = opt.r || 38, dmg = opt.dmg || 14;
    sfx('explode'); G.shake = 12;
    G.players.forEach(q => { const d = Math.abs(q.x - x); if (d < 260) rumble(q.pIdx, 0.9 - d / 400, 0.7, 260); });
    G.fx.push({ type: 'boom', x, y, z: 0, t: 0, life: 24 });
    G.fx.push({ type: 'shock', x, y, z: 0, t: 0, life: 20, r: R + 6 });
    for (let i = 0; i < 4; i++) dust(x + rnd(-16, 16), y + rnd(-4, 4));
    for (const t of G.actors) {
      if (!hittable(t) || t.z > 24) continue;
      if (owner ? !hostile(owner, t) : isBoss(t)) continue;
      if (Math.abs(t.x - x) < R + (t.rad || 0) * 0.5 && Math.abs(t.y - y) < 16 + (t.depthR || 0)) {
        hurt(t, owner ? Math.round(dmg * ((owner.def && owner.def.power) || 1) * (1 + 0.25 * ((owner.up && owner.up.bomb) || 0))) : Math.round(dmg * diffNow().dmg), t.x >= x ? 1 : -1, true, owner || null, { unblock: true, weapon: opt.weapon });
        spark(t.x, t.y, hitY(t), true);
      }
    }
    for (const pr of G.props) if (pr.hp > 0 && Math.abs(pr.x - x) < R && Math.abs(pr.y - y) < 16) { pr.hp = Math.min(pr.hp, pr.kind === 'wall' ? 3 : 1); hitProp(pr, pr.x >= x ? 1 : -1, owner); }
  }
  function updateShots() {
    for (let i = G.shots.length - 1; i >= 0; i--) {
      const s = G.shots[i]; s.t++;
      if (s.type === 'prop') {
        if (updateFlyingProp(s)) { breakCarried(s, s.x, s.y, s.owner); G.shots.splice(i, 1); }
        continue;
      }
      if (s.type === 'netdrop') {
        s.vz -= GRAV * 0.4; s.z += s.vz;
        if (s.z <= 0) {
          const t = G.players.find(q => hittable(q) && q.z < 12 && q.state !== 'netted' && Math.abs(q.x - s.x) < 18 && Math.abs(q.y - s.y) < 10);
          if (t) netPlayer(t); else dust(s.x, s.y);
          G.shots.splice(i, 1);
        }
        continue;
      }
      // bomba gracza trafiająca w locie wroga spada mu pod nogi
      if (s.owner && !s.landed && s.vx && (s.type === 'dynamite' || s.type === 'grenade')) {
        for (const t of G.actors) {
          if (!hostile(s.owner, t) || !hittable(t)) continue;
          if (Math.abs(t.x - s.x) < 10 + t.rad * 0.5 && Math.abs(t.y - s.y) < 10 + (t.depthR || 0) && s.z < 44 * scaleOf(t)) {
            s.vx = -s.vx * 0.15; s.vz = Math.min(s.vz, 0); sfx('hit'); break;
          }
        }
      }
      if (s.type === 'dynamite') {
        if (!s.landed) {
          if (s.z > 0) s.vx += G.wind || 0;   // wiatr znosi lecące bomby
          s.x += s.vx; s.y = clamp(s.y + s.vy, FLOOR_TOP + 6, FLOOR_BOTTOM); s.vz -= GRAV; s.z += s.vz;
          if (s.z <= 0) { s.z = 0; s.landed = true; s.fuse = s.owner ? 34 : 42; sfx('fuse'); }
        } else if (--s.fuse <= 0) { explode(s.x, s.y, s.owner, s.owner ? { r: 44, dmg: 26, weapon: 'dynamite' } : null); G.shots.splice(i, 1); }
        continue;
      }
      if (s.type === 'grenade') {
        if (s.z > 0) s.vx += G.wind || 0;
        s.x += s.vx; s.y = clamp(s.y + s.vy, FLOOR_TOP + 6, FLOOR_BOTTOM); s.vz -= GRAV; s.z += s.vz;
        if (s.z <= 0) {
          s.z = 0;
          if (s.vz < -1.2) { s.vz *= -0.45; s.vx *= 0.6; s.vy *= 0.6; sfx('land'); } else { s.vz = 0; s.vx *= 0.85; s.vy *= 0.85; s.landed = true; }
        }
        if (--s.fuse <= 0) { explode(s.x, s.y, s.owner, { r: 36, dmg: 20, weapon: 'grenade' }); G.shots.splice(i, 1); }
        continue;
      }
      if (s.type === 'snipe') {
        const f = s.from;
        if (!f || !f.alive || !f.perch || f.hp <= 0) { G.shots.splice(i, 1); continue; }
        if (--s.fuse <= 0) {
          sfx('gun'); G.fx.push({ type: 'muzzle', x: f.x + f.face * 20, y: f.y, z: f.z + 24, t: 0, life: 5 });
          spark(s.x, s.y, 4, true); dust(s.x, s.y);
          for (const t of G.actors) if (t.team === 'player' && hittable(t) && t.z < 20 && Math.abs(t.x - s.x) < 13 && Math.abs(t.y - s.y) < 9) hurt(t, Math.round(14 * (f.dmgMul || 1)), t.x >= f.x ? 1 : -1, true, null);
          G.shots.splice(i, 1);
        }
        continue;
      }
      if (s.type === 'rock') {
        s.vz -= GRAV; s.z += s.vz;
        if (s.z <= 0) {
          sfx('crash'); G.shake = 4; dust(s.x, s.y);
          for (let k = 0; k < 6; k++) G.fx.push({ type: 'debris', x: s.x, y: s.y, z: 4, vx: rnd(-2, 2), vz: rnd(1, 3), t: 0, life: 40, col: '#8a8478' });
          for (const t of G.actors) if (hittable(t) && !isBoss(t) && t.kind !== 'ptera' && t.z < 20 && Math.abs(t.x - s.x) < 14 + t.rad * 0.5 && Math.abs(t.y - s.y) < 10) hurt(t, 10, t.x >= s.x ? 1 : -1, true, null, { unblock: true });
          G.shots.splice(i, 1);
        }
        continue;
      }
      if (s.type === 'bottle') s.vx += (G.wind || 0) * 0.6;
      s.x += s.vx;
      if (s.x < G.camX - 40 || s.x > G.camX + W + 40 || s.t > s.life) { if (s.type === 'bottle') glass(s.x, s.y, s.z); G.shots.splice(i, 1); continue; }
      if (s.owner) {
        let hitAny = false;
        for (const t of G.actors) {
          if (!hostile(s.owner, t) || !hittable(t)) continue;
          if (Math.abs(t.x - s.x) > 10 + t.rad * 0.5 || Math.abs(t.y - s.y) > 10 + (t.depthR || 0) || t.z > 30) continue;
          hurt(t, s.dmg, Math.sign(s.vx) || 1, s.knock, s.owner); spark(t.x, t.y, hitY(t), true); sfx(s.type === 'bottle' ? 'crash' : 'hit'); if (s.type === 'bottle') glass(s.x, t.y, hitY(t)); G.hitstop = 4; hitAny = true; break;
        }
        if (hitAny) G.shots.splice(i, 1);
        continue;
      }
      for (const t of G.actors) {
        if (t.team !== 'player' || !hittable(t)) continue;
        if (Math.abs(t.x - s.x) > 10 || Math.abs(t.y - s.y) > 8) continue;
        if (s.type === 'wave' ? t.z > 8 : Math.abs(t.z + 22 * scaleOf(t) - s.z) > 16) continue;
        // pocisk z przodu zatrzymany gardą
        if (tryBlock(t, s.dmg || 6, s.knock, { x: s.x - (s.vx || 0) * 20, team: 'enemy', proj: true }, {})) { G.shots.splice(i, 1); break; }
        if (s.type === 'net') { netPlayer(t); G.shots.splice(i, 1); break; }
        hurt(t, s.dmg, Math.sign(s.vx) || 1, s.knock, null);
        spark(s.x, t.y, s.z || 20, s.knock); sfx('hit'); G.hitstop = 4;
        if (!s.pierce) { G.shots.splice(i, 1); break; }
      }
    }
  }

  function netPlayer(t) {
    if (t.mount) dismount(t, false);
    if (t.carry) dropCarry(t);
    if (t.grabbing) { release(t.grabbing); t.grabbing = null; }
    setState(t, 'netted'); t.netT = 130; t.vx = 0; sfx('grab');
    G.popups.push({ x: t.x, y: t.y - 60, txt: 'SIEĆ! WCISKAJ PRZYCISKI', t: 0, col: '#ffe080' });
  }

  // =============================================================== GRACZ
  function updatePlayer(p) {
    const held = inp[p.pIdx].held, pressed = inp[p.pIdx].pressed;
    const dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    const dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
    const d = p.def;
    p.t++;
    // wykrywanie ↓ ↘ → (względem kierunku patrzenia)
    if (dy > 0 && dx === 0) p.qcfD = G.frame;
    if (dx === p.face && dy <= 0 && G.frame - (p.qcfD || -99) < 16) p.qcfReady = G.frame;
    if (p.cmdCool > 0) p.cmdCool--;
    if (pressed.attack) p.lastAtkPress = G.frame;
    if (p.state !== 'block') p.guard = Math.min(100, (p.guard === undefined ? 100 : p.guard) + 0.45);
    if (p.blockFlash > 0) p.blockFlash--;
    if (p.mount && ['idle', 'walk', 'rideAtk', 'rideJump'].includes(p.state)) { updateRider(p, held, pressed, dx, dy); return; }
    if (p.carry && !['lift', 'carry', 'heave'].includes(p.state)) dropCarry(p);
    if (updateCarry(p, held, pressed, dx, dy)) return;
    switch (p.state) {
      case 'enter':
        p.vx = d.speed; p.x += p.vx; p.animT++;
        if (p.x >= ST.startX) setState(p, 'idle');
        return;
      case 'block':
        // garda: stoi w miejscu, może się obrócić; puszczenie bloku albo skok kończy gardę
        p.vx = 0; p.animT++;
        if (pressed.block) p.blockStart = G.frame;
        if (dx) p.face = dx;
        if (!held.block) { setState(p, 'idle'); return; }
        if (pressed.special && p.fury >= 100) { startSuper(p); return; }
        if (pressed.jump && !held.attack) { setState(p, 'jump'); p.vz = 5.4; p.vx = dx * d.speed * 1.1; p.vy = dy * d.speed * 0.5; p.jumpAtk = false; sfx('jump'); return; }
        return;
      case 'idle': case 'walk': {
        if (dx && pressed[dx > 0 ? 'right' : 'left']) {
          if (p.tapDir === dx && G.frame - p.tapT < 14) p.running = true;
          p.tapDir = dx; p.tapT = G.frame;
        }
        if (!dx || dx !== p.tapDir) p.running = false;
        if (held.block) { setState(p, 'block'); p.vx = 0; p.running = false; if (pressed.block) p.blockStart = G.frame; return; }
        if (pressed.special) { startSpecial(p); return; }
        if (pressed.jump) {
          setState(p, 'jump'); p.vz = 5.4; p.vx = dx * d.speed * (p.running ? 1.6 : 1.1); p.vy = dy * d.speed * 0.5;
          p.jumpAtk = false; sfx('jump'); return;
        }
        if (pressed.attack) {
          // co-op: wyrzut partnera trzymającego gardę obok / podwójny rzut wroga trzymanego przez partnera
          const mate = G.players.find(q => q !== p && q.alive && q.state === 'block' && Math.abs(q.x - p.x) < 28 && Math.abs(q.y - p.y) < 12);
          if (mate) { launchMate(p, mate); return; }
          const held2 = G.actors.find(e => e.grabbedBy && e.grabbedBy !== p && e.grabbedBy.kind === 'player' && Math.abs(e.x - p.x) < 36 && Math.abs(e.y - p.y) < 12);
          if (held2) { doubleThrow(p, held2); return; }
          const veh = nearVehicle(p);
          if (veh) { boardVehicle(p, veh); return; }
          const beast = nearTamed(p);
          if (beast) { mountBeast(p, beast); return; }
          if (!p.weapon && !(p.cmdCool > 0) && G.frame - (p.qcfReady || -99) < 12) { startCommand(p); return; }
          if (p.running) { setState(p, 'dash'); p.vx = p.face * 3.4; sfx('whoosh'); p.running = false; return; }
          const it = nearItem(p);
          if (it) { setState(p, 'pickup'); p.pickItem = it; return; }
          const pr = held.down && !p.weapon && nearProp(p);
          if (pr) { liftProp(p, pr); return; }
          if (MELEE[p.weapon]) { p.pipeCount = 0; startMove(p, MELEE[p.weapon].move); return; }
          if (!p.weapon && held.up && !dx) { startMove(p, MOVES.launcher); p.comboIdx = 0; return; }
          if (p.weapon === 'rifle') { setState(p, 'shoot'); return; }
          if (THROWN.includes(p.weapon)) { setState(p, 'toss'); p.tossDir = dx; return; }
          if (!p.connected || G.frame - p.lastAtk > 40) p.comboIdx = 0;
          startMove(p, MOVES[d.combo[p.comboIdx]]); return;
        }
        const sp = d.speed * (p.running ? 1.9 : 1), tvx = dx * sp;
        // mokra nawierzchnia: po biegu postać ślizga się przy hamowaniu i zawracaniu
        if (slippery() && Math.abs(p.vx) > d.speed * 1.15 && Math.abs(tvx - p.vx) > 0.3 && Math.sign(tvx) !== Math.sign(p.vx)) {
          p.vx += (tvx - p.vx) * 0.07;
          if (!p.sliding) { p.sliding = true; G.popups.push({ x: p.x, y: p.y - 50, txt: 'POŚLIZG!', t: 0, col: '#80d0ff' }); sfx('whoosh'); }
          if (G.frame % 4 === 0) G.fx.push({ type: 'debris', x: p.x - Math.sign(p.vx) * 6, y: p.y, z: 1, vx: -p.vx * 0.3, vz: 1.2, t: 0, life: 18, col: '#a0c0e0' });
        } else { p.vx = tvx; p.sliding = false; }
        p.vy = dy * sp * 0.65;
        if (dx) p.face = dx;
        p.state = (dx || dy) ? 'walk' : 'idle';
        if (dx || dy) p.animT++;
        p.x += p.vx; p.y += p.vy;
        if (dx && (!p.weapon || p.weapon === p.def.innate)) {
          for (const e of G.actors) {
            if (e.team !== 'enemy' || e.kind !== 'human' || isBoss(e) || !hittable(e) || e.armor) continue;
            const ex = (e.x - p.x) * p.face;
            if (ex > 4 && ex < 17 && Math.abs(e.y - p.y) < 5 && e.z === 0) { startGrab(p, e); break; }
          }
        }
        touchItems(p);
        return;
      }
      case 'netted':
        p.netT -= 1 + ((pressed.attack || pressed.jump || pressed.special) ? 9 : 0) + ((pressed.left || pressed.right || pressed.up || pressed.down) ? 5 : 0);
        if (p.netT <= 0) { setState(p, 'idle'); p.invuln = Math.max(p.invuln, 30); sfx('whoosh'); G.popups.push({ x: p.x, y: p.y - 50, txt: 'WOLNY!', t: 0, col: '#7cff7c' }); }
        return;
      case 'attack': {
        const m = p.move;
        // atak+skok nie musi być idealnie równoczesny: skok w pierwszych klatkach ciosu też daje specjał
        if (pressed.jump && held.attack && p.t <= 4 && !p.weapon) { startSpecial(p); return; }
        if (pressed.attack && p.t > 1) p.buffer = true;
        if (p.t >= m.start && p.t < m.start + m.active) {
          const h = resolveHits(p, m, !!m.around);
          if (h) {
            p.connected = true;
            if (MELEE[p.weapon]) { p.dur -= h; if (p.dur <= 0) { p.weapon = null; sfx('crash'); spark(p.x + p.face * 20, p.y, 26); G.popups.push({ x: p.x, y: p.y - 50, txt: 'PĘKŁO!', t: 0, col: '#c0c0c0' }); } }
          }
        }
        if (p.t === m.start) sfx('whoosh');
        if (p.t >= m.start + m.active && p.buffer && p.connected && !m.knock) {
          if (MELEE[p.weapon]) { const M = MELEE[p.weapon]; p.pipeCount = (p.pipeCount || 0) + 1; startMove(p, p.pipeCount >= M.max ? M.fin : M.move); if (p.weapon === 'chain' && p.pipeCount >= M.max) sfx('whip'); return; }
          if (p.comboIdx < d.combo.length - 1) { p.comboIdx++; startMove(p, MOVES[d.combo[p.comboIdx]]); return; }
        }
        if (p.t >= m.start + m.active + m.rec) {
          if (m.knock || !p.connected) p.comboIdx = 0;
          else p.comboIdx = Math.min(p.comboIdx + 1, d.combo.length - 1);
          p.pipeCount = 0;
          setState(p, 'idle');
        }
        return;
      }
      case 'jump': {
        // ...i atak w pierwszych klatkach skoku (gracz rzadko trafia w tę samą klatkę)
        if (pressed.attack && held.jump && p.t <= 4 && !p.weapon) { p.z = 0; p.vz = 0; p.vx = 0; startSpecial(p); return; }
        p.x += p.vx; p.y += p.vy; p.vz -= GRAV; p.z += p.vz;
        if (pressed.attack && !p.jumpAtk && held.down) {
          const v = G.actors.find(e => e.team === 'enemy' && e.kind === 'human' && !isBoss(e) && hittable(e) && Math.abs(e.x - p.x) < 28 && Math.abs(e.y - p.y) < 10);
          if (v) { startAirThrow(p, v); return; }
        }
        if (pressed.attack && !p.jumpAtk) { p.jumpAtk = true; sfx('whoosh'); p.hitSet = null; }
        if (p.jumpAtk) resolveHits(p, { reach: 30, dmg: 10, knock: true, snd: 'heavy', height: 40 });
        if (p.z <= 0) { p.z = 0; p.vz = 0; setState(p, 'land'); sfx('land'); dust(p.x, p.y); }
        return;
      }
      case 'land': if (p.t > 6) setState(p, 'idle'); return;
      case 'teamthrow': if (p.t > 16) setState(p, 'idle'); return;
      case 'teamfly': {
        // partner wyrzucony jak pocisk: taranuje wrogów na drodze
        p.x += p.vx; p.vz -= GRAV; p.z += p.vz; p.animT++;
        if (!p.hitSet) p.hitSet = new Set();
        for (const t of G.actors) {
          if (p.hitSet.has(t) || !hostile(p, t) || !hittable(t)) continue;
          if (Math.abs(t.x - p.x) < 18 + t.rad * 0.5 && Math.abs(t.y - p.y) < 12 && Math.abs(t.z - p.z) < 40) {
            p.hitSet.add(t); hurt(t, Math.round(18 * (p.def.power || 1)), Math.sign(p.vx) || 1, true, p, { unblock: true });
            spark(t.x, t.y, hitY(t), true); sfx('heavy'); G.hitstop = 4; G.shake = 4;
          }
        }
        if (p.z <= 0) { p.z = 0; p.vz = 0; p.vx = 0; setState(p, 'land'); dust(p.x, p.y); sfx('land'); }
        return;
      }
      case 'dash':
        p.x += p.vx; p.vx *= 0.94;
        if (p.t > 3 && p.t < 16) resolveHits(p, { reach: 22, dmg: 12, knock: true, snd: 'heavy' });
        if (p.t > 24) setState(p, 'idle');
        return;
      case 'special': updateSpecial(p); return;
      case 'super': updateSuper(p); return;
      case 'cmd': updateCommand(p); return;
      case 'airthrow': updateAirThrow(p); return;
      case 'suplex': updateSuplex(p); return;
      case 'pickup':
        if (p.t === 5 && p.pickItem && G.items.includes(p.pickItem)) {
          const it = p.pickItem;
          G.items.splice(G.items.indexOf(it), 1);
          const throwable = THROWN.includes(it.type);
          if (throwable && p.weapon === it.type) p.ammo = Math.min(9, p.ammo + (it.ammo || 3));
          else { p.weapon = it.type; p.ammo = (it.ammo || (throwable ? 3 : 8)) + (throwable ? p.up.bomb : 0); p.dur = it.dur || (MELEE[it.type] ? MELEE[it.type].dur : 16); if (it.type === 'bottle') p.ammo = Math.min(p.ammo, it.ammo || 2); }
          sfx('pickup');
          G.popups.push({ x: p.x, y: p.y - 50, txt: WEAPON_NAMES[it.type] + (throwable ? ' ×' + p.ammo : ''), t: 0, col: '#ffe080' });
        }
        if (p.t > 10) setState(p, 'idle');
        return;
      case 'toss':
        if (p.t === 8) tossBomb(p);
        if (p.t > 18) setState(p, 'idle');
        return;
      case 'shoot':
        if (p.t === 4) fireRifle(p);
        if (p.t > 20) setState(p, 'idle');
        return;
      case 'grab': {
        const v = p.grabbing;
        if (!v || v.state !== 'grabbed') { p.grabbing = null; setState(p, 'idle'); return; }
        v.x = p.x + p.face * 15; v.y = p.y; v.face = p.backGrab ? p.face : -p.face;
        if (pressed.jump) { release(v); p.grabbing = null; setState(p, 'idle'); return; }
        if (pressed.attack) {
          if (p.backGrab) { setState(p, 'suplex'); sfx('grab'); return; }
          if (dx === -p.face) { p.face = -p.face; setState(p, 'throw'); return; }
          setState(p, 'knee'); return;
        }
        if (p.t > 110) { release(v); p.grabbing = null; setState(p, 'hurt'); p.vx = -p.face; }
        return;
      }
      case 'knee': {
        const v = p.grabbing;
        if (!v) { setState(p, 'idle'); return; }
        v.x = p.x + p.face * 15; v.y = p.y;
        if (p.t === 4) {
          v.hp -= 6 * ((p.def.power) || 1); v.flash = 6; sfx('hit'); sfx('eHurt'); spark(v.x, v.y, 24); G.hitstop = 4;
          addScore(p, 60); addCombo(p); G.lastEnemy = v; G.lastEnemyT = 200;
          p.kneeCount = (p.kneeCount || 0) + 1;
          if (v.hp <= 0) { v.grabbedBy = null; p.grabbing = null; onDeath(v, p); setState(v, 'fall'); v.vx = p.face * 2; v.vz = 3.5; v.z = 1; p.kneeCount = 0; }
        }
        if (p.t > 12) {
          if (p.kneeCount >= 3 && p.grabbing) { p.kneeCount = 0; setState(p, 'throw'); }
          else if (p.grabbing) { p.state = 'grab'; p.t = 30; } else setState(p, 'idle');
        }
        return;
      }
      case 'throw': {
        const v = p.grabbing;
        if (v && p.t < 6) { v.x = p.x - p.face * 6; v.y = p.y; v.z = 18; }
        if (p.t === 6 && v) {
          sfx('throw');
          v.grabbedBy = null; p.grabbing = null;
          setState(v, 'thrown'); v.x = p.x + p.face * 10; v.face = -p.face; v.vx = p.face * 4.4; v.vz = 4; v.z = 16; v.thrower = p; v.bounced = false;
          p.kneeCount = 0;
        }
        if (p.t > 18) setState(p, 'idle');
        return;
      }
    }
  }
  function startMove(a, m) { setState(a, 'attack'); a.move = m; a.buffer = false; a.connected = false; a.lastAtk = G.frame; }
  function startSpecial(p) {
    if (p.fury >= 100) { startSuper(p); return; }
    setState(p, 'special'); p.specialPaid = false; p.vx = 0; sfx('whoosh');
    if (!(p.shoutT > G.frame)) { shout(p, 'special'); p.shoutT = G.frame + 90; }
  }
  function startGrab(p, e) {
    p.backGrab = e.face === p.face;   // wróg odwrócony plecami
    setState(p, 'grab'); p.grabbing = e; e.grabbedBy = p; setState(e, 'grabbed'); p.kneeCount = 0; sfx('grab');
    if (p.backGrab) G.popups.push({ x: p.x, y: p.y - 56, txt: 'Z TYŁU!', t: 0, col: '#ffe080' });
  }

  // ---------------------------------------------------- specjały postaci (atak+skok / L)
  function paySpecial(p, h) { if (h && !p.specialPaid) { p.specialPaid = true; p.hp = Math.max(1, p.hp - 6); } }
  function updateSpecial(p) {
    p.invuln = Math.max(p.invuln, 2);
    switch (p.key) {
      case 'nina': // salto z kopnięciem
        if (p.t === 1) { p.vz = 5.2; p.vx = p.face * 2.4; sfx('jump'); }
        p.x += p.vx; p.vz -= GRAV; p.z = Math.max(0, p.z + p.vz);
        if (p.t > 2 && p.t < 30) paySpecial(p, resolveHits(p, { reach: 30, dmg: 12, knock: true, snd: 'heavy', height: 60 }, true));
        if (p.t > 4 && p.z <= 0) { p.z = 0; sfx('land'); dust(p.x, p.y); setState(p, 'land'); }
        return;
      case 'padlin': // młyn kotwicą
        if (p.t === 1) sfx('whoosh');
        if (p.t % 6 === 2 && p.t < 30) { p.hitSet = null; paySpecial(p, resolveHits(p, { reach: 54, dmg: 9, knock: p.t > 24, snd: 'heavy', height: 50 }, true)); sfx('whoosh'); }
        if (p.t > 34) setState(p, 'idle');
        return;
      case 'zmijka': // wir bicza
        if (p.t % 5 === 1 && p.t < 34) { p.hitSet = null; paySpecial(p, resolveHits(p, { reach: 70, dmg: 6, knock: p.t > 28, snd: 'whip', height: 40 }, true)); sfx('whip'); }
        if (p.t > 38) setState(p, 'idle');
        return;
      case 'tur': // trzęsienie ziemi
        if (p.t === 1) { p.vz = 3.4; sfx('jump'); }
        if (p.t > 1) { p.vz -= GRAV * 1.4; p.z = Math.max(0, p.z + p.vz); }
        if (p.t > 4 && p.z <= 0 && !p.slammed) {
          p.slammed = true; sfx('slam'); G.shake = 12;
          G.fx.push({ type: 'shock', x: p.x, y: p.y, z: 0, t: 0, life: 22, r: 80 });
          for (let i = 0; i < 5; i++) dust(p.x + rnd(-40, 40), p.y + rnd(-6, 6));
          let h = 0;
          for (const t of G.actors) {
            if (!hostile(p, t) || !hittable(t) || t.z > 6) continue;
            if (Math.abs(t.x - p.x) < 74 + t.rad && Math.abs(t.y - p.y) < 22 + (t.depthR || 0)) { hurt(t, Math.round(12 * (p.def.power || 1)), t.x >= p.x ? 1 : -1, true, p, { unblock: true }); h++; }
          }
          paySpecial(p, h);
        }
        if (p.slammed && p.t > 26) { p.slammed = false; setState(p, 'idle'); }
        return;
      case 'bursztyn': { // skok przez cień: znika i uderza od tyłu najbliższego wroga
        p.alpha = p.t < 10 ? 1 - p.t / 10 : Math.min(1, (p.t - 10) / 8);
        if (p.t === 10) {
          sfx('warp');
          const tgt = G.actors.filter(t => hostile(p, t) && hittable(t) && Math.abs(t.x - p.x) < 220).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
          if (tgt) {
            const side = tgt.face || 1;
            p.x = clamp(tgt.x - side * 24, G.camX + 10, G.camX + W - 10); p.y = tgt.y; p.face = tgt.x > p.x ? 1 : -1;
            paySpecial(p, 1); hurt(tgt, Math.round(16 * (p.def.power || 1)), p.face, true, p, { unblock: true }); spark(tgt.x, tgt.y, hitY(tgt), true); sfx('heavy');
          }
        }
        if (p.t > 22) { p.alpha = 1; setState(p, 'idle'); }
        return;
      }
      case 'borys': // młynek laską — 3 trafienia dookoła
        if (p.t % 9 === 1) { p.hitSet = null; sfx('whoosh'); }
        if (p.t > 2 && p.t < 30) paySpecial(p, resolveHits(p, { reach: 40, dmg: 7, knock: p.t > 20, snd: 'hit', height: 40 }, true));
        if (p.t > 34) setState(p, 'idle');
        return;
      default: // KRUK — wirujący kopniak
        if ((p.t > 4 && p.t < 10) || (p.t > 14 && p.t < 20)) {
          if (p.t === 15) p.hitSet = null;
          paySpecial(p, resolveHits(p, { reach: 30, dmg: 10, knock: true, snd: 'heavy', height: 40 }, true));
        }
        if (p.t % 8 === 0) sfx('whoosh');
        if (p.t > 28) setState(p, 'idle');
    }
  }

  // ---------------------------------------------------- ruchy komendowe ↓ ↘ → + atak
  function startCommand(p) {
    setState(p, 'cmd'); p.cmdCool = 50; p.qcfReady = -99;
    if (p.key === 'borys') { startMove(p, MOVES.cmdPoke); p.cmdPoke = true; return; }
    G.popups.push({ x: p.x, y: p.y - 60, txt: p.def.moves[1].split(': ')[1] + '!', t: 0, col: '#ffe080' });
  }
  function updateCommand(p) {
    switch (p.key) {
      case 'kruk': // rzut kluczem francuskim
        if (p.t === 8) { shoot({ type: 'wrench', owner: p, x: p.x + p.face * 16, y: p.y, z: 26, vx: p.face * 4.6, dmg: Math.round(14 * (p.def.power || 1)), knock: true, life: 120 }); sfx('throw'); }
        if (p.t > 20) setState(p, 'idle');
        return;
      case 'nina': // wślizg
        if (p.t === 1) { p.vx = p.face * 4.6; sfx('whoosh'); }
        p.x += p.vx; p.vx *= 0.95;
        if (p.t > 2 && p.t < 20) resolveHits(p, { reach: 26, dmg: 12, knock: true, snd: 'heavy', height: 20 });
        if (p.t % 5 === 0) dust(p.x - p.face * 8, p.y);
        if (p.t > 26) setState(p, 'idle');
        return;
      case 'padlin': // rzut kotwicą
        if (p.t === 8) { shoot({ type: 'harpoon', owner: p, x: p.x + p.face * 16, y: p.y, z: 28, vx: p.face * 4.4, dmg: Math.round(18 * (p.def.power || 1)), knock: true, life: 110 }); sfx('throw'); }
        if (p.t > 22) setState(p, 'idle');
        return;
      case 'zmijka': // wachlarz noży
        if (p.t === 8) { [-10, 0, 10].forEach(o => shoot({ type: 'knife', owner: p, x: p.x + p.face * 12, y: clamp(p.y + o, FLOOR_TOP + 6, FLOOR_BOTTOM), z: 26, vx: p.face * 4.8, dmg: 9, knock: false, life: 100 })); sfx('whoosh'); }
        if (p.t > 20) setState(p, 'idle');
        return;
      case 'bursztyn': // fala energii po ziemi
        if (p.t === 8) { shoot({ type: 'wave', owner: p, x: p.x + p.face * 18, y: p.y, z: 0, vx: p.face * 3.8, dmg: Math.round(14 * (p.def.power || 1)), knock: true, life: 160 }); sfx('energy'); }
        if (p.t > 22) setState(p, 'idle');
        return;
      case 'tur': // taran barkiem z pancerzem
        p.invuln = Math.max(p.invuln, 2);
        if (p.t === 1) { p.vx = p.face * 4.2; sfx('charge'); }
        if (p.t < 26) { p.x += p.vx; if (p.t % 4 === 0) dust(p.x - p.face * 10, p.y); resolveHits(p, { reach: 24, dmg: 16, knock: true, snd: 'heavy', shake: 5 }); }
        if (p.t > 36) setState(p, 'idle');
        return;
    }
    setState(p, 'idle');
  }

  // ---------------------------------------------------- rzut w powietrzu (↓ + atak w skoku przy wrogu)
  function startAirThrow(p, v) {
    setState(p, 'airthrow'); p.grabbing = v; v.grabbedBy = p; setState(v, 'grabbed'); v.airHeld = true;
    p.vz = Math.max(p.vz, 2.4); p.vx = 0; p.vy = 0; sfx('grab');
    G.popups.push({ x: p.x, y: p.y - 70, txt: 'RZUT W LOCIE!', t: 0, col: '#ffe080' });
  }
  function updateAirThrow(p) {
    p.invuln = Math.max(p.invuln, 2);
    const v = p.grabbing;
    p.vz -= GRAV * 1.3; p.z = Math.max(0, p.z + p.vz);
    if (v) { v.x = p.x + p.face * 4; v.y = p.y; v.z = p.z + 34 * scaleOf(p); }
    if (p.z <= 0 && p.t > 3) {
      if (v) {
        v.grabbedBy = null; v.airHeld = false; p.grabbing = null;
        v.hp -= Math.round(18 * (p.def.power || 1)); v.lastThrow = true; v.flash = 6; addScore(p, 400); addCombo(p); unlock('airthrow'); G.lastEnemy = v; G.lastEnemyT = 200;
        if (v.hp <= 0) onDeath(v, p);
        setState(v, 'fall'); v.z = 1; v.vz = 2.2; v.vx = p.face * 1.6; v.bounced = false;
        spark(v.x, v.y, 10, true);
      }
      sfx('slam'); G.shake = 10; dust(p.x, p.y); dust(p.x + p.face * 10, p.y);
      setState(p, 'land');
    }
  }
  // ---------------------------------------------------- suplex (chwyt od tyłu + atak)
  function updateSuplex(p) {
    const v = p.grabbing;
    if (!v) { setState(p, 'idle'); return; }
    const k = Math.min(1, p.t / 14);
    v.x = p.x + p.face * (15 - 34 * k); v.y = p.y; v.z = Math.sin(k * Math.PI) * 30 + 6; v.airHeld = k > 0.3;
    if (p.t === 14) {
      unlock('suplex');
      v.grabbedBy = null; v.airHeld = false; p.grabbing = null;
      v.hp -= Math.round(20 * (p.def.power || 1)); v.lastThrow = true; v.flash = 6; addScore(p, 500); addCombo(p); G.lastEnemy = v; G.lastEnemyT = 200;
      if (v.hp <= 0) onDeath(v, p);
      setState(v, 'fall'); v.z = 1; v.vz = 2; v.vx = -p.face * 1.4; v.bounced = false;
      sfx('slam'); G.shake = 10; spark(v.x, v.y, 8, true); dust(v.x, v.y);
    }
    if (p.t > 28) setState(p, 'idle');
  }

  // ---------------------------------------------------- ujeżdżanie dinozaurów
  const MOUNT_TIME = 15 * 60;
  const RIDE = {
    raptor: { sp: 2.5, jump: 6.2, seat: 25, name: 'RAPTOR', acc: 'RAPTORA' },
    pachy: { sp: 1.9, jump: 4.4, seat: 27, name: 'PACHY', acc: 'PACHY' },
    trike: { sp: 1.5, jump: 3.6, seat: 32, name: 'TRICERATOPS', acc: 'TRICERATOPSA' },
    para: { sp: 2.1, jump: 5.4, seat: 34, name: 'PARAZAUROLOF', acc: 'PARAZAUROLOFA' },
    ptera: { sp: 2.3, jump: 0, seat: 5, name: 'PTERANODON', acc: 'PTERANODONA', fly: true },
    jeep: { sp: 3.0, seat: 17, name: 'JEEP', acc: 'JEEPA', vehicle: true },
    cart: { sp: 3.6, seat: 6, name: 'WAGONIK', acc: 'WAGONIK', vehicle: true, rail: 163 }
  };
  function nearVehicle(p) { return (G.vehicles || []).find(v => !v.used && Math.abs(v.x - p.x) < 32 && Math.abs(v.y - p.y) < 12); }
  function boardVehicle(p, v) {
    v.used = true; v.taken = true;
    const time = v.type === 'cart' ? 20 * 60 : 12 * 60;
    p.mount = { type: v.type, vehicle: true, t: time, max: time, cool: 0, v: 0 };
    p.weapon = null; p.x = v.x; p.y = v.y; setState(p, 'idle'); sfx('charge'); sfx('pickup');
    G.popups.push({ x: p.x, y: p.y - 60, txt: v.type === 'cart' ? 'WSKAKUJESZ DO WAGONIKA!' : 'PRZEJMUJESZ JEEPA!', t: 0, col: '#7cff7c' });
  }
  function updateVehicle(p, held, pressed, dx, dy, m, R) {
    p.animT++;
    if (R.rail) {
      p.y = R.rail;
      m.v = clamp((m.v + dx * 0.12) * 0.99, -R.sp, R.sp);
      const C = ST.CARTS || { x0: -1e9, x1: 1e9 };
      if (p.x > C.x1 - 12) { dismount(p, true); return; }
      if (p.x < C.x0 + 12 && m.v < 0) m.v = 0;
      if (pressed.attack) sfx('go');
    } else {
      m.v += (dx * R.sp - m.v) * 0.12; p.y += dy * R.sp * 0.55;
      if (pressed.attack && !(m.cool > 0)) { m.nitro = 24; m.cool = 70; sfx('charge'); }
      if (m.nitro > 0) { m.nitro--; m.v = p.face * (R.sp + 2.4); }
    }
    p.x += m.v; if (Math.abs(m.v) > 0.3) p.face = Math.sign(m.v);
    p.state = Math.abs(m.v) > 0.3 ? 'walk' : 'idle';
    if (Math.abs(m.v) > 1.4) {
      m.hits = m.hits || new Map();
      for (const t of G.actors) {
        if (!hostile(p, t) || !hittable(t) || t.z > 10) continue;
        if (Math.abs(t.x - p.x) > 26 + t.rad * 0.5 || Math.abs(t.y - p.y) > 9 + (t.depthR || 0)) continue;
        if ((m.hits.get(t) || 0) > G.frame) continue;
        m.hits.set(t, G.frame + 40);
        hurt(t, isBoss(t) ? 8 : 16, Math.sign(m.v), !isBoss(t), p, { unblock: true }); spark(t.x, t.y, hitY(t), true); sfx('heavy'); G.shake = 4;
      }
      if (G.frame % 8 === 0) dust(p.x - Math.sign(m.v) * 24, p.y);
    }
    touchItems(p);
  }
  function nearTamed(p) {
    return G.actors.find(a => a.state === 'tamed' && a.alive && Math.abs(a.x - p.x) < 24 && Math.abs(a.y - p.y) < 10);
  }
  function mountBeast(p, beast) {
    beast.alive = false; beast.remove = true;
    const time = (beast.kind === 'ptera' ? 8 * 60 : MOUNT_TIME) + 300 * ((p.up && p.up.ride) || 0);
    p.mount = { type: beast.kind, cols: beast.cols, t: time, max: time, cool: 0 };
    unlock('rider');
    p.weapon = null; setState(p, 'rideJump'); p.vz = 3.2; p.z = Math.max(p.z, 0.1);
    sfx('screech'); sfx('pickup');
    G.popups.push({ x: p.x, y: p.y - 70, txt: 'DOSIADASZ ' + RIDE[beast.kind].acc + '!', t: 0, col: '#7cff7c' });
  }
  function dismount(p, voluntary) {
    const m = p.mount; if (!m) return;
    p.mount = null;
    if (m.vehicle) {
      G.vehicles.push({ type: m.type, x: p.x, y: p.y, used: true });
      if (voluntary) { setState(p, 'jump'); p.vz = 4; p.vx = -p.face * 1.2; p.vy = 0; p.jumpAtk = false; }
      return;
    }
    const b = makeEnemy(m.type, p.x, p.y);
    b.cols = m.cols; b.hp = 0; b.maxHp = b.def.hp; b.lagHp = 0; b.dying = true;
    b.face = p.x - G.camX < W / 2 ? -1 : 1; setState(b, 'flee'); b.alive = true;
    G.actors.push(b);
    sfx('screech');
    if (voluntary) { setState(p, 'jump'); p.vz = m.type === 'ptera' ? 1 : 4; p.vx = -p.face * 1.2; p.vy = 0; p.jumpAtk = false; }
    else if (m.type === 'ptera' && p.z > 0) { p.vz = 0; }
  }
  function updateRider(p, held, pressed, dx, dy) {
    const m = p.mount, raptor = m.type === 'raptor', R = RIDE[m.type];
    if (--m.t <= 0 || pressed.special) { dismount(p, true); return; }
    if (m.cool > 0) m.cool--;
    if (R.vehicle) { updateVehicle(p, held, pressed, dx, dy, m, R); return; }
    p.animT++;
    if (R.fly && p.state !== 'rideAtk') { p.z += (30 - p.z) * 0.15; p.vz = 0; }
    switch (p.state) {
      case 'idle': case 'walk': case 'rideJump': {
        if (p.state === 'rideJump' && !R.fly) break;
        const sp = R.sp;
        p.vx = dx * sp; p.vy = dy * sp * 0.6;
        if (dx) p.face = dx;
        p.x += p.vx; p.y += p.vy;
        p.state = (dx || dy) ? 'walk' : 'idle';
        if (pressed.jump && !R.fly) { setState(p, 'rideJump'); p.vz = R.jump; p.vx = dx * sp * 1.1; sfx('jump'); return; }
        if (pressed.attack) {
          setState(p, 'rideAtk');
          if (raptor) { p.move = MOVES.rideBite; sfx('screech'); }
          else if (m.type === 'para' && m.cool <= 0) { p.rideRoar = true; m.cool = 90; }
          else if (m.type === 'para') { p.rideRoar = false; p.move = MOVES.rideBite; }
          else if (R.fly) sfx('screech');
          else { p.vx = p.face * (m.type === 'trike' ? 3.6 : 4.4); sfx('charge'); }
        }
        if (p.z < 2) touchItems(p);
        return;
      }
    }
    switch (p.state) {
      case 'rideAtk':
        if (R.fly) {
          const k = Math.min(1, p.t / 30);
          p.z = 30 - Math.sin(k * Math.PI) * 27; p.x += p.face * 2.2;
          if (p.z < 14) resolveHits(p, { abs: true, reach: 26, dmg: 12, knock: true, snd: 'bite', height: 40 });
          if (p.t > 30) setState(p, 'idle');
          return;
        }
        if (m.type === 'para' && p.rideRoar) {
          if (p.t === 6) {
            sfx('roar'); G.shake = 8;
            for (const t of G.actors) if (hostile(p, t) && hittable(t) && t.z < 10 && Math.abs(t.x - p.x) < 110 && Math.abs(t.y - p.y) < 30) {
              hurt(t, 4, t.x >= p.x ? 1 : -1, false, p, { unblock: true });
              if (t.alive && t.hp > 0 && t.kind === 'human' && !isBoss(t)) setState(t, 'stun');
            }
          }
          if (p.t > 36) setState(p, 'idle');
          return;
        }
        if (raptor || m.type === 'para') {
          if (p.t >= 6 && p.t < 12) { p.x += p.face * 1.5; if (p.t === 7) sfx('bite'); resolveHits(p, MOVES.rideBite); }
          if (p.t > 18) setState(p, 'idle');
        } else {
          const trike = m.type === 'trike', len = trike ? 44 : 32;
          if (p.t < len) { p.x += p.vx; if (p.t % 4 === 0) dust(p.x - p.face * 14, p.y); resolveHits(p, { abs: true, reach: trike ? 40 : 34, dmg: trike ? 18 : 16, knock: true, snd: 'heavy', shake: 5, depth: 12 }); }
          if (p.t > len + 10) setState(p, 'idle');
        }
        return;
      case 'rideJump':
        p.x += p.vx; p.vz -= GRAV; p.z += p.vz;
        if (pressed.attack && !p.jumpAtk) { p.jumpAtk = true; p.hitSet = null; sfx('bite'); }
        if (p.jumpAtk) resolveHits(p, { abs: true, reach: 34, dmg: 13, knock: true, snd: 'heavy', height: 50 });
        if (p.z <= 0) {
          p.z = 0; p.vz = 0; p.jumpAtk = false; sfx('land'); dust(p.x, p.y); setState(p, 'idle');
          if (!raptor) { G.shake = 4; for (const t of G.actors) if (hostile(p, t) && hittable(t) && t.z < 4 && Math.abs(t.x - p.x) < 40 && Math.abs(t.y - p.y) < 14) hurt(t, 8, t.x >= p.x ? 1 : -1, true, p); }
        }
        return;
    }
  }
  const WEAPON_NAMES = { pipe: 'RURA', rifle: 'STRZELBA', dynamite: 'DYNAMIT', grenade: 'GRANAT', machete: 'MACZETA', chain: 'ŁAŃCUCH', bottle: 'BUTELKA' };
  const isWeaponItem = t => !!WEAPON_NAMES[t];
  // broń biała: ruch, wykończenie serii (cios kończący), wytrzymałość, długość serii
  const MELEE = {
    pipe: { move: MOVES.pipe, fin: Object.assign({}, MOVES.pipe, { knock: true }), dur: 16, max: 2 },
    machete: { move: MOVES.machete, fin: Object.assign({}, MOVES.machete, { knock: true, dmg: 18 }), dur: 12, max: 3 },
    chain: { move: MOVES.chain, fin: MOVES.chainSpin, dur: 14, max: 2 }
  };
  const THROWN = ['dynamite', 'grenade', 'bottle'];
  function tossBomb(p) {
    if (p.ammo <= 0) { p.weapon = null; return; }
    p.ammo--;
    if (p.weapon === 'bottle') {
      shoot({ type: 'bottle', owner: p, x: p.x + p.face * 12, y: p.y, z: 28 * p.b.scale, vx: p.face * 4.6, dmg: 14, knock: true, life: 70 });
      sfx('throw'); if (p.ammo <= 0) p.weapon = null; return;
    }
    const far = p.tossDir === p.face ? 1.35 : p.tossDir === -p.face ? 0.6 : 1;
    const gren = p.weapon === 'grenade';
    shoot({ type: p.weapon, owner: p, x: p.x + p.face * 10, y: p.y, z: 34 * p.b.scale,
      vx: p.face * (gren ? 2.6 : 1.9) * far, vy: 0, vz: gren ? 3.2 : 3.8, fuse: gren ? 70 : 0, life: 999 });
    sfx('throw');
    if (p.ammo <= 0) p.weapon = null;
  }
  function nearItem(p) {
    return G.items.find(it => isWeaponItem(it.type) && it.z === 0 && Math.abs(it.x - p.x) < 16 && Math.abs(it.y - p.y) < 9);
  }
  function touchItems(p) {
    for (let i = G.items.length - 1; i >= 0; i--) {
      const it = G.items[i];
      if (isWeaponItem(it.type) || it.z > 0) continue;
      if (Math.abs(it.x - p.x) > 13 || Math.abs(it.y - p.y) > 8) continue;
      G.items.splice(i, 1);
      if (it.type === 'meat') { p.hp = Math.min(p.maxHp, p.hp + 60); sfx('food'); addScore(p, 300); G.popups.push({ x: it.x, y: it.y - 30, txt: '+ZDROWIE', t: 0, col: '#7cff7c' }); }
      else if (it.type === 'fruit') { p.hp = Math.min(p.maxHp, p.hp + 25); sfx('food'); addScore(p, 100); G.popups.push({ x: it.x, y: it.y - 30, txt: '+25', t: 0, col: '#7cff7c' }); }
      else if (it.type === 'amber') { p.amber++; sfx('coin'); G.popups.push({ x: it.x, y: it.y - 30, txt: '+1 BURSZTYN', t: 0, col: '#f0a020' }); }
      else if (it.type === 'gem') { p.amber++; addScore(p, 2000); sfx('coin'); G.popups.push({ x: it.x, y: it.y - 30, txt: '2000', t: 0, col: '#80f0ff' }); }
      else if (it.type === '1up') { p.lives++; sfx('oneup'); addScore(p, 1000); G.popups.push({ x: it.x, y: it.y - 30, txt: '1UP!', t: 0, col: '#7cff7c' }); }
      else if (it.type === 'coin') { addScore(p, 500); sfx('coin'); G.popups.push({ x: it.x, y: it.y - 30, txt: '500', t: 0, col: '#ffe080' }); }
    }
  }
  function fireRifle(p) {
    if (p.ammo <= 0) { sfx('empty'); p.weapon = null; return; }
    p.ammo--; sfx('gun'); G.shake = 3;
    let best = null, bd = 1e9;
    for (const t of G.actors) {
      if (!hostile(p, t) || !hittable(t)) continue;
      const dx = (t.x - p.x) * p.face;
      if (dx < 0 || dx > W || Math.abs(t.y - p.y) > 12 + (t.depthR || 0)) continue;
      if (dx < bd) { bd = dx; best = t; }
    }
    const x2 = best ? best.x : p.x + p.face * W;
    G.fx.push({ type: 'tracer', x: p.x + p.face * 22, x2, y: p.y, z: 24 * p.b.scale, t: 0, life: 6 });
    G.fx.push({ type: 'muzzle', x: p.x + p.face * 26, y: p.y, z: 24 * p.b.scale, t: 0, life: 5 });
    if (best) { hurt(best, 20, p.face, true, p); spark(best.x, best.y, hitY(best), true); G.hitstop = 5; }
    if (p.ammo <= 0) { G.popups.push({ x: p.x, y: p.y - 50, txt: 'PUSTO!', t: 0, col: '#ff8080' }); p.weapon = null; }
  }

  // =============================================================== WSPÓLNE STANY
  function updateCommon(a) {
    switch (a.state) {
      case 'hurt':
        a.x += a.vx; a.vx *= 0.8;
        if (a.t > (a.kind === 'player' ? 16 : (isBoss(a) ? 10 : 18))) setState(a, 'idle');
        return true;
      case 'stun':
        if (a.t > 70) setState(a, 'idle');
        return true;
      case 'fall': case 'thrown': {
        a.x += a.vx; a.vz -= GRAV; a.z += a.vz;
        if (ST.deck && a.state === 'thrown' && !a.fvy && a.team !== 'player') a.fvy = (a.y < (ST.deck.y0 + ST.deck.y1) / 2 ? -1 : 1) * 0.9;
        if (a.fvy) a.y += a.fvy;   // pociąg: odrzut w stronę krawędzi platformy
        // odbicie od krawędzi ekranu: wróg wraca w powietrzu — można go dobić
        if (a.team !== 'player' && !a.wallBounced && Math.abs(a.vx) > 1.2 && a.kind !== 'rex' && G) {
          const L = G.camX + 8, Rr = G.camX + W - 8;
          if ((a.x < L && a.vx < 0) || (a.x > Rr && a.vx > 0)) {
            a.wallBounced = true; a.x = clamp(a.x, L, Rr); a.vx = -a.vx * 0.75; a.vz = Math.max(a.vz, 2.6); a.z = Math.max(a.z, 6);
            a.hp -= 4; a.flash = 6; G.shake = Math.max(G.shake, 5); sfx('heavy'); spark(a.x, a.y, 24, true);
            G.popups.push({ x: a.x, y: a.y - 56, txt: 'ODBICIE!', t: 0, col: '#ffe080' });
            if (a.lastPlayer) { addScore(a.lastPlayer, 300); addCombo(a.lastPlayer); }
            if (a.hp <= 0 && !a.dying) onDeath(a, a.lastPlayer);
          }
        }
        if (a.state === 'thrown') {
          for (const o of G.actors) {
            if (o === a || o.team === 'player' || !hittable(o) || (isBoss(o) && o.armor)) continue;
            if (Math.abs(o.x - a.x) < 16 + o.rad * 0.5 && Math.abs(o.y - a.y) < 10) {
              hurt(o, 12, a.vx > 0 ? 1 : -1, !isBoss(o), a.thrower, { unblock: true, throw: true }); spark(o.x, o.y, 22, true); sfx('heavy'); G.hitstop = 5;
            }
          }
        }
        if (a.z <= 0) {
          a.z = 0; a.fvy = 0;
          if (a.team !== 'player' && !isBoss(a) && a.kind !== 'rex' && !a.bounced && ringOut(a)) return true;
          if (a.state === 'thrown') {
            a.hp -= 12; a.lastThrow = true; sfx('heavy'); G.shake = 5; dust(a.x, a.y);
            if (a.hp <= 0 && !a.dying) onDeath(a, a.thrower);
            a.state = 'fall'; a.bounced = false;
          }
          if (!a.bounced) { a.bounced = true; a.vz = 1.8; a.z = 0.1; a.vx *= 0.5; sfx('land'); dust(a.x, a.y); if (a.kind === 'rex') G.shake = 10; }
          else { setState(a, 'down'); a.vx = 0; a.vz = 0; a.juggle = 0; a.wallBounced = false; }
        }
        return true;
      }
      case 'hopin':   // wskok na platformę pociągu
        a.y += a.fvy || 0; a.vz -= GRAV; a.z += a.vz; a.animT++;
        if (a.z <= 0) { a.z = 0; a.fvy = 0; setState(a, 'idle'); dust(a.x, a.y); sfx('land'); }
        return true;
      case 'down':
        if (a.t > (a.kind === 'player' ? 46 : 40)) {
          if (a.hp <= 0 && a.tame) setState(a, 'tamed');
          else if (a.hp <= 0) setState(a, 'dead');
          else setState(a, 'getup');
        }
        return true;
      case 'tamed':
        if (a.t > 420) { a.face = a.x - G.camX < W / 2 ? -1 : 1; setState(a, 'flee'); }
        return true;
      case 'flee':
        a.x += a.face * 3; a.animT++;
        if (a.x < G.camX - 70 || a.x > G.camX + W + 70) { a.alive = false; a.remove = true; }
        return true;
      case 'getup':
        if (a.t > 14) { setState(a, 'idle'); a.hurtCount = 0; if (a.kind === 'player') a.invuln = 60; }
        return true;
      case 'grabbed':
        if (!a.grabbedBy) setState(a, 'idle');
        return true;
      case 'dead':
        if (a.t > 60) {
          if (a.kind === 'player') playerDied(a);
          else { a.alive = false; a.remove = true; }
        }
        return true;
    }
    return false;
  }

  function respawn(p) {
    p.hp = p.maxHp; p.lagHp = p.maxHp; p.weapon = null; p.alive = true; p.dying = false;
    p.x = G.camX + 80; p.y = 185; p.z = 140; p.vz = 0; setState(p, 'drop'); p.invuln = 150;
  }
  function playerDied(p) {
    if (p.st) p.st.deaths++;
    if (p.lives > 0) { p.lives--; respawn(p); return; }
    p.alive = false; p.out = true;
    if (G.players.some(q => q.alive)) {
      G.popups.push({ x: G.camX + W / 2, y: 120, txt: (p.pIdx + 1) + 'P: START = KONTYNUACJA', t: 0, col: P_COLS[p.pIdx] });
      return;
    }
    app.mode = 'gameover'; app.t = 0; app.cont = (G.rush || G.special === 'survival' || G.ch || app.gameMode === 'daily') ? 0 : 10; AU.stopMusic(); AU.play('gameover');
  }
  // dołączenie gracza 2 lub kontynuacja gracza, który stracił wszystkie życia
  function joinOrContinue(i) {
    let p = G.players[i];
    if (!p) {
      if (i !== 1) return false;
      app.p2Active = true;
      let k = app.sel2;
      if (k === app.sel) k = (app.sel + 1) % selKeys().length;
      p = makePlayer(selKeys()[k], 1, false);
      p.lives = OPTS.lives - 1;
      G.players.push(p); G.actors.push(p);
      respawn(p);
      G.popups.push({ x: p.x, y: 110, txt: '2P DOŁĄCZA!', t: 0, col: P_COLS[1] });
      sfx('start');
      return true;
    }
    if (!p.out) return false;
    p.out = false; p.lives = OPTS.lives - 1;
    if (!G.actors.includes(p)) G.actors.push(p);
    respawn(p); sfx('start');
    return true;
  }

  // =============================================================== AI LUDZI
  function nearestPlayer(e) {
    let best = null, bd = 1e9;
    for (const p of players()) { if (p.state === 'dead') continue; const d = Math.abs(p.x - e.x) + Math.abs(p.y - e.y) * 2; if (d < bd) { bd = d; best = p; } }
    return best;
  }
  function enterScreen(e) {
    const m = e.kind === 'rex' ? 90 : 24;
    const tx = clamp(e.x, G.camX + m, G.camX + W - m);
    e.face = tx > e.x ? 1 : -1;
    e.x += e.face * Math.max(1, e.def.speed * 1.2); e.animT++;
    e.y += Math.sign(e.hoverY - e.y) * 0.3;
    if (Math.abs(tx - e.x) < 2) setState(e, 'idle');
  }
  function stepToward(e, tx, ty, sp) {
    tx = clamp(tx, G.camX + 14, G.camX + W - 14);
    const mx = Math.abs(tx - e.x) > 3 ? Math.sign(tx - e.x) : 0, my = Math.abs(ty - e.y) > 2 ? Math.sign(ty - e.y) : 0;
    e.x += mx * sp; e.y += my * sp * 0.6;
    e.state = (mx || my) ? 'walk' : 'idle';
    if (mx || my) e.animT++;
  }
  function maxAttackers() { return ST.diff >= 1.35 ? 3 : 2; }

  function updateHuman(e) {
    e.t++; e.cool--;
    if (updateCommon(e)) return;
    const p = nearestPlayer(e);
    const ai = e.def.ai;
    const boss = isBoss(e);
    const spMul = e.enraged ? 1.3 : 1;
    switch (e.state) {
      case 'enter':
        enterScreen(e);
        if (e.state === 'idle' && !boss && Math.random() < 0.25) evoice(e, 'taunt');
        if (e.state === 'idle' && boss && !G.introBoss) { G.introBoss = e; setState(e, 'intro'); }
        return;
      case 'intro':
        if (e.t === 1) { evoice(e, 'taunt', true); sfx('charge'); G.shake = 8; }
        if (e.t > 80) { setState(e, 'idle'); G.introBoss = null; }
        return;
      case 'idle': case 'walk': {
        if (!p) { e.state = 'idle'; return; }
        if (--e.modeT <= 0) {
          const attackers = foes().filter(o => o.mode === 'approach' && o !== e).length;
          e.mode = boss || attackers < maxAttackers() ? 'approach' : 'hover';
          e.modeT = rnd(80, 160); e.hoverY = rnd(FLOOR_TOP + 8, FLOOR_BOTTOM - 4);
        }
        const side = Math.sign(e.x - p.x) || 1;
        const dist = Math.abs(p.x - e.x), ddy = Math.abs(p.y - e.y);
        if (ai === 'shield') {
          // tarczownik obraca się powoli — okazja, by zajść go od tyłu
          const want = p.x > e.x ? 1 : -1;
          if (want !== e.face) { if (++e.turnT > 40) { e.face = want; e.turnT = 0; } } else e.turnT = 0;
        } else e.face = p.x > e.x ? 1 : -1;
        if (ai === 'dummy') { e.state = 'idle'; return; }
        if (ai === 'sniper' && e.perch) {
          if (e.cool <= 0) { setState(e, 'snipeAim'); e.cool = rnd(150, 210) / ST.diff; }
          return;
        }
        if (ai === 'netter') {
          if (dist < 30 && ddy < 6 && e.cool <= 0) { startMove(e, MOVES.slash); e.cool = rnd(50, 80); return; }
          if (e.cool <= 0 && ddy < 6 && dist > 50 && dist < 170 && p.state !== 'netted') { setState(e, 'throwNet'); e.cool = rnd(170, 230) / ST.diff; return; }
          stepToward(e, p.x + side * 100, p.y, e.def.speed);
          return;
        }
        // dystansowcy
        if (ai === 'flamer') {
          if (e.cool <= 0 && ddy < 8 && dist > 20 && dist < 72) { setState(e, 'flame'); e.cool = rnd(130, 180) / ST.diff; sfx('charge'); return; }
          stepToward(e, p.x + side * 52, p.y, e.def.speed);
          return;
        }
        if (ai === 'bomber') {
          if (dist < 30 && ddy < 6 && e.cool <= 0) { startMove(e, MOVES.slash); e.cool = rnd(50, 80); return; }
          if (e.cool <= 0 && dist > 50 && dist < 200) { setState(e, 'lob'); e.cool = rnd(110, 170) / ST.diff; return; }
          stepToward(e, p.x + side * 110, e.mode === 'approach' ? p.y : e.hoverY, e.def.speed);
          return;
        }
        if (ai === 'gunner') {
          if (dist < 30 && ddy < 6 && e.cool <= 0) { startMove(e, MOVES.slash); e.cool = rnd(50, 80); return; }
          if (e.cool <= 0 && ddy < 4 && dist > 60 && dist < 260) { setState(e, 'aim'); e.cool = rnd(120, 170) / ST.diff; return; }
          stepToward(e, p.x + side * 140, p.y, e.def.speed);
          return;
        }
        if (ai === 'thin' && e.mode === 'approach' && dist > 45 && dist < 95 && ddy < 6 && e.cool <= 0 && Math.random() < 0.05) {
          setState(e, 'dashkick'); sfx('whoosh'); return;
        }
        if (e.def.knives && dist > 80 && ddy < 8 && e.cool <= 0 && Math.random() < 0.04) { setState(e, 'throwKnife'); return; }
        if (ai === 'brute' && dist > 70 && dist < 190 && ddy < 8 && e.cool <= 0 && Math.random() < (boss ? 0.05 : 0.03)) {
          setState(e, 'charge'); sfx('charge'); return;
        }
        if (e.mode === 'approach' && dist < e.def.range + 6 && ddy < 6 && e.cool <= 0 && p.state !== 'down') {
          const m = MOVES[e.def.attacks[Math.random() * e.def.attacks.length | 0]];
          startMove(e, m); if (Math.random() < 0.3) evoice(e, 'attack'); e.cool = rnd(50, 100) / (boss ? 1.6 * spMul : ST.diff); return;
        }
        if (e.mode === 'approach') stepToward(e, p.x + side * (e.def.range - 4), p.y, e.def.speed * spMul);
        else stepToward(e, p.x + side * 95, e.hoverY, e.def.speed * 0.7);
        return;
      }
      case 'attack': {
        const m = e.move;
        if (e.t >= m.start && e.t < m.start + m.active) resolveHits(e, m);
        if (e.t === m.start) sfx('whoosh');
        if (e.t >= m.start + m.active + m.rec) setState(e, 'idle');
        return;
      }
      case 'snipeAim':
        if (e.t === 2 && p) { shoot({ type: 'snipe', x: p.x, y: p.y, z: 0, fuse: 52, from: e, life: 999 }); sfx('select'); }
        if (e.t > 58) setState(e, 'idle');
        return;
      case 'flame':
        // strumień ognia: rośnie do 62 px, co 12 klatek zostawia płonącą plamę na podłodze
        if (e.t > 16 && e.t < 70) {
          const reach = 22 + Math.min(40, (e.t - 16) * 2);
          if (e.t % 4 === 0) sfx('whoosh');
          if (e.t % 12 === 0) addFire(e.x + e.face * reach, e.y);
          if (e.t % 15 === 0) e.hitSet = null;
          resolveHits(e, { abs: true, reach, dmg: 6, knock: false, depth: 9, snd: 'zap' });
        }
        if (e.t > 84) setState(e, 'idle');
        return;
      case 'throwNet':
        if (e.t === 10) { shoot({ type: 'net', x: e.x + e.face * 12, y: e.y, z: 24 * scaleOf(e), vx: e.face * 3.6, dmg: 0, knock: false, life: 120 }); sfx('whoosh'); }
        if (e.t > 22) setState(e, 'idle');
        return;
      case 'lob':
        if (e.t === 14 && p) {
          const air = 28;
          shoot({ type: 'dynamite', x: e.x + e.face * 8, y: e.y, z: 30, vx: (p.x - e.x) / air, vy: (p.y - e.y) / air, vz: 3.6 });
          sfx('whoosh');
        }
        if (e.t > 28) setState(e, 'idle');
        return;
      case 'aim':
        if (e.t === 2) sfx('select');
        if (e.t === 40) { shoot({ type: 'bullet', x: e.x + e.face * 26, y: e.y, z: 22 * scaleOf(e), vx: e.face * 5, dmg: Math.round(10 * e.dmgMul) }); sfx('gun'); G.fx.push({ type: 'muzzle', x: e.x + e.face * 28, y: e.y, z: 24, t: 0, life: 5 }); }
        if (e.t > 52) setState(e, 'idle');
        return;
      case 'throwKnife':
        if (e.t === 10) { [-8, 0, 8].forEach(o => shoot({ type: 'knife', x: e.x + e.face * 12, y: e.y + o, z: 24 * scaleOf(e), vx: e.face * 4.2, dmg: 8, knock: false })); sfx('whoosh'); }
        if (e.t > 24) { setState(e, 'idle'); e.cool = rnd(60, 100); }
        return;
      case 'dashkick':
        if (e.t < 10) return;
        e.x += e.face * 4; e.animT++;
        if (e.t < 28) resolveHits(e, { reach: 20, dmg: 8, knock: true, snd: 'heavy' });
        if (e.t > 28 || e.x < G.camX + 6 || e.x > G.camX + W - 6) { setState(e, 'recover'); e.cool = rnd(80, 140) / ST.diff; }
        return;
      case 'charge':
        if (e.t < 26) { e.x += (e.t % 4 < 2 ? 0.6 : -0.6); return; }
        e.x += e.face * (boss ? 3.8 : 3.2); e.animT++;
        resolveHits(e, { reach: 18, dmg: 13, knock: true, snd: 'heavy', shake: 4 });
        if (e.t > 100 || e.x < G.camX + 10 || e.x > G.camX + W - 10) { setState(e, 'recover'); e.cool = rnd(90, 150) / ST.diff; }
        return;
      case 'recover': if (e.t > 26) setState(e, 'idle'); return;
    }
  }

  // =============================================================== AI BESTII
  function beastTarget(r) {
    let best = null, bd = 1e9;
    for (const a of G.actors) {
      if (!hostile(r, a) || !hittable(a)) continue;
      const d = Math.abs(a.x - r.x) + Math.abs(a.y - r.y) * 2 + (a.kind === 'player' ? -40 : 0);
      if (d < bd) { bd = d; best = a; }
    }
    return best;
  }
  function updateRaptor(r) {
    r.t++; r.cool--; r.animT++;
    if (updateCommon(r)) return;
    const best = beastTarget(r);
    switch (r.state) {
      case 'enter':
        enterScreen(r); r.x += r.face * 0.8;
        if (r.state === 'idle') { setState(r, 'roar'); sfx('screech'); }
        return;
      case 'roar': if (r.t > 36) setState(r, 'idle'); return;
      case 'idle': case 'walk': case 'run': {
        if (!best) { r.state = 'idle'; return; }
        const dist = Math.abs(best.x - r.x), ddy = Math.abs(best.y - r.y);
        r.face = best.x > r.x ? 1 : -1;
        if (dist < 36 && ddy < 7 && r.cool <= 0) { setState(r, 'bite'); r.cool = rnd(40, 70) / ST.diff; return; }
        const run = dist > 90;
        const tx = best.x - r.face * 28, ty = best.y;
        const sp = r.def.speed * (run ? 2 : 1);
        const mx = Math.abs(tx - r.x) > 3 ? Math.sign(tx - r.x) : 0, my = Math.abs(ty - r.y) > 2 ? Math.sign(ty - r.y) : 0;
        r.x += mx * sp; r.y += my * sp * 0.6;
        r.state = (mx || my) ? (run ? 'run' : 'walk') : 'idle';
        return;
      }
      case 'bite':
        if (r.t === 6) sfx('screech');
        if (r.t >= 8 && r.t < 13) { r.x += r.face * 2; if (r.t === 9) sfx('bite'); resolveHits(r, { reach: 34, dmg: 9, snd: 'hit' }); }
        if (r.t > 28) setState(r, 'idle');
        return;
    }
  }
  function updatePachy(r) {
    r.t++; r.cool--; r.animT++;
    if (updateCommon(r)) return;
    const best = beastTarget(r);
    switch (r.state) {
      case 'enter':
        enterScreen(r);
        if (r.state === 'idle') { setState(r, 'roar'); sfx('roar'); }
        return;
      case 'roar': if (r.t > 30) setState(r, 'idle'); return;
      case 'idle': case 'walk': {
        if (!best) { r.state = 'idle'; return; }
        const dist = Math.abs(best.x - r.x), ddy = Math.abs(best.y - r.y);
        r.face = best.x > r.x ? 1 : -1;
        if (ddy < 8 && dist > 40 && dist < 220 && r.cool <= 0) { setState(r, 'windup'); sfx('charge'); return; }
        if (dist < 34 && ddy < 8 && r.cool <= 0) { setState(r, 'windup'); r.t = 14; return; }
        const tx = best.x - r.face * 90, ty = best.y;
        const mx = Math.abs(tx - r.x) > 3 ? Math.sign(tx - r.x) : 0, my = Math.abs(ty - r.y) > 2 ? Math.sign(ty - r.y) : 0;
        r.x += mx * r.def.speed; r.y += my * r.def.speed * 0.7;
        r.state = (mx || my) ? 'walk' : 'idle';
        return;
      }
      case 'windup':
        if (r.t % 6 === 0) dust(r.x - r.face * 6, r.y);
        if (r.t > 22) setState(r, 'charge');
        return;
      case 'charge':
        r.x += r.face * (r.def.chargeSpeed || 4.2);
        if (r.t % 5 === 0) dust(r.x - r.face * 10, r.y);
        resolveHits(r, { reach: 30, dmg: r.def.chargeDmg || 13, knock: true, snd: 'heavy', shake: 4 });
        if (r.t > 70 || r.x < G.camX + 10 || r.x > G.camX + W - 10) { setState(r, 'recover'); r.cool = rnd(70, 120) / ST.diff; }
        return;
      case 'recover': if (r.t > 30) setState(r, 'idle'); return;
    }
  }

  // =============================================================== AI PARAZAUROLOFA
  function updatePara(r) {
    r.t++; r.cool--; r.animT++;
    if (updateCommon(r)) return;
    const best = beastTarget(r);
    switch (r.state) {
      case 'enter': enterScreen(r); if (r.state === 'idle') { setState(r, 'roar'); sfx('roar'); } return;
      case 'idle': case 'walk': case 'run': {
        if (!best) { r.state = 'idle'; return; }
        const dist = Math.abs(best.x - r.x), ddy = Math.abs(best.y - r.y);
        r.face = best.x > r.x ? 1 : -1;
        if (r.cool <= 0 && dist < 120 && Math.random() < 0.02) { setState(r, 'roar'); r.cool = rnd(160, 220) / ST.diff; return; }
        if (dist < 34 && ddy < 8 && r.cool <= 0) { setState(r, 'bite'); r.cool = rnd(50, 80) / ST.diff; return; }
        const run = dist > 90, sp = r.def.speed * (run ? 1.7 : 1);
        const tx = best.x - r.face * 28, mx = Math.abs(tx - r.x) > 3 ? Math.sign(tx - r.x) : 0, my = Math.abs(best.y - r.y) > 2 ? Math.sign(best.y - r.y) : 0;
        r.x += mx * sp; r.y += my * sp * 0.6;
        r.state = (mx || my) ? (run ? 'run' : 'walk') : 'idle';
        return;
      }
      case 'roar':
        if (r.t === 8) {
          sfx('roar'); G.shake = 8;
          for (const t of G.actors) if (hostile(r, t) && hittable(t) && t.z < 4 && Math.abs(t.x - r.x) < 110 && Math.abs(t.y - r.y) < 30) {
            if (t.kind === 'player' || (t.kind === 'human' && !isBoss(t))) { setState(t, 'stun'); t.flash = 4; }
          }
        }
        if (r.t > 46) setState(r, 'idle');
        return;
      case 'bite':
        if (r.t >= 8 && r.t < 13) { r.x += r.face * 1.5; resolveHits(r, { reach: 30, dmg: 10, knock: true, snd: 'heavy' }); }
        if (r.t > 26) setState(r, 'idle');
        return;
    }
  }

  // =============================================================== AI PTERANODONA
  function updatePtera(r) {
    r.t++; r.cool--; r.animT++;
    if (updateCommon(r)) return;
    const ps = players().filter(q => q.state !== 'dead');
    const tgt = ps.length ? ps.reduce((a, b) => Math.abs(a.x - r.x) < Math.abs(b.x - r.x) ? a : b) : null;
    switch (r.state) {
      case 'enter':
        r.z = 80; r.x += r.face * 2; r.animT++;
        if (r.x > G.camX + 30 && r.x < G.camX + W - 30) { setState(r, 'fly'); sfx('screech'); }
        return;
      case 'idle': setState(r, 'fly'); return;
      case 'fly': {
        r.z += ((76 + Math.sin(r.t * 0.05) * 6) - r.z) * 0.08;
        if (!tgt) return;
        const tx = tgt.x + Math.sin(r.t * 0.02) * 60;
        r.vx = clamp((tx - r.x) * 0.03, -r.def.speed * 1.5, r.def.speed * 1.5);
        r.x += r.vx; r.y += Math.sign(tgt.y - r.y) * 0.4;
        if (Math.abs(r.vx) > 0.2) r.face = r.vx >= 0 ? 1 : -1;
        if (r.cool <= 0 && Math.abs(tgt.x - r.x) < 14) {
          if (Math.random() < 0.6) { shoot({ type: 'rock', x: r.x, y: tgt.y, z: r.z - 8, vz: 0, life: 999 }); sfx('whoosh'); r.cool = rnd(110, 160) / ST.diff; }
          else { setState(r, 'swoop'); r.face = tgt.x >= r.x ? 1 : -1; r.cool = rnd(140, 200) / ST.diff; sfx('screech'); }
        }
        return;
      }
      case 'swoop': {
        const k = Math.min(1, r.t / 50);
        r.z = 76 - Math.sin(k * Math.PI) * 60;
        r.x += r.face * 2.6;
        if (r.z < 34) resolveHits(r, { reach: 24, dmg: 9, knock: true, snd: 'bite', height: 30 });
        if (r.t > 50) setState(r, 'fly');
        return;
      }
    }
  }

  // =============================================================== AI STAREGO KŁA
  function updateRex(b) {
    b.t++; b.cool--; b.animT++;
    if (updateCommon(b)) return;
    // druga faza bestii: wściekłość — częstsze ataki
    if (!b.phase2 && b.hp > 0 && b.hp < b.maxHp * 0.3 && b.state !== 'enter' && b.state !== 'intro') {
      b.phase2 = true; sfx('roar'); G.shake = 16; G.popups.push({ x: b.x, y: b.y - 110, txt: 'WŚCIEKŁOŚĆ!', t: 0, col: '#ff4020' });
    }
    if (b.phase2) b.cool--;
    const p = nearestPlayer(b);
    const enraged = b.hp < b.maxHp * 0.5;
    if (enraged && !b.called) {
      b.called = true; setState(b, 'roar');
      G.pending.push({ type: 'raptor', side: 'L', y: 175, delay: 40 }, { type: 'raptor', side: 'R', y: 205, delay: 70 });
      return;
    }
    switch (b.state) {
      case 'enter':
        enterScreen(b);
        if (b.state === 'idle') { setState(b, 'roar'); G.introBoss = b; }
        return;
      case 'roar':
        if (b.t === 4) { sfx('roar'); G.shake = 30; }
        if (b.t === 10) for (const t of players()) if (hittable(t) && t.z < 2 && Math.abs(t.x - b.x) < 240) { setState(t, 'stun'); t.flash = 4; }
        if (b.t > 70) { setState(b, 'idle'); G.introBoss = null; }
        return;
      case 'idle': case 'walk': {
        if (!p) { b.state = 'idle'; return; }
        const dx = p.x - b.x, dist = Math.abs(dx), ddy = Math.abs(p.y - b.y);
        const behind = Math.sign(dx) !== b.face;
        if (b.cool <= 0) {
          // ataki specjalne: Kolos — deszcz bursztynowych odłamków, Zębacz — atak z rynny ściekowej
          if (b.type === 'kolos' && Math.random() < (b.phase2 ? 0.5 : 0.3)) { setState(b, 'shards'); b.cool = enraged ? 60 : 80; return; }
          if (b.type === 'deino' && dist > 60 && Math.random() < (b.phase2 ? 0.5 : 0.3)) { setState(b, 'submerge'); b.cool = enraged ? 70 : 100; return; }
          if (behind && dist < 90 && ddy < 18) { setState(b, 'tail'); b.cool = enraged ? 30 : 50; return; }
          if (!behind && dist < 90 && ddy < 18) { startMove(b, MOVES.rexBite); b.cool = enraged ? 35 : 55; return; }
          if (ddy < 20 && dist > 120 && Math.random() < 0.5) { setState(b, 'charge'); b.cool = enraged ? 60 : 90; return; }
          if (Math.random() < 0.15) { setState(b, 'roar'); b.cool = 80; return; }
          b.cool = 20;
        }
        if (!behind || dist > 120) b.face = dx >= 0 ? 1 : -1;
        stepToward(b, clamp(p.x - b.face * 70, G.camX + 90, G.camX + W - 90), p.y, b.def.speed * (enraged ? 1.3 : 1));
        return;
      }
      case 'attack': {
        const m = b.move;
        if (b.t === 2) sfx('screech');
        if (b.t >= m.start && b.t < m.start + m.active) { b.x += b.face * 1.5; resolveHits(b, m); if (b.t === m.start) sfx('bite'); }
        if (b.t >= m.start + m.active + m.rec) setState(b, 'idle');
        return;
      }
      case 'tail': {
        const m = MOVES.rexTail;
        if (b.t >= m.start && b.t < m.start + m.active) {
          if (b.t === m.start) sfx('whoosh');
          b.face = -b.face; resolveHits(b, m); b.face = -b.face;
        }
        if (b.t >= m.start + m.active + m.rec) setState(b, 'idle');
        return;
      }
      case 'charge':
        if (b.t < 34) { if (b.t === 1) sfx('roar'); b.x += (b.t % 4 < 2 ? 1 : -1); return; }
        b.x += b.face * (enraged ? 5 : 4.2);
        if (b.t % 5 === 0) { dust(b.x - b.face * 30, b.y); G.shake = 3; }
        resolveHits(b, { abs: true, reach: 50, dmg: 18, knock: true, snd: 'heavy', shake: 8, depth: 16 });
        if (b.t > 140 || b.x < G.camX + 92 || b.x > G.camX + W - 92) {
          b.x = clamp(b.x, G.camX + 90, G.camX + W - 90);
          setState(b, 'dazed'); sfx('slam'); G.shake = 14; spark(b.x + b.face * 40, b.y, 50, true);
          G.popups.push({ x: b.x, y: b.y - 80, txt: 'OGŁUSZONY!', t: 0, col: '#ffe040' });
        }
        return;
      case 'dazed': if (b.t > 90) setState(b, 'idle'); return;
      case 'shards':
        // ryk i tupnięcie, potem odłamki spadają w cienie pod graczami
        if (b.t === 1) { sfx('roar'); G.shake = 12; }
        if (b.t >= 12 && b.t <= 66 && b.t % 9 === 3) {
          for (const q of players()) if (q.alive) (G.drops = G.drops || []).push({ x: clamp(q.x + rnd(-36, 36), G.camX + 16, G.camX + W - 16), y: clamp(q.y + rnd(-10, 10), FLOOR_TOP + 8, FLOOR_BOTTOM), t: 0 });
        }
        if (b.t > 80) setState(b, 'idle');
        return;
      case 'submerge':
        // zanurza się w rynnie ściekowej
        b.invuln = Math.max(b.invuln, 2);
        if (b.t === 1) { sfx('screech'); G.shake = 6; }
        b.y += (FLOOR_TOP + 8 - b.y) * 0.15; b.alpha = Math.max(0, 1 - b.t / 18);
        if (b.t % 4 === 0) dust(b.x + rnd(-20, 20), b.y);
        if (b.t > 18) { b.alpha = 0; setState(b, 'swim'); b.alpha = 0; }
        return;
      case 'swim':
        // pod powierzchnią — widać tylko bąbelki sunące za graczem
        b.invuln = Math.max(b.invuln, 2); b.alpha = 0;
        if (p) { b.x += clamp(p.x - b.x, -3.2, 3.2); b.y += clamp(p.y - b.y, -1.3, 1.3); b.face = p.x >= b.x ? 1 : -1; }
        if (b.t % 10 === 0) sfx('land');
        if (b.t > 75) { setState(b, 'leap'); b.alpha = 1; b.z = 1; b.vz = 6.4; sfx('roar'); G.shake = 8; }
        return;
      case 'leap':
        b.invuln = Math.max(b.invuln, 2);
        b.z += b.vz; b.vz -= GRAV;
        if (b.z <= 0) {
          b.z = 0; b.vz = 0; sfx('slam'); G.shake = 16; dust(b.x - 30, b.y); dust(b.x + 30, b.y);
          G.fx.push({ type: 'shock', x: b.x, y: b.y, z: 0, t: 0, life: 22, r: 60 });
          for (const q of players()) if (hittable(q) && q.z < 12 && Math.abs(q.x - b.x) < 56 && Math.abs(q.y - b.y) < 18) hurt(q, 18, q.x >= b.x ? 1 : -1, true, b, { unblock: true });
          setState(b, 'dazed'); b.t = 40;
          G.popups.push({ x: b.x, y: b.y - 80, txt: 'TERAZ!', t: 0, col: '#ffe040' });
        }
        return;
    }
  }

  // =============================================================== NOWI WROGOWIE I INTERAKCJE
  // Jeździec na raptorze, podpalacz (płonąca podłoga), lotniarz (zrzuca sieci), koparka Brygadzisty,
  // wrzucanie wrogów w zagrożenia oraz podnoszenie i rzucanie beczkami.

  // ---- jeździec: po przewróceniu spada z siodła, a raptor od razu nadaje się do dosiadania
  function ejectRider(r, src) {
    if (!r.rider) return;
    const g = makeEnemy('grunt', r.x - r.face * 8, r.y);
    g.b = r.rider; r.rider = null;
    setState(g, 'fall'); g.z = 18; g.vz = 3; g.vx = -r.face * 1.6; g.bounced = false; g.face = r.face;
    G.actors.push(g);
    r.team = 'beast'; r.tame = true; r.hp = 0;
    onDeath(r, src);
    G.popups.push({ x: r.x, y: r.y - 50, txt: 'ZRZUCONY Z SIODŁA!', t: 0, col: '#ffe080' });
    sfx('screech');
  }

  // ---- ogień podpalacza: płonące plamy ranią każdego (graczy i wrogów), kto w nie wejdzie
  function addFire(x, y) {
    const F = G.fires = G.fires || [];
    if (F.some(f => Math.abs(f.x - x) < 10 && Math.abs(f.y - y) < 6)) return;
    F.push({ x, y: clamp(y, FLOOR_TOP + 8, FLOOR_BOTTOM), t: 0, life: 260 });
  }
  function updateFires() {
    const F = G.fires; if (!F) return;
    for (let i = F.length - 1; i >= 0; i--) {
      const f = F[i];
      if (++f.t > f.life) { F.splice(i, 1); continue; }
      for (const a of G.actors) {
        if (!a.alive || a.z > 4 || isBoss(a) || !hittable(a) || (a.fireT || 0) > G.frame) continue;
        if (Math.abs(a.x - f.x) < 12 && Math.abs(a.y - f.y) < 7) {
          a.fireT = G.frame + 45; hurt(a, 6, Math.random() < 0.5 ? 1 : -1, false, null, { unblock: true });
          if (a.kind === 'player') G.popups.push({ x: a.x, y: a.y - 46, txt: 'GORĄCO!', t: 0, col: '#ff9040' });
        }
      }
    }
  }
  function drawFires() {
    for (const f of G.fires || []) {
      const x = f.x - G.camX, k = 1 - f.t / f.life, s = Math.min(1, f.t / 12) * (0.6 + 0.4 * k);
      if (x < -20 || x > W + 20) continue;
      ctx.fillStyle = 'rgba(40,10,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, f.y, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
      for (let j = 0; j < 4; j++) {
        const p = (G.frame * 0.06 + j / 4 + f.x * 0.01) % 1, fx = x - 8 + j * 5 + Math.sin(G.frame * 0.3 + j) * 1.5;
        ctx.fillStyle = p < 0.4 ? 'rgba(255,230,120,0.9)' : p < 0.7 ? 'rgba(255,140,40,0.8)' : 'rgba(200,50,20,0.6)';
        ctx.beginPath(); ctx.arc(fx, f.y - 2 - p * 14 * s, (4 * (1 - p) + 1) * s, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // ---- lotniarz: przelatuje wysoko i zrzuca sieć nad graczem; po trzech przelotach ląduje i walczy wręcz
  function updateGlider(g) {
    g.t++; g.animT++;
    if (g.state === 'hurt' && g.z > 4) { setState(g, 'fall'); g.vz = 1; g.vx = 0; g.bounced = false; }   // trafiony w powietrzu spada
    if (g.state === 'fall' || g.state === 'thrown') g.fell = true;
    if (updateCommon(g)) return;
    if (g.fell || g.pass >= 3) { g.kind = 'human'; g.z = 0; setState(g, 'idle'); return; }   // dalej zwykła AI ludzi
    if (g.state === 'enter') { setState(g, 'glide'); g.pass = 0; g.z = 64; g.face = g.x < G.camX + W / 2 ? 1 : -1; }
    const alt = [64, 46, 30][Math.min(g.pass, 2)];
    g.x += g.face * 1.9; g.z += (alt - g.z) * 0.05;
    const tp = nearestPlayer(g);
    if (tp) {
      g.y += clamp(tp.y - g.y, -0.5, 0.5);
      if (!g.dropped && Math.abs(tp.x - g.x) < 10 && tp.state !== 'netted') {
        g.dropped = true; sfx('whoosh');
        shoot({ type: 'netdrop', x: g.x, y: tp.y, z: g.z, life: 200 });
      }
    }
    if ((g.face > 0 && g.x > G.camX + W + 30) || (g.face < 0 && g.x < G.camX - 30)) {
      g.pass++; g.face = -g.face; g.dropped = false;
      if (g.pass >= 3) { g.x = clamp(g.x, G.camX + 20, G.camX + W - 20); setState(g, 'fall'); g.vz = 0.5; g.vx = g.face; g.bounced = true; g.hop = true; }
    }
  }
  function drawGlider(a, sx, sy, flash) {
    SP.drawFigure(ctx, a.b, a.state === 'glide' ? P.hammerUp[0] : poseOf(a), sx, sy, a.face, { flash, hurtFace: a.state !== 'glide' });
    if (a.state !== 'glide') return;
    const top = sy - 62 * scaleOf(a);
    ctx.fillStyle = '#140c10';
    ctx.beginPath(); ctx.moveTo(sx - 34, top + 6); ctx.lineTo(sx + a.face * 30, top - 6); ctx.lineTo(sx + 34, top + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#c8402a';
    ctx.beginPath(); ctx.moveTo(sx - 31, top + 4); ctx.lineTo(sx + a.face * 28, top - 4); ctx.lineTo(sx + 31, top + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f0d040'; ctx.beginPath(); ctx.moveTo(sx - 12, top + 4); ctx.lineTo(sx + a.face * 10, top - 1); ctx.lineTo(sx + 12, top + 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5a5050'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx - 20, top + 6); ctx.lineTo(sx, sy - 42); ctx.lineTo(sx + 20, top + 6); ctx.stroke();
  }

  // ---- koparka Brygadzisty: zamach łyżką z góry (pole rażenia z przodu) i szarża z łyżką przy ziemi
  function updateDigger(d) {
    d.t++; d.cool--; d.animT++; d.z = 0;
    if (d.hp <= 0) {
      if (!d.wrecked) {
        d.wrecked = true; setState(d, 'wreck'); G.shake = 20; sfx('explode');
        for (let i = 0; i < 3; i++) G.fx.push({ type: 'boom', x: d.x + rnd(-30, 30), y: d.y, z: rnd(10, 40), t: 0, life: 24 + i * 8 });
        // Brygadzista wylatuje z kabiny (już pokonany — tylko efekt)
        const f = makeEnemy('brute', d.x, d.y + 4); f.b = d.b; f.hp = 0; f.dying = true;
        setState(f, 'fall'); f.z = 30; f.vz = 4; f.vx = -d.face * 2; f.bounced = false; G.actors.push(f);
        G.popups.push({ x: d.x, y: d.y - 90, txt: 'KOPARKA ZEZŁOMOWANA!', t: 0, col: '#ffe040' });
        unlock('scrapper');
      }
      d.state = 'wreck';
      return;
    }
    const p = nearestPlayer(d);
    switch (d.state) {
      case 'enter':
        d.face = -1; d.x -= 1.2; d.animT++;
        if (d.x < G.camX + W - 80) { setState(d, 'intro'); G.introBoss = d; sfx('charge'); G.shake = 8; }
        return;
      case 'intro': if (d.t > 80) { setState(d, 'idle'); G.introBoss = null; d.cool = 40; } return;
      case 'idle': case 'walk': {
        if (!p) return;
        const dx = p.x - d.x, dist = Math.abs(dx), ddy = Math.abs(p.y - d.y);
        d.face = dx >= 0 ? 1 : -1;
        if (d.cool <= 0) {
          if (dist < 120 && dist > 40 && ddy < 22) { setState(d, 'slam'); sfx('charge'); return; }
          if (ddy < 14) { setState(d, 'sweep'); sfx('charge'); return; }
          d.cool = 20;
        }
        stepToward(d, clamp(p.x - d.face * 85, G.camX + 50, G.camX + W - 50), p.y, d.def.speed);
        return;
      }
      case 'slam':
        if (d.t === 40) {
          const hx = d.x + d.face * 72;
          G.shake = 14; sfx('slam'); dust(hx - 10, d.y); dust(hx + 10, d.y);
          G.fx.push({ type: 'shock', x: hx, y: d.y, z: 0, t: 0, life: 22, r: 40 });
          for (const q of G.players) if (hittable(q) && q.z < 20 && Math.abs(q.x - hx) < 34 && Math.abs(q.y - d.y) < 16) hurt(q, Math.round(20 * d.dmgMul), d.face, true, d, { unblock: true });
          for (const pr of G.props) if (pr.hp > 0 && Math.abs(pr.x - hx) < 34 && Math.abs(pr.y - d.y) < 16) hitProp(pr, d.face, d);
        }
        if (d.t > 72) { setState(d, 'idle'); d.cool = rnd(60, 90); }
        return;
      case 'sweep':
        if (d.t < 24) { d.x += d.t % 4 < 2 ? 0.8 : -0.8; return; }
        d.x += d.face * 3.2; d.animT++;
        if (d.t % 5 === 0) dust(d.x - d.face * 30, d.y);
        resolveHits(d, { abs: true, reach: 58, dmg: Math.round(14 * d.dmgMul), knock: true, snd: 'heavy', shake: 6, depth: 14 });
        if (d.t > 80 || d.x < G.camX + 50 || d.x > G.camX + W - 50) { d.x = clamp(d.x, G.camX + 50, G.camX + W - 50); setState(d, 'idle'); d.cool = rnd(70, 100); }
        return;
      default: setState(d, 'idle');
    }
  }
  function drawDigger(a, sx, sy, flash) {
    const f = a.face, wreck = a.state === 'wreck';
    const body = flash ? '#fff' : wreck ? '#4a4440' : '#e0a020', dark = wreck ? '#2a2420' : '#8a5a10';
    const shake = (a.state === 'sweep' || a.state === 'walk') && a.animT % 4 < 2 ? 1 : 0;
    sy -= shake;
    // gąsienice
    ctx.fillStyle = '#140c10'; ctx.fillRect(sx - 40, sy - 16, 80, 16);
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(sx - 38, sy - 14, 76, 12);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#5a5a5a'; ctx.beginPath(); ctx.arc(sx - 30 + i * 12, sy - 8, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#222'; for (let i = 0; i < 10; i++) ctx.fillRect(sx - 38 + ((i * 8 + a.animT) % 76), sy - 15, 2, 2);
    // nadwozie i kabina z Brygadzistą
    ctx.fillStyle = '#140c10'; ctx.fillRect(sx - 34, sy - 42, 60, 28);
    ctx.fillStyle = body; ctx.fillRect(sx - 33, sy - 41, 58, 26);
    ctx.fillStyle = dark; ctx.fillRect(sx - 33, sy - 20, 58, 5);
    const cx = sx - f * 6;
    ctx.fillStyle = '#140c10'; ctx.fillRect(cx - 14, sy - 70, 28, 30);
    ctx.fillStyle = body; ctx.fillRect(cx - 13, sy - 69, 26, 28);
    ctx.fillStyle = wreck ? '#222' : '#9fd0e0'; ctx.fillRect(cx - 10, sy - 66, 20, 13);
    if (!wreck) { ctx.fillStyle = '#c89070'; ctx.beginPath(); ctx.arc(cx, sy - 58, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f0d040'; ctx.fillRect(cx - 5, sy - 64, 10, 3); }
    ctx.fillStyle = '#140c10'; ctx.fillRect(sx - f * 30 - 6, sy - 48, 12, 8); ctx.fillStyle = '#5a5a5a'; ctx.fillRect(sx - f * 30 - 5, sy - 47, 10, 6);   // przeciwwaga
    // ramię i łyżka (kąty zależne od stanu)
    let a1 = -0.75, a2 = 1.25;
    if (a.state === 'slam') { const k = a.t < 36 ? Math.min(1, a.t / 30) : Math.max(0, 1 - (a.t - 36) / 4); a1 = -0.75 - k * 0.7; a2 = 1.25 - k * 0.9; if (a.t >= 38 && a.t < 72) { a1 = -0.15; a2 = 1.6; } }
    if (a.state === 'sweep') { a1 = -0.05; a2 = 1.55; }
    if (wreck) { a1 = 0.3; a2 = 1.2; }
    const bx = sx + f * 18, by = sy - 40;
    const ex = bx + f * Math.cos(a1) * 44, ey = by + Math.sin(a1) * 44;
    const tx = ex + f * Math.cos(a1 + a2) * 34, ty = ey + Math.sin(a1 + a2) * 34;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#140c10'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.strokeStyle = body; ctx.lineWidth = 6; ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = '#140c10'; ctx.beginPath(); ctx.moveTo(tx - f * 4, ty - 8); ctx.lineTo(tx + f * 16, ty - 4); ctx.lineTo(tx + f * 14, ty + 10); ctx.lineTo(tx - f * 4, ty + 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = wreck ? '#3a3a3a' : '#7a7a80'; ctx.beginPath(); ctx.moveTo(tx - f * 2, ty - 6); ctx.lineTo(tx + f * 14, ty - 3); ctx.lineTo(tx + f * 12, ty + 8); ctx.lineTo(tx - f * 2, ty + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d0d0d0'; for (let i = 0; i < 3; i++) ctx.fillRect(tx + f * (13 + 0) - 1, ty - 2 + i * 4, 3 * f, 2);
    if (wreck && G.frame % 6 < 3) { ctx.fillStyle = 'rgba(60,50,50,0.6)'; ctx.beginPath(); ctx.arc(cx + Math.sin(G.frame * 0.1) * 6, sy - 80 - (G.frame % 30), 8, 0, Math.PI * 2); ctx.fill(); }
  }

  // ---- wrzucanie wrogów w zagrożenia: lawa, ścieki, morze przy przypływie, zrzucenie z pociągu
  function ringOut(a) {
    let label = null, kind = null;
    for (const h of ST.HAZARDS || []) if (a.x > h.x0 && a.x < h.x1 && a.y > h.y0 && a.y < h.y1) { label = h.label ? 'SPŁUKANY!' : 'W LAWIE!'; kind = h.label ? 'sludge' : 'lava'; }
    if (!label && G.tideY > FLOOR_TOP + 10 && a.y < G.tideY - 2) { label = 'SPŁUKANY!'; kind = 'sea'; }
    if (!label && ST.deck && (a.y < ST.deck.y0 - 2 || a.y > ST.deck.y1 + 2)) { label = 'ZRZUCONY!'; kind = 'train'; }
    if (!label) return false;
    const by = a.lastPlayer;
    a.hp = 0; onDeath(a, by);
    if (by) addScore(by, 1000);
    G.popups.push({ x: a.x, y: a.y - 40, txt: label + ' +1000', t: 0, col: kind === 'lava' ? '#ff9040' : kind === 'train' ? '#ffe080' : '#a0ff60' });
    if (kind === 'lava') { sfx('zap'); for (let i = 0; i < 8; i++) G.fx.push({ type: 'debris', x: a.x, y: a.y, z: 4, vx: rnd(-1.5, 1.5), vz: rnd(1, 4), t: 0, life: 30, col: i % 2 ? '#ffb030' : '#ff5a14' }); }
    else if (kind === 'train') { sfx('whoosh'); G.fx.push({ type: 'dust', x: a.x, y: a.y, z: 0, t: 0, life: 22 }); }
    else { sfx('land'); for (let i = 0; i < 8; i++) G.fx.push({ type: 'debris', x: a.x, y: a.y, z: 2, vx: rnd(-1.2, 1.2), vz: rnd(1.5, 3.5), t: 0, life: 30, col: kind === 'sea' ? '#c8e0f0' : '#8ad040' }); }
    a.remove = true;
    unlock('ringout');
    return true;
  }

  // ---- beczki i skrzynie: ▼ + ATAK podnosi, ATAK/SKOK rzuca
  const CARRYABLE = ['barrel', 'crate', 'fuel'];
  function nearProp(p) {
    return G.props.find(pr => pr.hp > 0 && CARRYABLE.includes(pr.kind) && Math.abs(pr.x - p.x) < 26 && Math.abs(pr.y - p.y) < 12);
  }
  function liftProp(p, pr) {
    G.props.splice(G.props.indexOf(pr), 1);
    p.carry = { kind: pr.kind, drop: pr.drop, secret: pr.secret };
    setState(p, 'lift'); p.vx = 0; sfx('grab');
  }
  // rozbicie niesionej albo rzuconej beczki (z łupem; paliwo wybucha)
  function breakCarried(c, x, y, owner) {
    sfx('crash');
    for (let i = 0; i < 10; i++) G.fx.push({ type: 'debris', x: x + rnd(-8, 8), y, z: rnd(4, 20), vx: rnd(-2, 2), vz: rnd(1, 4), t: 0, life: 50, col: PROP_COL[c.kind] || '#8a5a2b' });
    if (c.kind === 'fuel') explode(x, y, owner, { r: 46, dmg: 24 });
    if (c.drop) G.items.push({ type: c.drop, x, y, z: 12, vz: 2.5, t: 0, ammo: c.drop === 'bottle' ? 2 : c.drop === 'rifle' ? 8 : 3, dur: 16 });
  }
  function dropCarry(p) {
    if (!p.carry) return;
    breakCarried(p.carry, p.x + p.face * 10, p.y, p);
    p.carry = null;
  }
  function updateFlyingProp(s) {
    s.x += s.vx; s.vz -= GRAV * 0.6; s.z += s.vz;
    for (const t of G.actors) {
      if (s.hit.has(t) || !hostile(s.owner, t) || !hittable(t)) continue;
      if (Math.abs(t.x - s.x) < 14 + t.rad * 0.5 && Math.abs(t.y - s.y) < 12 + (t.depthR || 0) && t.z < s.z + 24) {
        s.hit.add(t); hurt(t, 18, Math.sign(s.vx) || 1, true, s.owner, { unblock: true, throw: true });
        if (s.hit.size >= 3) unlock('bowling');
        spark(t.x, t.y, hitY(t), true); sfx('heavy'); G.hitstop = 4;
        if (s.kind === 'fuel') s.boom = true;
      }
    }
    return s.boom || s.z <= 0 || s.x < G.camX - 40 || s.x > G.camX + W + 40;
  }
  function putDown(p) {
    const c = p.carry; p.carry = null;
    G.props.push({ x: p.x + p.face * 16, y: p.y, kind: c.kind, drop: c.drop, secret: c.secret, hp: PROP_HP[c.kind] || 2, shake: 6 });
    sfx('land'); setState(p, 'idle');
  }
  function throwCarry(p) {
    const c = p.carry; if (!c) return;
    p.carry = null; sfx('throw');
    shoot({ type: 'prop', kind: c.kind, drop: c.drop, owner: p, x: p.x + p.face * 10, y: p.y, z: 44 * scaleOf(p), vx: p.face * 5.2, vz: 1.4, hit: new Set(), life: 999 });
  }
  function updateCarry(p, held, pressed, dx, dy) {
    switch (p.state) {
      case 'lift': p.vx = 0; if (p.t > 12) setState(p, 'carry'); return true;
      case 'carry': {
        if (!p.carry) { setState(p, 'idle'); return true; }
        if (pressed.attack || pressed.jump || pressed.special) { setState(p, 'heave'); return true; }
        if (pressed.block) { putDown(p); return true; }
        const sp = p.def.speed * 0.7;
        p.vx = dx * sp; p.vy = dy * sp * 0.65; if (dx) p.face = dx;
        p.x += p.vx; p.y += p.vy; if (dx || dy) p.animT++;
        return true;
      }
      case 'heave':
        if (p.t === 6) throwCarry(p);
        if (p.t > 18) setState(p, 'idle');
        return true;
    }
    return false;
  }
  // rysowanie: płomień miotacza i niesiona beczka nad głową
  function drawFlame(a, sx, sy) {
    if (a.state !== 'flame' || a.t < 16 || a.t > 70) return;
    const reach = 22 + Math.min(40, (a.t - 16) * 2), nx = sx + a.face * 16, ny = sy - 24;
    for (let i = 0; i < 14; i++) {
      const fr = G ? G.frame : app.frame || 0, k = ((fr * 0.13 + i / 14) % 1), d = k * reach;
      ctx.fillStyle = k < 0.3 ? 'rgba(255,240,160,0.9)' : k < 0.65 ? 'rgba(255,150,40,0.85)' : 'rgba(200,60,20,0.55)';
      ctx.beginPath(); ctx.arc(nx + a.face * d, ny + Math.sin(i * 2.3 + fr * 0.4) * d * 0.12 + d * 0.18, 2 + k * 5, 0, Math.PI * 2); ctx.fill();
    }
  }
  function drawCarried(a, sx, sy) {
    if (!a.carry) return;
    const lift = a.state === 'lift' ? Math.min(1, a.t / 10) : a.state === 'heave' ? (a.t < 6 ? 1 : 0) : a.state === 'carry' ? 1 : 0;
    if (!lift) return;
    const s = scaleOf(a);
    SP.drawBarrel(ctx, sx + a.face * 2, sy - (20 + 32 * lift) * s, 2, a.carry.kind);
  }
  // =============================================================== AI BOSSÓW (LUDZIE)
  function updateBoss(b) {
    b.t++; b.cool--;
    b.armor = false;
    if (updateCommon(b)) return;
    const p = nearestPlayer(b);
    const d = b.def;
    const enraged = b.hp < b.maxHp * 0.5;
    if (enraged && !b.called && d.summon) {
      b.called = true;
      G.pending.push({ type: d.summon[0], side: 'L', y: 175, delay: 20 }, { type: d.summon[1], side: 'R', y: 200, delay: 50 });
      G.popups.push({ x: b.x, y: b.y - 80, txt: d.shout, t: 0, col: '#ff6040' });
      sfx(d.ai === 'baron' ? 'warp' : 'eDie');
    }
    if (b.state === 'enter') {
      enterScreen(b);
      if (b.state === 'idle') { setState(b, 'intro'); if (!G.introBoss) G.introBoss = b; }
      return;
    }
    if (b.state === 'intro') {
      if (b.t === 1) { sfx(d.ai === 'baron' ? 'thunder' : 'zap'); G.shake = 10; }
      if (b.t > 80) { setState(b, 'idle'); G.introBoss = null; }
      return;
    }
    if (b.state === 'recover') { if (b.t > 30) setState(b, 'idle'); return; }
    // druga faza: przy 30% życia „ostatni atak” — trzykrotna szarża przez całą arenę, potem zadyszka; co kilka sekund od nowa
    if (['hammer', 'whip', 'harpoon'].includes(d.ai) && b.hp > 0 && b.hp < b.maxHp * 0.3 && !b.phase2) {
      b.phase2 = true; b.rampCool = 0;
      G.popups.push({ x: b.x, y: b.y - 90, txt: 'OSTATNI ATAK!', t: 0, col: '#ff4020' });
    }
    if (b.phase2 && ['idle', 'walk'].includes(b.state) && --b.rampCool <= 0) { setState(b, 'rage'); }
    if (b.state === 'rage') {
      b.armor = true;
      if (b.t === 1) { sfx('roar'); G.shake = 12; G.popups.push({ x: b.x, y: b.y - 84, txt: d.ai === 'hammer' ? 'SZAŁ!' : 'GIŃCIE!', t: 0, col: '#ff6040' }); }
      if (b.t > 45) { setState(b, 'rampage'); b.rampN = 3; b.face = b.x > G.camX + W / 2 ? -1 : 1; }
      return;
    }
    if (b.state === 'rampage') {
      b.armor = true; b.x += b.face * 5.2; b.animT++;
      if (G.frame % 4 === 0) dust(b.x - b.face * 12, b.y);
      resolveHits(b, MOVES.rampage, true);
      const edge = b.face > 0 ? G.camX + W - 34 : G.camX + 34;
      if ((b.face > 0 && b.x >= edge) || (b.face < 0 && b.x <= edge)) {
        b.x = edge; G.shake = 6; sfx('slam'); G.fx.push({ type: 'shock', x: b.x, y: b.y, z: 0, t: 0, life: 18, r: 30 });
        if (--b.rampN <= 0) { setState(b, 'winded'); b.rampCool = 520; G.popups.push({ x: b.x, y: b.y - 80, txt: 'ZADYSZKA!', t: 0, col: '#7cff7c' }); }
        else setState(b, 'rampwait');
      }
      return;
    }
    if (b.state === 'rampwait') {
      const tp = nearestPlayer(b);
      if (tp) b.y += clamp(tp.y - b.y, -1.6, 1.6);
      if (b.t > 22) { setState(b, 'rampage'); b.face = -b.face; }
      return;
    }
    if (b.state === 'winded') { if (b.t > 80) setState(b, 'idle'); return; }
    if (b.state === 'attack') {
      const m = b.move;
      if (b.t < m.start && (d.ai === 'hammer' || m === MOVES.anchor)) b.armor = true;
      if (b.t === 3 && d.ai === 'hammer') sfx('zap');
      if (b.t >= m.start && b.t < m.start + m.active) {
        if (b.t === m.start && (m === MOVES.bossSwing || m === MOVES.anchor)) { sfx('slam'); G.shake = 6; G.fx.push({ type: 'shock', x: b.x + b.face * 44, y: b.y, z: 0, t: 0, life: 18, r: 30 }); }
        resolveHits(b, m);
      }
      if (b.t >= m.start + m.active + m.rec) {
        if (d.ai === 'baron' && b.combo > 0) { b.combo--; startMove(b, b.combo === 0 ? MOVES.caneFinal : MOVES.cane); return; }
        if (d.ai === 'harpoon') b.weapon = 'harpoonGun';
        setState(b, 'idle');
      }
      return;
    }
    if (!p) { b.state = 'idle'; return; }
    const dist = Math.abs(p.x - b.x), ddy = Math.abs(p.y - b.y);
    if (d.ai === 'hammer') return bossHammer(b, p, dist, ddy, enraged);
    if (d.ai === 'whip') return bossWhip(b, p, dist, ddy, enraged);
    if (d.ai === 'harpoon') return bossHarpoon(b, p, dist, ddy, enraged);
    if (d.ai === 'baron') return bossBaron(b, p, dist, ddy, enraged);
  }

  function bossCharge(b, speed, dmg) {
    b.armor = true;
    if (b.t < 30) { b.x += (b.t % 4 < 2 ? 0.8 : -0.8); return; }
    b.x += b.face * speed; b.animT++;
    if (b.t % 6 === 0) dust(b.x - b.face * 10, b.y);
    resolveHits(b, { reach: 22, dmg, knock: true, snd: 'heavy', shake: 6, depth: 12 });
    if (b.t > 110 || b.x < G.camX + 16 || b.x > G.camX + W - 16) { setState(b, 'recover'); G.shake = 6; sfx('land'); }
  }

  function bossHammer(b, p, dist, ddy, enraged) {
    switch (b.state) {
      case 'idle': case 'walk': {
        b.face = p.x > b.x ? 1 : -1;
        if (b.hurtCount >= 3) { b.hurtCount = 0; startMove(b, MOVES.bossSwing); return; }
        if (b.cool <= 0) {
          const r = Math.random();
          if (dist < 56 && ddy < 12) { startMove(b, MOVES.bossSwing); b.cool = enraged ? 40 : 60; return; }
          if (ddy < 16 && dist > 90 && r < 0.45) { setState(b, 'charge'); sfx('charge'); b.cool = enraged ? 50 : 80; return; }
          if (r < 0.7) { setState(b, 'slam'); b.cool = enraged ? 60 : 90; return; }
          b.cool = 30;
        }
        stepToward(b, p.x + (Math.sign(b.x - p.x) || 1) * 40, p.y, b.def.speed * (enraged ? 1.35 : 1));
        return;
      }
      case 'charge': return bossCharge(b, enraged ? 5 : 4.4, 14);
      case 'slam':
        b.armor = true;
        if (b.t === 1) {
          b.vz = 6.6;
          const tx = clamp(p.x, G.camX + 20, G.camX + W - 20);
          b.vx = (tx - b.x) / 40; b.vy = (p.y - b.y) / 40; b.face = b.vx >= 0 ? 1 : -1;
          sfx('jump');
        }
        b.x += b.vx; b.y += b.vy; b.vz -= GRAV; b.z += b.vz;
        if (b.z <= 0 && b.t > 3) {
          b.z = 0; b.vz = 0;
          sfx('slam'); G.shake = 14;
          G.fx.push({ type: 'shock', x: b.x, y: b.y, z: 0, t: 0, life: 26, r: 90 });
          for (let i = 0; i < 6; i++) dust(b.x + rnd(-40, 40), b.y + rnd(-6, 6));
          for (const t of G.actors) {
            if (t.team !== 'player' || !hittable(t) || t.z > 4) continue;
            if (Math.abs(t.x - b.x) < 80 && Math.abs(t.y - b.y) < 24) hurt(t, 12, t.x >= b.x ? 1 : -1, true, b);
          }
          setState(b, 'recover');
        }
        return;
    }
  }

  function bossWhip(b, p, dist, ddy, enraged) {
    switch (b.state) {
      case 'idle': case 'walk': {
        b.face = p.x > b.x ? 1 : -1;
        if (b.cool <= 0) {
          if (dist < 30 && Math.random() < 0.6) { setState(b, 'flip'); b.cool = 30; return; }
          if (dist < 76 && ddy < 8) { b.whipN = (b.whipN || 0) + 1; startMove(b, b.whipN % 2 ? MOVES.whip : Object.assign({}, MOVES.whip, { knock: true })); b.cool = enraged ? 26 : 40; return; }
          if (dist > 100 && ddy < 10 && Math.random() < 0.5) { setState(b, 'dashkick'); sfx('whoosh'); b.cool = 60; return; }
          if (dist > 80 && Math.random() < 0.5) { setState(b, 'throwKnives'); b.cool = enraged ? 50 : 80; return; }
          b.cool = 15;
        }
        stepToward(b, p.x + (Math.sign(b.x - p.x) || 1) * 60, p.y, b.def.speed * (enraged ? 1.25 : 1));
        return;
      }
      case 'flip':
        b.invuln = 2;
        if (b.t === 1) { b.vz = 5.4; b.vx = -b.face * 3.2; sfx('jump'); }
        b.x = clamp(b.x + b.vx, G.camX + 16, G.camX + W - 16); b.vz -= GRAV; b.z += b.vz;
        if (b.z <= 0 && b.t > 3) { b.z = 0; b.vz = 0; sfx('land'); setState(b, 'throwKnives'); }
        return;
      case 'throwKnives':
        b.face = p.x > b.x ? 1 : -1;
        if (b.t === 10) { (enraged ? [-14, -7, 0, 7, 14] : [-10, 0, 10]).forEach(o => shoot({ type: 'knife', x: b.x + b.face * 12, y: b.y + o, z: 28, vx: b.face * 4.6, dmg: 9, knock: false })); sfx('whoosh'); }
        if (b.t > 26) setState(b, 'idle');
        return;
      case 'dashkick':
        if (b.t < 10) return;
        b.x += b.face * 5; b.animT++;
        if (b.t < 30) resolveHits(b, { reach: 22, dmg: 12, knock: true, snd: 'heavy' });
        if (b.t > 30 || b.x < G.camX + 8 || b.x > G.camX + W - 8) setState(b, 'recover');
        return;
    }
  }

  function bossHarpoon(b, p, dist, ddy, enraged) {
    switch (b.state) {
      case 'idle': case 'walk': {
        b.face = p.x > b.x ? 1 : -1;
        if (b.cool <= 0) {
          if (dist < 56 && ddy < 12) { b.weapon = 'anchor'; startMove(b, MOVES.anchor); b.cool = enraged ? 35 : 55; return; }
          if (ddy < 8 && dist > 80) { setState(b, 'aimH'); b.cool = enraged ? 50 : 80; return; }
          if (ddy < 16 && dist > 60 && Math.random() < 0.3) { setState(b, 'charge'); sfx('charge'); b.cool = 80; return; }
          b.cool = 20;
        }
        const want = dist < 70 ? 120 : 40;
        stepToward(b, p.x + (Math.sign(b.x - p.x) || 1) * want, p.y, b.def.speed * (enraged ? 1.3 : 1));
        return;
      }
      case 'aimH':
        b.face = p.x > b.x ? 1 : -1;
        if (b.t < 20) b.y += Math.sign(p.y - b.y) * 0.5;
        if (b.t === 2) sfx('charge');
        if (b.t === 34) { shoot({ type: 'harpoon', x: b.x + b.face * 34, y: b.y, z: 30, vx: b.face * 6.5, dmg: Math.round(15 * b.dmgMul) }); sfx('harpoon'); G.shake = 4; }
        if (b.t > 50) setState(b, 'idle');
        return;
      case 'charge': return bossCharge(b, enraged ? 4.8 : 4.2, 13);
    }
  }

  function bossBaron(b, p, dist, ddy, enraged) {
    switch (b.state) {
      case 'idle': case 'walk': {
        b.face = p.x > b.x ? 1 : -1;
        if (b.cool <= 0) {
          const r = Math.random();
          if (dist < 42 && ddy < 8) { b.combo = 2; startMove(b, MOVES.cane); b.cool = enraged ? 30 : 45; return; }
          if (r < 0.35) { setState(b, 'warp'); sfx('warp'); b.cool = enraged ? 40 : 70; return; }
          if (dist > 90 && ddy < 24) { setState(b, 'cast'); b.cool = enraged ? 45 : 75; return; }
          b.cool = 15;
        }
        stepToward(b, p.x + (Math.sign(b.x - p.x) || 1) * 36, p.y, b.def.speed * (enraged ? 1.3 : 1));
        return;
      }
      case 'warp':
        b.invuln = 2;
        b.alpha = b.t < 16 ? 1 - b.t / 16 : Math.min(1, (b.t - 16) / 10);
        if (b.t === 16) {
          const side = -p.face || 1;
          b.x = clamp(p.x + side * 34, G.camX + 20, G.camX + W - 20); b.y = p.y; b.face = p.x > b.x ? 1 : -1;
          sfx('warp'); G.fx.push({ type: 'shock', x: b.x, y: b.y, z: 0, t: 0, life: 14, r: 24 });
        }
        if (b.t > 26) { b.alpha = 1; b.invuln = 0; b.combo = 2; startMove(b, MOVES.cane); }
        return;
      case 'cast':
        b.armor = b.t < 18;
        if (b.t === 4) sfx('energy');
        if (b.t === 18) {
          const lanes = enraged ? [-16, 0, 16] : [0];
          lanes.forEach(o => shoot({ type: 'wave', x: b.x + b.face * 20, y: clamp(p.y + o, FLOOR_TOP + 8, FLOOR_BOTTOM), z: 0, vx: b.face * 3.4, dmg: Math.round(14 * b.dmgMul), pierce: true }));
          G.shake = 6;
        }
        if (b.t > 34) setState(b, 'idle');
        return;
    }
  }

  // =============================================================== OTOCZENIE
  // ---- wydarzenia etapów: przypływ na plaży, fala ścieków w kanałach
  const FLOOD_SAFE = FLOOR_TOP + 20;   // podwyższenie w kanałach: y mniejsze = bezpiecznie
  function banner(txt, col) { G.banner = { txt, col, t: 120 }; }
  // pogoda w rozgrywce: wiatr (burza piaskowa, deszcz, ulewa) i śliska nawierzchnia (deszcz, ulewa)
  const slippery = () => !!((G.wx && G.wx.rain) || (ST.storm && (G.fog || 0) > 0.3));
  function updateWind() {
    const windy = (G.wx && (G.wx.sand || G.wx.rain)) || ST.storm;
    if (!windy) { G.wind = 0; return; }
    if (!G.windDir || G.frame % 1800 === 0) G.windDir = G.windDir ? -G.windDir : (Math.random() < 0.5 ? -1 : 1);
    G.wind = G.windDir * (G.wx && G.wx.sand ? 0.05 : 0.032) * (0.55 + 0.45 * Math.sin(G.frame * 0.013));
  }
  // odłamki bursztynu spadające z nieba (atak Kolosa): cień rośnie przez 45 klatek, potem uderzenie
  function updateDrops() {
    const D = G.drops; if (!D) return;
    for (let i = D.length - 1; i >= 0; i--) {
      const d = D[i]; d.t++;
      if (d.t === 45) {
        sfx('crash'); spark(d.x, d.y, 6, true); G.shake = Math.max(G.shake, 4);
        for (let k = 0; k < 5; k++) G.fx.push({ type: 'debris', x: d.x, y: d.y, z: 2, vx: rnd(-1.5, 1.5), vz: rnd(1, 3), t: 0, life: 36, col: k % 2 ? '#f0b040' : '#c07820' });
        for (const q of G.players) if (hittable(q) && q.z < 10 && Math.abs(q.x - d.x) < 16 && Math.abs(q.y - d.y) < 9) hurt(q, 14, q.x >= d.x ? 1 : -1, true, null, { unblock: true });
      }
      if (d.t > 50) D.splice(i, 1);
    }
  }
  function updateEvents() {
    if (G.banner && --G.banner.t <= 0) G.banner = null;
    updateDrops();
    updateWind();
    updateRats();
    const ev = ST.EVENT;
    if (!ev || G.introT > 0 || G.bossDead || G.introBoss || G.rush) { if (G.ev) G.ev.front = null; return; }
    const E = G.ev = G.ev || { t: 0, level: 0 };
    E.t++;
    if (ev === 'tide') {
      // cykl: 900 klatek spokoju, 90 ostrzeżenia, potem woda wznosi się i opada (ok. 7 s)
      // cykl ok. 30 s: 1200 klatek spokoju, ostrzeżenie, potem woda wznosi się i opada
      const k = E.t % 1800;
      if (k === 1200) { banner('PRZYPŁYW!', '#80d0ff'); sfx('charge'); }
      const target = k >= 1290 ? Math.sin(Math.min(1, (k - 1290) / 420) * Math.PI) : 0;
      E.level += (target - E.level) * 0.05;
      G.tideY = FLOOR_TOP + 6 + E.level * 40;
      if (E.level < 0.05) G.players.forEach(q => { q.wetMsg = false; });
    } else if (ev === 'flood') {
      const k = E.t % 1200;   // cykl ok. 20 s
      if (k === 900) { E.dir = Math.random() < 0.5 ? 1 : -1; E.warn = true; banner('FALA ŚCIEKÓW! NA PODWYŻSZENIE!', '#a0ff60'); sfx('charge'); }
      if (k === 990) { E.warn = false; E.front = E.dir > 0 ? G.camX - 40 : G.camX + W + 40; E.hit = new Set(); sfx('crash'); G.shake = 6; }
      if (k > 990 && k < 1100 && E.front !== null && E.front !== undefined) {
        E.front += E.dir * 5;
        for (const a of G.actors) {
          if (E.hit.has(a) || !a.alive || isBoss(a) || a.kind === 'ptera' || a.z > 8 || a.y < FLOOD_SAFE || !hittable(a)) continue;
          if (Math.abs(a.x - E.front) < 14) {
            E.hit.add(a); hurt(a, 10, E.dir, true, null, { unblock: true });
            if (a.kind === 'player' && G.ch) G.ch.sludge = true;
            if (a.kind === 'player') G.popups.push({ x: a.x, y: a.y - 50, txt: 'ZALANY!', t: 0, col: '#a0ff60' });
          }
        }
      } else if (k >= 1100) {
        if (E.front !== null && E.front !== undefined && !G.players.some(q => E.hit && E.hit.has(q))) {
          E.dry = (E.dry || 0) + 1; if (E.dry >= 3) unlock('abovewave');
          G.popups.push({ x: G.camX + W / 2, y: 90, txt: 'SUCHA NOGA! ' + Math.min(E.dry, 3) + '/3', t: 0, col: '#a0ff60' });
        }
        E.front = null;
      }
    }
  }
  // ---- szczury w kanałach: przebiegają po chodniku, można je złapać ciosem
  function updateRats() {
    if (ST.EVENT !== 'flood') return;
    const R_ = G.rats = G.rats || [];
    if (G.frame % 140 === 70 && R_.length < 4) { const sd = Math.random() < 0.5 ? -1 : 1; R_.push({ x: sd > 0 ? G.camX - 10 : G.camX + W + 10, y: rnd(FLOOR_TOP + 24, FLOOR_BOTTOM - 4), vx: sd * rnd(1.8, 2.8), t: 0 }); }
    for (let i = R_.length - 1; i >= 0; i--) {
      const r = R_[i]; r.t++; r.x += r.vx; r.y += Math.sin(r.t * 0.3) * 0.3;
      if (r.dead) { if (++r.dead > 30) R_.splice(i, 1); continue; }
      for (const q of G.players) {
        const atk = q.state === 'attack' && q.move && q.t >= q.move.start && q.t < q.move.start + q.move.active + 2;
        const stomp = (q.state === 'jump' || q.state === 'land') && q.z < 6;
        if ((atk && Math.abs(r.x - (q.x + q.face * 16)) < 20 && Math.abs(r.y - q.y) < 10) || (stomp && Math.abs(r.x - q.x) < 12 && Math.abs(r.y - q.y) < 8)) {
          r.dead = 1; G.ratKills = (G.ratKills || 0) + 1; addScore(q, 100); sfx('screech');
          G.popups.push({ x: r.x, y: r.y - 20, txt: 'PISK! ' + Math.min(G.ratKills, 10) + '/10', t: 0, col: '#e0c0c0' });
          if (G.ratKills >= 10) unlock('ratcatcher');
          break;
        }
      }
      if (r.x < G.camX - 40 || r.x > G.camX + W + 40) R_.splice(i, 1);
    }
  }
  function drawRats() {
    for (const r of G.rats || []) {
      const x = r.x - G.camX, y = r.y, d = Math.sign(r.vx) || 1;
      if (r.dead) { ctx.fillStyle = '#5a4a4a'; ctx.fillRect(x - 5, y - 1, 10, 2); continue; }
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y, 7, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c08080'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - d * 5, y - 2); ctx.quadraticCurveTo(x - d * 10, y - 6 + Math.sin(r.t * 0.5) * 2, x - d * 14, y - 3); ctx.stroke();
      ctx.fillStyle = '#140c10'; ctx.beginPath(); ctx.ellipse(x, y - 3, 6.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6a6060'; ctx.beginPath(); ctx.ellipse(x, y - 3, 5.5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6a6060'; ctx.fillRect(x + d * 4, y - 5, 3, 3); ctx.fillStyle = '#e09090'; ctx.fillRect(x + d * 4, y - 7, 2, 2);
      ctx.fillStyle = '#ff4030'; ctx.fillRect(x + d * 6, y - 4, 1, 1);
      if (r.t % 6 < 3) { ctx.fillStyle = '#4a4040'; ctx.fillRect(x - 3, y - 1, 2, 2); ctx.fillRect(x + 2, y - 1, 2, 2); }
    }
  }
  function drawEventsBack() {
    drawRats();
    // cienie spadających odłamków i bąbelki zanurzonego Zębacza
    for (const d of G.drops || []) {
      if (d.t > 45) continue;
      const k = d.t / 45;
      ctx.fillStyle = `rgba(0,0,0,${(0.15 + k * 0.35).toFixed(2)})`; ctx.beginPath(); ctx.ellipse(d.x - G.camX, d.y, 4 + k * 10, 1.5 + k * 3, 0, 0, Math.PI * 2); ctx.fill();
      if (d.t > 30 && G.frame % 6 < 3) { ctx.strokeStyle = '#ffb040'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(d.x - G.camX, d.y, 14, 5, 0, 0, Math.PI * 2); ctx.stroke(); }
    }
    for (const a of G.actors) if (a.state === 'swim') {
      const x = a.x - G.camX;
      ctx.strokeStyle = 'rgba(160,220,120,0.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, a.y, 16 + Math.sin(G.frame * 0.3) * 3, 4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(200,255,160,0.8)';
      for (let k = 0; k < 4; k++) ctx.fillRect(x + Math.sin(G.frame * 0.2 + k * 2) * 12, a.y - 2 - ((G.frame + k * 7) % 14), 2, 2);
    }
    if (G.tideY > FLOOR_TOP + 7) {
      const y = G.tideY;
      ctx.fillStyle = 'rgba(70,110,120,0.55)'; ctx.fillRect(0, FLOOR_TOP, W, y - FLOOR_TOP);
      ctx.fillStyle = 'rgba(220,230,220,0.85)';
      for (let x = -((G.camX + G.frame * 0.6) % 10); x < W; x += 10) ctx.fillRect(x, y - 1 + Math.sin((x + G.camX) * 0.12 + G.frame * 0.08) * 1.2, 6, 2);
      ctx.strokeStyle = 'rgba(220,235,240,0.6)'; ctx.lineWidth = 1;
      for (const a of G.actors) if (a.y < y && a.z < 3) { ctx.beginPath(); ctx.ellipse(a.x - G.camX, a.y, 10 + Math.sin(G.frame * 0.2 + a.x) * 2, 2.5, 0, 0, Math.PI * 2); ctx.stroke(); }
    }
  }
  function drawEventsFront() {
    // spadające odłamki bursztynu
    for (const d of G.drops || []) {
      if (d.t >= 45) continue;
      const x = d.x - G.camX, y = d.y - (45 - d.t) * 5;
      ctx.fillStyle = '#140c10'; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 4); ctx.lineTo(x - 5, y); ctx.fill();
      ctx.fillStyle = '#f0a020'; ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 3.5, y); ctx.lineTo(x, y + 2.5); ctx.lineTo(x - 3.5, y); ctx.fill();
      ctx.fillStyle = '#ffe090'; ctx.fillRect(x - 1, y - 5, 1, 3);
    }
    const E = G.ev;
    if (!E || ST.EVENT !== 'flood') return;
    if (E.warn && G.frame % 20 < 12) {
      const x = E.dir > 0 ? 10 : W - 10;
      ctx.fillStyle = '#a0ff60'; ctx.beginPath(); ctx.moveTo(x + E.dir * 14, 186); ctx.lineTo(x, 176); ctx.lineTo(x, 196); ctx.fill();
    }
    if (E.front !== null && E.front !== undefined) {
      const fx = E.front - G.camX, x0 = E.dir > 0 ? 0 : fx, x1 = E.dir > 0 ? fx : W;
      if (x1 > x0) { ctx.fillStyle = 'rgba(90,150,40,0.72)'; ctx.fillRect(x0, FLOOD_SAFE, x1 - x0, H - FLOOD_SAFE); }
      ctx.fillStyle = 'rgba(160,220,90,0.9)';
      for (let y = FLOOD_SAFE - 6; y < H; y += 6) ctx.fillRect(fx - E.dir * (4 + Math.sin(y * 0.3 + G.frame * 0.4) * 3), y, 6, 5);
      ctx.fillStyle = 'rgba(220,255,180,0.9)';
      for (let i = 0; i < 6; i++) ctx.fillRect(fx + E.dir * rnd(-4, 4), FLOOD_SAFE - 10 - Math.random() * 10, 2, 2);
    }
  }
  function updateHazards() {
    const HZ = ST.HAZARDS || [];
    for (const a of G.actors) {
      if (a.hazT > 0) a.hazT--;
      if (!a.alive || a.z > 2 || isBoss(a) || a.invuln > 0 || !hittable(a) || a.kind === 'ptera' || a.hazT > 0) continue;
      for (const h of HZ) {
        if (a.x > h.x0 && a.x < h.x1 && a.y > h.y0 && a.y < h.y1) {
          a.hazT = 45; hurt(a, 9, Math.random() < 0.5 ? 1 : -1, true, null, { unblock: true });
          spark(a.x, a.y, 6, true); sfx('zap');
          if (a.kind === 'player' && G.ch) G.ch.sludge = true;
          if (a.kind === 'player') G.popups.push({ x: a.x, y: a.y - 40, txt: h.label || 'LAWA!', t: 0, col: h.label ? '#a0ff60' : '#ff8040' });
          break;
        }
      }
    }
    const C = ST.CARTS;
    if (C) {
      G.carts = G.carts || [];
      if (G.camX + W > C.x0 && G.camX < C.x1 && !G.bossDead && G.introT <= 0) {
        G.cartT = (G.cartT || 0) + 1;
        if (G.cartT === C.every - 70) { G.cartWarn = { side: Math.random() < 0.5 ? -1 : 1, t: 70 }; sfx('charge'); }
        if (G.cartT >= C.every) {
          G.cartT = 0; const sd = G.cartWarn ? G.cartWarn.side : 1;
          G.carts.push({ x: sd > 0 ? G.camX + W + 40 : G.camX - 40, y: C.y, vx: -sd * 4.6, hit: new Set() }); sfx('crash');
        }
      }
      if (G.cartWarn && --G.cartWarn.t <= 0) G.cartWarn = null;
      for (let i = G.carts.length - 1; i >= 0; i--) {
        const c = G.carts[i]; c.x += c.vx;
        if (G.frame % 5 === 0) G.fx.push({ type: 'spark', x: c.x - Math.sign(c.vx) * 12, y: c.y, z: 2, t: 0, life: 6 });
        for (const a of G.actors) {
          if (c.hit.has(a) || !hittable(a) || isBoss(a) || a.z > 8 || Math.abs(a.y - c.y) > 7 || Math.abs(a.x - c.x) > 18) continue;
          c.hit.add(a); hurt(a, 14, Math.sign(c.vx), true, null, { unblock: true }); sfx('heavy'); G.shake = 5;
        }
        if (c.x < G.camX - 120 || c.x > G.camX + W + 120) G.carts.splice(i, 1);
      }
    }
    if (ST.storm) {
      G.stormT = ((G.stormT || 0) + 1) % 1500;
      const t = G.stormT, on = t > 900 && t < 1400;
      G.fog = (G.fog || 0) + ((on ? 0.8 : 0) - (G.fog || 0)) * 0.02;
      if (t === 901) { sfx('thunder'); G.flash = 10; G.popups.push({ x: G.camX + W / 2, y: 120, txt: 'ULEWA!', t: 0, col: '#a0c0ff' }); }
    }
    if (G.flash > 0) G.flash--;
  }

  // =============================================================== SCENKI FABULARNE
  // mówca: 'h1' / 'h2' (bohaterowie z drużyny) albo klucz wroga/bossa
  const STORY = {
    0: [['h1', 'KŁUSOWNICY ZNÓW ŁAPIĄ DINOZAURY PRZY STAREJ AUTOSTRADZIE.'], ['h2', 'KAPITAN RDZA ZAŁOŻYŁ OBÓZ W KAMIENIOŁOMIE. JEDZIEMY!'], ['boss', 'KTO ŚMIE WJEŻDŻAĆ NA MOJĄ DROGĘ? BRAĆ ICH!']],
    1: [['h1', 'ŚLADY KŁUSOWNIKÓW PROWADZĄ PRZEZ SMOLNE BAGNA.'], ['zmija', 'SSSŁODKIE MAŁE DINOZAURY... MÓJ BICZ JUŻ NA NIE CZEKA.'], ['h2', 'NIE TYM RAZEM, ŻMIJO!']],
    2: [['h1', 'MIASTO CIENI. TU PRZEMYTNICY HANDLUJĄ JAJAMI DINOZAURÓW.'], ['klin', 'BRACIE, MAMY GOŚCI!'], ['klamra', 'TO ZRÓBMY IM MIEJSCE... W SKRZYNI.']],
    3: [['h1', 'W GŁĘBI GÓRY ŚPI STARY KIEŁ. KŁUSOWNICY CHCĄ GO OBUDZIĆ.'], ['h2', 'UWAŻAJ NA LAWĘ. A WAGONIKI... MOŻE SIĘ PRZYDADZĄ.'], ['rex', 'GRRRAAAAAH!']],
    4: [['h1', 'STATEK „KRAKEN” WYWOZI DINOZAURY ZA OCEAN.'], ['szpon', 'ŁADUNEK ODPŁYWA O ŚWICIE. WY — NIGDY.'], ['h2', 'W PORCIE STOJĄ JEEPY. POŻYCZMY JEDEN, ADMIRALE.']],
    5: [['h1', 'KRAKEN ZATONĄŁ, A MORZE WYRZUCIŁO NA BRZEG CAŁY ICH ŁADUNEK.'], ['padliniarz', 'CO WYRZUCI FALA, TO MOJE. KOŚCI TEŻ. WASZE TEŻ!'], ['h2', 'POSPRZĄTAMY TĘ PLAŻĘ. ZACZNIEMY OD CIEBIE.']],
    6: [['h1', 'DROGA DO TWIERDZY PROWADZI POD MIASTEM — STARYMI KANAŁAMI.'], ['h2', 'SŁYSZYSZ? COŚ WIELKIEGO CHODZI W ŚCIEKACH.'], ['deino', 'GRRRHHH... KLAP! KLAP!']],
    7: [['h1', 'BURSZTYNOWA TWIERDZA. TU WSZYSTKO SIĘ ZACZĘŁO.'], ['baron', 'PRZYSZLIŚCIE PO SWOJE ZWIERZAKI? ZOSTANIECIE W BURSZTYNIE NA ZAWSZE.'], ['h2', 'KONIEC Z TWOIM IMPERIUM, BARONIE!']],
    truefinal: [['h1', 'ZACZEKAJ... SŁYSZYSZ? COŚ WYCHODZI Z MORZA.'], ['h2', 'BURSZTYNOWY KOLOS — OSTATNIA BROŃ BARONA!'], ['h1', 'UWOLNIONE DINOZAURY SĄ Z NAMI. KOŃCZYMY TO RAZ NA ZAWSZE!']],
    train: [['h1', 'POCIĄG Z ŁADUNKIEM DLA BARONA JEDZIE PROSTO DO TWIERDZY.'], ['digger', 'NA MOIM POCIĄGU NIE MA GAPOWICZÓW. MOJA KOPARKA WAS ZE-SKROBIE!'], ['h2', 'TO WSKAKUJEMY. TRZYMAJ SIĘ BURTY!']],
    escape: [['baron', 'JEŚLI JA UPADAM... TO RAZEM Z TWIERDZĄ!'], ['h1', 'WULKAN SIĘ BUDZI! LAWA ZALEWA KORYTARZE!'], ['h2', 'BIEGIEM DO WYJŚCIA! NIE OGLĄDAJ SIĘ!']]
  };
  // ---- zakończenia postaci: krótki komiks o tym, co każdy bohater robi po wszystkim (tło = jego „miejsce”)
  const ENDINGS = {
    kruk: { stage: 0, lines: [['kruk', 'ODBUDOWAŁEM STARĄ STACJĘ PRZY AUTOSTRADZIE. TERAZ TO SCHRONISKO DLA DINOZAURÓW.'],
      ['kruk', 'MAŁE RAPTORY WCIĄŻ GRYZĄ MI BUTY. CHYBA MNIE LUBIĄ.'], ['rex', 'MRRR... (STARY KIEŁ WPADA CZASEM NA OBIAD)']] },
    nina: { stage: 2, lines: [['nina', 'W MIEŚCIE CIENI OTWORZYŁAM SZKOŁĘ WALKI. LEKCJA PIERWSZA: NIE ZADZIERAJ Z DINOZAURAMI.'],
      ['nina', 'NOCAMI WCIĄŻ PATROLUJĘ DACHY. PRZEMYTNICY OMIJAJĄ NASZĄ DZIELNICĘ.'], ['nina', 'A KLAMRA? ZMYWA NACZYNIA W MOJEJ KNAJPIE. ODPRACOWUJE.']] },
    tur: { stage: 3, lines: [['tur', 'ZAMKNĄŁEM OGNISTE SZYBY NA CZTERY SPUSTY. NIKT JUŻ NIE OBUDZI GÓRY.'],
      ['tur', 'Z KOPARKI BRYGADZISTY ZROBIŁEM PLAC ZABAW DLA MŁODYCH TRICERATOPSÓW.'], ['tur', 'NAJLEPSZA ROBOTA W MOIM ŻYCIU.']] },
    borys: { stage: 4, lines: [['borys', 'ZA NAGRODĘ KUPIŁEM STARY KUTER. WYŁAWIAM DINOZAURY Z WRAKU KRAKENA.'],
      ['borys', 'TRZYDZIEŚCI JUŻ WRÓCIŁO DO DOMU. SZPON PEWNIE ZGRZYTA ZĘBAMI W CELI.'], ['borys', 'MORZE JEST SPOKOJNE. JA TEŻ, PIERWSZY RAZ OD LAT.']] },
    bursztyn: { stage: 7, lines: [['bursztyn', 'ODDAŁEM TWIERDZĘ DINOZAUROM. BURSZTYNOWE SALE SĄ TERAZ ICH GNIAZDAMI.'],
      ['bursztyn', 'CODZIENNIE PRZYCHODZĘ PRZEPROSIĆ. NIEKTÓRE JUŻ MNIE NIE GRYZĄ.'], ['bursztyn', 'IMPERIUM? WYSTARCZY MI CIEPŁY KAMIEŃ I SPOKÓJ.']] },
    padlin: { stage: 5, lines: [['padlin', 'SPRZĄTAM PLAŻĘ, KTÓRĄ SAM ZAŚMIECIŁEM. BECZKA PO BECZCE.'],
      ['padlin', 'Z ZŁOMU WYRZUCONEGO PRZEZ MORZE BUDUJĘ FALOCHRON DLA GNIAZD.'], ['padlin', 'KOŚCI ZOSTAWIAM W SPOKOJU. NO... PRAWIE WSZYSTKIE.']] },
    zmijka: { stage: 1, lines: [['zmijka', 'WRÓCIŁAM NA SMOLNE BAGNA. TYM RAZEM JAKO STRAŻNICZKA.'],
      ['zmijka', 'MÓJ BICZ ODSTRASZA TERAZ KŁUSOWNIKÓW, NIE DINOZAURY.'], ['zmijka', 'SSSPOKÓJ... NIE SĄDZIŁAM, ŻE TAK MI SIĘ SPODOBA.']] }
  };
  // strona komiksu dla każdej (różnej) postaci z drużyny, potem done()
  function startEpilog(team, done) {
    const keys = [...new Set(team.map(q => q.key))].filter(k => ENDINGS[k]);
    const next = i => {
      if (i >= keys.length) { done(); return; }
      const k = keys[i], key = 'epilog_' + k;
      STORY[key] = ENDINGS[k].lines;
      startStory(key, team, () => next(i + 1));
      if (app.mode === 'story' && app.story.key === key) app.story.stage = STAGES[ENDINGS[k].stage];
    };
    next(0);
  }
  const storyCache = {};
  function storySpeaker(who, team) {
    if (CHARS[who]) { const q = team.find(t => t.key === who); return { name: CHARS[who].name, b: q ? q.b : CHARS[who].build, hero: true }; }
    if (who === 'h1' || who === 'h2') {
      let q = who === 'h1' ? team[0] : team[1];
      if (!q) { const k = CHAR_KEYS.find(k2 => k2 !== team[0].key); return { name: CHARS[k].name, b: CHARS[k].build, hero: true }; }
      return { name: q.name, b: q.b, hero: true };
    }
    if (who === 'rex') return { name: 'STARY KIEŁ', rex: true };
    if (who === 'deino') return { name: 'ZĘBACZ', rex: true, cols: DEINO_COLS };
    if (!storyCache[who]) storyCache[who] = ENEMIES[who].mk();
    return { name: ENEMIES[who].name, b: storyCache[who] };
  }
  function startStory(key, team, after) {
    const lines = STORY[key];
    if (!lines || app.gameMode !== 'arcade') { after(); return; }
    team = team || makeTeam();
    app.mode = 'story'; app.t = 0;
    app.story = { key, lines, i: 0, t: 0, team, after, stage: key === 'escape' ? window.SPECIAL_STAGES.escape : key === 'train' ? window.SPECIAL_STAGES.train : key === 'truefinal' ? trueFinalStage() : STAGES[key] || STAGES[0] };
  }
  function beginStage(idx, team) {
    team = team || makeTeam();
    startStory(idx, team, () => { startStage(idx, team); app.mode = 'play'; app.t = 0; if (team.some(q => q.key === 'bursztyn')) unlock('baronplay'); });
  }
  function storyText(str, n) { return str.slice(0, Math.max(0, Math.floor(n))); }
  function wrapLines(str, max) {
    const out = []; let line = '';
    str.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > max) { out.push(line.trim()); line = w; } else line += ' ' + w; });
    if (line.trim()) out.push(line.trim());
    return out;
  }
  // ---- przerywnik jako strona komiksu: każda kwestia to kadr (tło etapu + postać w zbliżeniu + dymek)
  function storyLayout(n) {
    if (n <= 1) return [[8, 8, W - 16, H - 30]];
    if (n === 2) return [[8, 8, 184, H - 30], [198, 8, W - 206, H - 30]];
    if (n === 3) return [[8, 8, 184, H - 30], [198, 8, W - 206, 94], [198, 108, W - 206, H - 130]];
    const out = [], cw = (W - 22) / 2, ch = (H - 36) / 2;
    for (let i = 0; i < n; i++) out.push([8 + (i % 2) * (cw + 6), 8 + Math.floor(i / 2) % 2 * (ch + 6), cw, ch]);
    return out;
  }
  let halftone = null;
  function halftonePattern() {
    if (halftone) return halftone;
    const c = document.createElement('canvas'); c.width = c.height = 4;
    const g = c.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(1, 1, 1, 1);
    halftone = ctx.createPattern(c, 'repeat');
    return halftone;
  }
  // dymek: prostokąt z ogonkiem w stronę mówiącego (współrzędne logiczne), zwraca miejsce na tekst
  function comicBubble(r, sp, lines, left) {
    const [x, y, w] = r, bw = Math.min(w - 12, Math.max(...lines.map(l => l.length)) * 5 + 14), bh = lines.length * 9 + 10;
    const bx = left ? x + w - bw - 6 : x + 6, by = y + 6;
    return { bx, by, bw, bh, tail: left ? bx + 18 : bx + bw - 18 };
  }
  function storyPanels() {
    const S_ = app.story, n = S_.lines.length, rects = storyLayout(n);
    return S_.lines.map((ln, i) => {
      const sp = storySpeaker(ln[0], S_.team), r = rects[Math.min(i, rects.length - 1)];
      const chars = Math.max(10, Math.floor((r[2] - 26) / 5));
      const lines = wrapLines(ln[1], chars);
      return { r, sp, lines, left: !!sp.hero, text: ln[1], b: comicBubble(r, sp, lines, !!sp.hero) };
    });
  }
  function drawStory() {
    const S_ = app.story, st = S_.stage, L = st.buildLayers(), f = app.frame || 0;
    // papier strony
    ctx.fillStyle = '#efe4c8'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = halftonePattern(); ctx.fillRect(0, 0, W, H);
    storyPanels().forEach((K, i) => {
      if (i > S_.i) {   // kadr jeszcze nieodkryty — pusty, przerywany kontur
        ctx.strokeStyle = 'rgba(60,40,30,0.35)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.strokeRect(K.r[0] + 0.5, K.r[1] + 0.5, K.r[2], K.r[3]); ctx.setLineDash([]);
        return;
      }
      const [x, y, w, h] = K.r, cur = i === S_.i, pop = cur ? Math.min(1, S_.t / 8) : 1;
      ctx.save();
      // „wskoczenie” kadru
      if (pop < 1) { ctx.translate(x + w / 2, y + h / 2); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop); ctx.translate(-x - w / 2, -y - h / 2); }
      ctx.fillStyle = '#140c10'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      // tło: fragment etapu w skali kadru
      const k = Math.max(w / W, h / H) * 1.05;
      ctx.save(); ctx.translate(x + w / 2 - W * k / 2, y + h - H * k); ctx.scale(k, k);
      st.drawBack(ctx, L, Math.min(st.LEN - W, 160 + i * 260), f);
      ctx.restore();
      ctx.fillStyle = K.left ? 'rgba(20,30,60,0.25)' : 'rgba(70,10,10,0.35)'; ctx.fillRect(x, y, w, h);
      // linie akcji u przeciwników
      if (!K.left) {
        ctx.strokeStyle = 'rgba(255,240,220,0.35)'; ctx.lineWidth = 1;
        const cx = x + w * 0.5, cy = y + h * 0.65;
        for (let a = 0; a < 24; a++) { const an = a / 24 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * 40, cy + Math.sin(an) * 30); ctx.lineTo(cx + Math.cos(an) * 260, cy + Math.sin(an) * 200); ctx.stroke(); }
      }
      // postać w zbliżeniu (półpostać od dołu kadru)
      const bs = (K.sp.b && K.sp.b.scale) || 1, fs = Math.min(2.4, h / 64) / Math.max(1, bs * 0.9);
      const fx = K.left ? x + w * 0.3 : x + w * 0.7, fy = h < 120 ? Math.min(y + h + 26 * fs, y + K.b.bh + 16 + 56 * fs * bs) : y + h + 26 * fs;   // niski kadr: głowa pod dymkiem
      const face = K.left ? 1 : -1;
      ctx.save(); ctx.translate(fx, fy); ctx.scale(fs, fs);
      if (K.sp.rex) SP.drawRaptor(ctx, 10 * face, -6, face, f, 'roar', K.sp.cols || REX_COLS, { scale: 1.2, rex: true });
      else SP.drawFigure(ctx, K.sp.b, K.left ? (cur && S_.t % 40 < 20 ? P.idle[1] || P.idle[0] : P.idle[0]) : P.taunt[0], 0, 0, face, {});
      ctx.restore();
      ctx.fillStyle = halftonePattern(); ctx.fillRect(x, y, w, h);
      // dymek
      const B = K.b;
      ctx.fillStyle = '#140c10'; ctx.fillRect(B.bx - 1.5, B.by - 1.5, B.bw + 3, B.bh + 3);
      ctx.beginPath(); ctx.moveTo(B.tail - 6, B.by + B.bh); ctx.lineTo(B.tail + (K.left ? -10 : 10), B.by + B.bh + 16); ctx.lineTo(B.tail + 6, B.by + B.bh); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fffaf0'; ctx.fillRect(B.bx, B.by, B.bw, B.bh);
      ctx.beginPath(); ctx.moveTo(B.tail - 4.5, B.by + B.bh - 1); ctx.lineTo(B.tail + (K.left ? -8 : 8), B.by + B.bh + 12); ctx.lineTo(B.tail + 4.5, B.by + B.bh - 1); ctx.closePath(); ctx.fill();
      // podpis mówiącego
      const cw = K.sp.name.length * 4 + 14;
      ctx.fillStyle = K.left ? '#ffd040' : '#ff7050'; ctx.fillRect(K.left ? x + w - cw : x, y + h - 13, cw, 13);
      ctx.restore();
    });
  }
  const ONOMATO = { rex: 'GRRR!', deino: 'KLAP!', boss: 'BRAĆ GO!', baron: 'HA HA!', padliniarz: 'BUM!', zmija: 'SSSS!', szpon: 'OGNIA!', klin: 'TRZASK!', klamra: 'CIACH!' };
  function drawStoryText() {
    const S_ = app.story;
    storyPanels().forEach((K, i) => {
      if (i > S_.i) return;
      const [x, y, w, h] = K.r, B = K.b, cur = i === S_.i;
      let n = cur ? S_.t * 1.1 : 1e9;
      K.lines.forEach((l, k) => { text(storyText(l, n), B.bx + 7, B.by + 6 + k * 9, 5, '#1a1014', 'left', true); n -= l.length; });
      const cw = K.sp.name.length * 4 + 14;
      text(K.sp.name, K.left ? x + w - cw / 2 : x + cw / 2, y + h - 11, 4.5, '#1a1014', 'center', true);
      const who = S_.lines[i][0];
      if (!K.left && ONOMATO[who] && (!cur || S_.t > 10)) text(ONOMATO[who], K.left ? x + w - 10 : x + 10, y + h * 0.45, w > 150 ? 12 : 9, '#ffe040', K.left ? 'right' : 'left');
      if (cur && S_.t * 1.1 >= K.text.length && app.frame % 40 < 28) text('►', B.bx + B.bw - 9, B.by + B.bh - 9, 4.5, '#1a1014', 'left', true);
    });
    text('{attack|ENTER} — DALEJ   {back|ESC} — POMIŃ', W / 2, H - 13, 4, '#3a2a1a', 'center', true);
  }

  // =============================================================== EPILOG: UCIECZKA Z TWIERDZY
  // ---- prawdziwe zakończenie: uwolnij wszystkie dinozaury w Zagrodzie i odkryj 3 sekrety w jednym przejściu
  const trueReady = () => app.gameMode === 'arcade' && app.run && app.run.cages && app.run.secrets >= 3;
  let TRUE_STAGE = null;
  function trueFinalStage() {
    if (TRUE_STAGE) return TRUE_STAGE;
    TRUE_STAGE = Object.assign({}, STAGES[5], {
      name: 'FINAŁ — ŚWIT NAD ZATOKĄ', sub: 'BURSZTYNOWY KOLOS WYCHODZI Z MORZA', label: 'F', special: 'truefinal',
      LEN: W + 40, startX: 90, music: 'final', bossMusic: 'final', EVENT: null, VEHICLES: [], PROPS: [],
      PICKUPS: [{ x: 160, y: 200, type: 'meat' }, { x: 260, y: 176, type: 'meat' }],
      WAVES: [{ lock: 0, boss: true, groups: [{ when: 0, spawns: [{ type: 'kolos', side: 'R', y: 185, delay: 60 }] }] }]
    });
    return TRUE_STAGE;
  }
  function startTrueFinal(team) {
    startStory('truefinal', team, () => {
      startStage(STAGES.length - 1, team, trueFinalStage());
      G.wx = Object.assign({ id: 'dawn' }, WEATHER.dawn);
      app.mode = 'play'; app.t = 0;
    });
  }
  // ---- etap specjalny: pociąg do Twierdzy (między Kanałami a Twierdzą)
  function startTrain(team, nextIdx) {
    team = team || makeTeam();
    saveProgress({ type: 'train', next: nextIdx }, team);
    app.trainNext = nextIdx;
    startStory('train', team, () => { startStage(6, team, window.SPECIAL_STAGES.train); app.mode = 'play'; app.t = 0; });
  }
  function startEscape(team) {
    saveProgress({ type: 'escape' }, team);
    startStory('escape', team, () => { startStage(STAGES.length - 1, team, window.SPECIAL_STAGES.escape); app.mode = 'play'; app.t = 0; });
  }
  function updateEscape() {
    const E = G.esc || (G.esc = { lava: G.camX - 40, speed: 1, spawnT: 0, rockT: 0, done: false });
    if (G.introT > 0 || E.done) return;
    E.speed = Math.min(2.1, 0.9 + G.playT / 2600);
    G.camX = Math.min(ST.LEN - W, G.camX + E.speed);
    E.lava = G.camX + 8 + Math.sin(G.frame * 0.06) * 5;
    for (const a of G.actors) {
      if (!a.alive || a.hazT > 0 || !hittable(a)) continue;
      if (a.x < E.lava + 16) { a.hazT = 30; hurt(a, a.kind === 'player' ? 16 : 40, 1, true, null, { unblock: true }); a.vx = 3; sfx('zap'); }
    }
    if (++E.rockT >= 42) { E.rockT = 0; shoot({ type: 'rock', x: G.camX + rnd(70, W - 20), y: rnd(FLOOR_TOP + 10, FLOOR_BOTTOM - 4), z: 150, vz: 0, life: 999 }); }
    if (++E.spawnT >= 150) {
      E.spawnT = 0;
      const types = ['grunt', 'thin', 'shield', 'brute', 'netter'];
      G.pending.push({ type: types[Math.random() * types.length | 0], side: 'R', y: rnd(FLOOR_TOP + 10, FLOOR_BOTTOM - 4), delay: 1 });
    }
    if (++G.timerT >= 100) {
      G.timerT = 0; G.timer--;
      if (G.timer <= 10 && G.timer > 0) sfx('select');
      if (G.timer <= 0) { G.timer = 99; for (const q of G.players) if (q.alive && q.state !== 'dead') { q.hp = 0; onDeath(q); setState(q, 'fall'); q.vz = 3; } }
    }
    if (G.camX >= ST.LEN - W - 1 && G.players.some(q => q.alive && q.x > ST.LEN - 110)) {
      E.done = true; G.bossDead = true; G.clearT = 0; AU.stopMusic(0.5); G.shake = 10;
      G.popups.push({ x: G.camX + W / 2, y: 110, txt: 'UCIECZKA UDANA!', t: 0, col: '#7cff7c' });
      G.actors.forEach(a => { if (a.team !== 'player' && a.alive && a.hp > 0) { a.hp = 0; onDeath(a); setState(a, 'fall'); a.vz = 3; } });
    }
  }

  // =============================================================== BOSS RUSH
  const RUSH_ORDER = [0, 1, 2, 3, 4, 5, 6, 7];
  function startRush(team) { app.rush = { i: 0, frames: 0, done: 0 }; rushFight(team); }
  function rushFight(team) {
    const idx = RUSH_ORDER[app.rush.i];
    startStage(idx, team);
    G.rush = true; G.introT = 0; G.rushCard = 150;
    const WV = G.WAVES, last = WV.length - 1;
    G.waveIdx = last; G.camX = WV[last].lock;
    G.players.forEach((q, i) => { q.x = G.camX + 70 + i * 26; q.y = 180 + i * 14; setState(q, 'idle'); });
    app.mode = 'play'; app.t = 0;
  }
  function rushNext() {
    const R = app.rush; R.done++; R.i++;
    if (R.i >= RUSH_ORDER.length) { unlock('rush'); rushEnd(); return; }
    rushFight(G.players);
  }
  function rushEnd() {
    const R = app.rush;
    endRun('rush', G.players.map(q => ({ b: R.done, f: R.frames, c: q.key, pIdx: q.pIdx })));
  }

  // =============================================================== PRZETRWANIE
  const SURV_POOLS = [['grunt', 'thin'], ['brute', 'bomber', 'raptor'], ['gunner', 'shield', 'netter', 'pachy', 'para'], ['sniper', 'ptera', 'trike']];
  const SURV_BOSSES = ['boss', 'zmija', 'klin', 'szpon', 'baron', 'rex'];
  function startSurvival(team) {
    startStage(0, team, window.SPECIAL_STAGES.survival);
    G.surv = { wave: 0, state: 'rest', t: 120 };
    app.mode = 'play'; app.t = 0;
  }
  function spawnSurvWave(n) {
    ST.diff = Math.min(2.2, 1 + n * 0.05);
    const pool = [].concat(...SURV_POOLS.slice(0, 1 + Math.min(3, Math.floor(n / 3))));
    const cnt = Math.min(2 + Math.floor(n * 0.7), 9);
    for (let i = 0; i < cnt; i++) {
      const tp = pool[Math.random() * pool.length | 0];
      G.pending.push({ type: tp, side: i % 2 ? 'L' : 'R', y: rnd(FLOOR_TOP + 10, FLOOR_BOTTOM - 4), delay: 1 + i * 35 });
    }
    if (n % 10 === 0) G.pending.push({ type: SURV_BOSSES[(n / 10 - 1) % SURV_BOSSES.length], side: 'R', y: 186, delay: 60 });
    else if (n % 5 === 0) G.pending.push({ type: 'whitefang', side: 'L', y: 190, delay: 60 });
    G.popups.push({ x: G.camX + W / 2, y: 110, txt: 'FALA ' + n, t: 0, col: '#ffe080' });
    sfx('go');
  }
  function updateSurvival() {
    const V = G.surv;
    if (G.introT > 0) return;
    if (V.state === 'rest') {
      if (--V.t <= 0) { V.wave++; spawnSurvWave(V.wave); V.state = 'fight'; }
      return;
    }
    if (G.pending.length === 0 && foes().filter(a => a.hp > 0).length === 0) {
      V.state = 'rest'; V.t = 180;
      G.players.forEach(q => { if (q.alive) addScore(q, V.wave * 300); });
      G.popups.push({ x: G.camX + W / 2, y: 110, txt: 'FALA ' + V.wave + ' POKONANA!  +' + V.wave * 300, t: 0, col: '#7cff7c' });
      if (V.wave % 3 === 0) G.items.push({ type: 'meat', x: G.camX + W / 2, y: 190, z: 30, vz: 2, t: 0 });
      if (V.wave >= 10) unlock('surv10');
      sfx('coin');
    }
  }
  function survEnd() {
    const V = G.surv;
    endRun('surv', G.players.map(q => ({ w: Math.max(0, V.wave - (V.state === 'fight' ? 1 : 0)), s: q.score, c: q.key, pIdx: q.pIdx })));
  }
  function finishRun() {
    if (G && G.ch) { if (!G.ch.end) chalEnd(false, 'POKONANY!'); return; }
    if (app.gameMode === 'daily' && G) { endRun('daily', dailyRecs()); return; }
    if (G && G.rush) rushEnd();
    else if (G && G.special === 'survival') survEnd();
    else if (ST && ST.custom) leaveCustom();
    else endGame(ST.label);
  }

  // =============================================================== WŁASNE ETAPY (edytor)
  // Źródła: plik js/stages/custom.js (window.CUSTOM_STAGES) i biblioteka edytora w przeglądarce (paleo_custom).
  function customList() {
    const out = [], seen = {};
    const lib = loadJSON('paleo_custom');
    (Array.isArray(lib) ? lib : []).forEach(d => { if (d && d.id && !seen[d.id]) { seen[d.id] = 1; out.push(Object.assign({ _src: 'EDYTOR' }, d)); } });
    (window.CUSTOM_STAGES || []).forEach(d => { if (d && !seen[d.id]) { seen[d.id || Math.random()] = 1; out.push(Object.assign({ _src: 'PLIK' }, d)); } });
    return out;
  }
  const CUSTOM_TYPES = () => Object.keys(ENEMIES).filter(k => k !== 'dummy');
  function buildCustomStage(d) {
    const theme = clamp(d.theme | 0, 0, STAGES.length - 1), base = STAGES[theme];
    const LEN = clamp(Math.round(d.LEN || 2400), 800, base.LEN);
    const types = CUSTOM_TYPES(), numY = v => clamp(Math.round(+v || 185), FLOOR_TOP + 4, FLOOR_BOTTOM - 2);
    const WAVES = (d.WAVES || []).map(w => {
      const groups = (w.groups || []).map(g => ({ when: Math.max(0, g.when | 0),
        spawns: (g.spawns || []).filter(sp => types.includes(sp.type)).map(sp => ({ type: sp.type, side: sp.side === 'L' ? 'L' : 'R', y: numY(sp.y), delay: Math.max(0, sp.delay | 0) })) }))
        .filter(g => g.spawns.length);
      return { lock: clamp(Math.round(w.lock || 0), 0, LEN - W), groups, boss: groups.some(g => g.spawns.some(sp => ENEMIES[sp.type].boss)) };
    }).filter(w => w.groups.length).sort((a, b) => a.lock - b.lock);
    const PROPS = (d.PROPS || []).filter(pr => ['barrel', 'crate', 'fuel', 'wall'].includes(pr.kind)).map(pr => ({ x: clamp(Math.round(pr.x), 20, LEN - 20), y: numY(pr.y), kind: pr.kind, drop: pr.drop || undefined, secret: pr.kind === 'wall' ? (pr.secret || 'treasure') : undefined }));
    const PICKUPS = (d.PICKUPS || []).map(it => ({ x: clamp(Math.round(it.x), 20, LEN - 20), y: numY(it.y), type: it.type || 'coin' }));
    const VEHICLES = (d.VEHICLES || []).filter(v => v.type === 'jeep' || v.type === 'cart').map(v => ({ type: v.type, x: clamp(Math.round(v.x), 40, LEN - 40), y: numY(v.y) }));
    return Object.assign({}, base, {
      name: String(d.name || 'WŁASNY ETAP').toUpperCase().slice(0, 34), sub: String(d.sub || '').toUpperCase().slice(0, 48), label: 'W', custom: true,
      LEN, WAVES, PROPS, PICKUPS, VEHICLES, special: null, startX: 90,
      music: SONGS_OK(d.music) || base.music, bossMusic: SONGS_OK(d.bossMusic) || base.bossMusic,
      diff: clamp(+d.diff || 1, 0.6, 2.2), storm: !!d.storm && !!base.storm, weather: d.weather || null
    });
  }
  const SONGS_OK = k => (k && window.GameAudio && window.GameAudio.SONGS[k]) ? k : null;
  function startCustom(team) {
    const st = buildCustomStage(app.customData || {});
    startStage(clamp(app.customData.theme | 0, 0, STAGES.length - 1), team, st);
    G.wx = WEATHER[st.weather] ? Object.assign({ id: st.weather }, WEATHER[st.weather]) : null;
    app.mode = 'play'; app.t = 0;
  }
  function leaveCustom() {
    G = null; app.mode = 'extras'; app.sub = 'custom'; app.t = 0; AU.stopMusic(); AU.play('title');
  }

  // =============================================================== WYZWANIA
  // Krótkie zadania z gwiazdkami za czas. Rekordy: localStorage „paleo_chal” ({ id: { stars, best } }).
  const CHALLENGES = [
    { id: 'throws', name: 'RZUTOWIEC', desc: 'POKONAJ 10 WROGÓW RZUTAMI (CHWYT, RZUT W LOCIE, SUPLEX)', arena: 'surv', kind: 'throws', goal: 10, unit: 'RZUTY', limit: 240, stars: [90, 150] },
    { id: 'juggle', name: 'CYRK', desc: 'PODBIJ WROGÓW W POWIETRZU 12 RAZY (▲ + ATAK WYBIJA)', arena: 'surv', kind: 'juggles', goal: 12, unit: 'PODBICIA', limit: 120, stars: [60, 90] },
    { id: 'combo', name: 'MISTRZ KOMBO', desc: 'ZRÓB SERIĘ 25 TRAFIEŃ BEZ PRZERWY', arena: 'surv', kind: 'combo', goal: 25, unit: 'KOMBO', limit: 120, stars: [45, 80] },
    { id: 'nohit', name: 'NIETYKALNY', desc: 'POKONAJ 3 PIERWSZE FALE ZIELONEJ RDZY BEZ OBRAŻEŃ', stage: 0, kind: 'waves', goal: 3, unit: 'FALE', noHit: true, limit: 240, stars: [70, 110] },
    { id: 'sewer', name: 'SUCHA STOPA', desc: 'PRZEJDŹ KANAŁY OTCHŁANI BEZ DOTKNIĘCIA ŚCIEKÓW', stage: 6, kind: 'clear', noSludge: true, limit: 600, stars: [240, 330] },
    { id: 'zebacz', name: 'POSKROMICIEL', desc: 'POKONAJ ZĘBACZA W 60 SEKUND', stage: 6, boss: true, kind: 'clear', limit: 60, stars: [35, 48] },
    { id: 'padlin', name: 'KRÓL ŚMIECI', desc: 'POKONAJ PADLINIARZA W 75 SEKUND', stage: 5, boss: true, kind: 'clear', limit: 75, stars: [45, 60] }
  ];
  app.chal = loadJSON('paleo_chal') || {};
  function startChallenge(team) {
    const d = app.chDef;
    G = null; app.route = [];
    if (d.arena === 'surv') startSurvival(team);
    else {
      startStage(d.stage, team);
      if (d.boss) {
        const WV = G.WAVES, last = WV.length - 1;
        G.waveIdx = last; G.camX = WV[last].lock; G.introT = 0;
        G.players.forEach((q, i) => { q.x = G.camX + 70 + i * 26; q.y = 180 + i * 14; setState(q, 'idle'); });
      }
      app.mode = 'play'; app.t = 0;
    }
    G.wx = null;
    G.ch = { def: d, t: 0, throws: 0, juggles: 0, best: 0, prog: 0, hurt: false, sludge: false, end: false };
  }
  function updateChallenge() {
    const C = G.ch;
    if (!C || C.end || G.introT > 0) return;
    C.t++;
    const d = C.def;
    let ok = false;
    if (d.kind === 'throws') { C.prog = C.throws; ok = C.prog >= d.goal; }
    else if (d.kind === 'juggles') { C.prog = C.juggles; ok = C.prog >= d.goal; }
    else if (d.kind === 'combo') { C.best = Math.max(C.best, ...G.players.map(q => q.comboT > 0 ? q.combo : 0)); C.prog = C.best; ok = C.best >= d.goal; }
    else if (d.kind === 'waves') { C.prog = Math.min(G.waveIdx, d.goal); ok = G.waveIdx >= d.goal; }
    else ok = G.bossDead;
    if (d.noHit && C.hurt) return chalEnd(false, 'OTRZYMANO OBRAŻENIA!');
    if (d.noSludge && C.sludge) return chalEnd(false, 'DOTKNIĘTO ŚCIEKÓW!');
    if (ok) return chalEnd(true);
    if (C.t > d.limit * 60) chalEnd(false, 'KONIEC CZASU!');
  }
  function chalEnd(ok, why) {
    const C = G.ch, d = C.def;
    C.end = true;
    const secs = Math.ceil(C.t / 60), stars = ok ? (secs <= d.stars[0] ? 3 : secs <= d.stars[1] ? 2 : 1) : 0;
    const rec = app.chal[d.id] || { stars: 0, best: 0 };
    const newBest = ok && (!rec.best || secs < rec.best);
    rec.stars = Math.max(rec.stars, stars); if (newBest) rec.best = secs;
    app.chal[d.id] = rec; safeSet('paleo_chal', JSON.stringify(app.chal));
    if (CHALLENGES.every(c => (app.chal[c.id] || {}).stars >= 3)) unlock('chalall');
    app.chRes = { ok, why, secs, stars, newBest };
    app.mode = 'chalres'; app.t = 0; AU.stopMusic(0.3); AU.play(ok ? 'clear' : 'gameover');
  }
  const starStr = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const mmss = sec => Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  function drawChalHud() {
    const C = G.ch, d = C.def, secs = Math.floor(C.t / 60);
    const prog = d.goal ? '   ' + d.unit + ' ' + C.prog + '/' + d.goal : '';
    text(d.name + prog + '   ' + mmss(secs) + ' / ' + mmss(d.limit), W / 2, 34, 5, '#ffe080', 'center');
    if (d.noHit) text('BEZ OBRAŻEŃ!', W / 2, 43, 4, '#ff9a80', 'center');
    if (d.noSludge) text('NIE DOTYKAJ ŚCIEKÓW!', W / 2, 43, 4, '#a0ff60', 'center');
  }
  function drawChalRes() {
    const r = app.chRes, d = G.ch.def;
    text(d.name, W / 2, 50, 10, '#ffe080', 'center');
    text(r.ok ? 'WYZWANIE UKOŃCZONE!' : 'NIEUDANE — ' + (r.why || ''), W / 2, 72, 7, r.ok ? '#7cff7c' : '#ff8080', 'center');
    if (r.ok) {
      text(starStr(r.stars), W / 2, 92, 16, '#ffe040', 'center');
      text('CZAS ' + mmss(r.secs) + (r.newBest ? '   NOWY REKORD!' : ''), W / 2, 122, 6, '#fff', 'center');
      text('3★ DO ' + mmss(d.stars[0]) + '   2★ DO ' + mmss(d.stars[1]), W / 2, 136, 4, '#c0c0c0', 'center');
    }
    if (app.t > 40 && app.t % 50 < 35) text('{ok|ENTER} — POWTÓRZ   {back|ESC} — LISTA WYZWAŃ', W / 2, 170, 5, '#fff', 'center');
  }
  // ---- ekran listy wyzwań (pierwsza pozycja: codzienne wyzwanie)
  function drawChalList() { drawScoresBg(); }
  function drawChalListText() {
    text('WYZWANIA', W / 2, 8, 10, '#ffe080', 'center');
    const D = dailyPlan(), best = (app.tables.daily || [])[0];
    const rows = [{ name: 'CODZIENNE WYZWANIE ' + dailyLabel(), desc: shortName(STAGES[D.idx]) + ' • POGODA: ' + (WEATHER[D.wx] ? WEATHER[D.wx].name : 'POGODNIE') + ' • LOSOWI WROGOWIE • BEZ KONTYNUACJI', right: best ? 'REKORD ' + best.s : 'BRAK WYNIKÓW', daily: true }]
      .concat(CHALLENGES.map(c => { const r = app.chal[c.id] || { stars: 0, best: 0 }; return { name: c.name, desc: c.desc, right: starStr(r.stars) + (r.best ? '  ' + mmss(r.best) : '') }; }));
    rows.forEach((r, i) => {
      const y = 26 + i * 21, sel = i === app.chSel;
      text((sel ? '► ' : '') + r.name, 22, y, 6, sel ? '#ffe040' : r.daily ? '#80d0ff' : '#e0e0f0');
      text(r.right, W - 20, y, 5, r.daily ? '#80d0ff' : '#ffe040', 'right');
      text(r.desc, 34, y + 9, 3.5, sel ? '#fff' : '#a0a0b0');
    });
    const stars = CHALLENGES.reduce((a, c) => a + ((app.chal[c.id] || {}).stars || 0), 0);
    text('GWIAZDKI ' + stars + '/' + CHALLENGES.length * 3, W / 2, 196, 5, '#ffe080', 'center');
    text('▲▼ WYBÓR   {ok|ENTER} — GRAJ   {back|ESC} — POWRÓT', W / 2, 208, 4, '#c0c0c0', 'center');
  }

  // =============================================================== CODZIENNE WYZWANIE
  // Ten sam etap, pogoda i wrogowie dla wszystkich graczy danego dnia (ziarno z daty). Osobna tabela wyników na każdy dzień.
  const dailyId = () => { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
  const dailyLabel = () => { const k = dailyId(); return k.slice(6) + '.' + k.slice(4, 6) + '.' + k.slice(0, 4); };
  function seeded(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function dailyPlan() {
    const R = seeded(Number(dailyId()) * 2654435761 % 4294967296);
    const idx = Math.floor(R() * STAGES.length), list = STAGE_WX[idx] || ['clear'];
    return { idx, wx: list[Math.floor(R() * list.length)], seed: Math.floor(R() * 1e9) };
  }
  function startDaily(team) {
    const D = dailyPlan();
    G = null; app.route = []; app.ngpRun = false;
    startStage(D.idx, team);
    G.WAVES = shuffleWaves(STAGES[D.idx].WAVES, seeded(D.seed));
    G.wx = WEATHER[D.wx] ? Object.assign({ id: D.wx }, WEATHER[D.wx]) : null;
    G.daily = D;
    app.mode = 'play'; app.t = 0;
  }
  const dailyRecs = () => G.players.map(q => ({ s: q.score, st: ST.label, c: q.key, pIdx: q.pIdx }));

  // =============================================================== TRENING
  const TRAIN_ITEMS = [{ type: 'pipe', x: 110, y: 168 }, { type: 'rifle', x: 150, y: 206, ammo: 8 }, { type: 'dynamite', x: 420, y: 168, ammo: 3 }, { type: 'grenade', x: 470, y: 206, ammo: 3 }, { type: 'machete', x: 200, y: 200 }, { type: 'chain', x: 250, y: 172 }, { type: 'bottle', x: 530, y: 186, ammo: 2 }];
  function startTraining(team) {
    startStage(0, team, window.SPECIAL_STAGES.training);
    app.mode = 'play'; app.t = 0;
    G.train = { last: 0, total: 0, hits: 0, itemsT: 299, beastT: 420 };
    [[300, 176], [400, 202]].forEach(([x, y]) => { const d = makeEnemy('dummy', x, y); setState(d, 'idle'); d.face = -1; G.actors.push(d); });
  }
  function updateTraining() {
    const T = G.train;
    for (const d of G.actors) {
      if (d.type !== 'dummy' || d.hp >= d.maxHp) continue;
      const dmg = Math.round(d.maxHp - d.hp); d.hp = d.maxHp; d.lagHp = d.maxHp; d.dying = false;
      T.last = dmg; T.total += dmg; T.hits++;
      G.popups.push({ x: d.x + rnd(-8, 8), y: d.y - 64, txt: '-' + dmg, t: 0, col: dmg >= 12 ? '#ff9040' : '#fff' });
    }
    if (++T.itemsT >= 300) {
      T.itemsT = 0;
      TRAIN_ITEMS.forEach(ti => {
        if (G.players.some(q => q.weapon === ti.type) || G.items.some(it => it.type === ti.type)) return;
        G.items.push({ type: ti.type, x: ti.x, y: ti.y, z: 20, vz: 2, t: 0, ammo: ti.ammo || 3, dur: 16 });
      });
    }
    if (--T.beastT <= 0) {
      T.beastT = 900;
      const busy = G.actors.some(a => TAMEABLE.includes(a.kind) && a.alive) || G.players.some(q => q.mount);
      if (!busy) {
        const r = makeEnemy(TAMEABLE[Math.random() * TAMEABLE.length | 0], G.camX + W - 60, 192);
        r.hp = 0; r.tame = true; r.dying = true; r.face = -1; setState(r, 'tamed'); G.actors.push(r);
        G.popups.push({ x: r.x, y: r.y - 60, txt: 'ĆWICZ JAZDĘ!', t: 0, col: '#7cff7c' });
      }
    }
  }

  // =============================================================== ZAGRODA (etap bonusowy 2)
  function startCages(team, nextIdx) {
    if (team) saveProgress({ type: 'cages', next: nextIdx }, team);
    app.cageNext = nextIdx;
    startStage(4, team, window.SPECIAL_STAGES.cages);
    app.mode = 'play'; app.t = 0;
  }
  function updateCages() {
    if (G.cagesDone) {
      if (++G.clearT === 140) {
        const n = G.freed, all = n >= G.cageTotal;
        if (all) { unlock('cages'); if (app.run) app.run.cages = true; }
        app.results = G.players.map(q => {
          const time = all ? G.timer * 200 : 0, v = n * 1000 + (all ? 10000 : 0) + time;
          addScore(q, v); saveHi(q.score);
          return { cages: true, freed: n, all, time, total: v, p: q };
        });
        app.mode = 'clear'; app.t = 0;
      }
      return;
    }
    if (G.introT > 0) return;
    if (++G.timerT >= 60) { G.timerT = 0; G.timer--; if (G.timer <= 10 && G.timer > 0) sfx('select'); }
    if (G.freed >= G.cageTotal || G.timer <= 0) {
      G.cagesDone = true; G.clearT = 0; G.timer = Math.max(0, G.timer);
      const ok = G.freed >= G.cageTotal;
      AU.stopMusic(0.5); AU.play(ok ? 'clear' : 'gameover');
      if (ok) G.players.forEach(q => shout(q, 'win'));
      G.popups.push({ x: G.camX + W / 2, y: 110, txt: ok ? 'WSZYSTKIE UWOLNIONE!' : 'KONIEC CZASU!', t: 0, col: ok ? '#7cff7c' : '#ff6060' });
      G.actors.forEach(a => { if (a.team !== 'player' && a.alive && a.hp > 0) { a.hp = 0; onDeath(a); setState(a, 'fall'); a.vz = 3; } });
      G.players.forEach(q => { q.victory = ok; });
      return;
    }
    if (G.frame % 200 === 0 && foes().filter(a => a.hp > 0).length < 2 + G.players.length) {
      const types = ['grunt', 'thin', 'shield', 'netter', 'grunt'];
      G.pending.push({ type: types[Math.random() * types.length | 0], side: Math.random() < 0.5 ? 'L' : 'R', y: rnd(FLOOR_TOP + 10, FLOOR_BOTTOM - 4), delay: 1 });
    }
  }

  // =============================================================== FALE / KAMERA
  function updateWaves() {
    const WV = G.WAVES;
    if (!G.wave && G.waveIdx < WV.length && G.camX >= WV[G.waveIdx].lock - 0.5) {
      G.wave = WV[G.waveIdx]; G.groupIdx = 0; G.lockX = G.wave.lock;
      queueGroup(G.wave.groups[0]);
      if (G.wave.boss) AU.play(ST.bossMusic, { xfade: 2.5 });
    }
    customEnd();
    for (let i = G.pending.length - 1; i >= 0; i--) {
      const s = G.pending[i];
      if (--s.delay > 0) continue;
      G.pending.splice(i, 1);
      const hop = s.side === 'T' || s.side === 'B';   // wskakuje z boku toru (pociąg) — z tyłu albo z przodu platformy
      const x = hop ? G.camX + rnd(70, W - 70) : s.side === 'L' ? G.camX - 30 : G.camX + W + 30;
      const e = makeEnemy(s.type, x, s.y || 186);
      e.face = s.side === 'L' ? 1 : -1;
      if (hop) {
        const dk = ST.deck || { y0: FLOOR_TOP + 10, y1: FLOOR_BOTTOM - 4 };
        e.y = s.side === 'T' ? FLOOR_TOP + 6 : FLOOR_BOTTOM;
        const to = s.side === 'T' ? dk.y0 + 8 : dk.y1 - 8;
        setState(e, 'hopin'); e.z = 10; e.vz = 5; e.fvy = (to - e.y) / 33; e.face = e.x < G.camX + W / 2 ? 1 : -1; sfx('jump');
      }
      if (s.type === 'sniper') { e.perch = true; e.z = 42; e.x = s.side === 'L' ? G.camX + 46 : G.camX + W - 46; e.y = FLOOR_TOP + 8; setState(e, 'idle'); e.cool = 80; }
      if (s.type === 'ptera') e.z = 80;
      if (OPTS.assist && !app.demo && HINTS[s.type] && !app.hinted[s.type]) { app.hinted[s.type] = 1; G.hint = { txt: HINTS[s.type], t: 300 }; }
      G.actors.push(e);
    }
    if (G.wave) {
      const alive = foes().filter(a => a.hp > 0).length;
      if (G.pending.length === 0) {
        const next = G.wave.groups[G.groupIdx + 1];
        if (next && alive <= next.when) { G.groupIdx++; queueGroup(next); }
        else if (!next && alive === 0 && !G.wave.boss) {
          G.wave = null; G.waveIdx++; G.lockX = null; G.goT = 180; G.timer = 99; sfx('go');
        }
      }
    }
  }
  // własny etap bez bossa kończy się po ostatniej fali na końcu planszy
  function customEnd() {
    if (!ST.custom || G.bossDead || G.wave || G.waveIdx < G.WAVES.length) return;
    if (G.camX >= ST.LEN - W - 4 && !foes().some(a => a.hp > 0) && !G.pending.length) { G.bossDead = true; G.clearT = 0; AU.stopMusic(0.5); }
  }
  function queueGroup(g) { g.spawns.forEach(s => G.pending.push(Object.assign({}, s, { delay: (s.delay || 0) + 1 }))); }

  // NG+: wrogowie podmieniani w obrębie swojej grupy
  const TIERS = [['grunt', 'thin', 'bomber', 'netter'], ['brute', 'shield', 'gunner', 'sniper'], ['raptor', 'pachy', 'para', 'trike', 'ptera']];
  function shuffleWaves(WV, rand) {
    rand = rand || Math.random;
    const copy = JSON.parse(JSON.stringify(WV));
    copy.forEach(w => w.groups.forEach(g => g.spawns.forEach(sp => {
      if (ENEMIES[sp.type].boss) return;
      const tier = TIERS.find(t => t.includes(sp.type));
      if (tier) sp.type = tier[rand() * tier.length | 0];
    })));
    return copy;
  }
  function updateCamera() {
    if (G.special === 'escape') return;
    const ps = G.players.filter(q => q.alive && q.state !== 'dead');
    if (!ps.length) return;
    const minX = Math.min(...ps.map(q => q.x)), farX = Math.max(...ps.map(q => q.x));
    let target = Math.min((minX + farX) / 2 - W * 0.42, minX - 24);
    const maxX = G.lockX !== null ? G.lockX : (G.waveIdx < G.WAVES.length ? G.WAVES[G.waveIdx].lock : ST.LEN - W);
    target = clamp(target, G.special ? 0 : G.camX, Math.min(maxX, ST.LEN - W));
    G.camX += clamp(target - G.camX, -2.6, 2.6);
  }

  // =============================================================== AKTUALIZACJA
  // dynamiczna muzyka: perkusja dochodzi przy kombo 10+ albo gdy bossom zostało < 25% życia
  function tension() {
    if (G.bossDead) return false;
    if (G.players.some(q => q.combo >= 10 && q.comboT > 0)) return true;
    let hp = 0, max = 0;
    for (const a of G.actors) if (isBoss(a) && a.team !== 'player' && !a.dying) { hp += Math.max(0, a.hp); max += a.maxHp; }
    return max > 0 && hp < max * 0.25;
  }
  function updateGame() {
    G.frame++;
    AU.setIntensity(tension());
    if (G.introT > 0) G.introT--;
    if (G.goT > 0) G.goT--;
    if (G.lastEnemyT > 0) G.lastEnemyT--;
    if (G.shake > 0) G.shake--;
    for (let i = G.fx.length - 1; i >= 0; i--) {
      const f = G.fx[i]; f.t++;
      if (f.type === 'debris') { f.x += f.vx; f.vz -= GRAV; f.z += f.vz; if (f.z < 0) { f.z = 0; f.vz *= -0.4; f.vx *= 0.6; } }
      if (f.type === 'baby') f.x += f.dir * 2.4;
      if (f.t >= f.life) G.fx.splice(i, 1);
    }
    for (let i = G.popups.length - 1; i >= 0; i--) { if (++G.popups[i].t > 60) G.popups.splice(i, 1); }
    if (G.hint && G.hint.t > 0) G.hint.t--;
    if (G.superFreeze > 0) { G.superFreeze--; return; }
    if (G.teamSuperT > 0 && --G.teamSuperT === 0) teamBlast();
    for (const a of G.actors) { a._px = a.x; a._py = a.y; }
    if (G.hitstop > 0) { G.hitstop--; return; }
    if (G.slowmo > 0) { G.slowmo--; if (G.slowmo % 3) return; }

    for (const p of G.players) {
      if (!p.alive) continue;
      if (p.state === 'drop') {
        p.vz -= GRAV; p.z += p.vz;
        if (p.z <= 0) {
          p.z = 0; setState(p, 'land'); sfx('slam'); G.shake = 8;
          G.fx.push({ type: 'shock', x: p.x, y: p.y, z: 0, t: 0, life: 20, r: 70 });
          for (const e of foes()) if (hittable(e) && !isBoss(e) && Math.abs(e.x - p.x) < 90) hurt(e, 4, e.x > p.x ? 1 : -1, true, p);
        }
      } else if (!updateCommon(p)) updatePlayer(p);
      else p.t++;
    }
    const p = G.player;
    for (const a of G.actors) {
      if (a.kind === 'player') continue;
      if (a.kind === 'raptor') updateRaptor(a);
      else if (a.kind === 'pachy') updatePachy(a);
      else if (a.kind === 'ptera') updatePtera(a);
      else if (a.kind === 'trike') updatePachy(a);
      else if (a.kind === 'para') updatePara(a);
      else if (a.kind === 'rex') updateRex(a);
      else if (a.kind === 'boss') updateBoss(a);
      else if (a.kind === 'glider') updateGlider(a);
      else if (a.kind === 'digger') updateDigger(a);
      else updateHuman(a);
    }
    updateShots();
    updateFires();
    updateHazards();
    updateEvents();
    if (G.ch) updateChallenge();
    for (const a of G.actors) {
      if (a.flash > 0) a.flash--;
      if (a.invuln > 0) a.invuln--;
      a.lagHp += (a.hp - a.lagHp) * 0.06;
      if (a.state !== 'enter') {
        const dk = ST.deck && !['fall', 'thrown', 'down', 'dead', 'hopin'].includes(a.state);   // pociąg: chodzimy tylko po platformie
        a.y = clamp(a.y, dk ? ST.deck.y0 : FLOOR_TOP + 6, dk ? ST.deck.y1 : FLOOR_BOTTOM);
        if (a.kind === 'player') a.x = clamp(a.x, G.camX + 10, G.camX + W - 10);
        else if (a.kind === 'rex' && a.alive) a.x = clamp(a.x, G.camX + 90, G.camX + W - 90);
        else if (!['dead', 'down', 'fall', 'thrown'].includes(a.state)) a.x = clamp(a.x, G.camX - 40, G.camX + W + 40);
      }
    }
    // przypływ: woda spowalnia wszystkich (poza bossami) w zalanym pasie
    if (G.tideY > FLOOR_TOP + 8) for (const a of G.actors) {
      if (a._px === undefined || a.z > 2 || a.y > G.tideY || isBoss(a) || a.state === 'enter') continue;
      a.x = a._px + (a.x - a._px) * 0.5; a.y = a._py + (a.y - a._py) * 0.5;
      if (a.kind === 'player' && !a.wetMsg) { a.wetMsg = true; G.popups.push({ x: a.x, y: a.y - 50, txt: 'WODA SPOWALNIA!', t: 0, col: '#80d0ff' }); }
    }
    G.actors = G.actors.filter(a => !a.remove);
    for (const pr of G.props) if (pr.shake > 0) pr.shake--;
    for (const it of G.items) { it.t++; if (it.z > 0 || it.vz > 0) { it.vz -= GRAV; it.z += it.vz; if (it.z <= 0) { it.z = 0; it.vz = 0; } } }
    G.items = G.items.filter(it => !(it.t > 900 && isWeaponItem(it.type)));

    updateWaves();
    updateCamera();

    for (const q of G.players) { if (q.comboPulse > 0) q.comboPulse--; if (q.comboT > 0 && --q.comboT === 0) finishCombo(q); }
    if (G.introT <= 0 && !G.bossDead) G.playT++;
    if (G.rush && !G.bossDead) app.rush.frames++;
    if (G.rushCard > 0) G.rushCard--;
    if (G.special === 'survival' || G.special === 'training') G.timer = 99;
    if (G.special === 'cages') updateCages();
    else if (G.special === 'training') updateTraining();
    else if (G.special === 'survival') updateSurvival();
    else if (G.special === 'escape') { if (!G.bossDead) updateEscape(); }
    else if (!G.bossDead && G.introT <= 0 && G.players.some(q => q.alive)) {
      if (++G.timerT >= 100) {
        G.timerT = 0; G.timer--;
        if (G.timer <= 0) {
          G.timer = 99;
          for (const q of G.players) if (q.alive && q.state !== 'dead') { if (q.mount) dismount(q, false); q.hp = 0; onDeath(q); setState(q, 'fall'); q.vz = 3; G.popups.push({ x: q.x, y: q.y - 60, txt: 'CZAS!', t: 0, col: '#ff6060' }); }
        }
      }
    }
    if (G.bossDead) {
      G.clearT++;
      if (G.clearT === 150) { AU.play('clear'); G.players.forEach(q => { q.victory = true; if (q.mount) dismount(q, false); }); }
      G.players.forEach((q, i) => { if (G.clearT === 158 + i * 40 && q.alive) shout(q, 'win'); });
      if (G.rush) { if (G.clearT > 120) rushNext(); return; }
      if (G.clearT > 330) {
        const secs = Math.round(G.playT / 60);
        app.results = G.players.map(q => {
          const time = q.alive ? G.timer * 100 : 0, life = q.alive ? Math.max(0, Math.round(q.hp)) * 50 : 0;
          if (q.comboT > 0) { q.comboT = 0; finishCombo(q); }
          const st = q.st || { kills: 0, maxCombo: 0, dmg: 0, deaths: 0 };
          const rank = rankOf(st, secs), rankBonus = RANK_BONUS[rank];
          addScore(q, time + life + rankBonus); saveHi(q.score);
          if (st.dmg === 0) unlock('nodmg');
          if (rank === 'S') unlock('rankS');
          markCleared(q.key);
          return { time, life, p: q, st, rank, rankBonus, secs };
        });
        if (G.players.length > 1) unlock('coop');
        app.mode = 'clear'; app.t = 0;
      }
    }
  }
  function saveHi(score) { if (score > app.hiscore) app.hiscore = score; }

  // =============================================================== RYSOWANIE ŚWIATA
  function poseOf(a) {
    const T = a.animT;
    switch (a.state) {
      case 'idle': return a.victory ? P.victory[0] : P.breathe[Math.floor(((G ? G.frame : app.frame || 0) + (a.pIdx || 0) * 17 + Math.round(a.x)) / 14) % 4];
      case 'walk': case 'enter':
        if (a.kind === 'player' && a.running) return P.run[Math.floor(T / 5) % 4];
        return P.walk[Math.floor(T / 7) % 4];
      case 'attack': {
        // zamach: przed aktywną klatką ręka (albo kolano) cofa się — wyraźniejszy, „automatowy” cios
        const m = a.move;
        if (a.t < m.start) {
          if (m.wind) return P[m.wind][0];
          if (m.start >= 3 && a.t < m.start - 1) return (m.pose === 'kick' || m.pose === 'spinkick') ? P.kickWind[0] : P.chamber[0];
        }
        return P[m.pose][0];
      }
      case 'jump': return a.jumpAtk ? P.jumpkick[0] : P.jump[0];
      case 'drop': case 'flip': return P.jump[0];
      case 'land': case 'getup': case 'pickup': case 'recover': return P.crouch[0];
      case 'dash': return P.dash[0];
      case 'block': return P.guard[0];
      case 'super':
        if (a.key === 'bursztyn') return a.t % 14 < 7 ? P.hammerUp[0] : P.hammerDown[0];
        if (a.key === 'kruk') return a.t % 6 < 3 ? P.lob[0] : P.throw[0];
        if (a.key === 'nina') return P.jumpkick[0];
        if (a.key === 'tur') return a.slammed ? P.hammerDown[0] : P.hammerUp[0];
        return P.spin[Math.floor(a.t / 3) % 2];
      case 'special':
        if (a.key === 'bursztyn') return P.stab[0];
        if (a.key === 'nina') return P.jumpkick[0];
        if (a.key === 'tur') return a.slammed ? P.hammerDown[0] : P.hammerUp[0];
        return P.spin[Math.floor(a.t / 4) % 2];
      case 'cmd':
        if (a.key === 'kruk' || a.key === 'padlin' || a.key === 'zmijka') return a.t < 8 ? P.lob[0] : P.throw[0];
        if (a.key === 'nina') return P.dash[0];
        if (a.key === 'bursztyn') return P.hammerDown[0];
        return P.charge[0];
      case 'airthrow': return P.throw[0];
      case 'teamthrow': return P.throw[0];
      case 'teamfly': return P.jumpkick[0];
      case 'rage': return P.taunt[0];
      case 'rampage': return P.spin[Math.floor(a.animT / 3) % 2];
      case 'rampwait': return P.charge[0];
      case 'winded': return P.bow[0];
      case 'suplex': return a.t < 14 ? P.throw[0] : P.crouch[0];
      case 'shoot': case 'aim': case 'aimH': case 'snipeAim': return P.aim[0];
      case 'throwNet': return a.t < 10 ? P.lob[0] : P.throw[0];
      case 'flame': return P.aim[0];
      case 'hopin': return P.jump[0];
      case 'lift': return a.t < 6 ? P.crouch[0] : P.hammerUp[0];
      case 'carry': return P.hammerUp[0];
      case 'heave': return a.t < 6 ? P.hammerUp[0] : P.throw[0];
      case 'netted': return P.bow[0];
      case 'toss': return a.t < 8 ? P.lob[0] : P.throw[0];
      case 'grab': return P.grab[0];
      case 'knee': return a.t < 8 ? P.knee[0] : P.grab[0];
      case 'throw': return a.t < 6 ? P.grab[0] : P.throw[0];
      case 'lob': case 'throwKnife': case 'throwKnives': return a.t < 10 ? P.lob[0] : P.throw[0];
      case 'cast': return a.t < 18 ? P.hammerUp[0] : P.hammerDown[0];
      case 'hurt': return a.hurtCount % 2 ? P.hurt2[0] : P.hurt[0];
      case 'stun': return P.bow[0];
      case 'grabbed': return P.hurt2[0];
      case 'fall': case 'thrown': return P.fall[0];
      case 'down': case 'dead': return P.down[0];
      case 'dashkick': return a.t < 10 ? P.crouch[0] : P.jumpkick[0];
      case 'charge': return a.t < 26 || (a.kind === 'boss' && a.t < 30) ? P.crouch[0] : (a.kind === 'boss' ? P.charge[0] : P.belly[0]);
      case 'slam': return P.hammerUp[0];
      case 'intro': return a.t < 40 ? P.taunt[0] : (a.def.ai === 'hammer' ? P.hammerUp[0] : P.victory[0]);
      default: return P.idle[0];
    }
  }

  function drawActor(a) {
    if (a.alpha === 0) return;
    if (a.state === 'dead' && G.frame % 4 < 2) return;
    if (a.invuln > 0 && a.kind === 'player' && a.state !== 'special' && G.frame % 4 < 2) return;
    const sx = a.x - G.camX, sy = a.y - a.z;
    const flash = a.flash > 0 && (a.flash % 2 === 0 || (G.hitstop > 0 && a.flash >= 4));
    if (a.kind === 'ptera') {
      const st = a.state === 'swoop' ? 'swoop' : ['fall', 'down', 'dead', 'thrown'].includes(a.state) ? 'down' : 'fly';
      SP.drawPtera(ctx, sx, sy, a.face, a.animT, st, { flash });
      return;
    }
    if (a.kind === 'raptor' || a.kind === 'rex') {
      const biteOn = a.kind === 'rex' ? (a.state === 'attack' && a.t > a.move.start - 4) : (a.t > 5 && a.t < 16);
      const map = { idle: 'idle', walk: 'walk', run: 'run', enter: a.kind === 'rex' ? 'walk' : 'run', bite: biteOn ? 'bite' : 'idle', attack: biteOn ? 'bite' : 'hurt',
        hurt: 'hurt', fall: 'down', thrown: 'down', down: 'down', dead: 'down', getup: 'idle', roar: 'roar', charge: a.t < 34 ? 'roar' : 'run', dazed: 'hurt', tail: 'hurt' };
      let face = a.face;
      if (a.state === 'tail' && a.t >= 14 && a.t < 24) face = -face;
      map.tamed = 'idle'; map.flee = 'run'; map.hopin = 'run';
      SP.drawRaptor(ctx, sx, sy, face, a.animT, map[a.state] || 'idle', a.cols, a.kind === 'rex' ? { flash, scale: 2.3, rex: true } : { flash });
      if (a.rider) {
        const bob = ['walk', 'run', 'enter'].includes(a.state) ? Math.abs(Math.sin(a.animT * 0.25)) * 2 : 0;
        SP.drawFigure(ctx, a.rider, SEAT, sx - a.face, sy - 25 - bob, a.face, { flash, weapon: map[a.state] === 'bite' ? null : 'knife' });
      }
      if (a.state === 'tamed') drawStars(sx + a.face * 18, sy - 44);
      if (a.state === 'dazed') drawStars(sx + a.face * 40, sy - 70);
      return;
    }
    if (a.kind === 'trike' || a.kind === 'para') {
      const map = { idle: 'idle', walk: 'walk', run: 'run', enter: 'walk', roar: a.kind === 'para' ? 'roar' : 'idle', windup: 'windup', charge: 'charge', recover: 'idle', bite: 'idle',
        hurt: 'idle', fall: 'down', thrown: 'down', down: 'down', dead: 'down', getup: 'idle', tamed: 'idle', flee: 'run' };
      (a.kind === 'trike' ? SP.drawTrike : SP.drawPara)(ctx, sx, sy, a.face, a.animT, map[a.state] || 'idle', a.cols, { flash });
      if (a.state === 'tamed') drawStars(sx + a.face * 20, sy - 50);
      return;
    }
    if (a.kind === 'pachy') {
      const map = { idle: 'idle', walk: 'walk', enter: 'walk', roar: 'idle', windup: 'windup', charge: 'charge', recover: 'idle', hurt: 'idle', fall: 'down', thrown: 'down', down: 'down', dead: 'down', getup: 'idle', tamed: 'idle', flee: 'run' };
      SP.drawPachy(ctx, sx, sy, a.face, a.animT, map[a.state] || 'idle', a.cols, { flash });
      if (a.state === 'tamed') drawStars(sx + a.face * 20, sy - 44);
      return;
    }
    if (a.kind === 'player' && a.mount) { drawRider(a, sx, sy, flash); return; }
    if (a.kind === 'digger') { drawDigger(a, sx, sy, flash); return; }
    if (a.kind === 'glider') { drawGlider(a, sx, sy, flash); return; }
    const pose = poseOf(a);
    let face = a.face;
    if (a.state === 'special' && Math.floor(a.t / 4) % 2 && (a.key === 'kruk' || a.key === 'borys')) face = -face;
    if (a.state === 'super' && a.key === 'borys' && Math.floor(a.t / 3) % 2) face = -face;
    const opt = { flash, hurtFace: ['hurt', 'grabbed', 'fall', 'down', 'stun'].includes(a.state) };
    if (a.airHeld) opt.rot = Math.PI * a.face;
    if (a.state === 'special' && a.key === 'nina') opt.rot = -a.t * 0.42 * a.face;
    if (a.state === 'thrown') opt.rot = a.t * 0.35;
    if (a.state === 'flip') opt.rot = -a.t * 0.4 * a.face;
    const wpn = a.weapon || (a.def && a.def.innate);
    if (wpn && !['down', 'dead', 'fall', 'thrown'].includes(a.state)) {
      opt.weapon = wpn;
      if ((a.weapon || (a.def && a.def.innate)) === 'whip' && a.state === 'attack' && a.move.whip && a.t >= a.move.start && a.t < a.move.start + a.move.active + 4) opt.weapon = 'whipOut';
      if (a.weapon === 'dynamite' && a.state === 'lob' && a.t >= 14) opt.weapon = null;
      if (a.state === 'toss' && a.t >= 8) opt.weapon = null;
    }
    let jitter = 0;
    if (isBoss(a) && a.armor && G.frame % 4 < 2) jitter = 1;
    if (a.perch) drawPerch(sx, a.y, a.z);
    if (a.alpha < 1) ctx.globalAlpha = Math.max(0, a.alpha);
    const sk = SP.drawFigure(ctx, a.b, pose, sx + jitter, sy, face, opt);
    if (!G.reflecting) drawTrail(a, sk, sx + jitter, sy, face, pose);
    drawFlame(a, sx, sy);
    drawCarried(a, sx, sy);
    // garda: półprzezroczysta tarcza przed postacią i pasek wytrzymałości gardy
    if (a.kind === 'player' && (a.state === 'block' || (a.guard !== undefined && a.guard < 99))) {
      const gx = sx + a.face * 13 * scaleOf(a), gy = sy - 26 * scaleOf(a), k = a.blockFlash > 0 ? 1 : 0.55;
      if (a.state === 'block') {
        ctx.strokeStyle = `rgba(128,240,255,${0.5 * k + 0.15 * Math.sin(G.frame * 0.3)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(gx, gy, 5, 16 * scaleOf(a), 0, a.face > 0 ? -Math.PI / 2 : Math.PI / 2, a.face > 0 ? Math.PI / 2 : Math.PI * 1.5); ctx.stroke();
      }
      const g = Math.max(0, a.guard) / 100, bw = 22;
      ctx.fillStyle = '#000'; ctx.fillRect(sx - bw / 2 - 1, sy + 4, bw + 2, 3);
      ctx.fillStyle = g > 0.4 ? '#80f0ff' : (G.frame % 10 < 5 ? '#ff6040' : '#ffb040'); ctx.fillRect(sx - bw / 2, sy + 5, bw * g, 1);
    }
    ctx.globalAlpha = 1;
    if (a.kind === 'player') drawPlayerMark(a, sx, sy - 66 * scaleOf(a));
    if (a.state === 'netted') SP.drawNetOver(ctx, sx, sy, 52 * scaleOf(a));
    // celownik laserowy
    if ((a.state === 'aim' && a.t < 40) || (a.state === 'aimH' && a.t < 34)) {
      if (G.frame % 4 < 3) {
        const gy = sy - 24 * scaleOf(a);
        ctx.strokeStyle = 'rgba(255,40,40,0.75)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx + a.face * 26 * scaleOf(a), gy); ctx.lineTo(a.face > 0 ? W : 0, gy); ctx.stroke();
      }
    }
    if (isBoss(a) && a.armor && a.state === 'attack') {
      ctx.strokeStyle = G.frame % 4 < 2 ? '#9ff' : '#ff6'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) ctx.lineTo(sx + rnd(-20, 20) - a.face * 14, sy - 70 + rnd(-12, 12));
      ctx.stroke();
    }
    if (a.def && a.def.ai === 'baron' && a.hp < a.maxHp * 0.5 && a.alpha > 0.5) {
      ctx.strokeStyle = `rgba(255,190,60,${0.4 + Math.sin(G.frame * 0.3) * 0.3})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(sx, sy - 34, 20, 40, 0, 0, Math.PI * 2); ctx.stroke();
    }
    if (a.state === 'stun') drawStars(sx, sy - 52 * scaleOf(a));
  }
  // znacznik 1P/2P nad głową (tylko w grze dwuosobowej)
  function drawPlayerMark(a, x, y) {
    if (G.players.length < 2 || !a.alive) return;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(x - 4, y - 1); ctx.lineTo(x + 4, y - 1); ctx.lineTo(x, y + 5); ctx.fill();
    ctx.fillStyle = P_COLS[a.pIdx]; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.lineTo(x, y + 4); ctx.fill();
  }
  // jeździec na dinozaurze
  const SEAT = Object.assign({}, P.idle[0], { air: 0, lean: 14, fa: [70, 60], ba: [55, 70], fl: [75, 110], bl: [60, 110] });
  function drawRider(a, sx, sy, flash) {
    const m = a.mount, raptor = m.type === 'raptor', R = RIDE[m.type];
    const moving = a.state === 'walk' || a.state === 'rideJump' || (a.state === 'rideAtk' && !raptor);
    let st = moving ? (raptor || m.type === 'para' ? 'run' : 'walk') : 'idle';
    if (a.state === 'rideAtk') st = raptor ? (a.t > 4 && a.t < 14 ? 'bite' : 'idle') : m.type === 'para' ? (a.rideRoar ? 'roar' : 'idle') : R.fly ? 'swoop' : 'charge';
    const opt = { flash: flash || (m.t < 120 && G.frame % 8 < 4) };
    if (m.type === 'jeep') {
      SP.drawJeep(ctx, sx, sy, a.face, a.animT, { moving: a.state === 'walk', nitro: m.nitro > 0, flash: opt.flash });
      SP.drawFigure(ctx, a.b, SEAT, sx - a.face * 2, sy - R.seat, a.face, { flash });
      drawPlayerMark(a, sx, sy - R.seat - 62 * scaleOf(a));
      return;
    }
    if (m.type === 'cart') {
      SP.drawFigure(ctx, a.b, P.idle[0], sx, sy - R.seat, a.face, { flash });
      window.Scenery.minecart(ctx, sx, sy);
      drawPlayerMark(a, sx, sy - R.seat - 66 * scaleOf(a));
      return;
    }
    if (raptor) SP.drawRaptor(ctx, sx, sy, a.face, a.animT, st, m.cols, opt);
    else if (m.type === 'pachy') SP.drawPachy(ctx, sx, sy, a.face, a.animT, st, m.cols, opt);
    else if (m.type === 'trike') SP.drawTrike(ctx, sx, sy, a.face, a.animT, st, m.cols, opt);
    else if (m.type === 'para') SP.drawPara(ctx, sx, sy, a.face, a.animT, st, m.cols, opt);
    else SP.drawPtera(ctx, sx, sy, a.face, a.animT, st === 'swoop' ? 'swoop' : 'fly', opt);
    const bob = moving && !R.fly ? Math.abs(Math.sin(a.animT * (raptor ? 0.25 : 0.2))) * 2 : 0;
    const seatX = sx - a.face * (raptor ? 1 : 2), seatY = sy - R.seat - bob;
    SP.drawFigure(ctx, a.b, SEAT, seatX, seatY, a.face, { flash });
    drawPlayerMark(a, sx, seatY - 62 * scaleOf(a));
  }
  // rusztowanie snajpera
  function drawPerch(sx, y, z) {
    const top = y - z;
    ctx.fillStyle = '#140c10'; ctx.fillRect(sx - 15, top, 4, z); ctx.fillRect(sx + 11, top, 4, z);
    ctx.fillStyle = '#8b6238'; ctx.fillRect(sx - 14, top, 2, z); ctx.fillRect(sx + 12, top, 2, z);
    ctx.strokeStyle = '#6b4a2e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx - 13, y); ctx.lineTo(sx + 13, top + 4); ctx.moveTo(sx + 13, y); ctx.lineTo(sx - 13, top + 4); ctx.stroke();
    ctx.fillStyle = '#140c10'; ctx.fillRect(sx - 18, top - 1, 36, 5);
    ctx.fillStyle = '#9b7040'; ctx.fillRect(sx - 17, top, 34, 3);
  }
  function drawSnipe(s) {
    const x = s.x - G.camX, y = s.y, f = s.from, r = 4 + s.fuse * 0.25;
    if (f) {
      ctx.strokeStyle = 'rgba(255,40,40,0.45)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(f.x - G.camX + f.face * 24, f.y - f.z - 24); ctx.lineTo(x, y - 6); ctx.stroke();
    }
    ctx.strokeStyle = G.frame % 6 < 3 ? '#ff3030' : '#ffa0a0'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.6, r * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - r * 2, y); ctx.lineTo(x + r * 2, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
  }
  function drawStars(x, y) {
    for (let i = 0; i < 3; i++) {
      const a = (G ? G.frame : app.frame || 0) * 0.12 + i * 2.1;
      ctx.fillStyle = '#ffe040'; ctx.fillRect(Math.round(x + Math.cos(a) * 10) - 1, Math.round(y + Math.sin(a) * 3) - 1, 3, 3);
    }
  }

  // smuga ruchu za stopą przy kopnięciach (ostatnie pozycje stopy w świecie)
  function drawTrail(a, sk, sx, sy, face, pose) {
    const kicking = (a.state === 'attack' && a.move && /kick/.test(a.move.pose) && a.t >= a.move.start - 1 && a.t < a.move.start + a.move.active + 2)
      || (a.state === 'jump' && a.jumpAtk) || (a.state === 'dashkick' && a.t >= 10) || (a.state === 'special' && a.key === 'nina');
    if (!kicking || pose.rot || sk === undefined) { a.trail = null; return; }
    const f = sk.legF[2], wx = a.x + face * f[0], wy = sy + f[1];
    const T = a.trail || (a.trail = []);
    T.push([wx, wy]); if (T.length > 6) T.shift();
    // łuk zamachu za stopą (jak w automatach)
    const hx = sx + face * sk.hip[0], hy = sy + sk.hip[1], fx = sx + face * f[0], R = Math.hypot(fx - hx, wy - hy);
    if (R > 8) {
      const ang = Math.atan2(wy - hy, fx - hx), sweep = 1.3 * face;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(255,255,255,${0.45 - i * 0.12})`; ctx.lineWidth = 4 - i;
        ctx.beginPath(); ctx.arc(hx, hy, R - i * 3, ang - sweep, ang, face < 0); ctx.stroke();
      }
    }
    if (T.length < 2) { ctx.lineCap = 'butt'; return; }
    ctx.lineCap = 'round';
    for (let i = 1; i < T.length; i++) {
      const k = i / T.length;
      ctx.strokeStyle = `rgba(255,255,255,${0.55 * k})`; ctx.lineWidth = 1 + k * 4;
      ctx.beginPath(); ctx.moveTo(T[i - 1][0] - G.camX, T[i - 1][1]); ctx.lineTo(T[i][0] - G.camX, T[i][1]); ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }
  // kałuże w deszczu: odbijają postacie stojące w pobliżu (odbicie w pionie wokół linii stóp)
  function puddlesOnScreen() {
    const out = [], cell = 170, c0 = Math.floor((G.camX - 60) / cell), c1 = Math.floor((G.camX + W + 60) / cell);
    for (let c = c0; c <= c1; c++) {
      const h = n => { const v = Math.sin(c * 127.1 + n * 311.7) * 43758.5453; return v - Math.floor(v); };
      if (h(1) < 0.25) continue;
      out.push({ x: c * cell + h(2) * 110, y: FLOOR_TOP + 16 + h(3) * (FLOOR_BOTTOM - FLOOR_TOP - 24), rx: 20 + h(4) * 16, ry: 6 + h(5) * 3 });
    }
    return out;
  }
  function drawPuddles() {
    if (!G.wx || !G.wx.rain || ST.HAZARDS || G.special) return;
    for (const q of puddlesOnScreen()) {
      const x = q.x - G.camX;
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, q.y, q.rx, q.ry, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = 'rgba(60,80,110,0.55)'; ctx.fillRect(x - q.rx, q.y - q.ry, q.rx * 2, q.ry * 2);
      G.reflecting = true; ctx.globalAlpha = 0.4;
      for (const a of G.actors) {
        if (a.alpha === 0 || Math.abs(a.x - q.x) > q.rx + 26 || a.y < q.y - q.ry - 2 || a.y > q.y + q.ry + 30) continue;
        ctx.save(); ctx.translate(0, 2 * a.y); ctx.scale(1, -1); drawActor(a); ctx.restore();
      }
      G.reflecting = false; ctx.globalAlpha = 1;
      // kręgi od kropel
      for (let i = 0; i < 2; i++) {
        const p = (((G.frame * 0.03) + i * 0.5 + q.x * 0.01) % 1 + 1) % 1;
        ctx.strokeStyle = `rgba(200,220,255,${0.5 * (1 - p)})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(x - q.rx * 0.4 + i * q.rx * 0.7, q.y + (i ? 1 : -1), 2 + p * 7, 1 + p * 2, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(200,220,255,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, q.y, q.rx, q.ry, 0, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke();
    }
  }
  // światło: wybuchy, ogień, strzały i lampy w kanałach rozświetlają otoczenie (mieszanie addytywne)
  function glow(x, y, r, rgb, a) {
    if (a <= 0.01) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function drawLights() {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const f of G.fx) {
      const k = f.t / f.life, x = f.x - G.camX;
      if (f.type === 'boom') { glow(x, f.y - (f.z || 0) - 20, 170, '255,140,50', 0.75 * (1 - k)); glow(x, f.y, 80, '255,230,160', 0.55 * (1 - k)); }
      else if (f.type === 'muzzle') glow(x, f.y - f.z, 50, '255,220,120', 0.5);
    }
    for (const f of G.fires || []) glow(f.x - G.camX, f.y - 6, 34, '255,140,40', 0.22 + 0.06 * Math.sin(G.frame * 0.4 + f.x));
    for (const a of G.actors) if (a.state === 'flame' && a.t > 16 && a.t < 70) glow(a.x - G.camX + a.face * 40, a.y - 24, 60, '255,140,40', 0.3);
    // lampy w kanałach: stożek światła na podłodze, migotanie i co jakiś czas jaskrawy rozbłysk
    for (const L of ST.LIGHTS || []) {
      const x = L.x - G.camX; if (x < -120 || x > W + 120) continue;
      const i = L.i || 0, t = G.frame;
      if (!((t + i * 37) % 200 > 6 && !((t + i * 53) % 90 < 3))) continue;
      const surge = (t + i * 140) % 420 < 24 ? 1 - ((t + i * 140) % 420) / 24 : 0;
      const g = ctx.createRadialGradient(x, L.y, 4, x, FLOOR_TOP + 30, 110);
      g.addColorStop(0, `rgba(240,220,150,${0.16 + surge * 0.35})`); g.addColorStop(1, 'rgba(240,220,150,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 6, L.y); ctx.lineTo(x + 6, L.y); ctx.lineTo(x + 70 + surge * 40, H); ctx.lineTo(x - 70 - surge * 40, H); ctx.closePath(); ctx.fill();
      if (surge > 0) glow(x, L.y + 10, 160, '255,240,190', surge * 0.35);
    }
    ctx.restore();
  }
  function drawWorld() {
    const sh = G.shake > 0 ? Math.round(rnd(-2, 2)) : 0;
    ctx.save(); ctx.translate(0, sh);
    ST.drawBack(ctx, layers, G.camX, G.frame);
    if (app.ngpRun && !G.special) drawNgpTint(true);
    if (G.wx) drawWeatherBack(G.wx);
    drawEventsBack();
    drawFires();
    drawPuddles();
    const ents = [];
    G.actors.forEach(a => ents.push({ y: a.y, a }));
    G.props.forEach(pr => { if (pr.hp > 0) ents.push({ y: pr.y, pr }); });
    G.items.forEach(it => ents.push({ y: it.y - 0.5, it }));
    G.shots.forEach(s => ents.push({ y: s.y + 0.1, s }));
    (G.carts || []).forEach(c => ents.push({ y: c.y, cart: c }));
    (G.vehicles || []).forEach(v => { if (!v.taken) ents.push({ y: v.y, veh: v }); });
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    for (const e of ents) {
      if (e.cart) { ctx.beginPath(); ctx.ellipse(e.cart.x - G.camX, e.cart.y, 16, 3, 0, 0, Math.PI * 2); ctx.fill(); continue; }
      if (e.veh) { ctx.beginPath(); ctx.ellipse(e.veh.x - G.camX, e.veh.y, e.veh.type === 'jeep' ? 28 : 16, 3, 0, 0, Math.PI * 2); ctx.fill(); continue; }
      const o = e.a || e.pr || e.it || e.s;
      let w = 10;
      if (e.a) w = (e.a.kind === 'rex' ? 56 : e.a.kind === 'trike' ? 30 : e.a.kind === 'para' ? 22 : e.a.kind === 'raptor' ? 22 : e.a.kind === 'pachy' ? 24 : 11 * scaleOf(e.a)) * (1 - Math.min(0.5, (o.z || 0) / 120));
      else if (e.s) w = 5;
      if (e.a && e.a.alpha < 0.5) continue;
      if (e.a && e.a.kind === 'ptera') w = 14;
      if (e.pr && e.pr.kind === 'wall') w = 22;
      if (e.s && e.s.type === 'snipe') continue;
      if (e.s && e.s.type === 'rock') w = 4 + Math.max(0, 8 - e.s.z / 10);
      ctx.beginPath(); ctx.ellipse(o.x - G.camX, o.y, w, 3, 0, 0, Math.PI * 2); ctx.fill();
    }
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) {
      if (e.a) drawActor(e.a);
      else if (e.pr) SP.drawBarrel(ctx, e.pr.x - G.camX + (e.pr.shake ? (e.pr.shake % 2 ? 1 : -1) : 0), e.pr.y, e.pr.hp, e.pr.kind);
      else if (e.s && e.s.type === 'snipe') drawSnipe(e.s);
      else if (e.s && e.s.type === 'prop') SP.drawBarrel(ctx, e.s.x - G.camX, e.s.y - e.s.z + 12, 2, e.s.kind);
      else if (e.s) SP.drawShot(ctx, e.s, e.s.x - G.camX, e.s.y - e.s.z - (e.s.type === 'dynamite' ? 3 : 0), e.s.t);
      else if (e.cart) window.Scenery.minecart(ctx, e.cart.x - G.camX, e.cart.y);
      else if (e.veh) { if (e.veh.type === 'jeep') SP.drawJeep(ctx, e.veh.x - G.camX, e.veh.y, -1, 0, { wreck: e.veh.used }); else window.Scenery.minecart(ctx, e.veh.x - G.camX, e.veh.y); }
      else {
        const it = e.it;
        if (it.t > 600 && G.frame % 6 < 3 && isWeaponItem(it.type)) continue;
        SP.drawItem(ctx, it.type, it.x - G.camX, it.y - it.z, G.frame);
      }
    }
    for (const f of G.fx) {
      const fx = f.x - G.camX, fy = f.y - f.z, k = f.t / f.life;
      if (f.type === 'spark') SP.drawSpark(ctx, fx, fy, k, f.big);
      else if (f.type === 'dust') SP.drawDust(ctx, fx, fy, k);
      else if (f.type === 'debris') { ctx.fillStyle = f.col; ctx.fillRect(fx - 1.5, fy - 1.5, 3, 3); }
      else if (f.type === 'tracer') { ctx.strokeStyle = `rgba(255,240,150,${1 - k})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(f.x2 - G.camX, fy); ctx.stroke(); }
      else if (f.type === 'muzzle') SP.drawSpark(ctx, fx, fy, k * 0.6, false);
      else if (f.type === 'ghost') { ctx.globalAlpha = 0.4 * (1 - k); SP.drawFigure(ctx, f.b, P.jumpkick[0], fx, fy, f.face, {}); ctx.globalAlpha = 1; }
      else if (f.type === 'baby') SP.drawRaptor(ctx, fx, fy, f.dir, f.t, 'run', { body: '#7aaa4a', belly: '#e0e0b0', stripe: '#4a7a2a' }, { scale: 0.55 });
      else if (f.type === 'boom') {
        const r = 10 + k * 26;
        ctx.fillStyle = `rgba(255,${200 - k * 150},60,${1 - k})`; ctx.beginPath(); ctx.arc(fx, fy - 12 - k * 10, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,200,${Math.max(0, 1 - k * 2)})`; ctx.beginPath(); ctx.arc(fx, fy - 12, r * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(60,50,50,${0.6 * k})`; ctx.beginPath(); ctx.arc(fx + 4, fy - 24 - k * 20, r * 0.7, 0, Math.PI * 2); ctx.fill();
      }
      else if (f.type === 'shock') {
        ctx.strokeStyle = `rgba(255,230,160,${1 - k})`; ctx.lineWidth = 3 * (1 - k) + 1;
        ctx.beginPath(); ctx.ellipse(fx, f.y, f.r * k + 6, (f.r * k + 6) * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    drawLights();
    ST.drawFront(ctx, layers, G.camX, G.frame);
    if (G.special === 'escape' && G.esc) {
      const lx = G.esc.lava - G.camX + 16;
      const g = ctx.createLinearGradient(lx - 40, 0, lx + 12, 0);
      g.addColorStop(0, '#ff5a14'); g.addColorStop(0.7, '#ffb030'); g.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, lx + 12, H);
      ctx.fillStyle = '#ffe080';
      for (let y = 0; y < H; y += 6) ctx.fillRect(lx - 6 + Math.sin(y * 0.2 + G.frame * 0.2) * 4, y, 4, 3);
    }
    if (app.ngpRun && !G.special) drawNgpTint(false);
    if (G.wx) drawWeatherFront(G.wx);
    drawEventsFront();
    if (G.fog > 0.02) drawFog();
    if (G.superFreeze > 0 && G.superWho) {
      const k = Math.min(1, (50 - G.superFreeze) / 8);
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = P_COLS[G.superWho.pIdx]; ctx.fillRect(0, 76, W * k, 52);
      ctx.fillStyle = '#140c10'; ctx.fillRect(0, 80, W * k, 44);
      ctx.save(); ctx.beginPath(); ctx.rect(20, 80, 60, 44); ctx.clip();
      SP.drawPortrait(ctx, G.superWho.b, 50, 110, 18, false); ctx.restore();
      if (G.superWho2) {
        ctx.fillStyle = P_COLS[G.superWho2.pIdx]; ctx.fillRect(W - 84, 76, 64, 4);
        ctx.save(); ctx.beginPath(); ctx.rect(W - 80, 80, 60, 44); ctx.clip();
        SP.drawPortrait(ctx, G.superWho2.b, W - 50, 110, 18, false); ctx.restore();
      }
    }
    if (G.flash > 0) { ctx.fillStyle = `rgba(220,220,255,${G.flash / 14})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }

  // =============================================================== RAMKA AUTOMATU (tło wokół ekranu gry)
  // Rysowana raz (przy zmianie rozmiaru okna lub opcji) na osobnym płótnie pod ekranem gry:
  // pixel-artowa sceneria po bokach i ramka kineskopu.
  const bezel = document.createElement('canvas');
  bezel.id = 'bezel';
  document.body.insertBefore(bezel, screen);
  function drawBezel() {
    const dpr = window.devicePixelRatio || 1, bw = Math.round(innerWidth * dpr), bh = Math.round(innerHeight * dpr);
    bezel.width = bw; bezel.height = bh;
    const g = bezel.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#07050a'; g.fillRect(0, 0, bw, bh);
    if (!OPTS.bezel) { screen.style.boxShadow = ''; return; }
    screen.style.boxShadow = 'none';
    const sw = screen.width, sh = screen.height, sx = Math.round((bw - sw) / 2), sy = Math.round((bh - sh) / 2);
    const u = Math.max(2, Math.round(Math.max(S, 2 * dpr)));          // wielkość „piksela” grafiki tła
    const fr = Math.round(Math.min(sx, 26 * dpr));                      // grubość bocznych listew ramki
    // ---- 1. sceneria w niskiej rozdzielczości: zachód słońca nad autostradą
    const lw = Math.ceil(bw / u), lh = Math.ceil(bh / u), L = document.createElement('canvas');
    L.width = lw; L.height = lh;
    const l = L.getContext('2d'), R = window.Scenery.rng(1977), hz = Math.round(lh * 0.66);
    const sky = l.createLinearGradient(0, 0, 0, hz);
    sky.addColorStop(0, '#120822'); sky.addColorStop(0.55, '#4a1240'); sky.addColorStop(1, '#ff6a2a');
    l.fillStyle = sky; l.fillRect(0, 0, lw, hz);
    for (let i = 0; i < 70; i++) { l.fillStyle = `rgba(255,240,220,${0.3 + R() * 0.6})`; l.fillRect(Math.floor(R() * lw), Math.floor(R() * hz * 0.5), 1, 1); }
    // słońce z pasami
    const cx = lw / 2, sr = Math.max(14, Math.min(lw, lh) * 0.22);
    for (let y = -sr; y < 0; y++) {
      const k = (y + sr) / sr, half = Math.sqrt(sr * sr - y * y);
      if ((y | 0) % 5 > 2 && k > 0.45) continue;
      l.fillStyle = k < 0.5 ? '#ffd040' : '#ff9a30'; l.fillRect(Math.round(cx - half), hz + y, Math.round(half * 2), 1);
    }
    // góry i wulkan
    const ridge = (col, base, amp, step) => {
      l.fillStyle = col; l.beginPath(); l.moveTo(0, hz);
      for (let x = 0; x <= lw + step; x += step) l.lineTo(x, base - R() * amp);
      l.lineTo(lw, hz); l.closePath(); l.fill();
    };
    ridge('#2a0e2e', hz - 4, lh * 0.12, 9); ridge('#1a0820', hz, lh * 0.06, 6);
    const vx = Math.round(lw * 0.12), vh = lh * 0.28;
    l.fillStyle = '#1e0a1a'; l.beginPath(); l.moveTo(vx - vh * 1.1, hz); l.lineTo(vx - 6, hz - vh); l.lineTo(vx + 6, hz - vh); l.lineTo(vx + vh * 1.1, hz); l.fill();
    l.fillStyle = '#ff5a14'; l.fillRect(vx - 5, Math.round(hz - vh), 10, 2);
    l.fillStyle = 'rgba(255,90,20,0.55)'; l.beginPath(); l.moveTo(vx - 2, hz - vh); l.lineTo(vx - 12, hz - vh * 0.4); l.lineTo(vx - 6, hz - vh * 0.4); l.lineTo(vx + 2, hz - vh); l.fill();
    for (let i = 0; i < 5; i++) { l.fillStyle = `rgba(60,40,50,${0.5 - i * 0.08})`; l.beginPath(); l.ellipse(vx + i * 6, hz - vh - 6 - i * 7, 8 + i * 4, 4 + i * 2, 0, 0, Math.PI * 2); l.fill(); }
    // ziemia z autostradą w perspektywie
    l.fillStyle = '#140a14'; l.fillRect(0, hz, lw, lh - hz);
    l.strokeStyle = 'rgba(255,90,160,0.35)'; l.lineWidth = 1;
    for (let k = 1; k < 12; k++) { const y = Math.round(hz + (lh - hz) * Math.pow(k / 11, 2)); l.beginPath(); l.moveTo(0, y + 0.5); l.lineTo(lw, y + 0.5); l.stroke(); }
    for (let k = -12; k <= 12; k++) { l.beginPath(); l.moveTo(cx + k * 3, hz); l.lineTo(cx + k * lw * 0.12, lh); l.stroke(); }
    l.fillStyle = '#2a2230'; l.beginPath(); l.moveTo(cx - 4, hz); l.lineTo(cx + 4, hz); l.lineTo(cx + lw * 0.32, lh); l.lineTo(cx - lw * 0.32, lh); l.fill();
    l.fillStyle = '#ffb030';
    for (let k = 0; k < 9; k++) { const t0 = Math.pow(k / 9, 2), t1 = Math.pow((k + 0.45) / 9, 2), y0 = hz + (lh - hz) * t0, y1 = hz + (lh - hz) * t1; l.fillRect(Math.round(cx - 0.5 - t1 * 2), Math.round(y0), Math.max(1, Math.round(1 + t1 * 4)), Math.max(1, Math.round(y1 - y0))); }
    // palmy po bokach
    const side = Math.max(1, sx / u);
    [[side * 0.25, 1], [side * 0.7, -1], [lw - side * 0.3, -1], [lw - side * 0.75, 1]].forEach(([x, lean], i) =>
      window.Scenery.palm(l, R, Math.round(x), hz + 6 + i * 3, lh * (0.32 + (i % 2) * 0.08), lean * (0.6 + R() * 0.4), true));
    // dinozaury: raptor po lewej, stary tyranozaur po prawej
    const ds = Math.max(0.8, Math.min(3, side / 70));
    SP.drawRaptor(l, Math.round(side * 0.5), Math.round(lh - (lh - hz) * 0.3), 1, 6, 'run', RAPTOR_COLS[0], { scale: ds });
    SP.drawRaptor(l, Math.round(lw - side * 0.5), Math.round(lh - (lh - hz) * 0.2), -1, 0, 'roar', REX_COLS, { scale: ds * 1.25, rex: true });
    g.drawImage(L, 0, 0, lw * u, lh * u);
    // przyciemnienie i winieta, żeby tło nie odciągało uwagi od gry
    g.fillStyle = 'rgba(8,4,14,0.42)'; g.fillRect(0, 0, bw, bh);
    const vg = g.createRadialGradient(bw / 2, bh / 2, Math.min(bw, bh) * 0.3, bw / 2, bh / 2, Math.hypot(bw, bh) * 0.6);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.75)');
    g.fillStyle = vg; g.fillRect(0, 0, bw, bh);
    // listwy boczne obudowy (jak T-molding w automatach)
    if (sx > 60 * dpr) {
      [[0, 1], [bw, -1]].forEach(([x0, d]) => {
        const w = Math.round(8 * dpr), gr = g.createLinearGradient(x0, 0, x0 + d * w, 0);
        gr.addColorStop(0, '#ff7a20'); gr.addColorStop(0.5, '#ffb050'); gr.addColorStop(1, '#a03a10');
        g.fillStyle = gr; g.fillRect(d > 0 ? 0 : bw - w, 0, w, bh);
      });
    }
    const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
    // ---- 3. boczne listwy ramki ekranu: błyszczące tworzywo, krawędź i neon (na całą wysokość okna)
    if (fr >= 4 * dpr) {
      [[sx - fr, 1], [sx + sw, -1]].forEach(([x0, d]) => {
        g.save(); g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 24 * dpr; g.fillStyle = '#000'; g.fillRect(x0, 0, fr, bh); g.restore();
        const pg = g.createLinearGradient(x0, 0, x0 + fr, 0);
        pg.addColorStop(0, d > 0 ? '#2a2430' : '#141018'); pg.addColorStop(0.5, '#1c1820'); pg.addColorStop(1, d > 0 ? '#141018' : '#2a2430');
        g.fillStyle = pg; g.fillRect(x0, 0, fr, bh);
        g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(d > 0 ? x0 + dpr : x0 + fr - 2 * dpr, 0, dpr, bh);
        // śruby
        if (fr >= 14 * dpr) for (let y = fr; y < bh; y += Math.max(160 * dpr, bh / 4)) {
          const cx = x0 + fr / 2;
          g.fillStyle = '#5a5460'; g.beginPath(); g.arc(cx, y, 3 * dpr, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#1a161e'; g.lineWidth = dpr; g.beginPath(); g.moveTo(cx - 2 * dpr, y); g.lineTo(cx + 2 * dpr, y); g.stroke();
        }
      });
    }
    if (sx >= 2 * dpr) {
      g.save(); g.shadowColor = '#ff7a20'; g.shadowBlur = 10 * dpr; g.fillStyle = 'rgba(255,140,40,0.9)';
      const lw2 = Math.max(1, Math.round(1.5 * dpr));
      g.fillRect(sx - lw2 - dpr, 0, lw2, bh); g.fillRect(sx + sw + dpr, 0, lw2, bh); g.restore();
    }
  }

  // =============================================================== POGODA I PORA DNIA
  // Losowane od nowa przy każdym przejściu gry (app.wxSeed) — ten sam etap raz o świcie, raz w burzy.
  const WEATHER = {
    clear: null,
    dawn: { name: 'ŚWIT', tint: '#f8c8c0', light: 'rgba(255,190,160,0.08)', sun: { x: 0.12, col: '255,210,170' } },
    sunset: { name: 'ZACHÓD SŁOŃCA', tint: '#ffa070', light: 'rgba(255,110,40,0.12)', sun: { x: 0.86, col: '255,150,60' } },
    dusk: { name: 'ZMIERZCH', tint: '#8890c8', light: 'rgba(30,30,90,0.18)' },
    mist: { name: 'MGŁA', tint: '#c8d4d0', mist: true },
    sand: { name: 'BURZA PIASKOWA', tint: '#e8c890', sand: true },
    ash: { name: 'DESZCZ POPIOŁU', tint: '#b8a8a8', ash: true },
    rain: { name: 'DESZCZ', tint: '#a0a8c0', light: 'rgba(20,30,60,0.12)', rain: true }
  };
  const STAGE_WX = [['clear', 'dawn', 'sand', 'rain'], ['mist', 'mist', 'dusk', 'rain'], ['clear', 'dusk', 'mist'],
    ['sand', 'sand', 'ash', 'clear'], ['sunset', 'sunset', 'clear', 'mist'], ['mist', 'sunset', 'rain', 'clear'], ['clear'], ['clear', 'dusk', 'rain', 'sunset']];
  function pickWeather(idx) {
    const list = STAGE_WX[idx];
    if (!list || app.ngpRun) return null;
    const h = Math.abs(Math.sin((app.wxSeed || 1) * 12.9898 + idx * 78.233) * 43758.5453) % 1;
    const k = list[Math.floor(h * list.length)];
    return WEATHER[k] ? Object.assign({ id: k }, WEATHER[k]) : null;
  }
  // tło: zabarwienie pory dnia i słońce nad horyzontem
  function drawWeatherBack(wx) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = wx.tint; ctx.fillRect(0, 0, W, H);
    if (wx.sun) {
      ctx.globalCompositeOperation = 'screen';
      const sx = W * wx.sun.x, sy = 64, g = ctx.createRadialGradient(sx, sy, 4, sx, sy, 150);
      g.addColorStop(0, `rgba(${wx.sun.col},0.9)`); g.addColorStop(0.12, `rgba(${wx.sun.col},0.45)`); g.addColorStop(1, `rgba(${wx.sun.col},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }
  let sandC = null;
  // pierwszy plan: mgła, piasek, popiół, deszcz
  function drawWeatherFront(wx) {
    const f = G.frame;
    if (wx.light) { ctx.fillStyle = wx.light; ctx.fillRect(0, 0, W, H); }
    if (wx.mist) {
      const g = ctx.createLinearGradient(0, 60, 0, H);
      g.addColorStop(0, 'rgba(210,225,220,0)'); g.addColorStop(1, 'rgba(210,225,220,0.28)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) {
        const x = ((i * 97 - G.camX * (0.6 + (i % 3) * 0.2) + f * (0.15 + (i % 4) * 0.05)) % (W + 240) + W + 240) % (W + 240) - 120;
        const y = 120 + (i * 29) % 100;
        ctx.fillStyle = `rgba(220,232,228,${0.12 + 0.05 * Math.sin(f * 0.01 + i)})`;
        ctx.beginPath(); ctx.ellipse(x, y, 110, 16, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (wx.sand) {
      const gust = 0.5 + 0.5 * Math.sin(f * 0.006) * Math.sin(f * 0.017 + 1);
      // w porywach piasek zasłania wszystko poza okolicą graczy
      if (!sandC) { sandC = document.createElement('canvas'); sandC.width = W; sandC.height = H; }
      const sg = sandC.getContext('2d'), vis = 0.15 + gust * 0.5;
      sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, W, H);
      sg.fillStyle = `rgba(150,105,55,${vis.toFixed(3)})`; sg.fillRect(0, 0, W, H);
      sg.globalCompositeOperation = 'destination-out';
      for (const q of G.players) {
        if (!q.alive) continue;
        const gx = q.x - G.camX, gy = q.y - q.z - 24, rr = 100 - gust * 30, gr = sg.createRadialGradient(gx, gy, 18, gx, gy, rr);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        sg.fillStyle = gr; sg.fillRect(gx - rr, gy - rr, rr * 2, rr * 2);
      }
      ctx.drawImage(sandC, 0, 0);
      ctx.fillStyle = `rgba(200,150,80,${0.14 + gust * 0.22})`; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 90; i++) {
        const sp = 4 + (i % 5) * 1.6 + gust * 4;
        const x = W + 20 - ((i * 61 + f * sp) % (W + 60)), y = (i * 41 + Math.sin(f * 0.05 + i) * 6) % H;
        ctx.fillStyle = i % 3 ? 'rgba(230,190,120,0.7)' : 'rgba(170,120,60,0.6)';
        ctx.fillRect(x, y, 3 + sp * 0.8 * (0.5 + gust), 1);
      }
      for (let i = 0; i < 4; i++) {
        const x = W + 160 - ((i * 170 + f * (2 + gust * 3)) % (W + 320));
        ctx.fillStyle = `rgba(210,160,90,${0.1 + gust * 0.12})`;
        ctx.beginPath(); ctx.ellipse(x, 60 + i * 44, 140, 26, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (wx.ash) {
      for (let i = 0; i < 60; i++) {
        const x = ((i * 47 + Math.sin(f * 0.02 + i) * 14 - G.camX * 0.3) % (W + 20) + W + 20) % (W + 20) - 10;
        const y = (i * 37 + f * (0.3 + (i % 4) * 0.15)) % (H + 10) - 5;
        if (i % 7 === 0) { ctx.fillStyle = `rgba(255,${120 + (i % 3) * 40},40,${0.6 + 0.4 * Math.sin(f * 0.2 + i)})`; ctx.fillRect(x, y, 2, 2); }
        else { ctx.fillStyle = 'rgba(200,195,195,0.6)'; ctx.fillRect(x, y, 2, 1 + (i % 2)); }
      }
      ctx.fillStyle = 'rgba(60,40,40,0.12)'; ctx.fillRect(0, 0, W, H);
    }
    if (wx.rain) {
      ctx.strokeStyle = 'rgba(170,190,230,0.45)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i < 80; i++) { const x = (i * 41 + f * 4) % (W + 30) - 15, y = (i * 59 + f * 11) % (H + 30) - 15; ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 10); }
      ctx.stroke();
      // rozbryzgi kropel na ziemi
      ctx.fillStyle = 'rgba(190,210,240,0.5)';
      for (let i = 0; i < 12; i++) { const k = (f * 0.07 + i * 0.37) % 1; ctx.fillRect((i * 83 + Math.floor(f / 14) * 29) % W, 150 + (i * 23) % 70, 1 + k * 3, 1); }
    }
  }

  // =============================================================== FILTRY CRT (opcja)
  // AUTOMAT — zakrzywienie, poświata, miękkie skanlinie, winieta (filtr oryginalny).
  // MONITOR PC — płaski, ostry obraz, pionowa maska RGB (Trinitron), delikatne skanlinie.
  // STARY TV — mocna wypukłość, rozmycie i kolorowe obwódki sygnału antenowego, szum, pas zakłóceń, migotanie.
  const CRT_MODES = ['off', 'arcade', 'pc', 'tv'];
  const CRT_NAMES = { off: 'WYŁ.', arcade: 'AUTOMAT', pc: 'MONITOR PC', tv: 'STARY TV' };
  const CRT_DESC = { off: 'CZYSTY, OSTRY OBRAZ BEZ EFEKTÓW', arcade: 'ZAKRZYWIONY EKRAN, POŚWIATA I SKANLINIE JAK W SALONIE GIER',
    pc: 'PŁASKI MONITOR: PIONOWA MASKA RGB I DELIKATNE SKANLINIE', tv: 'STARY TELEWIZOR: ROZMYCIE, KOLOROWE OBWÓDKI, SZUM I ZAKŁÓCENIA' };
  const crtMode = () => OPTS.crt === true ? 'arcade' : CRT_MODES.includes(OPTS.crt) ? OPTS.crt : 'off';
  const crt = { a: document.createElement('canvas'), b: document.createElement('canvas'), c: document.createElement('canvas'), glow: document.createElement('canvas'), w: 0, h: 0 };
  const CRT_BEND = 0.045;
  function crtPrepare() {
    const w = screen.width, h = screen.height;
    if (crt.w === w && crt.h === h) return;
    crt.w = w; crt.h = h;
    [crt.a, crt.b, crt.c].forEach(c => { c.width = w; c.height = h; });
    crt.glow.width = W / 2; crt.glow.height = H / 2;
    const step = Math.max(2, Math.round(S));
    // skanlinie: jedna na wiersz pikseli gry, z siłą zależną od trybu
    const scan = (alpha, mask) => {
      const sl = document.createElement('canvas'); sl.width = 3; sl.height = step;
      const g = sl.getContext('2d');
      for (let y = 0; y < step; y++) {
        const d = Math.abs((y + 0.5) / step - 0.5) * 2;           // 0 w środku wiersza, 1 na granicy
        g.fillStyle = `rgba(0,0,0,${(alpha * d * d).toFixed(3)})`; g.fillRect(0, y, 3, 1);
      }
      if (mask && step >= 4) ['rgba(255,60,60,0.035)', 'rgba(60,255,60,0.035)', 'rgba(60,60,255,0.035)'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i, 0, 1, step); });
      return sctx.createPattern(sl, 'repeat');
    };
    crt.scan = scan(0.22, true);
    crt.scanPc = scan(0.13, false);
    crt.scanTv = scan(0.34, false);
    // pionowa maska RGB monitora (kreski co 3 piksele ekranu, mnożona — barwi kolumny)
    const gr = document.createElement('canvas'); gr.width = 3; gr.height = 1;
    const gg = gr.getContext('2d');
    ['#ffd0d0', '#d0ffd0', '#d0d0ff'].forEach((c, i) => { gg.fillStyle = c; gg.fillRect(i, 0, 1, 1); });
    crt.grille = sctx.createPattern(gr, 'repeat');
    // szum telewizora
    const nz = document.createElement('canvas'); nz.width = nz.height = 128;
    const nzc = nz.getContext('2d'), id = nzc.createImageData(128, 128);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255 | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    nzc.putImageData(id, 0, 0);
    crt.noise = sctx.createPattern(nz, 'repeat');
    const vig = (inner, a) => {
      const v = sctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * inner, w / 2, h / 2, Math.hypot(w, h) * 0.55);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); return v;
    };
    crt.vig = vig(0.4, 0.6); crt.vigPc = vig(0.5, 0.28); crt.vigTv = vig(0.3, 0.8);
  }
  // zakrzywienie: źródło -> (wiersze) crt.b -> (kolumny) ekran
  function crtCurve(src, bendY, bendX) {
    const w = crt.w, h = crt.h, b = crt.b.getContext('2d'), band = Math.max(2, Math.round(S));
    b.fillStyle = '#000'; b.fillRect(0, 0, w, h); b.imageSmoothingEnabled = true;
    for (let y = 0; y < h; y += band) {
      const ny = (y + band / 2) / h * 2 - 1, sw = w * (1 - bendY * ny * ny);
      b.drawImage(src, 0, y, w, band, (w - sw) / 2, y, sw, band);
    }
    sctx.fillStyle = '#000'; sctx.fillRect(0, 0, w, h); sctx.imageSmoothingEnabled = true;
    for (let x = 0; x < w; x += band) {
      const nx = (x + band / 2) / w * 2 - 1, sh = h * (1 - bendX * nx * nx);
      sctx.drawImage(crt.b, x, 0, band, h, x, (h - sh) / 2, band, sh);
    }
  }
  function crtGlow(alpha, spread) {
    const w = crt.w, h = crt.h, gc = crt.glow.getContext('2d');
    gc.imageSmoothingEnabled = true; gc.clearRect(0, 0, crt.glow.width, crt.glow.height);
    gc.drawImage(screen, 0, 0, crt.glow.width, crt.glow.height);
    sctx.imageSmoothingEnabled = true; sctx.globalCompositeOperation = 'screen'; sctx.globalAlpha = alpha;
    sctx.drawImage(crt.glow, -S * spread, -S * spread, w + S * spread * 2, h + S * spread * 2);
    sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over'; sctx.imageSmoothingEnabled = false;
  }
  function crtCorners(k) {
    const w = crt.w, h = crt.h, r = Math.min(w, h) * k;
    sctx.fillStyle = '#000'; sctx.beginPath(); sctx.rect(0, 0, w, h);
    sctx.moveTo(r, 0); sctx.arcTo(0, 0, 0, r, r); sctx.lineTo(0, h - r); sctx.arcTo(0, h, r, h, r); sctx.lineTo(w - r, h);
    sctx.arcTo(w, h, w, h - r, r); sctx.lineTo(w, r); sctx.arcTo(w, 0, w - r, 0, r); sctx.closePath();
    sctx.fill('evenodd');
  }
  function applyCrt() {
    const mode = crtMode();
    if (mode === 'off') return;
    crtPrepare();
    const w = crt.w, h = crt.h, a = crt.a.getContext('2d');
    sctx.save();
    if (mode === 'arcade') {
      a.clearRect(0, 0, w, h); a.drawImage(screen, 0, 0);
      crtCurve(crt.a, CRT_BEND, CRT_BEND * 1.3);
      crtGlow(0.35, 2);
      sctx.fillStyle = crt.scan; sctx.fillRect(0, 0, w, h);
      sctx.fillStyle = crt.vig; sctx.fillRect(0, 0, w, h);
      crtCorners(0.06);
    } else if (mode === 'pc') {
      // płaski ekran: maska RGB (mnożenie), rozjaśnienie kompensujące, skanlinie, lekka poświata
      sctx.globalCompositeOperation = 'multiply'; sctx.fillStyle = crt.grille; sctx.fillRect(0, 0, w, h);
      sctx.globalCompositeOperation = 'source-over';
      crtGlow(0.22, 1);
      sctx.fillStyle = crt.scanPc; sctx.fillRect(0, 0, w, h);
      sctx.fillStyle = crt.vigPc; sctx.fillRect(0, 0, w, h);
      crtCorners(0.012);
    } else {
      // stary telewizor: kanały R i B przesunięte w bok (kolorowe obwódki), rozmycie, wypukłość
      const c = crt.c.getContext('2d'), off = Math.max(1, Math.round(S * 0.7));
      a.globalCompositeOperation = 'source-over'; a.fillStyle = '#000'; a.fillRect(0, 0, w, h);
      [['#ff0000', off], ['#00ff00', 0], ['#0000ff', -off]].forEach(([col, dx]) => {
        c.globalCompositeOperation = 'source-over'; c.drawImage(screen, 0, 0);
        c.globalCompositeOperation = 'multiply'; c.fillStyle = col; c.fillRect(0, 0, w, h);
        a.globalCompositeOperation = 'lighter'; a.drawImage(crt.c, dx, 0);
      });
      // rozmycie sygnału: pomniejszony obraz nałożony na wierzch
      c.globalCompositeOperation = 'source-over'; c.imageSmoothingEnabled = true;
      c.clearRect(0, 0, w, h); c.drawImage(crt.a, 0, 0, w / 2, h / 2);
      a.globalCompositeOperation = 'source-over'; a.imageSmoothingEnabled = true; a.globalAlpha = 0.45;
      a.drawImage(crt.c, 0, 0, w / 2, h / 2, 0, 0, w, h);
      a.globalAlpha = 1;
      crtCurve(crt.a, 0.09, 0.12);
      crtGlow(0.4, 3);
      sctx.fillStyle = crt.scanTv; sctx.fillRect(0, 0, w, h);
      // szum
      const f = app.frame || 0;
      sctx.save(); sctx.globalAlpha = 0.07; sctx.translate((f * 37) % 128, (f * 71) % 128);
      sctx.fillStyle = crt.noise; sctx.fillRect(-128, -128, w + 256, h + 256); sctx.restore();
      // przesuwający się pas zakłóceń
      const by = ((f * 1.6) % (h * 1.6)) - h * 0.3, bh = h * 0.12, gb = sctx.createLinearGradient(0, by, 0, by + bh);
      gb.addColorStop(0, 'rgba(255,255,255,0)'); gb.addColorStop(0.5, 'rgba(255,255,255,0.06)'); gb.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.fillStyle = gb; sctx.fillRect(0, by, w, bh);
      // migotanie
      sctx.fillStyle = `rgba(0,0,0,${(0.03 + Math.random() * 0.03).toFixed(3)})`; sctx.fillRect(0, 0, w, h);
      sctx.fillStyle = crt.vigTv; sctx.fillRect(0, 0, w, h);
      crtCorners(0.1);
    }
    sctx.restore();
  }

  // =============================================================== UDOSTĘPNIANIE WYNIKU
  // Karta PNG z wynikiem, oceną i postacią: pobranie, kopia do schowka albo systemowe „Udostępnij”.
  function shareInfo() {
    const mode = app.gameMode === 'rush' ? 'BOSS RUSH' : app.gameMode === 'survival' ? 'PRZETRWANIE' : app.gameMode === 'custom' ? 'WŁASNY ETAP'
      : app.gameMode === 'training' ? 'TRENING' : app.ngpRun ? 'NOWA GRA+' : 'ARCADE';
    let head;
    if (app.mode === 'ending') head = 'GRA UKOŃCZONA!';
    else if (app.mode === 'clear') head = ST.custom ? ST.name + ' — UKOŃCZONY' : G.special === 'escape' ? 'UCIECZKA UDANA!' : G.special === 'cages' ? 'ZAGRODA UKOŃCZONA' : ST.custom ? ST.name + ' — UKOŃCZONY' : 'ETAP ' + ST.label + ' UKOŃCZONY';
    else if (G.rush) head = 'BOSS RUSH — POKONANI BOSSOWIE: ' + ((app.rush && app.rush.done) || 0);
    else if (G.special === 'survival') head = 'PRZETRWANIE — FALA ' + ((G.surv && G.surv.wave) || 0);
    else head = 'KONIEC GRY — ' + (ST.custom ? ST.name : 'ETAP ' + ST.label);
    const res = app.mode === 'clear' && app.results ? app.results.filter(r => r.st) : [];
    const players = res.length ? res.map(r => ({ p: r.p, rank: r.rank, st: r.st, secs: r.secs }))
      : G.players.map(q => ({ p: q, st: q.st }));
    return { mode, head, players };
  }
  function makeShareCard() {
    const info = shareInfo(), CW = 384, CH = 216, SC = 3;
    const c = document.createElement('canvas'); c.width = CW * SC; c.height = CH * SC;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.drawImage(buf, 0, 4, W, CH, 0, 0, c.width, c.height);
    const L = document.createElement('canvas'); L.width = CW; L.height = CH;
    const l = L.getContext('2d');
    const gr = l.createLinearGradient(0, 0, 0, CH);
    gr.addColorStop(0, 'rgba(20,8,30,0.85)'); gr.addColorStop(0.5, 'rgba(10,6,20,0.6)'); gr.addColorStop(1, 'rgba(20,8,30,0.9)');
    l.fillStyle = gr; l.fillRect(0, 0, CW, CH);
    l.strokeStyle = '#ffb030'; l.lineWidth = 2; l.strokeRect(4, 4, CW - 8, CH - 8);
    l.strokeStyle = '#6a3a10'; l.lineWidth = 1; l.strokeRect(8.5, 8.5, CW - 17, CH - 17);
    const n = info.players.length, colW = n > 1 ? CW / 2 : CW;
    info.players.forEach((e, i) => {
      const ox = i * colW, big = n === 1;
      const bx = big ? ox + 30 : ox + 18, by = 56, bs = big ? 96 : 64;
      l.fillStyle = '#000'; l.fillRect(bx - 2, by - 2, bs + 4, bs + 4);
      l.fillStyle = n > 1 ? P_COLS[e.p.pIdx || i] : '#ffb030'; l.fillRect(bx - 1, by - 1, bs + 2, bs + 2);
      l.fillStyle = '#2a1a30'; l.fillRect(bx, by, bs, bs);
      l.save(); l.beginPath(); l.rect(bx, by, bs, bs); l.clip();
      SP.drawPortrait(l, e.p.b, bx + bs / 2, by + bs * 0.62, bs * 0.34, false); l.restore();
      if (e.rank) {
        const rx = big ? 300 : ox + colW - 44, ry = big ? 60 : 128;
        l.fillStyle = '#000'; l.fillRect(rx - 2, ry - 2, 40, 40);
        l.fillStyle = RANK_COLS[e.rank]; l.fillRect(rx, ry, 36, 36);
        l.fillStyle = '#1a1020'; l.fillRect(rx + 3, ry + 3, 30, 30);
      }
    });
    g.drawImage(L, 0, 0, c.width, c.height);
    // napisy rysuje zwykły text() — na chwilę przełączony na płótno karty
    const oS = S, oCtx = sctx;
    sctx = g; S = SC;
    try {
      text('PALEO HIGHWAY', CW / 2, 14, 12, '#ffb030', 'center');
      text('RDZA I KŁY', CW / 2, 30, 5, '#e0c0a0', 'center');
      text(info.head, CW / 2, 42, 5, '#ffe080', 'center');
      info.players.forEach((e, i) => {
        const ox = i * colW, big = n === 1, st = e.st || { kills: 0, maxCombo: 0 };
        const tx = big ? 140 : ox + 18, ty = big ? 60 : 126;
        text(e.p.name, tx, ty, big ? 9 : 6, n > 1 ? P_COLS[e.p.pIdx || i] : '#fff');
        text(String(e.p.score).padStart(7, '0'), tx, ty + (big ? 16 : 10), big ? 12 : 8, '#80d0ff');
        const lines = ['POKONANI ' + st.kills + '   KOMBO ' + st.maxCombo];
        if (e.secs !== undefined) lines.push('CZAS ' + Math.floor(e.secs / 60) + ':' + String(e.secs % 60).padStart(2, '0') + (st.dmg === 0 ? '   BEZ RYSY!' : ''));
        lines.forEach((t, k) => text(t, tx, ty + (big ? 38 : 22) + k * 9, big ? 5 : 4, '#e0e0e0'));
        if (e.rank) {
          const rx = big ? 300 : ox + colW - 44, ry = big ? 60 : 128;
          text(e.rank, rx + 18, ry + 9, 16, RANK_COLS[e.rank], 'center');
          if (big) text('OCENA', rx + 18, ry + 42, 4, '#fff', 'center');
        }
        if (!big && i === 0) { /* odstęp kolumn */ }
      });
      const d = new Date(), date = d.getDate() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
      text(info.mode + '  ·  ' + diffNow().name + '  ·  ' + date, CW / 2, 196, 4, '#c0c0c0', 'center');
    } finally { sctx = oCtx; S = oS; }
    return { canvas: c, score: Math.max(...info.players.map(e => e.p.score)), info };
  }
  function openShare() {
    try {
      const card = makeShareCard();
      const opts = ['POBIERZ', 'KOPIUJ'];
      if (navigator.share && navigator.canShare) opts.push('UDOSTĘPNIJ');
      opts.push('ZAMKNIJ');
      app.share = Object.assign(card, { opts, sel: 0, msg: '', msgT: 0, t: 0 });
      sfx('select');
    } catch (e) { console.error(e); }
  }
  function shareBlob(cb) { app.share.canvas.toBlob(b => cb(b), 'image/png'); }
  function shareMsg(m) { if (app.share) { app.share.msg = m; app.share.msgT = 200; } }
  function updateShare() {
    const sh = app.share; sh.t++;
    if (sh.msgT > 0) sh.msgT--;
    const N = sh.opts.length;
    if (pressed.left || pressed.up) { sh.sel = (sh.sel + N - 1) % N; sfx('select'); }
    if (pressed.right || pressed.down) { sh.sel = (sh.sel + 1) % N; sfx('select'); }
    if (pressed.pause || pressed.jump) { app.share = null; sfx('select'); return; }
    if (!((pressed.start || pressed.attack) && sh.t > 8)) return;
    const o = sh.opts[sh.sel], name = 'paleo-highway-' + sh.score + '.png';
    if (o === 'ZAMKNIJ') { app.share = null; sfx('select'); return; }
    sfx('start');
    if (o === 'POBIERZ') {
      shareBlob(b => {
        const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        shareMsg('ZAPISANO ' + name.toUpperCase());
      });
    } else if (o === 'KOPIUJ') {
      if (!(navigator.clipboard && navigator.clipboard.write && window.ClipboardItem)) { shareMsg('SCHOWEK NIEDOSTĘPNY — UŻYJ „POBIERZ”'); return; }
      const blobP = new Promise(r => shareBlob(r));
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blobP })])
        .then(() => shareMsg('SKOPIOWANO OBRAZEK DO SCHOWKA'))
        .catch(() => shareMsg('BRAK DOSTĘPU DO SCHOWKA (WYMAGA HTTPS LUB LOCALHOST)'));
    } else if (o === 'UDOSTĘPNIJ') {
      shareBlob(b => {
        const f = new File([b], name, { type: 'image/png' });
        const data = { files: [f], title: 'PALEO HIGHWAY', text: 'Mój wynik w PALEO HIGHWAY: ' + sh.score + ' pkt!' };
        if (navigator.canShare(data)) navigator.share(data).then(() => shareMsg('UDOSTĘPNIONO!')).catch(() => shareMsg('ANULOWANO'));
        else shareMsg('TO URZĄDZENIE NIE UDOSTĘPNIA PLIKÓW');
      });
    }
  }
  function drawShare() {
    const sh = app.share, w = screen.width, h = screen.height;
    sctx.fillStyle = 'rgba(0,0,0,0.8)'; sctx.fillRect(0, 0, w, h);
    text('UDOSTĘPNIJ WYNIK', W / 2, 8, 8, '#ffe080', 'center');
    const pw = W * 0.72, ph = pw * sh.canvas.height / sh.canvas.width, px = (W - pw) / 2, py = 22;
    sctx.imageSmoothingEnabled = true;
    sctx.fillStyle = '#ffb030'; sctx.fillRect((px - 1) * S, (py - 1) * S, (pw + 2) * S, (ph + 2) * S);
    sctx.drawImage(sh.canvas, px * S, py * S, pw * S, ph * S);
    sctx.imageSmoothingEnabled = false;
    const n = sh.opts.length, gap = 84, x0 = W / 2 - (n - 1) * gap / 2, y = py + ph + 9;
    sh.opts.forEach((o, i) => text((i === sh.sel ? '► ' : '') + o, x0 + i * gap, y, 6, i === sh.sel ? '#ffe040' : '#a0a0b0', 'center'));
    if (sh.msgT > 0) text(sh.msg, W / 2, y + 13, 4, '#7cff7c', 'center');
    else text('◄ ► WYBÓR   {ok|ENTER} — OK   {back|ESC} — ZAMKNIJ', W / 2, y + 13, 4, '#c0c0c0', 'center');
  }

  // NG+: na zmianę noc i jesień
  function drawNgpTint(background) {
    const autumn = G.stageIdx % 2 === 0;
    if (background) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = autumn ? '#f0b880' : '#5868a8'; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      return;
    }
    if (autumn) {
      for (let i = 0; i < 22; i++) {
        const x = ((i * 53 + G.frame * (0.4 + (i % 3) * 0.2) + Math.sin(G.frame * 0.03 + i) * 12) % (W + 20)) - 10, y = (i * 37 + G.frame * (0.5 + (i % 4) * 0.15)) % (H + 10);
        ctx.fillStyle = ['#d0602a', '#e0a030', '#b03a20'][i % 3]; ctx.fillRect(x, y, 3, 2);
      }
    } else {
      const v = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 240);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,20,0.55)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }
  }
  // ulewa: mgła z „oknami” widoczności wokół graczy
  let fogC = null;
  function drawFog() {
    if (!fogC) { fogC = document.createElement('canvas'); fogC.width = W; fogC.height = H; }
    const g = fogC.getContext('2d');
    g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
    g.fillStyle = `rgba(12,16,32,${G.fog})`; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'destination-out';
    for (const q of G.players) {
      if (!q.alive) continue;
      const gx = q.x - G.camX, gy = q.y - q.z - 24;
      const gr = g.createRadialGradient(gx, gy, 12, gx, gy, 84);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(gx - 84, gy - 84, 168, 168);
    }
    g.globalCompositeOperation = 'source-over';
    ctx.drawImage(fogC, 0, 0);
    ctx.strokeStyle = `rgba(180,200,240,${0.55 * G.fog})`; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < 130; i++) { const x = (i * 37 + G.frame * 5) % (W + 30) - 15, y = (i * 53 + G.frame * 13) % (H + 30) - 15; ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 12); }
    ctx.stroke();
  }

  // =============================================================== HUD
  function bar(x, y, w, h, frac, lag, col) {
    ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = '#401010'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, Math.max(0, w * Math.min(1, lag)), h);
    ctx.fillStyle = col; ctx.fillRect(x, y, Math.max(0, w * frac), h);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x, y, Math.max(0, w * frac), 1);
  }
  const LAYER_COLS = ['#f0d030', '#f08a20', '#e03030', '#b040d0', '#3070f0', '#30c0a0', '#e0e0e0'];
  function layeredBar(x, y, w, h, hp, lag, per) {
    hp = Math.max(0, hp);
    const layer = Math.floor(Math.max(0, hp - 0.01) / per);
    const frac = (hp - layer * per) / per;
    ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = layer > 0 ? LAYER_COLS[(layer - 1) % LAYER_COLS.length] : '#401010'; ctx.fillRect(x, y, w, h);
    const lagFrac = clamp((lag - layer * per) / per, 0, 1);
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w * lagFrac, h);
    ctx.fillStyle = LAYER_COLS[layer % LAYER_COLS.length]; ctx.fillRect(x, y, w * frac, h);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x, y, w * frac, 1);
    return layer;
  }
  function hudEnemy() {
    if (G.special === 'training') return null;
    const e = G.lastEnemy;
    if (e && G.lastEnemyT > 0 && e.alive && isBoss(e)) return e;
    const boss = G.actors.find(a => isBoss(a) && a.alive && a.hp > 0 && a.state !== 'enter');
    if (boss) return boss;
    return e && G.lastEnemyT > 0 ? e : null;
  }
  // panel gracza: side 0 = lewy, 1 = prawy (lustrzany)
  const PANEL = [{ px: 5, bx: 30 }, { px: W - 27, bx: W - 126 }];
  function drawPlayerPanel(p, side) {
    const L = PANEL[side];
    ctx.fillStyle = P_COLS[side]; ctx.fillRect(L.px - 1, 4, 24, 24);
    const hurtNow = G.frame - (p.hurtF || -99) < 30, low = p.hp > 0 && p.hp / p.maxHp < 0.25, fury = (p.fury || 0) >= 100;
    // tło portretu: czerwone pulsowanie przy niskim życiu, płomienie przy pełnej furii
    ctx.fillStyle = low ? `rgb(${90 + Math.round(60 * Math.abs(Math.sin(G.frame * 0.12)))},26,30)` : '#2a3a5a'; ctx.fillRect(L.px + 1, 6, 20, 20);
    ctx.save(); ctx.beginPath(); ctx.rect(L.px + 1, 6, 20, 20); ctx.clip();
    if (fury) for (let i = 0; i < 6; i++) {
      const k = ((G.frame * 0.05 + i / 6) % 1);
      ctx.fillStyle = k < 0.5 ? 'rgba(255,200,60,0.8)' : 'rgba(255,90,20,0.7)';
      ctx.beginPath(); ctx.arc(L.px + 3 + i * 3.4, 26 - k * 18, 3.5 * (1 - k) + 1, 0, Math.PI * 2); ctx.fill();
    }
    const shake = hurtNow && G.frame % 4 < 2 ? (G.frame % 8 < 4 ? 1 : -1) : 0;
    SP.drawPortrait(ctx, p.b, L.px + 11 + shake, 17, 7, p.flash > 0 && p.flash % 2 === 0, { hurt: hurtNow, low, fury, t: G.frame });
    ctx.restore();
    if (fury) { ctx.strokeStyle = G.frame % 10 < 5 ? '#ffe040' : '#ff6020'; ctx.lineWidth = 1; ctx.strokeRect(L.px - 0.5, 4.5, 23, 23); }
    if (p.out) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(L.px + 1, 6, 20, 20); return; }
    const f = clamp(p.hp / p.maxHp, 0, 1);
    bar(L.bx, 17, 96, 6, f, p.lagHp / p.maxHp, f > 0.5 ? '#40e060' : (f > 0.25 ? '#f0d030' : '#f04040'));
    ctx.fillStyle = '#000'; ctx.fillRect(L.bx - 1, 24, 98, 4);
    if (p.mount) { ctx.fillStyle = '#7cff7c'; ctx.fillRect(L.bx, 25, 96 * p.mount.t / (p.mount.max || MOUNT_TIME), 2); }
    else {
      const full = p.fury >= 100;
      ctx.fillStyle = full ? (G.frame % 10 < 5 ? '#ffe040' : '#ff6020') : '#e07020'; ctx.fillRect(L.bx, 25, 96 * Math.min(1, (p.fury || 0) / 100), 2);
    }
    // bursztyn
    const ax = L.bx + 74;
    ctx.fillStyle = '#140c10'; ctx.beginPath(); ctx.moveTo(ax, 29); ctx.lineTo(ax + 3, 32); ctx.lineTo(ax, 35); ctx.lineTo(ax - 3, 32); ctx.fill();
    ctx.fillStyle = '#f0a020'; ctx.beginPath(); ctx.moveTo(ax, 30); ctx.lineTo(ax + 2, 32); ctx.lineTo(ax, 34); ctx.lineTo(ax - 2, 32); ctx.fill();
  }
  function drawHud() {
    G.players.forEach((p, i) => drawPlayerPanel(p, i));
    G.hudEnemy = hudEnemy();
    if (G.hudEnemy) G.hudLayer = layeredBar(30, 37, 96, 5, G.hudEnemy.hp, G.hudEnemy.lagHp, 100);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(W / 2 - 16, 4, 32, 18);
  }
  function drawPanelText(p, side) {
    const L = PANEL[side];
    text(p.name, L.bx, 6, 6, '#ffe080');
    text(String(p.score).padStart(7, '0'), L.bx + 96, 6, 6, '#fff', 'right');
    if (p.out) { if (G.frame % 50 < 34) text((side + 1) + 'P: START', L.bx + 48, 17, 6, P_COLS[side], 'center'); return; }
    if (p.combo >= 2 && p.comboT > 0) {
      const sz = 9 + Math.min(5, p.combo / 4) + (p.comboPulse || 0) * 0.25, col = p.combo >= 10 ? '#ff9040' : p.combo >= 5 ? '#ffe040' : '#fff';
      const cy = side === 0 ? 54 : 38, cx = side === 0 ? 8 : W - 8, al = side === 0 ? 'left' : 'right';
      text(p.combo + ' HIT!', cx, cy, sz, col, al);
      text('KOMBO', cx, cy + sz + 2, 4, '#c0c0c0', al);
    }
    text('×' + p.lives, L.bx, 29, 5, '#fff');
    text(String(p.amber || 0), L.bx + 96, 29, 5, '#f0c060', 'right');
    const wx = L.bx + 18;
    if (p.mount) text(RIDE[p.mount.type].name, wx, 30, 4, '#7cff7c');
    else if (p.fury >= 100 && G.frame % 40 < 28) text('FURIA! ATAK+SKOK', wx, 30, 4, '#ffe040');
    else if (p.weapon === 'rifle') text('STRZELBA ' + p.ammo, wx, 29, 5, '#ffd080');
    else if (p.weapon === 'dynamite') text('DYNAMIT ×' + p.ammo, wx, 29, 5, '#ff9070');
    else if (p.weapon === 'grenade') text('GRANAT ×' + p.ammo, wx, 29, 5, '#a0e070');
    else if (MELEE[p.weapon]) text(WEAPON_NAMES[p.weapon] + ' ' + p.dur, wx, 29, 5, '#c0d0e0');
  }
  function drawHudText() {
    G.players.forEach((q, i) => drawPanelText(q, i));
    if (G.players.length < 2 && G.frame % 60 < 40) {
      text('2P: NACIŚNIJ START', W - 8, 8, 5, P_COLS[1], 'right');
      text('{start:1|SHIFT / NUM ENTER}', W - 8, 16, 4, '#a0a0b0', 'right');
    }
    if (G.special === 'training' || G.special === 'survival') text('--', W / 2, 7, 10, '#c0c0c0', 'center');
    else text(String(Math.max(0, G.timer)).padStart(2, '0'), W / 2, 7, 10, G.timer < 15 && G.frame % 30 < 15 ? '#ff6060' : '#fff', 'center');
    if (G.special === 'training' && G.train) {
      const T = G.train;
      text('TRENING', W / 2, 32, 7, '#7cff7c', 'center');
      text('OSTATNI CIOS ' + T.last + '   SUMA ' + T.total + '   TRAFIENIA ' + T.hits, W / 2, 43, 4, '#fff', 'center');
      G.players.forEach((q, i) => {
        const mv = q.def.moves || [];
        text(q.name + ': ' + mv.join('   '), W / 2, 196 + i * 7, 3.5, i ? '#b0c8e0' : '#e0c0b0', 'center');
      });
      text('BLOK (TRZYMAJ): GARDA, TUŻ PRZED CIOSEM = PAROWANIE   DÓŁ+ATAK W SKOKU: RZUT W LOCIE   PAUZA: WYJŚCIE', W / 2, 210, 3.5, '#c0c0c0', 'center');
    }
    text('HI ' + String(Math.max(app.hiscore, ...G.players.map(q => q.score))).padStart(7, '0'), W / 2, 24, 4, '#80d0ff', 'center');
    if (G.rush) {
      text('BOSS RUSH ' + (app.rush.i + 1) + '/6   ' + fmtTime(app.rush.frames), W / 2, 32, 5, '#ff9a80', 'center');
      if (G.rushCard > 0) { text('BOSS ' + (app.rush.i + 1) + ' / 6', W / 2, 74, 12, '#ffe080', 'center'); text(shortName(ST), W / 2, 92, 6, '#fff', 'center'); }
    }
    if (G.special === 'escape' && !G.bossDead) {
      text('UCIEKAJ! ►  DO WYJŚCIA ' + Math.max(0, Math.round((ST.LEN - W - G.camX) / 10)) + ' M', W / 2, 32, 5, G.frame % 30 < 20 ? '#ffb030' : '#fff', 'center');
    }
    if (G.special === 'survival' && G.surv) {
      text('FALA ' + G.surv.wave, W / 2, 32, 6, '#ffe080', 'center');
      if (G.surv.state === 'rest' && G.introT <= 0) text('NASTĘPNA FALA ZA ' + Math.ceil(G.surv.t / 60), W / 2, 100, 7, '#fff', 'center');
    }
    if (G.special === 'cages') text('UWOLNIONE ' + G.freed + '/' + G.cageTotal, W / 2, 32, 6, G.freed >= G.cageTotal ? '#7cff7c' : '#ffe080', 'center');
    if (G.cartWarn && G.frame % 10 < 6) { const wx = G.cartWarn.side > 0 ? W - 20 : 20; text('!', wx, 150, 16, '#ff4040', 'center'); text('WAGONIK', wx, 172, 4, '#ff8080', 'center'); }
    if (G.superFreeze > 0 && G.superWho) {
      const q = G.superWho;
      if (G.superWho2) {
        text(q.name + ' + ' + G.superWho2.name, W / 2, 86, 6, '#fff', 'center');
        text('SUPER DRUŻYNOWY!', W / 2, 98, 11, '#ffe040', 'center');
      } else {
        text(q.name, 90, 86, 6, P_COLS[q.pIdx]);
        text(SUPER_NAMES[q.key] + '!', 90, 98, 11, '#ffe040');
      }
    }
    if (G.hint && G.hint.t > 0) {
      sctx.fillStyle = 'rgba(10,8,20,0.82)'; sctx.fillRect(20 * S, 192 * S, (W - 40) * S, 22 * S);
      text('OPIEKUN', W / 2, 195, 4, '#80f0ff', 'center');
      text(G.hint.txt, W / 2, 203, 4.5, '#fff', 'center');
    }
    // podpowiedź przy oswojonej bestii
    for (const a of G.actors) if (a.state === 'tamed' && G.frame % 40 < 28) text('{attack|ATAK} — DOSIĄDŹ!', a.x - G.camX, a.y - 58, 4, '#7cff7c', 'center');
    for (const v of (G.vehicles || [])) if (!v.used && G.frame % 40 < 28) text(v.type === 'jeep' ? 'ATAK — WSIĄDŹ!' : 'ATAK — WSKOCZ!', v.x - G.camX, v.y - 46, 4, '#7cff7c', 'center');
    if (G.hudEnemy) {
      text(G.hudEnemy.name, 30, 44, 5, '#ff9a80');
      if (G.hudLayer > 0) text('×' + (G.hudLayer + 1), 128, 36, 5, '#fff');
    }
    if (G.ch && app.mode !== 'chalres') drawChalHud();
    if (G.daily && G.introT <= 0) text('CODZIENNE ' + dailyLabel(), W / 2, 34, 4, '#80d0ff', 'center');
    if (Math.abs(G.wind || 0) > 0.012) {
      const n = Math.abs(G.wind) > 0.035 ? 3 : Math.abs(G.wind) > 0.022 ? 2 : 1;
      text('WIATR ' + (G.wind > 0 ? '►'.repeat(n) : '◄'.repeat(n)), W / 2 + 46, 10, 4, '#c0e0ff');
    }
    if (G.banner && G.frame % 30 < 22) text(G.banner.txt, W / 2, 62, 8, G.banner.col, 'center');
    if (G.goT > 0 && G.frame % 40 < 26) { text('GO', W - 52, 90, 14, '#ffe040'); text('►', W - 26, 90, 14, '#ffe040'); }
    if (G.introT > 0) {
      const a = G.introT > 130 ? (150 - G.introT) / 20 : (G.introT < 20 ? G.introT / 20 : 1);
      sctx.globalAlpha = a;
      text(ST.name, W / 2, 80, 9, '#ffe080', 'center');
      text(ST.sub, W / 2, 98, 6, '#fff', 'center');
      if (G.wx) text(G.wx.name, W / 2, 112, 5, '#c0e0ff', 'center');
      sctx.globalAlpha = 1;
    }
    for (const pp of G.popups) text(pp.txt, pp.x - G.camX, pp.y - pp.t * 0.4, 6, pp.col || '#fff', 'center');
    if (G.introBoss && G.introBoss.def.title) {
      text(G.introBoss.def.title, W / 2, 60, 12, '#ff6040', 'center');
      text(G.introBoss.def.sub, W / 2, 78, 6, '#fff', 'center');
    }
    if (G.bossDead && G.clearT > 150 && app.mode === 'play') text('ETAP UKOŃCZONY!', W / 2, 80, 12, G.frame % 20 < 10 ? '#ffe040' : '#fff', 'center');
  }

  // =============================================================== EKRANY
  function drawTitle() {
    const s1 = STAGES[0], L = s1.buildLayers();
    const camX = (app.frame * 0.6) % (s1.LEN - W);
    s1.drawBack(ctx, L, camX, app.frame);
    s1.drawFront(ctx, L, camX, app.frame);
    ctx.fillStyle = 'rgba(10,5,15,0.55)'; ctx.fillRect(0, 0, W, H);
    SP.drawRaptor(ctx, 300, 205, -1, app.frame, 'run', RAPTOR_COLS[0], { scale: 2 });
    SP.drawFigure(ctx, CHARS.kruk.build, P.run[Math.floor(app.frame / 5) % 4], 70, 205, 1, {});
    SP.drawFigure(ctx, CHARS.nina.build, P.run[Math.floor(app.frame / 5 + 2) % 4], 100, 210, 1, {});
    SP.drawFigure(ctx, CHARS.tur.build, P.run[Math.floor(app.frame / 5 + 1) % 4], 130, 214, 1, {});
    SP.drawFigure(ctx, CHARS.borys.build, P.run[Math.floor(app.frame / 5 + 3) % 4], 158, 206, 1, { weapon: 'cane' });
  }
  function drawTitleText() {
    const wob = Math.sin(app.frame * 0.05) * 2;
    text('PALEO', W / 2, 26 + wob, 26, '#ffb030', 'center');
    text('HIGHWAY', W / 2, 54 + wob, 22, '#ff6030', 'center');
    text('RDZA I KŁY', W / 2, 82, 8, '#e0f0d0', 'center');
    const items = titleItems(), sp = Math.min(9, 66 / items.length), sz = items.length > 9 ? 4.8 : items.length > 7 ? 5.5 : 6;   // menu mieści się nad podpowiedziami
    items.forEach((l, i) => {
      const sel = (app.menuSel || 0) === i;
      text((sel ? '► ' : '') + l, W / 2, 93 + i * sp, sz, sel ? (app.frame % 30 < 20 ? '#ffe040' : '#fff') : (l === 'KONTYNUUJ' ? '#7cff7c' : '#a0a0b0'), 'center');
    });
    if (app.save && items[app.menuSel || 0] === 'KONTYNUUJ') text('ZAPIS: ' + saveLabel(app.save), W / 2, 184, 3.5, '#7cff7c', 'center');
    text('1P: ' + keysFor(0, 'left') + '/' + keysFor(0, 'right') + '  ATAK ' + keysFor(0, 'attack') + '  SKOK ' + keysFor(0, 'jump') + '  SPECJAŁ ATAK+SKOK  BLOK ' + keysFor(0, 'block'), W / 2, 163, 3.5, '#e0c0b0', 'center');
    text('2P: NACIŚNIJ ' + keysFor(1, 'start') + ' — DOŁĄCZ   M: WYCISZ   P: PAUZA', W / 2, 169, 3.5, '#b0c8e0', 'center');
    text('POZIOM: ' + diffNow().name + '   ŻYCIA: ' + OPTS.lives + '   OSIĄGNIĘCIA: ' + Object.keys(app.ach).length + '/' + ACH.length, W / 2, 176, 3.5, '#c0c0c0', 'center');
    // podpowiedź dla nowych graczy, dopóki nie otworzą poradnika
    if (!safeGet('paleo_howto') && (app.frame % 90) < 60) text('NOWY GRACZ? ZAJRZYJ DO „JAK GRAĆ”', W / 2, 191, 4, '#ffe080', 'center');
    // przeglądarka udostępnia pad dopiero po naciśnięciu na nim przycisku
    if (navigator.getGamepads && !padsNow.length && (app.frame % 120) < 90) text('MASZ PADA? NACIŚNIJ NA NIM DOWOLNY PRZYCISK, ABY GO WYKRYĆ', W / 2, 184, 3.5, '#80f0ff', 'center');
    text('HI-SCORE ' + String(app.hiscore).padStart(7, '0'), W / 2, 4, 5, '#80d0ff', 'center');
    if (urlStage > 0 && !app.debug) text('START OD ETAPU ' + (urlStage + 1), W / 2, 170, 5, '#ffe080', 'center');
  }
  function drawShop() {
    const cs = window.SPECIAL_STAGES.cages, L = cs.buildLayers();
    cs.drawBack(ctx, L, 120, app.frame || 0);
    ctx.fillStyle = 'rgba(8,4,14,0.7)'; ctx.fillRect(0, 0, W, H);
    const sh = app.shop, q = sh.team[sh.who];
    ctx.fillStyle = P_COLS[q.pIdx]; ctx.fillRect(20, 30, 46, 46);
    ctx.fillStyle = '#2a3a5a'; ctx.fillRect(22, 32, 42, 42);
    ctx.save(); ctx.beginPath(); ctx.rect(22, 32, 42, 42); ctx.clip(); SP.drawPortrait(ctx, q.b, 43, 58, 14, false); ctx.restore();
    UPGRADES.forEach(([id, , costs], i) => {
      const y = 92 + i * 15, sel = i === sh.sel;
      if (sel) { ctx.fillStyle = 'rgba(255,200,60,0.18)'; ctx.fillRect(84, y - 3, W - 104, 13); }
      if (id !== 'life') for (let k = 0; k < costs.length; k++) { ctx.fillStyle = k < q.up[id] ? '#f0a020' : '#3a3048'; ctx.fillRect(232 + k * 9, y, 7, 6); }
    });
  }
  function drawShopText() {
    const sh = app.shop, q = sh.team[sh.who];
    text('OBÓZ — ULEPSZENIA', W / 2, 8, 10, '#ffe080', 'center');
    text(q.name + (sh.team.length > 1 ? '  (◄ ► GRACZ)' : ''), 76, 34, 7, P_COLS[q.pIdx]);
    text('BURSZTYN: ' + (q.amber || 0) + '   ŻYCIA: ' + q.lives, 76, 48, 6, '#f0c060');
    text('BURSZTYN ZDOBYWASZ Z POKONANYCH WROGÓW I KLEJNOTÓW', 76, 62, 3.5, '#a09080');
    UPGRADES.forEach(([id, name, costs], i) => {
      const y = 92 + i * 15, sel = i === sh.sel, cost = upCost(q, id, costs);
      text((sel ? '► ' : '') + name, 88, y, 5.5, sel ? '#ffe040' : '#fff');
      text(cost === undefined ? 'MAX' : cost + ' B', W - 22, y, 5.5, cost === undefined ? '#7cff7c' : (q.amber || 0) >= cost ? '#f0c060' : '#8a7060', 'right');
    });
    const ds = sh.sel === UPGRADES.length;
    text((ds ? '► ' : '') + 'DALEJ — NA MAPĘ', 88, 92 + UPGRADES.length * 15 + 4, 6, ds ? '#7cff7c' : '#a0c0a0');
    if (sh.msgT > 0) text(sh.msg, W / 2, 196, 5, '#ffe080', 'center');
    else if (!ds) text(UPGRADES[sh.sel][3], W / 2, 196, 4, '#c0e0ff', 'center');
    text('▲▼ WYBÓR   {attack|ENTER} — KUP   {back|ESC} — NA MAPĘ', W / 2, 210, 4, '#c0c0c0', 'center');
  }

  // ---- EKSTRA
  const EXTRA_ITEMS = ['OSIĄGNIĘCIA', 'BESTIARIUSZ', 'ODTWARZACZ MUZYKI', 'WŁASNE ETAPY', 'POWRÓT'];
  app.seen = loadJSON('paleo_seen') || {};
  app.heard = loadJSON('paleo_heard') || {};
  const BESTIARY = [
    ['kruk', 'BOHATER', 'MECHANIK Z PRZYDROŻNEGO WARSZTATU.', 'NAPRAWI KAŻDE AUTO I KAŻDĄ KRZYWDĘ.'],
    ['nina', 'BOHATER', 'STRAŻNICZKA REZERWATU.', 'NAJSZYBSZA W DRUŻYNIE, KOPIE JAK RAPTOR.'],
    ['tur', 'BOHATER', 'BYŁY GÓRNIK O SILE TARANA.', 'JEDEN CIOS — JEDEN KŁUSOWNIK MNIEJ.'],
    ['borys', 'BOHATER', 'STARY TROPICIEL Z LASKĄ.', 'ZNA KAŻDĄ ŚCIEŻKĘ W DŻUNGLI.'],
    ['grunt', 'KŁUSOWNIK', 'SZEREGOWY KŁUSOWNIK Z NOŻEM.', 'GROŹNY GŁÓWNIE W GRUPIE.'],
    ['thin', 'KŁUSOWNIK', 'ZWINNY ZWIADOWCA W KAPTURZE.', 'ATAKUJE DOSKOKIEM Z KOPNIĘCIEM.'],
    ['brute', 'KŁUSOWNIK', 'OSIŁEK O POTĘŻNYM BRZUCHU.', 'SZARŻUJE NA OŚLEP — ZEJDŹ Z DROGI.'],
    ['bomber', 'KŁUSOWNIK', 'SPECJALISTA OD DYNAMITU.', 'UCIEKAJ, GDY LONT SIĘ ŻARZY.'],
    ['gunner', 'KŁUSOWNIK', 'STRZELEC Z KARABINEM.', 'CZERWONY LASER ZDRADZA STRZAŁ.'],
    ['shield', 'KŁUSOWNIK', 'TARCZOWNIK W HEŁMIE.', 'ZAJDŹ GO OD TYŁU ALBO GO CHWYĆ.'],
    ['sniper', 'KŁUSOWNIK', 'SNAJPER NA RUSZTOWANIU.', 'UCIEKAJ Z CELOWNIKA, ZDEJMIJ GO Z WYSKOKU.'],
    ['netter', 'KŁUSOWNIK', 'ŁOWCA Z SIECIĄ.', 'WCISKAJ PRZYCISKI, BY SIĘ WYRWAĆ.'],
    ['flamer', 'KŁUSOWNIK', 'PODPALACZ Z MIOTACZEM OGNIA.', 'ZOSTAWIA PŁONĄCĄ PODŁOGĘ — OBCHODŹ OGIEŃ.'],
    ['glider', 'KŁUSOWNIK', 'LOTNIARZ — ZWIADOWCA NA LOTNI.', 'ZRZUCA SIECI Z GÓRY. STRĄĆ GO Z WYSKOKU.'],
    ['rraptor', 'KŁUSOWNIK', 'JEŹDZIEC NA OSIODŁANYM RAPTORZE.', 'PRZEWRÓĆ GO — RAPTOR ZOSTANIE TWÓJ.'],
    ['raptor', 'BESTIA', 'SZYBKI DRAPIEŻNIK DŻUNGLI.', 'POKONANY POZWALA SIĘ DOSIĄŚĆ.'],
    ['pachy', 'BESTIA', 'ROŚLINOŻERCA Z TWARDĄ KOPUŁĄ.', 'TARANUJE WSZYSTKO NA SWOJEJ DRODZE.'],
    ['ptera', 'BESTIA', 'LATAJĄCY GAD Z GRZEBIENIEM.', 'ZRZUCA KAMIENIE — PATRZ NA CIEŃ.'],
    ['trike', 'BESTIA', 'TRICERATOPS Z KOŚCISTĄ KRYZĄ.', 'JAKO WIERZCHOWIEC BLOKUJE CIOSY Z PRZODU.'],
    ['para', 'BESTIA', 'PARAZAUROLOF Z RUROWATYM GRZEBIENIEM.', 'JEGO RYK OGŁUSZA WSZYSTKICH W POBLIŻU.'],
    ['whitefang', 'MINI-BOSS', 'ALBINOSKI RAPTOR Z LEGEND.', 'CZEKA ZA POPĘKANYMI ŚCIANAMI.'],
    ['digger', 'MINI-BOSS', 'BRYGADZISTA W PANCERNEJ KOPARCE.', 'ŁYŻKA Z GÓRY I SZARŻA — UNIKAJ Z BOKU.'],
    ['boss', 'BOSS', 'KAPITAN RDZA — SZEF KŁUSOWNIKÓW.', 'MŁOT ELEKTRYCZNY I SKOK Z FALĄ.'],
    ['zmija', 'BOSS', 'ŻMIJA — KRÓLOWA BAGIEN.', 'BICZ, SALTA I WACHLARZ NOŻY.'],
    ['klin', 'BOSS', 'KLIN — STARSZY Z BRACI TRZASK.', 'SZARŻUJE Z SIŁĄ BULDOŻERA.'],
    ['klamra', 'BOSS', 'KLAMRA — MŁODSZY Z BRACI.', 'RZUCA NOŻAMI I ATAKUJE Z ZASKOCZENIA.'],
    ['rex', 'BOSS', 'STARY KIEŁ — PRADAWNY WŁADCA GÓRY.', 'RYK OGŁUSZA, OGON MIAŻDŻY.'],
    ['szpon', 'BOSS', 'ADMIRAŁ SZPON — PAN PRZEMYTNIKÓW.', 'HARPUN Z CELOWNIKIEM I KOTWICA.'],
    ['padliniarz', 'BOSS', 'PADLINIARZ — KRÓL ŚMIETNISKA.', 'KOTWICA, GRUBA SKÓRA I BANDA ZBIERACZY.'],
    ['deino', 'BOSS', 'ZĘBACZ — MUTANT Z KANAŁÓW.', 'ZDZICZAŁY W ŚCIEKACH KUZYN STAREGO KŁA.'],
    ['baron', 'BOSS', 'BARON BURSZTYN — WŁADCA IMPERIUM.', 'TELEPORT, LASKA I FALE ENERGII.']
  ];
  const isHero = k => !!CHARS[k];
  const bestUnlocked = k => isHero(k) || !!app.seen[k];
  const JUKE = [['title', 'MOTYW TYTUŁOWY'], ['map', 'MAPA REGIONU'], ['stage1', 'ZIELONA RDZA'], ['stage2', 'SMOLNE BAGNA'], ['stage3', 'MIASTO CIENI'],
    ['stage4', 'OGNISTE SZYBY'], ['stage5', 'PORT PRZEMYTNIKÓW'], ['beach', 'OPUSZCZONA PLAŻA'], ['sewer', 'KANAŁY OTCHŁANI'], ['stage6', 'BURSZTYNOWA TWIERDZA'], ['boss', 'STARCIE Z BOSSEM'], ['beast', 'STARY KIEŁ'],
    ['final', 'BARON BURSZTYN'], ['drive', 'AUTOSTRADA 7'], ['clear', 'ETAP UKOŃCZONY'], ['gameover', 'KONIEC GRY'], ['ending', 'ZAKOŃCZENIE']];
  // zapamiętaj usłyszane utwory (odblokowanie w odtwarzaczu)
  const _play = AU.play.bind(AU);
  AU.play = (name, opt) => { if (!app.heard[name]) { app.heard[name] = 1; safeSet('paleo_heard', JSON.stringify(app.heard)); } _play(name, opt); };
  const songUnlocked = k => k === 'title' || k === 'map' || !!app.heard[k];
  const bmCache = {};
  function drawModel(k, x, y, t) {
    const d = ENEMIES[k];
    if (isHero(k)) { ctx.save(); ctx.translate(x, y); ctx.scale(2, 2); SP.drawFigure(ctx, CHARS[k].build, P.walk[Math.floor(t / 8) % 4], 0, 0, 1, { weapon: CHARS[k].innate }); ctx.restore(); return; }
    if (k === 'raptor' || k === 'whitefang') { SP.drawRaptor(ctx, x, y, 1, t, 'walk', k === 'raptor' ? RAPTOR_COLS[0] : { body: '#e8e6dc', belly: '#ffffff', stripe: '#b8b8c4' }, { scale: 1.7 }); return; }
    if (k === 'rraptor') { const a = { face: 1, animT: t, state: 'walk', rider: bmCache.rider || (bmCache.rider = ENEMIES.grunt.mk()) };
      SP.drawRaptor(ctx, x, y, 1, t, 'walk', { body: '#7a5a3a', belly: '#c8a878', stripe: '#3a2a1a' }, { scale: 1.5 });
      ctx.save(); ctx.translate(x, y); ctx.scale(1.5, 1.5); SP.drawFigure(ctx, a.rider, SEAT, -1, -25, 1, { weapon: 'knife' }); ctx.restore(); return; }
    if (k === 'digger') { ctx.save(); ctx.translate(x, y); ctx.scale(1.1, 1.1); drawDigger({ face: 1, state: 'idle', animT: t, t: 0 }, 6, 0, false); ctx.restore(); return; }
    if (k === 'glider') { if (!bmCache[k]) bmCache[k] = d.mk(); ctx.save(); ctx.translate(x, y - 30); ctx.scale(1.6, 1.6); drawGlider({ b: bmCache[k], face: 1, state: 'glide', t: 0 }, 0, 0, false); ctx.restore(); return; }
    if (k === 'rex' || k === 'deino') { SP.drawRaptor(ctx, x + 10, y, 1, t, 'walk', k === 'deino' ? DEINO_COLS : REX_COLS, { scale: 1.25, rex: true }); return; }
    if (k === 'pachy') { ctx.save(); ctx.translate(x, y); ctx.scale(1.7, 1.7); SP.drawPachy(ctx, 0, 0, 1, t, 'walk', PACHY_COLS[0], {}); ctx.restore(); return; }
    if (k === 'trike' || k === 'para') { ctx.save(); ctx.translate(x, y); ctx.scale(1.5, 1.5); (k === 'trike' ? SP.drawTrike : SP.drawPara)(ctx, 0, 0, 1, t, 'walk', k === 'trike' ? TRIKE_COLS[0] : PARA_COLS[0], {}); ctx.restore(); return; }
    if (k === 'ptera') { ctx.save(); ctx.translate(x, y - 50); ctx.scale(1.8, 1.8); SP.drawPtera(ctx, 0, 0, 1, t, 'fly', {}); ctx.restore(); return; }
    if (!bmCache[k]) bmCache[k] = d.mk();
    const b = bmCache[k], sc = 2 / (b.scale || 1) * Math.min(1.25, b.scale || 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    SP.drawFigure(ctx, b, P.walk[Math.floor(t / 8) % 4], 0, 0, 1, { weapon: d.weapon === 'harpoonGun' ? 'harpoonGun' : d.weapon });
    ctx.restore();
  }
  function drawExtras() {
    drawScoresBg();
    const t = app.frame || 0;
    if (app.sub === 'bestiary') {
      const [k] = BESTIARY[app.bestSel];
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(16, 30, 150, 170);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(91, 184, 40, 6, 0, 0, Math.PI * 2); ctx.fill();
      if (bestUnlocked(k)) drawModel(k, 91, 184, t);
    } else if (app.sub === 'jukebox') {
      if (AU.ctx && !app.analyser) { app.analyser = AU.ctx.createAnalyser(); app.analyser.fftSize = 64; AU.music.connect(app.analyser); }
      if (app.analyser && AU.current) {
        const data = new Uint8Array(app.analyser.frequencyBinCount); app.analyser.getByteFrequencyData(data);
        for (let i = 0; i < 24; i++) { const h = data[i] / 255 * 46; ctx.fillStyle = `hsl(${30 + i * 8},80%,55%)`; ctx.fillRect(250 + i * 5, 196 - h, 4, h); }
      }
    }
  }
  function drawExtrasText() {
    const t = app.frame || 0;
    if (!app.sub) {
      text('EKSTRA', W / 2, 30, 12, '#ffe080', 'center');
      EXTRA_ITEMS.forEach((l, i) => { const sel = i === app.exSel; text((sel ? '► ' : '') + l, W / 2, 80 + i * 18, 8, sel ? '#ffe040' : '#a0a0b0', 'center'); });
      text('OSIĄGNIĘCIA ' + Object.keys(app.ach).length + '/' + ACH.length + '   BESTIARIUSZ ' + BESTIARY.filter(b => bestUnlocked(b[0])).length + '/' + BESTIARY.length +
        '   UTWORY ' + JUKE.filter(j => songUnlocked(j[0])).length + '/' + JUKE.length, W / 2, 170, 4, '#c0c0c0', 'center');
      return;
    }
    if (app.sub === 'custom') {
      text('WŁASNE ETAPY', W / 2, 10, 9, '#ffe080', 'center');
      const L = app.cuList || [];
      if (!L.length) text('BRAK ETAPÓW — STWÓRZ PIERWSZY W EDYTORZE', W / 2, 40, 5, '#c0c0c0', 'center');
      const top = Math.max(0, Math.min(app.cuSel - 6, L.length - 11));
      L.slice(top, top + 12).forEach((d, k) => {
        const i = top + k, sel = i === app.cuSel, y = 34 + k * 12;
        const waves = (d.WAVES || []).length, theme = shortName(STAGES[clamp(d.theme | 0, 0, STAGES.length - 1)]);
        text((sel ? '► ' : '') + String(d.name || 'BEZ NAZWY').toUpperCase().slice(0, 26), 24, y, 5, sel ? '#ffe040' : '#e0e0f0');
        text(theme + ' · FALE ' + waves + ' · ' + d._src, W - 20, y + 1, 3.5, sel ? '#ffe080' : '#8a8098', 'right');
      });
      const ys = 34 + Math.min(12, L.length) * 12 + 6, sel = app.cuSel === L.length;
      text((sel ? '► ' : '') + 'OTWÓRZ EDYTOR ETAPÓW', W / 2, ys, 6, sel ? '#7cff7c' : '#80c080', 'center');
      text('ETAPY Z EDYTORA ZAPISUJĄ SIĘ W PRZEGLĄDARCE; EKSPORT DO PLIKU: JS/STAGES/CUSTOM.JS', W / 2, 194, 3.5, '#a0a0b0', 'center');
      text('▲▼ WYBÓR   {ok|ENTER} — GRAJ   {back|ESC} — POWRÓT', W / 2, 208, 4, '#c0c0c0', 'center');
      return;
    }
    if (app.sub === 'ach') {
      text('OSIĄGNIĘCIA ' + Object.keys(app.ach).length + '/' + ACH.length, W / 2, 8, 8, '#ffe080', 'center');
      ACH.forEach(([id, name, desc], i) => {
        const on = !!app.ach[id], y = 22 + i * Math.min(10.2, 176 / ACH.length);
        text((on ? '★ ' : '· ') + name, 20, y, 4.5, on ? '#ffe040' : '#7a7088');
        text(desc, W - 18, y + 0.5, 3.5, on ? '#e0e0f0' : '#6a6478', 'right');
      });
      text('{back|ESC} — POWRÓT', W / 2, 212, 4, '#c0c0c0', 'center');
      return;
    }
    if (app.sub === 'bestiary') {
      const [k, cat, d1, d2] = BESTIARY[app.bestSel], on = bestUnlocked(k);
      const name = isHero(k) ? CHARS[k].name : ENEMIES[k].name, d = ENEMIES[k];
      text('BESTIARIUSZ  ' + (app.bestSel + 1) + '/' + BESTIARY.length, W / 2, 8, 7, '#ffe080', 'center');
      if (!on) { text('?', 91, 90, 40, '#3a3048', 'center'); text('???', 270, 60, 10, '#7a7088', 'center'); text('JESZCZE NIE SPOTKANY', 270, 84, 5, '#7a7088', 'center'); }
      else {
        text(cat, 270, 40, 5, cat === 'BOSS' || cat === 'MINI-BOSS' ? '#ff9a80' : cat === 'BOHATER' ? '#7cff7c' : '#80d0ff', 'center');
        text(name, 270, 52, name.length > 12 ? 7 : 9, '#fff', 'center');
        text(d1, 270, 82, 3.5, '#e0e0f0', 'center');
        text(d2, 270, 92, 3.5, '#e0e0f0', 'center');
        if (isHero(k)) {
          const c = CHARS[k];
          text('ŻYCIE ' + c.hp + '   SZYBKOŚĆ ' + c.speed, 270, 112, 4, '#c0c0c0', 'center');
          (c.moves || []).forEach((m, i) => text(m, 270, 126 + i * 9, 3.5, '#ffe080', 'center'));
        } else {
          text('ŻYCIE ' + d.hp + (d.score ? '   PUNKTY ' + d.score : ''), 270, 112, 4, '#c0c0c0', 'center');
        }
      }
      text('◄ ► PRZEGLĄDAJ   {back|ESC} — POWRÓT', W / 2, 210, 4, '#c0c0c0', 'center');
      return;
    }
    if (app.sub === 'jukebox') {
      text('ODTWARZACZ MUZYKI', W / 2, 8, 8, '#ffe080', 'center');
      JUKE.forEach(([k, name], i) => {
        const sel = i === app.jukeSel, on = songUnlocked(k), playing = AU.current && AU.current.name === k;
        const y = 26 + i * 11;
        text((sel ? '► ' : '') + (on ? name : '??????'), 30, y, 5, sel ? '#ffe040' : on ? '#e0e0f0' : '#6a6478');
        if (playing) text(t % 30 < 20 ? '♪ GRA' : '♪', 230, y, 5, '#7cff7c', 'right');
      });
      text('{ok|ENTER} — GRAJ/STOP   {back|ESC} — POWRÓT', W / 2, 210, 4, '#c0c0c0', 'center');
    }
  }

  // ---- ekran opcji
  const TITLE_BASE = ['START GRY', 'JAK GRAĆ', 'TRENING', 'WYZWANIA', 'BOSS RUSH', 'PRZETRWANIE', 'EKSTRA', 'OPCJE', 'NAJLEPSZE WYNIKI'];
  function titleItems() {
    const base = app.unlocks.ngp ? ['START GRY', 'NOWA GRA+'].concat(TITLE_BASE.slice(1)) : TITLE_BASE;
    const list = (app.save ? ['KONTYNUUJ'] : []).concat(base);
    if (app.installPrompt) list.push('ZAINSTALUJ APLIKACJĘ');
    return list;
  }
  const MODE_OF = { 'START GRY': 'arcade', 'NOWA GRA+': 'arcade', TRENING: 'training', 'BOSS RUSH': 'rush', PRZETRWANIE: 'survival' };
  const OPT_ROWS = ['diff', 'lives', 'assist', 'music', 'sfx', 'touch', 'crt', 'bezel', 'rumble', 'keys1', 'keys2', 'pad1', 'pad2', 'reset', 'back'];
  const OPT_DY = 10.5, OPT_Y = 28;
  function drawOptions() {
    drawScoresBg();
    if ((app.keysFor !== null && app.keysFor !== undefined) || app.padFor !== null && app.padFor !== undefined) return;
    OPT_ROWS.forEach((r, i) => {
      const y = OPT_Y + i * OPT_DY, sel = i === app.optSel;
      if (sel) { ctx.fillStyle = 'rgba(255,200,60,0.18)'; ctx.fillRect(30, y - 2, W - 60, 10); }
      if (r === 'music' || r === 'sfx') {
        const v = OPTS[r];
        for (let k = 0; k < 10; k++) { ctx.fillStyle = k < v ? (r === 'music' ? '#40c0f0' : '#f0a040') : '#3a3048'; ctx.fillRect(236 + k * 9, y, 7, 7); }
      }
    });
  }
  function drawPadBindText() {
    const i = app.padFor;
    text('PAD — GRACZ ' + (i + 1), W / 2, 12, 9, P_COLS[i], 'center');
    text(padsNow[i] ? String(padsNow[i].id).slice(0, 44).toUpperCase() : 'PAD NIE JEST PODŁĄCZONY', W / 2, 28, 4, padsNow[i] ? '#c0c8d0' : '#ff8080', 'center');
    PAD_BINDS.concat(['back']).forEach((a, k) => {
      const y = 38 + k * 13, sel = k === app.padSel;
      if (a === 'back') { text((sel ? '► ' : '') + 'POWRÓT', W / 2, y, 6, sel ? '#ffe040' : '#a0a0b0', 'center'); return; }
      text((sel ? '► ' : '') + (ACTION_NAMES[a] || 'PAUZA'), 60, y, 6, sel ? '#ffe040' : '#fff');
      const btns = PADMAPS[i][a], px = Math.round(6 * S);
      let x = (W - 60) * S;
      if (!btns.length) text('—', W - 60, y, 6, '#808080', 'right');
      for (let j = btns.length - 1; j >= 0; j--) { const w = padIconW(btns[j], px); x -= w; drawPadIcon(sctx, btns[j], x, y * S, px); x -= px * 0.4; }
    });
    if (app.padCapture) {
      sctx.fillStyle = 'rgba(0,0,0,0.75)'; sctx.fillRect(0, 88 * S, W * S, 46 * S);
      const dir = PAD_DIRS.includes(app.padCapture.action);
      text((dir ? 'PRZYCISK, KRZYŻAK LUB GAŁKA' : 'NACIŚNIJ PRZYCISK') + ' NA PADZIE ' + (i + 1) + ' DLA: ' + (ACTION_NAMES[app.padCapture.action] || 'PAUZA'), W / 2, 98, 6, '#ffe040', 'center');
      text('ESC — ANULUJ', W / 2, 116, 5, '#c0c0c0', 'center');
    }
    text('KIERUNEK MOŻE MIEĆ NARAZ PRZYCISK, GAŁKĘ I KRZYŻAK „HAT” — NOWY ZASTĘPUJE TEN SAM RODZAJ', W / 2, 186, 3.5, '#c0e0ff', 'center');
    text('▲▼ WYBÓR   {ok|ENTER} — ZMIEŃ   {back|ESC} — POWRÓT   R — DOMYŚLNE', W / 2, 206, 4, '#c0c0c0', 'center');
  }
  function drawOptionsText() {
    if (app.padFor !== null && app.padFor !== undefined) { drawPadBindText(); return; }
    if (app.keysFor !== null && app.keysFor !== undefined) {
      text('KLAWISZE — GRACZ ' + (app.keysFor + 1), W / 2, 12, 9, P_COLS[app.keysFor], 'center');
      BIND_ACTIONS.concat(['back']).forEach((a, i) => {
        const y = 40 + i * 16, sel = i === app.keySel;
        if (a === 'back') { text((sel ? '► ' : '') + 'POWRÓT', W / 2, y, 6, sel ? '#ffe040' : '#a0a0b0', 'center'); return; }
        text((sel ? '► ' : '') + ACTION_NAMES[a], 60, y, 6, sel ? '#ffe040' : '#fff');
        text(keysFor(app.keysFor, a), W - 60, y, 6, sel ? '#ffe040' : '#c0c8d0', 'right');
      });
      if (app.capture) {
        sctx.fillStyle = 'rgba(0,0,0,0.75)'; sctx.fillRect(0, 88 * S, W * S, 46 * S);
        text('NACIŚNIJ KLAWISZ DLA: ' + ACTION_NAMES[app.capture.action], W / 2, 98, 7, '#ffe040', 'center');
        text('ESC — ANULUJ', W / 2, 116, 5, '#c0c0c0', 'center');
      }
      if (app.captureMsg > 0) text('TEN KLAWISZ JEST ZAREZERWOWANY (P, M, ESC)', W / 2, 186, 4, '#ff8080', 'center');
      text('▲▼ WYBÓR   ENTER — ZMIEŃ KLAWISZ   ESC/SKOK — POWRÓT', W / 2, 206, 4, '#c0c0c0', 'center');
      return;
    }
    text('OPCJE', W / 2, 12, 10, '#ffe080', 'center');
    const label = { diff: 'POZIOM TRUDNOŚCI', lives: 'ŻYCIA', assist: 'OPIEKUN (POMOC)', music: 'MUZYKA', sfx: 'EFEKTY', touch: 'STEROWANIE DOTYKOWE', crt: 'FILTR CRT', bezel: 'RAMKA AUTOMATU', rumble: 'WIBRACJE PADA', pad1: 'PAD — GRACZ 1', pad2: 'PAD — GRACZ 2', keys1: 'KLAWISZE — GRACZ 1', keys2: 'KLAWISZE — GRACZ 2', reset: 'PRZYWRÓĆ DOMYŚLNE', back: 'POWRÓT' };
    OPT_ROWS.forEach((r, i) => {
      const y = OPT_Y + i * OPT_DY, sel = i === app.optSel, col = sel ? '#ffe040' : '#fff';
      text((sel ? '► ' : '') + label[r], 40, y, 6, col);
      let v = '';
      if (r === 'diff') v = '◄ ' + diffNow().name + ' ►';
      else if (r === 'lives') v = '◄ ' + OPTS.lives + ' ►';
      else if (r === 'assist') v = '◄ ' + (OPTS.assist ? 'WŁ.' : 'WYŁ.') + ' ►';
      else if (r === 'music' || r === 'sfx') v = String(OPTS[r]);
      else if (r === 'touch') v = '◄ ' + TOUCH_NAMES[OPTS.touch] + ' ►';
      else if (r === 'crt') v = '◄ ' + CRT_NAMES[crtMode()] + ' ►';
      else if (r === 'rumble') v = '◄ ' + (OPTS.rumble ? 'WŁ.' : 'WYŁ.') + ' ►';
      else if (r === 'bezel') v = '◄ ' + (OPTS.bezel ? 'WŁ.' : 'WYŁ.') + ' ►';
      else if (r === 'pad1' || r === 'pad2') v = (padsNow[r === 'pad1' ? 0 : 1] ? '' : 'BRAK  ') + '{ok|ENTER} ►';
      else if (r === 'keys1' || r === 'keys2') v = '{ok|ENTER} ►';
      if (v) text(v, r === 'music' || r === 'sfx' ? 228 : W - 40, y, 6, col, 'right');
    });
    if (OPT_ROWS[app.optSel] === 'diff') text(diffNow().desc, W / 2, 196, 4, '#c0e0ff', 'center');
    if (OPT_ROWS[app.optSel] === 'bezel') text('GRAFIKA OBUDOWY AUTOMATU ZAMIAST CZARNYCH PASÓW WOKÓŁ EKRANU', W / 2, 196, 4, '#c0e0ff', 'center');
    if (OPT_ROWS[app.optSel] === 'rumble') text('DRGANIA PRZY TRAFIENIACH, OBRAŻENIACH I WYBUCHACH', W / 2, 196, 4, '#c0e0ff', 'center');
    if (OPT_ROWS[app.optSel] === 'pad1' || OPT_ROWS[app.optSel] === 'pad2') text(padsNow.length + ' PAD(Y) PODŁĄCZONE — NACIŚNIJ PRZYCISK NA PADZIE, ABY GO WYKRYĆ', W / 2, 196, 4, '#c0e0ff', 'center');
    if (OPT_ROWS[app.optSel] === 'crt') text(CRT_DESC[crtMode()], W / 2, 196, 4, '#c0e0ff', 'center');
    if (OPT_ROWS[app.optSel] === 'assist') text('AUTOMATYCZNE BLOKI (40%) I PODPOWIEDZI O NOWYCH WROGACH', W / 2, 196, 4, '#c0e0ff', 'center');
    if (app.optMsg > 0) text('PRZYWRÓCONO USTAWIENIA Z CONFIG.JS', W / 2, 186, 4, '#7cff7c', 'center');
    text('▲▼ WYBÓR   ◄► ZMIANA   {ok|ENTER} — OK   {back|ESC} — POWRÓT', W / 2, 206, 4, '#c0c0c0', 'center');
  }
  function drawSelect() {
    ctx.fillStyle = '#140c1c'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 20; i++) { ctx.fillStyle = i % 2 ? '#1c1228' : '#180f22'; ctx.fillRect(0, i * 12, W, 12); }
    const KS = selKeys(), nK = KS.length, spK = W / nK, hw = Math.min(44, spK / 2 - 4);
    KS.forEach((k, i) => {
      const x = spK / 2 + i * spK, s1 = app.sel === i, s2 = app.p2Active && app.sel2 === i;
      ctx.fillStyle = s1 && s2 ? '#c080ff' : s1 ? P_COLS[0] : s2 ? P_COLS[1] : (k === 'bursztyn' ? '#6a4a1a' : '#3a2a4a'); ctx.fillRect(x - hw, 26, hw * 2, 112);
      if (s1 && s2) { ctx.fillStyle = P_COLS[1]; ctx.fillRect(x, 26, hw, 112); ctx.fillStyle = P_COLS[0]; ctx.fillRect(x - hw, 26, hw, 112); }
      ctx.fillStyle = s1 || s2 ? '#3a5a8a' : '#2a2238'; ctx.fillRect(x - hw + 2, 28, hw * 2 - 4, 108);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, 126, 22, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(x, 126); ctx.scale(nK > 4 ? 1.1 : 1.3, nK > 4 ? 1.1 : 1.3);
      const pose = (s1 || s2) ? (app.t % 120 < 20 ? P.victory[0] : P.idle[Math.floor(app.t / 28) % 2]) : P.idle[0];
      const b = s2 && !s1 && app.sel === app.sel2 ? altBuild(k) : CHARS[k].build;
      SP.drawFigure(ctx, b, pose, 0, 0, 1, { weapon: CHARS[k].innate });
      ctx.restore();
      const st = CHARS[k].stats;
      for (let s = 0; s < 3; s++) for (let j = 0; j < 4; j++) {
        ctx.fillStyle = j < st[s] ? ['#40e0a0', '#f06040', '#f0d040'][s] : '#3a3048';
        ctx.fillRect(x - 4 + j * 9, 164 + s * 8, 7, 5);
      }
    });
  }
  function drawSelectText() {
    text('WYBIERZ POSTAĆ', W / 2, 8, 9, '#ffe080', 'center');
    const KS = selKeys(), nK = KS.length, spK = W / nK, hw = Math.min(44, spK / 2 - 4);
    KS.forEach((k, i) => {
      const x = spK / 2 + i * spK, s1 = app.sel === i, s2 = app.p2Active && app.sel2 === i;
      if (s1) text('1P', x - hw + 6, 30, 5, P_COLS[0]);
      if (s2) text('2P', x + hw - 6, 30, 5, P_COLS[1], 'right');
      text(CHARS[k].name, x, 141, nK > 4 ? 6 : 7, s1 || s2 ? '#fff' : '#a090b0', 'center');
      text(CHARS[k].desc, x, 152, nK > 4 ? 3 : 3.5, '#c0b0d0', 'center');
      ['SZYB', 'SIŁA', 'ZDR'].forEach((l, s) => text(l, x - 7, 163 + s * 8, 4, '#c0b0d0', 'right'));
    });
    const mv = CHARS[selKeys()[app.sel]].moves;
    text('1P ' + CHARS[selKeys()[app.sel]].name + ' — ' + mv[0] + '   ' + mv[1], W / 2, 192, 3.5, '#e0c0b0', 'center');
    if (app.p2Active) { const m2 = CHARS[selKeys()[app.sel2]].moves; text('2P ' + CHARS[selKeys()[app.sel2]].name + ' — ' + m2[0] + '   ' + m2[1], W / 2, 199, 3.5, '#b0c8e0', 'center'); }
    else if (app.t % 50 < 35) text('2P: {start:1|SHIFT / NUM ENTER} — DOŁĄCZ', W / 2, 200, 4, P_COLS[1], 'center');
    if (app.t % 50 < 35) text('◄ ► WYBÓR   1P: {ok|ENTER/ATAK} — START   {back|ESC} — WSTECZ', W / 2, 212, 4, '#fff', 'center');
  }
  // =============================================================== MAPA (przejście między etapami)
  // Węzły trasy: start + 8 etapów. Współrzędne w pikselach bufora 384×224.
  const MAP_NODES = [
    { x: 26, y: 186, label: 'START' },
    { x: 66, y: 146, icon: 'palm' }, { x: 112, y: 188, icon: 'swamp' }, { x: 172, y: 138, icon: 'city' },
    { x: 196, y: 70, icon: 'volcano' }, { x: 282, y: 150, icon: 'port' }, { x: 250, y: 200, icon: 'beach' },
    { x: 252, y: 104, icon: 'sewer' }, { x: 334, y: 66, icon: 'fort' }
  ];
  // krawędzie trasy (węzeł = etap + 1) z punktami kontrolnymi krzywych
  const MAP_EDGES = { '0-1': [40, 150], '1-2': [96, 176], '2-3': [142, 172], '2-4': [130, 110], '3-5': [228, 170], '4-5': [252, 98],
    '5-6': [280, 186], '6-7': [222, 150], '7-8': [294, 70] };
  const edgeKey = (a, b) => a < b ? a + '-' + b : b + '-' + a;
  const MAP_ARRIVE = 170, MAP_END = 330;
  const G_MAP = { canvas: null, flash: 0 };
  // ---- OBÓZ: sklep z ulepszeniami przed każdą mapą trasy (zwykła gra)
  const UPGRADES = [
    ['hp', '+10% ŻYCIA', [3, 5, 8], 'WIĘKSZY PASEK ŻYCIA NA KOLEJNE ETAPY'],
    ['combo', 'DŁUŻSZE KOMBO', [3, 6], 'WIĘCEJ CZASU MIĘDZY TRAFIENIAMI W SERII'],
    ['bomb', 'MOCNIEJSZE BOMBY', [4, 7], '+25% OBRAŻEŃ WYBUCHÓW I +1 BOMBA W PACZCE'],
    ['ride', 'DŁUŻSZA JAZDA', [3, 5], '+5 SEKUND NA GRZBIECIE DINOZAURA'],
    ['fury', 'SZYBSZA FURIA', [4, 7], 'PASEK FURII ŁADUJE SIĘ O 25% SZYBCIEJ'],
    ['life', 'DODATKOWE ŻYCIE', [10], 'JEDNO ŻYCIE WIĘCEJ (MOŻNA KUPOWAĆ WIELE RAZY)']
  ];
  function upCost(q, id, costs) { return id === 'life' ? costs[0] : costs[q.up[id]]; }
  function goMap(idx, team) {
    if (team && !Array.isArray(team)) team = [team];
    if (team && app.gameMode === 'arcade' && !app.skipShop) {
      app.mode = 'shop'; app.t = 0; app.shop = { idx, team, who: 0, sel: 0, msg: '', msgT: 0 };
      AU.stopMusic(); AU.play('map');
      return;
    }
    if (team) saveProgress(idx === 'branch' ? { type: 'branch' } : { type: 'map', idx }, team);
    app.route = app.route || [];
    app.mapFrom = app.route.length ? app.route[app.route.length - 1] + 1 : 0;
    app.mapChoice = idx === 'branch' ? { opts: [2, 3], sel: 0 } : null;
    if (idx === 'branch') idx = 2;
    app.mode = 'map'; app.t = 0; app.mapTo = idx; app.mapPlayer = team;
    app.mapTeam = team ? team.map(q => ({ key: q.key, b: q.b, name: q.name })) : makeTeam().map(q => ({ key: q.key, b: q.b, name: q.name }));
    AU.stopMusic(); AU.play('map');
  }
  function mapSeg(na, nb, k) {
    // punkt na krzywej z węzła na do nb (kwadratowa Béziera); brak krawędzi → linia prosta
    const a = MAP_NODES[na], b = MAP_NODES[nb], c = MAP_EDGES[edgeKey(na, nb)] || [(a.x + b.x) / 2, (a.y + b.y) / 2], u = 1 - k;
    return [u * u * a.x + 2 * u * k * c[0] + k * k * b.x, u * u * a.y + 2 * u * k * c[1] + k * k * b.y];
  }
  function buildMapCanvas() {
    if (G_MAP.canvas) return G_MAP.canvas;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), R = window.Scenery.rng(5), SC = window.Scenery;
    // pergamin
    g.fillStyle = '#d8c49a'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 2600; i++) { g.fillStyle = R() < 0.5 ? 'rgba(120,90,50,0.08)' : 'rgba(255,240,200,0.10)'; g.fillRect(R() * W, R() * H, 1 + R() * 3, 1 + R() * 2); }
    // morze (wschód i południe)
    g.fillStyle = '#6a9ab0';
    g.beginPath(); g.moveTo(W, 0); g.lineTo(300, 0);
    for (let y = 0; y <= H; y += 8) g.lineTo(300 + Math.sin(y * 0.05) * 14 + (y > 110 ? (y - 110) * 0.15 : 0) - (y > 170 ? (y - 170) * 1.6 : 0), y);
    g.lineTo(W, H); g.fill();
    g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= 230; x += 8) g.lineTo(x, 212 + Math.sin(x * 0.07) * 4); g.lineTo(230, H); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1;
    for (let i = 0; i < 26; i++) { const x = 300 + R() * 84, y = R() * H; if (x < 312 + y * 0.1) continue; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 3, y - 2, x + 6, y); g.stroke(); }
    // wyspa twierdzy
    g.fillStyle = '#b8a07a'; g.beginPath(); g.ellipse(336, 70, 26, 18, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#5a4a3a'; g.lineWidth = 1; g.stroke();
    // regiony
    const region = (x, y, rx, ry, col, n) => { for (let i = 0; i < n; i++) { g.fillStyle = col; g.beginPath(); g.ellipse(x + (R() - 0.5) * rx, y + (R() - 0.5) * ry, 6 + R() * 10, 4 + R() * 7, 0, 0, Math.PI * 2); g.fill(); } };
    region(66, 140, 80, 50, 'rgba(60,120,50,0.55)', 40);
    region(112, 190, 60, 26, 'rgba(110,110,60,0.55)', 26);
    region(172, 136, 50, 34, 'rgba(110,110,120,0.45)', 20);
    region(196, 72, 90, 40, 'rgba(130,60,40,0.45)', 30);
    region(280, 150, 40, 40, 'rgba(150,130,100,0.45)', 14);
    region(250, 202, 46, 16, 'rgba(220,200,140,0.6)', 14);
    region(252, 106, 36, 26, 'rgba(70,90,70,0.45)', 12);
    // góry
    for (let i = 0; i < 14; i++) {
      const x = 130 + R() * 140, y = 40 + R() * 50;
      g.fillStyle = '#8a6a50'; g.beginPath(); g.moveTo(x - 7, y + 6); g.lineTo(x, y - 6); g.lineTo(x + 7, y + 6); g.fill();
      g.fillStyle = '#6a4a38'; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + 7, y + 6); g.lineTo(x + 2, y + 6); g.fill();
    }
    // rzeka
    g.strokeStyle = '#6a9ab0'; g.lineWidth = 2; g.beginPath(); g.moveTo(150, 30); g.bezierCurveTo(140, 90, 210, 120, 230, 200); g.lineTo(235, H); g.stroke();
    // siatka i ramka
    g.strokeStyle = 'rgba(90,60,30,0.15)'; g.lineWidth = 1;
    for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0; y < H; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    // róża wiatrów
    g.save(); g.translate(356, 196);
    g.fillStyle = '#5a3a20'; g.beginPath(); g.moveTo(0, -14); g.lineTo(3, 0); g.lineTo(0, 14); g.lineTo(-3, 0); g.fill();
    g.beginPath(); g.moveTo(-14, 0); g.lineTo(0, 3); g.lineTo(14, 0); g.lineTo(0, -3); g.fill();
    g.fillStyle = '#c03a2a'; g.beginPath(); g.moveTo(0, -14); g.lineTo(3, 0); g.lineTo(-3, 0); g.fill();
    g.restore();
    // ikony lokacji
    const icon = (n) => {
      const { x, y } = n;
      g.save(); g.translate(x, y - 12);
      switch (n.icon) {
        case 'palm': SC.palm(g, R, 0, 8, 16, 0.4, false); break;
        case 'swamp': SC.deadTree(g, R, 0, 8, 22); break;
        case 'city': [[-8, 14], [-1, 20], [6, 12]].forEach(([dx, h]) => { SC.rect(g, dx, 8 - h, 6, h, '#5a5a6a'); g.fillStyle = '#f0d070'; g.fillRect(dx + 2, 10 - h, 2, 2); }); break;
        case 'volcano': g.fillStyle = '#5a2a2a'; g.beginPath(); g.moveTo(-12, 8); g.lineTo(-3, -8); g.lineTo(3, -8); g.lineTo(12, 8); g.fill(); g.fillStyle = '#ff7a2a'; g.fillRect(-3, -9, 6, 2); g.fillStyle = 'rgba(80,70,80,0.6)'; g.beginPath(); g.arc(2, -14, 5, 0, Math.PI * 2); g.fill(); break;
        case 'port': SC.rect(g, -9, 2, 18, 5, '#7a4a2a'); SC.rect(g, -1, -10, 2, 12, '#5a3a2a'); g.fillStyle = '#f0ece0'; g.beginPath(); g.moveTo(1, -10); g.lineTo(9, 0); g.lineTo(1, 0); g.fill(); break;
        case 'beach': g.fillStyle = '#e0c890'; g.beginPath(); g.ellipse(0, 6, 12, 4, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#140c10'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-6, 6); g.quadraticCurveTo(-2, -4, 4, -8); g.stroke();
          g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-3 + i * 3, -1 - i * 2); g.quadraticCurveTo(i * 3, 3, -1 + i * 3, 6); g.stroke(); } break;
        case 'sewer': SC.rect(g, -9, -6, 18, 14, '#4a4440'); g.fillStyle = '#140c10'; g.beginPath(); g.arc(0, 4, 6, Math.PI, 0); g.fillRect(-6, 4, 12, 4); g.fill();
          g.fillStyle = '#5ac82a'; g.fillRect(-5, 6, 10, 2); break;
        case 'fort': SC.rect(g, -10, -4, 20, 12, '#6a6070'); for (let i = 0; i < 3; i++) SC.rect(g, -10 + i * 8, -8, 4, 4, '#6a6070'); SC.rect(g, -2, 0, 4, 8, '#2a2030'); g.fillStyle = '#d0a040'; g.fillRect(-1, -14, 1, 6); g.fillRect(0, -14, 5, 3); break;
      }
      g.restore();
    };
    MAP_NODES.forEach(n => { if (n.icon) icon(n); });
    // winieta
    const vg = g.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 250);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(70,40,10,0.55)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#5a3a20'; g.lineWidth = 3; g.strokeRect(3, 3, W - 6, H - 6);
    g.strokeStyle = '#8a6a40'; g.lineWidth = 1; g.strokeRect(7, 7, W - 14, H - 14);
    G_MAP.canvas = c;
    return c;
  }
  function drawCurve(na, nb, kk) {
    ctx.beginPath();
    const steps = 30;
    for (let s = 0; s <= steps * kk; s++) { const p = mapSeg(na, nb, s / steps); s ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    const p = mapSeg(na, nb, kk); ctx.lineTo(p[0], p[1]);
    ctx.stroke();
  }
  function drawRoute(fromNode, toNode, k) {
    // wszystkie drogi kreskowane, przebyte — czerwone, bieżąca — animowana
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(90,60,30,0.6)'; ctx.setLineDash([3, 3]);
    Object.keys(MAP_EDGES).forEach(key => { const [a, b] = key.split('-').map(Number); drawCurve(a, b, 1); });
    ctx.setLineDash([]);
    ctx.lineWidth = 2; ctx.strokeStyle = '#b02a1a';
    const path = [0].concat((app.route || []).map(i => i + 1));
    for (let i = 0; i < path.length - 1; i++) drawCurve(path[i], path[i + 1], 1);
    if (app.mapChoice) {
      app.mapChoice.opts.forEach((o, i) => {
        ctx.strokeStyle = i === app.mapChoice.sel ? `rgba(255,208,64,${0.6 + Math.sin(app.t * 0.2) * 0.3})` : 'rgba(176,42,26,0.35)';
        ctx.lineWidth = i === app.mapChoice.sel ? 3 : 2; drawCurve(fromNode, o + 1, 1);
      });
    } else if (fromNode !== toNode) { ctx.strokeStyle = '#b02a1a'; ctx.lineWidth = 2; drawCurve(fromNode, toNode, k); }
  }
  function drawMapCar(x, y, face, t) {
    ctx.save(); ctx.translate(Math.round(x), Math.round(y - 4 - Math.abs(Math.sin(t * 0.4)) * 1.5)); ctx.scale(face, 1);
    ctx.fillStyle = '#140c10'; ctx.fillRect(-9, -5, 18, 6); ctx.fillRect(-4, -8, 8, 4);
    ctx.fillStyle = '#c03a2a'; ctx.fillRect(-8, -4, 16, 4); ctx.fillStyle = '#9fd0e0'; ctx.fillRect(-3, -7, 5, 3);
    ctx.fillStyle = '#e8e8e0'; ctx.fillRect(7, -3, 2, 1);
    ctx.fillStyle = '#140c10'; ctx.fillRect(-7, 0, 4, 3); ctx.fillRect(3, 0, 4, 3);
    ctx.restore();
  }
  function drawMap() {
    const t = app.t, from = app.mapFrom, to = app.mapTo + 1;
    ctx.drawImage(buildMapCanvas(), 0, 0);
    const k = app.mapChoice ? 0 : clamp((t - 40) / (MAP_ARRIVE - 40), 0, 1);
    const ease = k * k * (3 - 2 * k);
    drawRoute(from, to, ease);
    const route = app.route || [];
    // węzły
    MAP_NODES.forEach((n, i) => {
      if (i === 0) { ctx.fillStyle = '#5a3a20'; ctx.fillRect(n.x - 3, n.y - 3, 6, 6); return; }
      const st = i - 1, cleared = route.includes(st);
      const choice = app.mapChoice && app.mapChoice.opts.includes(st);
      const target = choice ? st === app.mapChoice.opts[app.mapChoice.sel] : st === app.mapTo;
      const skipped = !cleared && ((st === 2 && route.includes(3)) || (st === 3 && route.includes(2)) || (route.length && st < route[route.length - 1] && !choice && st !== app.mapTo));
      const pulse = target ? 2 + Math.sin(t * 0.2) * 1.5 + (G_MAP.flash > 0 ? 3 : 0) : choice ? 1 : 0;
      ctx.fillStyle = '#140c10'; ctx.beginPath(); ctx.arc(n.x, n.y, 5 + pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cleared ? '#8a7a60' : skipped ? '#6a6058' : target ? '#ffd040' : '#e8dcc0'; ctx.beginPath(); ctx.arc(n.x, n.y, 4 + pulse, 0, Math.PI * 2); ctx.fill();
      if (cleared) {
        ctx.strokeStyle = '#c0201a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(n.x - 6, n.y - 6); ctx.lineTo(n.x + 6, n.y + 6); ctx.moveTo(n.x + 6, n.y - 6); ctx.lineTo(n.x - 6, n.y + 6); ctx.stroke();
      }
    });
    if (G_MAP.flash > 0) G_MAP.flash--;
    // samochód
    const p = mapSeg(from, to, ease), q = mapSeg(from, to, Math.min(1, ease + 0.02));
    drawMapCar(p[0], p[1], q[0] >= p[0] ? 1 : -1, t);
    // ramka portretu
    app.mapTeam.forEach((m, i) => {
      const ox = 12 + i * 34;
      ctx.fillStyle = app.mapTeam.length > 1 ? P_COLS[i] : '#140c10'; ctx.fillRect(ox, 12, 30, 30);
      ctx.fillStyle = '#2a3a5a'; ctx.fillRect(ox + 1, 13, 28, 28);
      ctx.save(); ctx.beginPath(); ctx.rect(ox + 1, 13, 28, 28); ctx.clip();
      SP.drawPortrait(ctx, m.b, ox + 15, 29, 10, false);
      ctx.restore();
    });
    // pasek z nazwą / wyborem trasy
    if (app.mapChoice) { ctx.fillStyle = 'rgba(20,12,16,0.82)'; ctx.fillRect(0, 162, W, 56); ctx.fillStyle = '#d0a040'; ctx.fillRect(0, 162, W, 1); }
    else if (t > MAP_ARRIVE - 10) {
      const a = clamp((t - MAP_ARRIVE + 10) / 20, 0, 1);
      ctx.fillStyle = `rgba(20,12,16,${0.8 * a})`; ctx.fillRect(0, 168, W, 40);
      ctx.fillStyle = `rgba(208,160,64,${a})`; ctx.fillRect(0, 168, W, 1); ctx.fillRect(0, 207, W, 1);
    }
  }
  function drawMapText() {
    const t = app.t, st = STAGES[app.mapTo];
    text('MAPA REGIONU', W / 2, 12, 8, '#5a3a20', 'center', true);
    if (app.mapChoice) {
      const c = app.mapChoice;
      text('WYBIERZ TRASĘ', W / 2, 168, 8, '#ffe080', 'center');
      c.opts.forEach((o, i) => {
        const sel = i === c.sel, x = i ? W * 0.74 : W * 0.26;
        text((sel ? '► ' : '') + shortName(STAGES[o]), x, 184, 6, sel ? '#fff' : '#a09080', 'center');
        text(STAGES[o].label === '3A' ? 'BOSS: BRACIA TRZASK' : 'BOSS: STARY KIEŁ', x, 196, 4, sel ? '#ff9a80' : '#8a7060', 'center');
      });
      if (t % 50 < 35) text('◄ ► WYBÓR   {ok|ENTER} — JEDZIEMY', W / 2, 210, 4, '#ffe080', 'center');
    }
    const tx = 14 + app.mapTeam.length * 34;
    text(app.mapTeam.map(m => m.name).join(' + '), tx, 16, 5, '#5a3a20', 'left', true);
    text('ETAP ' + st.label + ' / ' + RUN_LEN, tx, 26, 5, '#7a5a30', 'left', true);
    if (app.mapChoice) return;
    const n = MAP_NODES[app.mapTo + 1];
    if (t > 40) text(st.label, n.x, n.y - 3, 4, '#140c10', 'center', true);
    if (t > MAP_ARRIVE - 10) {
      const name = shortName(st);
      text(name, W / 2, 174, 10, '#ffe080', 'center');
      if (t > MAP_ARRIVE + 15) text(st.sub, W / 2, 192, 5, '#fff', 'center');
    }
    if (!app.mapChoice && t > 20 && t % 50 < 35) text('{ok|ENTER} — DALEJ', W - 12, 212, 4, '#5a3a20', 'right', true);
  }

  // ---- wybór etapu (tylko w trybie debug): podgląd tła wybranego etapu + lista (+ etap bonusowy)
  const SEL_COUNT = STAGES.length + 3;
  const SEL_EXTRA = ['BONUS — AUTOSTRADA 7', 'BONUS — ZAGRODA', 'BONUS — LOT NAD ZATOKĄ'];
  const SEL_DY = Math.min(21, 164 / SEL_COUNT);
  function drawStageSel() {
    const st = app.stageSel === STAGES.length + 1 ? window.SPECIAL_STAGES.cages : STAGES[Math.min(app.stageSel, STAGES.length - 1)], L = st.buildLayers();
    const camX = (app.t * 0.8) % (st.LEN - W);
    st.drawBack(ctx, L, camX, app.t);
    st.drawFront(ctx, L, camX, app.t);
    ctx.fillStyle = 'rgba(8,4,14,0.62)'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < SEL_COUNT; i++) {
      const y = 34 + i * SEL_DY, sel = i === app.stageSel;
      ctx.fillStyle = sel ? '#ffb030' : 'rgba(60,40,80,0.8)'; ctx.fillRect(40, y - 2, W - 80, SEL_DY - 2);
      ctx.fillStyle = sel ? '#3a2a5a' : 'rgba(30,20,40,0.85)'; ctx.fillRect(41, y - 1, W - 82, SEL_DY - 4);
    }
  }
  function drawStageSelText() {
    text('WYBÓR ETAPU', W / 2, 12, 10, '#ffe080', 'center');
    text('DEBUG', W - 8, 4, 5, '#ff8060', 'right');
    for (let i = 0; i < SEL_COUNT; i++) {
      const y = 34 + i * SEL_DY - 1, sel = i === app.stageSel;
      const name = i < STAGES.length ? STAGES[i].name : SEL_EXTRA[i - STAGES.length];
      text(name, 52, y + 3, 6, sel ? '#fff' : (i < STAGES.length ? '#a090b0' : '#c0a060'));
      if (sel) text('►', 44, y + 3, 6, '#ffe040');
    }
    if (app.t % 50 < 35) text('▲ ▼ WYBÓR   {ok|ENTER} START   {back|ESC} — WSTECZ', W / 2, 202, 5, '#fff', 'center');
  }

  // ---- etap bonusowy
  function startBonus(team, nextIdx) {
    if (team && !Array.isArray(team)) team = [team];
    if (team) saveProgress({ type: 'bonus', next: nextIdx }, team);
    app.mode = 'bonus'; app.t = 0; app.bonusNext = nextIdx; app.bonusKind = 'drive';
    app.bonusTeam = team || makeTeam();
    app.bonusPlayer = app.bonusTeam[0];
    bonus.start(app.bonusTeam);
  }
  function startFlight(team, nextIdx) {
    if (team && !Array.isArray(team)) team = [team];
    if (team) saveProgress({ type: 'flight', next: nextIdx }, team);
    app.mode = 'bonus'; app.t = 0; app.bonusNext = nextIdx; app.bonusKind = 'flight';
    app.bonusTeam = team || makeTeam();
    app.bonusPlayer = app.bonusTeam[0];
    flight.start(app.bonusTeam);
  }

  // ---- tabela wyników i wpisywanie inicjałów
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZĄĆĘŁŃÓŚŹŻ0123456789.-! '.split('');
  function qualifies(score) { return score > 0 && (app.scores.length < 10 || score > app.scores[app.scores.length - 1].s); }
  // ---- tabele: zwykła gra, Boss Rush (pokonani bossowie, potem czas), przetrwanie (fale, potem wynik)
  const TABLES = {
    main: { key: 'paleo_scores', title: 'NAJLEPSZE WYNIKI', cmp: (a, b) => b.s - a.s },
    rush: { key: 'paleo_rush', title: 'BOSS RUSH', cmp: (a, b) => (b.b - a.b) || (a.f - b.f) },
    surv: { key: 'paleo_surv', title: 'PRZETRWANIE', cmp: (a, b) => (b.w - a.w) || (b.s - a.s) },
    daily: { get key() { return 'paleo_daily_' + dailyId(); }, get title() { return 'CODZIENNE ' + dailyLabel(); }, cmp: (a, b) => b.s - a.s }
  };
  const TABLE_KEYS = ['main', 'rush', 'surv', 'daily'];
  const fmtTime = f => { const sec = Math.floor(f / 60); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0') + '.' + String(Math.floor((f % 60) / 0.6)).padStart(2, '0'); };
  function loadTable(k) {
    if (k === 'main') return app.scores;
    const v = loadJSON(TABLES[k].key);
    if (Array.isArray(v) && v.length) return v.slice(0, 10);
    if (k === 'daily') return [];
    const def = k === 'rush'
      ? [['BAR', 6, 21600], ['RDZ', 6, 25200], ['ANA', 6, 28800], ['KŁY', 5, 21600], ['TUR', 5, 27000], ['NIN', 4, 18000], ['REX', 3, 14400], ['ŻMI', 2, 9000], ['HWY', 1, 5400], ['PAL', 1, 7200]]
        .map(([n, b, f], i) => ({ n, b, f, c: CHAR_KEYS[i % 4] }))
      : [['ANA', 25, 90000], ['TUR', 20, 70000], ['KRK', 16, 52000], ['BOR', 12, 40000], ['NIN', 10, 30000], ['DIN', 8, 22000], ['REX', 6, 15000], ['ŻMI', 5, 11000], ['HWY', 3, 6000], ['PAL', 2, 3000]]
        .map(([n, w, sc], i) => ({ n, w, s: sc, c: CHAR_KEYS[i % 4] }));
    return def;
  }
  app.tables = { main: app.scores, rush: loadTable('rush'), surv: loadTable('surv'), daily: loadTable('daily') };
  function qualifiesIn(table, rec) {
    const T = app.tables[table], cmp = TABLES[table].cmp;
    return (table !== 'main' || rec.s > 0) && (T.length < 10 || cmp(rec, T[T.length - 1]) < 0);
  }
  function qualifies(score) { return qualifiesIn('main', { s: score }); }
  // zakończ rozgrywkę: kolejka wpisów inicjałów dla graczy, którzy weszli do tabeli
  function endRun(table, recs) {
    AU.stopMusic();
    app.entryQueue = recs.slice().sort(TABLES[table].cmp).map(r => Object.assign({ table }, r));
    app.lastTable = table;
    nextEntry(-1);
  }
  // ---- ZAPIS POSTĘPU (tylko zwykła gra): zapisywany przed każdym kolejnym krokiem trasy
  const SAVE_KEY = 'paleo_save';
  app.save = loadJSON(SAVE_KEY);
  function saveProgress(point, team) {
    if (!team || app.gameMode !== 'arcade') return;
    const data = {
      v: 1, point, route: (app.route || []).slice(), run: app.run || null, p2: !!app.p2Active, ngp: !!app.ngpRun, ts: Date.now(),
      players: team.map(q => ({ key: q.key, pIdx: q.pIdx, alt: q.b !== CHARS[q.key].build, score: q.score, lives: Math.max(0, q.lives), nextLife: q.nextLife || 30000, amber: q.amber || 0, up: q.up }))
    };
    safeSet(SAVE_KEY, JSON.stringify(data)); app.save = data;
  }
  function clearProgress() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* brak */ } app.save = null; }
  function saveLabel(d) {
    const pt = d.point, dt = new Date(d.ts);
    const where = (d.ngp ? 'NG+ ' : '') + (pt.type === 'escape' ? 'EPILOG' : pt.type === 'truefinal' ? 'FINAŁ' : pt.type === 'branch' ? 'WYBÓR TRASY' : pt.type === 'bonus' ? 'BONUS AUTOSTRADA' : pt.type === 'flight' ? 'BONUS LOT' : pt.type === 'cages' ? 'BONUS ZAGRODA' : pt.type === 'train' ? 'POCIĄG' : 'ETAP ' + STAGES[pt.idx].label);
    const date = String(dt.getDate()).padStart(2, '0') + '.' + String(dt.getMonth() + 1).padStart(2, '0') + ' ' + String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
    return where + ' — ' + d.players.map(r => CHARS[r.key].name).join('+') + ' — ' + d.players.reduce((a, r) => a + r.score, 0) + ' PKT — ' + date;
  }
  function resumeProgress() {
    const d = app.save; if (!d) return;
    app.gameMode = 'arcade'; app.ngpRun = !!d.ngp; app.route = d.route.slice(); app.run = d.run || { cages: false, secrets: 0 }; app.p2Active = !!d.p2; G = null;
    const team = d.players.map(r => { const p = makePlayer(r.key, r.pIdx, r.alt); p.score = r.score; p.lives = r.lives; p.nextLife = r.nextLife; p.amber = r.amber || 0; if (r.up) Object.assign(p.up, r.up); return p; });
    app.sel = Math.max(0, selKeys().indexOf(team[0].key)); if (team[1]) app.sel2 = Math.max(0, selKeys().indexOf(team[1].key));
    const pt = d.point;
    if (pt.type === 'branch') goMap('branch', team);
    else if (pt.type === 'bonus') startBonus(team, pt.next);
    else if (pt.type === 'flight') startFlight(team, pt.next);
    else if (pt.type === 'cages') startCages(team, pt.next);
    else if (pt.type === 'train') startTrain(team, pt.next);
    else if (pt.type === 'escape') startEscape(team);
    else if (pt.type === 'truefinal') startTrueFinal(team);
    else goMap(pt.idx, team);
  }
  function endGame(stageLabel) {
    if (app.gameMode === 'arcade' || !app.gameMode) clearProgress();
    const team = (G && G.players) || app.bonusTeam || [];
    endRun('main', team.map(q => ({ s: q.score, st: stageLabel, c: q.key, pIdx: q.pIdx })));
  }
  function nextEntry(lastHi) {
    while (app.entryQueue && app.entryQueue.length) {
      const q = app.entryQueue.shift();
      const rec = Object.assign({}, q); delete rec.table; delete rec.pIdx;
      if (!qualifiesIn(q.table, rec)) continue;
      app.mode = 'entry'; app.t = 0;
      app.entry = { letters: [0, 0, 0], pos: 0, table: q.table, rec, c: q.c, pIdx: q.pIdx || 0, score: q.s || 0, time: 30 * 60 };
      AU.stopMusic(); AU.play('map'); sfx('oneup');
      return;
    }
    showScores(lastHi, false, app.lastTable || 'main');
  }
  function commitEntry() {
    const e = app.entry, k = e.table;
    const rec = Object.assign({ n: e.letters.map(i => LETTERS[i]).join('') }, e.rec);
    const T = app.tables[k];
    T.push(rec); T.sort(TABLES[k].cmp);
    app.tables[k] = T.slice(0, 10);
    if (k === 'main') { app.scores = app.tables.main; app.hiscore = app.scores[0].s; }
    safeSet(TABLES[k].key, JSON.stringify(app.tables[k]));
    sfx('start');
    nextEntry(app.tables[k].indexOf(rec));
  }
  function entryLabel(e) {
    if (e.table === 'rush') return 'BOSSOWIE ' + e.rec.b + '/6   CZAS ' + fmtTime(e.rec.f);
    if (e.table === 'surv') return 'FALA ' + e.rec.w + '   WYNIK ' + e.rec.s;
    return 'WYNIK ' + e.rec.s;
  }
  function showScores(hi, attract, table) {
    app.mode = 'scores'; app.t = 0; app.scoresHi = hi; app.attract = attract; app.scoreTable = table || 'main';
    if (!attract) { AU.stopMusic(); AU.play('title'); }
  }
  function drawScoresBg() {
    const s1 = STAGES[0], L = s1.buildLayers();
    const camX = ((app.frame || 0) * 0.5 + 900) % (s1.LEN - W);
    s1.drawBack(ctx, L, camX, app.frame || 0);
    ctx.fillStyle = 'rgba(8,4,14,0.78)'; ctx.fillRect(0, 0, W, H);
  }
  function drawScores() {
    drawScoresBg();
    app.tables[app.scoreTable].forEach((r, i) => {
      const y = 40 + i * 16;
      if (i === app.scoresHi && app.t % 20 < 12) { ctx.fillStyle = 'rgba(255,200,60,0.25)'; ctx.fillRect(28, y - 3, W - 56, 15); }
      const ch = CHARS[r.c] || CHARS.kruk;
      ctx.save(); ctx.beginPath(); ctx.rect(304, y - 3, 14, 14); ctx.clip();
      ctx.fillStyle = '#2a3a5a'; ctx.fillRect(304, y - 3, 14, 14);
      SP.drawPortrait(ctx, ch.build, 311, y + 5, 4.5, false);
      ctx.restore();
    });
  }
  function drawScoresText() {
    const k = app.scoreTable, T = app.tables[k];
    text('◄ ' + TABLES[k].title + ' ►', W / 2, 12, 9, '#ffe080', 'center');
    const heads = k === 'rush' ? [['BOSSOWIE', 200, 'center'], ['CZAS', 268, 'right']] : k === 'surv' ? [['FALA', 190, 'center'], ['WYNIK', 268, 'right']] : [['WYNIK', 230, 'right'], ['ETAP', 268, 'center']];
    [['MIEJSCE', 50, 'center'], ['INICJAŁY', 107, 'center'], ['POSTAĆ', 311, 'center']].concat(heads).forEach(([l, x, al]) => text(l, x, 28, 4, '#8a80a0', al));
    const cols = ['#ffe040', '#e0e0f0', '#e0a060'];
    T.forEach((r, i) => {
      const y = 40 + i * 16, col = i === app.scoresHi ? '#7cff7c' : (cols[i] || '#c0b8d0');
      text(String(i + 1).padStart(2, ' ') + '.', 40, y, 7, col);
      text(r.n, 96, y, 7, col);
      if (k === 'rush') { text(r.b + '/' + RUSH_ORDER.length, 200, y, 7, col, 'center'); text(fmtTime(r.f), 268, y, 6, col, 'right'); }
      else if (k === 'surv') { text(String(r.w), 190, y, 7, col, 'center'); text(String(r.s).padStart(6, '0'), 268, y, 6, col, 'right'); }
      else { text(String(r.s).padStart(7, '0'), 230, y, 7, col, 'right'); text(String(r.st), 268, y, 7, col, 'center'); }
    });
    if (app.t % 50 < 35) text(app.attract ? 'NACIŚNIJ ENTER' : '◄ ► TABELA   {back|ESC} — MENU', W / 2, 206, 5, '#fff', 'center');
  }
  function drawEntry() {
    drawScoresBg();
    const e = app.entry;
    for (let i = 0; i < 3; i++) {
      const x = 132 + i * 44, cur = i === e.pos;
      ctx.fillStyle = cur ? '#ffb030' : '#3a2a4a'; ctx.fillRect(x - 1, 89, 34, 40);
      ctx.fillStyle = cur ? '#3a2a5a' : '#1e1628'; ctx.fillRect(x, 90, 32, 38);
    }
    ctx.save(); ctx.beginPath(); ctx.rect(36, 88, 44, 44); ctx.clip();
    ctx.fillStyle = '#2a3a5a'; ctx.fillRect(36, 88, 44, 44);
    SP.drawPortrait(ctx, (CHARS[e.c] || CHARS.kruk).build, 58, 112, 15, false);
    ctx.restore();
  }
  function drawEntryText() {
    const e = app.entry;
    text('NOWY REKORD!', W / 2, 18, 14, app.t % 20 < 10 ? '#ffe040' : '#ff9040', 'center');
    if ((G && G.players.length > 1) || (app.bonusTeam && app.bonusTeam.length > 1)) text('GRACZ ' + (e.pIdx + 1), 58, 136, 5, P_COLS[e.pIdx], 'center');
    text(entryLabel(e), W / 2, 44, 7, '#80d0ff', 'center');
    text('WPISZ INICJAŁY', W / 2, 64, 6, '#fff', 'center');
    for (let i = 0; i < 3; i++) {
      const x = 132 + i * 44 + 16;
      const ch = i < e.pos || i === e.pos ? LETTERS[e.letters[i]] : '·';
      text(ch, x, 100, 18, i === e.pos && app.t % 30 < 20 ? '#ffe040' : '#fff', 'center');
      if (i === e.pos) { text('▲', x, 80, 5, '#ffe040', 'center'); text('▼', x, 132, 5, '#ffe040', 'center'); }
    }
    text('▲▼ LITERA   ◄► POZYCJA   {ok|ATAK/ENTER} — ZATWIERDŹ   {back|ESC} — COFNIJ', W / 2, 160, 4, '#c0c0c0', 'center');
    text('CZAS ' + Math.ceil(e.time / 60), W / 2, 176, 6, e.time < 600 ? '#ff6060' : '#fff', 'center');
  }

  function drawEnding() {
    const t = app.t;
    if (app.trueEnd) { drawEndingTrue(t); return; }
    if (app.ngpRun) { drawEndingNgp(t); return; }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#3a5a9a'); g.addColorStop(0.5, '#f0a060'); g.addColorStop(0.75, '#ffe0a0'); g.addColorStop(1, '#5a8a3a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff4c0'; ctx.beginPath(); ctx.arc(W / 2, 150 - Math.min(40, t * 0.1), 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a6a3a'; ctx.fillRect(0, 160, W, H - 160);
    ctx.fillStyle = '#2e5a30'; for (let i = 0; i < 30; i++) ctx.fillRect((i * 47 + t * 0.2) % W, 162 + (i * 13) % 50, 6, 2);
    // dinozaury na wolności
    SP.drawRaptor(ctx, (t * 1.1) % (W + 120) - 60, 186, 1, t, 'run', RAPTOR_COLS[1], {});
    SP.drawPachy(ctx, W + 60 - (t * 0.6) % (W + 120), 200, -1, t, 'walk', PACHY_COLS[0], {});
    SP.drawRaptor(ctx, (t * 0.9 + 200) % (W + 120) - 60, 210, 1, t + 20, 'run', RAPTOR_COLS[0], {});
    CHAR_KEYS.forEach((k, i) => {
      const pose = (t + i * 20) % 90 < 30 ? P.victory[0] : P.idle[Math.floor(t / 28) % 2];
      SP.drawFigure(ctx, CHARS[k].build, pose, 136 + i * 38, 196 + (i % 2) * 6, i >= 2 ? -1 : 1, { weapon: CHARS[k].innate });
    });
  }
  function drawEndingNgp(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#060818'); g.addColorStop(0.6, '#1a1a3a'); g.addColorStop(1, '#14261a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 50; i++) { if ((t + i * 7) % 120 < 100) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect((i * 61) % W, (i * 23) % 120, 1, 1); } }
    ctx.fillStyle = '#e8e6d0'; ctx.beginPath(); ctx.arc(310, 40, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#14261a'; ctx.fillRect(0, 160, W, H - 160);
    // ognisko
    const fx = W / 2, fy = 196;
    ctx.fillStyle = 'rgba(255,150,50,0.15)'; ctx.beginPath(); ctx.arc(fx, fy - 8, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(fx - 12, fy - 2, 24, 4);
    for (let i = 0; i < 6; i++) { const k = (t * 0.06 + i / 6) % 1; ctx.fillStyle = k < 0.4 ? '#ffe36a' : k < 0.7 ? '#ff9a2a' : 'rgba(200,60,20,0.6)'; ctx.beginPath(); ctx.arc(fx + Math.sin(i * 3 + t * 0.2) * 4, fy - 4 - k * 18, 5 * (1 - k) + 1, 0, Math.PI * 2); ctx.fill(); }
    // śpiące dinozaury i bohaterowie przy ognisku
    SP.drawPachy(ctx, 60, 206, 1, 0, 'idle', PACHY_COLS[1], {});
    SP.drawTrike(ctx, 330, 210, -1, 0, 'idle', TRIKE_COLS[0], {});
    selKeys().forEach((k, i) => {
      const x = fx + (i - (selKeys().length - 1) / 2) * 34 + (i >= selKeys().length / 2 ? 30 : -30);
      SP.drawFigure(ctx, CHARS[k].build, P.idle[Math.floor((t + i * 9) / 28) % 2], x, 204 + (i % 2) * 4, x < fx ? 1 : -1, { weapon: CHARS[k].innate });
    });
  }
  function drawEndingTrue(t) {
    // świt nad zatoką: uwolnione dinozaury i bohaterowie na plaży
    const g = ctx.createLinearGradient(0, 0, 0, 150);
    g.addColorStop(0, '#4a5aa0'); g.addColorStop(0.6, '#f0a080'); g.addColorStop(1, '#ffe0a0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 150);
    ctx.fillStyle = '#fff0b0'; ctx.beginPath(); ctx.arc(W / 2, 130, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a7a9a'; ctx.fillRect(0, 130, W, 24);
    ctx.fillStyle = 'rgba(255,240,180,0.6)'; for (let i = 0; i < 8; i++) ctx.fillRect(W / 2 - 30 + Math.sin(t * 0.05 + i) * 6, 134 + i * 2.5, 60 - i * 6, 1);
    ctx.fillStyle = '#e0c890'; ctx.fillRect(0, 154, W, H - 154);
    for (let i = 0; i < 3; i++) { const x = ((t * (0.6 + i * 0.2) + i * 140) % (W + 120)) - 60; SP.drawPtera(ctx, x, 40 + i * 18 + Math.sin(t * 0.05 + i) * 6, 1, t + i * 7, 'fly', {}); }
    SP.drawRaptor(ctx, ((t * 0.9) % (W + 160)) - 80, 196, 1, t, 'run', RAPTOR_COLS[0], {});
    SP.drawRaptor(ctx, ((t * 0.9 + 60) % (W + 160)) - 80, 206, 1, t + 5, 'run', RAPTOR_COLS[1] || RAPTOR_COLS[0], { scale: 0.7 });
    SP.drawTrike(ctx, 320, 196, -1, t, 'idle', TRIKE_COLS[0], {});
    const team = (G && G.players) || [];
    team.forEach((q, i) => SP.drawFigure(ctx, q.b, (t + i * 20) % 90 < 30 ? P.victory[0] : P.idle[Math.floor(t / 28) % 2], 150 + i * 40, 204, 1, {}));
  }
  function drawEndingText() {
    const t = app.t;
    if (app.trueEnd) {
      text('PRAWDZIWE ZAKOŃCZENIE', W / 2, 10, 11, '#ffe080', 'center');
      if (t > 60) text('BURSZTYNOWY KOLOS ROZPADŁ SIĘ W PIASEK.', W / 2, 30, 5, '#fff', 'center');
      if (t > 120) text('UWOLNIONE DINOZAURY ZOSTAŁY NAD ZATOKĄ — NIKT JUŻ ICH NIE ZŁAPIE.', W / 2, 42, 5, '#fff', 'center');
      if (t > 180) text('A STARA AUTOSTRADA PROWADZI TERAZ TYLKO DO DOMU.', W / 2, 54, 5, '#fff', 'center');
      if (t > 240) text('WYNIK: ' + G.players.map(q => q.score).join(' / '), W / 2, 70, 8, '#2a3a6a', 'center', true);
      if (t > 300 && t % 50 < 35) text('DZIĘKUJEMY ZA GRĘ!   {ok|ENTER} — MENU', W / 2, 86, 5, '#2a1a10', 'center', true);
      if (t > 300) text('▲ — UDOSTĘPNIJ WYNIK', W / 2, 98, 4, '#2a1a10', 'center', true);
      return;
    }
    if (app.ngpRun) {
      text('ZAKOŃCZENIE NOWEJ GRY+', W / 2, 14, 11, '#ffe080', 'center');
      if (t > 60) text('BURSZTYNOWE SERCE TWIERDZY ZGASŁO NA ZAWSZE.', W / 2, 40, 5, '#fff', 'center');
      if (t > 120) text('DINOZAURY WRÓCIŁY DO DOLINY, A AUTOSTRADĘ POROSŁA DŻUNGLA.', W / 2, 52, 5, '#fff', 'center');
      if (t > 180) text('PRZY OGNISKU NIKT JUŻ NIE PYTA, KTO BYŁ PO KTÓREJ STRONIE.', W / 2, 64, 5, '#fff', 'center');
      if (t > 240) text('WYNIK: ' + G.players.map(q => q.score).join(' / '), W / 2, 82, 8, '#80d0ff', 'center');
      if (t > 300 && t % 50 < 35) text('DZIĘKUJEMY ZA GRĘ — NAPRAWDĘ!   {ok|ENTER} — MENU', W / 2, 104, 5, '#c0f0c0', 'center');
      if (t > 300) text('▲ — UDOSTĘPNIJ WYNIK', W / 2, 116, 4, '#c0e0ff', 'center');
      return;
    }
    if (t > 260 && app.newUnlocks) text('ODBLOKOWANO: NOWA GRA+ I BARON BURSZTYN!', W / 2, 120, 5, '#ffe040', 'center');
    if (t > 300) text('SEKRET: UWOLNIJ WSZYSTKIE DINOZAURY W ZAGRODZIE I ODKRYJ 3 SEKRETY W JEDNYM PRZEJŚCIU...', W / 2, 146, 3.5, '#3a2a1a', 'center', true);
    text('KONIEC', W / 2, 16, 16, '#ffe040', 'center');
    if (t > 60) text('KŁUSOWNICY ZOSTALI POKONANI.', W / 2, 46, 6, '#fff', 'center');
    if (t > 120) text('DINOZAURY ZNÓW SĄ WOLNE.', W / 2, 58, 6, '#fff', 'center');
    if (t > 180) text('WYNIK: ' + G.players.map(q => q.score).join(' / '), W / 2, 76, 8, '#80d0ff', 'center');
    if (t > 240) text('PALEO HIGHWAY — RDZA I KŁY', W / 2, 96, 5, '#2a1a10', 'center', true);
    if (t > 300 && t % 50 < 35) text('{ok|ENTER} — POWRÓT DO MENU', W / 2, 108, 5, '#2a1a10', 'center', true);
    if (t > 300) text('▲ — UDOSTĘPNIJ WYNIK', W / 2, 134, 4, '#5a3a20', 'center', true);
  }

  // =============================================================== JAK GRAĆ (poradnik w menu głównym)
  // Rozdziały ▲▼, strony ◄► / ENTER. Klawisze w tekście pochodzą z aktualnych przypisań gracza 1,
  // a gdy ostatnio używany był pad — w ich miejscu pojawiają się ikony przycisków.
  const keyOf = a => (keysFor(0, a).split(' / ')[0] || '?');
  const K = a => '{' + a + '|' + keyOf(a) + '}';
  const SPEC = () => K('attack') + '+' + K('jump');
  const HOWTO = [
    { title: 'PODSTAWY', pages: [
      { demo: 'move', head: 'CEL GRY', lines: () => [
        'KŁUSOWNICY ŁAPIĄ DINOZAURY WZDŁUŻ STAREJ AUTOSTRADY. TWOJE ZADANIE:',
        '• PRZEJDŹ ETAP OD LEWEJ DO PRAWEJ, POKONUJĄC KOLEJNE FALE WROGÓW,',
        '• NA KOŃCU ETAPU POKONAJ BOSSA,',
        '• PO DRODZE ROZBIJAJ BECZKI, ZBIERAJ JEDZENIE, BROŃ I SKARBY.',
        'GDY FALA ZOSTANIE POKONANA, POJAWIA SIĘ NAPIS „GO ►” — IDŹ DALEJ W PRAWO.',
        'ZA KAŻDE 50 000 PUNKTÓW (PIERWSZE PRZY 30 000) DOSTAJESZ DODATKOWE ŻYCIE.'] },
      { demo: 'run', head: 'RUCH, BIEG I SKOK', lines: () => [
        'RUCH: ' + K('left') + ' ' + K('right') + ' ' + K('up') + ' ' + K('down') + ' (TAKŻE STRZAŁKI, GAŁKA LUB KRZYŻAK PADA).',
        'PLANSZA MA GŁĘBIĘ: ▲ I ▼ PRZESUWAJĄ CIĘ W GŁĄB I DO PRZODU EKRANU.',
        'WROGA TRAFISZ TYLKO, GDY STOICIE MNIEJ WIĘCEJ NA TEJ SAMEJ WYSOKOŚCI.',
        'BIEG: DWA SZYBKIE STUKNIĘCIA W KIERUNEK (◄◄ ALBO ►►).',
        'SKOK: ' + K('jump') + '. W BIEGU SKACZESZ DALEJ.',
        'START / PAUZA: ' + K('start') + ' / ' + K('pause') + '. W PAUZIE MOŻESZ WYJŚĆ DO MENU.'] },
      { demo: 'hud', head: 'EKRAN GRY', lines: () => [
        'LEWY GÓRNY RÓG: PORTRET, IMIĘ, WYNIK I PASEK ŻYCIA.',
        '×2 — ZAPASOWE ŻYCIA. POMARAŃCZOWA KROPKA — BURSZTYN NA ULEPSZENIA.',
        'POD ŻYCIEM ROŚNIE PASEK FURII (O NIM W ROZDZIALE „SPECJAŁY I FURIA”).',
        'NA ŚRODKU: CZAS. GDY DOJDZIE DO ZERA, TRACISZ ŻYCIE — NIE GUZDRAJ SIĘ.',
        'POD TWOIM PASKIEM: ŻYCIE OSTATNIO TRAFIONEGO WROGA. KOLOROWE WARSTWY',
        'I LICZNIK ×N U BOSSÓW TO KOLEJNE „PASKI” ŻYCIA DO ZBICIA.',
        'PORTRET REAGUJE: BÓL PO TRAFIENIU, CZERWONE TŁO PRZY NISKIM ŻYCIU, OGIEŃ PRZY FURII.'] }
    ] },
    { title: 'WALKA', pages: [
      { demo: 'combo', head: 'KOMBO', lines: () => [
        'ATAK: ' + K('attack') + '. STUKAJ RYTMICZNIE — KOLEJNE CIOSY ŁĄCZĄ SIĘ W SERIĘ,',
        'A OSTATNI CIOS SERII PRZEWRACA WROGA.',
        'KAŻDA POSTAĆ MA WŁASNĄ SERIĘ: KRUK I NINA SĄ SZYBCY, TUR BIJE MOCNO,',
        'BORYS WALCZY LASKĄ Z DALEKA.',
        'TRAFIENIA BEZ PRZERWY BUDUJĄ KOMBO („12 HIT!”) — SERIA OD 5 TRAFIEŃ',
        'DAJE PREMIĘ PUNKTOWĄ, A DŁUGIE KOMBO PODKRĘCA MUZYKĘ.'] },
      { demo: 'jumpkick', head: 'ATAKI W RUCHU', lines: () => [
        'KOPNIĘCIE Z WYSKOKU: ' + K('jump') + ', A W POWIETRZU ' + K('attack') + '. PRZEWRACA I SIĘGA DALEKO.',
        'ATAK W BIEGU: BIEGNIJ (►►) I NACIŚNIJ ' + K('attack') + ' — SZARŻA, KTÓRA ROZTRĄCA WROGÓW.',
        'RUCH KOMENDOWY: ▼ ◢ ► + ' + K('attack') + ' (DÓŁ, SKOS, PRZÓD I ATAK — JAK W AUTOMATACH).',
        'KAŻDA POSTAĆ MA INNY: KRUK RZUCA KLUCZEM, NINA ROBI WŚLIZG, TUR TARANUJE,',
        'BORYS PCHA LASKĄ. LISTĘ RUCHÓW WIDZISZ NA EKRANIE WYBORU POSTACI.'] },
      { demo: 'launch', head: 'WYBICIE I ŻONGLERKA', lines: () => [
        'WYBICIE: STÓJ W MIEJSCU, TRZYMAJ ▲ I NACIŚNIJ ' + K('attack') + '. WRÓG LECI PIONOWO W GÓRĘ.',
        'WROGA W POWIETRZU MOŻESZ PODBIĆ JESZCZE 3 RAZY KOLEJNYMI CIOSAMI',
        '— „ŻONGLERKA ×N”: PUNKTY I DŁUŻSZE KOMBO.',
        'ODBICIE: WRÓG ODRZUCONY Z IMPETEM W KRAWĘDŹ EKRANU ODBIJA SIĘ OD NIEJ',
        '(„ODBICIE!”) I WRACA W POWIETRZU — DOBIJ GO.'] }
    ] },
    { title: 'CHWYTY I RZUTY', pages: [
      { demo: 'grab', head: 'CHWYT', lines: () => [
        'PODEJDŹ DO OSZOŁOMIONEGO LUB STOJĄCEGO WROGA — POSTAĆ SAMA GO ZŁAPIE.',
        'W CHWYCIE:',
        '• ' + K('attack') + ' — KOLANO (KILKA RAZY Z RZĘDU),',
        '• KIERUNEK DO TYŁU + ' + K('attack') + ' — RZUT ZA SIEBIE,',
        '• ' + K('jump') + ' — PUŚĆ WROGA.',
        'RZUCONY WRÓG RANI KAŻDEGO, W KOGO UDERZY. DUŻYCH WROGÓW I BOSSÓW NIE ZŁAPIESZ.'] },
      { demo: 'suplex', head: 'SUPLEX I RZUT W LOCIE', lines: () => [
        'CHWYT OD TYŁU: ZŁAP WROGA, KTÓRY STOI DO CIEBIE PLECAMI („Z TYŁU!”),',
        'I NACIŚNIJ ' + K('attack') + ' — SUPLEX, BARDZO MOCNY RZUT.',
        'RZUT W LOCIE: SKOCZ OBOK WROGA, TRZYMAJ ▼ I NACIŚNIJ ' + K('attack') + '.',
        'POSTAĆ ŁAPIE GO W POWIETRZU I CISKA NIM O ZIEMIĘ.',
        'RZUTY SĄ KLUCZEM W WYZWANIU „RZUTOWIEC”.'] },
      { demo: 'barrel', head: 'BECZKI I ZAGROŻENIA', lines: () => [
        'STAŃ PRZY BECZCE LUB SKRZYNI, TRZYMAJ ▼ I NACIŚNIJ ' + K('attack') + ' — PODNOSISZ JĄ NAD GŁOWĘ.',
        K('attack') + ' ALBO ' + K('jump') + ' — RZUT: BECZKA PRZEWRACA WSZYSTKICH NA SWOJEJ DRODZE,',
        'A BECZKA Z PALIWEM WYBUCHA PRZY UDERZENIU. ' + K('block') + ' — ODSTAWIASZ JĄ NA ZIEMIĘ.',
        'GDY KTOŚ CIĘ TRAFI, BECZKA SPADA I PĘKA.',
        'ODRZUĆ WROGA DO LAWY, ŚCIEKÓW ALBO MORZA PRZY PRZYPŁYWIE — „SPŁUKANY!” +1000.',
        'NA POCIĄGU ZRZUCONY Z PLATFORMY WRÓG ODPADA OD RAZU.'] }
    ] },
    { title: 'OBRONA', pages: [
      { demo: 'block', head: 'BLOK', lines: () => [
        'TRZYMAJ ' + K('block') + ' — POSTAĆ STAJE W GARDZIE. CIOSY I POCISKI Z PRZODU',
        '(KULE, NOŻE, HARPUNY, SIECI) ZADAJĄ TYLKO OK. 12% OBRAŻEŃ.',
        'NIE ZABLOKUJESZ: CIOSÓW W PLECY, WYBUCHÓW, CHWYTÓW I SPADAJĄCYCH ODŁAMKÓW.',
        'PASEK POD STOPAMI TO WYTRZYMAŁOŚĆ GARDY — GDY SPADNIE DO ZERA,',
        'CIOS PRZEBIJA GARDĘ. GARDA ODNAWIA SIĘ, GDY NIE BLOKUJESZ.',
        'Z GARDY MOŻESZ SKOCZYĆ (' + K('jump') + ') I ODPALIĆ SUPER (' + SPEC() + ').'] },
      { demo: 'parry', head: 'PAROWANIE', lines: () => [
        'NACIŚNIJ ' + K('block') + ' (ALBO ' + K('attack') + ') TUŻ PRZED CIOSEM WROGA Z PRZODU.',
        'UDANE „PAROWANIE!” ODBIJA CIOS, OGŁUSZA WROGA I DOŁADOWUJE FURIĘ.',
        'TO NAJLEPSZA ODPOWIEDŹ NA WOLNE, MOCNE CIOSY BOSSÓW.',
        'W OPCJACH MOŻESZ WŁĄCZYĆ TRYB OPIEKUNA — CZĘŚĆ CIOSÓW BLOKUJE SIĘ WTEDY',
        'SAMA, A PRZY PIERWSZYM SPOTKANIU WROGA DOSTAJESZ PODPOWIEDŹ.'] }
    ] },
    { title: 'SPECJAŁY I FURIA', pages: [
      { demo: 'special', head: 'SPECJAŁ', lines: () => [
        'SPECJAŁ: ' + SPEC() + ' NARAZ (ATAK I SKOK RAZEM).',
        'POSTAĆ WYKONUJE CIOS DOOKOŁA SIEBIE I NA CHWILĘ JEST NIETYKALNA —',
        'IDEALNE WYJŚCIE, GDY OTOCZĄ CIĘ WROGOWIE.',
        'UWAGA: GDY SPECJAŁ KOGOŚ TRAFI, KOSZTUJE CIĘ 6 PUNKTÓW ŻYCIA.',
        'NA PADZIE: ' + K('attack') + ' + ' + K('jump') + '. NA EKRANIE DOTYKOWYM: ATAK I SKOK DWOMA PALCAMI.'] },
      { demo: 'super', head: 'FURIA I SUPER-RUCH', lines: () => [
        'PASEK FURII ROŚNIE, GDY ZADAJESZ I OTRZYMUJESZ CIOSY ORAZ PRZY PAROWANIU.',
        'GDY JEST PEŁNY („FURIA!”), ' + SPEC() + ' ODPALA SUPER-RUCH ZAMIAST SPECJAŁU:',
        'KRUK — BURZA KLUCZY, NINA — TANIEC CIENI, TUR — FALA SEJSMICZNA,',
        'BORYS — GRAD LASKI. SUPER NIC NIE KOSZTUJE I CZYŚCI EKRAN.',
        'W CO-OPIE, GDY OBAJ MACIE PEŁNĄ FURIĘ, ODPALACIE SUPER DRUŻYNOWY.'] }
    ] },
    { title: 'BROŃ', pages: [
      { demo: 'melee', head: 'BROŃ BIAŁA I STRZELBA', lines: () => [
        'BROŃ PODNOSISZ, STAJĄC NA NIEJ I NACISKAJĄC ' + K('attack') + '.',
        '• RURA — 2 ZAMACHY, DRUGI PRZEWRACA.',
        '• MACZETA — SZYBKIE 3 CIĘCIA.',
        '• ŁAŃCUCH — DŁUGI ZASIĘG, DRUGI CIOS TO OBROTOWY ZAMACH DOOKOŁA.',
        'BROŃ BIAŁA ZUŻYWA SIĘ (LICZNIK PRZY PANELU) I W KOŃCU PĘKA.',
        '• STRZELBA — STRZAŁ PRZEZ CAŁY EKRAN, 8 NABOI. GDY CIĘ PRZEWRÓCĄ, BROŃ WYPADA.'] },
      { demo: 'thrown', head: 'BROŃ RZUCANA', lines: () => [
        '• DYNAMIT — PO UPADKU ŻARZY SIĘ CHWILĘ I ROBI DUŻY WYBUCH.',
        '• GRANAT — LECI DALEJ, ODBIJA SIĘ I WYBUCHA PO CZASIE.',
        '• BUTELKA — LECI PROSTO PRZED SIEBIE I ROZBIJA SIĘ NA WROGU.',
        'Z KIERUNKIEM DO PRZODU RZUCASZ DALEKO, DO TYŁU — BLISKO.',
        'BOMBY NIE RANIĄ GRACZY, ALE ROZBIJAJĄ BECZKI I ODPALAJĄ BECZKI Z PALIWEM.',
        'PRZY BURZY I DESZCZU WIATR (WSKAŹNIK „WIATR ►►”) ZNOSI LECĄCE BOMBY.'] }
    ] },
    { title: 'DINOZAURY I POJAZDY', pages: [
      { demo: 'tame', head: 'OSWAJANIE I JAZDA', lines: () => [
        'POKONANY RAPTOR, PACHY, TRICERATOPS, PARAZAUROLOF ALBO PTERANODON',
        'NIE UCIEKA — LEŻY Z GWIAZDKAMI NAD GŁOWĄ. PODEJDŹ I NACIŚNIJ ' + K('attack') + '.',
        'NA GRZBIECIE ' + K('attack') + ' TO ATAK DINOZAURA, ' + K('jump') + ' — SKOK, ' + SPEC() + ' — ZSIADANIE.',
        'RAPTOR GRYZIE, PACHY TARANUJE, TRICERATOPS BLOKUJE CIOSY KRYZĄ,',
        'PTERANODON LATA. JAZDA TRWA OKREŚLONY CZAS (ULEPSZENIE W SKLEPIE JĄ WYDŁUŻA).',
        'JEŹDZIEC NA RAPTORZE: PRZEWRÓĆ GO, A SPADNIE Z SIODŁA — RAPTOR OD RAZU JEST TWÓJ.'] },
      { demo: 'jeep', head: 'POJAZDY', lines: () => [
        'NA NIEKTÓRYCH ETAPACH STOJĄ POJAZDY — PODEJDŹ I NACIŚNIJ ' + K('attack') + ' („WSIĄDŹ!”).',
        '• JEEP — PĘDZI I TARANUJE WROGÓW NA SWOJEJ DRODZE.',
        '• WAGONIK — W KOPALNI: PĘDZI PO TORACH I ZMIATA WSZYSTKO.',
        'UWAŻAJ NA WAGONIKI WROGÓW — „!” NA BRZEGU EKRANU OSTRZEGA, Z KTÓREJ STRONY JADĄ.'] }
    ] },
    { title: 'ETAPY', pages: [
      { demo: 'items', head: 'PRZEDMIOTY', lines: () => [
        '• MIĘSO — DUŻO ŻYCIA, OWOC — TROCHĘ ŻYCIA.',
        '• MONETA I KLEJNOT — PUNKTY (KLEJNOT TAKŻE BURSZTYN).',
        '• BURSZTYN — WALUTA W OBOZIE (SKLEP Z ULEPSZENIAMI PRZED MAPĄ).',
        '• ŻYCIE (1UP) — DODATKOWE ŻYCIE.',
        'BECZKI I SKRZYNIE ROZBIJAJ — KRYJĄ JEDZENIE I BROŃ. CZERWONE BECZKI',
        'Z PALIWEM WYBUCHAJĄ I ODPALAJĄ SĄSIEDNIE. PĘKNIĘTE ŚCIANY KRYJĄ SEKRETY.'] },
      { demo: 'hazard', head: 'ZAGROŻENIA I POGODA', lines: () => [
        'LAWA (KOPALNIA) I TOKSYCZNE ŚCIEKI (KANAŁY) RANIĄ KAŻDEGO, KTO W NIE WEJDZIE.',
        'PODPALACZ ZOSTAWIA NA PODŁODZE OGIEŃ — PALI SIĘ CHWILĘ I RANI KAŻDEGO.',
        'PLAŻA: CO OK. 30 S PRZYPŁYW — W WODZIE RUSZASZ SIĘ DWA RAZY WOLNIEJ.',
        'KANAŁY: FALA ŚCIEKÓW — WEJDŹ NA PODWYŻSZENIE PRZY ŚCIANIE ALBO JĄ PRZESKOCZ.',
        'POGODA ZMIENIA SIĘ Z KAŻDYM PRZEJŚCIEM: W DESZCZU ŚLIZGASZ SIĘ PO BIEGU,',
        'W BURZY PIASKOWEJ WIDZISZ TYLKO OKOLICĘ, WIATR ZNOSI BOMBY.'] },
      { demo: 'foes', head: 'NOWI PRZECIWNICY', lines: () => [
        '• JEŹDZIEC — KŁUSOWNIK NA RAPTORZE. PRZEWRÓĆ GO I PRZEJMIJ DINOZAURA.',
        '• PODPALACZ — MIOTACZ OGNIA Z BLISKA. PODPALA PODŁOGĘ: NIE STÓJ W OGNIU,',
        '  PODCHODŹ Z GÓRY LUB Z DOŁU I BIJ, GDY KOŃCZY STRZAŁ.',
        '• LOTNIARZ — PRZELATUJE NA LOTNI I ZRZUCA SIEĆ TAM, GDZIE STOISZ.',
        '  UCIEKAJ SPOD CIENIA; KOPNIĘCIE Z WYSKOKU ŚCIĄGA GO NA ZIEMIĘ.',
        '• BRYGADZISTA — KOPARKA Z PANCERZEM (O NIEJ W „RADACH NA BOSSÓW”).'] },
      { demo: 'map', head: 'TRASA, SKLEP I BONUSY', lines: () => [
        'PO KAŻDYM ETAPIE: OCENA (S–D) I MAPA REGIONU. PO ETAPIE 2 WYBIERASZ TRASĘ:',
        'MIASTO CIENI ALBO OGNISTE SZYBY.',
        'PRZED MAPĄ JEST OBÓZ — ZA BURSZTYN KUPUJESZ ŻYCIE, DŁUŻSZE KOMBO, SILNIEJSZE',
        'BOMBY, DŁUŻSZĄ JAZDĘ, SZYBSZĄ FURIĘ I DODATKOWE ŻYCIA.',
        'BONUSY: JAZDA AUTEM (PO 3A/3B), ZAGRODA (PO 4), LOT NA PTERANODONIE (PO 5).',
        'PO KANAŁACH (6): POCIĄG DO TWIERDZY.',
        'GRA ZAPISUJE SIĘ SAMA — „KONTYNUUJ” W MENU GŁÓWNYM.'] },
      { demo: 'train', head: 'POCIĄG I ZAKOŃCZENIA', lines: () => [
        'POCIĄG DO TWIERDZY: WALCZYSZ NA PLATFORMACH PĘDZĄCEGO POCIĄGU.',
        'WROGOWIE WSKAKUJĄ Z OBU STRON TORU — PATRZ NA GÓRNĄ I DOLNĄ KRAWĘDŹ.',
        'WRÓG ODRZUCONY POZA PLATFORMĘ ODPADA OD RAZU („ZRZUCONY!”) — WALCZ',
        'PRZY KRAWĘDZI I POSYŁAJ ICH ZA BURTĘ. NA KOŃCU CZEKA BRYGADZISTA.',
        'PO NAPISACH KOŃCOWYCH {ok|ENTER} POKAZUJE KOMIKS O TYM, CO TWOJA POSTAĆ',
        'ROBI PO WSZYSTKIM — KAŻDA Z SIEDMIU POSTACI MA WŁASNE ZAKOŃCZENIE.'] }
    ] },
    { title: 'GRA WE DWÓCH', pages: [
      { demo: 'coop', head: 'DOŁĄCZANIE', lines: () => [
        'GRACZ 2: STRZAŁKI + ' + keyOfP2('attack') + ' ' + keyOfP2('jump') + ' ' + keyOfP2('block') + ', START: ' + keyOfP2('start') + ' (ALBO DRUGI PAD).',
        'DOŁĄCZYĆ MOŻNA NA EKRANIE WYBORU POSTACI ALBO W DOWOLNEJ CHWILI ETAPU.',
        'KAŻDY MA WŁASNE ŻYCIA I WYNIK. GDY GRACZ STRACI ŻYCIA, WRACA SWOIM STARTEM.',
        'TA SAMA POSTAĆ U OBU GRACZY DOSTAJE DRUGI ZESTAW KOLORÓW.'] },
      { demo: 'teamthrow', head: 'ATAKI DRUŻYNOWE', lines: () => [
        '• WYRZUT PARTNERA: PARTNER STOI OBOK W GARDZIE (' + K('block') + '), TY NACISKASZ ' + K('attack') + '',
        '  — LECI PRZED SIEBIE JAK POCISK I TARANUJE WROGÓW.',
        '• PODWÓJNY RZUT: PARTNER TRZYMA WROGA W CHWYCIE, TY PODCHODZISZ I NACISKASZ',
        '  ' + K('attack') + ' — OBAJ CISKACIE NIM O ZIEMIĘ.',
        '• SUPER DRUŻYNOWY: OBAJ Z PEŁNĄ FURIĄ, BLISKO SIEBIE — SUPER JEDNEGO',
        '  ODPALA OBA, A NA KONIEC WYBUCH RANI WSZYSTKICH WROGÓW NA EKRANIE.'] }
    ] },
    { title: 'TRYBY I RADY', pages: [
      { demo: 'modes', head: 'TRYBY GRY', lines: () => [
        '• START GRY — 7 ETAPÓW, POCIĄG, EPILOG I ZAKOŃCZENIE. PO PRZEJŚCIU: NOWA GRA+ I BARON.',
        '• TRENING — MANEKINY, KTÓRE NIE ODDAJĄ: ĆWICZ KOMBO I RUCHY.',
        '• WYZWANIA — KRÓTKIE ZADANIA NA GWIAZDKI I CODZIENNE WYZWANIE.',
        '• BOSS RUSH — WSZYSCY BOSSOWIE PO KOLEI. • PRZETRWANIE — FALE BEZ KOŃCA.',
        '• EKSTRA — OSIĄGNIĘCIA, BESTIARIUSZ, MUZYKA I WŁASNE ETAPY Z EDYTORA.',
        'POKONAJ PADLINIARZA LUB ŻMIJĘ BEZ UTRATY ŻYCIA, BY NIMI ZAGRAĆ.'] },
      { demo: 'boss', head: 'RADY NA BOSSÓW', lines: () => [
        '• NIE STÓJ NA LINII BOSSA — PODCHODŹ Z GÓRY LUB Z DOŁU I ATAKUJ Z BOKU.',
        '• PRZY 30% ŻYCIA WIĘKSZOŚĆ BOSSÓW WPADA W SZAŁ: PRZESKAKUJ SZARŻE',
        '  I BIJ, GDY ŁAPIĄ ZADYSZKĘ.',
        '• STARY KIEŁ PO UDERZENIU W ŚCIANĘ JEST OGŁUSZONY — TO TWOJA SZANSA.',
        '• ZĘBACZ ZNIKA W ŚCIEKACH: ODSUŃ SIĘ OD BĄBELKÓW I KONTRUJ PO LĄDOWANIU.',
        '• BRYGADZISTA: ŁYŻKA Z GÓRY BIJE PRZED KOPARKĘ, SZARŻA IDZIE PO LINII — BIJ Z BOKU.',
        '• DYNAMIT NA BOSSA TO PEWNE OBRAŻENIA. SUPER ZOSTAW NA KONIEC WALKI.'] },
      { demo: 'end', head: 'GOTOWY?', lines: () => [
        'TO WSZYSTKO, CO MUSISZ WIEDZIEĆ. NAJLEPIEJ POĆWICZ RUCHY NA MANEKINACH.',
        'SEKRET: UWOLNIJ WSZYSTKIE DINOZAURY W ZAGRODZIE I ODKRYJ 3 SEKRETY',
        'W JEDNYM PRZEJŚCIU, A ZOBACZYSZ PRAWDZIWE ZAKOŃCZENIE...',
        '',
        '{ok|ENTER} — PRZEJDŹ DO TRENINGU'] }
    ] }
  ];
  const keyOfP2 = a => '{' + a + ':1|' + (keysFor(1, a).split(' / ')[0] || '?') + '}';
  // ---- pokazy ruchów (animacje w ramce strony)
  const demoBuilds = {};
  const demoBuild = k => demoBuilds[k] || (demoBuilds[k] = ENEMIES[k].mk());
  function demoHero() { const k = selKeys()[app.sel] || 'kruk'; return CHARS[k] || CHARS.kruk; }
  function drawHowtoDemo(kind, bx, by, bw, bh, t) {
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
    const g = ctx.createLinearGradient(0, by, 0, by + bh);
    g.addColorStop(0, '#2a3a5a'); g.addColorStop(0.62, '#5a6a8a'); g.addColorStop(0.63, '#6a5440'); g.addColorStop(1, '#4a3a2a');
    ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);
    const fy = by + bh - 8, hero = demoHero(), hb = hero.build, cx = bx + bw / 2;
    const fig = (b, pose, x, y, face, opt) => SP.drawFigure(ctx, b, pose, x, y, face, opt || {});
    const cyc = (n, len) => Math.floor(t / len) % n;
    const grunt = demoBuild('grunt');
    switch (kind) {
      case 'move': { const x = bx + 30 + ((t * 0.8) % (bw - 60)); fig(hb, P.walk[cyc(4, 7)], x, fy, 1); break; }
      case 'run': {
        const ph = t % 160;
        if (ph < 90) fig(hb, P.run[cyc(4, 5)], bx + 20 + ph * 2.2, fy, 1);
        else { const k = (ph - 90) / 70, x = bx + 218 + k * 40, z = Math.sin(k * Math.PI) * 30; fig(hb, P.jump[0], Math.min(x, bx + bw - 20), fy - z, 1); }
        break;
      }
      case 'hud': {
        ctx.fillStyle = P_COLS[0]; ctx.fillRect(bx + 10, by + 8, 24, 24); ctx.fillStyle = '#2a3a5a'; ctx.fillRect(bx + 11, by + 9, 22, 22);
        ctx.save(); ctx.beginPath(); ctx.rect(bx + 11, by + 9, 22, 22); ctx.clip(); SP.drawPortrait(ctx, hb, bx + 22, by + 22, 7, false); ctx.restore();
        bar(bx + 40, by + 18, 90, 6, 0.75, 0.8, '#3ad04a');
        ctx.fillStyle = '#ff8a20'; ctx.fillRect(bx + 40, by + 27, 90 * ((t % 200) / 200), 2);
        ctx.fillStyle = '#140c10'; ctx.fillRect(cx + 40, by + 6, 30, 18);
        bar(bx + 40, by + 42, 90, 5, 0.6, 0.7, '#e0c040');
        fig(grunt, P.idle[0], bx + bw - 40, fy, -1);
        break;
      }
      case 'combo': {
        const seq = hero.combo || ['jab', 'cross', 'jab', 'kick'], i = cyc(seq.length + 2, 14);
        const mv = MOVES[seq[Math.min(i, seq.length - 1)]] || MOVES.jab;
        fig(hb, i < seq.length ? P[mv.pose][0] : P.idle[0], cx - 30, fy, 1);
        const knocked = i >= seq.length - 1;
        if (knocked) { const k = ((t % ((seq.length + 2) * 14)) - (seq.length - 1) * 14) / 42; fig(grunt, P.fall[0], cx + 18 + k * 50, fy - Math.sin(Math.min(1, k) * Math.PI) * 20, -1); }
        else { fig(grunt, t % 14 < 7 ? P.hurt[0] : P.idle[0], cx + 4, fy, -1); if (t % 14 < 3) SP.drawSpark(ctx, cx - 6, fy - 30, 0.3, false); }
        break;
      }
      case 'jumpkick': {
        const k = (t % 70) / 70, x = bx + 40 + k * 120, z = Math.sin(k * Math.PI) * 34;
        fig(hb, k > 0.35 && k < 0.8 ? P.jumpkick[0] : P.jump[0], x, fy - z, 1);
        fig(grunt, k > 0.7 ? P.fall[0] : P.idle[0], bx + 180 + (k > 0.7 ? (k - 0.7) * 80 : 0), fy - (k > 0.7 ? 10 : 0), -1);
        break;
      }
      case 'launch': {
        const ph = t % 120, up = ph < 16 ? P.upper[0] : (ph % 24 < 12 ? P.jab[0] : P.cross[0]);
        fig(hb, up, cx - 22, fy, 1);
        const z = ph < 10 ? 0 : 20 + Math.abs(Math.sin((ph - 10) * 0.09)) * 30;
        fig(grunt, P.fall[0], cx + 6, fy - z, -1);
        if (ph > 16 && ph % 24 < 3) SP.drawSpark(ctx, cx + 6, fy - z - 20, 0.3, true);
        break;
      }
      case 'grab': case 'suplex': {
        const ph = t % 120;
        if (kind === 'grab') {
          fig(hb, ph < 70 ? (ph % 20 < 10 ? P.knee[0] : P.grab[0]) : P.throw[0], cx - 14, fy, 1);
          if (ph < 70) fig(grunt, P.hurt[0], cx + 2, fy, -1);
          else { const k = (ph - 70) / 50; fig(grunt, P.fall[0], cx - 20 - k * 70, fy - Math.sin(k * Math.PI) * 28, 1); }
        } else {
          fig(hb, ph < 40 ? P.grab[0] : P.throw[0], cx - 14, fy, 1);
          if (ph < 40) fig(grunt, P.idle[0], cx + 2, fy, 1);
          else { const k = Math.min(1, (ph - 40) / 30); fig(grunt, P.fall[0], cx - 10 * k, fy - Math.sin(k * Math.PI) * 30, -1); }
        }
        break;
      }
      case 'block': case 'parry': {
        const ph = t % 60;
        fig(hb, P.guard[0], cx - 26, fy, 1);
        ctx.strokeStyle = 'rgba(128,240,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx - 14, fy - 26, 5, 16, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
        fig(grunt, ph < 20 ? P.jab[0] : P.idle[0], cx + 4, fy, -1);
        if (ph < 6) SP.drawSpark(ctx, cx - 10, fy - 26, 0.3, kind === 'parry');
        break;
      }
      case 'special': fig(hb, P.spin[cyc(2, 4)], cx, fy, 1); fig(grunt, P.fall[0], cx + 44, fy - 12, -1); fig(grunt, P.fall[0], cx - 44, fy - 12, 1); break;
      case 'super': {
        fig(hb, t % 60 < 30 ? P.victory[0] : P.spin[cyc(2, 4)], cx, fy, 1);
        const r = (t % 60) * 2.5; ctx.strokeStyle = `rgba(255,230,160,${1 - (t % 60) / 60})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, fy, r, r * 0.25, 0, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'melee': {
        ['pipe', 'machete', 'chain', 'rifle'].forEach((w, i) => SP.drawItem(ctx, w, bx + 30 + i * 30, fy - 2, t));
        fig(hb, t % 20 < 10 ? P.swingUp[0] : P.swingDown[0], cx + 70, fy, 1, { weapon: ['pipe', 'machete', 'chain'][cyc(3, 40)] });
        break;
      }
      case 'foes': {
        const fl = demoBuild('flamer'), k = t % 90;
        fig(fl, k < 30 ? P.idle[0] : P.aim[0], bx + 40, fy, 1, { weapon: 'flamer' });
        if (k >= 30) drawFlame({ state: 'flame', t: Math.min(70, k - 14), face: 1 }, bx + 40, fy);
        const rx = bx + 120 + Math.sin(t * 0.03) * 20;
        SP.drawRaptor(ctx, rx, fy, -1, t, 'run', { body: '#7a5a3a', belly: '#c8a878', stripe: '#3a2a1a' }, {});
        fig(demoBuild('grunt'), SEAT, rx + 1, fy - 25, -1, { weapon: 'knife' });
        drawGlider({ b: demoBuild('glider'), face: -1, state: 'glide', t: 0 }, bx + bw - 30 - ((t * 0.8) % (bw - 60)), by + 70, false);
        break;
      }
      case 'train': {
        // tło etapu przeskalowane do szerokości ramki, wyrównane do dołu (widać platformę)
        const T = window.SPECIAL_STAGES.train, k = bw / W, top = by + bh - H * k, deckY = top + 192 * k;
        ctx.save(); ctx.translate(bx, top); ctx.scale(k, k);
        T.drawBack(ctx, {}, 300, t); T.drawFront(ctx, {}, 300, t);
        ctx.restore();
        const ph = t % 100, fly = Math.max(0, ph - 20);
        fig(hb, ph < 20 ? P.jab[0] : P.idle[0], cx - 20, deckY, 1);
        if (ph < 60) fig(demoBuild('grunt'), ph < 20 ? P.idle[0] : P.fall[0], cx + 10 + fly * 1.2, deckY - fly * 0.5 - (ph > 20 ? 8 : 0), -1);
        break;
      }
      case 'barrel': {
        const ph = t % 120;
        if (ph < 30) { fig(hb, ph < 12 ? P.crouch[0] : P.hammerUp[0], bx + 60, fy, 1); SP.drawBarrel(ctx, bx + 62, fy - (ph < 12 ? 2 : 52), 2, 'barrel'); }
        else if (ph < 40) { fig(hb, P.throw[0], bx + 60, fy, 1); SP.drawBarrel(ctx, bx + 70 + (ph - 30) * 5, fy - 50 + (ph - 30) * 2, 2, 'barrel'); }
        else { fig(hb, P.idle[0], bx + 60, fy, 1); const k = Math.min(1, (ph - 40) / 30); if (k < 1) SP.drawBarrel(ctx, bx + 120 + k * 120, fy - 30 + k * 18, 2, 'barrel'); }
        fig(grunt, ph > 52 && ph < 100 ? P.fall[0] : P.idle[0], bx + 190, fy - (ph > 52 && ph < 100 ? 10 : 0), -1);
        fig(grunt, ph > 62 && ph < 110 ? P.fall[0] : P.idle[0], bx + 230, fy - (ph > 62 && ph < 110 ? 10 : 0), -1);
        break;
      }
      case 'thrown': {
        ['dynamite', 'grenade', 'bottle'].forEach((w, i) => SP.drawItem(ctx, w, bx + 30 + i * 26, fy - 2, t));
        const k = (t % 60) / 60;
        fig(hb, k < 0.2 ? P.lob[0] : P.throw[0], cx + 10, fy, 1);
        if (k > 0.15) SP.drawShot(ctx, { type: 'grenade', fuse: 99 }, cx + 20 + k * 80, fy - 30 - Math.sin(k * Math.PI) * 30 + k * 28, t);
        break;
      }
      case 'tame': {
        const ph = t % 160;
        if (ph < 70) { SP.drawRaptor(ctx, cx + 30, fy, -1, t, 'down', RAPTOR_COLS[0], {}); drawStars(cx + 22, fy - 30); fig(hb, P.walk[cyc(4, 7)], bx + 30 + ph, fy, 1); }
        else { const x = bx + 60 + (ph - 70) * 1.6; SP.drawRaptor(ctx, x, fy, 1, t, 'run', RAPTOR_COLS[0], {}); fig(hb, P.crouch[0], x - 2, fy - 16, 1); }
        break;
      }
      case 'jeep': SP.drawJeep(ctx, bx + 40 + ((t * 1.2) % (bw - 40)), fy, 1, t, {}); break;
      case 'items': ['meat', 'fruit', 'coin', 'gem', 'amber', '1up'].forEach((w, i) => SP.drawItem(ctx, w, bx + 26 + i * 38, fy - 4, t)); break;
      case 'hazard': {
        ctx.fillStyle = '#5ac82a'; ctx.beginPath(); ctx.ellipse(bx + 70, fy - 2, 34, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(70,110,120,0.6)'; ctx.fillRect(bx + 130, by + bh * 0.62, bw - 130, 14 + Math.sin(t * 0.04) * 6);
        fig(hb, P.walk[cyc(4, 9)], bx + 180, fy, 1);
        break;
      }
      case 'map': SP.drawItem(ctx, 'amber', bx + 40, fy - 4, t); SP.drawJeep(ctx, cx + 40, fy, -1, t, {}); fig(hb, P.victory[0], cx - 40, fy, 1); break;
      case 'coop': case 'teamthrow': {
        const b2 = altBuild(CHAR_KEYS[1]);
        if (kind === 'coop') { fig(hb, P.idle[cyc(2, 28)], cx - 30, fy, 1); fig(b2, P.victory[0], cx + 30, fy, -1); }
        else {
          const k = (t % 80) / 80;
          fig(hb, k < 0.2 ? P.guard[0] : P.throw[0], bx + 50, fy, 1);
          fig(CHARS[CHAR_KEYS[1]].build, P.jumpkick[0], bx + 70 + k * 160, fy - 8 - Math.sin(k * Math.PI) * 14, 1);
          fig(grunt, k > 0.75 ? P.fall[0] : P.idle[0], bx + 220, fy - (k > 0.75 ? 12 : 0), -1);
        }
        break;
      }
      case 'modes': fig(demoBuild('dummy'), P.idle[0], cx + 30, fy, -1); fig(hb, P[['jab', 'cross', 'kick'][cyc(3, 12)]][0], cx - 2, fy, 1); break;
      case 'boss': SP.drawRaptor(ctx, cx + 40, fy, -1, t, 'roar', REX_COLS, { scale: 1.3, rex: true }); fig(hb, P.jump[0], cx - 60, fy - 20 - Math.sin(t * 0.08) * 8, 1); break;
      case 'end': fig(hb, P.victory[0], cx - 40, fy, 1); fig(CHARS[CHAR_KEYS[1]].build, P.victory[0], cx, fy, 1); SP.drawRaptor(ctx, cx + 60, fy, -1, t, 'idle', RAPTOR_COLS[0], {}); break;
    }
    ctx.restore();
    ctx.strokeStyle = '#140c10'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
  }
  const HT_X = 116, HT_W = W - HT_X - 6;
  function drawHowto() {
    drawScoresBg();
    ctx.fillStyle = 'rgba(10,6,16,0.6)'; ctx.fillRect(0, 0, W, H);
    const h = app.howto;
    HOWTO.forEach((c, i) => {
      if (i !== h.ch) return;
      ctx.fillStyle = 'rgba(255,200,60,0.18)'; ctx.fillRect(4, 22 + i * 17 - 2, HT_X - 8, 13);
    });
    drawHowtoDemo(HOWTO[h.ch].pages[h.pg].demo, HT_X, 30, HT_W, 82, app.frame || 0);
  }
  function drawHowtoText() {
    const h = app.howto, ch = HOWTO[h.ch], pg = ch.pages[h.pg];
    text('JAK GRAĆ', W / 2, 5, 8, '#ffe080', 'center');
    HOWTO.forEach((c, i) => text((i === h.ch ? '► ' : '') + c.title, 8, 22 + i * 17, 4.5, i === h.ch ? '#ffe040' : '#a0a0b0'));
    text(pg.head, HT_X, 19, 6, '#fff');
    text('STRONA ' + (h.pg + 1) + '/' + ch.pages.length, W - 6, 20, 4, '#c0c0c0', 'right');
    pg.lines().forEach((l, i) => text(l, HT_X, 117 + i * 12, 4, '#e8e0f0'));
    text('▲▼ ROZDZIAŁ   ◄► / {ok|ENTER} STRONA   {back|ESC} — POWRÓT', W / 2, 212, 4, '#c0c0c0', 'center');
  }
  function openHowto() { app.mode = 'howto'; app.t = 0; app.howto = app.howto || { ch: 0, pg: 0 }; safeSet('paleo_howto', '1'); }
  function updateHowto() {
    const h = app.howto, n = HOWTO.length;
    if (pressed.up) { h.ch = (h.ch + n - 1) % n; h.pg = 0; sfx('select'); }
    if (pressed.down) { h.ch = (h.ch + 1) % n; h.pg = 0; sfx('select'); }
    const pages = HOWTO[h.ch].pages.length, last = h.ch === n - 1 && h.pg === pages - 1;
    if (pressed.left) {
      if (h.pg > 0) h.pg--; else if (h.ch > 0) { h.ch--; h.pg = HOWTO[h.ch].pages.length - 1; }
      sfx('select');
    }
    if (pressed.right || ((pressed.start || pressed.attack) && app.t > 5)) {
      if (last && !pressed.right) { sfx('start'); app.gameMode = 'training'; app.ngpRun = false; app.p2Active = false; app.mode = 'select'; app.t = 0; return; }
      if (h.pg < pages - 1) h.pg++; else if (h.ch < n - 1) { h.ch++; h.pg = 0; }
      sfx('select');
    }
    if (pressed.pause || pressed.jump) { app.mode = 'title'; app.t = 0; sfx('select'); }
  }
  // =============================================================== PĘTLA
  // ---- DŹWIĘKI OTOCZENIA: fale na plaży, krople w kanałach, wiatr w burzy piaskowej, deszcz, stukot pociągu
  function ambienceFor() {
    if (!G || !['play', 'pause', 'gameover'].includes(app.mode)) return null;
    if (G.special === 'train') return 'train';
    if (G.wx && G.wx.sand) return 'wind';
    if (G.wx && G.wx.rain) return 'rain';
    if (G.special || ST.custom) return null;
    if (G.stageIdx === 5) return 'waves';
    if (G.stageIdx === 6) return 'drips';
    if (G.stageIdx === 2) return 'rain';   // Miasto Cieni — nocna ulewa
    return null;
  }
  // ---- TRYB DEMO (attract mode)
  const DEMO_STAGES = [0, 1, 2, 3, 4, 5];
  function startDemo() {
    const keys = CHAR_KEYS, two = Math.random() < 0.4;
    const k1 = keys[Math.random() * keys.length | 0], k2 = keys.filter(k => k !== k1)[Math.random() * (keys.length - 1) | 0];
    app.demo = { t: 0, prev: { gameMode: app.gameMode, p2Active: app.p2Active, ngpRun: app.ngpRun, route: app.route, run: app.run } };
    app.gameMode = 'demo'; app.ngpRun = false; app.p2Active = two; app.demo.prev.wxSeed = app.wxSeed; app.route = [];
    const team = [makePlayer(k1, 0)]; if (two) team.push(makePlayer(k2, 1));
    startStage(DEMO_STAGES[Math.random() * DEMO_STAGES.length | 0], team);
    G.introT = 90; app.mode = 'play'; app.t = 0;
  }
  function endDemo() {
    const d = app.demo; if (!d) return;
    Object.assign(app, d.prev); app.demo = null;
    AU.stopMusic(); G = null; app.mode = 'title'; app.t = 0; app.idle = 0;
  }
  // zwraca true, gdy demo się skończyło (gracz nacisnął przycisk albo minął czas)
  function updateDemo() {
    const d = app.demo; d.t++;
    if (ACTIONS.some(k => pressed[k]) || d.t > 60 * 40 || G.bossDead || !G.players.some(q => q.alive && q.lives >= 0 && q.state !== 'dead')) { endDemo(); return true; }
    G.players.forEach(p => demoBot(p, inp[p.pIdx]));
    return false;
  }
  function demoBot(p, I) {
    const H_ = I.held, Pr = I.pressed;
    ACTIONS.forEach(k => { H_[k] = false; Pr[k] = false; });
    if (!p.alive) return;
    if (p.state === 'netted') { if (G.frame % 3 === 0) Pr.attack = true; return; }
    if (p.state === 'jump') { if (p.t === 7 && !p.jumpAtk) Pr.attack = true; return; }
    const foesNow = foes().filter(e => e.hp > 0 && hittable(e) && e.state !== 'enter' && Math.abs(e.x - G.camX - W / 2) < W / 2 + 10);
    if ((p.fury || 0) >= 100 && foesNow.length >= 2) { Pr.special = true; H_.attack = H_.jump = true; return; }
    const near = foesNow.filter(e => Math.abs(e.x - p.x) < 50 && Math.abs(e.y - p.y) < 14);
    if (near.length >= 3 && p.hp > 20 && G.frame % 50 === 0) { Pr.special = true; H_.attack = H_.jump = true; return; }
    let tgt = null, bd = 1e9;
    for (const e of foesNow) { const dd = Math.abs(e.x - p.x) + Math.abs(e.y - p.y) * 2; if (dd < bd) { bd = dd; tgt = e; } }
    if (!tgt) {
      // brak wrogów: idź w prawo za kamerą
      if (G.goT > 0 || !G.wave) H_.right = true;
      if (Math.abs(p.y - 186) > 6) H_[p.y < 186 ? 'down' : 'up'] = true;
      return;
    }
    const dx = tgt.x - p.x, dy = tgt.y - p.y, side = dx >= 0 ? 1 : -1;
    const reach = (isBoss(tgt) ? 34 : 24) + (tgt.rad || 8) * 0.5;
    if (Math.abs(dy) > 3) H_[dy > 0 ? 'down' : 'up'] = true;
    if (Math.abs(dx) > reach) H_[side > 0 ? 'right' : 'left'] = true;
    else if (Math.abs(dx) < reach - 12) H_[side > 0 ? 'left' : 'right'] = true;
    if (p.face !== side && Math.abs(dx) <= reach) H_[side > 0 ? 'right' : 'left'] = true;
    if (Math.abs(dy) <= 6 && Math.abs(dx) > 55 && Math.abs(dx) < 85 && G.frame % 90 === 0) { Pr.jump = true; return; }
    if (Math.abs(dy) <= 6 && Math.abs(dx) <= reach + 4 && p.face === side && G.frame % 7 === 0) Pr.attack = true;
  }
  function drawDemoOverlay() {
    if (!app.demo) return;
    if (app.frame % 60 < 40) text('DEMO', W / 2, 46, 12, '#ffe040', 'center');
    if (app.frame % 60 < 40) text('NACIŚNIJ {ok|START}, ABY ZAGRAĆ', W / 2, 200, 6, '#fff', 'center');
  }
  function tick() {
    pollInput();
    if (app.demo && app.mode !== 'play') endDemo();
    if (pressed.mute) AU.toggleMute();
    app.t++; app.frame = (app.frame || 0) + 1;
    AU.setAmbience(ambienceFor());
    if (app.mode !== 'play' && app.mode !== 'pause') AU.setIntensity(false);
    if (app.share) { updateShare(); clearPressed(); return; }
    if (pressed.up && G && ((app.mode === 'clear' && app.t > 40) || (app.mode === 'gameover' && app.cont > 0 && app.t > 30) || (app.mode === 'ending' && app.t > 300))) { openShare(); clearPressed(); return; }
    switch (app.mode) {
      case 'title':
        if (AU.ctx && !AU.current) AU.play('title');
        if (inp[1].pressed.start && !inp[0].pressed.start) { sfx('start'); app.gameMode = 'arcade'; app.ngpRun = false; app.mode = 'select'; app.t = 0; app.p2Active = true; break; }
        // licznik bezczynności (pokaz tabeli wyników) — osobny od animacji ekranu
        app.idle = ACTIONS.some(k => pressed[k]) ? 0 : (app.idle || 0) + 1;
        const TI = titleItems();
        if ((app.menuSel || 0) >= TI.length) app.menuSel = 0;
        if (pressed.up || pressed.down) { app.menuSel = ((app.menuSel || 0) + (pressed.down ? 1 : TI.length - 1)) % TI.length; sfx('select'); }
        else if (pressed.start || pressed.attack) {
          if (!AU.ctx) AU.init();
          sfx('start');
          const item = TI[app.menuSel || 0];
          if (item === 'KONTYNUUJ') resumeProgress();
          else if (item === 'ZAINSTALUJ APLIKACJĘ') { const ev = app.installPrompt; app.installPrompt = null; app.menuSel = 0; if (ev) ev.prompt(); }
          else if (MODE_OF[item]) { app.gameMode = MODE_OF[item]; app.ngpRun = item === 'NOWA GRA+'; app.mode = 'select'; app.t = 0; app.p2Active = false; }
          else if (item === 'EKSTRA') { app.mode = 'extras'; app.exSel = 0; app.sub = null; app.t = 0; }
          else if (item === 'JAK GRAĆ') { openHowto(); sfx('select'); }
          else if (item === 'WYZWANIA') { app.mode = 'chal'; app.chSel = app.chSel || 0; app.t = 0; }
          else if (item === 'OPCJE') { app.mode = 'options'; app.t = 0; app.optSel = 0; app.keysFor = null; app.padFor = null; }
          else showScores(-1, false, 'main');
        } else if (app.idle > 900) {
          // jak na automacie: na zmianę pokaz gry i tabela wyników
          app.idle = 0; app.attractDemo = !app.attractDemo;
          if (app.attractDemo) startDemo(); else showScores(-1, true);
        }
        break;
      case 'story': {
        const S_ = app.story, line = S_.lines[S_.i][1];
        S_.t++;
        if (pressed.pause || pressed.jump) { S_.after(); break; }
        if ((pressed.start || pressed.attack) && app.t > 8) {
          if (S_.t * 1.1 < line.length) S_.t = Math.ceil(line.length / 1.1);
          else if (++S_.i >= S_.lines.length) { sfx('start'); S_.after(); }
          else { S_.t = 0; sfx('select'); }
        }
        if (S_.t % 4 === 1 && S_.t * 1.1 < line.length) sfx('punch');
        break;
      }
      case 'shop': {
        const sh = app.shop, q = sh.team[sh.who], N = UPGRADES.length + 1;
        if (sh.msgT > 0) sh.msgT--;
        if (sh.team.length > 1 && (pressed.left || pressed.right)) { sh.who = 1 - sh.who; sfx('select'); }
        if (pressed.up) { sh.sel = (sh.sel + N - 1) % N; sfx('select'); }
        if (pressed.down) { sh.sel = (sh.sel + 1) % N; sfx('select'); }
        const leave = pressed.pause || pressed.jump || ((pressed.start || pressed.attack) && sh.sel === UPGRADES.length && app.t > 10);
        if (leave) { app.skipShop = true; goMap(sh.idx, sh.team); app.skipShop = false; break; }
        if ((pressed.start || pressed.attack) && app.t > 10) {
          const [id, name, costs] = UPGRADES[sh.sel], cost = upCost(q, id, costs);
          if (cost === undefined) { sfx('empty'); sh.msg = 'MAKSYMALNY POZIOM'; }
          else if ((q.amber || 0) < cost) { sfx('empty'); sh.msg = 'ZA MAŁO BURSZTYNU'; }
          else { q.amber -= cost; if (id === 'life') q.lives++; else q.up[id]++; applyUps(q); sfx('coin'); sh.msg = 'KUPIONO: ' + name; }
          sh.msgT = 100;
        }
        break;
      }
      case 'howto': updateHowto(); break;
      case 'chal': {
        const n = CHALLENGES.length + 1;
        if (pressed.up) { app.chSel = (app.chSel + n - 1) % n; sfx('select'); }
        if (pressed.down) { app.chSel = (app.chSel + 1) % n; sfx('select'); }
        if (pressed.pause || pressed.jump) { app.mode = 'title'; app.t = 0; sfx('select'); break; }
        if ((pressed.start || pressed.attack) && app.t > 5) {
          sfx('start'); app.ngpRun = false; app.p2Active = false;
          if (app.chSel === 0) app.gameMode = 'daily';
          else { app.gameMode = 'challenge'; app.chDef = CHALLENGES[app.chSel - 1]; }
          app.mode = 'select'; app.t = 0;
        }
        break;
      }
      case 'chalres':
        if (app.t > 40 && (pressed.start || pressed.attack)) { sfx('start'); const team = makeTeam(); startChallenge(team); }
        else if (app.t > 20 && (pressed.pause || pressed.jump)) { G = null; app.mode = 'chal'; app.t = 0; AU.stopMusic(); AU.play('title'); sfx('select'); }
        break;
      case 'extras': {
        const back = pressed.pause || pressed.jump, ok = (pressed.start || pressed.attack) && app.t > 5;
        if (!app.sub) {
          const NE = EXTRA_ITEMS.length;
          if (pressed.up) { app.exSel = (app.exSel + NE - 1) % NE; sfx('select'); }
          if (pressed.down) { app.exSel = (app.exSel + 1) % NE; sfx('select'); }
          if (ok) {
            sfx('select');
            if (app.exSel === 0) app.sub = 'ach';
            else if (app.exSel === 1) { app.sub = 'bestiary'; app.bestSel = app.bestSel || 0; }
            else if (app.exSel === 2) { app.sub = 'jukebox'; app.jukeSel = 0; AU.stopMusic(); }
            else if (app.exSel === 3) { app.sub = 'custom'; app.cuSel = 0; app.cuList = customList(); }
            else { app.mode = 'title'; app.t = 0; }
            app.t = 0;
          } else if (back) { app.mode = 'title'; app.t = 0; sfx('select'); }
          break;
        }
        if (back) { if (app.sub === 'jukebox') AU.stopMusic(); app.sub = null; app.t = 0; sfx('select'); break; }
        if (app.sub === 'custom') {
          const n = app.cuList.length + 1;
          if (pressed.up) { app.cuSel = (app.cuSel + n - 1) % n; sfx('select'); }
          if (pressed.down) { app.cuSel = (app.cuSel + 1) % n; sfx('select'); }
          if (ok) {
            sfx('start');
            if (app.cuSel === app.cuList.length) location.href = 'editor.html';
            else { app.customData = app.cuList[app.cuSel]; app.gameMode = 'custom'; app.ngpRun = false; app.p2Active = false; app.mode = 'select'; app.t = 0; }
          }
        } else if (app.sub === 'bestiary') {
          const n = BESTIARY.length;
          if (pressed.left || pressed.up) { app.bestSel = (app.bestSel + n - 1) % n; sfx('select'); }
          if (pressed.right || pressed.down) { app.bestSel = (app.bestSel + 1) % n; sfx('select'); }
        } else if (app.sub === 'jukebox') {
          const n = JUKE.length;
          if (pressed.up) { app.jukeSel = (app.jukeSel + n - 1) % n; sfx('select'); }
          if (pressed.down) { app.jukeSel = (app.jukeSel + 1) % n; sfx('select'); }
          if (ok) {
            const k = JUKE[app.jukeSel][0];
            if (!songUnlocked(k)) sfx('empty');
            else if (AU.current && AU.current.name === k) AU.stopMusic();
            else { AU.stopMusic(); AU.play(k); }
          }
        }
        break;
      }
      case 'options': {
        if (app.captureMsg > 0) app.captureMsg--;
        if (app.keysFor !== null && app.keysFor !== undefined) {
          if (app.capture) break;
          const N = BIND_ACTIONS.length + 1;
          if (pressed.up) { app.keySel = (app.keySel + N - 1) % N; sfx('select'); }
          if (pressed.down) { app.keySel = (app.keySel + 1) % N; sfx('select'); }
          if ((pressed.start || pressed.attack) && app.t > 5) {
            if (app.keySel < BIND_ACTIONS.length) { app.capture = { pIdx: app.keysFor, action: BIND_ACTIONS[app.keySel] }; sfx('select'); }
            else { app.keysFor = null; sfx('select'); }
          } else if (pressed.pause || pressed.jump) { app.keysFor = null; sfx('select'); }
          break;
        }
        if (app.padFor !== null && app.padFor !== undefined) {
          if (app.padCapture) {
            if (pressed.pause || ++app.padCapture.t > 600) { app.padCapture = null; sfx('select'); }
            break;
          }
          const N = PAD_BINDS.length + 1;
          if (pressed.up) { app.padSel = (app.padSel + N - 1) % N; sfx('select'); }
          if (pressed.down) { app.padSel = (app.padSel + 1) % N; sfx('select'); }
          if (kbd[0].resetPad) { kbd[0].resetPad = false; resetPads(); sfx('start'); }
          if ((pressed.start || pressed.attack) && app.t > 5) {
            if (app.padSel < PAD_BINDS.length) { app.padCapture = { pIdx: app.padFor, action: PAD_BINDS[app.padSel], t: 0, rest: null }; sfx('select'); }
            else { app.padFor = null; sfx('select'); }
          } else if (pressed.pause || pressed.jump) { app.padFor = null; sfx('select'); }
          break;
        }
        const N = OPT_ROWS.length;
        if (pressed.up) { app.optSel = (app.optSel + N - 1) % N; sfx('select'); }
        if (pressed.down) { app.optSel = (app.optSel + 1) % N; sfx('select'); }
        const dir = (pressed.right ? 1 : 0) - (pressed.left ? 1 : 0), ok = (pressed.start || pressed.attack) && app.t > 5;
        switch (OPT_ROWS[app.optSel]) {
          case 'diff': if (dir) { OPTS.difficulty = DIFF_KEYS[(DIFF_KEYS.indexOf(OPTS.difficulty) + dir + 3) % 3]; saveOpts(); sfx('select'); } break;
          case 'lives': if (dir) { OPTS.lives = clamp(OPTS.lives + dir, 1, 5); saveOpts(); sfx('select'); } break;
          case 'assist': if (dir || ok) { OPTS.assist = !OPTS.assist; saveOpts(); sfx('select'); } break;
          case 'crt': if (dir || ok) { const n = CRT_MODES.length; OPTS.crt = CRT_MODES[(CRT_MODES.indexOf(crtMode()) + (dir || 1) + n) % n]; saveOpts(); sfx('select'); } break;
          case 'bezel': if (dir || ok) { OPTS.bezel = !OPTS.bezel; saveOpts(); drawBezel(); sfx('select'); } break;
          case 'rumble': if (dir || ok) { OPTS.rumble = !OPTS.rumble; saveOpts(); sfx('select'); if (OPTS.rumble) rumbleAll(0.6, 0.6, 250); } break;
          case 'pad1': case 'pad2': if (ok) { app.padFor = OPT_ROWS[app.optSel] === 'pad1' ? 0 : 1; app.padSel = 0; app.padCapture = null; app.t = 0; sfx('select'); } break;
          case 'music': if (dir) { OPTS.music = clamp(OPTS.music + dir, 0, 10); saveOpts(); } break;
          case 'sfx': if (dir) { OPTS.sfx = clamp(OPTS.sfx + dir, 0, 10); saveOpts(); sfx('punch'); } break;
          case 'touch': if (dir) { OPTS.touch = TOUCH_MODES[(TOUCH_MODES.indexOf(OPTS.touch) + dir + 3) % 3]; saveOpts(); sfx('select'); } break;
          case 'keys1': case 'keys2': if (ok) { app.keysFor = OPT_ROWS[app.optSel] === 'keys1' ? 0 : 1; app.keySel = 0; app.t = 0; sfx('select'); } break;
          case 'reset': if (ok) { OPTS = defaultOpts(); resetKeys(); resetPads(); saveOpts(); drawBezel(); app.optMsg = 120; sfx('start'); } break;
          case 'back': if (ok) { app.mode = 'title'; app.t = 0; sfx('select'); } break;
        }
        if (app.optMsg > 0) app.optMsg--;
        if (pressed.pause || pressed.jump) { app.mode = 'title'; app.t = 0; sfx('select'); }
        break;
      }
      case 'scores':
        if (!app.attract && (pressed.left || pressed.right)) {
          const i = TABLE_KEYS.indexOf(app.scoreTable);
          app.scoreTable = TABLE_KEYS[(i + (pressed.right ? 1 : TABLE_KEYS.length - 1)) % TABLE_KEYS.length]; app.scoresHi = -1; app.t = 21; sfx('select');
        }
        if ((pressed.start || pressed.attack) && app.t > 20) {
          if (app.attract) { sfx('start'); app.gameMode = 'arcade'; app.mode = 'select'; app.t = 0; }
          else { app.mode = 'title'; app.t = 0; }
        } else if ((pressed.pause || pressed.jump) && app.t > 5) { app.mode = 'title'; app.t = 0; sfx('select'); }
        else if (app.t > (app.attract ? 420 : 900)) { app.mode = 'title'; app.t = 0; }
        break;
      case 'entry': {
        const e = app.entry, n = LETTERS.length;
        if (pressed.up) { e.letters[e.pos] = (e.letters[e.pos] + 1) % n; sfx('select'); }
        if (pressed.down) { e.letters[e.pos] = (e.letters[e.pos] + n - 1) % n; sfx('select'); }
        if (pressed.left && e.pos > 0) { e.pos--; sfx('select'); }
        if (pressed.right && e.pos < 2) { e.pos++; sfx('select'); }
        if ((pressed.pause || pressed.jump) && e.pos > 0 && app.t > 20) { e.pos--; sfx('select'); }
        if ((pressed.attack || pressed.start) && app.t > 20) {
          sfx('pickup');
          if (e.pos < 2) { e.pos++; e.letters[e.pos] = e.letters[e.pos - 1]; } else { commitEntry(); break; }
        }
        if (--e.time <= 0) commitEntry();
        break;
      }
      case 'select': {
        const n = selKeys().length, I1 = inp[0].pressed, I2 = inp[1].pressed;
        if (I1.left) { app.sel = (app.sel + n - 1) % n; sfx('select'); }
        if (I1.right) { app.sel = (app.sel + 1) % n; sfx('select'); }
        if (!app.p2Active && I2.start && app.t > 5) { app.p2Active = true; app.sel2 = (app.sel + 1) % n; sfx('start'); }
        else if (app.p2Active) {
          if (I2.left) { app.sel2 = (app.sel2 + n - 1) % n; sfx('select'); }
          if (I2.right) { app.sel2 = (app.sel2 + 1) % n; sfx('select'); }
          if (I2.jump || I2.pause) { app.p2Active = false; sfx('select'); }
        }
        if ((I1.pause || I1.jump) && app.t > 5) {
          sfx('select'); app.p2Active = false; app.t = 0;
          if (app.gameMode === 'custom') { app.mode = 'extras'; app.sub = 'custom'; app.cuList = customList(); }
          else if (app.gameMode === 'challenge' || app.gameMode === 'daily') app.mode = 'chal';
          else app.mode = 'title';
          break;
        }
        if ((I1.start || I1.attack) && app.t > 10) {
          sfx('start');
          G = null; app.route = [];
          if (app.gameMode === 'training') startTraining(null);
          else if (app.gameMode === 'rush') startRush(null);
          else if (app.gameMode === 'survival') startSurvival(null);
          else if (app.gameMode === 'custom') startCustom(null);
          else if (app.gameMode === 'challenge') startChallenge(null);
          else if (app.gameMode === 'daily') startDaily(null);
          else if (app.debug) { app.mode = 'stagesel'; app.t = 0; }
          else { goMap(urlStage, null); }
        }
        break;
      }
      case 'stagesel':
        if (pressed.up) { app.stageSel = (app.stageSel + SEL_COUNT - 1) % SEL_COUNT; sfx('select'); }
        if (pressed.down) { app.stageSel = (app.stageSel + 1) % SEL_COUNT; sfx('select'); }
        if (pressed.jump || pressed.pause) { app.mode = 'select'; app.t = 0; sfx('select'); break; }
        if ((pressed.start || pressed.attack) && app.t > 10) {
          sfx('start');
          app.route = [];
          if (app.stageSel === STAGES.length) startBonus(null, 4);
          else if (app.stageSel === STAGES.length + 1) startCages(null, 5);
          else if (app.stageSel === STAGES.length + 2) startFlight(null, 6);
          else goMap(app.stageSel, null);
        }
        break;
      case 'play': {
        if (app.demo) { if (updateDemo()) break; updateGame(); break; }
        let joined = false;
        for (let i = 0; i < 2; i++) if (inp[i].pressed.start && (!G.players[i] || G.players[i].out) && !G.bossDead) joined = joinOrContinue(i) || joined;
        if (!joined && (pressed.pause || pressed.start)) { app.mode = 'pause'; app.pauseSel = 0; app.pausedFrom = 'play'; sfx('select'); if (AU.ctx) AU.ctx.suspend(); break; }
        updateGame();
        break;
      }
      case 'bonus':
        if (pressed.pause) { app.mode = 'pause'; app.pauseSel = 0; app.pausedFrom = 'bonus'; sfx('select'); if (AU.ctx) AU.ctx.suspend(); break; }
        if (curBonus().update()) {
          const B = curBonus().state;
          if (app.bonusKind === 'flight') { if (B.result && B.result.sunk >= 12) unlock('flyer'); }
          else if (B.result && B.result.ok && B.car.hp >= 100) unlock('cleanroad');
          goMap(app.bonusNext, app.bonusTeam);
        }
        break;
      case 'pause':
        // menu pauzy: 0 = wznów, 1 = wyjdź do menu
        if (pressed.up || pressed.down) { app.pauseSel = 1 - app.pauseSel; if (AU.ctx) AU.ctx.resume(); sfx('select'); }
        const resume = pressed.pause || pressed.jump;
        if (resume) app.pauseSel = 0;
        if (resume || pressed.start || pressed.attack) {
          if (AU.ctx) AU.ctx.resume();
          if (app.pauseSel === 1 && !resume) {
            AU.stopMusic(); sfx('start');
            G = null; app.p2Active = false; app.mode = 'title'; app.t = 0;
          } else app.mode = app.pausedFrom || 'play';
        }
        break;
      case 'gameover':
        if (app.t % 60 === 0 && app.t > 0) app.cont--;
        if ((pressed.start || pressed.attack) && app.cont > 0 && app.t > 30) {
          G.players.forEach(q => { q.out = false; q.lives = OPTS.lives - 1; if (!G.actors.includes(q)) G.actors.push(q); respawn(q); });
          app.mode = 'play'; AU.stopMusic(); AU.play(G.wave && G.wave.boss ? ST.bossMusic : ST.music);
        } else if (app.cont <= 0 && app.t > (G.rush || G.special === 'survival' ? 150 : 60)) finishRun();
        break;
      case 'clear':
        if (app.t === 40 && app.results && app.results[0] && app.results[0].rank) sfx(['S', 'A'].includes(app.results[0].rank) ? 'oneup' : 'go');
        if ((pressed.start || pressed.attack) && app.t > 90) {
          if (ST.custom) { sfx('start'); leaveCustom(); break; }
          if (app.gameMode === 'daily') { sfx('start'); unlock('daily'); endRun('daily', dailyRecs()); break; }
          if (G.special === 'cages') goMap(app.cageNext, G.players);
          else if (G.special === 'train') goMap(app.trainNext || 7, G.players);
          else if (!G.special && G.stageIdx === STAGES.length - 1 && app.gameMode === 'arcade') startEscape(G.players);
          else if (G.special === 'escape' && trueReady()) { saveProgress({ type: 'truefinal' }, G.players); startTrueFinal(G.players); }
          else if (G.stageIdx < STAGES.length - 1) afterStage(G.stageIdx, G.players);
          else {
            app.trueEnd = G.special === 'truefinal';
            if (app.trueEnd) unlock('trueend');
            unlock('beatgame'); if (OPTS.difficulty === 'arcade') unlock('arcade'); if (app.ngpRun) unlock('ngplus'); clearProgress();
            app.newUnlocks = !app.unlocks.ngp || !app.unlocks.baron;
            app.unlocks.ngp = true; app.unlocks.baron = true; safeSet('paleo_unlocks', JSON.stringify(app.unlocks));
            app.mode = 'ending'; app.t = 0; app.epilogShown = false; AU.stopMusic(); AU.play('ending'); G.players.forEach(q => saveHi(q.score));
          }
        }
        break;
      case 'map':
        if (app.mapChoice) {
          const c = app.mapChoice;
          app.t = Math.min(app.t, 39);
          if (pressed.left || pressed.right || pressed.up || pressed.down) { c.sel = 1 - c.sel; app.mapTo = c.opts[c.sel]; sfx('select'); }
          if ((pressed.start || pressed.attack) && app.t > 15) { app.mapTo = c.opts[c.sel]; app.mapChoice = null; app.t = 40; sfx('start'); }
          break;
        }
        if (app.t === MAP_ARRIVE) { sfx('go'); G_MAP.flash = 20; }
        if ((pressed.start || pressed.attack) && app.t > 15) {
          if (app.t < MAP_ARRIVE) { app.t = MAP_ARRIVE - 1; break; }
          app.t = MAP_END;
        }
        if (app.t >= MAP_END) { sfx('start'); beginStage(app.mapTo, app.mapPlayer); }
        break;
      case 'ending':
        if ((pressed.start || pressed.attack) && app.t > 300) {
          // najpierw komiks z zakończeniami postaci, potem tablica wyników
          if (!app.epilogShown && G && G.players.length) { app.epilogShown = true; sfx('start'); startEpilog(G.players, () => endGame('★')); }
          else endGame('★');
        }
        break;
    }
    clearPressed();
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    const view = app.mode === 'pause' ? app.pausedFrom : app.mode;
    if (view === 'title') drawTitle();
    else if (view === 'select') drawSelect();
    else if (view === 'stagesel') drawStageSel();
    else if (view === 'map') drawMap();
    else if (view === 'ending') drawEnding();
    else if (view === 'scores') drawScores();
    else if (view === 'options') drawOptions();
    else if (view === 'extras') drawExtras();
    else if (view === 'chal') drawChalList();
    else if (view === 'howto') drawHowto();
    else if (view === 'shop') drawShop();
    else if (view === 'story') drawStory();
    else if (view === 'entry') drawEntry();
    else if (view === 'bonus') { curBonus().draw(); if (app.mode === 'pause') { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H); } }
    else if (G) {
      drawWorld();
      drawHud();
      if (app.mode === 'pause' || app.mode === 'gameover' || app.mode === 'clear' || app.mode === 'chalres') { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H); }
    }
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(buf, 0, 0, screen.width, screen.height);
    if (view === 'title') drawTitleText();
    else if (view === 'select') drawSelectText();
    else if (view === 'stagesel') drawStageSelText();
    else if (view === 'map') drawMapText();
    else if (view === 'ending') drawEndingText();
    else if (view === 'scores') drawScoresText();
    else if (view === 'options') drawOptionsText();
    else if (view === 'extras') drawExtrasText();
    else if (view === 'chal') drawChalListText();
    else if (view === 'howto') drawHowtoText();
    else if (view === 'shop') drawShopText();
    else if (view === 'story') drawStoryText();
    else if (view === 'entry') drawEntryText();
    else if (view === 'bonus') curBonus().drawText();
    else if (G) {
      drawHudText();
      drawDemoOverlay();
      if (app.mode === 'gameover') {
        text('KONIEC GRY', W / 2, 70, 16, '#ff5050', 'center');
        if (app.cont > 0) { text('KONTYNUOWAĆ?', W / 2, 104, 8, '#fff', 'center'); text(String(app.cont - 1), W / 2, 122, 18, '#ffe040', 'center'); }
        if (app.cont > 0 && app.t > 30) text('▲ — UDOSTĘPNIJ WYNIK', W / 2, 160, 4, '#c0e0ff', 'center');
      }
      if (app.mode === 'chalres') drawChalRes();
      if (app.mode === 'clear') {
        const res = app.results || [];
        const cages = G.special === 'cages';
        const last = ST.custom || (!cages && G.stageIdx >= STAGES.length - 1 && (G.special === 'truefinal' || (G.special === 'escape' && !trueReady()) || app.gameMode !== 'arcade'));
        text(cages ? 'ZAGRODA — ' + (res[0] && res[0].all ? 'SUKCES!' : 'KONIEC CZASU') : G.special === 'escape' ? 'UCIECZKA UDANA!' : G.special === 'truefinal' ? 'KOLOS POKONANY!' : ST.custom ? ST.name : 'ETAP ' + ST.label + ' UKOŃCZONY', W / 2, 36, ST.custom ? 9 : 12, '#ffe040', 'center');
        res.forEach((r, i) => {
          const cx = res.length > 1 ? (i ? W * 0.72 : W * 0.28) : W / 2, col = res.length > 1 ? P_COLS[i] : '#ffe080';
          text(r.p.name, cx, 62, 7, col, 'center');
          if (r.cages) {
            text('UWOLNIONE ' + r.freed + ' × 1000', cx, 80, 6, '#fff', 'center');
            text(r.all ? 'KOMPLET +10000  CZAS +' + r.time : 'BEZ KOMPLETU', cx, 94, 5, r.all ? '#7cff7c' : '#ff9a80', 'center');
          } else {
            text('BONUS CZASU ' + r.time, cx, 72, 5, '#fff', 'center');
            text('BONUS ZDROWIA ' + r.life, cx, 81, 5, '#fff', 'center');
            text('POKONANI ' + r.st.kills + '   KOMBO ' + r.st.maxCombo, cx, 92, 5, '#c0e0ff', 'center');
            text('OBRAŻENIA ' + Math.round(r.st.dmg) + (r.st.deaths ? '   STRACONE ŻYCIA ' + r.st.deaths : ''), cx, 101, 5, '#ffb0a0', 'center');
            if (app.t > 40) {
              text('OCENA', cx - 16, 116, 5, '#fff', 'center');
              text(r.rank, cx + 16, 110, 16, RANK_COLS[r.rank], 'center');
              text('+' + r.rankBonus, cx, 130, 5, '#ffe080', 'center');
            }
          }
          text(String(r.p.score), cx, r.cages ? 114 : 140, 9, '#80d0ff', 'center');
        });
        if (!cages && res[0]) text('CZAS ETAPU ' + Math.floor(res[0].secs / 60) + ':' + String(res[0].secs % 60).padStart(2, '0'), W / 2, 50, 5, '#c0c0c0', 'center');
        if (cages) text('NASTĘPNY: ' + shortName(STAGES[app.cageNext]), W / 2, 158, 6, '#c0f0c0', 'center');
        else if (G.special === 'train') text('NASTĘPNY: ' + shortName(STAGES[app.trainNext || 7]), W / 2, 158, 6, '#c0f0c0', 'center');
        else if (ST.custom) { /* własny etap — bez kolejnego */ }
        else if (G.special === 'escape' && trueReady()) text('NASTĘPNY: ??? — COŚ NADCHODZI OD MORZA', W / 2, 158, 6, '#ffe040', 'center');
        else if (!G.special && G.stageIdx === STAGES.length - 1 && app.gameMode === 'arcade') text('NASTĘPNY: EPILOG — UCIECZKA', W / 2, 158, 6, '#ff9a80', 'center');
        else if (!last) text('NASTĘPNY: ' + nextLabel(G.stageIdx), W / 2, 158, 6, G.stageIdx === 1 ? '#ffe080' : '#c0f0c0', 'center');
        if (app.t > 40) text('▲ — UDOSTĘPNIJ WYNIK', W / 2, 198, 4, '#c0e0ff', 'center');
        if (app.t > 90 && app.t % 50 < 35) text(ST.custom ? '{ok|ENTER} — MENU' : last ? '{ok|ENTER} — ZAKOŃCZENIE' : '{ok|ENTER} — DALEJ', W / 2, 184, 6, '#fff', 'center');
      }
    }
    if (app.mode === 'pause') {
      text('PAUZA', W / 2, 76, 14, '#fff', 'center');
      ['WZNÓW', 'WYJDŹ DO MENU'].forEach((l, i) => {
        const sel = app.pauseSel === i;
        text((sel ? '► ' : '  ') + l, W / 2, 110 + i * 16, 8, sel ? '#ffe040' : '#a0a0b0', 'center');
      });
      text('▲▼ WYBÓR   {ok|ENTER/ATAK} — OK   {back|ESC} — WZNÓW', W / 2, 160, 4, '#c0c0c0', 'center');
    }
    drawToasts();
    if (AU.muted) text('♪ OFF', W - 4, H - 10, 5, '#ff8080', 'right');
    if (app.share) drawShare();
    applyCrt();
  }

  let last = performance.now(), acc = 0;
  const STEP = 1000 / 60;
  function frame(now) {
    acc += Math.min(100, now - last); last = now;
    let n = 0;
    while (acc >= STEP && n < 4) { tick(); acc -= STEP; n++; }
    render();
    requestAnimationFrame(frame);
  }

  // ---- PWA: praca offline i instalacja (tylko przez http/https — nie z file://)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* brak wsparcia */ });
  }
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); app.installPrompt = e; });
  addEventListener('appinstalled', () => { app.installPrompt = null; });

  function boot() {
    AU.setVolumes(OPTS.music, OPTS.sfx);
    updateTouchVisibility();
    STAGES[0].buildLayers();
    window.__paleoBooted = true; drawBezel();
    // index.html?test=1 — szybki test etapu prosto z edytora
    if (urlParams.get('test') === '1') {
      const d = loadJSON('paleo_custom_test');
      if (d) { app.customData = d; app.gameMode = 'custom'; app.ngpRun = false; app.mode = 'select'; app.t = 0; }
    }
    requestAnimationFrame(frame);
  }
  if (document.fonts && document.fonts.load) {
    Promise.race([Promise.all([document.fonts.load('10px "Press Start 2P"', 'AĄĆĘŁŃÓŚŹŻ×►'), document.fonts.load('16px "Tiny5"', 'AĄĆĘŁŃÓŚŹŻ')]),
      new Promise(r => setTimeout(r, 2500))]).then(boot, boot);
  } else boot();

  // debug / testy: uchwyty do stanu gry tylko w trybie debug (config.js) albo z parametrem adresu ?hooks=1 (testy automatyczne)
  if (CFG.debug === true || urlParams.has('hooks')) window.__paleo = { get G() { return G; }, app, pickWeather, customList, buildCustomStage, startCustom, CHARS, ENEMIES, bonus, startStage: i => { startStage(i, G && G.players); app.mode = 'play'; }, startBonus: () => startBonus(G && G.players, 4), startCages: () => startCages(G && G.players, 5), startTraining: () => startTraining(null), startSuper: i => startSuper(G.players[i || 0]), newStage: i => { startStage(i, null); app.mode = 'play'; }, startEscape: () => startEscape(G.players), startDemo, endDemo, AU, startEpilog: () => startEpilog(G.players, () => endGame('★')), ENDINGS, startTrain: () => { app.gameMode = app.gameMode || 'arcade'; startTrain(G ? G.players : null, 7); }, unlocks: () => app.unlocks, hurt: (t, d, src, knock) => hurt(t, d, 1, !!knock, src), spawn: (type, x, y) => { const e = makeEnemy(type, x, y); if (type !== 'glider' && type !== 'digger') setState(e, 'idle'); G.actors.push(e); return e; }, afterStage, resumeProgress, saveInfo: () => app.save, startRush: () => startRush(null), startSurvival: () => startSurvival(null), unlock, opts: () => OPTS, endGame, inp, joinOrContinue: i => joinOrContinue(i),
    flight, curBonus: () => curBonus(), startFlight: () => startFlight(G ? G.players : null, 6), CHALLENGES, dailyPlan, startDaily: () => startDaily(null),
    startChallenge: id => { app.chDef = CHALLENGES.find(c => c.id === id); app.gameMode = 'challenge'; startChallenge(null); }, STAGES };
})();
