// Poradnik „JAK GRAĆ”: wejście z menu, wszystkie strony z pokazami, ikony pada, przejście do treningu.
export default {
  name: 'Poradnik „Jak grać”',
  timeout: 90,
  async run(t) {
    t.assert(await t.ev(`!localStorage.getItem('paleo_howto')`), 'nowy gracz nie widział jeszcze poradnika');
    await t.tap('ArrowDown'); await t.tap('Enter'); await t.sleep(200);
    t.assert(await t.ev(`__paleo.app.mode === 'howto'`), 'pozycja JAK GRAĆ otwiera poradnik');
    t.assert(await t.ev(`localStorage.getItem('paleo_howto') === '1'`), 'podpowiedź dla nowych graczy znika po otwarciu');
    let pages = 0;
    for (let i = 0; i < 40; i++) {
      const pos = await t.ev(`__paleo.app.howto.ch + ':' + __paleo.app.howto.pg`);
      pages++;
      if ([0, 3, 7, 12, 18].includes(i)) await t.shot('strona-' + pos.replace(':', '-'));
      await t.tap('ArrowRight'); await t.sleep(120);
      const now = await t.ev(`__paleo.app.howto.ch + ':' + __paleo.app.howto.pg`); t.log(pos + ' -> ' + now + ' ' + await t.ev('__paleo.app.mode'));
      if (now === pos) break;   // ostatnia strona
    }
    t.assert(pages >= 20, 'poradnik ma co najmniej 20 stron (jest ' + pages + ')');
    // tryb pada: ikony zamiast klawiszy (rysowanie bez wyjątków)
    await t.ev(`__paleo.app.lastDev = 'pad'; __paleo.app.howto.ch = 1; __paleo.app.howto.pg = 0`); await t.sleep(300);
    await t.shot('pad');
    await t.ev(`__paleo.app.lastDev = 'kbd'; __paleo.app.howto.ch = 10; __paleo.app.howto.pg = 3`); await t.sleep(200);
    await t.tap('Enter'); await t.sleep(300);
    t.assert(await t.ev(`__paleo.app.mode === 'select' && __paleo.app.gameMode === 'training'`), 'ostatnia strona prowadzi do treningu');
    await t.tap('Escape'); await t.sleep(200);
    await t.ev(`__paleo.app.mode = 'howto'`); await t.tap('Escape'); await t.sleep(200);
    t.assert(await t.ev(`__paleo.app.mode === 'title'`), 'Escape wraca do menu');
  }
};
