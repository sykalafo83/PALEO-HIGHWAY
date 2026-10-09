  // =============================================================== DEFINICJE
  const BASE_BUILD = { scale: 1, legU: 11, legL: 11, torso: 17, shoulderW: 12, hipW: 10, armU: 9, armL: 9, limbW: 5, armW: 4, head: 5.5 };
  const build = o => Object.assign({}, BASE_BUILD, o, { colors: Object.assign({ outline: '#140c10' }, o.colors) });

  const MOVES = {
    jab: { pose: 'jab', start: 3, active: 3, rec: 7, dmg: 5, reach: 26, snd: 'punch' },
    cross: { pose: 'cross', start: 3, active: 3, rec: 8, dmg: 6, reach: 27, snd: 'punch' },
    upper: { pose: 'upper', wind: 'crouch', start: 5, active: 4, rec: 15, dmg: 10, reach: 24, knock: true, snd: 'heavy' },
    kick: { pose: 'kick', start: 6, active: 4, rec: 14, dmg: 11, reach: 34, knock: true, snd: 'heavy' },
    spinkick: { pose: 'spinkick', start: 6, active: 4, rec: 15, dmg: 12, reach: 32, knock: true, snd: 'heavy' },
    hammer: { pose: 'hammerDown', wind: 'hammerUp', start: 9, active: 4, rec: 16, dmg: 15, reach: 27, knock: true, snd: 'heavy', shake: 4 },
    pipe: { pose: 'swingDown', wind: 'swingUp', start: 7, active: 4, rec: 10, dmg: 13, reach: 38, snd: 'hit' },
    machete: { pose: 'swingDown', wind: 'swingUp', start: 4, active: 3, rec: 6, dmg: 15, reach: 34, snd: 'hit' },
    chain: { pose: 'swingDown', wind: 'swingUp', start: 9, active: 6, rec: 12, dmg: 12, reach: 58, depth: 14, snd: 'hit' },
    chainSpin: { pose: 'spin', start: 6, active: 10, rec: 14, dmg: 14, reach: 52, depth: 16, knock: true, around: true, launch: true, snd: 'heavy' },
    launcher: { pose: 'upper', wind: 'crouch', start: 5, active: 4, rec: 9, dmg: 9, reach: 28, knock: true, launch: true, snd: 'heavy' },
    rampage: { reach: 24, dmg: 16, depth: 12, height: 44, knock: true, snd: 'heavy' },
    // wrogowie
    stab: { pose: 'stab', wind: 'crouch', start: 14, active: 4, rec: 22, dmg: 7, reach: 28, snd: 'hit' },
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
      mk: () => { const c = GRUNT_COLS[Math.random() * 2 | 0]; return build({ hair: 'mohawk', details: [{ t: 'vest', c: c.vest }, { t: 'belt', c: '#2a1a10' }], colors: c }); }
    },
    thin: {
      name: 'ĆWIEK', hp: 30, speed: 1.45, range: 24, score: 300, attacks: ['slash'], ai: 'thin',
      mk: () => build({ hair: 'hood', legU: 12.5, legL: 12.5, shoulderW: 10, hipW: 8, limbW: 4, armW: 3.4, head: 5.2,
        details: [{ t: 'stripe', c: '#e0c040' }],
        colors: { skin: '#c8a080', hair: '#5a3a7a', shirt: '#5a3a7a', pants: '#2a2a3a', boots: '#1a1a1a', gloves: '#2a2a3a' } })
    },
    brute: {
      name: 'GŁAZ', hp: 95, speed: 0.65, range: 30, score: 600, attacks: ['slap'], ai: 'brute',
      mk: () => build({ hair: 'bald', scale: 1.15, belly: 9, bellyCol: 'skin', shoulderW: 17, hipW: 14, limbW: 6.5, armW: 5.5, sleeveless: true,
        details: [{ t: 'vest', c: '#6a5a4a' }, { t: 'belt', c: '#2a1a10' }],
        colors: { skin: '#d09060', hair: '#d09060', shirt: '#6a5a4a', pants: '#3a3a4a', boots: '#1a1a1a', gloves: '#d09060' } })
    },
    bomber: {
      name: 'MIOTACZ', hp: 34, speed: 0.9, range: 26, score: 350, attacks: ['slash'], ai: 'bomber', weapon: 'dynamite',
      mk: () => build({ hair: 'cap', details: [{ t: 'bandolier', c: '#c0302a' }, { t: 'belt', c: '#2a1a10' }],
        colors: { skin: '#d0a078', hair: '#8a3a2a', shirt: '#c06a2a', pants: '#4a4a3a', boots: '#1a1a1a', gloves: '#3a2a1a', accent: '#8a3a2a' } })
    },
    gunner: {
      name: 'STRZELEC', hp: 38, speed: 0.85, range: 26, score: 400, attacks: ['slash'], ai: 'gunner', weapon: 'rifle',
      mk: () => build({ hair: 'cap', details: [{ t: 'pocket', c: '#3a4a2a' }, { t: 'belt', c: '#2a2a1a' }],
        colors: { skin: '#c89870', hair: '#3a4a2a', shirt: '#5a6a3a', pants: '#3a4030', boots: '#1a1a1a', gloves: '#2a2a1a', accent: '#3a4a2a' } })
    },
    shield: {
      name: 'TARCZOWNIK', hp: 55, speed: 0.7, range: 28, score: 500, attacks: ['slap'], ai: 'shield', weapon: 'shield', shield: true,
      mk: () => build({ hair: 'helmet', scale: 1.08, shoulderW: 14, hipW: 11, limbW: 5.5, armW: 4.6, details: [{ t: 'plate', c: '#5a6068' }, { t: 'belt', c: '#1a1a1a' }],
        colors: { skin: '#c89070', hair: '#4a5058', shirt: '#3a4a3a', pants: '#2a2e2a', boots: '#141414', gloves: '#2a2a2a', accent: '#ff9a2a' } })
    },
    sniper: {
      name: 'SNAJPER', hp: 30, speed: 0.8, range: 26, score: 600, attacks: ['slash'], ai: 'sniper', weapon: 'rifle',
      mk: () => build({ hair: 'cap', details: [{ t: 'bandolier', c: '#3a3a2a' }, { t: 'belt', c: '#1a1a1a' }],
        colors: { skin: '#b88a60', hair: '#2a2a2a', shirt: '#3a3e34', pants: '#2a2e28', boots: '#111', gloves: '#1a1a1a', accent: '#2a2a2a' } })
    },
    netter: {
      name: 'SIECIARZ', hp: 40, speed: 0.9, range: 26, score: 450, attacks: ['slash'], ai: 'netter',
      mk: () => build({ hair: 'hood', details: [{ t: 'bandolier', c: '#c8b080' }, { t: 'belt', c: '#2a1a10' }],
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

