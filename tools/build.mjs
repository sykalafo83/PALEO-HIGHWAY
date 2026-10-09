// Składa silnik gry z plików źródłowych src/game/*.js (w kolejności nazw) w jeden plik js/game.js,
// zamknięty w jednej funkcji — dzięki temu stan gry nie jest dostępny z konsoli przeglądarki,
// a gra działa bez żadnych narzędzi (także otwierana z dysku).
//
// Użycie:  node tools/build.mjs           — zbuduj js/game.js
//          node tools/build.mjs --check   — tylko sprawdź, czy js/game.js jest aktualny (kod wyjścia 1, jeśli nie)
//
// Edytuj pliki w src/game/, nie js/game.js (zostanie nadpisany przy budowaniu).
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src', 'game'), outFile = path.join(root, 'js', 'game.js');

export function buildGame() {
  const files = readdirSync(srcDir).filter(f => f.endsWith('.js')).sort();
  const body = files.map(f => readFileSync(path.join(srcDir, f), 'utf8').replace(/\r\n/g, '\n')).join('');
  return '/* PALEO HIGHWAY — silnik gry. PLIK GENEROWANY przez tools/build.mjs z src/game/*.js — nie edytuj ręcznie. */\n'
    + '(function () {\n  \'use strict\';\n' + body + '})();\n';
}

const out = buildGame();
const current = existsSync(outFile) ? readFileSync(outFile, 'utf8').replace(/\r\n/g, '\n') : '';
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain && process.argv.includes('--check')) {
  if (current !== out) { console.log('js/game.js jest nieaktualny — uruchom: node tools/build.mjs'); process.exit(1); }
  console.log('js/game.js jest aktualny.');
} else if (current !== out) {
  writeFileSync(outFile, out);
  console.log('Zbudowano js/game.js (' + out.split('\n').length + ' linii).');
} else if (isMain) console.log('js/game.js jest już aktualny.');
