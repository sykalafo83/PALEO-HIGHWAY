// Start gry: ekran tytułowy, menu, uchwyty testowe, brak wyjątków; bez ?hooks uchwyty są ukryte.
export default {
  name: 'Start gry i menu',
  async run(t) {
    t.assert(await t.ev('!!window.__paleo'), 'uchwyty testowe dostępne z ?hooks=1');
    t.assert(await t.ev('__paleo.app.mode') === 'title', 'gra startuje na ekranie tytułowym');
    t.assert(await t.ev('__paleo.STAGES.length') === 8, 'gra ma 8 etapów');
    // przejście menu: OPCJE i powrót
    for (let i = 0; i < 7; i++) await t.tap('ArrowDown');
    await t.tap('Enter'); await t.sleep(200);
    const m = await t.ev('__paleo.app.mode');
    t.assert(m === 'options' || m === 'extras' || m === 'scores' || m === 'chal', 'menu prowadzi do podekranu, jest: ' + m);
    await t.tap('Escape'); await t.sleep(200);
    t.assert(await t.ev('__paleo.app.mode') === 'title', 'Escape wraca do tytułu');
    await t.shot('tytul');
  }
};
