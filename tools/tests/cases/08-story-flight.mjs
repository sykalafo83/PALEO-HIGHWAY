// Komiksowy przerywnik (wszystkie kadry) oraz bonus „Lot nad Zatoką” do wyniku i powrotu na mapę.
export default {
  name: 'Komiks i lot nad zatoką',
  timeout: 120,
  async run(t) {
    await t.ev(`(() => { const a = __paleo.app; a.gameMode = 'arcade'; a.skipShop = true; a.route = [0, 1, 2, 4]; a.mode = 'map'; a.mapTo = 5; a.mapFrom = 5; a.t = 330; a.mapChoice = null;
      a.mapTeam = [{ key: 'kruk', b: __paleo.CHARS.kruk.build, name: 'KRUK' }]; })()`);
    t.assert(await t.until(`__paleo.app.mode === 'story'`, 3000), 'mapa prowadzi do przerywnika');
    const n = await t.ev('__paleo.app.story.lines.length');
    for (let i = 0; i < n * 2 + 2 && await t.ev(`__paleo.app.mode === 'story'`); i++) { await t.tap('Enter'); await t.sleep(250); if (i === 2) await t.shot('komiks'); }
    t.assert(await t.until(`__paleo.app.mode === 'play' && __paleo.G.stageIdx === 5`, 3000), 'po komiksie startuje etap');
    // lot
    await t.ev(`__paleo.startFlight()`);
    t.assert(await t.ev(`__paleo.app.mode === 'bonus' && __paleo.app.bonusKind === 'flight'`), 'lot startuje');
    await t.sleep(3200);
    for (let i = 0; i < 6; i++) { await t.tap('KeyJ', 40); await t.sleep(120); }
    t.assert(await t.ev(`__paleo.curBonus().state.phase === 'fly'`), 'pteranodon leci');
    await t.ev(`__paleo.curBonus().state.timer = 2`);
    t.assert(await t.until(`__paleo.curBonus().state.phase === 'result'`, 5000), 'koniec lotu i wynik');
    await t.sleep(1200); await t.tap('Enter'); await t.sleep(300);
    t.assert(await t.until(`__paleo.app.mode === 'map' || __paleo.app.mode === 'story'`, 3000), 'po locie mapa w stronę Kanałów');
    t.assert(await t.ev('__paleo.app.mapTo') === 6, 'następny etap: Kanały');
  }
};
