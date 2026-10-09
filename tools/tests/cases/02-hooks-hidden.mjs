// Bez ?hooks=1 (i z debug=false w config.js) uchwyty testowe nie powinny być dostępne z konsoli.
// Gdy w config.js jest debug: true, uchwyty są celowo dostępne — wtedy test tylko sprawdza, że gra działa.
export default {
  name: 'Uchwyty testowe ukryte bez debug',
  query: '',
  async run(t) {
    const debug = await t.ev('!!(window.GAME_CONFIG && window.GAME_CONFIG.debug)');
    const hooks = await t.ev('!!window.__paleo');
    t.assert(debug ? hooks : !hooks, debug ? 'debug: true — uchwyty dostępne' : 'bez debug uchwyty są ukryte');
  }
};
