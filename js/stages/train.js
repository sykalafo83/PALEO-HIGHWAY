/* Etap specjalny „Pociąg do Twierdzy”: walka na platformach pędzącego pociągu.
 * Tło przesuwa się z czasem (pociąg jedzie), wrogowie wskakują z boków toru, a zrzucony z platformy wróg odpada.
 * Platforma gry: ST.deck { y0, y1 } — poza nią postaci nie chodzą; strącenie poza krawędź = eliminacja.
 */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 2400, DECK = { y0: 166, y1: 206 };
  const WL = 300, GAP = 12;   // długość wagonu i przerwa ze sprzęgiem

  // kafle tła rysowane raz (zapętlone w poziomie)
  let tiles = null;
  function buildTiles() {
    const R = S.rng(77), TW = 768;
    const far = S.canvas(TW, H), g = far.getContext('2d');
    const ridge = (col, base, amp, f1, f2, ph) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= TW; x += 4) g.lineTo(x, base - amp * (0.55 + 0.3 * Math.sin((x / TW) * Math.PI * 2 * f1 + ph) + 0.15 * Math.sin((x / TW) * Math.PI * 2 * f2)));
      g.lineTo(TW, H); g.closePath(); g.fill();
    };
    ridge('#b07a6a', 112, 60, 2, 7, 0.5);
    ridge('#8a5a52', 128, 44, 3, 9, 1.7);
    // bursztynowa twierdza na horyzoncie
    g.fillStyle = '#5a3a3a'; g.fillRect(560, 70, 40, 60); g.fillRect(552, 60, 12, 70); g.fillRect(596, 54, 12, 76);
    g.fillStyle = '#e0a030'; g.fillRect(578, 84, 4, 6); g.fillRect(600, 66, 3, 5);
    const mid = S.canvas(TW, H), m = mid.getContext('2d');
    m.fillStyle = '#4a6a3a'; m.beginPath(); m.moveTo(0, H);
    for (let x = 0; x <= TW; x += 6) m.lineTo(x, 136 - 10 * Math.abs(Math.sin(x * 0.05)) - R() * 6);
    m.lineTo(TW, H); m.closePath(); m.fill();
    for (let x = 30; x < TW; x += 90 + R() * 70) {   // drzewa
      const h = 26 + R() * 22;
      m.fillStyle = '#3a2a1a'; m.fillRect(x - 2, 136 - h, 4, h);
      m.fillStyle = R() < 0.5 ? '#2e5a2a' : '#3e6e30'; m.beginPath(); m.arc(x, 136 - h, 12 + R() * 6, 0, Math.PI * 2); m.fill();
    }
    tiles = { far, mid, TW };
  }
  const loop = (ctx, img, off, y) => { const TW = img.width, o = ((off % TW) + TW) % TW; ctx.drawImage(img, -o, y || 0); ctx.drawImage(img, TW - o, y || 0); };

  function drawWagon(ctx, x, t, idx) {
    const y0 = DECK.y0 - 4, y1 = DECK.y1 + 2;
    // tylna burta (niska)
    ctx.fillStyle = OUT; ctx.fillRect(x, y0 - 8, WL, 9);
    ctx.fillStyle = idx % 2 ? '#6a3a2a' : '#5a4a3a'; ctx.fillRect(x + 1, y0 - 7, WL - 2, 6);
    for (let k = 10; k < WL; k += 30) { ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x + k, y0 - 12, 4, 12); }
    // pokład z desek
    ctx.fillStyle = '#7a5a36'; ctx.fillRect(x, y0, WL, y1 - y0);
    ctx.fillStyle = '#5e4428'; for (let k = 0; k < WL; k += 14) ctx.fillRect(x + k, y0, 1, y1 - y0);
    ctx.fillStyle = '#8e6a42'; for (let r = y0 + 6; r < y1; r += 11) ctx.fillRect(x, r, WL, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x, y0, WL, 3);
    // przednia burta i podwozie
    ctx.fillStyle = OUT; ctx.fillRect(x, y1, WL, 12);
    ctx.fillStyle = '#4a4a50'; ctx.fillRect(x + 1, y1 + 1, WL - 2, 8);
    ctx.fillStyle = '#7a7a80'; for (let k = 8; k < WL; k += 16) ctx.fillRect(x + k, y1 + 4, 2, 2);
    // koła
    for (const wx of [30, 62, WL - 62, WL - 30]) {
      const cx = x + wx, cy = H - 4;
      ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5a5a60'; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      const a = t * 0.9;
      ctx.strokeStyle = '#2a2a2e'; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6); ctx.lineTo(cx - Math.cos(a) * 6, cy - Math.sin(a) * 6);
      ctx.moveTo(cx + Math.cos(a + 1.57) * 6, cy + Math.sin(a + 1.57) * 6); ctx.lineTo(cx - Math.cos(a + 1.57) * 6, cy - Math.sin(a + 1.57) * 6); ctx.stroke();
    }
  }

  window.SPECIAL_STAGES = window.SPECIAL_STAGES || {};
  const st = window.SPECIAL_STAGES.train = S.makeStage({
    name: 'POCIĄG DO TWIERDZY', sub: 'NIE DAJ SIĘ ZRZUCIĆ Z WAGONU!', label: 'P',
    LEN, music: 'drive', bossMusic: 'boss', special: 'train', time: 99, diff: 1.6, startX: 120, deck: DECK,
    sky() {}, near: null,
    WAVES: [
      { lock: 200, groups: [
        { when: 0, spawns: [{ type: 'grunt', side: 'T', delay: 10 }, { type: 'grunt', side: 'B', delay: 40 }, { type: 'thin', side: 'R', y: 186, delay: 70 }] },
        { when: 1, spawns: [{ type: 'flamer', side: 'R', y: 180 }, { type: 'grunt', side: 'T', delay: 30 }] }] },
      { lock: 650, groups: [
        { when: 0, spawns: [{ type: 'rraptor', side: 'L', y: 190 }, { type: 'thin', side: 'B', delay: 40 }] },
        { when: 1, spawns: [{ type: 'glider', side: 'R', y: 186 }, { type: 'brute', side: 'T', delay: 40 }, { type: 'grunt', side: 'B', delay: 60 }] }] },
      { lock: 1150, groups: [
        { when: 0, spawns: [{ type: 'netter', side: 'R', y: 176 }, { type: 'flamer', side: 'L', y: 196, delay: 30 }, { type: 'grunt', side: 'T', delay: 60 }] },
        { when: 1, spawns: [{ type: 'rraptor', side: 'R', y: 186 }, { type: 'thin', side: 'B', delay: 20 }, { type: 'thin', side: 'T', delay: 40 }] }] },
      { lock: 1650, groups: [
        { when: 0, spawns: [{ type: 'bomber', side: 'R', y: 180 }, { type: 'brute', side: 'B', delay: 30 }, { type: 'glider', side: 'L', y: 190, delay: 60 }] },
        { when: 1, spawns: [{ type: 'shield', side: 'R', y: 190 }, { type: 'flamer', side: 'T', delay: 20 }, { type: 'grunt', side: 'B', delay: 40 }] }] },
      { lock: LEN - W, boss: true, groups: [{ when: 0, spawns: [{ type: 'digger', side: 'R', y: 188, delay: 30 }] }] }
    ],
    PROPS: [
      { x: 330, y: 172, kind: 'barrel', drop: 'meat' }, { x: 520, y: 200, kind: 'crate', drop: 'machete' }, { x: 900, y: 176, kind: 'fuel' },
      { x: 1080, y: 200, kind: 'barrel' }, { x: 1400, y: 172, kind: 'crate', drop: 'dynamite' }, { x: 1550, y: 198, kind: 'fuel' },
      { x: 1900, y: 176, kind: 'barrel', drop: 'chain' }, { x: 2120, y: 200, kind: 'crate', drop: 'meat' }
    ],
    PICKUPS: [{ x: 760, y: 186, type: 'meat' }]
  });
  // własne rysowanie: tło zależy od czasu (pędzący pociąg), wagony od kamery (stoimy na nich)
  st.buildLayers = function () { if (!tiles) buildTiles(); return {}; };
  st.drawBack = function (ctx, L, camX, t) {
    if (!tiles) buildTiles();
    S.skyGrad(ctx, ['#e8905a', '#f4b878', '#fcd8a0']);
    ctx.fillStyle = '#fff0c0'; ctx.beginPath(); ctx.arc(300, 54, 16, 0, Math.PI * 2); ctx.fill();
    loop(ctx, tiles.far, t * 0.35 + camX * 0.1);
    loop(ctx, tiles.mid, t * 2.2 + camX * 0.4);
    // słupy telegraficzne śmigają tuż za pociągiem
    const po = (t * 6 + camX) % 260;
    for (let x = -po; x < W + 20; x += 260) {
      ctx.fillStyle = '#2a1a10'; ctx.fillRect(x, 70, 4, FLOOR_TOP - 60); ctx.fillRect(x - 10, 76, 24, 3);
      ctx.strokeStyle = 'rgba(30,20,10,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 10, 78); ctx.quadraticCurveTo(x + 130, 92, x + 250, 78); ctx.stroke();
    }
    // tłuczeń i podkłady pędzące pod pociągiem
    ctx.fillStyle = '#8a7660'; ctx.fillRect(0, FLOOR_TOP - 4, W, H - FLOOR_TOP + 4);
    ctx.fillStyle = '#6a5a48'; const so = (t * 9 + camX) % 22;
    for (let x = -so; x < W; x += 22) ctx.fillRect(x, FLOOR_TOP - 2, 12, 4);
    ctx.fillStyle = '#5a4a3a'; const go = (t * 9 + camX) % 37;
    for (let x = -go; x < W; x += 37) { ctx.fillRect(x, FLOOR_TOP + 6, 6, 1); ctx.fillRect(x + 17, H - 14, 9, 1); }
    ctx.fillStyle = '#9a9aa0'; ctx.fillRect(0, FLOOR_TOP + 1, W, 1);
    // wagony
    const span = WL + GAP, i0 = Math.floor(camX / span);
    for (let i = i0; i <= i0 + 2; i++) {
      const x = Math.round(i * span - camX);
      drawWagon(ctx, x, t, i);
      // sprzęg i blacha przejściowa nad przerwą
      ctx.fillStyle = OUT; ctx.fillRect(x + WL, DECK.y0 - 2, GAP, DECK.y1 - DECK.y0 + 4);
      ctx.fillStyle = '#6a6a70'; ctx.fillRect(x + WL, DECK.y0 - 1, GAP, DECK.y1 - DECK.y0 + 2);
      ctx.fillStyle = '#4a4a50'; for (let r = DECK.y0 + 2; r < DECK.y1; r += 5) ctx.fillRect(x + WL + 1, r, GAP - 2, 1);
    }
  };
  st.drawFront = function (ctx, L, camX, t) {
    // smugi pędu i dym z lokomotywy
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 9; i++) {
      const y = 20 + ((i * 53) % 200), x = W - ((t * (10 + (i % 3) * 4) + i * 97) % (W + 80));
      ctx.fillRect(x, y, 26 + (i % 4) * 8, 1);
    }
    for (let i = 0; i < 6; i++) {
      const k = ((t * 0.012 + i / 6) % 1), x = W + 20 - k * (W + 80), y = 30 - Math.sin(k * 3) * 10 + i * 3;
      ctx.fillStyle = `rgba(80,70,70,${0.35 * (1 - k)})`; ctx.beginPath(); ctx.arc(x, y, 10 + k * 16, 0, Math.PI * 2); ctx.fill();
    }
  };
})();
