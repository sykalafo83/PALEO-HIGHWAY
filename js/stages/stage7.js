/* Etap 5 (plik 7) — „Opuszczona Plaża”: zaśmiecony brzeg, kości, wraki i brudne fale. Boss: Padliniarz. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 3800;

  // szkielet wielkiego dinozaura wyrzucony na brzeg
  function skeleton(g, x, base, s, col) {
    col = col || '#e8dcc0';
    const dark = '#8a7a60';
    g.lineCap = 'round';
    // kręgosłup
    g.strokeStyle = OUT; g.lineWidth = 6 * s; g.beginPath(); g.moveTo(x - 70 * s, base - 30 * s); g.quadraticCurveTo(x, base - 58 * s, x + 80 * s, base - 22 * s); g.stroke();
    g.strokeStyle = col; g.lineWidth = 4 * s; g.stroke();
    // żebra
    for (let i = 0; i < 9; i++) {
      const k = i / 8, sx = x - 50 * s + k * 100 * s, sy = base - 30 * s - Math.sin(k * Math.PI) * 24 * s, h = (20 + Math.sin(k * Math.PI) * 18) * s;
      g.strokeStyle = OUT; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 10 * s, sy + h * 0.6, sx + 2 * s, sy + h); g.stroke();
      g.strokeStyle = i % 2 ? col : '#d8ccb0'; g.lineWidth = 2.4 * s; g.stroke();
    }
    // czaszka
    g.fillStyle = OUT; g.beginPath(); g.ellipse(x + 92 * s, base - 14 * s, 22 * s, 12 * s, 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = col; g.beginPath(); g.ellipse(x + 92 * s, base - 14 * s, 20 * s, 10 * s, 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = OUT; g.beginPath(); g.arc(x + 86 * s, base - 17 * s, 4 * s, 0, Math.PI * 2); g.fill();
    g.fillStyle = dark; for (let i = 0; i < 6; i++) g.fillRect(x + 96 * s + i * 3 * s, base - 6 * s, 1.5 * s, 4 * s);
    // ogon
    g.strokeStyle = OUT; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x - 70 * s, base - 30 * s); g.quadraticCurveTo(x - 110 * s, base - 10 * s, x - 140 * s, base - 4 * s); g.stroke();
    g.strokeStyle = col; g.lineWidth = 2.4 * s; g.stroke();
    g.lineCap = 'butt';
  }
  const tire = (g, x, y, r) => { g.fillStyle = OUT; g.beginPath(); g.ellipse(x, y, r + 1, r * 0.55 + 1, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#2a2a2e'; g.beginPath(); g.ellipse(x, y, r, r * 0.55, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6a5a48'; g.beginPath(); g.ellipse(x, y, r * 0.45, r * 0.25, 0, 0, Math.PI * 2); g.fill(); };
  const bag = (g, x, y, r, col) => { S.blob(g, x, y, r + 1, OUT); S.blob(g, x, y, r, col); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x - r * 0.5, y - r * 0.6, r * 0.5, 2); };
  function trashPile(g, R, x, base, w) {
    const cols = ['#2a2a30', '#3a4a3a', '#4a3a2a', '#5a5a64', '#7a2a2a', '#2a3a5a'];
    for (let i = 0; i < w / 6; i++) bag(g, x + R() * w, base - 3 - R() * (10 + w * 0.12) * Math.sin((i / (w / 6)) * Math.PI), 4 + R() * 5, cols[Math.floor(R() * cols.length)]);
    for (let i = 0; i < w / 12; i++) { g.fillStyle = ['#c8c0a0', '#3a8a5a', '#a0c0d0', '#c03a2a'][Math.floor(R() * 4)]; g.fillRect(x + R() * w, base - 4 - R() * 14, 3, 2); }
  }
  function umbrella(g, x, base, col, tilt) {
    g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(x, base); g.lineTo(x + tilt * 10, base - 40); g.stroke();
    g.strokeStyle = '#c0c0c0'; g.lineWidth = 1.5; g.stroke();
    const tx = x + tilt * 10, ty = base - 40;
    g.fillStyle = OUT; g.beginPath(); g.moveTo(tx - 24, ty + 8 + tilt * 6); g.quadraticCurveTo(tx, ty - 16, tx + 24, ty + 8 - tilt * 6); g.lineTo(tx + 8, ty + 4); g.lineTo(tx - 4, ty + 10); g.closePath(); g.fill();
    g.fillStyle = col; g.beginPath(); g.moveTo(tx - 22, ty + 7 + tilt * 6); g.quadraticCurveTo(tx, ty - 14, tx + 22, ty + 7 - tilt * 6); g.lineTo(tx + 8, ty + 3); g.lineTo(tx - 4, ty + 9); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(tx - 8, ty - 4, 5, 9);
  }
  function boat(g, x, base) {
    g.fillStyle = OUT; g.beginPath(); g.moveTo(x - 48, base - 26); g.lineTo(x + 52, base - 34); g.lineTo(x + 40, base); g.lineTo(x - 38, base); g.closePath(); g.fill();
    g.fillStyle = '#4a6a7a'; g.beginPath(); g.moveTo(x - 46, base - 25); g.lineTo(x + 50, base - 32); g.lineTo(x + 39, base - 2); g.lineTo(x - 37, base - 2); g.closePath(); g.fill();
    g.fillStyle = '#e8e0d0'; g.fillRect(x - 40, base - 20, 84, 3);
    g.fillStyle = '#8a4a22'; for (let i = 0; i < 7; i++) g.fillRect(x - 30 + i * 11 + (i % 2) * 3, base - 16 + (i % 3) * 3, 6, 4);
    g.fillStyle = OUT; g.beginPath(); g.ellipse(x + 8, base - 10, 10, 6, 0, 0, Math.PI * 2); g.fill();   // dziura
    g.fillStyle = '#f0f0f0'; g.font = 'bold 8px monospace'; g.textAlign = 'left'; g.fillText('MEWA II', x - 30, base - 23);
  }
  function tower(g, x, base) {
    S.rect(g, x - 18, base - 70, 4, 70, '#c8b8a0'); S.rect(g, x + 14, base - 64, 4, 64, '#c8b8a0');
    S.rect(g, x - 22, base - 78, 44, 26, '#c04a3a');
    g.fillStyle = '#e8e0d0'; g.fillRect(x - 18, base - 74, 36, 8);
    g.fillStyle = OUT; g.fillRect(x - 10, base - 64, 18, 10);
    g.save(); g.translate(x + 4, base - 84); g.rotate(0.3); S.rect(g, -28, -4, 56, 6, '#8a2a22'); g.restore();   // zerwany daszek
    g.strokeStyle = '#a89878'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x - 16, base - 12 * i - 4); g.lineTo(x + 14, base - 12 * i - 10); g.stroke(); }
  }

  window.STAGES[5] = S.makeStage({
    name: 'ETAP 5 — OPUSZCZONA PLAŻA', sub: 'BRUD, KOŚCI I PORZUCONE WRAKI',
    LEN, music: 'beach', bossMusic: 'boss', diff: 1.6, farP: 0.14, EVENT: 'tide',
    sky(ctx, camX, t) {
      S.skyGrad(ctx, ['#7a8a94', '#b8b098', '#d8c8a0']);
      ctx.fillStyle = 'rgba(255,240,200,0.55)'; ctx.beginPath(); ctx.arc(110 - camX * 0.02, 52, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,200,0.18)'; ctx.beginPath(); ctx.arc(110 - camX * 0.02, 52, 34, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 6; i++) {
        const x = ((i * 90 - camX * 0.03 + t * 0.06) % (W + 200)) - 100;
        ctx.fillStyle = 'rgba(110,100,90,0.25)'; ctx.beginPath(); ctx.ellipse(x, 28 + i * 9, 80, 8, 0, 0, Math.PI * 2); ctx.fill();
      }
    },
    far(g, R, w) {
      // brudne morze
      const sea = g.createLinearGradient(0, 96, 0, FLOOR_TOP);
      sea.addColorStop(0, '#4a6a70'); sea.addColorStop(1, '#3a4a40');
      g.fillStyle = sea; g.fillRect(0, 96, w, H - 96);
      g.fillStyle = '#5a7a7a'; for (let i = 0; i < w / 5; i++) g.fillRect(R() * w, 98 + R() * 40, 4 + R() * 12, 1);
      // wrak tankowca
      const tx = w * 0.45;
      g.fillStyle = '#2a2a2e'; g.beginPath(); g.moveTo(tx, 100); g.lineTo(tx + 120, 92); g.lineTo(tx + 128, 104); g.lineTo(tx + 6, 108); g.closePath(); g.fill();
      g.fillRect(tx + 70, 74, 18, 20); g.fillRect(tx + 76, 64, 6, 12);
      g.fillStyle = '#6a3a2a'; g.fillRect(tx + 10, 102, 110, 3);
      // pęknięte molo
      for (let x = 30; x < w * 0.3; x += 18) { g.fillStyle = '#3a3430'; g.fillRect(x, 104 + (x % 36 ? 0 : 4), 3, 30); }
      g.fillStyle = '#4a4038'; g.fillRect(30, 104, w * 0.18, 4);
    },
    farAnim(ctx, camX, t) {
      // fale i tęczowa plama ropy
      for (let i = 0; i < 26; i++) {
        const x = ((i * 41 - camX * 0.14 + t * 0.3) % (W + 40) + W + 40) % (W + 40) - 20, y = 104 + (i * 7) % 40;
        ctx.fillStyle = 'rgba(220,230,220,0.35)'; ctx.fillRect(x, y, 8 + (i % 4) * 3, 1);
      }
      const ox = ((200 - camX * 0.14) % (W + 200) + W + 200) % (W + 200) - 100;
      const gr = ctx.createLinearGradient(ox - 40, 0, ox + 40, 0);
      ['rgba(180,80,200,0.18)', 'rgba(80,160,220,0.18)', 'rgba(120,220,120,0.18)', 'rgba(230,200,80,0.18)'].forEach((c, i) => gr.addColorStop(i / 3, c));
      ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(ox, 124, 46, 5, 0, 0, Math.PI * 2); ctx.fill();
      // fala obmywa brzeg — brudna piana
      const y = 135 + Math.sin(t * 0.03) * 1.5;
      ctx.fillStyle = 'rgba(70,90,80,0.9)'; ctx.fillRect(0, y - 3, W, 4);
      ctx.fillStyle = 'rgba(220,215,190,0.85)';
      for (let x = -((camX * 0.5 + t * 0.4) % 12); x < W; x += 12) ctx.fillRect(x, y + Math.sin((x + camX) * 0.1 + t * 0.05) * 1.2, 7, 2);
    },
    mid(g, R, w) {
      // wydmy, martwe palmy, płot
      g.fillStyle = '#9a8a68'; g.fillRect(0, 137, w, 3);                      // mokry piasek przy linii wody
      g.fillStyle = '#b8a078'; g.fillRect(0, 140, w, FLOOR_TOP - 140);
      for (let i = 0; i < w / 8; i++) { g.fillStyle = R() < 0.5 ? '#a89068' : '#c8b088'; g.fillRect(R() * w, 141 + R() * 8, 2 + R() * 4, 1); }
      for (let x = 60; x < w; x += 140 + R() * 160) S.palm(g, R, x, 140, 46 + R() * 22, R() < 0.5 ? -0.8 : 0.9, true);
      for (let x = 20; x < w; x += 300 + R() * 200) { g.fillStyle = '#6a5a48'; for (let i = 0; i < 12; i++) g.fillRect(x + i * 7, 130 + Math.sin(i) * 2, 2, 14); g.fillRect(x, 134, 84, 2); }
    },
    near(g, R, nw) {
      // 1. wejście na plażę
      S.sign(g, 120, FLOOR_TOP, 'ZAKAZ KĄPIELI', '#a02a22');
      umbrella(g, 260, FLOOR_TOP - 2, '#c03a2a', 0.6);
      umbrella(g, 330, FLOOR_TOP - 4, '#2a7aa0', -0.9);
      trashPile(g, R, 400, FLOOR_TOP - 1, 110);
      S.car(g, 620, FLOOR_TOP, '#8a8a7a');
      tire(g, 700, FLOOR_TOP - 4, 9); tire(g, 716, FLOOR_TOP - 2, 8);
      // 2. wieża ratownika i łódź
      tower(g, 920, FLOOR_TOP);
      boat(g, 1120, FLOOR_TOP);
      trashPile(g, R, 1220, FLOOR_TOP - 1, 140);
      for (let x = 1400; x < 1560; x += 26) S.tank(g, x, FLOOR_TOP - 2, R() < 0.5 ? '#3a5a3a' : '#7a3a2a');
      g.fillStyle = 'rgba(20,20,20,0.75)'; g.beginPath(); g.ellipse(1480, FLOOR_TOP + 1, 70, 4, 0, 0, Math.PI * 2); g.fill();   // wyciek
      // 3. cmentarzysko kości
      skeleton(g, 1800, FLOOR_TOP, 1.2);
      skeleton(g, 2250, FLOOR_TOP, 0.8, '#d8ccb0');
      for (let x = 1650; x < 2500; x += 40 + R() * 40) { g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(x, FLOOR_TOP - 2); g.lineTo(x + 8, FLOOR_TOP - 14 - R() * 10); g.stroke(); g.strokeStyle = '#e8dcc0'; g.lineWidth = 1.6; g.stroke(); }
      umbrella(g, 2050, FLOOR_TOP - 3, '#d0a040', -0.4);
      // 4. obóz Padliniarza: góry śmieci, wraki, kontener
      trashPile(g, R, 2550, FLOOR_TOP - 1, 180);
      S.container(g, 2780, FLOOR_TOP, 90, 34, '#7a5a3a', 'ŚMIECI');
      S.car(g, 2930, FLOOR_TOP, '#5a3a3a');
      trashPile(g, R, 3080, FLOOR_TOP - 1, 220);
      boat(g, 3380, FLOOR_TOP);
      tire(g, 3480, FLOOR_TOP - 6, 10); tire(g, 3496, FLOOR_TOP - 3, 9); tire(g, 3488, FLOOR_TOP - 14, 9);
      skeleton(g, 3640, FLOOR_TOP, 0.9);
      // podłoże: brudny piasek
      S.ground(g, R, 0, nw, '#b89a68', '#c8b080', 2);
      for (let i = 0; i < nw / 18; i++) {
        const x = R() * nw, y = FLOOR_TOP + 6 + R() * (H - FLOOR_TOP - 8), k = R();
        if (k < 0.25) { g.fillStyle = '#3a6a3a'; g.fillRect(x, y, 5, 1); g.fillRect(x + 2, y - 1, 4, 1); }              // wodorosty
        else if (k < 0.45) { g.fillStyle = '#e8dcc0'; g.fillRect(x, y, 6, 2); g.fillRect(x - 1, y - 1, 2, 4); g.fillRect(x + 5, y - 1, 2, 4); }   // kość
        else if (k < 0.6) { g.fillStyle = ['#4a8a5a', '#a0c0d0', '#8a4a22'][Math.floor(R() * 3)]; g.fillRect(x, y, 4, 2); }   // butelki
        else if (k < 0.7) { g.fillStyle = '#2a2a2a'; g.beginPath(); g.ellipse(x, y, 6 + R() * 8, 2, 0, 0, Math.PI * 2); g.fill(); }   // plama smoły
        else { g.fillStyle = '#a89068'; g.fillRect(x, y, 2, 1); }
      }
    },
    front(g, R, fw) {
      for (let x = 60; x < fw; x += 150 + R() * 180) {
        const k = R();
        if (k < 0.35) tire(g, x, 214, 12);
        else if (k < 0.7) { g.strokeStyle = OUT; g.lineWidth = 5; g.beginPath(); g.moveTo(x, 224); g.quadraticCurveTo(x + 12, 196, x + 4, 186); g.stroke(); g.strokeStyle = '#e8dcc0'; g.lineWidth = 3; g.stroke(); }   // żebro
        else bag(g, x, 216, 9, '#2a2a30');
      }
    },
    anim(ctx, camX, t) {
      // muchy nad śmieciami
      [400, 1220, 2550, 3080].forEach((px, k) => {
        const sx = px - camX + 60;
        if (sx < -60 || sx > W + 60) return;
        ctx.fillStyle = '#140c10';
        for (let i = 0; i < 7; i++) ctx.fillRect(sx + Math.sin(t * 0.21 + i * 1.7 + k) * 26, FLOOR_TOP - 22 + Math.cos(t * 0.17 + i * 2.3) * 9, 1.5, 1.5);
      });
    },
    overlay(ctx, camX, t) {
      for (let i = 0; i < 5; i++) {
        const x = ((i * 120 + t * (0.5 + i * 0.12) - camX * 0.25) % (W + 80) + W + 80) % (W + 80) - 40;
        const y = 30 + i * 10 + Math.sin(t * 0.04 + i) * 6, f = Math.sin(t * 0.2 + i * 2) * 3;
        ctx.strokeStyle = '#f0f0e8'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x - 6, y - f); ctx.quadraticCurveTo(x - 3, y - 3, x, y); ctx.quadraticCurveTo(x + 3, y - 3, x + 6, y - f); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(120,110,80,0.06)'; ctx.fillRect(0, 0, W, H);
    },
    WAVES: [
      { lock: 300, groups: [
        { when: 0, spawns: [{ type: 'grunt', side: 'R', y: 175 }, { type: 'thin', side: 'R', y: 205, delay: 20 }, { type: 'grunt', side: 'L', y: 190, delay: 50 }] },
        { when: 1, spawns: [{ type: 'bomber', side: 'R', y: 170 }, { type: 'netter', side: 'L', y: 200, delay: 30 }] }] },
      { lock: 820, groups: [
        { when: 0, spawns: [{ type: 'para', side: 'R', y: 185 }, { type: 'thin', side: 'L', y: 205, delay: 30 }] },
        { when: 1, spawns: [{ type: 'brute', side: 'R', y: 180 }, { type: 'grunt', side: 'R', y: 200, delay: 20 }, { type: 'ptera', side: 'L', y: 185, delay: 60 }] }] },
      { lock: 1300, groups: [
        { when: 0, spawns: [{ type: 'shield', side: 'R', y: 175 }, { type: 'bomber', side: 'R', y: 205, delay: 20 }, { type: 'gunner', side: 'L', y: 190, delay: 50 }] },
        { when: 1, spawns: [{ type: 'raptor', side: 'R', y: 185 }, { type: 'raptor', side: 'L', y: 200, delay: 30 }] }] },
      { lock: 1820, groups: [
        { when: 0, spawns: [{ type: 'thin', side: 'R', y: 170 }, { type: 'thin', side: 'L', y: 200, delay: 10 }, { type: 'netter', side: 'R', y: 205, delay: 40 }, { type: 'brute', side: 'L', y: 180, delay: 70 }] }] },
      { lock: 2350, groups: [
        { when: 0, spawns: [{ type: 'trike', side: 'R', y: 190 }, { type: 'grunt', side: 'L', y: 175, delay: 30 }] },
        { when: 1, spawns: [{ type: 'sniper', side: 'R', y: 160 }, { type: 'bomber', side: 'L', y: 200, delay: 30 }, { type: 'shield', side: 'R', y: 185, delay: 50 }] }] },
      { lock: 2950, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'R', y: 180 }, { type: 'brute', side: 'L', y: 205, delay: 30 }, { type: 'ptera', side: 'R', y: 185, delay: 60 }] },
        { when: 1, spawns: [{ type: 'pachy', side: 'R', y: 190 }, { type: 'thin', side: 'L', y: 175, delay: 20 }] }] },
      { lock: LEN - W, boss: true, groups: [{ when: 0, spawns: [{ type: 'padliniarz', side: 'R', y: 185 }] }] }
    ],
    PROPS: [
      { x: 230, y: 200, kind: 'barrel', drop: 'meat' }, { x: 560, y: 172, kind: 'crate', drop: 'chain' }, { x: 330, y: 205, kind: 'barrel', drop: 'bottle' },
      { x: 1020, y: 205, kind: 'fuel' }, { x: 1060, y: 175, kind: 'fuel' }, { x: 1180, y: 200, kind: 'crate', drop: 'dynamite' },
      { x: 1600, y: 180, kind: 'barrel', drop: 'meat' }, { x: 1960, y: 158, kind: 'wall', secret: 'treasure1up' },
      { x: 2160, y: 205, kind: 'crate', drop: 'grenade' }, { x: 2700, y: 175, kind: 'barrel', drop: 'meat' }, { x: 2840, y: 205, kind: 'crate', drop: 'bottle' },
      { x: 3000, y: 205, kind: 'fuel' }, { x: 3260, y: 180, kind: 'crate', drop: 'gem' }, { x: 3500, y: 200, kind: 'barrel', drop: 'meat' }
    ],
    PICKUPS: [{ x: 760, y: 200, type: 'coin' }, { x: 1700, y: 190, type: 'fruit' }, { x: 2500, y: 200, type: 'coin' }, { x: 3150, y: 185, type: 'gem' }],
    VEHICLES: [{ type: 'jeep', x: 1500, y: 198 }]
  });
})();
