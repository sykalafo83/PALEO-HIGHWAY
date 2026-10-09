/* Tryb przetrwania — arena w kamieniołomie nocą, niekończące się fale wrogów. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = W + 120;
  const TORCHES = [40, 170, 330, 460];

  window.SPECIAL_STAGES = window.SPECIAL_STAGES || {};
  window.SPECIAL_STAGES.survival = S.makeStage({
    name: 'PRZETRWANIE', sub: 'ILE FAL WYTRZYMASZ?', label: 'P',
    LEN, music: 'boss', bossMusic: 'final', special: 'survival', diff: 1,
    sky(ctx, camX, t) {
      S.skyGrad(ctx, ['#0a0612', '#1e1430', '#3a2236']);
      for (let i = 0; i < 24; i++) { const x = (i * 67) % W, y = (i * 23) % 60; if ((t + i * 9) % 150 < 120) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(x, y, 1, 1); } }
    },
    far(g, R, w) { S.ridge(g, R, w, '#1e1626', 110, 30, 18); },
    mid(g, R, w) {
      // trybuny z widzami-kłusownikami
      for (let r = 0; r < 3; r++) {
        g.fillStyle = ['#2a2030', '#241a2a', '#1e1624'][r]; g.fillRect(0, 104 + r * 14, w, 14);
        for (let x = 4; x < w; x += 9 + R() * 6) { g.fillStyle = R() < 0.5 ? '#3a2a3a' : '#4a3438'; g.beginPath(); g.arc(x, 104 + r * 14 - 2, 3, 0, Math.PI * 2); g.fill(); g.fillRect(x - 3, 104 + r * 14, 6, 6); }
      }
    },
    near(g, R, nw) {
      S.cliff(g, R, 0, nw, 40, 106, ['#4a3a3a', '#3a2e30', '#2e2428']);
      S.fence(g, 0, nw, FLOOR_TOP);
      TORCHES.forEach(x => { S.rect(g, x - 2, FLOOR_TOP - 46, 4, 46, '#4a3220'); S.rect(g, x - 5, FLOOR_TOP - 50, 10, 5, '#2a1a10'); });
      S.sign(g, nw / 2, FLOOR_TOP, 'ARENA', '#8a2a2a');
      S.ground(g, R, 0, nw, '#6a5040', '#5a4236');
      g.strokeStyle = 'rgba(255,220,180,0.18)'; g.lineWidth = 2; g.beginPath(); g.ellipse(nw / 2, 186, nw * 0.42, 24, 0, 0, Math.PI * 2); g.stroke();
    },
    anim(ctx, camX, t) {
      TORCHES.forEach((x, i) => {
        const sx = x - camX; if (sx < -20 || sx > W + 20) return;
        for (let k = 0; k < 4; k++) {
          const p = (t * 0.07 + k / 4 + i * 0.3) % 1;
          ctx.fillStyle = p < 0.4 ? '#ffe36a' : p < 0.7 ? '#ff9a2a' : 'rgba(200,60,20,0.6)';
          ctx.beginPath(); ctx.arc(sx + Math.sin(k * 3 + t * 0.2) * 2, FLOOR_TOP - 52 - p * 12, 3 * (1 - p) + 1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,160,60,0.08)'; ctx.beginPath(); ctx.arc(sx, FLOOR_TOP - 50, 40, 0, Math.PI * 2); ctx.fill();
      });
    },
    WAVES: [],
    PROPS: []
  });
})();
