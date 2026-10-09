/* PALEO HIGHWAY — edytor etapów.
 * Etap to czyste dane (fale, beczki, przedmioty, pojazdy) na tle jednego z sześciu etapów gry.
 * Biblioteka: localStorage „paleo_custom” (gra czyta ją w EKSTRA → WŁASNE ETAPY),
 * eksport: js/stages/custom.js (window.CUSTOM_STAGES.push({...})).
 */
(function () {
  'use strict';
  const SC = window.Scenery, SP = window.Sprites, STAGES = window.STAGES;
  const { W, H, FLOOR_TOP, FLOOR_BOTTOM } = SC;
  const $ = id => document.getElementById(id);
  const LABELS = ['1', '2', '3A', '3B', '4', '5', '6', '7'];
  const THEMES = STAGES.map((s, i) => LABELS[i] + ' — ' + s.name.replace(/^ETAP \S+ — /, ''));
  const ENEMIES = [
    ['grunt', 'SZAKAL', 'h'], ['thin', 'ĆWIEK', 'h'], ['brute', 'GŁAZ', 'h'], ['bomber', 'MIOTACZ', 'h'], ['gunner', 'STRZELEC', 'h'],
    ['shield', 'TARCZOWNIK', 'h'], ['sniper', 'SNAJPER', 'h'], ['netter', 'SIECIARZ', 'h'],
    ['raptor', 'RAPTOR', 'b'], ['pachy', 'PACHY', 'b'], ['trike', 'TRICERATOPS', 'b'], ['para', 'PARAZAUROLOF', 'b'], ['ptera', 'PTERANODON', 'b'],
    ['whitefang', 'BIAŁY KIEŁ (MINI-BOSS)', 'm'],
    ['boss', 'KAPITAN RDZA', 'B'], ['zmija', 'ŻMIJA', 'B'], ['klin', 'KLIN', 'B'], ['klamra', 'KLAMRA', 'B'], ['rex', 'STARY KIEŁ', 'B'],
    ['szpon', 'ADMIRAŁ SZPON', 'B'], ['padliniarz', 'PADLINIARZ', 'B'], ['deino', 'ZĘBACZ', 'B'], ['baron', 'BARON BURSZTYN', 'B']
  ];
  const EN = Object.fromEntries(ENEMIES.map(e => [e[0], e]));
  const CAT_COL = { h: '#e05a4a', b: '#5ac05a', m: '#e0e0e0', B: '#ffc030' };
  const ITEMS = [['meat', 'MIĘSO'], ['fruit', 'OWOC'], ['gem', 'KLEJNOT'], ['coin', 'MONETA'], ['pipe', 'RURA'], ['rifle', 'STRZELBA'],
    ['dynamite', 'DYNAMIT'], ['grenade', 'GRANAT'], ['1up', 'ŻYCIE'], ['amber', 'BURSZTYN']];
  const PROP_KINDS = [['barrel', 'BECZKA'], ['crate', 'SKRZYNIA'], ['fuel', 'PALIWO (WYBUCHA)'], ['wall', 'ŚCIANA (SEKRET)']];
  const SECRETS = [['treasure', 'SKARB'], ['treasure1up', 'SKARB + ŻYCIE'], ['boss', 'BIAŁY KIEŁ']];
  const WEATHER = [['', 'BEZ ZMIAN'], ['dawn', 'ŚWIT', '#f8c8c0'], ['sunset', 'ZACHÓD SŁOŃCA', '#ffa070'], ['dusk', 'ZMIERZCH', '#8890c8'],
    ['mist', 'MGŁA', '#c8d4d0'], ['sand', 'BURZA PIASKOWA', '#e8c890'], ['ash', 'DESZCZ POPIOŁU', '#b8a8a8'], ['rain', 'DESZCZ', '#a0a8c0']];
  const SONGS = (window.GameAudio ? window.GameAudio.SONG_NAMES : ['stage1', 'boss']).filter(k => !['clear', 'gameover', 'ending'].includes(k));
  const TOOLS = [['select', 'Zaznacz'], ['barrel', 'Beczka'], ['crate', 'Skrzynia'], ['fuel', 'Paliwo'], ['wall', 'Ściana'], ['item', 'Przedmiot'], ['jeep', 'Jeep'], ['cart', 'Wagonik'], ['enemy', 'Wróg w fali']];

  const view = $('view'), ctx = view.getContext('2d'), mini = $('mini'), mctx = mini.getContext('2d');
  let st = null, sel = null, camX = 0, tool = 'select', drag = null, frame = 0, undo = [], dirty = false;
  let enemyType = 'grunt', itemType = 'coin';

  // ------------------------------------------------------------ dane
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const library = () => { const l = load('paleo_custom', []); return Array.isArray(l) ? l : []; };
  const slug = s => (String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'etap');
  function blank() {
    return { id: 'etap-' + Date.now().toString(36), name: 'MÓJ ETAP', sub: 'WŁASNA TRASA', theme: 0, LEN: 2400, music: 'stage1', bossMusic: 'boss', diff: 1, weather: '',
      WAVES: [], PROPS: [], PICKUPS: [], VEHICLES: [] };
  }
  function norm(d) {
    const b = blank();
    d = Object.assign(b, d || {});
    ['WAVES', 'PROPS', 'PICKUPS', 'VEHICLES'].forEach(k => { if (!Array.isArray(d[k])) d[k] = []; });
    d.WAVES.forEach(w => { if (!Array.isArray(w.groups) || !w.groups.length) w.groups = [{ when: 0, spawns: [] }]; w.groups.forEach(g => { g.spawns = g.spawns || []; g.when = g.when | 0; }); });
    d.theme = Math.max(0, Math.min(STAGES.length - 1, d.theme | 0));
    d.LEN = Math.max(800, Math.min(maxLen(d.theme), d.LEN | 0 || 2400));
    return d;
  }
  const maxLen = t => STAGES[t].LEN;
  function snapshot() { undo.push(JSON.stringify(st)); if (undo.length > 80) undo.shift(); dirty = true; }
  function changed() { save('paleo_editor_draft', st); refreshPanels(); }

  // ------------------------------------------------------------ rysowanie
  function draw() {
    frame++;
    const S = STAGES[st.theme], L = S.buildLayers();
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    S.drawBack(ctx, L, camX, frame);
    const wx = WEATHER.find(w => w[0] === st.weather);
    if (wx && wx[2]) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = wx[2]; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
    // podłoga — pas, po którym chodzą postaci
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, FLOOR_TOP, W, FLOOR_BOTTOM - FLOOR_TOP);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(0, FLOOR_TOP + 0.5); ctx.lineTo(W, FLOOR_TOP + 0.5); ctx.moveTo(0, FLOOR_BOTTOM + 0.5); ctx.lineTo(W, FLOOR_BOTTOM + 0.5); ctx.stroke();
    ctx.setLineDash([]);
    // obiekty od tyłu do przodu
    const ents = [];
    st.PROPS.forEach(o => ents.push({ y: o.y, o, k: 'prop' }));
    st.PICKUPS.forEach(o => ents.push({ y: o.y - 0.5, o, k: 'item' }));
    st.VEHICLES.forEach(o => ents.push({ y: o.y, o, k: 'veh' }));
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) {
      const x = e.o.x - camX;
      if (x < -60 || x > W + 60) continue;
      if (e.k === 'prop') {
        SP.drawBarrel(ctx, x, e.o.y, 99, e.o.kind);
        if (e.o.kind === 'wall') tag(x, e.o.y - 50, (SECRETS.find(s => s[0] === (e.o.secret || 'treasure')) || SECRETS[0])[1], '#ffe080');
        else if (e.o.drop) tag(x, e.o.y - 30, '→ ' + (ITEMS.find(i => i[0] === e.o.drop) || [0, e.o.drop])[1], '#c0e0ff');
      } else if (e.k === 'item') SP.drawItem(ctx, e.o.type, x, e.o.y, frame);
      else if (e.o.type === 'jeep') SP.drawJeep(ctx, x, e.o.y, -1, 0, {});
      else SC.minecart(ctx, x, e.o.y);
    }
    S.drawFront(ctx, L, camX, frame);
    // koniec etapu
    const endX = st.LEN - camX;
    if (endX < W) { ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(endX, 0, W - endX, H); tag(endX - 4, 20, 'KONIEC ETAPU', '#ff9a80', 'right'); }
    // fale
    st.WAVES.forEach((w, i) => drawWave(w, i));
    // zaznaczenie
    const sb = sel && boxOf(sel);
    if (sb) { ctx.strokeStyle = '#ffe040'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.strokeRect(sb.x - camX + 0.5, sb.y + 0.5, sb.w, sb.h); ctx.setLineDash([]); }
    ctx.restore();
    drawMini();
    requestAnimationFrame(draw);
  }
  function tag(x, y, s, col, align) {
    ctx.font = '5px "Press Start 2P", monospace'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'top';
    const w = ctx.measureText(s).width, x0 = align === 'right' ? x - w : align === 'left' ? x : x - w / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x0 - 2, y - 2, w + 4, 9);
    ctx.fillStyle = col; ctx.fillText(s, x, y);
  }
  function spawnPos(w, gi, si) {
    let k = 0;
    for (let g = 0; g < w.groups.length; g++) for (let s = 0; s < w.groups[g].spawns.length; s++) {
      const sp = w.groups[g].spawns[s];
      if (g === gi && s === si) return { x: sp.side === 'L' ? w.lock + 16 + (k % 6) * 12 : w.lock + W - 16 - (k % 6) * 12, y: sp.y };
      if (sp.side === w.groups[gi].spawns[si].side) k++;
    }
    return { x: w.lock, y: 180 };
  }
  function drawWave(w, i) {
    const x = w.lock - camX, selW = sel && sel.k === 'wave' && sel.i === i;
    if (x > W || x + W < 0) return;
    const boss = w.groups.some(g => g.spawns.some(s => EN[s.type] && EN[s.type][2] === 'B'));
    ctx.strokeStyle = selW ? '#ffe040' : boss ? 'rgba(255,190,60,0.8)' : 'rgba(120,200,255,0.7)'; ctx.lineWidth = selW ? 2 : 1;
    ctx.strokeRect(x + 1, 1, W - 2, H - 2);
    tag(x + 4, 4, 'FALA ' + (i + 1) + (boss ? ' — BOSS' : '') + '  X=' + w.lock, selW ? '#ffe040' : boss ? '#ffc030' : '#80d0ff', 'left');
    w.groups.forEach((g, gi) => g.spawns.forEach((sp, si) => {
      const p = spawnPos(w, gi, si), e = EN[sp.type] || [sp.type, sp.type, 'h'], sx = p.x - camX;
      const isSel = sel && sel.k === 'spawn' && sel.i === i && sel.g === gi && sel.s === si;
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(sx, sp.y, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000'; ctx.fillRect(sx - 6, sp.y - 22, 12, 20);
      ctx.fillStyle = CAT_COL[e[2]]; ctx.fillRect(sx - 5, sp.y - 21, 10, 18);
      ctx.fillStyle = '#000'; ctx.font = '5px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(e[1].slice(0, 2), sx, sp.y - 15);
      ctx.fillStyle = '#fff'; ctx.fillText(sp.side === 'L' ? '◄' : '►', sx, sp.y - 29);
      if (gi > 0) { ctx.fillStyle = '#ffe080'; ctx.fillText(String(gi + 1), sx + 8, sp.y - 21); }
      if (isSel) { ctx.strokeStyle = '#ffe040'; ctx.strokeRect(sx - 7.5, sp.y - 23.5, 15, 23); tag(sx, sp.y - 40, e[1], '#fff'); }
    }));
  }
  function drawMini() {
    const w = mini.width, h = mini.height, k = w / st.LEN;
    mctx.fillStyle = '#0e0814'; mctx.fillRect(0, 0, w, h);
    st.WAVES.forEach(wv => {
      const boss = wv.groups.some(g => g.spawns.some(s => EN[s.type] && EN[s.type][2] === 'B'));
      mctx.fillStyle = boss ? 'rgba(255,190,60,0.35)' : 'rgba(120,200,255,0.25)'; mctx.fillRect(wv.lock * k, 2, W * k, h - 4);
      mctx.fillStyle = boss ? '#ffc030' : '#80d0ff'; mctx.fillRect(wv.lock * k, 2, 2, h - 4);
    });
    st.PROPS.forEach(o => { mctx.fillStyle = o.kind === 'fuel' ? '#ff5030' : o.kind === 'wall' ? '#e0e0e0' : '#b07a40'; mctx.fillRect(o.x * k - 1, (o.y - FLOOR_TOP) / (FLOOR_BOTTOM - FLOOR_TOP) * (h - 8) + 4, 3, 3); });
    st.PICKUPS.forEach(o => { mctx.fillStyle = '#ffe040'; mctx.fillRect(o.x * k - 1, h - 6, 2, 2); });
    st.VEHICLES.forEach(o => { mctx.fillStyle = '#7cff7c'; mctx.fillRect(o.x * k - 2, h - 8, 4, 3); });
    mctx.strokeStyle = '#fff'; mctx.strokeRect(camX * k + 0.5, 0.5, W * k, h - 1);
  }

  // ------------------------------------------------------------ zaznaczanie
  function boxOf(s) {
    if (s.k === 'prop') { const o = st.PROPS[s.i]; if (!o) return null; return o.kind === 'wall' ? { x: o.x - 22, y: o.y - 46, w: 44, h: 48 } : { x: o.x - 12, y: o.y - 26, w: 24, h: 28 }; }
    if (s.k === 'item') { const o = st.PICKUPS[s.i]; return o && { x: o.x - 8, y: o.y - 12, w: 16, h: 14 }; }
    if (s.k === 'veh') { const o = st.VEHICLES[s.i]; return o && { x: o.x - 30, y: o.y - 30, w: 60, h: 32 }; }
    return null;
  }
  function hit(mx, my) {
    const wx = mx + camX;
    // wrogowie w falach
    for (let i = st.WAVES.length - 1; i >= 0; i--) {
      const w = st.WAVES[i];
      for (let g = 0; g < w.groups.length; g++) for (let s = 0; s < w.groups[g].spawns.length; s++) {
        const p = spawnPos(w, g, s);
        if (Math.abs(wx - p.x) <= 7 && my <= p.y && my >= p.y - 24) return { k: 'spawn', i, g, s };
      }
    }
    const lists = [['veh', st.VEHICLES], ['item', st.PICKUPS], ['prop', st.PROPS]];
    for (const [k, list] of lists) for (let i = list.length - 1; i >= 0; i--) {
      const b = boxOf({ k, i });
      if (b && wx >= b.x && wx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return { k, i };
    }
    // nagłówek fali
    for (let i = st.WAVES.length - 1; i >= 0; i--) { const x = st.WAVES[i].lock; if (wx >= x && wx <= x + 150 && my < 14) return { k: 'wave', i }; }
    return null;
  }
  const clampY = y => Math.max(FLOOR_TOP + 6, Math.min(FLOOR_BOTTOM - 2, Math.round(y)));
  const clampX = x => Math.max(20, Math.min(st.LEN - 20, Math.round(x)));
  function toLogical(e) { const r = view.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
  function waveAt(x) { let best = -1; st.WAVES.forEach((w, i) => { if (x >= w.lock && x <= w.lock + W) best = i; }); return best; }

  view.addEventListener('pointerdown', e => {
    const m = toLogical(e), h = hit(m.x, m.y);
    view.setPointerCapture(e.pointerId);
    if (h && (tool === 'select' || h.k !== 'wave')) {
      sel = h; snapshot(); drag = { sx: m.x, sy: m.y, moved: false };
      if (h.k === 'wave') drag.lock0 = st.WAVES[h.i].lock;
      refreshPanels(); return;
    }
    const x = clampX(m.x + camX), y = clampY(m.y);
    if (['barrel', 'crate', 'fuel', 'wall'].includes(tool)) {
      snapshot(); st.PROPS.push(tool === 'wall' ? { x, y: Math.min(y, FLOOR_TOP + 8), kind: 'wall', secret: 'treasure' } : { x, y, kind: tool, drop: tool === 'fuel' ? '' : 'meat' });
      sel = { k: 'prop', i: st.PROPS.length - 1 };
    } else if (tool === 'item') { snapshot(); st.PICKUPS.push({ x, y, type: itemType }); sel = { k: 'item', i: st.PICKUPS.length - 1 }; }
    else if (tool === 'jeep' || tool === 'cart') { snapshot(); st.VEHICLES.push({ x, y, type: tool }); sel = { k: 'veh', i: st.VEHICLES.length - 1 }; }
    else if (tool === 'enemy') {
      let wi = waveAt(x);
      if (wi < 0) { toast('Najpierw dodaj falę w tym miejscu („+ Fala w bieżącym widoku”).'); return; }
      snapshot();
      const w = st.WAVES[wi], side = (x - w.lock) < W / 2 ? 'L' : 'R';
      const g = w.groups[w.groups.length - 1];
      g.spawns.push({ type: enemyType, side, y, delay: g.spawns.length ? g.spawns.length * 30 : 0 });
      sel = { k: 'spawn', i: wi, g: w.groups.length - 1, s: g.spawns.length - 1 };
    } else { sel = null; }
    changed();
  });
  view.addEventListener('pointermove', e => {
    const m = toLogical(e);
    view.style.cursor = drag ? 'grabbing' : hit(m.x, m.y) ? 'grab' : tool === 'select' ? 'default' : 'crosshair';
    if (!drag || !sel) return;
    drag.moved = true;
    if (sel.k === 'spawn') { const sp = st.WAVES[sel.i].groups[sel.g].spawns[sel.s]; sp.y = clampY(m.y); const w = st.WAVES[sel.i]; sp.side = (m.x + camX - w.lock) < W / 2 ? 'L' : 'R'; }
    else if (sel.k === 'wave') { st.WAVES[sel.i].lock = Math.max(0, Math.min(st.LEN - W, Math.round(drag.lock0 + m.x - drag.sx))); }
    else {
      const list = sel.k === 'prop' ? st.PROPS : sel.k === 'item' ? st.PICKUPS : st.VEHICLES, o = list[sel.i];
      o.x = clampX(m.x + camX); o.y = o.kind === 'wall' ? Math.min(clampY(m.y + 20), FLOOR_TOP + 8) : clampY(m.y + (sel.k === 'prop' ? 10 : 4));
    }
  });
  view.addEventListener('pointerup', () => { if (drag) { if (!drag.moved) undo.pop(); drag = null; changed(); } });
  view.addEventListener('wheel', e => { e.preventDefault(); setCam(camX + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 0.6); }, { passive: false });
  mini.addEventListener('pointerdown', e => {
    const go = ev => { const r = mini.getBoundingClientRect(); setCam((ev.clientX - r.left) / r.width * st.LEN - W / 2); };
    go(e); mini.setPointerCapture(e.pointerId);
    const mv = ev => go(ev), up = () => { mini.removeEventListener('pointermove', mv); mini.removeEventListener('pointerup', up); };
    mini.addEventListener('pointermove', mv); mini.addEventListener('pointerup', up);
  });
  function setCam(x) { camX = Math.max(0, Math.min(st.LEN - W, Math.round(x))); $('scroll').value = camX; }
  $('scroll').addEventListener('input', e => setCam(+e.target.value));
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') { if (e.key === 'Enter') e.target.blur(); return; }
    if (e.key === 'ArrowRight') setCam(camX + (e.shiftKey ? 192 : 32));
    else if (e.key === 'ArrowLeft') setCam(camX - (e.shiftKey ? 192 : 32));
    else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); removeSel(); }
    else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); doUndo(); }
    else if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveLib(); }
    else if (e.key === 'Escape') { sel = null; refreshPanels(); }
    else return;
  });
  function removeSel() {
    if (!sel) return;
    snapshot();
    if (sel.k === 'prop') st.PROPS.splice(sel.i, 1);
    else if (sel.k === 'item') st.PICKUPS.splice(sel.i, 1);
    else if (sel.k === 'veh') st.VEHICLES.splice(sel.i, 1);
    else if (sel.k === 'wave') st.WAVES.splice(sel.i, 1);
    else if (sel.k === 'spawn') st.WAVES[sel.i].groups[sel.g].spawns.splice(sel.s, 1);
    sel = null; changed();
  }
  function doUndo() { if (!undo.length) { toast('Nie ma czego cofnąć.'); return; } st = JSON.parse(undo.pop()); sel = null; fillSettings(); changed(); }

  // ------------------------------------------------------------ panele
  const opt = (list, v) => list.map(([k, n]) => `<option value="${k}"${k === v ? ' selected' : ''}>${n}</option>`).join('');
  const enemyOpts = v => ['<optgroup label="Kłusownicy">', opt(ENEMIES.filter(e => e[2] === 'h'), v), '</optgroup><optgroup label="Dinozaury">',
    opt(ENEMIES.filter(e => e[2] === 'b' || e[2] === 'm'), v), '</optgroup><optgroup label="Bossowie">', opt(ENEMIES.filter(e => e[2] === 'B'), v), '</optgroup>'].join('');
  function refreshPanels() { drawProps(); drawWaves(); drawCheck(); }
  function drawProps() {
    const P = $('props');
    if (!sel) {
      P.innerHTML = tool === 'enemy' ? `<div class="row"><span>Nowy wróg</span><select id="pEnemy">${enemyOpts(enemyType)}</select></div><div class="hint">Kliknij w ramce fali — lewa połowa = wejście z lewej.</div>`
        : tool === 'item' ? `<div class="row"><span>Przedmiot</span><select id="pItem">${opt(ITEMS, itemType)}</select></div>`
          : '<div class="hint">Nic nie zaznaczono. Wybierz narzędzie pod podglądem i kliknij na planszy.</div>';
      if ($('pEnemy')) $('pEnemy').onchange = e => { enemyType = e.target.value; };
      if ($('pItem')) $('pItem').onchange = e => { itemType = e.target.value; };
      return;
    }
    if (sel.k === 'wave' || sel.k === 'spawn') { drawWaveProps(P, sel.i); return; }
    const list = sel.k === 'prop' ? st.PROPS : sel.k === 'item' ? st.PICKUPS : st.VEHICLES, o = list[sel.i];
    if (!o) { sel = null; drawProps(); return; }
    let h = `<div class="row"><span>X</span><input type="number" data-f="x" value="${o.x}"><span style="min-width:0">Y</span><input type="number" data-f="y" value="${o.y}"></div>`;
    if (sel.k === 'prop') {
      h += `<div class="row"><span>Rodzaj</span><select data-f="kind">${opt(PROP_KINDS, o.kind)}</select></div>`;
      if (o.kind === 'wall') h += `<div class="row"><span>Sekret</span><select data-f="secret">${opt(SECRETS, o.secret || 'treasure')}</select></div>`;
      else if (o.kind !== 'fuel') h += `<div class="row"><span>Łup</span><select data-f="drop">${opt([['', '— BRAK —']].concat(ITEMS), o.drop || '')}</select></div>`;
      else h += '<div class="hint">Beczka z paliwem wybucha po trafieniu i odpala sąsiednie.</div>';
    } else if (sel.k === 'item') h += `<div class="row"><span>Przedmiot</span><select data-f="type">${opt(ITEMS, o.type)}</select></div>`;
    else h += `<div class="row"><span>Pojazd</span><select data-f="type">${opt([['jeep', 'JEEP'], ['cart', 'WAGONIK']], o.type)}</select></div>`;
    h += '<div class="row"><button class="danger" id="pDel">Usuń (Delete)</button></div>';
    P.innerHTML = h;
    P.querySelectorAll('[data-f]').forEach(inp => inp.onchange = () => {
      snapshot(); const f = inp.dataset.f;
      o[f] = inp.type === 'number' ? (f === 'x' ? clampX(+inp.value) : clampY(+inp.value)) : inp.value;
      if (f === 'kind' && o.kind === 'wall') { o.secret = o.secret || 'treasure'; delete o.drop; o.y = Math.min(o.y, FLOOR_TOP + 8); }
      changed();
    });
    $('pDel').onclick = removeSel;
  }
  function drawWaveProps(P, i) {
    const w = st.WAVES[i];
    if (!w) { sel = null; drawProps(); return; }
    let h = `<div class="row"><b>FALA ${i + 1}</b><span style="min-width:0">blokada X</span><input type="number" id="wLock" value="${w.lock}" step="10"><button id="wGo">Pokaż</button></div>`;
    w.groups.forEach((g, gi) => {
      h += `<div class="group"><div class="row"><b>Grupa ${gi + 1}</b>` + (gi ? `<span style="min-width:0">wchodzi, gdy zostanie ≤</span><input type="number" min="0" max="9" data-when="${gi}" value="${g.when}" style="width:48px"> wrogów` : '<span style="min-width:0">wchodzi od razu</span>') +
        `${gi ? `<button class="danger" data-delg="${gi}" title="Usuń grupę">×</button>` : ''}</div>`;
      h += '<div class="spawn" style="color:var(--mute);font-size:11px"><span>typ</span><span>strona</span><span>Y</span><span>opóźn.</span><span></span></div>';
      g.spawns.forEach((sp, si) => {
        const isSel = sel.k === 'spawn' && sel.g === gi && sel.s === si;
        h += `<div class="spawn"${isSel ? ' style="outline:1px solid var(--acc)"' : ''}><select data-sp="${gi}:${si}:type">${enemyOpts(sp.type)}</select>
          <select data-sp="${gi}:${si}:side">${opt([['L', 'L'], ['R', 'P']], sp.side)}</select>
          <input type="number" data-sp="${gi}:${si}:y" value="${sp.y}" min="${FLOOR_TOP + 6}" max="${FLOOR_BOTTOM - 2}">
          <input type="number" data-sp="${gi}:${si}:delay" value="${sp.delay || 0}" min="0" step="10" title="opóźnienie w klatkach (60 = 1 s)">
          <button class="danger" data-dels="${gi}:${si}" title="Usuń">×</button></div>`;
      });
      h += `<div class="row"><select data-addt="${gi}">${enemyOpts(enemyType)}</select><button data-add="${gi}">+ wróg</button></div></div>`;
    });
    h += '<div class="row"><button id="wAddG">+ grupa</button><button class="danger" id="wDel">Usuń falę</button></div>';
    h += '<div class="hint">Grupa 1 wchodzi, gdy kamera dojdzie do blokady. Kolejne — gdy na planszy zostanie podana liczba wrogów. Fala z bossem kończy etap po jego pokonaniu.</div>';
    P.innerHTML = h;
    $('wLock').onchange = e => { snapshot(); w.lock = Math.max(0, Math.min(st.LEN - W, Math.round(+e.target.value))); changed(); };
    $('wGo').onclick = () => setCam(w.lock);
    $('wAddG').onclick = () => { snapshot(); w.groups.push({ when: 1, spawns: [] }); changed(); };
    $('wDel').onclick = () => { sel = { k: 'wave', i }; removeSel(); };
    P.querySelectorAll('[data-when]').forEach(inp => inp.onchange = () => { snapshot(); w.groups[+inp.dataset.when].when = Math.max(0, Math.min(9, inp.value | 0)); changed(); });
    P.querySelectorAll('[data-delg]').forEach(b => b.onclick = () => { snapshot(); w.groups.splice(+b.dataset.delg, 1); sel = { k: 'wave', i }; changed(); });
    P.querySelectorAll('[data-dels]').forEach(b => b.onclick = () => { const [gi, si] = b.dataset.dels.split(':').map(Number); snapshot(); w.groups[gi].spawns.splice(si, 1); sel = { k: 'wave', i }; changed(); });
    P.querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
      const gi = +b.dataset.add, g = w.groups[gi], type = P.querySelector(`[data-addt="${gi}"]`).value; enemyType = type;
      snapshot(); g.spawns.push({ type, side: g.spawns.length % 2 ? 'L' : 'R', y: 170 + (g.spawns.length * 13) % 40, delay: g.spawns.length * 30 });
      sel = { k: 'spawn', i, g: gi, s: g.spawns.length - 1 }; changed();
    });
    P.querySelectorAll('[data-sp]').forEach(inp => inp.onchange = () => {
      const [gi, si, f] = inp.dataset.sp.split(':'), sp = w.groups[+gi].spawns[+si];
      snapshot(); sp[f] = f === 'y' ? clampY(+inp.value) : f === 'delay' ? Math.max(0, inp.value | 0) : inp.value; changed();
    });
  }
  function drawWaves() {
    const U = $('waves');
    U.innerHTML = st.WAVES.map((w, i) => {
      const n = w.groups.reduce((a, g) => a + g.spawns.length, 0), boss = w.groups.some(g => g.spawns.some(s => EN[s.type] && EN[s.type][2] === 'B'));
      const on = sel && (sel.k === 'wave' || sel.k === 'spawn') && sel.i === i;
      return `<li data-i="${i}" class="${on ? 'sel' : ''}">Fala ${i + 1} · X ${w.lock} · wrogów ${n}${boss ? ' · <span class="boss">BOSS</span>' : ''}</li>`;
    }).join('') || '<li class="hint">Brak fal.</li>';
    U.querySelectorAll('li[data-i]').forEach(li => li.onclick = () => { const i = +li.dataset.i; sel = { k: 'wave', i }; setCam(st.WAVES[i].lock); refreshPanels(); });
  }
  function drawCheck() {
    const msgs = [], waves = st.WAVES.slice().sort((a, b) => a.lock - b.lock);
    if (!waves.length) msgs.push('Brak fal — etap będzie pusty.');
    const bossW = waves.filter(w => w.groups.some(g => g.spawns.some(s => EN[s.type] && EN[s.type][2] === 'B')));
    if (!bossW.length) msgs.push('Brak bossa — etap skończy się po ostatniej fali, gdy dojdziesz do końca planszy.');
    if (bossW.length && bossW[bossW.length - 1] !== waves[waves.length - 1]) msgs.push('Po fali z bossem są jeszcze fale — boss kończy etap, więc nie zostaną rozegrane.');
    waves.forEach((w, i) => { if (!w.groups.some(g => g.spawns.length)) msgs.push(`Fala ${st.WAVES.indexOf(w) + 1} jest pusta.`); if (i && w.lock - waves[i - 1].lock < 120) msgs.push(`Fale ${st.WAVES.indexOf(waves[i - 1]) + 1} i ${st.WAVES.indexOf(w) + 1} są bardzo blisko.`); });
    const total = waves.reduce((a, w) => a + w.groups.reduce((b, g) => b + g.spawns.length, 0), 0);
    $('check').innerHTML = msgs.map(m => `<div class="warn">⚠ ${m}</div>`).join('') +
      `<div class="okmsg">${msgs.length ? '' : '✓ Wszystko gotowe. '}Wrogów: ${total} · beczek: ${st.PROPS.length} · przedmiotów: ${st.PICKUPS.length}</div>` +
      (dirty ? '<div class="hint">Niezapisane zmiany (szkic jest przechowywany automatycznie).</div>' : '');
  }
  $('tools').innerHTML = TOOLS.map(([k, n]) => `<button data-tool="${k}"${k === tool ? ' class="on"' : ''}>${n}</button>`).join('');
  $('tools').querySelectorAll('button').forEach(b => b.onclick = () => {
    tool = b.dataset.tool; $('tools').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    if (tool !== 'select') sel = null; refreshPanels();
  });
  $('bWave').onclick = () => {
    snapshot();
    const lock = Math.max(0, Math.min(st.LEN - W, camX));
    st.WAVES.push({ lock, groups: [{ when: 0, spawns: [{ type: enemyType, side: 'R', y: 180, delay: 0 }] }] });
    st.WAVES.sort((a, b) => a.lock - b.lock);
    sel = { k: 'wave', i: st.WAVES.findIndex(w => w.lock === lock) }; changed();
  };

  // ------------------------------------------------------------ ustawienia
  $('sTheme').innerHTML = THEMES.map((n, i) => `<option value="${i}">${n}</option>`).join('');
  $('sMusic').innerHTML = $('sBossMusic').innerHTML = SONGS.map(k => `<option>${k}</option>`).join('');
  $('sWeather').innerHTML = opt(WEATHER.map(w => [w[0], w[1]]), '');
  function fillSettings() {
    $('sName').value = st.name; $('sSub').value = st.sub; $('sTheme').value = st.theme;
    $('sLen').max = $('sLenN').max = maxLen(st.theme); $('sLen').value = $('sLenN').value = st.LEN;
    $('sMusic').value = st.music; $('sBossMusic').value = st.bossMusic; $('sDiff').value = st.diff; $('sWeather').value = st.weather || '';
    $('scroll').max = Math.max(0, st.LEN - W); setCam(camX);
    const L = library();
    $('lib').innerHTML = '<option value="">— wybierz —</option>' + L.map(d => `<option value="${d.id}"${d.id === st.id ? ' selected' : ''}>${d.name}</option>`).join('');
  }
  const bind = (id, f, conv) => $(id).addEventListener('change', e => { snapshot(); st[f] = conv ? conv(e.target.value) : e.target.value; afterSetting(); });
  function afterSetting() {
    st.LEN = Math.max(800, Math.min(maxLen(st.theme), st.LEN | 0));
    st.WAVES.forEach(w => { w.lock = Math.min(w.lock, st.LEN - W); });
    [st.PROPS, st.PICKUPS, st.VEHICLES].forEach(l => l.forEach(o => { o.x = Math.min(o.x, st.LEN - 20); }));
    fillSettings(); changed();
  }
  bind('sName', 'name', v => v.toUpperCase()); bind('sSub', 'sub', v => v.toUpperCase()); bind('sTheme', 'theme', v => +v);
  bind('sLen', 'LEN', v => +v); bind('sLenN', 'LEN', v => +v); bind('sMusic', 'music'); bind('sBossMusic', 'bossMusic');
  bind('sDiff', 'diff', v => Math.max(0.6, Math.min(2.2, +v || 1))); bind('sWeather', 'weather');
  $('sLen').addEventListener('input', e => { $('sLenN').value = e.target.value; });

  // ------------------------------------------------------------ biblioteka, test, eksport
  function clean(d) { const c = JSON.parse(JSON.stringify(d)); delete c._src; return c; }
  function saveLib(quiet) {
    if (!st.name.trim()) st.name = 'MÓJ ETAP';
    const L = library(), i = L.findIndex(d => d.id === st.id);
    if (i >= 0) L[i] = clean(st); else L.push(clean(st));
    if (!save('paleo_custom', L)) { toast('Nie udało się zapisać (pamięć przeglądarki niedostępna).'); return false; }
    dirty = false; fillSettings(); refreshPanels();
    if (!quiet) toast('Zapisano „' + st.name + '” — w grze: EKSTRA → WŁASNE ETAPY.');
    return true;
  }
  function download(name, text, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function exportJs(list) {
    return '/* Własne etapy — wygenerowane w edytorze PALEO HIGHWAY (' + new Date().toLocaleString('pl-PL') + ').\n' +
      ' * Zapisz jako js/stages/custom.js — etapy pojawią się w grze: EKSTRA → WŁASNE ETAPY.\n */\n' +
      'window.CUSTOM_STAGES = window.CUSTOM_STAGES || [];\n' + list.map(d => 'window.CUSTOM_STAGES.push(' + JSON.stringify(clean(d), null, 2) + ');\n').join('');
  }
  function parseImport(txt) {
    txt = txt.trim();
    if (txt.startsWith('{') || txt.startsWith('[')) { const v = JSON.parse(txt); return Array.isArray(v) ? v : [v]; }
    return txt.split('window.CUSTOM_STAGES.push(').slice(1).map(ch => JSON.parse(ch.slice(0, ch.lastIndexOf(')'))));
  }
  $('bNew').onclick = () => { if (dirty && !confirm('Porzucić niezapisane zmiany?')) return; snapshot(); st = norm(blank()); sel = null; camX = 0; dirty = false; fillSettings(); changed(); };
  $('bSave').onclick = () => saveLib();
  $('bDel').onclick = () => {
    const L = library(), i = L.findIndex(d => d.id === st.id);
    if (i < 0) { toast('Tego etapu nie ma jeszcze w bibliotece.'); return; }
    if (!confirm('Usunąć „' + st.name + '” z biblioteki?')) return;
    L.splice(i, 1); save('paleo_custom', L); fillSettings(); toast('Usunięto z biblioteki.');
  };
  $('lib').onchange = e => {
    const d = library().find(x => x.id === e.target.value);
    if (!d) return;
    if (dirty && !confirm('Porzucić niezapisane zmiany?')) { fillSettings(); return; }
    st = norm(d); sel = null; camX = 0; undo = []; dirty = false; fillSettings(); changed();
  };
  $('bTest').onclick = () => {
    saveLib(true);
    save('paleo_custom_test', clean(st));
    const w = window.open('index.html?test=1', '_blank');
    toast(w ? 'Zapisano — test otwarty w nowej karcie.' : 'Zapisano. Otwórz index.html?test=1, aby zagrać.');
  };
  $('bExpJs').onclick = () => {
    // biblioteka + etapy z obecnego pliku custom.js (wersja z biblioteki ma pierwszeństwo)
    const L = library(); if (!L.some(d => d.id === st.id)) L.push(clean(st));
    (window.CUSTOM_STAGES || []).forEach(d => { if (!L.some(x => x.id === d.id)) L.push(clean(d)); });
    download('custom.js', exportJs(L), 'text/javascript'); toast('Pobrano custom.js — zastąp nim plik js/stages/custom.js.');
  };
  $('bExpJson').onclick = () => { download(slug(st.name) + '.json', JSON.stringify(clean(st), null, 2), 'application/json'); toast('Pobrano plik .json.'); };
  $('bImport').onclick = () => $('file').click();
  $('file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(txt => {
      const list = parseImport(txt).map(norm);
      if (!list.length) throw new Error('brak etapów');
      const L = library();
      list.forEach(d => { const i = L.findIndex(x => x.id === d.id); if (i >= 0) L[i] = clean(d); else L.push(clean(d)); });
      save('paleo_custom', L);
      st = list[0]; sel = null; camX = 0; undo = []; dirty = false; fillSettings(); changed();
      toast('Wczytano etapów: ' + list.length + ' (dodane do biblioteki).');
    }).catch(err => toast('Nie udało się wczytać pliku: ' + err.message)).finally(() => { e.target.value = ''; });
  };
  $('bGame').onclick = () => { location.href = 'index.html'; };
  let toastT = 0;
  function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }
  addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  // ------------------------------------------------------------ start
  const draft = load('paleo_editor_draft', null);
  st = norm(draft || (window.CUSTOM_STAGES && window.CUSTOM_STAGES[0]) || blank());
  dirty = !!draft && !library().some(d => JSON.stringify(d) === JSON.stringify(clean(st)));
  fillSettings(); refreshPanels();
  window.__editor = { get st() { return st; }, set st(v) { st = norm(v); fillSettings(); refreshPanels(); }, setCam, saveLib, library, parseImport, exportJs };
  (document.fonts && document.fonts.load ? document.fonts.load('6px "Press Start 2P"').catch(() => {}) : Promise.resolve()).then(() => requestAnimationFrame(draw));
})();
