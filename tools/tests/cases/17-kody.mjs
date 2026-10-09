// Kody z ikon: ekran po wyborze postaci, wpisywanie kombinacji strzałkami, wybór etapu i smaczki.
export default {
  name: 'Kody z ikon',
  timeout: 90,
  async run(t) {
    // START GRY → wybór postaci → kody
    await t.tap('Enter'); await t.sleep(250);
    t.assert(await t.ev(`__paleo.app.mode === 'select'`), 'wybór postaci');
    await t.tap('Enter'); await t.sleep(250);
    t.assert(await t.ev(`__paleo.app.mode === 'codes'`), 'po wyborze postaci pojawiają się kafle z kodami');
    // zły kod
    await t.tap('Enter'); await t.sleep(150);
    t.assert(await t.ev(`__paleo.app.codes.msg === 'NIEPRAWIDŁOWY KOD' && __paleo.cheats().size === 0`), 'zła kombinacja nie działa');
    // WYBÓR ETAPU: KOŚĆ · BURSZTYN · KOŚĆ · JAJO
    const setTiles = async combo => {
      for (let i = 0; i < 4; i++) {
        const cur = await t.ev(`__paleo.app.codes.tiles[${i}]`);
        for (let k = 0; k < (combo[i] - cur + 6) % 6; k++) { await t.tap('ArrowDown'); await t.sleep(40); }
        await t.tap('ArrowRight'); await t.sleep(40);
      }
      for (let i = 0; i < 4; i++) { await t.tap('ArrowLeft'); await t.sleep(30); }   // z powrotem na pierwszy kafel (przez GRAJ)
      await t.tap('ArrowRight'); await t.sleep(30);
    };
    await setTiles([1, 3, 1, 0]);
    await t.ev(`__paleo.app.codes.cur = 0`);
    t.assert(await t.ev(`__paleo.app.codes.tiles.join() === '1,3,1,0'`), 'kafle ustawione strzałkami');
    await t.tap('Enter'); await t.sleep(150);
    t.assert(await t.ev(`__paleo.cheats().has('stagesel') && __paleo.app.codes.msg === 'KOD: WYBÓR ETAPU!'`), 'kod WYBÓR ETAPU aktywny');
    await t.shot('ekran-kodow');
    // poprawny kod sam uruchamia grę — tu: lista etapów
    t.assert(await t.until(`__paleo.app.mode === 'stagesel'`, 2500), 'po poprawnym kodzie gra przechodzi dalej (wybór etapu)');
    await t.tap('ArrowDown'); await t.tap('ArrowDown'); await t.tap('Enter'); await t.sleep(400);
    t.assert(await t.ev(`__paleo.app.mode === 'map' || __paleo.app.mode === 'story' || __paleo.app.mode === 'shop'`), 'start z wybranego etapu');
    // smaczki: każdy poprawny kod też od razu uruchamia grę
    for (const id of ['bighead', 'film', 'helium']) {
      await t.ev(`(() => { __paleo.app.gameMode = 'arcade'; __paleo.openCodes(); })()`); await t.sleep(250);
      const combo = await t.ev(`__paleo.CODES.find(c => c.id === '${id}').combo`);
      await t.ev(`__paleo.app.codes.tiles = ${JSON.stringify(combo)}; __paleo.app.codes.cur = 0`);
      await t.tap('Enter'); await t.sleep(120);
      t.assert(await t.ev(`__paleo.cheats().has('${id}')`), 'kod ' + id);
      t.assert(await t.until(`__paleo.app.mode !== 'codes'`, 2500), 'kod ' + id + ': gra rusza');
    }
    t.assert(await t.ev(`window.Sprites.mods.bigHead === 1 && __paleo.AU.voicePitch > 1.5 && !document.getElementById('screen').style.filter`), 'nowy ekran kodów zeruje poprzednie kody');
    // bez kodu: GRAJ
    await t.ev(`(() => { __paleo.app.gameMode = 'arcade'; __paleo.openCodes(); __paleo.app.codes.cur = 4; })()`); await t.sleep(200);
    await t.tap('Enter'); await t.sleep(300);
    t.assert(await t.ev(`__paleo.app.mode !== 'codes' && __paleo.cheats().size === 0`), 'GRAJ bez kodu');
    // efekty w grze: 9 żyć, karzełki, złota gorączka, wierny raptor, wieczna furia, jeden cios, niska grawitacja
    await t.ev(`(() => { const a = __paleo.app; ['lives', 'tiny', 'gold', 'raptor', 'fury', 'onehit', 'lowgrav'].forEach(c => __paleo.cheats().add(c)); __paleo.applyCheatMods(); __paleo.newStage(0); })()`);
    await t.sleep(200);
    t.assert(await t.ev(`__paleo.G.players[0].lives === 8`), '9 żyć');
    t.assert(await t.ev(`__paleo.G.actors.some(a => a.type === 'raptor' && a.state === 'tamed')`), 'wierny raptor czeka');
    t.assert(await t.ev(`__paleo.grav() < 0.2`), 'niska grawitacja');
    await t.ev(`(() => { const G = __paleo.G; G.introT = 0; G.pending = []; const e = __paleo.spawn('grunt', G.players[0].x + 40, G.players[0].y); window.__e = e; })()`);
    t.assert(await t.ev(`window.__e.b.scale < 0.8`), 'karzełki');
    await t.sleep(200);
    t.assert(await t.ev(`__paleo.G.players[0].fury === 100`), 'wieczna furia');
    await t.ev(`__paleo.hurt(window.__e, 1, __paleo.G.players[0])`);
    t.assert(await t.ev(`window.__e.hp <= 0`), 'jeden cios');
    t.assert(await t.ev(`__paleo.G.items.filter(i => i.type === 'coin').length >= 3`), 'złota gorączka');
    t.assert(await t.ev(`(() => { const n = Object.keys(__paleo.app.ach).length; __paleo.unlock('juggler'); return Object.keys(__paleo.app.ach).length === n; })()`), 'z ułatwieniami bez osiągnięć');
    await t.sleep(300); await t.shot('gra-z-kodami');
    // powrót do menu czyści kody
    await t.ev(`__paleo.app.mode = 'title'`); await t.sleep(200);
    t.assert(await t.ev(`__paleo.cheats().size === 0 && !document.getElementById('screen').style.filter && __paleo.grav() > 0.3`), 'w menu kody znikają');
  }
};
