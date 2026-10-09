// Testy automatyczne gry PALEO HIGHWAY.
// Użycie:  node tools/tests/run.mjs            — wszystkie testy
//          node tools/tests/run.mjs stages pad — tylko wybrane (po nazwie pliku w cases/)
// Wymaga Node.js 22+ oraz przeglądarki Edge lub Chrome (ścieżkę można podać w zmiennej BROWSER).
// Zrzuty ekranu z testów trafiają do tools/tests/out/.
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openPage } from './driver.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const outDir = path.join(here, 'out');
mkdirSync(outDir, { recursive: true });

// przed testami zbuduj js/game.js ze źródeł (jeśli istnieje skrypt budowania)
if (existsSync(path.join(root, 'tools', 'build.mjs'))) await import(pathToFileURL(path.join(root, 'tools', 'build.mjs')).href);

const only = process.argv.slice(2);
const files = readdirSync(path.join(here, 'cases')).filter(f => f.endsWith('.mjs')).sort()
  .filter(f => !only.length || only.some(o => f.includes(o)));
const gameUrl = (file, q) => pathToFileURL(path.join(root, file)).href + (q ? '?' + q : '');

let failed = 0;
const t0 = Date.now();
for (const f of files) {
  const test = (await import(pathToFileURL(path.join(here, 'cases', f)).href)).default;
  const started = Date.now();
  let page = null, err = null;
  try {
    page = await openPage(gameUrl(test.page || 'index.html', test.query ?? 'hooks=1'), { outDir, width: test.width, height: test.height });
    const ctx = Object.assign({}, page, {
      assert(cond, msg) { if (!cond) throw new Error('Asercja: ' + msg); },
      log: (...a) => { if (process.env.VERBOSE) console.log('      ', ...a); },
      shot: name => page.shot(f.replace('.mjs', '') + '-' + name)
    });
    await Promise.race([
      test.run(ctx),
      new Promise((_, bad) => setTimeout(() => bad(new Error('Przekroczony czas testu')), (test.timeout || 90) * 1000))
    ]);
    if (page.errors.length) throw new Error('Wyjątki w grze: ' + page.errors.slice(0, 3).join(' || '));
  } catch (e) { err = e; }
  if (page) await page.close();
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  if (err) { failed++; console.log(`✗ ${test.name || f}  (${secs} s)\n    ${err.message}`); }
  else console.log(`✓ ${test.name || f}  (${secs} s)`);
}
console.log(`\n${files.length - failed}/${files.length} testów zaliczonych w ${((Date.now() - t0) / 1000).toFixed(0)} s.`);
process.exit(failed ? 1 : 0);
