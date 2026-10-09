/* Etap bonusowy 2 — „Zagroda”: obóz kłusowników nocą, 10 klatek z młodymi dinozaurami do rozbicia w 45 s. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 720;
  const LIGHTS = [120, 380, 620];

  window.SPECIAL_STAGES = window.SPECIAL_STAGES || {};
  window.SPECIAL_STAGES.cages = S.makeStage({
    name: 'BONUS — ZAGRODA', sub: 'UWOLNIJ 10 DINOZAURÓW W 45 SEKUND!', label: 'B',
    LEN, music: 'drive', bossMusic: 'drive', special: 'cages', time: 45, diff: 1.3,
    sky(ctx, camX, t) {
      S.skyGrad(ctx, ['#06081a', '#14183a', '#2a2a4a']);
      for (let i = 0; i < 30; i++) { const x = (i * 61) % W, y = (i * 29) % 80; if ((t + i * 11) % 140 < 120) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x, y, 1, 1); } }
      ctx.fillStyle = '#e8e6d0'; ctx.beginPath(); ctx.arc(320, 36, 11, 0, Math.PI * 2); ctx.fill();
    },
    far(g, R, w) { S.ridge(g, R, w, '#1a1e34', 120, 24, 22); },
    mid(g, R, w) {
      g.fillStyle = '#14261e'; g.fillRect(0, 130, w, H - 130);
      for (let x = 0; x < w; x += 22 + R() * 14) S.canopy(g, R, x, 126, 40, 24, ['#0e1e18', '#142a20', '#1a3426']);
    },
    near(g, R, nw) {
      S.fence(g, 0, nw, FLOOR_TOP);
      S.tent(g, 70, FLOOR_TOP - 1, '#5a6a4a');
      S.crates(g, 250, FLOOR_TOP - 1, '#5a5a3a');
      S.tent(g, 470, FLOOR_TOP - 1, '#6a5a4a');
      S.sign(g, 560, FLOOR_TOP, 'ZAGRODA', '#8a3a2a');
      LIGHTS.forEach(x => {
        S.rect(g, x - 2, 40, 4, FLOOR_TOP - 40, '#3a3a3a');
        S.rect(g, x - 9, 34, 18, 8, '#2a2a2a'); g.fillStyle = '#fff4c0'; g.fillRect(x - 7, 36, 14, 4);
      });
      S.ground(g, R, 0, nw, '#4a3a28', '#3a2e20');
      for (let i = 0; i < 16; i++) { g.fillStyle = 'rgba(30,20,10,0.5)'; g.beginPath(); g.ellipse(R() * nw, FLOOR_TOP + 10 + R() * 55, 8 + R() * 12, 2 + R() * 2, 0, 0, Math.PI * 2); g.fill(); }
    },
    anim(ctx, camX, t) {
      LIGHTS.forEach((x, i) => {
        const sx = x - camX; if (sx < -80 || sx > W + 80) return;
        const a = Math.sin(t * 0.02 + i * 2) * 0.5;
        ctx.fillStyle = 'rgba(255,250,200,0.10)';
        ctx.beginPath(); ctx.moveTo(sx, 40); ctx.lineTo(sx + Math.sin(a) * 140 - 34, FLOOR_TOP + 60); ctx.lineTo(sx + Math.sin(a) * 140 + 34, FLOOR_TOP + 60); ctx.fill();
      });
    },
    WAVES: [],
    PROPS: [
      { x: 140, y: 175, kind: 'pen' }, { x: 200, y: 205, kind: 'pen' }, { x: 260, y: 168, kind: 'pen' },
      { x: 330, y: 196, kind: 'pen' }, { x: 400, y: 172, kind: 'pen' }, { x: 450, y: 210, kind: 'pen' },
      { x: 520, y: 182, kind: 'pen' }, { x: 580, y: 204, kind: 'pen' }, { x: 640, y: 170, kind: 'pen' }, { x: 680, y: 196, kind: 'pen' },
      { x: 300, y: 214, kind: 'fuel' }, { x: 560, y: 166, kind: 'fuel' }, { x: 110, y: 205, kind: 'crate', drop: 'meat' }
    ]
  });
})();
