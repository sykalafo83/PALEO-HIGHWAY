// Epilog i zakończenia: ucieczka, prawdziwy finał z Bursztynowym Kolosem, prawdziwe zakończenie w co-opie.
export default {
  name: 'Ucieczka i prawdziwe zakończenie',
  timeout: 120,
  async run(t) {
    await t.ev(`(() => { const a = __paleo.app; a.p2Active = true; a.sel2 = 1; a.gameMode = 'arcade'; __paleo.newStage(0); a.run = { cages: true, secrets: 3 }; __paleo.startEscape(); })()`);
    const skipStory = async () => { for (let i = 0; i < 12 && await t.ev(`__paleo.app.mode === 'story'`); i++) { await t.tap('Enter'); await t.sleep(250); } };
    await skipStory();
    t.assert(await t.until(`__paleo.G.special === 'escape' && __paleo.G.stageIdx === __paleo.STAGES.length - 1`, 3000), 'ucieczka na ostatnim etapie');
    await t.ev(`(() => { const G = __paleo.G; G.bossDead = true; G.clearT = 0; })()`);
    t.assert(await t.until(`__paleo.app.mode === 'clear'`, 9000), 'ucieczka udana');
    await t.sleep(1700); await t.tap('Enter');
    t.assert(await t.until(`__paleo.app.mode === 'story' && __paleo.app.story.key === 'truefinal'`, 3000), 'warunki spełnione: prawdziwy finał');
    await skipStory();
    t.assert(await t.until(`__paleo.G.actors.some(a => a.type === 'kolos')`, 6000), 'Bursztynowy Kolos się pojawia');
    await t.ev(`__paleo.G.actors.filter(a => a.type === 'kolos').forEach(b => __paleo.hurt(b, 99999, __paleo.G.players[0]))`);
    t.assert(await t.until(`__paleo.app.mode === 'clear'`, 9000), 'Kolos pokonany');
    await t.sleep(1700); await t.tap('Enter');
    t.assert(await t.until(`__paleo.app.mode === 'ending' && __paleo.app.trueEnd === true`, 3000), 'prawdziwe zakończenie');
    t.assert(await t.ev('__paleo.G.players.length') === 2, 'w co-opie obaj gracze w zakończeniu');
    await t.sleep(5500); await t.shot('zakonczenie');
  }
};
