// Nowości: beczki do rzucania, wrzucanie w zagrożenia, jeździec na raptorze, podpalacz, lotniarz,
// etap pociągu z koparką Brygadzisty oraz zakończenia postaci.
export default {
  name: 'Beczki, zagrożenia, nowi wrogowie, pociąg, zakończenia',
  timeout: 150,
  async run(t) {
    const clear = idx => t.ev(`(() => { __paleo.newStage(${idx}); const G = __paleo.G; G.introT = 0; G.wx = null; G.ev = null; G.actors = G.actors.filter(a => a.kind === 'player'); G.pending = []; G.wave = null; G.lockX = null; G.waveIdx = 99; G.props = []; G.camX = 600; const p = G.players[0]; p.x = 700; p.y = 186; p.state = 'idle'; p.face = 1; p.invuln = 0; })()`);
    const skipStory = async () => { for (let i = 0; i < 16 && await t.ev(`__paleo.app.mode === 'story'`); i++) { await t.tap('Enter'); await t.sleep(200); } };

    // ---- beczka: podnieś (▼ + atak), rzuć, przewraca wszystkich na drodze
    await clear(0);
    await t.ev(`(() => { const G = __paleo.G; G.props.push({ x: 712, y: 186, kind: 'barrel', hp: 2, shake: 0, drop: 'meat' });
      [790, 830].forEach(x => { const e = __paleo.spawn('grunt', x, 186); e.cool = 999; e.face = -1; e.mode = 'approach'; e.modeT = 9999; }); })()`);
    await t.key('KeyS', 'keyDown'); await t.tap('KeyJ'); await t.key('KeyS', 'keyUp');
    t.assert(await t.until(`__paleo.G.players[0].state === 'carry'`, 1500), 'gracz podnosi beczkę');
    await t.shot('beczka-nad-glowa');
    await t.tap('KeyJ');
    t.assert(await t.until(`__paleo.G.shots.some(s => s.type === 'prop')`, 1000), 'beczka leci');
    t.assert(await t.until(`__paleo.G.actors.filter(a => a.type === 'grunt' && (a.state === 'fall' || a.state === 'down')).length === 2`, 2000), 'rzucona beczka przewraca obu wrogów');
    t.assert(await t.until(`__paleo.G.items.some(i => i.type === 'meat')`, 2000), 'rozbita beczka zostawia łup');

    // ---- beczka z paliwem wybucha przy uderzeniu
    await clear(0);
    await t.ev(`(() => { const G = __paleo.G; G.props.push({ x: 712, y: 186, kind: 'fuel', hp: 1, shake: 0 }); const e = __paleo.spawn('brute', 800, 186); e.cool = 999; })()`);
    await t.key('KeyS', 'keyDown'); await t.tap('KeyJ'); await t.key('KeyS', 'keyUp');
    await t.until(`__paleo.G.players[0].state === 'carry'`, 1500); await t.tap('KeyK');
    t.assert(await t.until(`__paleo.G.fx.some(f => f.type === 'boom')`, 2000), 'paliwo wybucha przy uderzeniu');

    // ---- wrzucanie w zagrożenia: lawa i ścieki
    for (const [idx, label] of [[3, 'W LAWIE!'], [6, 'SPŁUKANY!']]) {
      await clear(idx);
      await t.ev(`(() => { const G = __paleo.G, h = __paleo.STAGES[${idx}].HAZARDS[0], p = G.players[0];
        G.camX = Math.max(0, (h.x0 + h.x1) / 2 - 190); p.x = G.camX + 30; p.y = 200; window.__s0 = p.score;
        const e = __paleo.spawn('grunt', (h.x0 + h.x1) / 2, (h.y0 + h.y1) / 2); e.state = 'fall'; e.z = 6; e.vz = -1; e.vx = 0; e.lastPlayer = p; e.bounced = false; })()`);
      t.assert(await t.until(`__paleo.G.popups.some(q => q.txt.startsWith('${label}'))`, 1500), `wróg wrzucony: ${label}`);
      t.assert(await t.ev(`__paleo.G.players[0].score - window.__s0 >= 1000 && !__paleo.G.actors.some(a => a.type === 'grunt')`), 'premia +1000 i wróg usunięty');
    }
    t.assert(await t.ev(`!!__paleo.app.ach.ringout`), 'osiągnięcie SPŁUKANY!');

    // ---- jeździec: przewrócony spada z siodła, raptor zostaje do dosiadania
    await clear(0);
    await t.ev(`(() => { const r = __paleo.spawn('rraptor', 740, 186); r.cool = 999; window.__r = r; })()`);
    await t.sleep(200); await t.shot('jezdziec');
    await t.ev(`__paleo.hurt(window.__r, 5, __paleo.G.players[0], true)`);
    t.assert(await t.ev(`!window.__r.rider && window.__r.team === 'beast' && __paleo.G.actors.some(a => a.type === 'grunt')`), 'jeździec zrzucony z siodła');
    t.assert(await t.until(`window.__r.state === 'tamed'`, 3000), 'raptor czeka na nowego jeźdźca');
    await t.ev(`(() => { const p = __paleo.G.players[0]; p.x = window.__r.x - 14; p.y = window.__r.y; p.state = 'idle'; __paleo.G.actors.filter(a => a.type === 'grunt').forEach(g => { g.hp = 0; g.remove = true; }); })()`);
    await t.tap('KeyJ'); await t.sleep(200);
    t.assert(await t.ev(`!!__paleo.G.players[0].mount`), 'gracz przejmuje raptora');

    // ---- podpalacz: strumień ognia rani i podpala podłogę
    await clear(0);
    await t.ev(`(() => { const e = __paleo.spawn('flamer', 745, 186); e.face = -1; e.state = 'flame'; e.t = 0; window.__hp0 = __paleo.G.players[0].hp; })()`);
    t.assert(await t.until(`(__paleo.G.fires || []).length > 0`, 2000), 'ogień na podłodze');
    await t.shot('podpalacz');
    t.assert(await t.until(`__paleo.G.players[0].hp < window.__hp0`, 2000), 'płomień rani gracza');

    // ---- lotniarz: przelatuje i zrzuca sieć; strącony walczy dalej na ziemi
    await clear(0);
    await t.ev(`(() => { const g = __paleo.spawn('glider', 640, 186); window.__g = g; })()`);
    t.assert(await t.until(`__paleo.G.shots.some(s => s.type === 'netdrop') || __paleo.G.players[0].state === 'netted'`, 4000), 'lotniarz zrzuca sieć');
    await t.shot('lotniarz');
    await t.ev(`__paleo.hurt(window.__g, 5, __paleo.G.players[0], true)`);
    t.assert(await t.until(`window.__g.kind === 'human'`, 4000), 'strącony lotniarz ląduje i walczy pieszo');

    // ---- trasa: po Kanałach (6) jedzie pociąg, potem Twierdza
    await t.ev(`(() => { __paleo.app.gameMode = 'arcade'; __paleo.afterStage(6, __paleo.G.players); })()`);
    await skipStory();
    t.assert(await t.until(`__paleo.G && __paleo.G.special === 'train'`, 3000), 'po Kanałach etap pociągu');
    await t.ev(`(() => { const G = __paleo.G; G.introT = 0; G.pending = []; G.waveIdx = 99; G.actors = G.actors.filter(a => a.kind === 'player'); })()`);
    await t.sleep(400); await t.shot('pociag');
    // wskok z boku toru
    await t.ev(`__paleo.G.pending.push({ type: 'grunt', side: 'T', delay: 1 })`);
    t.assert(await t.until(`__paleo.G.actors.some(a => a.type === 'grunt' && a.state !== 'hopin' && a.y >= 166 && a.y <= 206)`, 3000), 'wróg wskakuje na platformę');
    // zrzucenie z wagonu
    await t.ev(`(() => { const G = __paleo.G, e = G.actors.find(a => a.type === 'grunt'); e.y = 170; e.x = G.players[0].x + 20; e.state = 'idle'; __paleo.hurt(e, 1, G.players[0], true); })()`);
    t.assert(await t.until(`__paleo.G.popups.some(q => q.txt.startsWith('ZRZUCONY!'))`, 2000), 'wróg zrzucony z pociągu');
    // koparka Brygadzisty
    await t.ev(`(() => { const G = __paleo.G, d = __paleo.spawn('digger', G.camX + 300, 188); d.state = 'idle'; d.cool = 10; window.__d = d; })()`);
    t.assert(await t.until(`['slam', 'sweep'].includes(window.__d.state)`, 4000), 'koparka atakuje');
    await t.sleep(700); await t.shot('koparka');
    await t.ev(`__paleo.hurt(window.__d, 99999, __paleo.G.players[0], true)`);
    t.assert(await t.until(`window.__d.state === 'wreck' && __paleo.G.popups.some(q => q.txt === 'KOPARKA ZEZŁOMOWANA!')`, 2000), 'koparka zezłomowana');

    // ---- zakończenia postaci: komiks dla każdej postaci z drużyny
    await t.ev(`(() => { const a = __paleo.app; a.gameMode = 'arcade'; a.p2Active = true; a.sel = 0; a.sel2 = 1; __paleo.newStage(0); __paleo.startEpilog(); })()`);
    const keys = await t.ev(`__paleo.G.players.map(q => q.key).join(',')`); t.log('drużyna: ' + keys);
    t.assert(await t.ev(`__paleo.app.mode === 'story' && __paleo.app.story.key.startsWith('epilog_')`), 'komiks zakończenia startuje (' + keys + ')');
    await t.tap('Enter'); await t.sleep(200); await t.tap('Enter'); await t.sleep(200); await t.tap('Enter'); await t.sleep(600);
    await t.shot('epilog-1');
    const seen = new Set();
    for (let i = 0; i < 30 && await t.ev(`__paleo.app.mode === 'story'`); i++) { seen.add(await t.ev('__paleo.app.story.key')); t.log(await t.ev('__paleo.app.story.key + " " + __paleo.app.story.i + " t=" + __paleo.app.t + " st=" + __paleo.app.story.t + " fr=" + __paleo.app.frame')); await t.tap('Enter'); await t.sleep(160); }
    t.assert(seen.size === 2, 'osobny komiks dla każdej postaci (' + [...seen].join(',') + ')');
    t.assert(await t.ev(`__paleo.app.mode !== 'story'`), 'po komiksach gra przechodzi do wyników');
  }
};
