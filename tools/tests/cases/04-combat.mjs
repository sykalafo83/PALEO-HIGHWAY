// Walka z klawiatury: kombo, specjał (atak+skok), blok, wybicie i żonglerka, broń biała, butelka.
export default {
  name: 'Walka: kombo, specjał, blok, żonglerka, broń',
  timeout: 120,
  async run(t) {
    await t.ev(`__paleo.newStage(0)`); await t.sleep(2200);
    await t.ev(`(() => { const G = __paleo.G; G.introT = 0; G.actors = G.actors.filter(a => a.kind === 'player'); G.pending = []; G.wave = null; G.lockX = null; G.waveIdx = 99; G.camX = 400; const p = G.players[0]; p.x = 500; p.y = 185; p.face = 1; p.state = 'idle'; })()`);
    const spawn = async (type, dx, hp) => {
      await t.ev(`__paleo.G.pending.push({ type: '${type}', side: 'R', y: 185, delay: 1 })`); await t.sleep(150);
      await t.ev(`(() => { const G = __paleo.G, e = G.actors.filter(a => a.type === '${type}').pop(); e.x = G.players[0].x + ${dx}; e.y = 185; e.state = 'idle'; e.cool = 999; e.face = -1; ${hp ? `e.hp = e.maxHp = ${hp};` : ''} window.__e = e; G.players[0].state = 'idle'; })()`);
    };
    // kombo
    await spawn('brute', 26, 300);
    for (let i = 0; i < 4; i++) { await t.tap('KeyJ', 50); await t.sleep(160); }
    t.assert(await t.ev('window.__e.hp') < 300, 'kombo zadaje obrażenia');
    t.assert(await t.ev('__paleo.G.players[0].st.maxCombo') >= 2, 'licznik kombo rośnie');
    // specjał
    await t.sleep(800);
    await t.key('KeyK', 'keyDown'); await t.sleep(30); await t.key('KeyJ', 'keyDown'); await t.sleep(60); await t.key('KeyJ', 'keyUp'); await t.key('KeyK', 'keyUp');
    const st = await t.ev(`__paleo.G.players[0].state + ' z' + Math.round(__paleo.G.players[0].z) + ' ' + __paleo.G.players[0].t`);
    t.log('po atak+skok: ' + st);
    t.assert(await t.until(`__paleo.G.players[0].state === 'special'`, 500), 'atak+skok uruchamia specjał (stan: ' + st + ')');
    await t.ev('window.__e.remove = true'); await t.sleep(900);
    // blok: cios z przodu zadaje mało obrażeń
    await t.key('KeyU', 'keyDown'); await t.sleep(300);
    t.assert(await t.ev(`__paleo.G.players[0].state`) === 'block', 'U trzyma gardę');
    const hp0 = await t.ev('__paleo.G.players[0].hp');
    await t.ev(`(() => { const p = __paleo.G.players[0]; p.invuln = 0; __paleo.hurt(p, 12, { x: p.x + 30, y: p.y, team: 'enemy', kind: 'human', def: {}, state: 'attack' }); })()`).catch(() => {});
    const hp1 = await t.ev('__paleo.G.players[0].hp');
    t.assert(hp0 - hp1 <= 2, 'blok przyjmuje tylko część obrażeń (' + (hp0 - hp1) + ')');
    await t.key('KeyU', 'keyUp'); await t.sleep(400);
    // wybicie i żonglerka
    await spawn('grunt', 24, 400);
    await t.key('KeyW', 'keyDown'); await t.tap('KeyJ', 50); await t.key('KeyW', 'keyUp');
    await t.sleep(330);
    for (let i = 0; i < 4; i++) { await t.tap('KeyJ', 50); await t.sleep(200); }
    t.assert(await t.ev(`__paleo.G.popups.some(p => p.txt.startsWith('ŻONGLERKA'))`) || await t.ev(`!!__paleo.app.ach.juggler`), 'żonglerka działa');
    await t.sleep(1500); await t.ev('window.__e.remove = true');
    // maczeta i butelka
    await spawn('brute', 30, 300);
    await t.ev(`(() => { const p = __paleo.G.players[0]; p.weapon = 'machete'; p.dur = 12; p.state = 'idle'; })()`);
    for (let i = 0; i < 3; i++) { await t.tap('KeyJ', 50); await t.sleep(170); }
    t.assert(await t.ev('__paleo.G.players[0].dur') < 12, 'maczeta zużywa się przy trafieniach');
    await t.ev('window.__e.remove = true'); await t.sleep(300);
    await spawn('grunt', 90);
    await t.ev(`(() => { const p = __paleo.G.players[0]; p.weapon = 'bottle'; p.ammo = 2; p.state = 'idle'; })()`);
    await t.tap('KeyJ'); await t.sleep(700);
    t.assert(await t.ev('__paleo.G.players[0].ammo') === 1, 'butelka zużywa amunicję');
    t.assert(await t.ev(`window.__e.hp < window.__e.maxHp`), 'butelka trafia wroga');
    await t.shot('walka');
  }
};
