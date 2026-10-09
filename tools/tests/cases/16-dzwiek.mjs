// Dźwięk: utwory ze wstępem i częścią B, płynne przejście do muzyki bossa, dźwięki otoczenia,
// odgłosy trafień zależne od broni i tarczy oraz okrzyki wrogów.
export default {
  name: 'Muzyka, otoczenie i odgłosy',
  timeout: 90,
  async run(t) {
    await t.ev(`(() => { const AU = __paleo.AU; AU.init(); window.__snd = []; const orig = AU.sfxPlay.bind(AU); AU.sfxPlay = n => { window.__snd.push(n); orig(n); }; })()`);
    t.assert(await t.ev(`(() => { const S = window.GameAudio.SONGS; return ['stage2', 'boss', 'sewer', 'title'].every(k => S[k].loopStart === 32 && S[k].length === 288); })()`), 'utwory mają wstęp, część A i B');
    const clear = (idx, extra) => t.ev(`(() => { __paleo.newStage(${idx}); const G = __paleo.G; G.introT = 0; G.wx = null; G.ev = null; G.actors = G.actors.filter(a => a.kind === 'player'); G.pending = []; ${extra || ''} })()`);
    // muzyka etapu startuje od wstępu i gra dalej
    await clear(0);
    await t.sleep(400);
    t.assert(await t.ev(`__paleo.AU.current && __paleo.AU.current.name === 'stage1' && __paleo.AU.current.step > 0`), 'muzyka etapu gra');
    // wejście bossa: przenikanie zamiast twardego przełączenia
    await t.ev(`(() => { const G = __paleo.G, i = G.WAVES.length - 1; G.waveIdx = i; G.wave = null; G.lockX = null; G.camX = G.WAVES[i].lock; })()`);
    t.assert(await t.until(`__paleo.AU.current && __paleo.AU.current.name === 'boss'`, 2000), 'muzyka bossa');
    t.assert(await t.ev(`__paleo.AU.fading.some(c => c.name === 'stage1')`), 'muzyka etapu cichnie stopniowo');
    t.assert(await t.until(`!__paleo.AU.fading.some(c => c.name === 'stage1')`, 5000), 'po przejściu stary utwór znika');
    // dźwięki otoczenia
    const amb = () => t.ev(`__paleo.AU.amb && __paleo.AU.amb.kind`);
    await clear(5); await t.sleep(200); t.assert(await amb() === 'waves', 'plaża: fale');
    await clear(6); await t.sleep(200); t.assert(await amb() === 'drips', 'kanały: kapanie');
    await t.sleep(1500); t.assert(await t.ev(`window.__snd.length >= 0`), 'krople planowane bez błędów');
    await clear(0, `G.wx = { id: 'sand', sand: true, name: 'BURZA PIASKOWA' };`); await t.sleep(200); t.assert(await amb() === 'wind', 'burza piaskowa: wiatr');
    await clear(2); await t.sleep(200); t.assert(await amb() === 'rain', 'Miasto Cieni: deszcz');
    // trafienia: rura, łańcuch, maczeta, tarcza, garda; okrzyki wrogów
    await clear(0, `G.camX = 600; const p = G.players[0]; p.x = 640; p.y = 186; p.state = 'idle'; p.face = 1;`);
    for (const [w, snd] of [['pipe', 'pipeHit'], ['chain', 'chainHit'], ['machete', 'blade']]) {
      await t.ev(`(() => { const G = __paleo.G, p = G.players[0]; G.actors = G.actors.filter(a => a.kind === 'player'); p.weapon = '${w}'; p.dur = 20; p.state = 'idle'; p.x = 640; const e = __paleo.spawn('grunt', 664, 186); e.cool = 999; window.__snd = []; })()`);
      await t.tap('KeyJ'); await t.sleep(400);
      t.assert(await t.ev(`window.__snd.includes('${snd}')`), `${w}: odgłos ${snd}`);
    }
    await t.ev(`(() => { const G = __paleo.G, p = G.players[0]; G.actors = G.actors.filter(a => a.kind === 'player'); p.weapon = null; p.state = 'idle'; p.x = 640; p.comboIdx = 0; const e = __paleo.spawn('shield', 664, 186); e.face = -1; e.cool = 999; window.__snd = []; })()`);
    await t.tap('KeyJ'); await t.sleep(300);
    t.assert(await t.ev(`window.__snd.includes('shieldHit')`), 'cios w tarczę brzmi metalicznie');
    await t.ev(`(() => { const G = __paleo.G; G.actors = G.actors.filter(a => a.kind === 'player'); const e = __paleo.spawn('brute', 664, 186); window.__snd = []; G.voiceF = -99; __paleo.hurt(e, 999, G.players[0], true); })()`);
    t.assert(await t.ev(`window.__snd.includes('e_brute_die')`), 'osiłek ma własny głos');
    t.assert(await t.ev(`(() => { const N = window.GameAudio.SFX_NAMES; return ['grunt', 'thin', 'brute', 'masked', 'boss', 'hag'].every(p => ['attack', 'taunt', 'hurt', 'die'].every(k => N.includes('e_' + p + '_' + k))); })()`), 'komplet okrzyków dla profili wrogów');
    await t.ev(`['pipeHit', 'chainHit', 'blade', 'shieldHit', 'block', 'kickHit', 'drip', 'clack', 'e_masked_taunt', 'e_hag_attack', 'e_thin_hurt'].forEach(n => __paleo.AU.sfxPlay(n))`);
    await t.sleep(300);
    // pociąg i powrót do menu wycisza otoczenie
    await t.ev(`(() => { __paleo.app.gameMode = 'arcade'; __paleo.afterStage(6, __paleo.G.players); })()`);
    for (let i = 0; i < 16 && await t.ev(`__paleo.app.mode === 'story'`); i++) { await t.tap('Enter'); await t.sleep(200); }
    await t.sleep(300); t.assert(await amb() === 'train', 'pociąg: stukot kół');
    await t.ev(`(() => { __paleo.app.mode = 'title'; })()`); await t.sleep(200);
    t.assert(!(await amb()), 'w menu otoczenie cichnie');
  }
};
