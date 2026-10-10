// Technika: filtry CRT na karcie graficznej (WebGL) z automatycznym wyłączaniem przy spadku płynności
// oraz wspólna tabela wyników w sieci (prawdziwy serwer tools/score-server.mjs na losowym porcie).
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PORT = 8900 + Math.floor(Math.random() * 500), URL_ = 'http://127.0.0.1:' + PORT;
const sleep = ms => new Promise(r => setTimeout(r, ms));

export default {
  name: 'Filtry CRT na karcie graficznej i tabela wyników w sieci',
  timeout: 120,
  query: 'hooks=1&scores=' + encodeURIComponent(URL_),
  async run(t) {
    // ---- CRT: WebGL, auto-wyłączanie, powrót po zmianie opcji
    await t.ev(`(() => { __paleo.opts().crt = 'arcade'; __paleo.opts().crtAuto = true; __paleo.newStage(0); __paleo.G.introT = 0; })()`);
    await t.sleep(400);
    const info = await t.ev(`__paleo.crtInfo()`);
    t.log('CRT: ' + JSON.stringify(info));
    t.assert(info.gl === true && info.shown, 'filtr CRT rysowany przez WebGL');
    await t.shot('crt-webgl');
    await t.ev(`__paleo.crtSlow()`); await t.sleep(200);
    t.assert(await t.ev(`__paleo.crtInfo().suspended && !__paleo.crtInfo().shown`), 'gdy gra zwalnia, filtr sam się wyłącza');
    t.assert(await t.ev(`__paleo.app.toasts.some(q => q.name === 'FILTR CRT WYŁĄCZONY')`), 'komunikat o wyłączeniu filtra');
    await t.ev(`(() => { __paleo.app.crtSuspended = false; __paleo.opts().crtAuto = false; })()`); await t.sleep(200);
    await t.ev(`__paleo.crtSlow()`);
    t.assert(await t.ev(`!__paleo.crtInfo().suspended && __paleo.crtInfo().shown`), 'z wyłączoną opcją filtr zostaje');
    await t.ev(`(() => { __paleo.opts().crt = 'off'; __paleo.opts().crtAuto = true; })()`); await t.sleep(200);
    t.assert(await t.ev(`!__paleo.crtInfo().shown`), 'filtr wyłączony — brak nakładki WebGL');

    // ---- tabela wyników w sieci
    const dataFile = path.join(os.tmpdir(), 'paleo-scores-test-' + process.pid + '.json');
    const srv = spawn(process.execPath, [path.join(root, 'tools', 'score-server.mjs'), String(PORT), dataFile], { stdio: 'ignore' });
    try {
      let up = false;
      for (let i = 0; i < 40 && !up; i++) { try { up = (await (await fetch(URL_ + '/health')).json()).ok; } catch (e) { await sleep(100); } }
      t.assert(up, 'serwer wyników działa');
      // walidacja po stronie serwera
      const bad = await fetch(URL_ + '/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'main', n: 'TOOLONG', s: 5 }) });
      t.assert(bad.status === 400, 'serwer odrzuca niepoprawny wpis');
      t.assert(await t.ev(`__paleo.net.on`), 'gra widzi adres serwera');
      // koniec gry z wynikiem spoza lokalnej dziesiątki → wpis do tabeli światowej
      await t.ev(`(() => { const a = __paleo.app; a.gameMode = 'arcade'; __paleo.newStage(0); __paleo.G.players[0].score = 4321; __paleo.endGame('2'); })()`);
      await t.sleep(300);
      t.assert(await t.ev(`__paleo.app.mode === 'entry' && __paleo.app.entry.local === false`), 'wynik spoza lokalnej tabeli może trafić do światowej');
      await t.shot('wpis-swiat');
      for (let i = 0; i < 3; i++) { await t.tap('Enter'); await t.sleep(120); }
      t.assert(await t.until(`__paleo.app.toasts.some(q => q.head === 'TABELA ŚWIATOWA' && /MIEJSCE 1/.test(q.name))`, 4000), 'wynik wysłany: 1. miejsce na świecie');
      t.assert(await t.ev(`__paleo.app.mode === 'scores'`), 'po wpisie tabela wyników');
      await t.tap('ArrowDown'); await t.sleep(100);
      t.assert(await t.until(`__paleo.app.scoreNet && (__paleo.net.cache.main || {}).list && __paleo.net.cache.main.list.some(r => r.s === 4321)`, 4000), 'widok ŚWIAT pokazuje wynik z serwera');
      await t.sleep(300); await t.shot('tabela-swiat');
      // zbyt częste wysyłanie
      const fast = await fetch(URL_ + '/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'main', n: 'ZZZ', s: 10 }) });
      const fast2 = await fetch(URL_ + '/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'main', n: 'ZZZ', s: 11 }) });
      t.assert(fast2.status === 429 && [200, 429].includes(fast.status), 'serwer ogranicza zbyt częste wysyłanie (ten sam adres IP)');
      // bez serwera: komunikat o braku połączenia
      srv.kill(); await sleep(300);
      await t.ev(`(() => { __paleo.app.scoreTable = 'surv'; __paleo.netLoad('surv', true); })()`);
      t.assert(await t.until(`(__paleo.net.cache.surv || {}).err === true`, 8000), 'brak serwera nie psuje gry');
    } finally { srv.kill(); }
  }
};
