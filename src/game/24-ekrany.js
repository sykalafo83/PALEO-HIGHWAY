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
  AU.play = name => { if (!app.heard[name]) { app.heard[name] = 1; safeSet('paleo_heard', JSON.stringify(app.heard)); } _play(name); };
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
