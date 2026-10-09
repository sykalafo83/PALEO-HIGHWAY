// Ataki specjalne bossów: druga faza (szarże), deszcz odłamków Kolosa, atak Zębacza z rynny ściekowej.
export default {
  name: 'Ataki specjalne bossów',
  timeout: 120,
  async run(t) {
    const arena = async (idx, type) => {
      await t.ev(`__paleo.newStage(${idx})`); await t.sleep(200);
      await t.ev(`(() => { const G = __paleo.G; G.introT = 0; G.wx = null; G.ev = null; G.actors = G.actors.filter(a => a.kind === 'player'); G.pending = [{ type: '${type}', side: 'R', y: 185, delay: 1 }]; G.wave = null; G.lockX = null; G.waveIdx = 99; G.camX = 400; const p = G.players[0]; p.x = 470; p.y = 185; })()`);
      t.assert(await t.until(`__paleo.G.actors.some(a => a.type === '${type}')`, 3000), type + ' się pojawia');
      await t.ev(`(() => { const b = __paleo.G.actors.find(a => a.type === '${type}'); b.state = 'idle'; b.t = 0; b.cool = 999; b.x = 640; b.y = 185; window.__b = b; __paleo.G.introBoss = null; })()`);
    };
    // Kapitan Rdza: druga faza przy 30% życia
    await arena(0, 'boss');
    await t.ev(`window.__b.hp = window.__b.maxHp * 0.25; window.__b.cool = 0`);
    t.assert(await t.until(`window.__b.phase2 && ['rage', 'rampage', 'rampwait'].includes(window.__b.state)`, 3000), 'Kapitan: ostatni atak (szarże)');
    // Kolos: deszcz odłamków
    await arena(0, 'kolos');
    const hp0 = await t.ev('__paleo.G.players[0].hp');
    await t.ev(`(() => { const b = window.__b; b.state = 'shards'; b.t = 0; })()`);
    t.assert(await t.until(`(__paleo.G.drops || []).length > 0`, 2000), 'Kolos: cienie odłamków pod graczem');
    await t.sleep(400); await t.shot('odlamki');
    t.assert(await t.until(`__paleo.G.players[0].hp < ${hp0}`, 3000), 'Kolos: stojący w cieniu gracz obrywa');
    // Zębacz: zanurzenie, pościg pod powierzchnią, wyskok
    await arena(6, 'deino');
    await t.ev(`(() => { const p = __paleo.G.players[0]; p.hp = p.maxHp; p.invuln = 0; const b = window.__b; b.state = 'submerge'; b.t = 0; })()`);
    t.assert(await t.until(`window.__b.state === 'swim' && window.__b.alpha === 0`, 2000), 'Zębacz znika w rynnie');
    await t.shot('babelki');
    t.assert(await t.until(`window.__b.state === 'leap'`, 3000), 'Zębacz wyskakuje');
    t.assert(await t.until(`window.__b.state === 'dazed' && window.__b.z === 0`, 3000), 'Zębacz ląduje i jest ogłuszony');
    t.assert(await t.ev('__paleo.G.players[0].hp < __paleo.G.players[0].maxHp'), 'lądowanie rani gracza, który się nie ruszył');
  }
};
