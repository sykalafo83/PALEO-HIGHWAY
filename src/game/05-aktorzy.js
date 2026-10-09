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
    if (type !== 'dummy' && !app.seen[type]) { app.seen[type] = 1; safeSet('paleo_seen', JSON.stringify(app.seen)); }
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
    sfx('hit'); sfx('empty'); spark(t.x + t.face * 10, t.y, 30, false); G.hitstop = Math.max(G.hitstop, 3);
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
      sfx('hit'); sfx('empty'); spark(t.x + t.face * 10, t.y, 26, false); G.hitstop = 3;
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
    if (t.kind === 'player') { if (dmg >= 8 && Math.random() < 0.5) shout(t, 'hurt'); else sfx('pHurt'); rumble(t.pIdx, Math.min(1, 0.3 + dmg / 25), 0.5, 120 + dmg * 6); }
    else if (src && src.kind === 'player' && dmg > 0) rumble(src.pIdx, knock ? 0.35 : 0, knock ? 0.5 : 0.28, knock ? 90 : 45);
    else if (t.kind === 'raptor' || t.kind === 'pachy') { if (Math.random() < 0.5) sfx('screech'); }
    else if (t.kind === 'rex') { if (Math.random() < 0.3) sfx('roar'); }
    else if (Math.random() < 0.6) sfx('eHurt');
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
  function onDeath(t, src) {
    if (t.dying) return;
    t.dying = true;
    if (G.ch && t.team !== 'player' && t.lastThrow) G.ch.throws++;
    if (t.kind === 'player') { sfx('ko'); return; }
    sfx(t.kind === 'raptor' || t.kind === 'pachy' ? 'screech' : t.kind === 'rex' ? 'roar' : 'eDie');
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
    if (app.ach[id] || (app.gameMode === 'custom' && G && ST && ST.custom)) return;   // własne etapy nie dają osiągnięć
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

