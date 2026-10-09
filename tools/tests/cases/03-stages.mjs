// Każdy z 8 etapów: wczytanie, przejście do fali z bossem, pojawienie się właściwego bossa i jego pokonanie.
const BOSSES = ['boss', 'zmija', 'klin', 'rex', 'szpon', 'padliniarz', 'deino', 'baron'];
export default {
  name: 'Wszystkie etapy i bossowie',
  timeout: 240,
  async run(t) {
    for (let i = 0; i < 8; i++) {
      await t.ev(`__paleo.newStage(${i})`); await t.sleep(300);
      await t.ev(`(() => { const G = __paleo.G; G.introT = 0; G.actors = G.actors.filter(a => a.kind === 'player'); G.pending = []; G.wave = null; G.lockX = null;
        G.waveIdx = G.WAVES.length - 1; G.camX = G.WAVES[G.waveIdx].lock; G.players[0].x = G.camX + 70; })()`);
      t.assert(await t.until(`__paleo.G.actors.some(a => a.def && a.def.boss)`, 9000), `etap ${i + 1}: boss się pojawia`);
      const types = await t.ev(`__paleo.G.actors.filter(a => a.def && a.def.boss).map(a => a.type).join(',')`);
      t.assert(types.includes(BOSSES[i]), `etap ${i + 1}: boss ${BOSSES[i]}, jest: ${types}`);
      await t.sleep(1500);
      await t.ev(`__paleo.G.actors.filter(a => a.def && a.def.boss).forEach(b => __paleo.hurt(b, 99999, __paleo.G.players[0]))`);
      t.assert(await t.until('__paleo.G.bossDead', 4000), `etap ${i + 1}: boss pokonany`);
      t.assert(await t.until(`__paleo.app.mode === 'clear'`, 9000), `etap ${i + 1}: ekran wyników`);
    }
  }
};
