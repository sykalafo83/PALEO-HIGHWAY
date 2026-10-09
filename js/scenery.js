/* PALEO HIGHWAY — wspólne elementy scenerii i fabryka etapów.
 * Tła rysowane są raz (prerender) do płócien warstw z deterministycznym RNG.
 */
(function (global) {
  'use strict';
  const W = 384, H = 224;
  const FLOOR_TOP = 150, FLOOR_BOTTOM = 216;
  const { segs, shade } = global.Sprites;
  const OUT = '#140c10';

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function blob(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  function rect(g, x, y, w, h, col, out) {
    if (out !== false) { g.fillStyle = out || OUT; g.fillRect(x - 1, y - 1, w + 2, h + 2); }
    g.fillStyle = col; g.fillRect(x, y, w, h);
  }

  // ---------------------------------------------------------------- roślinność
  function canopy(g, R, x, y, w, h, cols) {
    for (let i = 0; i < w * h / 60; i++) blob(g, x + (R() - 0.5) * w, y + (R() - 0.5) * h, 6 + R() * 10, cols[0]);
    for (let i = 0; i < w * h / 110; i++) blob(g, x + (R() - 0.5) * w * 0.9, y - h * 0.15 + (R() - 0.5) * h * 0.7, 4 + R() * 7, cols[1]);
    for (let i = 0; i < w * h / 260; i++) blob(g, x + (R() - 0.5) * w * 0.8, y - h * 0.3 + (R() - 0.5) * h * 0.4, 2 + R() * 4, cols[2]);
  }
  function palm(g, R, x, base, h, lean, dark) {
    const trunk = dark ? '#3b2a1e' : '#6b4a2e';
    const pts = [];
    for (let i = 0; i <= 8; i++) { const k = i / 8; pts.push([x + lean * k * k * h * 0.4, base - k * h]); }
    for (let i = 0; i < 8; i++) segs(g, [pts[i], pts[i + 1]], 5 - i * 0.25, i % 2 ? trunk : shade(trunk, 0.15), OUT);
    const top = pts[8];
    const leaf = dark ? '#1f4a2a' : '#2f7a3a', leaf2 = dark ? '#2a5e35' : '#4ea24a';
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI + i * Math.PI / 6 + (R() - 0.5) * 0.3;
      const L = 18 + R() * 10;
      const mid = [top[0] + Math.cos(a) * L * 0.6, top[1] + Math.sin(a) * L * 0.4 - 4];
      const end = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * 0.3 + 8];
      g.strokeStyle = OUT; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.moveTo(top[0], top[1]); g.quadraticCurveTo(mid[0], mid[1], end[0], end[1]); g.stroke();
      g.strokeStyle = i % 2 ? leaf : leaf2; g.lineWidth = 4; g.stroke();
    }
    blob(g, top[0] - 2, top[1] + 2, 2.5, '#5a3a1a'); blob(g, top[0] + 2, top[1] + 3, 2.5, '#5a3a1a');
  }
  function bigTree(g, R, x, base, h, cols) {
    g.fillStyle = OUT; g.fillRect(x - 9, base - h, 18, h);
    g.fillStyle = '#4a3324'; g.fillRect(x - 8, base - h, 16, h);
    g.fillStyle = '#5e4330'; g.fillRect(x - 4, base - h, 4, h);
    g.fillStyle = '#4a3324';
    g.beginPath(); g.moveTo(x - 8, base - 14); g.lineTo(x - 18, base); g.lineTo(x + 18, base); g.lineTo(x + 8, base - 14); g.fill();
    g.strokeStyle = '#2f6a2a'; g.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { const vx = x - 20 + R() * 40; g.beginPath(); g.moveTo(vx, base - h); g.quadraticCurveTo(vx + 6, base - h * 0.5, vx - 2, base - h * 0.2 - R() * 30); g.stroke(); }
    canopy(g, R, x, base - h, 70, 40, cols || ['#1e4d2b', '#2e6e35', '#4c9a44']);
  }
  function deadTree(g, R, x, base, h, col) {
    col = col || '#3a3228';
    const branch = (x0, y0, a, L, w, d) => {
      const x1 = x0 + Math.sin(a) * L, y1 = y0 - Math.cos(a) * L;
      segs(g, [[x0, y0], [x1, y1]], w, col, OUT);
      if (d > 0) { branch(x1, y1, a - 0.5 - R() * 0.3, L * 0.65, w * 0.65, d - 1); branch(x1, y1, a + 0.4 + R() * 0.3, L * 0.6, w * 0.6, d - 1); }
    };
    branch(x, base, (R() - 0.5) * 0.2, h * 0.5, 6, 3);
    // mech
    g.strokeStyle = '#6a7a4a'; g.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { const mx = x - 20 + R() * 40, my = base - h * 0.5 - R() * h * 0.4; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + (R() - 0.5) * 3, my + 8 + R() * 14); g.stroke(); }
  }
  function fern(g, R, x, y, s, cols) {
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.38 + (R() - 0.5) * 0.15;
      const L = s * (0.7 + R() * 0.4);
      g.strokeStyle = OUT; g.lineWidth = 5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a) * L * 0.6, y + Math.sin(a) * L * 0.9, x + Math.cos(a) * L, y + Math.sin(a) * L * 0.55);
      g.stroke(); g.strokeStyle = cols[i % cols.length]; g.lineWidth = 3; g.stroke();
    }
  }
  function reeds(g, R, x, y, n, col) {
    for (let i = 0; i < n; i++) {
      const rx = x + (R() - 0.5) * 20, h = 14 + R() * 18, lean = (R() - 0.5) * 8;
      g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(rx, y); g.quadraticCurveTo(rx, y - h * 0.6, rx + lean, y - h); g.stroke();
      g.strokeStyle = col; g.lineWidth = 1.5; g.stroke();
      if (R() < 0.4) { g.fillStyle = '#5a3a1e'; g.fillRect(rx + lean - 1.5, y - h - 2, 3, 6); }
    }
  }

  // ---------------------------------------------------------------- budowle
  function hut(g, R, x, base) {
    for (let i = 0; i < 3; i++) { g.fillStyle = OUT; g.fillRect(x - 30 + i * 28, base - 34, 5, 34); g.fillStyle = '#6b4a2e'; g.fillRect(x - 29 + i * 28, base - 34, 3, 34); }
    g.fillStyle = OUT; g.fillRect(x - 40, base - 40, 80, 8);
    g.fillStyle = '#8b6238'; g.fillRect(x - 39, base - 39, 78, 6);
    g.fillStyle = '#6b4a2e'; for (let i = 0; i < 10; i++) g.fillRect(x - 39 + i * 8, base - 39, 1, 6);
    g.fillStyle = OUT; g.fillRect(x - 32, base - 74, 64, 35);
    g.fillStyle = '#a07a46'; g.fillRect(x - 31, base - 73, 62, 34);
    g.fillStyle = '#8a6438'; for (let i = 0; i < 12; i++) g.fillRect(x - 31 + i * 5.3, base - 73, 1.5, 34);
    g.fillStyle = '#20140c'; g.fillRect(x - 8, base - 66, 16, 27); g.fillRect(x + 14, base - 64, 10, 9);
    g.fillStyle = OUT; g.beginPath(); g.moveTo(x - 46, base - 70); g.lineTo(x, base - 100); g.lineTo(x + 46, base - 70); g.closePath(); g.fill();
    g.fillStyle = '#c9a64e'; g.beginPath(); g.moveTo(x - 43, base - 71); g.lineTo(x, base - 97); g.lineTo(x + 43, base - 71); g.closePath(); g.fill();
    g.strokeStyle = '#9c7c30'; g.lineWidth = 1;
    for (let i = 0; i < 16; i++) { const k = i / 15; g.beginPath(); g.moveTo(x - 43 + 86 * k, base - 71); g.lineTo(x + (k - 0.5) * 30, base - 92); g.stroke(); }
    g.fillStyle = '#20140c'; g.beginPath(); g.arc(x + 18 + R() * 6, base - 78, 4, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#6b4a2e'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x + 32, base); g.lineTo(x + 26, base - 38); g.moveTo(x + 40, base); g.lineTo(x + 34, base - 38); g.stroke();
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x + 32 - i * 1.2, base - i * 8); g.lineTo(x + 40 - i * 1.2, base - i * 8); g.stroke(); }
  }
  function shack(g, R, x, base, col) {
    // chata z blachy falistej na palach
    for (let i = 0; i < 4; i++) rect(g, x - 34 + i * 22, base - 22, 4, 22, '#4a3a2a');
    rect(g, x - 40, base - 26, 80, 5, '#6b5a40');
    rect(g, x - 34, base - 62, 68, 36, col || '#7a8a8a');
    g.fillStyle = shade(col || '#7a8a8a', -0.2);
    for (let i = 0; i < 17; i++) g.fillRect(x - 34 + i * 4, base - 62, 1.5, 36);
    g.fillStyle = '#8a4a22'; g.fillRect(x - 20, base - 50, 12, 6); g.fillRect(x + 10, base - 38, 16, 8);
    rect(g, x - 6, base - 50, 14, 24, '#1a120c');
    rect(g, x + 14, base - 56, 12, 9, '#2a3a3a');
    g.fillStyle = OUT; g.beginPath(); g.moveTo(x - 42, base - 60); g.lineTo(x + 44, base - 70); g.lineTo(x + 44, base - 64); g.lineTo(x - 42, base - 55); g.fill();
    g.fillStyle = '#5a5a52'; g.beginPath(); g.moveTo(x - 41, base - 59); g.lineTo(x + 43, base - 69); g.lineTo(x + 43, base - 65); g.lineTo(x - 41, base - 56); g.fill();
    rect(g, x + 20, base - 82, 5, 14, '#3a3a3a');
  }
  function derrick(g, x, base, h, col) {
    col = col || '#4a3a3a';
    g.strokeStyle = col; g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x - h * 0.22, base); g.lineTo(x - 3, base - h); g.moveTo(x + h * 0.22, base); g.lineTo(x + 3, base - h);
    for (let k = 0.1; k < 1; k += 0.14) {
      const y = base - h * k, w = h * 0.22 * (1 - k) + 3;
      const y2 = base - h * (k + 0.14), w2 = h * 0.22 * (1 - k - 0.14) + 3;
      g.moveTo(x - w, y); g.lineTo(x + w, y); g.moveTo(x - w, y); g.lineTo(x + w2, y2); g.moveTo(x + w, y); g.lineTo(x - w2, y2);
    }
    g.stroke();
    g.fillStyle = col; g.fillRect(x - 6, base - h - 4, 12, 5);
  }
  function pumpjack(g, x, base) {
    rect(g, x - 30, base - 6, 60, 6, '#3a3a3a');
    segs(g, [[x - 10, base - 6], [x, base - 34], [x + 10, base - 6]], 3, '#5a5048', OUT);
    segs(g, [[x - 34, base - 30], [x + 26, base - 40]], 5, '#c08a2a', OUT);
    g.fillStyle = OUT; g.beginPath(); g.arc(x - 36, base - 28, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c08a2a'; g.beginPath(); g.arc(x - 36, base - 28, 8, Math.PI * 0.4, Math.PI * 1.6); g.fill();
    segs(g, [[x + 24, base - 34], [x + 24, base - 6]], 2, '#3a3a3a', OUT);
    blob(g, x, base - 34, 3, '#2a2a2a');
  }
  function boardwalk(g, x0, x1, y, h) {
    for (let x = x0; x < x1; x += 30) rect(g, x, y, 4, h, '#3a2a1a');
    rect(g, x0, y - 4, x1 - x0, 5, '#6b4a2e');
    g.fillStyle = '#4a3220'; for (let x = x0; x < x1; x += 7) g.fillRect(x, y - 4, 1, 5);
  }
  function pipeline(g, x0, x1, y, col) {
    rect(g, x0, y, x1 - x0, 7, col || '#7a5a3a');
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(x0, y + 1, x1 - x0, 2);
    for (let x = x0 + 20; x < x1; x += 60) { rect(g, x, y - 2, 6, 11, '#5a4a3a'); rect(g, x + 1, y + 9, 4, 16, '#4a3a2a'); }
    g.fillStyle = '#8a4a22'; for (let x = x0 + 10; x < x1; x += 37) g.fillRect(x, y + 2, 8, 3);
  }
  function sign(g, x, base, text, col) {
    g.fillStyle = OUT; g.fillRect(x - 2, base - 50, 4, 50);
    g.fillStyle = '#7a6a5a'; g.fillRect(x - 1, base - 50, 2, 50);
    g.save(); g.translate(x, base - 56); g.rotate(-0.08);
    g.fillStyle = OUT; g.fillRect(-26, -10, 52, 20);
    g.fillStyle = col; g.fillRect(-25, -9, 50, 18);
    g.fillStyle = '#f2ecd8'; g.font = 'bold 9px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 0, 1);
    g.fillStyle = 'rgba(120,60,20,0.6)'; g.fillRect(12, -9, 8, 6); g.fillRect(-22, 3, 6, 5);
    g.restore();
  }
  function car(g, x, base, body) {
    body = body || '#5aa0a8';
    const rust = '#8a4a22', chrome = '#c9d2d8';
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(x, base, 70, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = OUT;
    g.beginPath(); g.moveTo(x - 72, base - 10); g.lineTo(x - 70, base - 26); g.lineTo(x - 60, base - 30); g.lineTo(x - 30, base - 30);
    g.lineTo(x - 18, base - 44); g.lineTo(x + 12, base - 44); g.lineTo(x + 22, base - 31); g.lineTo(x + 62, base - 29); g.lineTo(x + 76, base - 38);
    g.lineTo(x + 76, base - 24); g.lineTo(x + 74, base - 10); g.closePath(); g.fill();
    g.fillStyle = body;
    g.beginPath(); g.moveTo(x - 70, base - 11); g.lineTo(x - 68, base - 25); g.lineTo(x - 59, base - 29); g.lineTo(x - 29, base - 29);
    g.lineTo(x + 21, base - 30); g.lineTo(x + 62, base - 28); g.lineTo(x + 74, base - 36); g.lineTo(x + 74, base - 24); g.lineTo(x + 72, base - 11); g.closePath(); g.fill();
    g.fillStyle = '#9fd0e0'; g.beginPath(); g.moveTo(x - 16, base - 42); g.lineTo(x - 26, base - 30); g.lineTo(x - 16, base - 30); g.closePath(); g.fill();
    g.fillStyle = '#2a1a14'; g.fillRect(x - 14, base - 42, 26, 12);
    g.fillStyle = '#a03030'; g.fillRect(x - 10, base - 38, 18, 8);
    g.fillStyle = chrome; g.fillRect(x - 70, base - 18, 144, 2);
    g.fillRect(x - 74, base - 14, 10, 4); g.fillRect(x + 68, base - 14, 10, 4);
    blob(g, x - 66, base - 22, 3, '#fff2a8');
    g.fillStyle = rust;
    [[-50, -26, 12, 6], [10, -24, 18, 8], [40, -20, 10, 5], [-30, -16, 8, 4], [58, -27, 8, 4]].forEach(r => g.fillRect(x + r[0], base + r[1], r[2], r[3]));
    [-46, 46].forEach(dx => { blob(g, x + dx, base - 9, 10, OUT); blob(g, x + dx, base - 9, 8, '#26262a'); blob(g, x + dx, base - 9, 5, '#e8e8e0'); blob(g, x + dx, base - 9, 3, chrome); });
    g.strokeStyle = '#3a8a3a'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x + 30, base); g.quadraticCurveTo(x + 40, base - 30, x + 60, base - 28); g.stroke();
    g.beginPath(); g.moveTo(x - 60, base); g.quadraticCurveTo(x - 50, base - 25, x - 30, base - 30); g.stroke();
  }
  function bus(g, x, base) {
    rect(g, x - 80, base - 52, 160, 44, '#c89a2a');
    g.fillStyle = '#8a4a22'; [[-70, -40, 20, 10], [30, -20, 30, 8], [-20, -48, 14, 6]].forEach(r => g.fillRect(x + r[0], base + r[1], r[2], r[3]));
    for (let i = 0; i < 7; i++) rect(g, x - 72 + i * 21, base - 46, 16, 14, i % 3 ? '#2a3a4a' : '#1a1a22');
    g.fillStyle = '#2a2a2a'; g.fillRect(x - 80, base - 24, 160, 3);
    [-50, 50].forEach(dx => { blob(g, x + dx, base - 8, 9, OUT); blob(g, x + dx, base - 8, 7, '#26262a'); });
    g.strokeStyle = '#3a7a3a'; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - 60 + i * 40, base - 52); g.quadraticCurveTo(x - 50 + i * 40, base - 30, x - 64 + i * 40, base - 14); g.stroke(); }
  }
  function tent(g, x, base, col) {
    g.fillStyle = OUT; g.beginPath(); g.moveTo(x - 42, base); g.lineTo(x, base - 52); g.lineTo(x + 42, base); g.closePath(); g.fill();
    g.fillStyle = col; g.beginPath(); g.moveTo(x - 40, base - 1); g.lineTo(x, base - 50); g.lineTo(x + 40, base - 1); g.closePath(); g.fill();
    g.fillStyle = shade(col, -0.25); g.beginPath(); g.moveTo(x, base - 50); g.lineTo(x + 40, base - 1); g.lineTo(x + 14, base - 1); g.closePath(); g.fill();
    g.fillStyle = '#1a120c'; g.beginPath(); g.moveTo(x - 10, base - 1); g.lineTo(x, base - 30); g.lineTo(x + 8, base - 1); g.closePath(); g.fill();
    g.fillStyle = OUT; g.fillRect(x - 1, base - 58, 2, 8);
    g.fillStyle = '#c03a2a'; g.fillRect(x + 1, base - 58, 8, 4);
  }
  function cage(g, x, base, inner) {
    g.fillStyle = OUT; g.fillRect(x - 26, base - 44, 52, 44);
    g.fillStyle = '#2a2018'; g.fillRect(x - 25, base - 43, 50, 42);
    g.fillStyle = inner || '#6a8a4a'; g.beginPath(); g.ellipse(x, base - 12, 12, 8, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x + 12, base - 20, 6, 4, -0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffcf3a'; g.fillRect(x + 13, base - 22, 2, 2);
    g.strokeStyle = '#a07a46'; g.lineWidth = 3;
    for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(x - 22 + i * 7.3, base - 43); g.lineTo(x - 22 + i * 7.3, base); g.stroke(); }
    g.fillStyle = '#8b6238'; g.fillRect(x - 27, base - 46, 54, 5); g.fillRect(x - 27, base - 4, 54, 4);
  }
  function crates(g, x, base, col) {
    col = col || '#7f6a3a';
    [[0, 0], [22, 0], [11, -20]].forEach(([dx, dy]) => {
      g.fillStyle = OUT; g.fillRect(x + dx - 11, base + dy - 20, 22, 20);
      g.fillStyle = col; g.fillRect(x + dx - 10, base + dy - 19, 20, 18);
      g.fillStyle = shade(col, -0.25); g.fillRect(x + dx - 10, base + dy - 12, 20, 2);
      g.fillStyle = '#e8d8a0'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('XX', x + dx, base + dy - 5);
    });
  }
  function container(g, x, base, w, h, col, label) {
    rect(g, x, base - h, w, h, col);
    g.fillStyle = shade(col, -0.22);
    for (let i = 3; i < w; i += 6) g.fillRect(x + i, base - h + 2, 2, h - 4);
    g.fillStyle = shade(col, 0.2); g.fillRect(x, base - h, w, 2);
    if (label) { g.fillStyle = 'rgba(255,255,255,0.75)'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText(label, x + w / 2, base - h / 2 + 3); }
    g.fillStyle = '#8a4a22'; g.fillRect(x + w * 0.7, base - 8, 8, 5);
  }
  function crane(g, x, base, h, col) {
    col = col || '#d0902a';
    g.strokeStyle = OUT; g.lineWidth = 4;
    const draw = (c, w) => {
      g.strokeStyle = c; g.lineWidth = w; g.beginPath();
      g.moveTo(x - 8, base); g.lineTo(x - 8, base - h); g.moveTo(x + 8, base); g.lineTo(x + 8, base - h);
      for (let y = base; y > base - h; y -= 14) { g.moveTo(x - 8, y); g.lineTo(x + 8, y - 14); }
      g.moveTo(x - 30, base - h); g.lineTo(x + 90, base - h); g.moveTo(x - 30, base - h + 8); g.lineTo(x + 90, base - h + 8);
      for (let xx = x - 30; xx < x + 90; xx += 12) { g.moveTo(xx, base - h + 8); g.lineTo(xx + 12, base - h); }
      g.stroke();
    };
    draw(OUT, 4); draw(col, 2);
    g.strokeStyle = '#2a2a2a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 70, base - h + 8); g.lineTo(x + 70, base - h + 60); g.stroke();
    rect(g, x + 64, base - h + 60, 12, 6, '#3a3a3a');
    rect(g, x - 34, base - h - 4, 18, 18, '#5a5a5a');
  }
  function warehouse(g, x, base, w, h, col) {
    rect(g, x, base - h, w, h, col);
    g.fillStyle = shade(col, -0.18); for (let i = 0; i < w; i += 5) g.fillRect(x + i, base - h, 1.5, h);
    g.fillStyle = OUT; g.beginPath(); g.moveTo(x - 4, base - h); g.lineTo(x + w / 2, base - h - 18); g.lineTo(x + w + 4, base - h); g.fill();
    g.fillStyle = shade(col, -0.3); g.beginPath(); g.moveTo(x - 2, base - h); g.lineTo(x + w / 2, base - h - 16); g.lineTo(x + w + 2, base - h); g.fill();
    rect(g, x + w / 2 - 22, base - 50, 44, 50, '#2a2420');
    g.fillStyle = '#3a342e'; for (let i = 0; i < 10; i++) g.fillRect(x + w / 2 - 22, base - 50 + i * 5, 44, 1);
    for (let i = 0; i < 3; i++) rect(g, x + 10 + i * (w - 30) / 2, base - h + 10, 12, 8, '#e8c060');
  }
  function building(g, R, x, base, w, h, col, lit) {
    rect(g, x, base - h, w, h, col);
    // zniszczona krawędź dachu
    g.fillStyle = '#0a0a14';
    g.beginPath(); g.moveTo(x - 1, base - h - 1);
    for (let xx = x; xx <= x + w; xx += 6) g.lineTo(xx, base - h - 1 + R() * 10);
    g.lineTo(x + w + 1, base - h - 1); g.closePath(); g.fill();
    for (let yy = base - h + 14; yy < base - 18; yy += 16) {
      for (let xx = x + 6; xx < x + w - 8; xx += 14) {
        const on = R() < lit;
        g.fillStyle = on ? (R() < 0.5 ? '#f0d070' : '#c0e0f0') : (R() < 0.3 ? '#05050a' : shade(col, -0.35));
        g.fillRect(xx, yy, 7, 9);
      }
    }
    g.strokeStyle = '#2a5a2a'; g.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { const vx = x + R() * w; g.beginPath(); g.moveTo(vx, base - h + R() * 20); g.quadraticCurveTo(vx + 5, base - h * 0.5, vx - 3, base - R() * 30); g.stroke(); }
  }
  function streetlamp(g, x, base, on) {
    segs(g, [[x, base], [x, base - 70], [x + 14, base - 74]], 3, '#3a3e44', OUT);
    rect(g, x + 10, base - 76, 10, 4, '#2a2a2a');
    if (on) { g.fillStyle = 'rgba(255,230,150,0.18)'; g.beginPath(); g.moveTo(x + 11, base - 72); g.lineTo(x - 14, base); g.lineTo(x + 46, base); g.lineTo(x + 19, base - 72); g.fill(); }
  }
  function basalt(g, R, x0, x1, top, base) {
    for (let x = x0; x < x1; x += 10 + R() * 6) {
      const h = (base - top) * (0.5 + R() * 0.5), w = 10 + R() * 6;
      rect(g, x, base - h, w, h, R() < 0.5 ? '#2a2228' : '#342a30');
      g.fillStyle = '#4a3a40'; g.fillRect(x, base - h, w, 2);
    }
  }
  function mineEntrance(g, x, base) {
    g.fillStyle = OUT; g.beginPath(); g.ellipse(x, base, 44, 60, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#0c0808'; g.beginPath(); g.ellipse(x, base, 40, 56, 0, Math.PI, 0); g.fill();
    rect(g, x - 44, base - 62, 8, 62, '#6b4a2e'); rect(g, x + 36, base - 62, 8, 62, '#6b4a2e');
    rect(g, x - 50, base - 68, 100, 8, '#7b5a36');
    g.fillStyle = '#ffd040'; g.fillRect(x - 3, base - 66, 6, 4);
  }
  function minecart(g, x, base) {
    rect(g, x - 16, base - 20, 32, 14, '#5a5a62');
    g.fillStyle = '#7a7a82'; g.fillRect(x - 16, base - 20, 32, 2);
    g.fillStyle = '#c0703a'; for (let i = 0; i < 5; i++) blob(g, x - 10 + i * 5, base - 21, 3, i % 2 ? '#8a5a3a' : '#c09060');
    [-9, 9].forEach(dx => { blob(g, x + dx, base - 5, 4, OUT); blob(g, x + dx, base - 5, 3, '#3a3a3a'); });
  }
  function crystal(g, x, base, s, col) {
    g.fillStyle = OUT; g.beginPath(); g.moveTo(x - 4 * s, base); g.lineTo(x - 2 * s, base - 12 * s); g.lineTo(x, base - 16 * s); g.lineTo(x + 3 * s, base - 10 * s); g.lineTo(x + 4 * s, base); g.fill();
    g.fillStyle = col; g.beginPath(); g.moveTo(x - 3 * s, base); g.lineTo(x - 1.5 * s, base - 11 * s); g.lineTo(x, base - 14 * s); g.lineTo(x + 2.5 * s, base - 9 * s); g.lineTo(x + 3 * s, base); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x - 1 * s, base - 10 * s, 1 * s, 6 * s);
  }
  function tank(g, x, base, col) {
    rect(g, x - 18, base - 74, 36, 74, '#3a4048');
    g.fillStyle = col || '#e09a2a'; g.fillRect(x - 14, base - 66, 28, 54);
    const gr = g.createLinearGradient(x - 14, 0, x + 14, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(0.3, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.25)');
    g.fillStyle = gr; g.fillRect(x - 14, base - 66, 28, 54);
    // zarodek dinozaura
    g.fillStyle = 'rgba(80,40,10,0.6)'; g.beginPath(); g.ellipse(x, base - 38, 8, 11, 0.3, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x + 4, base - 50, 4, 3, 0.4, 0, Math.PI * 2); g.fill();
    rect(g, x - 20, base - 78, 40, 6, '#5a6068'); rect(g, x - 20, base - 12, 40, 6, '#5a6068');
    g.fillStyle = '#9aa3ad'; g.fillRect(x - 20, base - 78, 40, 1);
  }
  function consoleDesk(g, x, base) {
    rect(g, x - 26, base - 30, 52, 30, '#3a4048');
    rect(g, x - 22, base - 52, 44, 22, '#2a2e34');
    g.fillStyle = '#1a3a2a'; g.fillRect(x - 19, base - 49, 38, 16);
    g.fillStyle = '#5af08a'; for (let i = 0; i < 5; i++) g.fillRect(x - 17, base - 47 + i * 3, 10 + (i * 7) % 20, 1);
    ['#f04040', '#f0d040', '#40c0f0', '#40f080'].forEach((c, i) => { g.fillStyle = c; g.fillRect(x - 20 + i * 10, base - 24, 5, 3); });
  }
  function pipesWall(g, R, x0, x1, top) {
    for (let i = 0; i < 4; i++) {
      const y = top + i * 18 + R() * 6;
      rect(g, x0, y, x1 - x0, 6, ['#5a6068', '#6a5a48', '#4a5a50', '#5a5060'][i]);
      for (let x = x0 + 30; x < x1; x += 70 + R() * 40) rect(g, x, y - 2, 6, 10, '#7a828a');
    }
  }
  function fortressWall(g, R, x0, x1, top, base, col) {
    rect(g, x0, top, x1 - x0, base - top, col);
    g.fillStyle = shade(col, -0.2);
    for (let y = top + 4; y < base; y += 10) for (let x = x0 + ((y / 10) % 2) * 10; x < x1; x += 20) g.fillRect(x, y, 18, 1);
    for (let x = x0; x < x1; x += 16) { if ((x / 16) % 2) continue; rect(g, x, top - 10, 10, 10, col); }
  }
  function fence(g, x0, x1, base) {
    for (let x = x0; x < x1; x += 16) { g.fillStyle = OUT; g.fillRect(x - 2, base - 40, 5, 40); g.fillStyle = '#7a5a3a'; g.fillRect(x - 1, base - 39, 3, 39); }
    g.strokeStyle = '#9aa3ad'; g.lineWidth = 1;
    for (let k = 0; k < 4; k++) { g.beginPath(); for (let x = x0; x < x1; x += 4) g.lineTo(x, base - 34 + k * 9 + Math.sin(x * 0.2) * 1); g.stroke(); }
  }
  function cliff(g, R, x0, x1, top, base, strata) {
    strata = strata || ['#9a7a5a', '#b08c64', '#8a6a4c', '#a88a6a', '#7a5e44'];
    g.fillStyle = OUT; g.beginPath(); g.moveTo(x0, base);
    const pts = [];
    for (let x = x0; x <= x1; x += 12) pts.push([x, top + R() * 16]);
    pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(x1, base); g.closePath(); g.fill();
    for (let i = 0; i < strata.length; i++) {
      const y0 = top + i * (base - top) / strata.length;
      g.fillStyle = strata[i];
      g.beginPath(); g.moveTo(x0, base);
      pts.forEach(p => g.lineTo(p[0], Math.max(p[1] + 2, y0 + Math.sin(p[0] * 0.03 + i) * 4)));
      g.lineTo(x1, base); g.closePath(); g.fill();
    }
    g.fillStyle = 'rgba(40,20,10,0.35)';
    for (let i = 0; i < (x1 - x0) / 10; i++) g.fillRect(x0 + R() * (x1 - x0), top + 10 + R() * (base - top - 10), 2 + R() * 8, 1);
  }
  function scaffold(g, x, base, h) {
    const draw = (c, w) => {
      g.strokeStyle = c; g.lineWidth = w; g.beginPath();
      g.moveTo(x - 20, base); g.lineTo(x - 20, base - h); g.moveTo(x + 20, base); g.lineTo(x + 20, base - h);
      for (let y = base; y > base - h; y -= 24) { g.moveTo(x - 20, y); g.lineTo(x + 20, y - 24); g.moveTo(x - 20, y - 24); g.lineTo(x + 20, y - 24); }
      g.stroke();
    };
    draw(OUT, 4); draw('#8b6238', 2);
  }
  function ridge(g, R, w, col, base, amp, step) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= w + step; x += step) g.lineTo(x, base - R() * amp);
    g.lineTo(w, H); g.closePath(); g.fill();
  }
  // podłoże: pas z gradientem i szumem
  function ground(g, R, a, b, c1, c2, speck) {
    const gr = g.createLinearGradient(0, FLOOR_TOP, 0, H);
    gr.addColorStop(0, c2); gr.addColorStop(1, c1);
    g.fillStyle = gr; g.fillRect(a, FLOOR_TOP, b - a, H - FLOOR_TOP);
    g.fillStyle = OUT; g.fillRect(a, FLOOR_TOP, b - a, 2);
    for (let i = 0; i < (b - a) / (speck || 3); i++) {
      g.fillStyle = R() < 0.5 ? shade(c1, -0.15) : shade(c1, 0.12);
      g.fillRect(a + R() * (b - a), FLOOR_TOP + 3 + R() * (H - FLOOR_TOP), 1 + R() * 3, 1);
    }
  }
  function skyGrad(ctx, stops) {
    const g = ctx.createLinearGradient(0, 0, 0, FLOOR_TOP);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR_TOP);
  }

  // ---------------------------------------------------------------- fabryka etapu
  function makeStage(cfg) {
    const st = Object.assign({ W, H, FLOOR_TOP, FLOOR_BOTTOM, startX: 90, farP: 0.2, midP: 0.5, frontP: 1.25, diff: 1, PICKUPS: [] }, cfg);
    st.buildLayers = function () {
      if (st._layers) return st._layers;
      const L = {};
      const mk = (p, fn, seed) => {
        if (!fn) return null;
        const c = canvas(Math.ceil(st.LEN * p + W + 40), H);
        fn(c.getContext('2d'), rng(seed), c.width);
        return c;
      };
      L.far = mk(st.farP, st.far, 7);
      L.mid = mk(st.midP, st.mid, 11);
      L.near = mk(1, st.near, 23);
      L.front = mk(st.frontP, st.front, 41);
      st._layers = L;
      return L;
    };
    st.drawBack = function (ctx, L, camX, t) {
      st.sky(ctx, camX, t);
      if (L.far) ctx.drawImage(L.far, -Math.round(camX * st.farP), 0);
      if (st.farAnim) st.farAnim(ctx, camX, t);
      if (L.mid) ctx.drawImage(L.mid, -Math.round(camX * st.midP), 0);
      ctx.drawImage(L.near, -Math.round(camX), 0);
      if (st.anim) st.anim(ctx, camX, t);
    };
    st.drawFront = function (ctx, L, camX, t) {
      if (L.front) ctx.drawImage(L.front, -Math.round(camX * st.frontP), 0);
      if (st.overlay) st.overlay(ctx, camX, t);
    };
    return st;
  }

  global.STAGES = global.STAGES || [];
  global.Scenery = {
    W, H, FLOOR_TOP, FLOOR_BOTTOM, OUT, rng, canvas, blob, rect, segs, shade,
    canopy, palm, bigTree, deadTree, fern, reeds, hut, shack, derrick, pumpjack, boardwalk, pipeline, sign, car, bus,
    tent, cage, crates, container, crane, warehouse, building, streetlamp, basalt, mineEntrance, minecart, crystal,
    tank, consoleDesk, pipesWall, fortressWall, fence, cliff, scaffold, ridge, ground, skyGrad, makeStage
  };
})(window);
