// Edytor etapów: wczytanie, postawienie elementów, fala, zapis do biblioteki, eksport i ponowny import, etap w grze.
export default {
  name: 'Edytor etapów',
  page: 'editor.html', query: '', width: 1500, height: 900,
  timeout: 90,
  async run(t) {
    t.assert(await t.until('!!window.__editor', 4000), 'edytor się wczytuje');
    const props0 = await t.ev('__editor.st.PROPS.length');
    const box = await t.ev(`(() => { const b = document.getElementById('view').getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; })()`);
    const at = (lx, ly) => t.click(box[0] + lx / 384 * box[2], box[1] + ly / 224 * box[3]);
    await t.ev(`document.querySelector('[data-tool="fuel"]').click()`); await at(200, 190); await t.sleep(150);
    t.assert(await t.ev('__editor.st.PROPS.length') === props0 + 1, 'narzędzie stawia beczkę');
    await t.ev(`__editor.setCam(1000); document.getElementById('bWave').click()`); await t.sleep(150);
    t.assert(await t.ev('__editor.st.WAVES.some(w => w.lock === 1000)'), 'dodano falę w bieżącym widoku');
    await t.ev(`document.getElementById('sName').value = 'Test'; document.getElementById('sName').dispatchEvent(new Event('change')); document.getElementById('bSave').click()`);
    t.assert(await t.ev(`__editor.library().some(d => d.name === 'TEST')`), 'zapis do biblioteki');
    const js = await t.ev('__editor.exportJs(__editor.library())');
    t.assert(await t.ev(`__editor.parseImport(${JSON.stringify(js)}).length`) >= 1, 'eksport custom.js daje się wczytać z powrotem');
    // etap z edytora w grze
    await t.ev(`localStorage.setItem('paleo_custom_test', JSON.stringify(__editor.st)); location.href = 'index.html?test=1&hooks=1'`);
    await t.sleep(2500);
    t.assert(await t.ev(`__paleo.app.mode === 'select' && __paleo.app.gameMode === 'custom'`), 'test etapu otwiera grę');
    await t.tap('Enter');
    t.assert(await t.until(`__paleo.app.mode === 'play' && __paleo.G.WAVES.length > 0`, 3000), 'własny etap startuje');
  }
};
