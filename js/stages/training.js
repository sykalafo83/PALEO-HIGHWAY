/* Tryb treningowy — polana z manekinami, bez fal wrogów i limitu czasu. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 560;

  window.SPECIAL_STAGES = window.SPECIAL_STAGES || {};
  window.SPECIAL_STAGES.training = S.makeStage({
    name: 'TRENING', sub: 'MANEKINY NIE ODDAJĄ — ĆWICZ DO WOLI', label: 'T',
    LEN, music: 'map', bossMusic: 'map', special: 'training', diff: 1,
    sky(ctx) { S.skyGrad(ctx, ['#3a6aa0', '#a8c890', '#e8e0a8']); },
    far(g, R, w) { S.ridge(g, R, w, '#6a8a9a', 110, 30, 22); },
    mid(g, R, w) {
      g.fillStyle = '#3a6a3a'; g.fillRect(0, 130, w, H - 130);
      for (let x = 0; x < w; x += 24 + R() * 16) S.canopy(g, R, x, 126, 46, 26, ['#2a5a32', '#3a7a3a', '#4e9a44']);
    },
    near(g, R, nw) {
      for (let x = 10; x < nw; x += 70) { S.rect(g, x, FLOOR_TOP - 46, 6, 46, '#8a6a3a'); S.rect(g, x - 4, FLOOR_TOP - 50, 14, 5, '#6a4a2a'); }
      S.rect(g, 0, FLOOR_TOP - 34, nw, 3, '#a07a46');
      // tarcze strzelnicze
      [150, 330, 470].forEach(x => {
        S.blob(g, x, FLOOR_TOP - 70, 14, OUT); S.blob(g, x, FLOOR_TOP - 70, 13, '#f0ece0');
        S.blob(g, x, FLOOR_TOP - 70, 9, '#c03a2a'); S.blob(g, x, FLOOR_TOP - 70, 5, '#f0ece0'); S.blob(g, x, FLOOR_TOP - 70, 2, '#c03a2a');
      });
      S.sign(g, 250, FLOOR_TOP, 'TRENING', '#3a6a3a');
      S.ground(g, R, 0, nw, '#a88a5a', '#987a4c');
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1; g.strokeRect(40, FLOOR_TOP + 8, nw - 80, 54);
    },
    WAVES: [],
    PROPS: [{ x: 60, y: 200, kind: 'barrel', drop: 'meat' }, { x: 520, y: 172, kind: 'fuel' }]
  });
})();
