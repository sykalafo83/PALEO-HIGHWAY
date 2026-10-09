// Pad: standardowy układ (menu, wstecz B, przypisanie przycisku) i pad Xbox przez Bluetooth (niestandardowy układ, krzyżak „hat”).
export default {
  name: 'Pad: menu, przypisania, pad Xbox BT',
  timeout: 90,
  async run(t) {
    const mock = (id, mapping, nButtons, axes) => t.ev(`(() => { window.__b = []; window.__ax = ${JSON.stringify(axes)};
      const pad = { id: '${id}', index: 0, connected: true, mapping: '${mapping}', get axes() { return __ax.slice(); },
        get buttons() { return Array.from({ length: ${nButtons} }, (_, i) => ({ pressed: !!__b[i], value: __b[i] ? 1 : 0 })); },
        vibrationActuator: { playEffect: () => { window.__rum = (window.__rum || 0) + 1; return Promise.resolve(); } } };
      navigator.getGamepads = () => [pad, null, null, null]; })()`);
    const press = async b => { await t.ev(`__b[${b}] = true`); await t.sleep(120); await t.ev(`__b[${b}] = false`); await t.sleep(180); };
    await mock('Xbox 360 Controller (STANDARD GAMEPAD)', 'standard', 17, [0, 0, 0, 0]);
    await t.sleep(300);
    t.assert(await t.until(`__paleo.app.toasts.some(x => (x.head || '').startsWith('PAD 1'))`, 2000), 'komunikat o wykryciu pada');
    await press(0);
    t.assert(await t.until(`__paleo.app.mode === 'select'`, 1500), 'A na tytule przechodzi do wyboru postaci');
    await press(1);
    t.assert(await t.until(`__paleo.app.mode === 'title'`, 1500), 'B wraca do tytułu');
    // przypisanie: atak na Y
    await t.ev(`__paleo.app.mode = 'options'; __paleo.app.padFor = 0; __paleo.app.padSel = 4; __paleo.app.padCapture = null; __paleo.app.t = 10`);
    await press(0); await t.sleep(100); await press(3);
    t.assert(await t.ev(`JSON.parse(localStorage.getItem('paleo_pads'))[0].attack.join()`) === '3', 'przycisk Y przypisany do ataku');
    // pad Xbox BT: Menu (11) = START, krzyżak „hat” na osi 9
    await mock('Unknown Gamepad (Vendor: 045e Product: 0b13)', '', 16, [0, 0, 0, 0, 0, 0, 0, 0, 0, 1.2857]);
    await t.ev(`localStorage.removeItem('paleo_pads'); __paleo.app.padFor = null; __paleo.app.mode = 'title'; __paleo.app.t = 20`);
    await t.ev(`__paleo.newStage(0); __paleo.G.introT = 0`); await t.sleep(2200);
    const x0 = await t.ev('__paleo.G.players[0].x');
    await t.ev('__ax[9] = 0.714'); await t.sleep(500); await t.ev('__ax[9] = 1.2857'); await t.sleep(100);
    t.assert(await t.ev('__paleo.G.players[0].x') < x0 - 20, 'krzyżak „hat” w lewo porusza postacią');
    await press(11);
    t.assert(await t.until(`__paleo.app.mode === 'pause'`, 1000), 'Menu (surowy 11) pauzuje grę');
  }
};
