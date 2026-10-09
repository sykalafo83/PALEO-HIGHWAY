// Interfejs i oprawa: karta wyniku, filtry CRT, ramka automatu, różne rozmiary okna, opcje — bez wyjątków.
export default {
  name: 'Karta wyniku, CRT, ramka, rozmiary okna',
  timeout: 90,
  async run(t) {
    // karta wyniku po etapie
    await t.ev(`__paleo.newStage(0)`); await t.sleep(300);
    await t.ev(`(() => { const G = __paleo.G; G.introT = 0; G.bossDead = true; G.clearT = 320; })()`);
    t.assert(await t.until(`__paleo.app.mode === 'clear'`, 3000), 'ekran wyników');
    await t.sleep(900); await t.tap('ArrowUp'); await t.sleep(300);
    t.assert(await t.ev('!!__paleo.app.share && __paleo.app.share.canvas.width === 1152'), '▲ otwiera kartę wyniku');
    await t.tap('Escape'); await t.sleep(300);
    t.assert(await t.ev('!__paleo.app.share'), 'Escape zamyka kartę');
    // filtry i ramka w różnych rozmiarach okna
    for (const [w, h, d] of [[1600, 900, 1], [1280, 1000, 1], [1536, 864, 1.25]]) {
      await t.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: d, mobile: false });
      await t.ev(`dispatchEvent(new Event('resize'))`);
      for (const m of ['arcade', 'pc', 'tv', 'off']) { await t.ev(`__paleo.opts().crt = '${m}'`); await t.sleep(150); }
    }
    await t.ev(`__paleo.app.mode = 'options'; __paleo.app.optSel = 0; __paleo.app.keysFor = null; __paleo.app.padFor = null`);
    for (let i = 0; i < 14; i++) { await t.tap('ArrowDown', 30); }
    await t.shot('opcje');
    t.assert(await t.ev(`__paleo.app.mode === 'options'`), 'opcje działają');
  }
};
