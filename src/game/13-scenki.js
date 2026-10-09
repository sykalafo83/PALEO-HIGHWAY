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

