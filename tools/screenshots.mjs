// Robi zrzuty ekranu aktualnej wersji gry do docs/screenshots/ (README i instrukcja).
// Użycie: node tools/screenshots.mjs   (wymaga Edge lub Chrome; zmienna BROWSER — własna ścieżka)
import { openPage } from './tests/driver.mjs';
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'docs', 'screenshots');
const tmp = path.join(os.tmpdir(), 'paleo-shots-' + process.pid);
mkdirSync(tmp, { recursive: true });
const url = f => pathToFileURL(path.join(root, f)).href;

const page = await openPage(url('index.html') + '?hooks=1', { outDir: tmp, width: 1152, height: 672 });
const P = page;
const shot = async name => { await P.shot(name); console.log('  ' + name + '.png'); };
const skipStory = async () => { for (let i = 0; i < 20 && await P.ev(`__paleo.app.mode === 'story'`); i++) { await P.tap('Enter'); await P.sleep(160); } };
// czysty etap: bez intra, wrogów i fal; gracze w podanym miejscu
const stage = (idx, camX, extra) => P.ev(`(() => { const a = __paleo.app; a.gameMode = 'arcade'; __paleo.newStage(${idx}); const G = __paleo.G;
  G.introT = 0; G.actors = G.actors.filter(q => q.kind === 'player'); G.pending = []; G.wave = null; G.lockX = null; G.waveIdx = 99;
  G.camX = ${camX}; G.players.forEach((p, i) => { p.x = ${camX} + 110 + i * 40; p.y = 178 + i * 22; p.state = 'idle'; p.face = 1; p.z = 0; p.invuln = 0; });
  const S = (t, x, y, f) => { const e = __paleo.spawn(t, ${camX} + x, y); e.face = f || -1; e.cool = 200; return e; };
  ${extra || ''} })()`);

console.log('Zrzuty ekranu → docs/screenshots/');
// 1. ekran tytułowy
await P.sleep(2500); await shot('01-tytul');

// 2. Opuszczona Plaża — gra we dwóch, nowi wrogowie
await P.ev(`__paleo.app.p2Active = true; __paleo.app.sel = 0; __paleo.app.sel2 = 1`);
await stage(5, 900, `G.wx = null; S('rraptor', 280, 182); S('flamer', 250, 206); S('grunt', 330, 168); S('netter', 360, 200);
  const p = G.players[0]; p.state = 'attack'; p.move = { pose: 'kick', start: 6, active: 4, rec: 14, dmg: 0, reach: 0 }; p.t = 7;`);
await P.sleep(500); await shot('02-plaza');

// 3. Kanały Otchłani — lampy, wybuch, wrogowie
await P.ev(`__paleo.app.p2Active = false`);
await stage(6, 900, `G.ev = null; S('brute', 270, 186); S('thin', 300, 170); S('raptor', 320, 204);
  G.fx.push({ type: 'boom', x: 900 + 230, y: 196, z: 0, t: 4, life: 24 });`);
await P.sleep(90); await shot('03-kanaly');

// 4. Komiks przed pociągiem i 5. pociąg z koparką Brygadzisty
await P.ev(`(() => { __paleo.app.gameMode = 'arcade'; __paleo.afterStage(6, __paleo.G.players); })()`);
for (let i = 0; i < 5; i++) { await P.tap('Enter'); await P.sleep(160); }
await P.sleep(900); await shot('04-komiks');
await skipStory();
await P.ev(`(() => { const G = __paleo.G; G.introT = 0; G.pending = []; G.waveIdx = 99; G.actors = G.actors.filter(a => a.kind === 'player');
  G.camX = 700; const p = G.players[0]; p.x = 800; p.y = 190; p.state = 'idle';
  const d = __paleo.spawn('digger', 975, 186); d.state = 'idle'; d.cool = 999; d.face = -1;
  const g = __paleo.spawn('grunt', 870, 172); g.cool = 999; g.face = -1;
  const h = __paleo.spawn('thin', 735, 162); h.state = 'hopin'; h.z = 44; h.vz = 3; h.fvy = 0.3; h.face = 1; })()`);
await P.sleep(350); await shot('05-pociag');

// 6. Deszcz: kałuże z odbiciami, wrogowie z dodatkami, smuga kopnięcia
await stage(0, 880, `G.wx = { id: 'rain', name: 'DESZCZ', tint: '#a0a8c0', light: 'rgba(20,30,60,0.12)', rain: true };
  ['gunner', 'shield', 'bomber', 'sniper'].forEach((t, i) => { const e = S(t, 205 + i * 30, 172 + i * 9); e.cool = 9999; e.mode = 'hover'; e.modeT = 9999; });
  const p = G.players[0]; p.x = 880 + 120; p.y = 190; p.state = 'jump'; p.t = 6; p.z = 14; p.vz = 3; p.vx = 1.2; p.vy = 0; p.jumpAtk = true;`);
await P.sleep(160); await shot('06-deszcz');

// 7. Obóz (sklep) i mapa trasy z wyborem drogi
await P.ev(`(() => { __paleo.app.gameMode = 'arcade'; __paleo.app.mode = 'title'; __paleo.newStage(1); __paleo.G.players[0].amber = 7; __paleo.afterStage(1, __paleo.G.players); })()`);
await P.sleep(700); await shot('07-oboz');
await P.tap('Escape'); await P.sleep(2600); await shot('08-mapa');

// 9. Lot nad Zatoką
await P.ev(`__paleo.startFlight()`); await P.sleep(5200); await shot('09-lot');

// 10. Kody z ikon (kafle celowo NIE tworzą żadnego kodu — kombinacje są tajne)
await P.ev(`(() => { const a = __paleo.app; a.mode = 'title'; a.gameMode = 'arcade'; __paleo.openCodes(); a.codes.tiles = [5, 2, 3, 1]; a.codes.cur = 1; })()`);
await P.sleep(600); await shot('10-kody');

// 11. Poradnik „Jak grać”
await P.ev(`(() => { const a = __paleo.app; a.mode = 'howto'; a.t = 0; a.howto = { ch: 2, pg: 2 }; })()`);
await P.sleep(1100); await shot('11-poradnik');

// 12. Zakończenie postaci (komiks)
await P.ev(`(() => { const a = __paleo.app; a.gameMode = 'arcade'; a.p2Active = false; a.sel = 1; __paleo.newStage(0); __paleo.startEpilog(); })()`);
for (let i = 0; i < 5; i++) { await P.tap('Enter'); await P.sleep(180); }
await P.sleep(1200); await shot('12-zakonczenie');
if (page.errors.length) console.log('Wyjątki w grze:', page.errors.slice(0, 3));
await page.close();

// 13. Edytor etapów
const ed = await openPage(url('editor.html'), { outDir: tmp, width: 1280, height: 760 });
await ed.sleep(1500); await ed.shot('13-edytor'); console.log('  13-edytor.png');
await ed.close();

// podmiana starych zrzutów
mkdirSync(dest, { recursive: true });
readdirSync(dest).filter(f => f.endsWith('.png')).forEach(f => rmSync(path.join(dest, f)));
readdirSync(tmp).filter(f => f.endsWith('.png')).forEach(f => copyFileSync(path.join(tmp, f), path.join(dest, f)));
rmSync(tmp, { recursive: true, force: true });
console.log('Gotowe.');
