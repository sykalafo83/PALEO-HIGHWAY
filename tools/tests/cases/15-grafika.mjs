// Grafika: dodatki wrogów, klatka uderzenia, kałuże z odbiciami, światło w kanałach, portret w HUD
// oraz tryb demo na ekranie tytułowym (komputer sam gra, przycisk wraca do menu).
export default {
  name: 'Grafika i tryb demo',
  timeout: 120,
  async run(t) {
    const clear = (idx, extra) => t.ev(`(() => { __paleo.newStage(${idx}); const G = __paleo.G; G.introT = 0; G.actors = G.actors.filter(a => a.kind === 'player'); G.pending = []; G.wave = null; G.lockX = null; G.waveIdx = 99; G.camX = 600; const p = G.players[0]; p.x = 640; p.y = 186; p.state = 'idle'; ${extra || ''} })()`);
    // wrogowie z dodatkami rozpoznawczymi
    t.assert(await t.ev(`['grunt', 'thin', 'brute', 'bomber', 'gunner', 'sniper', 'netter', 'flamer', 'glider'].every(k => (__paleo.ENEMIES[k].mk().acc || []).length > 0)`), 'każdy typ kłusownika ma dodatek');
    await clear(0, `G.wx = { id: 'rain', name: 'DESZCZ', tint: '#a0a8c0', rain: true };`);
    await t.ev(`['grunt', 'flamer', 'netter', 'glider'].forEach((k, i) => { const e = __paleo.spawn(k, 680 + i * 40, 180 + i * 8); e.cool = 9999; })`);
    // trafienie: zatrzymanie z białą klatką i mina bólu w HUD
    await t.ev(`__paleo.hurt(__paleo.G.players[0], 4, null)`);
    t.assert(await t.ev(`__paleo.G.frame - __paleo.G.players[0].hurtF < 30`), 'portret w HUD wie o trafieniu');
    await t.sleep(600); await t.shot('deszcz-wrogowie');
    await t.ev(`(() => { const p = __paleo.G.players[0]; p.hp = 5; p.fury = 100; })()`); await t.sleep(300);
    // kanały: światło lamp i wybuch
    await clear(6, `G.ev = null; G.fx.push({ type: 'boom', x: 760, y: 190, z: 0, t: 0, life: 24 });`);
    await t.sleep(100); await t.shot('kanaly');
    // tryb demo: po bezczynności na ekranie tytułowym komputer gra sam
    await t.ev(`(() => { const a = __paleo.app; a.mode = 'title'; a.t = 0; a.attractDemo = false; a.idle = 899; })()`);
    t.assert(await t.until(`!!__paleo.app.demo && __paleo.app.mode === 'play'`, 2000), 'po bezczynności startuje demo');
    const x0 = await t.ev(`__paleo.G.players[0].x`);
    await t.sleep(5000); await t.shot('demo');
    t.assert(await t.ev(`__paleo.G.players[0].x !== ${x0} || __paleo.G.players[0].score > 0`), 'komputer steruje postacią');
    t.assert(await t.ev(`__paleo.app.gameMode === 'demo'`), 'demo nie zapisuje postępu ani wyników');
    await t.tap('KeyJ'); await t.sleep(300);
    t.assert(await t.ev(`__paleo.app.mode === 'title' && !__paleo.app.demo && __paleo.app.gameMode !== 'demo'`), 'przycisk kończy demo i wraca do menu');
  }
};
