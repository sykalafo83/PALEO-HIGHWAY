// Tryby: wyzwania (sukces i porażka), codzienne wyzwanie (deterministyczne), przetrwanie, Boss Rush, trening.
export default {
  name: 'Tryby: wyzwania, codzienne, przetrwanie, Boss Rush, trening',
  timeout: 120,
  async run(t) {
    // Poskromiciel — Zębacz pokonany szybko = 3 gwiazdki
    await t.ev(`__paleo.startChallenge('zebacz')`);
    t.assert(await t.until(`__paleo.G.actors.some(a => a.type === 'deino')`, 6000), 'Zębacz pojawia się w wyzwaniu');
    await t.ev(`__paleo.G.actors.filter(a => a.type === 'deino').forEach(b => __paleo.hurt(b, 99999, __paleo.G.players[0]))`);
    t.assert(await t.until(`__paleo.app.mode === 'chalres'`, 3000), 'ekran wyniku wyzwania');
    t.assert(await t.ev('__paleo.app.chRes.ok && __paleo.app.chRes.stars === 3'), 'sukces i 3 gwiazdki');
    t.assert(await t.ev(`JSON.parse(localStorage.getItem('paleo_chal')).zebacz.stars`) === 3, 'gwiazdki zapisane');
    // Nietykalny — obrażenie kończy porażką
    await t.ev(`__paleo.startChallenge('nohit')`); await t.sleep(2500);
    await t.ev(`(() => { const p = __paleo.G.players[0]; p.invuln = 0; __paleo.hurt(p, 5, null); })()`);
    t.assert(await t.until(`__paleo.app.mode === 'chalres' && !__paleo.app.chRes.ok`, 2000), 'Nietykalny: porażka po obrażeniach');
    // Rzutowiec startuje na arenie przetrwania
    await t.ev(`__paleo.startChallenge('throws')`); await t.sleep(300);
    t.assert(await t.ev(`__paleo.G.special === 'survival' && __paleo.G.ch.def.id === 'throws'`), 'Rzutowiec na arenie');
    // codzienne: ten sam plan przy każdym wywołaniu
    const a = await t.ev('JSON.stringify(__paleo.dailyPlan())'), b = await t.ev('JSON.stringify(__paleo.dailyPlan())');
    t.assert(a === b, 'plan codziennego wyzwania jest deterministyczny');
    await t.ev(`__paleo.app.gameMode = 'daily'; __paleo.startDaily()`); await t.sleep(300);
    t.assert(await t.ev(`__paleo.G.stageIdx === __paleo.dailyPlan().idx && !!__paleo.G.daily`), 'codzienne wyzwanie na zaplanowanym etapie');
    // przetrwanie, Boss Rush, trening
    await t.ev(`__paleo.app.gameMode = 'survival'; __paleo.startSurvival()`); await t.sleep(300);
    t.assert(await t.ev(`__paleo.G.special === 'survival'`), 'przetrwanie startuje');
    await t.ev(`__paleo.app.gameMode = 'rush'; __paleo.startRush()`); await t.sleep(300);
    t.assert(await t.ev(`__paleo.G.rush === true`), 'Boss Rush startuje');
    await t.ev(`__paleo.app.gameMode = 'training'; __paleo.startTraining()`); await t.sleep(300);
    t.assert(await t.ev(`__paleo.G.special === 'training' && __paleo.G.actors.some(a => a.type === 'dummy')`), 'trening z manekinami');
  }
};
