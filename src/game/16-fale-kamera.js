  // =============================================================== FALE / KAMERA
  function updateWaves() {
    const WV = G.WAVES;
    if (!G.wave && G.waveIdx < WV.length && G.camX >= WV[G.waveIdx].lock - 0.5) {
      G.wave = WV[G.waveIdx]; G.groupIdx = 0; G.lockX = G.wave.lock;
      queueGroup(G.wave.groups[0]);
      if (G.wave.boss) AU.play(ST.bossMusic);
    }
    customEnd();
    for (let i = G.pending.length - 1; i >= 0; i--) {
      const s = G.pending[i];
      if (--s.delay > 0) continue;
      G.pending.splice(i, 1);
      const hop = s.side === 'T' || s.side === 'B';   // wskakuje z boku toru (pociąg) — z tyłu albo z przodu platformy
      const x = hop ? G.camX + rnd(70, W - 70) : s.side === 'L' ? G.camX - 30 : G.camX + W + 30;
      const e = makeEnemy(s.type, x, s.y || 186);
      e.face = s.side === 'L' ? 1 : -1;
      if (hop) {
        const dk = ST.deck || { y0: FLOOR_TOP + 10, y1: FLOOR_BOTTOM - 4 };
        e.y = s.side === 'T' ? FLOOR_TOP + 6 : FLOOR_BOTTOM;
        const to = s.side === 'T' ? dk.y0 + 8 : dk.y1 - 8;
        setState(e, 'hopin'); e.z = 10; e.vz = 5; e.fvy = (to - e.y) / 33; e.face = e.x < G.camX + W / 2 ? 1 : -1; sfx('jump');
      }
      if (s.type === 'sniper') { e.perch = true; e.z = 42; e.x = s.side === 'L' ? G.camX + 46 : G.camX + W - 46; e.y = FLOOR_TOP + 8; setState(e, 'idle'); e.cool = 80; }
      if (s.type === 'ptera') e.z = 80;
      if (OPTS.assist && HINTS[s.type] && !app.hinted[s.type]) { app.hinted[s.type] = 1; G.hint = { txt: HINTS[s.type], t: 300 }; }
      G.actors.push(e);
    }
    if (G.wave) {
      const alive = foes().filter(a => a.hp > 0).length;
      if (G.pending.length === 0) {
        const next = G.wave.groups[G.groupIdx + 1];
        if (next && alive <= next.when) { G.groupIdx++; queueGroup(next); }
        else if (!next && alive === 0 && !G.wave.boss) {
          G.wave = null; G.waveIdx++; G.lockX = null; G.goT = 180; G.timer = 99; sfx('go');
        }
      }
    }
  }
  // własny etap bez bossa kończy się po ostatniej fali na końcu planszy
  function customEnd() {
    if (!ST.custom || G.bossDead || G.wave || G.waveIdx < G.WAVES.length) return;
    if (G.camX >= ST.LEN - W - 4 && !foes().some(a => a.hp > 0) && !G.pending.length) { G.bossDead = true; G.clearT = 0; AU.stopMusic(0.5); }
  }
  function queueGroup(g) { g.spawns.forEach(s => G.pending.push(Object.assign({}, s, { delay: (s.delay || 0) + 1 }))); }

  // NG+: wrogowie podmieniani w obrębie swojej grupy
  const TIERS = [['grunt', 'thin', 'bomber', 'netter'], ['brute', 'shield', 'gunner', 'sniper'], ['raptor', 'pachy', 'para', 'trike', 'ptera']];
  function shuffleWaves(WV, rand) {
    rand = rand || Math.random;
    const copy = JSON.parse(JSON.stringify(WV));
    copy.forEach(w => w.groups.forEach(g => g.spawns.forEach(sp => {
      if (ENEMIES[sp.type].boss) return;
      const tier = TIERS.find(t => t.includes(sp.type));
      if (tier) sp.type = tier[rand() * tier.length | 0];
    })));
    return copy;
  }
  function updateCamera() {
    if (G.special === 'escape') return;
    const ps = G.players.filter(q => q.alive && q.state !== 'dead');
    if (!ps.length) return;
    const minX = Math.min(...ps.map(q => q.x)), farX = Math.max(...ps.map(q => q.x));
    let target = Math.min((minX + farX) / 2 - W * 0.42, minX - 24);
    const maxX = G.lockX !== null ? G.lockX : (G.waveIdx < G.WAVES.length ? G.WAVES[G.waveIdx].lock : ST.LEN - W);
    target = clamp(target, G.special ? 0 : G.camX, Math.min(maxX, ST.LEN - W));
    G.camX += clamp(target - G.camX, -2.6, 2.6);
  }

