// Wydarzenia i pogoda: przypływ spowalnia, fala ścieków przewraca, szczury, wiatr i poślizg w deszczu.
export default {
  name: 'Wydarzenia etapów i pogoda',
  timeout: 120,
  async run(t) {
    const clear = idx => t.ev(`(() => { __paleo.newStage(${idx}); const G = __paleo.G; G.introT = 0; G.wx = null; G.actors = G.actors.filter(a => a.kind === 'player'); G.pending = []; G.wave = null; G.lockX = null; G.waveIdx = 99; G.camX = 600; const p = G.players[0]; p.x = 700; p.y = 160; p.state = 'idle'; })()`);
    // przypływ
    await clear(5); await t.ev(`__paleo.G.ev = { t: 1450, level: 0 }`); await t.sleep(1500);
    t.assert(await t.ev('__paleo.G.tideY > 170'), 'woda się podnosi');
    const x0 = await t.ev('__paleo.G.players[0].x'); await t.hold('KeyD', 500);
    const wet = await t.ev('__paleo.G.players[0].x') - x0;
    await t.ev(`(() => { const G = __paleo.G; G.ev = { t: 0, level: 0 }; G.tideY = 0; G.players[0].y = 200; })()`); await t.sleep(200);
    const x1 = await t.ev('__paleo.G.players[0].x'); await t.hold('KeyD', 500);
    const dry = await t.ev('__paleo.G.players[0].x') - x1;
    t.assert(wet < dry * 0.75, `woda spowalnia (${Math.round(wet)} < ${Math.round(dry)})`);
    // fala ścieków: na dole przewraca, na podwyższeniu nie
    await clear(6); await t.ev(`(() => { const G = __paleo.G; G.ev = { t: 899, level: 0 }; G.players[0].y = 200; })()`);
    t.assert(await t.until(`__paleo.G.popups.some(q => q.txt === 'ZALANY!')`, 4000), 'fala ścieków trafia gracza na dole');
    // szczury
    await t.ev(`(() => { const G = __paleo.G; G.rats = [{ x: G.players[0].x + 16, y: G.players[0].y, vx: 0.05, t: 0 }]; G.players[0].face = 1; G.players[0].state = 'idle'; G.players[0].y = G.rats[0].y; })()`);
    await t.sleep(1500);
    await t.ev(`(() => { const G = __paleo.G, p = G.players[0]; G.rats = [{ x: p.x + 16, y: p.y, vx: 0.05, t: 0 }]; p.state = 'idle'; })()`);
    await t.tap('KeyJ'); await t.sleep(250);
    t.assert(await t.ev('__paleo.G.ratKills') >= 1, 'szczura można złapać ciosem');
    // deszcz: poślizg po biegu i wiatr
    await clear(0);
    await t.ev(`__paleo.G.wx = { id: 'rain', name: 'DESZCZ', tint: '#a0a8c0', rain: true }`); await t.sleep(200);
    await t.tap('KeyD', 40); await t.key('KeyD', 'keyDown'); await t.sleep(600); await t.key('KeyD', 'keyUp'); await t.sleep(300);
    t.assert(await t.ev(`__paleo.G.popups.some(q => q.txt === 'POŚLIZG!')`), 'poślizg w deszczu po biegu');
    t.assert(Math.abs(await t.ev('__paleo.G.wind')) > 0, 'w deszczu wieje wiatr');
  }
};
