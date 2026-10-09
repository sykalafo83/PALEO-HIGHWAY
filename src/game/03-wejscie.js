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
    goMap(idx + 1, team);
  }
  function nextLabel(idx) {
    if (idx === 1) return 'WYBÓR TRASY: MIASTO LUB KOPALNIA';
    if (idx === 2 || idx === 3) return 'ETAP BONUSOWY — AUTOSTRADA 7';
    if (idx === 4) return 'ETAP BONUSOWY — ZAGRODA';
    if (idx === 5) return 'ETAP BONUSOWY — LOT NAD ZATOKĄ';
    return STAGES[idx + 1] ? shortName(STAGES[idx + 1]) : '';
  }
  const bonus = window.BonusStage({ W, H, ctx, text, sfx, held, pressed, AU, rumble: (a, b, ms) => rumbleAll(a, b, ms) });
  const flight = window.FlightStage({ W, H, ctx, text, sfx, held, pressed, AU, rumble: (a, b, ms) => rumbleAll(a, b, ms) });
  const curBonus = () => app.bonusKind === 'flight' ? flight : bonus;

